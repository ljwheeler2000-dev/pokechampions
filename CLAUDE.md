# CLAUDE.md — pokechampions

## Goal
Team-building tools and strategy notes for Pokemon Champions doubles: an SP-aware damage calculator, turn simulator, SP tuner, team builder and speed tiers, plus documented teams and methodology.

## Stack and conventions
- TypeScript + Vite app, vitest tests. `npm run dev`, `npm test`, `npm run typecheck`, `npm run build`.
- Damage math comes from `@smogon/calc` through the SP adapter in `src/champions/adapter.ts`; the older standalone engine (`src/damage.ts` etc.) is kept as the independent half of `test/crosscheck.test.ts`, not dead code.
- Roster legality is enforced in `src/champions/roster.ts`; the roster rotates, so re-check it against Bulbapedia when a regulation changes.
- This repository is public: keep it to game and strategy content only.

## Key decisions
- Always build for Champions doubles (spread moves, redirection, Intimidate, Tailwind, Trick Room, Protect matter most).
- Everything is in SP, not EVs: 66 SP total, 32 max per stat, no IVs. SP = ceil(EV / 8), verified exact.
- Teambuilding follows the seven-step method in `docs/claude-project/teambuilding-methodology.md`.
- Calcs default to worst case (your minimum roll vs. their maximum).

## Current status
- App complete: turn simulator, SP tuner, team builder, speed tiers, 127 tests.
- Several team builds documented (see below); some older docs carry corrections noted in newer ones, and the M-B roster snapshot is stale in places.

## Context docs (`docs/claude-project/`)
- `teambuilding-methodology.md` — seven-step process and SP/EV conversion.
- `champions-roster.md`, `type-chart.md`, `meta-report-reg-mb-week8.md`, `reg-mb-stats-table-guide.md` — format reference.
- `damage-calculator-guide.md`, `damage-rounding-calc-guide.md` — calculator usage.
- `salamence-movepool.md` — Salamence movepool notes.
- Teams: `team-salamence-sylveon-dual-threat.md`, `team-mega-salamence-carry.md`, `team-mega-froslass-veil.md`, `team-mega-sceptile-discharge.md`, `team-torterra-body-press.md`, `team-tyranitar-sinistcha-milotic.md`.
