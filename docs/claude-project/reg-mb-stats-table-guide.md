# Reg M-B Interactive Stats & Rating Table — Methodology Guide

This documents the self-contained HTML tool (built and delivered to the owner, not stored in the
project) that ranks every Champions Reg M-B roster-legal Pokemon on usage, win rate, and raw
stats. Keep this guide current so a future session can rebuild or extend the table without
re-deriving the formulas from scratch.

## Scope

Covers all 223 species parsed from the "Normally Available" list in `claude/champions-roster.md`
(note: that doc's header says 208 — the discrepancy was never reconciled; the 223-count parse is
being treated as a safe superset). Base and every Mega form of a species are scored as fully
separate rows — per explicit instruction, a base Pokemon and its Mega(s) are judged
independently, never folded together (e.g. Charizard, Charizard-Mega-X, and Charizard-Mega-Y are
three distinct rows).

## Data sources

- **Usage% / Win%**: ShowdownTier Reg M-B tracker (Aug 5–19 2026, 163,810 games) — only tracks
  92 of the 223 roster species.
- **Base stats**: PokemonDB gen1–gen9 stat pages.
- **Mega stats**: this format includes custom Mega Evolutions for species that don't have one in
  mainline games (e.g. Raichu, Delphox, Meganium, Sceptile) — these are NOT real Pokedex data,
  they're specific to this Champions ruleset and were transcribed from earlier bulk fetches in
  the building session.

## Handling the 131 untracked species

Species not in ShowdownTier's 92-species tracker (e.g. Torterra) get a neutral placeholder:
**usage = 0%, win = 50%**, tagged `untracked` in the UI (visually distinct from the `split usage`
tag used for Mega-ambiguity — see below). This lets every roster-legal species still receive a
computed Rating, driven by its stats rather than fabricated usage evidence.

**Important**: the Rating formula's usage/win population statistics (mean and standard
deviation) are computed only from the 92 real-tracked species, excluding the 131 placeholder
rows. Including 161 identical 0%/50% rows would badly skew "average usage" and "win spread" and
make the Rating meaningless for species with real data. Best Score's population stats (mean/sd)
ARE computed across all rows including untracked ones, since Best Score is purely stat-derived
and has nothing to do with tracked-ness.

## Mega disambiguation policy

- Where the project's meta report (`claude/meta-report-reg-mb-week8.md`) explicitly named which
  Mega is actually played (Charizard-Y, Staraptor, Delphox, Venusaur, Froslass, Tyranitar), only
  that confirmed form carries real usage/win data; its alternates move to a reference-only table
  with no usage data.
- Everywhere else, Base and every Mega variant share the same tracked usage/win as parallel rows
  (ShowdownTier doesn't split usage by form), tagged `split usage`.
- Megas attach only to a species' plain/default-form roster entry, never to its regional variants
  — e.g. Mega Slowbro applies to "Slowbro", not "Slowbro (Galarian)" — since a regional form is a
  genuinely different Pokemon from the one the Mega historically belongs to. This was a bug found
  and fixed during the full-roster expansion.
- Basculegion: only the Male form is used (99% of real usage per the owner's instruction) — no
  separate Female row.

## Computed columns / formulas

- **BST** = HP+Atk+Def+SpA+SpD+Spe.
- **Best Atk** = max(Atk, SpA), tagged Phys/Spec — sortable regardless of category.
- **Phys Bulk** = HP × Def. **Spec Bulk** = HP × SpD.
- **Bulk** = √(Phys Bulk × Spec Bulk) ÷ 100 — geometric mean penalizes lopsided defensive
  spreads rather than rewarding raw totals.
- **Best Score** = ∛(Best Atk × Bulk × Speed) for Normal conditions; ∛(Best Atk × Bulk ×
  (200 − Speed)) for Trick Room (200 = Regieleki's base Speed, used as a fixed ceiling). Higher
  of the two is used and tagged Normal/TR.
- **Rating** = weighted z-score composite: Win% 38%, Best Score 33%, Usage% 29%, plus a
  Win×Usage synergy term (0.35 × zWin × zUsage) that rewards a win rate earned at high usage
  more than the same win rate at low usage. Win%'s z-score is measured from a fixed 50% (not the
  field average); Usage% and Best Score are measured from the table's own average (real-tracked
  species only, see above).

## UI tags

- `Mega` (gold) — confirmed by the meta report.
- `unconfirmed` (red) — a Mega/alt form exists but the source doesn't say which is played.
- `split usage` (red) — Base/Mega share identical usage/win, not independently split.
- `untracked` (blue-grey) — not in ShowdownTier's 92; usage/win are 0%/50% placeholders.

## Related project docs

- `claude/champions-roster.md` — the roster list this table's scope is drawn from.
- `claude/meta-report-reg-mb-week8.md` — source for confirmed-Mega disambiguation.
- `claude/teambuilding-methodology.md` — the broader 7-step teambuilding process this table
  supports (mainly steps 1–2, "know your format" / "have an idea").
