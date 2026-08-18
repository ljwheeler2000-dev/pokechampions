# pokechampions

Damage calculator engine for **Pokémon Champions**. TypeScript, zero runtime dependencies.

Champions replaces mainline EVs/IVs with **SP (Stat Points)**, so a generic damage calculator
silently computes the wrong stats. This library implements the Champions stat formulas, the
game's damage formula with its exact rounding behaviour, and a breakpoint scanner for finding
the cheapest bulk investment that survives a given hit.

Engine only — no UI.

## Install

```bash
npm install
npm test
npm run build
```

## Champions stat rules

- 66 SP total per Pokémon, max 32 SP in any one stat.
- IVs do not exist — every Pokémon is effectively 31 in every stat.
- `HP = Base + 75 + SP`
- `Other = floor((Base + 20 + SP) × Nature)` — nature applies **after** SP, not before.

All four formulas are covered by tests pinned to values read off the live Champions calc.

## Quick start

```ts
import { calculateDamage, computeStats, DEX } from 'pokechampions';

const rotom = {
  species: DEX['Rotom-Wash'],
  nature: 'Timid',
  sp: { hp: 24, spa: 32, spe: 10 },
};

const staraptor = {
  species: DEX['Staraptor-Mega'],
  nature: 'Hardy',
  sp: { atk: 32, hp: 32, spd: 2 },
};

computeStats(rotom);
// { hp: 149, atk: 76, def: 127, spa: 157, spd: 127, spe: 127 }

const result = calculateDamage(
  rotom,
  staraptor,
  { name: 'Discharge', type: 'Electric', category: 'Special', basePower: 80, spread: true },
  { gameType: 'Doubles' },
);

result.description;  // "50 - 59.4% -- guaranteed 2HKO"
result.damage;       // all 16 rolls
result.ohkoChance;   // 0
```

## Breakpoints

Damage does not fall smoothly as Defense rises — the formula floors at several points, so it
drops in discrete steps. `findBreakpoints` locates those cliffs so investment lands on one
instead of being wasted between them.

```ts
import { findBreakpoints, findSurvivalSP } from 'pokechampions';

// Raw scan, mirroring the damage-rounding calculator.
findBreakpoints({
  attackStat: 157,
  basePower: 80,
  defMin: 90,
  defMax: 140,
  spread: true,
  stab: true,
  typeEffectiveness: 2,
});
// [{ def: 91, maxDamageDrop: 2, ... }, { def: 94, maxDamageDrop: 4, ... }, ...]

// Set-based: cheapest SP investment that survives a specific attack.
const { spToGuaranteedSurvival, budgetWarning } = findSurvivalSP(attacker, defender, move);
```

`findSurvivalSP` also reports `spToPossibleSurvival` (survives at least one roll) and warns
when the required investment would bust the 66 SP budget.

## What the engine models

**Stats** — Champions SP formulas, natures, stat stages (−6..+6), SP budget validation,
minimum-investment helpers.

**Damage** — base damage, the 16 rolls, spread-move ×0.75 in Doubles, weather, crits
(ignoring defender boosts and screens), STAB and Adaptability, type effectiveness,
burn, and the chained final modifier stack: Reflect / Light Screen / Aurora Veil,
Multiscale, Friend Guard, Filter / Solid Rock / Prism Armor, Life Orb, Tinted Lens,
Neuroforce, resist berries. Items: Choice Band/Specs/Scarf, Life Orb, Assault Vest, Eviolite.

Modifiers are chained in 4096ths and applied with the game's round-half-down rule, which is
what makes the breakpoints appear in the first place.

**Types** — full 18×18 chart with combined dual-type multipliers, plus `defensiveProfile`,
`weaknesses`, `resistances` and `immunities` for team-level coverage checks.

## Species data

`src/dex.ts` is deliberately small. Champions has original Mega Evolutions whose stats,
typings and abilities do **not** match mainline — Staraptor-Mega is Fighting/Flying with
Contrary — so entries are only added once confirmed against the live Champions calc.
Each entry records which stats are confirmed; `unconfirmedStats()` reports the rest.

The engine takes `Species` objects as input, so you can pass your own without editing the dex:

```ts
import { defineSpecies } from 'pokechampions';

const mon = defineSpecies('Whatever', ['Water', 'Ghost'],
  { hp: 90, atk: 100, def: 90, spa: 120, spd: 90, spe: 95 }, 'Water Absorb');
```

## Reference

- Champions calc: https://calc.pokemonshowdown.com/champions.html (Champions mode, level 50, Doubles)
- Rounding/breakpoint calc: https://jenkinsvgc.github.io/damage-rounding-calc/

## Tests

66 tests across stats, type chart, damage and breakpoints. The stat tests are pinned to
values verified against the live calc; the damage and breakpoint tests assert structural
invariants (monotonicity, roll ordering, modifier direction, minimum 1 damage).

```bash
npm test
npm run typecheck
```
