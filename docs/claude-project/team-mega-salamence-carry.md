# Team Build: Mega Salamence as Carry (Reg M-C)

Built via claude/teambuilding-methodology.md. Champions doubles, bring 6 / pick 4.
**Reg M-C opens 2026-09-09 02:00 UTC** — Salamence is not obtainable before then.

**Scope: full Champions roster, not box-limited.** Acquisition gaps are listed at the bottom.

## Concept

Mega Salamence as the win condition, not as support. This is a deliberate inversion of how it
actually won Worlds.

**Historical note (verified):** Mega Salamence's only Worlds title is **2019, Naoto Mizobuchi,
Masters** — Salamence-Mega / Primal Groudon / Stakataka / Incineroar / Tapu Fini / Lunala.
That was VGC 2019 Ultra Series, a *restricted* format, and Salamence's role there was
**support**: Tailwind setter, Intimidate body, spread chip enabling Primal Groudon as the real
carry. Its 100%-usage set was Double-Edge / Hyper Voice / Tailwind / Protect.

It did **not** win Worlds 2015 (that was Shoma Honami on Mega Kangaskhan).

Historical partners: Groudon 91%, **Incineroar 69%**, Xerneas 47%, Tapu Fini 46%, Tapu Lele 30%.
Only Incineroar exists in the Champions roster — and it is on this team, for the same reasons it
was on that one.

## What changes when Salamence carries instead of supports

| | 2019 support role | M-C carry role |
|---|---|---|
| Tailwind | On Salamence itself (100% usage) | Delegated to Whimsicott — frees a moveslot |
| Damage | Mixed (Double-Edge + Hyper Voice) | Committed physical — 66 SP is too scarce to split |
| Steel answer | Primal Groudon handled it | **Dedicated teammate required** |
| Protecting the carry | Tapu Fini's Misty Terrain (status) | Farigiraf's Armor Tail (priority) |
| Win condition | Groudon | Salamence |

**The central build problem:** Steel resists both Flying and Dragon, so Steel walls a Salamence
carry completely — Kingambit, Metagross, Archaludon, Excadrill, Corviknight, Gholdengo all sit
in front of it and take nothing. A carry build lives or dies on removing Steel.

**The second problem:** Ice 4x. The cheapest kill on this team is a priority Ice Shard.

## Mega Salamence — verified data

**Dragon/Flying · Aerilate · 95 / 145 / 130 / 120 / 90 / 120 (700 BST)**

Aerilate: Normal moves become Flying, +20% power. Double-Edge ≈ 144 BP Flying STAB off 145 Atk.

Weaknesses: **Ice 4x**; Rock, Dragon, Fairy 2x. Ground immune.

**Ability line — verified, not speculation.** Tournament usage was **Intimidate 92.86% /
Aerilate 7.14%**, with Salamencite at 100%. That field records the *pre-Mega* ability, which
confirms the standard play: switch in as base Salamence → Intimidate procs → Mega Evolve into
Aerilate. A free Attack drop on every entry.

## Roster (6/6)

### 1. Salamence @ Salamencite — the carry
**Double-Edge / Dragon Claw / Protect / Roost**
SP: **32 Atk / 32 Spe / 2 HP**

- Nature: **Jolly** recommended. Base 120 ties the mirror, and mirrors will be everywhere at M-C
  launch, so nature breaks the tie. Adamant is the power alternative — run both in the calc.
- **Roost is unverified in Champions.** Confirm at launch; fall back to Hyper Voice (spread chip
  off uninvested 120 SpA) or Substitute.
- Roost quirk: it removes the Flying type for the turn, so Salamence is pure Dragon —
  **Ice drops 4x → 2x on the Roost turn**, at the cost of the Ground immunity.
- The Worlds set carried **no Dragon STAB**. Dragon Claw is added here for the mirror and for
  Mega Garchomp Z / Baxcalibur, which the 2019 format did not contain.

### 2. Farigiraf @ Sitrus Berry — the enabler
**Thunderbolt / Psychic / Helping Hand / Protect**
SP: **32 HP / 32 SpDef / 2 Def**

The single biggest upgrade over any box-limited version. **Armor Tail blocks all opposing
priority moves against Farigiraf and its allies** — which directly answers the way a
4x-Ice-weak carry actually dies:

- **Ice Shard** — the cheapest kill on Salamence, blanked
- **Sucker Punch** — Kingambit is the #1 mon in the format, defanged
- **Fake Out** — no turn-1 tempo loss
- Bullet Punch, Aqua Jet, Extreme Speed, Grassy Glide (relevant now that Rillaboom is in M-C)

Structurally this is what Tapu Fini did on the 2019 team — protect the carry from a whole class
of interaction — by a different mechanism. S tier (149.6 score, 50.1% WR). Weak only to Dark and
Bug (2x each). Note that your own Prankster and Fake Out are unaffected; Armor Tail only stops
*opposing* priority.

### 3. Incineroar @ Assault Vest — the historical partner
**Flare Blitz / Darkest Lariat / Fake Out / Parting Shot**
SP: **32 HP / 32 Def / 2 SpDef**

Salamence's 69%-usage Worlds partner, and it earns the slot on mechanics alone:

