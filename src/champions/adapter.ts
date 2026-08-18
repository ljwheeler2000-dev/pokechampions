/**
 * Champions <-> @smogon/calc adapter.
 *
 * @smogon/calc ships the full Champions dex (including the Champions-original
 * Mega Evolutions, e.g. Staraptor-Mega = Fighting/Flying 85/140/100/60/90/110)
 * and a maintained damage engine. What it does NOT know is Champions' SP system.
 *
 * The mapping is exact, not approximate. At level 50 with 31 IVs, 0 EVs and a
 * neutral nature, the standard formula reduces to:
 *   HP    = Base + 75
 *   Other = Base + 20
 * which is precisely the Champions formula minus the SP term. So a Pokemon whose
 * base stats are shifted by its SP investment (and by its Champions nature, applied
 * after SP) produces exactly Champions' stats through Smogon's own math - and every
 * downstream mechanic (abilities, items, field, spread targeting) keeps working.
 *
 * The shift survives Smogon's internal clone() because clone passes `overrides:
 * this.species` through, so the shifted species travels with the Pokemon.
 */
import { Generations, Pokemon, type Field } from '@smogon/calc';
import {
  CHAMPIONS_LEVEL, STATS, championsStats,
  type SpSpread, type StatBlock, type StatKey,
} from './sp.js';

export const GEN = Generations.get(9);

export interface ChampionsSet {
  /** Species name as @smogon/calc knows it, e.g. "Rotom-Wash", "Sceptile-Mega". */
  species: string;
  nature: string;
  sp: SpSpread;
  item?: string;
  ability?: string;
  status?: '' | 'brn' | 'par' | 'psn' | 'tox' | 'slp' | 'frz';
  boosts?: Partial<Record<Exclude<StatKey, 'hp'>, number>>;
  teraType?: string;
  moves?: string[];
  /** Current HP as a fraction of max, 0-1. Defaults to 1. */
  hpPercent?: number;
  /** Display nickname; falls back to species. */
  label?: string;
}

const FULL_IVS = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
const NO_EVS = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

/** Base stats of a species, straight from the Smogon dex. */
export function baseStatsOf(species: string): StatBlock {
  const probe = new Pokemon(GEN, species, { level: CHAMPIONS_LEVEL });
  const bs = probe.species.baseStats as unknown as StatBlock;
  return { hp: bs.hp, atk: bs.atk, def: bs.def, spa: bs.spa, spd: bs.spd, spe: bs.spe };
}

export function speciesTypes(species: string): string[] {
  return [...new Pokemon(GEN, species, { level: CHAMPIONS_LEVEL }).types];
}

export function defaultAbility(species: string): string | undefined {
  return new Pokemon(GEN, species, { level: CHAMPIONS_LEVEL }).ability;
}

/** The Champions stat line this set actually has. */
export function statsOf(set: ChampionsSet): StatBlock {
  return championsStats(baseStatsOf(set.species), set.sp, set.nature);
}

/**
 * Build a @smogon/calc Pokemon whose computed stats equal the Champions stats.
 *
 * The Champions nature multiplier is baked into the shifted base stats and the
 * Smogon nature is left neutral, so the multiplier is applied exactly once and in
 * the Champions order (after SP, not before).
 */
export function toCalcPokemon(set: ChampionsSet): Pokemon {
  const base = baseStatsOf(set.species);
  const target = championsStats(base, set.sp, set.nature);

  const shifted = {} as StatBlock;
  for (const s of STATS) shifted[s] = s === 'hp' ? target.hp - 75 : target[s] - 20;

  const probe = new Pokemon(GEN, set.species, { level: CHAMPIONS_LEVEL });
  const overrides = { ...probe.species, baseStats: shifted };

  const pct = set.hpPercent ?? 1;
  const mon = new Pokemon(GEN, set.species, {
    level: CHAMPIONS_LEVEL,
    nature: 'Hardy',
    ivs: { ...FULL_IVS },
    evs: { ...NO_EVS },
    item: set.item as never,
    ability: set.ability as never,
    status: (set.status ?? '') as never,
    boosts: { ...(set.boosts ?? {}) } as never,
    teraType: set.teraType as never,
    moves: (set.moves ?? []) as never,
    overrides: overrides as never,
    curHP: Math.max(1, Math.round(target.hp * pct)),
  } as never);

  return mon;
}

/** Effective Speed including item, ability, status, boosts and field effects. */
export function effectiveSpeed(
  set: ChampionsSet,
  opts: { tailwind?: boolean; weather?: string } = {},
): number {
  const stats = statsOf(set);
  let spe = stats.spe;
  const stage = set.boosts?.spe ?? 0;
  if (stage !== 0) {
    const N = [2, 2, 2, 2, 2, 2, 2, 3, 4, 5, 6, 7, 8];
    const D = [8, 7, 6, 5, 4, 3, 2, 2, 2, 2, 2, 2, 2];
    const i = Math.max(-6, Math.min(6, stage)) + 6;
    spe = Math.floor((spe * N[i]!) / D[i]!);
  }
  if (set.item === 'Choice Scarf') spe = Math.floor(spe * 1.5);
  if (set.ability === 'Swift Swim' && opts.weather === 'Rain') spe = Math.floor(spe * 2);
  if (set.ability === 'Chlorophyll' && opts.weather === 'Sun') spe = Math.floor(spe * 2);
  if (set.ability === 'Sand Rush' && opts.weather === 'Sand') spe = Math.floor(spe * 2);
  if (set.ability === 'Slush Rush' && opts.weather === 'Snow') spe = Math.floor(spe * 2);
  if (opts.tailwind) spe = Math.floor(spe * 2);
  if (set.status === 'par' && set.ability !== 'Quick Feet') spe = Math.floor(spe * 0.5);
  return spe;
}

export type { Field };
