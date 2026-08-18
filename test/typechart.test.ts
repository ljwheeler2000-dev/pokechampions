import { describe, expect, it } from 'vitest';
import {
  defensiveProfile, immunities, resistances, typeEffectiveness, typeEffectivenessSingle, weaknesses,
} from '../src/typechart.js';
import { TYPES } from '../src/types.js';

describe('type chart', () => {
  it('covers all 18 types in both directions', () => {
    expect(TYPES).toHaveLength(18);
    for (const a of TYPES) {
      for (const d of TYPES) {
        const v = typeEffectivenessSingle(a, d);
        expect([0, 0.5, 1, 2]).toContain(v);
      }
    }
  });

  it('reproduces the documented immunities', () => {
    expect(typeEffectivenessSingle('Normal', 'Ghost')).toBe(0);
    expect(typeEffectivenessSingle('Fighting', 'Ghost')).toBe(0);
    expect(typeEffectivenessSingle('Ghost', 'Normal')).toBe(0);
    expect(typeEffectivenessSingle('Electric', 'Ground')).toBe(0);
    expect(typeEffectivenessSingle('Ground', 'Flying')).toBe(0);
    expect(typeEffectivenessSingle('Poison', 'Steel')).toBe(0);
    expect(typeEffectivenessSingle('Psychic', 'Dark')).toBe(0);
    expect(typeEffectivenessSingle('Dragon', 'Fairy')).toBe(0);
  });

  it('stacks dual typings multiplicatively', () => {
    // Ice vs Dragon/Flying = 2 * 2 = 4
    expect(typeEffectiveness('Ice', ['Dragon', 'Flying'])).toBe(4);
    // Fire vs Water/Rock = 0.5 * 0.5 = 0.25
    expect(typeEffectiveness('Fire', ['Water', 'Rock'])).toBe(0.25);
    // Immunity wins regardless of the other half
    expect(typeEffectiveness('Ground', ['Flying', 'Steel'])).toBe(0);
  });

  it('handles Mega Staraptor (Fighting/Flying) defensively', () => {
    expect(typeEffectiveness('Electric', ['Fighting', 'Flying'])).toBe(2);
    expect(typeEffectiveness('Fairy', ['Fighting', 'Flying'])).toBe(2);
    expect(typeEffectiveness('Ground', ['Fighting', 'Flying'])).toBe(0);
    expect(typeEffectiveness('Bug', ['Fighting', 'Flying'])).toBe(0.25);
  });

  it('handles Rotom-Wash (Electric/Water) defensively', () => {
    expect(typeEffectiveness('Grass', ['Electric', 'Water'])).toBe(2);
    expect(typeEffectiveness('Electric', ['Electric', 'Water'])).toBe(1);
    expect(typeEffectiveness('Steel', ['Electric', 'Water'])).toBe(0.25);
  });

  it('builds a complete defensive profile', () => {
    const profile = defensiveProfile(['Electric', 'Water']);
    expect(Object.keys(profile)).toHaveLength(18);
    expect(profile.Grass).toBe(2);
  });

  it('splits a typing into weaknesses, resistances and immunities', () => {
    expect(weaknesses(['Fighting', 'Flying'])).toEqual(
      expect.arrayContaining(['Electric', 'Flying', 'Psychic', 'Fairy', 'Ice']),
    );
    expect(resistances(['Fighting', 'Flying'])).toEqual(expect.arrayContaining(['Bug', 'Dark']));
    expect(immunities(['Fighting', 'Flying'])).toEqual(['Ground']);
  });
});
