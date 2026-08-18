/**
 * Speed tiers.
 *
 * In doubles, most of a spread's value is decided by whether you move first, so
 * the useful question is not "how fast is this?" but "what does this number
 * actually beat, and what does it need to beat?".
 */
import { calcStat, natureMultiplier, SP_MAX_PER_STAT } from '../champions/sp.js';
import { baseStatsOf, effectiveSpeed, type ChampionsSet } from '../champions/adapter.js';
import { ROSTER_ALL } from '../champions/roster.js';

export interface SpeedEntry {
  species: string;
  baseSpeed: number;
  /** No investment, neutral nature. */
  min: number;
  /** Max SP, neutral nature. */
  neutralMax: number;
  /** Max SP, +Speed nature - the realistic ceiling. */
  positiveMax: number;
  /** Positive nature, max SP, Choice Scarf. */
  scarfMax: number;
  /** Positive nature, max SP, under Tailwind. */
  tailwindMax: number;
}

export function speedEntry(species: string): SpeedEntry {
  const base = baseStatsOf(species).spe;
  const neutralMax = calcStat(base, SP_MAX_PER_STAT, 1);
  const positiveMax = calcStat(base, SP_MAX_PER_STAT, 1.1);
  return {
    species,
    baseSpeed: base,
    min: calcStat(base, 0, 1),
    neutralMax,
    positiveMax,
    scarfMax: Math.floor(positiveMax * 1.5),
    tailwindMax: positiveMax * 2,
  };
}

/** Every roster Pokemon, fastest first. */
export function speedTiers(): SpeedEntry[] {
  return ROSTER_ALL.map(speedEntry).sort((a, b) => b.positiveMax - a.positiveMax);
}

export interface SpeedComparison {
  /** Your effective Speed under the given conditions. */
  yourSpeed: number;
  /** Roster entries you outspeed even at their realistic ceiling. */
  outspeeds: SpeedEntry[];
  /** Roster entries that beat you even if you invest nothing more. */
  outsped: SpeedEntry[];
  /** Exact speed ties - the coin flips. */
  ties: SpeedEntry[];
  /** You beat their normal ceiling, but lose to it with a Choice Scarf on. */
  losesToScarf: SpeedEntry[];
}

/**
 * Where a set sits in the field.
 *
 * Opponents are measured at their realistic ceiling (max SP, +Speed nature),
 * which is the pessimistic assumption: if you beat that, you beat the spread
 * they actually ran.
 */
export function compareSpeed(
  set: ChampionsSet,
  opts: { tailwind?: boolean; weather?: string; pool?: readonly string[] } = {},
): SpeedComparison {
  const yourSpeed = effectiveSpeed(set, { tailwind: opts.tailwind, weather: opts.weather });
  const pool = (opts.pool ?? ROSTER_ALL).map(speedEntry);
  const outspeeds: SpeedEntry[] = [], outsped: SpeedEntry[] = [];
  const ties: SpeedEntry[] = [], losesToScarf: SpeedEntry[] = [];
  for (const e of pool) {
    if (e.species === set.species) continue;
    if (yourSpeed === e.positiveMax) ties.push(e);
    else if (yourSpeed > e.positiveMax) {
      outspeeds.push(e);
      if (e.scarfMax > yourSpeed) losesToScarf.push(e);
    } else outsped.push(e);
  }
  const bySpeed = (a: SpeedEntry, b: SpeedEntry) => b.positiveMax - a.positiveMax;
  return {
    yourSpeed,
    outspeeds: outspeeds.sort(bySpeed),
    outsped: outsped.sort(bySpeed),
    ties: ties.sort(bySpeed),
    losesToScarf: losesToScarf.sort(bySpeed),
  };
}

/**
 * Cheapest SP + nature that reaches a target Speed.
 *
 * Prefers the option that costs less SP; a positive nature is free in SP terms
 * but costs you 10% of another stat, so both are reported.
 */
export function speedInvestmentFor(
  species: string,
  targetSpeed: number,
  opts: { scarf?: boolean } = {},
): Array<{ nature: 'neutral' | 'positive'; sp: number; speed: number }> {
  const base = baseStatsOf(species).spe;
  const out: Array<{ nature: 'neutral' | 'positive'; sp: number; speed: number }> = [];
  for (const [label, mult] of [['neutral', 1], ['positive', 1.1]] as const) {
    for (let sp = 0; sp <= SP_MAX_PER_STAT; sp++) {
      let s = calcStat(base, sp, mult);
      if (opts.scarf) s = Math.floor(s * 1.5);
      if (s >= targetSpeed) { out.push({ nature: label, sp, speed: s }); break; }
    }
  }
  return out;
}

/** Speed of a species at a given SP/nature, for building benchmark tables. */
export function speedAt(species: string, sp: number, nature: string, scarf = false): number {
  const base = baseStatsOf(species).spe;
  const s = calcStat(base, sp, natureMultiplier(nature, 'spe'));
  return scarf ? Math.floor(s * 1.5) : s;
}