- **Second Intimidate**, stacking with Salamence's own — double Intimidate was a 2019 hallmark
- **Parting Shot** pivots Salamence in safely with the opponent's offense already cut
- **Fake Out** buys the turn Salamence needs
- **Resists Ice 0.5x**
- **Flare Blitz removes Steel** — including Kingambit at 2x (Dark/Steel is Fire-weak)

> A verified SP spread for Incineroar already exists in claude/team-mega-froslass-veil.md
> (16 Def / 9 SpDef / 32 HP / 9 Atk), but it was tuned around Aurora Veil being up. It does not
> transfer to this team — use the simpler bulk spread above.

### 4. Sneasler @ Life Orb — the Steel and Fairy remover
**Close Combat / Gunk Shot / Shadow Claw / Protect**
SP: **32 Atk / 32 Spe / 2 HP**, Jolly

Answers both mons that stop a Salamence carry, in one slot:

- **Close Combat** removes Steel — Kingambit at **4x**, plus Metagross, Excadrill, Archaludon
- **Gunk Shot** hits Fairy 2x — the Sylveon answer, and Sylveon is S tier and 2x on Salamence

Fighting/Poison: weak to Psychic **4x**, Ground and Flying 2x. Resists Bug and Poison at 0.25x,
plus Grass, Fighting, Rock, Dark. It is also the team's only Fairy resist.

> **Correction to an existing project doc:** claude/team-mega-froslass-veil.md lists Sneasler as
> "immune Ghost." That is wrong — Ghost is immune to *Fighting*, not the reverse. Ghost attacks
> hit Fighting/Poison for neutral 1x. Worth fixing before it costs a game.

### 5. Rotom-Wash @ Sitrus Berry — the glue
**Hydro Pump / Volt Switch / Will-O-Wisp / Protect**
SP: **32 HP / 32 SpDef / 2 Def**

Electric/Water with **Levitate**. Its only weakness is **Grass (2x)** — the cleanest defensive
profile in the format. Resists Ice 0.5x, and its Ground immunity is what keeps this team's
Ground exposure to two members instead of three. Will-O-Wisp handles physical attackers that
Intimidate alone does not stop.

### 6. Whimsicott @ Focus Sash — speed control
**Tailwind / Moonblast / Encore / Helping Hand**
SP: **32 HP / 32 SpDef / 2 Def**

- Prankster Tailwind at +1. Per the confirmed finding that Champions re-evaluates move order
  mid-turn, Tailwind benefits Salamence **the same turn it is set**.
- Grass/Fairy is **immune to Dragon**, covering one of Salamence's four weaknesses.
- No Speed investment needed — Prankster moves it first regardless, and base 116 wins the
  Prankster mirror against Grimmsnarl (base 60). All points go to bulk.
- **Caveat:** Prankster *status* moves fail against Dark, so Encore and Taunt do nothing to
  Kingambit. Tailwind targets your own side and is unaffected.
- **Cost:** the only member that stacks a second Ice weakness. See the swap below.

## Weakness distribution

| Type | Weak | Resist / Immune |
|---|---|---|
| Ice | Salamence (4x), Whimsicott | Incineroar, Rotom-Wash (+ Armor Tail blocks Ice Shard) |
| Rock | Salamence, Incineroar | Sneasler |
| Ground | Incineroar, Sneasler | Salamence (immune), Rotom (immune), Whimsicott |
| Fire | Whimsicott | Incineroar, Rotom, Salamence |
| Dragon | Salamence | Whimsicott (immune), Farigiraf, Rotom |
| Fairy | Salamence, Incineroar | Sneasler |

Nothing hits three or more members. Ground was the flaw in earlier drafts and Rotom-Wash's
Levitate is what fixes it.

## Known gaps

1. **No Wide Guard.** Rain is the top archetype and Rock Slide is ubiquitous; Salamence and
   Incineroar are both 2x to Rock. Pelipper brings Tailwind + Wide Guard and is S tier, but its
   Drizzle actively hurts Incineroar and boosts opposing Water. This is the team's largest
   remaining structural hole.
2. **Baxcalibur is untested.** Ice/Dragon arrives in the same regulation as Salamence and hits it
   for 4x. No usage data exists yet — recheck after week 1 of M-C.
3. **Salamence's set is partly unverified** — Roost learnset, and Adamant vs Jolly.

## Acquisition required

Relative to the late-July box, this team needs: **Salamence** (M-C launch), **Farigiraf**, and
**Incineroar**. Whimsicott, Sneasler and Rotom-Wash are already owned.

If Farigiraf and Incineroar are not obtainable in time, the box-legal substitutes are
**Metagross** (resists Ice/Rock/Dragon/Fairy all at 0.5x, and brings Bullet Punch) and
**Sylveon** (S tier, Dragon-immune, backup Tailwind). That version has no priority blocker at
all, which is a materially worse team — Farigiraf is the piece worth chasing.

## Open decisions for playtest

- **Adamant vs Jolly** on Salamence — mirror tie vs raw power.
- **Whimsicott vs Sylveon** in slot 6. Whimsicott gives reliable Prankster Tailwind but stacks
  Ice; Sylveon has no Ice weakness, is Dragon-immune and S tier, but its Tailwind is slow and
  interruptible.
- **Whether Salamence reclaims Tailwind itself.** That is what actually won Worlds, and it would
  buy back a whole slot for a Wide Guard user — at the cost of Dragon Claw and against less
  reliable speed control.
