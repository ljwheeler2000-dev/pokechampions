import { describe, expect, it } from 'vitest';
import {
  SP_BUDGET, SP_MAX_PER_STAT, applyBoost, calcHP, calcStat, computeStats,
  spNeededForStat, validateSP,
} from '../src/stats.js';
import { natureMultiplier } from '../src/natures.js';
import { DEX } from '../src/dex.js';
import type { PokemonSet } from '../src/types.js';

describe('Champions stat formulas (verified against the live calc)', () => {
  it('HP = Base + 75 + SP -- Rotom-Wash 50 base, 24 SP -> 149', () => {
    expect(calcHP(50, 24)).toBe(149);
  });

  it('neutral nature -- Rotom-Wash 105 base SpA, Timid, 32 SP -> 157', () => {
    expect(calcStat(105, 32, natureMultiplier('Timid', 'spa'))).toBe(157);
  });

  it('hindered nature -- Rotom-Wash 65 base Atk, Timid, 0 SP -> 76', () => {
    expect(calcStat(65, 0, natureMultiplier('Timid', 'atk'))).toBe(76);
  });

  it('boosted nature -- Rotom-Wash 86 base Speed, Timid, 10 SP -> 127', () => {
    expect(calcStat(86, 10, natureMultiplier('Timid', 'spe'))).toBe(127);
  });

  it('Choice Scarf on that Speed -> 190', () => {
    const speed = calcStat(86, 10, natureMultiplier('Timid', 'spe'));
    expect(Math.floor(speed * 1.5)).toBe(190);
  });

  it('Mega Staraptor 140 base Atk, Hardy, 32 SP -> 192', () => {
    expect(calcStat(140, 32, natureMultiplier('Hardy', 'atk'))).toBe(192);
  });

  it('applies nature after SP, not before', () => {
    // (65 + 20 + 10) * 0.9 = 85.5 -> 85, not floor(65*0.9) + 20 + 10 = 88
    expect(calcStat(65, 10, 0.9)).toBe(85);
  });

  it('computes a full stat block for a built set', () => {
    const set: PokemonSet = {
      species: DEX['Rotom-Wash']!,
      nature: 'Timid',
      sp: { hp: 24, spa: 32, spe: 10 },
    };
    const stats = computeStats(set);
    expect(stats.hp).toBe(149);
    expect(stats.spa).toBe(157);
    expect(stats.spe).toBe(127);
    expect(stats.atk).toBe(76);
  });
});

describe('SP budget validation', () => {
  it('accepts a legal spread', () => {
    const v = validateSP({ hp: 24, def: 10, spa: 32 });
    expect(v.valid).toBe(true);
    expect(v.total).toBe(66);
    expect(v.remaining).toBe(0);
  });

  it('rejects going over the 66 SP budget', () => {
    const v = validateSP({ hp: 32, def: 32, spa: 32 });
    expect(v.valid).toBe(false);
    expect(v.total).toBe(96);
    expect(v.errors.some((e) => e.includes(String(SP_BUDGET)))).toBe(true);
  });

  it('rejects more than 32 SP in one stat', () => {
    const v = validateSP({ spa: 33 });
    expect(v.valid).toBe(false);
    expect(v.errors.some((e) => e.includes(String(SP_MAX_PER_STAT)))).toBe(true);
  });

  it('rejects negative and fractional SP', () => {
    expect(validateSP({ hp: -1 }).valid).toBe(false);
    expect(validateSP({ hp: 1.5 }).valid).toBe(false);
  });

  it('treats an empty spread as 66 SP remaining', () => {
    expect(validateSP(undefined).remaining).toBe(66);
  });
});

describe('stat stages', () => {
  it('+1 is x1.5 floored, -1 is x2/3 floored', () => {
    expect(applyBoost(100, 1)).toBe(150);
    expect(applyBoost(100, -1)).toBe(66);
  });

  it('caps at +/-6', () => {
    expect(applyBoost(100, 6)).toBe(400);
    expect(applyBoost(100, 99)).toBe(400);
    expect(applyBoost(100, -6)).toBe(25);
    expect(applyBoost(100, -99)).toBe(25);
  });

  it('0 stages leaves the stat untouched', () => {
    expect(applyBoost(137, 0)).toBe(137);
  });
});

describe('investment helpers', () => {
  it('finds the cheapest SP that reaches a target stat', () => {
    expect(spNeededForStat(105, 157, 1)).toBe(32);
    expect(spNeededForStat(105, 125, 1)).toBe(0);
  });

  it('returns null when the 32 SP cap cannot reach the target', () => {
    expect(spNeededForStat(50, 999, 1)).toBeNull();
  });
});

describe('test fixtures obey the Champions rules', () => {
  it('every documented example spread is within the 66 SP budget and 32 cap', () => {
    const spreads = [
      { hp: 24, spa: 32, spe: 10 },   // Rotom-Wash
      { atk: 32, hp: 32, spd: 2 },    // Staraptor-Mega
    ];
    for (const s of spreads) {
      const v = validateSP(s);
      expect(v.errors).toEqual([]);
      expect(v.valid).toBe(true);
    }
  });
});
