# Team Build: Mega Sceptile + Rotom-Wash Discharge (Lightning Rod core)

Built via the 7-step methodology (claude/teambuilding-methodology.md), Reg M-B doubles.
**Rewritten in SP terms** — the earlier version of this doc used mainline EV language
("252 HP / 252 Spe / 4 SpA"), which cannot exist in Champions. Every spread below is a
legal 66 SP / 32-per-stat allocation.

Numbers marked **verified** were computed with the pokechampions turn simulator
(github.com/ljwheeler2000-dev/pokechampions), which runs @smogon/calc through a
Champions SP adapter. Unless stated otherwise they are **worst case**: our attacks roll
minimum, theirs roll maximum.

## Concept

Mega Sceptile's ability becomes **Lightning Rod** on mega evolving — immune to Electric,
+1 SpA every time it is hit by an Electric move, including from allies. Rotom-Wash's
**Discharge** is a 100%-accurate spread Electric move. Firing it boosts Sceptile for free
while chipping both opponents. Mega Sceptile's real movesets are all single-target
(Dragon Pulse near-universal, Energy Ball / Leaf Storm / Grass Knot, Earth Power) — it is
a single-target sweeper riding Discharge's boost, not a second AoE source.

## The SP reality that changes the plan

**Champions gives 66 SP total, 32 max per stat.** That is far less freedom than 508 EVs.
You cannot max two stats and still have meaningful investment elsewhere: 32 + 32 already
consumes 64 of 66.

**Verified speed numbers** (level 50, Champions formulas):

| Set | Speed |
|---|---|
| Mega Sceptile, Timid, 32 Spe SP | **216** |
| Rotom-Wash, Timid, 32 Spe SP, Choice Scarf | **226** |
| Rotom-Wash, Timid, 10 Spe SP, Choice Scarf | 190 |
| Garchomp, Jolly, 32 Spe SP | 169 |
| Staraptor-Mega, Jolly, 32 Spe SP | 145 |
| Kingambit, Adamant, 0 Spe SP | 70 |

**The order problem.** The previous version of this doc targeted 190 Speed on Rotom. But
Mega Sceptile sits at 216, so a 190 Rotom **moves second** — Sceptile attacks before
Discharge fires and gets no Lightning Rod boost that turn. To have the boost land first,
Rotom needs the full 32 Speed SP *and* a Choice Scarf to reach 226. That costs the entire
per-stat cap on Speed and leaves 34 SP for everything else.

The alternative is to accept the boost arriving a turn late, or to drop Sceptile's Speed
investment — which surrenders its main advantage over the field.

## Confirmed roster (5 of 6 locked)

1. **Rotom-Wash** — Discharge engine. Levitate (Ground immunity). Only real weakness is
   Grass (2x). Suggested spread: **32 SpA / 32 Spe / 2 HP, Timid, Choice Scarf** = 226 Speed,
   157 SpA, 127 HP. Note Lightning Rod also blocks Electric-based paralysis aimed at Sceptile
   (Thunder Wave, Nuzzle, Electroweb) but **not** Icy Wind (Ice) or Glare (Normal).
2. **Mega Sceptile** — the payoff attacker. Grass/Dragon: resists Water/Grass/Ground, but
   **4x weak to Ice** and 2x weak to Poison/Flying/Bug/Dragon/Fairy. Suggested spread:
   **32 SpA / 32 Spe / 2 HP, Timid** = 216 Speed, 165 SpA, 147 HP.
3. **Kingambit** (S-tier) — resists Ice/Dragon. **Fairy is neutral, not resisted** (verified:
   Fairy hits Dark 2x and Steel 0.5x, netting 1x). Weak to Fighting (4x), Fire, Ground.
4. **Incineroar** — checks Ice by resisting it (0.5x), which does not remove Sceptile's 4x
   weakness. Its value is non-typing: Intimidate, Fake Out, U-turn.
5. **Farigiraf** — Thunderbolt triggers Lightning Rod with **zero friendly fire** (single
   target), and Farigiraf is already the meta's #1 Thunderbolt user. Armor Tail blocks
   priority. Trick Room support. Psychic is 4x on Sneasler (Fighting/Poison) — but Farigiraf
   is base 60 Speed, so that counter leans on Trick Room or eating a hit first.

**Open: the 6th slot.** Klefki (Steel/Fairy — Dragon immune, Fairy resist, minimal new
liabilities) vs Gholdengo (stacks Ground weakness, adds Ghost/Dark). Also still **no Wide
Guard user** anywhere on the team, which matters against the rain and spread-heavy builds
the meta report flags.

## Verified turn results

Rotom (226, Discharge) + Mega Sceptile (Dragon Pulse), worst-case rolls, opponent paired
with Kingambit. **Opposing SP spreads are assumptions, not scouted data.**

| Target | Result | Detail |
|---|---|---|
| Garchomp | **KO** | Discharge does 0 (Ground immunity); boosted Dragon Pulse alone does 215 min |
| Basculegion | **KO** | Discharge 114 + Dragon Pulse 113 |
| Staraptor-Mega | **KO** | Discharge 98 + Dragon Pulse 94 |
| Charizard-Mega-Y | **survives at ~16%** | Discharge 66 + Dragon Pulse 90; KOs only on good rolls |
| Sylveon | **survives at ~87%** | Dragon Pulse is a **Fairy immunity — literally 0**; Discharge does 27 |

Three corrections to the earlier analysis:

- **Garchomp is now a clean KO**, not a coin flip. The doc estimated Dragon Pulse at
  98–117%; with the Lightning Rod boost applied first it is 125–148%. The core fixes this
  matchup — provided Rotom moves first.
- **Charizard-Y is not a guaranteed KO.** It dies on max rolls but survives at 16% on
  minimum rolls. Treat it as a favourable race, not a removal.
- **Sylveon is a hard wall.** Dragon Pulse does nothing at all — Dragon into Fairy is an
  immunity, not a bad matchup. The core has no answer without different coverage. This is
  the most serious gap on the team.

## Known weaknesses and overlaps

- **Ice** — Sceptile's 4x weakness is the defining liability. Verified: Mega Sceptile
  **cannot survive a max-investment Staraptor-Mega Brave Bird even at full defensive SP**
  (266 damage vs 177 max HP). Some hits simply cannot be tuned around.
- **Fighting overlap** — Kingambit (4x) and Incineroar (2x). Farigiraf's Psychic answers
  Sneasler at 4x; Mega Staraptor is Normal/Flying so Psychic is only neutral there.
- **Ground overlap** — Kingambit + Incineroar. Rotom (Levitate) and Sceptile (resist) are fine.
- **Discharge friendly fire** — verified: Kingambit, Incineroar and Farigiraf all take
  **neutral** damage. Steel does **not** resist Electric, a common misconception. Farigiraf's
  Thunderbolt sidesteps this entirely.

## Step 6/7 handoff

1. Decide the 6th slot: Klefki vs Gholdengo vs a Wide Guard user.
2. Resolve the Speed tension: pay 32 SP + Scarf for a 226 Rotom, or accept the boost
   landing a turn late.
3. Find an answer to Sylveon — currently the team's cleanest loss.
4. Playtest once 6 is locked.

## Tooling

The pokechampions app covers steps 5–6 directly: turn simulator (2v2 with redirection and
Lightning Rod), SP tuner (cheapest legal spread that survives a threat list), speed tiers,
and a team builder with coverage and roster-legality checks.
