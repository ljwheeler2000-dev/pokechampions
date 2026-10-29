# Pokémon Champions Damage Calculator — How It Works

Source: https://calc.pokemonshowdown.com/champions.html — the Champions-specific mode of Smogon's official calc (github.com/smogon/damage-calc). **Use this exact URL/mode, not the generic calc.** The generic calc uses mainline EV/IV mechanics, which do not apply in Champions.

## The core difference from mainline Pokémon: SP, not EVs/IVs

Champions replaces the traditional EV/IV investment system entirely with **SP (Stat Points)**:

- Every Pokémon gets **66 total SP** to allocate across its six stats.
- **Max 32 SP in any single stat.**
- **IVs don't exist as a variable** — every Pokémon is effectively a fixed 31 IV in every stat, always. No IV breeding/hunting, no variance to plan around.
- The calc's stat rows show a "SPs" input column instead of separate EV/IV columns, and a "Total" field tracking your 66-SP budget.

### Verified stat formulas (level 50, confirmed against the live calc)

- **HP = Base + 75 + SP**
- **Other stats (Atk/Def/SpA/SpDef/Speed) = floor((Base + 20 + SP) × Nature)**, where Nature is **1.1** for a boosted stat, **0.9** for a hindered stat, **1.0** for neutral. Nature is applied *after* SP is added, not before.
- Item multipliers (Choice Scarf ×1.5 Speed, Choice Band/Specs ×1.5 offense, Life Orb ×1.3, Assault Vest ×1.5 SpDef, Eviolite ×1.5 both defenses, etc.) still apply on top of this, same as mainline games.

Confirmed worked examples straight from the calc:
- Rotom-Wash, 50 base HP, 24 SP → 50+75+24 = **149** ✓
- Rotom-Wash, 105 base SpA, Timid (neutral SpA), 32 SP → (105+20+32)×1.0 = **157** ✓
- Rotom-Wash, 65 base Atk, Timid (-Atk, ×0.9), 0 SP → floor((65+20+0)×0.9) = **76** ✓
- Rotom-Wash, 86 base Speed, Timid (+Spe, ×1.1), 10 SP, Choice Scarf → floor((86+20+10)×1.1) = floor(127.6) = 127, then ×1.5 (Scarf) = floor(190.5) = **190** ✓
- Mega Staraptor, 140 base Atk, Hardy (neutral), 32 SP → (140+20+32)×1.0 = **192** ✓

### Confirmed real base stats (from the live Champions calc — resolves prior uncertainty)

**Staraptor-Mega:** HP 85 / Atk 140 / Def 100 / SpA 60 / SpDef 90 / Speed 110. Ability **Contrary** (not a mainline Staraptor ability — Champions-original). Type Fighting/Flying.

## Other inputs (unchanged from mainline-style calcs)

- **Format:** Singles / Doubles / Champions mode toggle — use **Champions** mode and **Doubles** field for this project's team.
- **Per-Pokémon setup:** Species, form, gender, level (Champions = level 50), Nature, Ability, Item, Status, SP per stat, stat stage boosts (-6 to +6).
- **Move selection:** up to 4 moves per Pokémon; auto-fills type/power.
- **Field conditions:** Weather, Terrain, Screens (Reflect/Light Screen), entry hazards (Stealth Rock, Spikes), and other field effects (Tailwind, Trick Room via the move itself, etc.)
- **Spread Move behavior:** multi-target moves (Discharge, Earthquake hitting 2, etc.) get an automatic 0.75x multiplier in Doubles — confirmed still active in Champions mode.

## Output

Damage shown as a **percentage range** of the defender's HP (e.g. "80 - 95%"), reflecting the 0.85x–1.0x damage roll variance, plus a KO-likelihood readout (e.g. "guaranteed 2HKO", "X% chance to OHKO"). Possible damage amounts are listed explicitly (e.g. "128, 128, 132, 132, 134...152").

## Practical usage tips (for this project's teambuilding workflow)

1. Always use **calc.pokemonshowdown.com/champions.html** in **Champions** mode — not the generic calc — since generic mode will silently apply the wrong (EV/IV) stat formula.
2. Set level to 50 and toggle **Doubles** field for all Champions-format calcs.
3. Budget SP allocations against the 66-total / 32-per-stat caps — the calc's "Total" field under each Pokémon tracks this live.
4. Toggle Spread Move whenever checking a move that hits multiple targets (e.g. Discharge) — ties to Step 6 of teambuilding-methodology.md.
5. Check both the minimum and maximum damage rolls, not just the average — "in KO range" isn't the same as "guaranteed KO."
6. Use the calc directly to pull confirmed base stats/abilities for Champions-original Mega Evolutions (like Staraptor-Mega above) instead of guessing from mainline data — Champions has original Megas with non-mainline stats and abilities.
7. Test bidirectionally (attacker vs defender AND defender vs attacker) to account for speed control / who moves first, tying into Step 5 of the teambuilding methodology.
