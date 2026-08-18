/**
 * Independent cross-check.
 *
 * src/damage.ts + src/stats.ts hold a from-scratch Champions damage engine written before
 * @smogon/calc was adopted, pinned to stat lines verified against the live
 * Champions calc. It is kept because it is a genuinely independent implementation:
 * if the SP->shifted-base-stat adapter were wrong, these two would disagree.
 */
import { describe, expect, it } from 'vitest';
import { Pokemon, calculate, Field, Move } from '@smogon/calc';
import { GEN, baseStatsOf, statsOf, toCalcPokemon, type ChampionsSet } from '../src/champions/adapter.js';
import { calculateDamage } from '../src/damage.js';
import { championsStats } from '../src/champions/sp.js';
import type { PokemonSet } from '../src/types.js';

function legacySet(set: ChampionsSet): PokemonSet {
  const b = baseStatsOf(set.species);
  return {
    species: {
      name: set.species,
      types: new Pokemon(GEN, set.species, { level: 50 }).types as never,
      baseStats: b,
    },
    nature: set.nature as never,
    sp: set.sp,
    item: set.item,
    ability: set.ability,
  };
}

const CASES: Array<{ atk: ChampionsSet; def: ChampionsSet; move: string; spread: boolean }> = [
  {
    atk: { species: 'Rotom-Wash', nature: 'Timid', sp: { hp: 24, spa: 32, spe: 10 } },
    def: { species: 'Staraptor-Mega', nature: 'Hardy', sp: { atk: 32, hp: 32, spd: 2 } },
    move: 'Discharge', spread: true,
  },
  {
    atk: { species: 'Sceptile-Mega', nature: 'Timid', sp: { spa: 32, spe: 32, hp: 2 } },
    def: { species: 'Kingambit', nature: 'Adamant', sp: { hp: 32, def: 32, atk: 2 } },
    move: 'Dragon Pulse', spread: false,
  },
  {
    atk: { species: 'Kingambit', nature: 'Adamant', sp: { atk: 32, hp: 32, def: 2 } },
    def: { species: 'Sceptile-Mega', nature: 'Timid', sp: { spa: 32, spe: 32, hp: 2 } },
    move: 'Iron Head', spread: false,
  },
];

describe('legacy engine vs @smogon/calc through the SP adapter', () => {
  it.each(CASES)('$move agrees on every roll', ({ atk, def, move, spread }) => {
    const smogon = calculate(
      GEN, toCalcPokemon(atk), toCalcPokemon(def),
      spread ? new Move(GEN, move) : new Move(GEN, move, { overrides: { target: 'normal' } } as never),
      new Field({ gameType: 'Doubles' } as never),
    );
    const md = new Move(GEN, move);
    const legacy = calculateDamage(
      legacySet(atk), legacySet(def),
      { name: move, type: md.type as never, category: md.category as never, basePower: md.bp, spread },
      { gameType: 'Doubles' },
    );
    expect(legacy.damage).toEqual([...(smogon.damage as number[])]);
  });

  it('both engines derive the same stat line', () => {
    const set: ChampionsSet = { species: 'Rotom-Wash', nature: 'Timid', sp: { hp: 24, spa: 32, spe: 10 } };
    const viaAdapter = toCalcPokemon(set).stats;
    const viaFormula = statsOf(set);
    const viaLegacy = championsStats(baseStatsOf(set.species), set.sp, set.nature);
    expect(viaFormula).toEqual(viaLegacy);
    expect({ ...viaAdapter }).toEqual(viaFormula);
  });
});
