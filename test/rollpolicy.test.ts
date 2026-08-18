import { describe, expect, it } from 'vitest';
import { rollForSide, simulateTurn, type TurnField } from '../src/sim/turn.js';
import type { ChampionsSet } from '../src/champions/adapter.js';

const field: TurnField = { weather: '', terrain: '', trickRoom: false, sideA: {}, sideB: {} };

const rotom: ChampionsSet = {
  species: 'Rotom-Wash', label: 'Rotom-Wash', nature: 'Timid',
  sp: { spa: 32, spe: 32, hp: 2 }, ability: 'Levitate', item: 'Choice Scarf',
};
const sceptile: ChampionsSet = {
  species: 'Sceptile-Mega', label: 'Mega Sceptile', nature: 'Timid',
  sp: { spa: 32, spe: 32, hp: 2 }, ability: 'Lightning Rod',
};
const charY: ChampionsSet = {
  species: 'Charizard-Mega-Y', label: 'Charizard-Y', nature: 'Modest',
  sp: { hp: 32, spd: 24, spa: 10 }, ability: 'Drought',
};
const gambit: ChampionsSet = {
  species: 'Kingambit', label: 'Kingambit', nature: 'Adamant',
  sp: { hp: 32, atk: 32, def: 2 }, ability: 'Defiant',
};

const attackBoth = [
  { slot: 'A1' as const, move: 'Discharge' },
  { slot: 'B2' as const, move: 'Iron Head', target: 'A1' as const },
];
const teams = { A1: rotom, A2: sceptile, B1: charY, B2: gambit };

describe('rollForSide', () => {
  it('gives us the minimum and them the maximum under pessimistic', () => {
    expect(rollForSide('pessimistic', 'A')).toBe('min');
    expect(rollForSide('pessimistic', 'B')).toBe('max');
  });

  it('passes fixed policies through unchanged for both sides', () => {
    for (const p of ['min', 'avg', 'max'] as const) {
      expect(rollForSide(p, 'A')).toBe(p);
      expect(rollForSide(p, 'B')).toBe(p);
    }
  });
});

describe('roll policy in a turn', () => {
  it('is pessimistic by default', () => {
    const r = simulateTurn(teams, attackBoth, field);
    expect(r.policy).toBe('pessimistic');
    const ours = r.events.find((e) => e.actor === 'A1')!.targets.find((t) => t.slot === 'B1')!;
    const theirs = r.events.find((e) => e.actor === 'B2')!.targets.find((t) => t.slot === 'A1')!;
    expect(ours.rollUsed).toBe('min');
    expect(ours.applied).toBe(ours.minDamage);
    expect(theirs.rollUsed).toBe('max');
    expect(theirs.applied).toBe(theirs.maxDamage);
  });

  it('never flatters us relative to any fixed policy', () => {
    const pess = simulateTurn(teams, attackBoth, field, 'pessimistic');
    for (const p of ['min', 'avg', 'max'] as const) {
      const fixed = simulateTurn(teams, attackBoth, field, p);
      // our Pokemon is never healthier under pessimistic...
      expect(pess.final.A1.hp).toBeLessThanOrEqual(fixed.final.A1.hp);
      // ...and their Pokemon is never more hurt
      expect(pess.final.B1.hp).toBeGreaterThanOrEqual(fixed.final.B1.hp);
    }
  });

  it('forces a single roll on both sides when a fixed policy is given', () => {
    for (const p of ['min', 'max'] as const) {
      const r = simulateTurn(teams, attackBoth, field, p);
      for (const e of r.events) {
        for (const t of e.targets) if (t.outcome === 'damage') expect(t.rollUsed).toBe(p);
      }
    }
  });

  it('reports the full range regardless of which roll was applied', () => {
    const r = simulateTurn(teams, attackBoth, field);
    const hit = r.events[0]!.targets.find((t) => t.outcome === 'damage')!;
    expect(hit.minDamage!).toBeLessThanOrEqual(hit.maxDamage!);
    expect(hit.applied!).toBeGreaterThanOrEqual(hit.minDamage!);
    expect(hit.applied!).toBeLessThanOrEqual(hit.maxDamage!);
  });
});
