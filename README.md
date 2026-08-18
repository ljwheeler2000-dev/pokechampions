# pokechampions

Team-building tools for **Pokemon Champions** doubles (Regulation M-B).

Champions replaces mainline EVs/IVs with **SP** - 66 points per Pokemon, 32 max in
any one stat, no IVs - so a generic calculator silently computes the wrong stats.
This project puts a Champions SP layer over Smogon's damage engine and adds the
doubles-specific tooling a generic calculator does not have.

Status: complete and working. Turn simulator, SP tuner, team builder and speed tiers,
with 127 tests.

```bash
npm install
npm run dev
```

## The app

**Turn simulator** - four slots, per-slot move and target, the full field toggle set, and an
event log naming which roll was applied to each hit. Defaults to worst case: your attacks
roll minimum, theirs roll maximum, because a plan that survives that survives in practice.

**SP tuner** - give it a threat list and it finds the cheapest legal HP/Def/SpD investment
that survives all of them, treating whatever you put into Speed and offence as committed.
When nothing works it says which threat is unsurvivable and by how much, rather than
returning a spread that quietly fails. Also solves the cheapest offence for a guaranteed KO,
judged on the minimum roll.

**Team builder** - six slots with live SP legality, a defensive coverage matrix, shared
weaknesses, types nothing resists, the Reg M-B S-tier as a matchup checklist, and the
seven-step framework as a checklist. Teams persist locally.

**Speed tiers** - the whole roster at 0 SP, max neutral, max positive nature and with a
Scarf, with your set placed in the order. Opponents are measured at their ceiling, and a
clean win is separated from one a Choice Scarf would flip.

## Why @smogon/calc

`@smogon/calc` already ships the Champions dataset - 208 roster species, 99 Mega
forms including the Champions-original ones, 942 moves with target flags, plus
items and abilities. Spot-checked against the live calc: `Staraptor-Mega` reads
Fighting/Flying 85/140/100/60/90/110 and `Sceptile-Mega` has Lightning Rod with
base 145 Speed. No hand-maintained dex, and every ability/item/field interaction
comes from a maintained engine rather than being reimplemented.

## The SP adapter

The mapping is exact, not a fit. At level 50 with 31 IVs and 0 EVs the standard
formula reduces to `Base + 75` (HP) and `Base + 20` (everything else) - which is
the Champions formula minus the SP term:

```
HP    = Base + 75 + SP
Other = floor((Base + 20 + SP) x Nature)     <- nature applies AFTER SP
```

So shifting a species' base stats by its SP investment reproduces Champions stats
through Smogon's own math. The Champions nature multiplier is baked into the shift
and Smogon's nature is left neutral, so it is applied exactly once and in the right
order. The shift survives Smogon's internal `clone()` because clone passes the
species override through.

`test/crosscheck.test.ts` holds this honest: a from-scratch Champions engine
(`src/damage.ts`, written before the adapter existed and pinned to calc-verified
stat lines) must agree with `@smogon/calc` on every one of the 16 damage rolls.

## Roster legality

Only Regular Roster M-B Pokemon can be picked - the species search offers nothing else, so
an illegal pick is impossible rather than merely flagged. That matters because the Smogon
dex carries 22 Megas that are not legal here. Rotom appliance forms, cap Pikachu exclusions,
Battle Bond Greninja and transfer-only Floette-Eternal are all handled.

## What's under the UI

**`src/champions/sp.ts`** - SP budget and validation (66 total / 32 per stat),
nature table, Champions stat formulas, minimum-investment helpers.

**`src/champions/adapter.ts`** - the SP-to-shifted-base-stat adapter, dex lookups,
and effective Speed including Choice Scarf, weather abilities, Tailwind, paralysis
and stat stages.

**`src/champions/roster.ts`** - the Reg M-B roster and legality rules.

**`src/champions/coverage.ts`** - type chart and team-level defensive coverage.

**`src/tune/sp.ts`** - the defensive and offensive SP solvers.

**`src/tune/speed.ts`** - speed tiers and target-speed investment.

**`src/sim/turn.ts`** - one full doubles turn:

- speed and priority order, with Trick Room reversal and Tailwind
- spread targeting (`allAdjacent` hits your ally too; `allAdjacentFoes` does not)
- the 0.75 spread reduction applied only when the move really hits more than one
- redirection: Lightning Rod, Storm Drain, Follow Me, Rage Powder
- absorbing abilities with their effects - Lightning Rod's +1 SpA, Motor Drive,
  Sap Sipper, Volt/Water Absorb, Flash Fire, Earth Eater, Well-Baked Body
- friendly fire, Protect, immunities, and KOs removing a Pokemon from the turn
- per-slot HP and boosts after the turn, plus a readable event log

Effects created earlier in the turn are visible to later actions, so a Lightning
Rod boost banked by a fast ally actually raises the damage of the slower attacker.

## Usage from code

```ts
import { simulateTurn } from './src/sim/turn.js';

const rotom = {
  species: 'Rotom-Wash', label: 'Rotom-Wash', nature: 'Timid',
  sp: { spa: 32, spe: 32, hp: 2 }, ability: 'Levitate', item: 'Choice Scarf',
};
const sceptile = {
  species: 'Sceptile-Mega', label: 'Mega Sceptile', nature: 'Timid',
  sp: { spa: 32, spe: 32, hp: 2 }, ability: 'Lightning Rod',
};

const result = simulateTurn(
  { A1: rotom, A2: sceptile, B1: charizardY, B2: kingambit },
  [
    { slot: 'A1', move: 'Discharge' },
    { slot: 'A2', move: 'Dragon Pulse', target: 'B1' },
  ],
  { weather: '', terrain: '', trickRoom: false, sideA: {}, sideB: {} },
);

result.order;   // ['A1', 'A2'] - Rotom at 226 moves before Sceptile at 216
result.events;  // per-action log incl. the Lightning Rod absorb
result.final;   // HP and boosts on all four slots after the turn
```

## Speed note

Mega Sceptile at max Speed SP is **216**. Rotom-Wash needs the full 32 Speed SP
*and* a Choice Scarf to reach **226** and move first - at 10 Speed SP + Scarf it
sits at 190 and moves second, so a Discharge fired for the Lightning Rod boost
lands after Sceptile has already attacked. The simulator reports the order, so
this is checkable rather than assumed.

## Development

```bash
npm install
npm run dev        # app on localhost:5173
npm test           # 127 tests
npm run typecheck
npm run build
```

`src/damage.ts`, `src/stats.ts`, `src/typechart.ts`, `src/breakpoints.ts` and
`src/dex.ts` are the earlier standalone engine. They are kept deliberately as the
independent half of the cross-check, not as dead code.

## Caveats worth keeping in mind

- Opposing SP spreads are assumptions, not scouted data. Directions are sound;
  exact percentages are provisional.
- The roster snapshot expires 2026-09-02. Re-check Bulbapedia after that.
- "Best outcome for them" currently means the maximum damage roll. It does not yet
  assume they crit or that secondary effects land.

## Reference

- Champions calc: https://calc.pokemonshowdown.com/champions.html (Champions mode, level 50, Doubles)
- Roster (rotates): https://bulbapedia.bulbagarden.net/wiki/List_of_Pokemon_in_Pokemon_Champions
