import { calculateDamage, ROLLS } from './damage.js';
import { M, applyMod, chainMods } from './modifiers.js';
import { SP_MAX_PER_STAT, computeStats, validateSP } from './stats.js';
import type { CalcOptions, Field, Move, PokemonSet, StatBlock } from './types.js';

/**
 * Raw breakpoint scan, mirroring the damage-rounding calculator.
 *
 * Because the damage formula floors at several points, incoming damage does not
 * fall smoothly as Defense rises -- it drops in discrete steps. This finds the
 * exact Defense values where those steps happen, so bulk investment can be aimed
 * at a cliff instead of spent on values that change nothing.
 */
export interface RawBreakpointInput {
  attackStat: number;
  basePower: number;
  defMin: number;
  defMax: number;
  level?: number;
  /** Multi-target x0.75. */
  spread?: boolean;
  crit?: boolean;
  stab?: boolean;
  /** Combined type multiplier: 0.25, 0.5, 1, 2, 4. */
  typeEffectiveness?: number;
  /** Physical attacker burned. */
  burn?: boolean;
  weather?: 'boost' | 'reduce' | 'none';
  /** Reflect / Light Screen / Aurora Veil on the defender's side. */
  screen?: boolean;
  gameType?: 'Singles' | 'Doubles';
  multiscale?: boolean;
  friendGuard?: boolean;
  /** Filter / Solid Rock / Prism Armor. */
  filter?: boolean;
  lifeOrb?: boolean;
  resistBerry?: boolean;
}

export interface BreakpointRow {
  def: number;
  minDamage: number;
  maxDamage: number;
  /** True when this Defense value lowers max damage vs. one point less Defense. */
  isBreakpoint: boolean;
  /** How much max damage dropped at this value. 0 when not a breakpoint. */
  maxDamageDrop: number;
}

function rawDamageRolls(def: number, input: RawBreakpointInput): number[] {
  const level = input.level ?? 50;
  const eff = input.typeEffectiveness ?? 1;
  const levelFactor = Math.floor((2 * level) / 5 + 2);

  let base =
    Math.floor(Math.floor((levelFactor * input.basePower * input.attackStat) / Math.max(1, def)) / 50) + 2;

  if (input.spread) base = applyMod(base, M.spread);
  if (input.weather === 'boost') base = applyMod(base, M.weatherBoost);
  if (input.weather === 'reduce') base = applyMod(base, M.weatherReduce);
  if (input.crit) base = Math.floor(base * 1.5);

  const finalMods: number[] = [];
  if (input.screen && !input.crit) {
    finalMods.push((input.gameType ?? 'Doubles') === 'Doubles' ? M.screenDoubles : M.screenSingles);
  }
  if (input.multiscale) finalMods.push(M.multiscale);
  if (input.friendGuard) finalMods.push(M.friendGuard);
  if (input.filter && eff > 1) finalMods.push(M.filter);
  if (input.lifeOrb) finalMods.push(M.lifeOrb);
  if (input.resistBerry && eff > 1) finalMods.push(M.resistBerry);
  const finalMod = chainMods(finalMods);

  return ROLLS.map((roll) => {
    let d = Math.floor((base * roll) / 100);
    if (input.stab) d = applyMod(d, M.stab);
    d = Math.floor(d * eff);
    if (input.burn) d = Math.floor(d * 0.5);
    if (finalMod !== M.neutral) d = applyMod(d, finalMod);
    return Math.max(1, d);
  });
}

/** Scan a Defense range and return every value plus which ones are rounding cliffs. */
export function scanDefenseRange(input: RawBreakpointInput): BreakpointRow[] {
  const rows: BreakpointRow[] = [];
  let previousMax: number | null = null;

  for (let def = input.defMin; def <= input.defMax; def++) {
    const rolls = rawDamageRolls(def, input);
    const minDamage = rolls[0]!;
    const maxDamage = rolls[rolls.length - 1]!;
    const drop = previousMax === null ? 0 : previousMax - maxDamage;
    rows.push({
      def,
      minDamage,
      maxDamage,
      isBreakpoint: drop > 0,
      maxDamageDrop: drop > 0 ? drop : 0,
    });
    previousMax = maxDamage;
  }
  return rows;
}

/** Just the cliffs from a scan, in ascending Defense order. */
export function findBreakpoints(input: RawBreakpointInput): BreakpointRow[] {
  return scanDefenseRange(input).filter((r) => r.isBreakpoint);
}

export interface SurvivalResult {
  /** Fewest SP in the defensive stat that survives the worst-case roll. */
  spToGuaranteedSurvival: number | null;
  /** Fewest SP that survives at least one roll. */
  spToPossibleSurvival: number | null;
  rows: Array<{
    sp: number;
    defenseStat: number;
    maxDamage: number;
    maxPercent: number;
    survivesAlways: boolean;
    survivesSometimes: boolean;
  }>;
  /** True when the spread would exceed the 66 SP budget at the recommended value. */
  budgetWarning: string | null;
}

/**
 * Set-based breakpoint search: hold the attacker fixed and sweep the defender's
 * SP investment in the relevant defensive stat (Def for physical, SpDef for special),
 * reporting the cheapest investment that survives the hit.
 *
 * HP SP is held at whatever the defender's set already specifies -- sweep HP
 * separately if you want to trade the two off.
 */
export function findSurvivalSP(
  attacker: PokemonSet,
  defender: PokemonSet,
  move: Move,
  field: Field = {},
  options: CalcOptions = {},
): SurvivalResult {
  const stat = move.category === 'Physical' ? 'def' : 'spd';
  const rows: SurvivalResult['rows'] = [];
  let spToGuaranteedSurvival: number | null = null;
  let spToPossibleSurvival: number | null = null;

  for (let sp = 0; sp <= SP_MAX_PER_STAT; sp++) {
    const candidate: PokemonSet = {
      ...defender,
      sp: { ...(defender.sp ?? {}), [stat]: sp } as Partial<StatBlock>,
    };
    const result = calculateDamage(attacker, candidate, move, field, options);
    const hp = computeStats(candidate).hp;
    const survivesAlways = result.maxDamage < hp;
    const survivesSometimes = result.minDamage < hp;

    rows.push({
      sp,
      defenseStat: result.defenseStat,
      maxDamage: result.maxDamage,
      maxPercent: result.maxPercent,
      survivesAlways,
      survivesSometimes,
    });

    if (survivesSometimes && spToPossibleSurvival === null) spToPossibleSurvival = sp;
    if (survivesAlways && spToGuaranteedSurvival === null) spToGuaranteedSurvival = sp;
  }

  let budgetWarning: string | null = null;
  if (spToGuaranteedSurvival !== null) {
    const check = validateSP({
      ...(defender.sp ?? {}),
      [stat]: spToGuaranteedSurvival,
    } as Partial<StatBlock>);
    if (!check.valid) budgetWarning = check.errors.join('; ');
  }

  return { spToGuaranteedSurvival, spToPossibleSurvival, rows, budgetWarning };
}
