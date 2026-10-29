# Damage Rounding Calculator — How It Works

Source: https://jenkinsvgc.github.io/damage-rounding-calc/ (repo: github.com/JenkinsVGC/damage-rounding-calc)

## What problem it solves
Finds "breakpoints" in defensive stats — specific Defense/Sp. Def values where, because of how the game's damage formula rounds at each step, a small amount of extra bulk investment causes a disproportionately large drop in incoming damage. Instead of guessing at EV spreads or maxing a stat, this tool tells you the minimum Defense stat needed to hit a favorable rounding cliff against a specific attack.

## Core math it's built on
The game's base damage formula (which this tool implements) is:
`floor(floor(22 * Atk * Power, Def), 50) + 2`
— i.e. attack and power multiply, then integer-divide by the target's Defense stat (with flooring/rounding at each step), divide by 50 and floor again, then +2. Because of this repeated flooring, damage output isn't smooth as Defense increases — it drops in discrete steps ("breakpoints"). The tool also implements the game's "round-half-down" tie-breaking rule for these divisions (when a division lands exactly on .5, it rounds down if the floored result is odd).

## Modifier stack (applied in this exact order — matters for the math)
1. Spread move — x0.75 (¾) — the doubles/VGC multi-target penalty
2. Parental Bond (2nd hit) — x0.25 (¼)
3. Weather — x1.5 boost or x0.5 reduce
4. Critical hit — x1.5
5. STAB — x1.5
6. Type effectiveness — x0.25, x0.5, x2, or x4
7. Burn (physical attacker) — x0.5
8. Light Screen / Reflect — x0.667 (⅔)
9. Multiscale (defender, undamaged) — x0.5
10. Friend Guard — x0.75
11. Filter / Solid Rock (defender ability) — x0.75
12. Life Orb (attacker item) — x1.3
13. Resist Berry (defender, type-resisted hit) — x0.5

## Inputs (UI)
- **Modifier stack**: build an ordered "active stack" by picking from the modifier list above — it's applied in the fixed order shown, not the order you click them.
- **Specific hit (optional)**: Atk stat, Move power, and a Defense range (Def min – Def max) to scan across.
- Click **Calculate** to run it.

## Output
A "multiplier chain" showing, across the Def min–max range you gave it, exactly which Defense values produce a meaningfully lower final damage number due to rounding — i.e. the specific bulk breakpoints worth EV-investing into, rather than wasting EVs on values that don't cross a rounding cliff.

## Practical use (ties into this project's Step 6 — Find the Details)
Since we build almost exclusively for **doubles/Champions**, the Spread Move modifier (x0.75) is relevant by default whenever checking spread-move matchups. Workflow:
1. Identify the threat (attacker, move, power) from the meta report or your own team's matchups.
2. Plug in that Atk stat/move power against your intended defender's Def/SpDef range.
3. Use the tool to find the minimum bulk breakpoint that meaningfully survives the hit, rather than over-investing EVs.
4. Cross-check the resulting spread in the main damage calculator (calc.pokemonshowdown.com — see claude/damage-calculator-guide.md) to confirm the full-context damage roll and KO odds.
