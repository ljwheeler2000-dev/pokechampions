import { M, applyMod, chainMods, pokeRound } from './modifiers.js';
import { applyBoost, computeStats } from './stats.js';
import { typeEffectiveness } from './typechart.js';
import type {
  CalcOptions, Field, Move, PokemonSet, PokemonType, StatKey,
} from './types.js';

/** The 16 damage rolls, 85% through 100%. */
export const ROLLS = [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100] as const;

export interface DamageResult {
  /** All 16 rolls, ascending. */
  damage: number[];
  minDamage: number;
  maxDamage: number;
  /** Defender's max HP, for percentage context. */
  defenderHP: number;
  minPercent: number;
  maxPercent: number;
  /** Combined type multiplier (0, 0.25, 0.5, 1, 2, 4). */
  typeEffectiveness: number;
  /** Minimum number of hits to KO across the worst-case rolls, or null if it can never KO. */
  hitsToKO: number | null;
  /** Probability of a one-hit KO from a single use, 0–1. */
  ohkoChance: number;
  /** Human-readable summary, e.g. "80.5 - 95.3% -- guaranteed 2HKO". */
  description: string;
  /** Effective attacking stat used, after boosts/items/abilities. */
  attackStat: number;
  /** Effective defending stat used, after boosts/items/abilities. */
  defenseStat: number;
}

const OFFENSE_ITEMS_PHYSICAL = new Set(['Choice Band']);
const OFFENSE_ITEMS_SPECIAL = new Set(['Choice Specs']);

function statAfterBoost(
  raw: number,
  stage: number,
  { ignoreNegative = false, ignorePositive = false } = {},
): number {
  if (ignoreNegative && stage < 0) return raw;
  if (ignorePositive && stage > 0) return raw;
  return applyBoost(raw, stage);
}

function offensiveStat(attacker: PokemonSet, move: Move, crit: boolean): number {
  const stats = computeStats(attacker);
  const key: StatKey = move.category === 'Physical' ? 'atk' : 'spa';
  const stage = attacker.boosts?.[key as 'atk' | 'spa'] ?? 0;
  // A crit ignores the attacker's own stat drops.
  let stat = statAfterBoost(stats[key], stage, { ignoreNegative: crit });

  const item = attacker.item;
  if (move.category === 'Physical' && item && OFFENSE_ITEMS_PHYSICAL.has(item)) {
    stat = Math.floor(stat * 1.5);
  }
  if (move.category === 'Special' && item && OFFENSE_ITEMS_SPECIAL.has(item)) {
    stat = Math.floor(stat * 1.5);
  }
  if (attacker.ability === 'Huge Power' || attacker.ability === 'Pure Power') {
    if (move.category === 'Physical') stat = Math.floor(stat * 2);
  }
  return Math.max(1, stat);
}

function defensiveStat(defender: PokemonSet, move: Move, crit: boolean, field: Field): number {
  const stats = computeStats(defender);
  const key: StatKey = move.category === 'Physical' ? 'def' : 'spd';
  const stage = move.ignoresDefensiveBoosts ? 0 : defender.boosts?.[key as 'def' | 'spd'] ?? 0;
  // A crit ignores the defender's stat boosts.
  let stat = statAfterBoost(stats[key], stage, { ignorePositive: crit });

  const item = defender.item;
  if (item === 'Eviolite') stat = Math.floor(stat * 1.5);
  if (item === 'Assault Vest' && move.category === 'Special') stat = Math.floor(stat * 1.5);

  // Sand raises Rock-types' Sp. Def; Snow raises Ice-types' Defense.
  if (field.weather === 'Sand' && move.category === 'Special' && defender.species.types.includes('Rock')) {
    stat = Math.floor(stat * 1.5);
  }
  if (field.weather === 'Snow' && move.category === 'Physical' && defender.species.types.includes('Ice')) {
    stat = Math.floor(stat * 1.5);
  }
  return Math.max(1, stat);
}

function weatherModifier(move: Move, field: Field): number {
  const w = field.weather;
  if (!w || w === 'None') return M.neutral;
  if (w === 'Sun') {
    if (move.type === 'Fire') return M.weatherBoost;
    if (move.type === 'Water') return M.weatherReduce;
  }
  if (w === 'Rain') {
    if (move.type === 'Water') return M.weatherBoost;
    if (move.type === 'Fire') return M.weatherReduce;
  }
  return M.neutral;
}

function isSTAB(attacker: PokemonSet, move: Move): boolean {
  return (attacker.species.types as readonly PokemonType[]).includes(move.type);
}

function describeKO(hitsToKO: number | null, ohkoChance: number): string {
  if (hitsToKO === null) return 'not a KO';
  if (hitsToKO === 1) {
    if (ohkoChance >= 1) return 'guaranteed OHKO';
    return `${(ohkoChance * 100).toFixed(1)}% chance to OHKO`;
  }
  return `guaranteed ${hitsToKO}HKO`;
}

/**
 * Calculate damage for one attacker/defender/move interaction under Champions rules.
 *
 * Order of operations follows the games: base damage, then spread, weather and crit,
 * then the random roll, then STAB and type effectiveness, then burn, then the
 * chained final modifier stack (screens, Multiscale, Friend Guard, Filter, Life Orb,
 * resist berry).
 */
