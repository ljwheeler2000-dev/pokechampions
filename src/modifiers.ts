/**
 * Fixed-point modifier helpers.
 *
 * The games represent damage modifiers as integers over 4096 and chain them
 * together before applying, rather than multiplying floats one at a time.
 * Reproducing that exactly is what makes defensive breakpoints appear.
 */

/** Convert a decimal multiplier to the game's 4096ths representation. */
export function mod(multiplier: number): number {
  return Math.round(multiplier * 4096);
}

/** Common modifiers, pre-converted. */
export const M = {
  neutral: 4096,
  spread: 3072,          // x0.75 multi-target penalty
  parentalBond2nd: 1024, // x0.25 second hit
  weatherBoost: 6144,    // x1.5
  weatherReduce: 2048,   // x0.5
  crit: 6144,            // x1.5
  stab: 6144,            // x1.5
  adaptability: 8192,    // x2
  burn: 2048,            // x0.5
  screenSingles: 2048,   // x0.5
  screenDoubles: 2732,   // x0.667
  multiscale: 2048,      // x0.5
  friendGuard: 3072,     // x0.75
  filter: 3072,          // x0.75 (Filter / Solid Rock / Prism Armor)
  lifeOrb: 5324,         // x1.3
  resistBerry: 2048,     // x0.5
  tintedLens: 8192,      // x2
  neuroforce: 5120,      // x1.25
} as const;

/**
 * The games' rounding rule: round half DOWN.
 * A result landing exactly on .5 rounds down, unlike JS Math.round.
 */
export function pokeRound(num: number): number {
  return num % 1 > 0.5 ? Math.ceil(num) : Math.floor(num);
}

/** Chain two 4096-based modifiers the way the games do. */
export function chainMod(a: number, b: number): number {
  return ((a * b + 2048) >> 12) as number;
}

/** Chain any number of 4096-based modifiers into one. */
export function chainMods(mods: readonly number[]): number {
  return mods.reduce<number>((acc, m) => chainMod(acc, m), M.neutral);
}

/** Apply a chained 4096-based modifier to a damage value. */
export function applyMod(damage: number, modifier: number): number {
  return pokeRound((damage * modifier) / 4096);
}
