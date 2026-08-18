import { natureMultiplier } from './natures.js';
import { STATS, type NatureName, type PokemonSet, type StatBlock, type StatKey } from './types.js';

/** Champions gives every Pokémon 66 SP to spend across its six stats. */
export const SP_BUDGET = 66;
/** No single stat may hold more than 32 SP. */
export const SP_MAX_PER_STAT = 32;

/**
 * HP in Champions at level 50: Base + 75 + SP.
 * Verified against the live calc (Rotom-Wash, 50 base HP, 24 SP -> 149).
 */
export function calcHP(base: number, sp: number): number {
  return base + 75 + sp;
}

/**
 * Non-HP stats in Champions at level 50: floor((Base + 20 + SP) * Nature).
 * Nature is applied AFTER the SP is added, not before.
 * Verified against the live calc (Rotom-Wash, 65 base Atk, Timid -> floor(85 * 0.9) = 76).
 */
export function calcStat(base: number, sp: number, nature = 1): number {
  return Math.floor((base + 20 + sp) * nature);
}

function spFor(set: PokemonSet, stat: StatKey): number {
  return set.sp?.[stat] ?? 0;
}

/** Compute the full stat block for a built Pokémon, before items and stat stages. */
export function computeStats(set: PokemonSet): StatBlock {
  const out = {} as StatBlock;
  for (const stat of STATS) {
    const base = set.species.baseStats[stat];
    const sp = spFor(set, stat);
    out[stat] =
      stat === 'hp' ? calcHP(base, sp) : calcStat(base, sp, natureMultiplier(set.nature, stat));
  }
  return out;
}

export interface SpValidation {
  valid: boolean;
  total: number;
  remaining: number;
  errors: string[];
}

/** Check an SP spread against the 66-total and 32-per-stat Champions caps. */
export function validateSP(sp: Partial<StatBlock> | undefined): SpValidation {
  const errors: string[] = [];
  let total = 0;
  for (const stat of STATS) {
    const v = sp?.[stat] ?? 0;
    if (!Number.isInteger(v)) errors.push(`${stat}: SP must be a whole number (got ${v})`);
    if (v < 0) errors.push(`${stat}: SP cannot be negative (got ${v})`);
    if (v > SP_MAX_PER_STAT) errors.push(`${stat}: ${v} SP exceeds the ${SP_MAX_PER_STAT} per-stat cap`);
    total += v;
  }
  if (total > SP_BUDGET) errors.push(`Total ${total} SP exceeds the ${SP_BUDGET} SP budget`);
  return { valid: errors.length === 0, total, remaining: SP_BUDGET - total, errors };
}

const BOOST_NUM = [2, 2, 2, 2, 2, 2, 2, 3, 4, 5, 6, 7, 8] as const;
const BOOST_DEN = [8, 7, 6, 5, 4, 3, 2, 2, 2, 2, 2, 2, 2] as const;

/** Apply a -6..+6 stat stage to a raw stat value. */
export function applyBoost(stat: number, stage: number): number {
  const s = Math.max(-6, Math.min(6, Math.trunc(stage)));
  const num = BOOST_NUM[s + 6]!;
  const den = BOOST_DEN[s + 6]!;
  return Math.floor((stat * num) / den);
}

/**
 * Smallest SP investment that reaches at least `target` for a non-HP stat,
 * or null if the 32 SP cap can't get there.
 */
export function spNeededForStat(base: number, target: number, nature = 1): number | null {
  for (let sp = 0; sp <= SP_MAX_PER_STAT; sp++) {
    if (calcStat(base, sp, nature) >= target) return sp;
  }
  return null;
}

/** Smallest SP investment that reaches at least `target` HP, or null if unreachable. */
export function spNeededForHP(base: number, target: number): number | null {
  for (let sp = 0; sp <= SP_MAX_PER_STAT; sp++) {
    if (calcHP(base, sp) >= target) return sp;
  }
  return null;
}

/** Convenience: build a full StatBlock from a partial, defaulting missing stats to 0. */
export function spread(sp: Partial<StatBlock>): StatBlock {
  return {
    hp: sp.hp ?? 0,
    atk: sp.atk ?? 0,
    def: sp.def ?? 0,
    spa: sp.spa ?? 0,
    spd: sp.spd ?? 0,
    spe: sp.spe ?? 0,
  };
}

export type { NatureName };