export function calculateDamage(
  attacker: PokemonSet,
  defender: PokemonSet,
  move: Move,
  field: Field = {},
  options: CalcOptions = {},
): DamageResult {
  const level = attacker.level ?? 50;
  const gameType = field.gameType ?? 'Doubles';
  const crit = options.crit ?? move.alwaysCrit ?? false;

  const defenderStats = computeStats(defender);
  const defenderHP = defenderStats.hp;

  const eff = typeEffectiveness(move.type, defender.species.types);

  if (move.category === 'Status' || move.basePower <= 0 || eff === 0) {
    return {
      damage: new Array(16).fill(0),
      minDamage: 0,
      maxDamage: 0,
      defenderHP,
      minPercent: 0,
      maxPercent: 0,
      typeEffectiveness: eff,
      hitsToKO: null,
      ohkoChance: 0,
      description: eff === 0 ? 'immune -- 0 damage' : '0 damage',
      attackStat: 0,
      defenseStat: 0,
    };
  }

  const atk = offensiveStat(attacker, move, crit);
  const def = defensiveStat(defender, move, crit, field);

  // Base damage: floor(floor(floor(2*L/5 + 2) * BP * A / D) / 50) + 2
  const levelFactor = Math.floor((2 * level) / 5 + 2);
  let base = Math.floor(Math.floor((levelFactor * move.basePower * atk) / def) / 50) + 2;

  const useSpread = options.spread ?? (move.spread === true && gameType === 'Doubles');
  if (useSpread) base = applyMod(base, M.spread);

  const weather = weatherModifier(move, field);
  if (weather !== M.neutral) base = applyMod(base, weather);

  if (crit) base = Math.floor(base * 1.5);

  // Final modifier chain, applied identically to every roll.
  const finalMods: number[] = [];
  const screenUp =
    (move.category === 'Physical' && (field.reflect || field.auroraVeil)) ||
    (move.category === 'Special' && (field.lightScreen || field.auroraVeil));
  const screensIgnored =
    attacker.ability === 'Infiltrator' || crit;
  if (screenUp && !screensIgnored) {
    finalMods.push(gameType === 'Doubles' ? M.screenDoubles : M.screenSingles);
  }
  if (defender.ability === 'Multiscale' && (defender.hpPercent ?? 1) >= 1) {
    finalMods.push(M.multiscale);
  }
  if (field.friendGuard) finalMods.push(M.friendGuard);
  if (
    eff > 1 &&
    (defender.ability === 'Filter' ||
      defender.ability === 'Solid Rock' ||
      defender.ability === 'Prism Armor')
  ) {
    finalMods.push(M.filter);
  }
  if (attacker.item === 'Life Orb') finalMods.push(M.lifeOrb);
  if (attacker.ability === 'Tinted Lens' && eff < 1) finalMods.push(M.tintedLens);
  if (attacker.ability === 'Neuroforce' && eff > 1) finalMods.push(M.neuroforce);
  if (defender.item === 'Resist Berry' && eff > 1) finalMods.push(M.resistBerry);
  const finalMod = chainMods(finalMods);

  const stab = isSTAB(attacker, move)
    ? attacker.ability === 'Adaptability'
      ? M.adaptability
      : M.stab
    : M.neutral;

  const burned =
    defender !== attacker &&
    attacker.status === 'Burn' &&
    move.category === 'Physical' &&
    attacker.ability !== 'Guts';

  const damage = ROLLS.map((roll) => {
    let d = Math.floor((base * roll) / 100);
    if (stab !== M.neutral) d = applyMod(d, stab);
    d = Math.floor(d * eff);
    if (burned) d = Math.floor(d * 0.5);
    if (finalMod !== M.neutral) d = applyMod(d, finalMod);
    return Math.max(1, d);
  });

  const hits = Math.max(1, move.hits ?? 1);
  const perUse = damage.map((d) => d * hits);

  const minDamage = perUse[0]!;
  const maxDamage = perUse[perUse.length - 1]!;

  const ohkoRolls = perUse.filter((d) => d >= defenderHP).length;
  const ohkoChance = ohkoRolls / perUse.length;

  let hitsToKO: number | null = null;
  if (maxDamage > 0) {
    // Worst case: every hit rolls minimum.
    hitsToKO = Math.ceil(defenderHP / minDamage);
    if (ohkoRolls > 0) hitsToKO = 1;
    if (!Number.isFinite(hitsToKO)) hitsToKO = null;
  }

  const minPercent = round1((minDamage / defenderHP) * 100);
  const maxPercent = round1((maxDamage / defenderHP) * 100);

  return {
    damage: perUse,
    minDamage,
    maxDamage,
    defenderHP,
    minPercent,
    maxPercent,
    typeEffectiveness: eff,
    hitsToKO,
    ohkoChance,
    description: `${minPercent} - ${maxPercent}% -- ${describeKO(hitsToKO, ohkoChance)}`,
    attackStat: atk,
    defenseStat: def,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export { pokeRound };
