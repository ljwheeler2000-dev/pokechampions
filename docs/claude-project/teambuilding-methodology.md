# Systematic Teambuilding Approach (Champions Reg M-C)

**Standing project preference: we build for Champions doubles, always.** Default to doubles
assumptions — spread moves, redirection (Follow Me / Rage Powder / Lightning Rod), Intimidate,
priority denial (Quick Guard / Armor Tail), Tailwind, Trick Room, Wide Guard and Protect matter far
more here than in singles.

**Everything below is in SP, not EVs.** Champions replaces EVs and IVs entirely: **66 SP total per
Pokémon, maximum 32 in any one stat, no IVs** (every Pokémon is effectively 31 IVs in every stat).

Source: "The Systematic Approach to Teambuilding" (Zero to Hero) —
https://www.youtube.com/watch?v=YN718-hqrxw. The creator demonstrated it on a Regulation H team;
the seven steps are format-agnostic.

## The Seven Steps

### 1. Know Your Format
- What format am I building for?
- What Pokémon, archetypes and teams are strong right now?

### 2. Have an Idea
- What can I use that is strong in the meta?
- What can I use to counter this meta?
- What specific Pokémon do I want to use, if any?

### 3. The Core
- What is my core (usually 2-3 Pokémon)?
- What is the game plan, and what archetype is it?
- What are its weaknesses?

### 4. Fill Out the Core
- What offensive synergy benefits my core?
- What defensive synergy benefits my core?

### 5. Consider Weaknesses and Expand
- What supportive options benefit my core?
- How much speed control do I have?
- Which meta matchups give me trouble?
- What could be added to improve matchups or internal synergy?

### 6. Find the Details
- What movesets and items?
- **What SP allocation?** Within 66 total and 32 per stat: which bulk breakpoints survive the
  specific threats I expect, and which Speed number do I actually need?

### 7. Playtest and Adjust — the most important step
- What have I not brought in a long time?
- What am I losing to most?
- What moves, items or abilities are not working?
- What has been working well?

## SP ↔ EV conversion (verified, exact)

**Correction to an earlier version of this doc**, which claimed a spread written in EV terms such
as 252/252/4 "is not expressible in this format." It is. The two systems map onto each other
exactly:

> **SP = ceil(EV / 8)**

Verified against every legal EV value (0–252 in steps of 4) across base stats 40–150, for both HP
and non-HP stats: **zero mismatches**. The reason is structural — mainline at level 50 with 31 IVs
gives `Base + 20` at 0 EVs, which is exactly Champions' `Base + 20 + 0 SP`, and 252 EVs adds
precisely 32 stat points, which is exactly Champions' 32 SP cap.

| Mainline | Champions |
|---|---|
| 252 EVs (per-stat cap) | **32 SP** (per-stat cap) — identical |
| 244 EVs | 31 SP |
| 228 EVs | 29 SP |
| 124 EVs | 16 SP |
| 36 EVs | 5 SP |
| 4 EVs | 1 SP |
| **508 EV budget** | **66 SP budget** |
| 252 / 252 / 4 | 32 / 32 / 1 = **65 SP — fits, with 1 SP spare** |

**So Champions is marginally *more* generous than the mainline EV budget, not less**, and the
familiar two-stat-max shape ports over directly. What genuinely does not port is IV manipulation:
there is no 0-Speed-IV trick for Trick Room, and no Hidden Power tuning.

This matters practically: **any published VGC spread can be ported to Champions** by dividing each
value by 8 and rounding up. Worked example in claude/salamence-movepool.md (the 2019 World
Championship Salamence ports to 5 HP / 31 SpD / 29 Spe and reproduces all six stats exactly).

## Champions-specific notes for step 6

**SP is scarce.** With 66 points you are usually choosing two priorities, not four. Decide Speed
first (it is binary — you either outrun the benchmark or you do not), then spend what remains on
whichever of bulk or power the team actually needs.

**Speed is a hard ordering, not a stat race.** Measure opponents at their realistic ceiling: max SP
with a positive nature. If you beat that number you beat the spread they ran. Then check separately
whether a Choice Scarf flips it.

**Let the ability cover one defensive side and the SP cover the other.** Intimidate already halves
incoming physical damage, so investing SP into Defense on an Intimidate body often double-pays for
the same protection. The 2019 Worlds Salamence is the canonical example — Intimidate handled the
physical side and 244 SpD handled the special side, with Defense as the deliberate dump stat.

**Watch intra-team speed order.** In doubles, which of *your own* Pokémon moves first can decide
whether a support effect lands before or after the attacker it is meant to help. A Helping Hand
from a slower partner arrives after the attacker has already swung — Prankster fixes this,
raw Speed usually cannot.

**Tune against worst case.** A spread that survives on the maximum roll and dies on the minimum has
not survived. Assume your attacks roll low and theirs roll high; a plan that holds under that
assumption holds in practice.

## Project references

- claude/champions-roster.md — confirm every Pokémon is in the current roster (M-C, live to 2026-12-01)
- claude/meta-report-reg-mb-week8.md — steps 1 and 5
- claude/type-chart.md — steps 3-5
- claude/damage-calculator-guide.md — SP stat formulas, verified against the live calc
- claude/damage-rounding-calc-guide.md — bulk breakpoints for step 6
- github.com/ljwheeler2000-dev/pokechampions — turn simulator, SP tuner, speed tiers and team
  builder, all in SP and defaulting to worst-case rolls
