/**
 * Champions SP mechanics.
 *
 * Champions replaces EVs/IVs entirely: every Pokemon gets 66 SP to spend across
 * six stats, capped at 32 in any one stat, and IVs do not exist as a variable.
 *
 * Verified against the live Champions calc (calc.pokemonshowdown.com/champions.html):
 *   HP    = Base + 75 + SP
 *   Other = floor((Base + 20 + SP) * Nature)      <- nature applies AFTER SP
 */

export const SP_BUDGET = 66;
export const SP_MAX_PER_STAT = 32;
export const CHAMPIONS_LEVEL = 50;

export const STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
export type StatKey = (typeof STATS)[number];
export type StatBlock = Record<StatKey, number>;
export type SpSpread = Partial<StatBlock>;

export const STAT_LABEL: Record<StatKey, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
};

type Boosted = Exclude<StatKey, 'hp'>;

/** [boosted, hindered]; null for the five neutral natures. */
export const NATURES: Record<string, [Boosted, Boosted] | null> = {
  Hardy: null, Docile: null, Serious: null, Bashful: null, Quirky: null,
  Lonely: ['atk', 'def'], Brave: ['atk', 'spe'], Adamant: ['atk', 'spa'], Naughty: ['atk', 'spd'],
  Bold: ['def', 'atk'], Relaxed: ['def', 'spe'], Impish: ['def', 'spa'], Lax: ['def', 'spd'],
  Timid: ['spe', 'atk'], Hasty: ['spe', 'def'], Jolly: ['spe', 'spa'], Naive: ['spe', 'spd'],
  Modest: ['spa', 'atk'], Mild: ['spa', 'def'], Quiet: ['spa', 'spe'], Rash: ['spa', 'spd'],
  Calm: ['spd', 'atk'], Gentle: ['spd', 'def'], Sassy: ['spd', 'spe'], Careful: ['spd', 'spa'],
};
export const NATURE_NAMES = Object.keys(NATURES);

export function natureMultiplier(nature: string, stat: StatKey): number {
  if (stat === 'hp') return 1;
  const e = NATURES[nature];
  if (!e) return 1;
  if (stat === e[0]) return 1.1;
  if (stat === e[1]) return 0.9;
  return 1;
}

export const calcHP = (base: number, sp: number): number => base + 75 + sp;
export const calcStat = (base: number, sp: number, nature = 1): number =>
  Math.floor((base + 20 + sp) * nature);

/** Full Champions stat block from base stats + SP + nature. */
export function championsStats(base: StatBlock, sp: SpSpread, nature: string): StatBlock {
  const out = {} as StatBlock;
  for (const s of STATS) {
    const v = sp[s] ?? 0;
    out[s] = s === 'hp' ? calcHP(base.hp, v) : calcStat(base[s], v, natureMultiplier(nature, s));
  }
  return out;
}

export interface SpValidation {
  valid: boolean;
  total: number;
  remaining: number;
  errors: string[];
}

export function validateSP(sp: SpSpread | undefined): SpValidation {
  const errors: string[] = [];
  let total = 0;
  for (const s of STATS) {
    const v = sp?.[s] ?? 0;
    if (!Number.isInteger(v)) errors.push(`${STAT_LABEL[s]}: SP must be a whole number`);
    if (v < 0) errors.push(`${STAT_LABEL[s]}: SP cannot be negative`);
    if (v > SP_MAX_PER_STAT) {
      errors.push(`${STAT_LABEL[s]}: ${v} SP is over the ${SP_MAX_PER_STAT} per-stat cap`);
    }
    total += v;
  }
  if (total > SP_BUDGET) errors.push(`Total ${total} SP is over the ${SP_BUDGET} SP budget`);
  return { valid: errors.length === 0, total, remaining: SP_BUDGET - total, errors };
}

export const spTotal = (sp: SpSpread | undefined): number =>
  STATS.reduce((n, s) => n + (sp?.[s] ?? 0), 0);

/** Cheapest SP that reaches `target` in a non-HP stat, or null if the 32 cap can't. */
export function spNeededForStat(base: number, target: number, nature = 1): number | null {
  for (let sp = 0; sp <= SP_MAX_PER_STAT; sp++) {
    if (calcStat(base, sp, nature) >= target) return sp;
  }
  return null;
}

export function spNeededForHP(base: number, target: number): number | null {
  for (let sp = 0; sp <= SP_MAX_PER_STAT; sp++) {
    if (calcHP(base, sp) >= target) return sp;
  }
  return null;
}

const BOOST_NUM = [2, 2, 2, 2, 2, 2, 2, 3, 4, 5, 6, 7, 8];
const BOOST_DEN = [8, 7, 6, 5, 4, 3, 2, 2, 2, 2, 2, 2, 2];

/** Apply a -6..+6 stat stage. */
export function applyBoost(stat: number, stage: number): number {
  const s = Math.max(-6, Math.min(6, Math.trunc(stage)));
  return Math.floor((stat * BOOST_NUM[s + 6]!) / BOOST_DEN[s + 6]!);
}
