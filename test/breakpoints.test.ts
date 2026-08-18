import { describe, expect, it } from 'vitest';
import { findBreakpoints, findSurvivalSP, scanDefenseRange } from '../src/breakpoints.js';
import { DEX } from '../src/dex.js';
import type { Move, PokemonSet } from '../src/types.js';

const discharge: Move = {
  name: 'Discharge', type: 'Electric', category: 'Special', basePower: 80, spread: true,
};

const rotom: PokemonSet = {
  species: DEX['Rotom-Wash']!,
  nature: 'Timid',
  sp: { hp: 24, spa: 32, spe: 10 },
};

const staraptor: PokemonSet = {
  species: DEX['Staraptor-Mega']!,
  nature: 'Hardy',
  sp: { atk: 32, hp: 32, spd: 2 },
};

describe('raw defence scan', () => {
  it('returns one row per Defense value in the range', () => {
    const rows = scanDefenseRange({ attackStat: 157, basePower: 80, defMin: 100, defMax: 140 });
    expect(rows).toHaveLength(41);
    expect(rows[0]!.def).toBe(100);
    expect(rows[40]!.def).toBe(140);
  });

  it('damage never rises as Defense rises', () => {
    const rows = scanDefenseRange({ attackStat: 157, basePower: 80, defMin: 80, defMax: 200 });
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i]!.maxDamage).toBeLessThanOrEqual(rows[i - 1]!.maxDamage);
    }
  });

  it('finds discrete breakpoints rather than a smooth curve', () => {
    const rows = scanDefenseRange({ attackStat: 157, basePower: 80, defMin: 100, defMax: 200 });
    const cliffs = rows.filter((r) => r.isBreakpoint);
    const flats = rows.filter((r) => !r.isBreakpoint);
    // Both must exist -- that is the whole premise of breakpoint hunting.
    expect(cliffs.length).toBeGreaterThan(0);
    expect(flats.length).toBeGreaterThan(0);
    expect(cliffs.length).toBeLessThan(rows.length);
  });

  it('every reported breakpoint actually lowers max damage', () => {
    const input = { attackStat: 192, basePower: 120, defMin: 90, defMax: 220 } as const;
    const rows = scanDefenseRange(input);
    for (const bp of findBreakpoints(input)) {
      const idx = rows.findIndex((r) => r.def === bp.def);
      expect(idx).toBeGreaterThan(0);
      expect(rows[idx]!.maxDamage).toBeLessThan(rows[idx - 1]!.maxDamage);
      expect(bp.maxDamageDrop).toBe(rows[idx - 1]!.maxDamage - rows[idx]!.maxDamage);
    }
  });

  it('the spread penalty lowers damage across the range', () => {
    const plain = scanDefenseRange({ attackStat: 157, basePower: 80, defMin: 120, defMax: 121 });
    const spread = scanDefenseRange({
      attackStat: 157, basePower: 80, defMin: 120, defMax: 121, spread: true,
    });
    expect(spread[0]!.maxDamage).toBeLessThan(plain[0]!.maxDamage);
  });

  it('honours type effectiveness and screens', () => {
    const neutral = scanDefenseRange({ attackStat: 157, basePower: 80, defMin: 120, defMax: 120 });
    const sup = scanDefenseRange({
      attackStat: 157, basePower: 80, defMin: 120, defMax: 120, typeEffectiveness: 2,
    });
    const screened = scanDefenseRange({
      attackStat: 157, basePower: 80, defMin: 120, defMax: 120, typeEffectiveness: 2, screen: true,
    });
    expect(sup[0]!.maxDamage).toBeGreaterThan(neutral[0]!.maxDamage);
    expect(screened[0]!.maxDamage).toBeLessThan(sup[0]!.maxDamage);
  });
});

describe('SP survival search', () => {
  it('scans all 33 SP values', () => {
    const r = findSurvivalSP(rotom, staraptor, discharge);
    expect(r.rows).toHaveLength(33);
    expect(r.rows[0]!.sp).toBe(0);
    expect(r.rows[32]!.sp).toBe(32);
  });

  it('damage falls monotonically as SP goes in', () => {
    const r = findSurvivalSP(rotom, staraptor, discharge);
    for (let i = 1; i < r.rows.length; i++) {
      expect(r.rows[i]!.maxDamage).toBeLessThanOrEqual(r.rows[i - 1]!.maxDamage);
    }
  });

  it('the reported guaranteed-survival SP really survives, and one less does not', () => {
    const r = findSurvivalSP(rotom, staraptor, discharge);
    if (r.spToGuaranteedSurvival !== null && r.spToGuaranteedSurvival > 0) {
      const at = r.rows[r.spToGuaranteedSurvival]!;
      const below = r.rows[r.spToGuaranteedSurvival - 1]!;
      expect(at.survivesAlways).toBe(true);
      expect(below.survivesAlways).toBe(false);
    }
  });

  it('possible survival is never more expensive than guaranteed survival', () => {
    const r = findSurvivalSP(rotom, staraptor, discharge);
    if (r.spToGuaranteedSurvival !== null && r.spToPossibleSurvival !== null) {
      expect(r.spToPossibleSurvival).toBeLessThanOrEqual(r.spToGuaranteedSurvival);
    }
  });

  it('returns null when no SP investment survives the hit', () => {
    const nuke: Move = { name: 'Nuke', type: 'Fighting', category: 'Physical', basePower: 250 };
    const frail: PokemonSet = { species: DEX['Rotom-Wash']!, sp: {} };
    const r = findSurvivalSP({ ...staraptor, item: 'Choice Band' }, frail, nuke);
    expect(r.spToGuaranteedSurvival).toBeNull();
  });

  it('warns when the needed investment busts the 66 SP budget', () => {
    const heavy: PokemonSet = { ...staraptor, sp: { hp: 32, atk: 32 } }; // 64 used, 2 SP left
    const r = findSurvivalSP(rotom, heavy, discharge);
    if (r.spToGuaranteedSurvival !== null && r.spToGuaranteedSurvival > 2) {
      expect(r.budgetWarning).not.toBeNull();
    }
  });
});
