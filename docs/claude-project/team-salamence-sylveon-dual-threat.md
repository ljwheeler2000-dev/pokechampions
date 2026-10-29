# Team Build: Mega Salamence + Sylveon Dual Threat (Reg M-C)

Built via claude/teambuilding-methodology.md. Champions doubles, bring 6 / pick 4.
**Separate team from claude/team-mega-salamence-carry.md** — that build makes Salamence the sole
win condition. This one runs two attackers that cover each other's walls.

**Reg M-C is live:** 2026-09-09 through 2026-12-01. **29 new entries / 23 new species** plus six
new Megas (Salamence, Golisopod, Baxcalibur, Absol Z, Lucario Z, Garchomp Z). Full list in
claude/champions-roster.md; the ones that touch this team are audited below.

## The six

**Salamence-Mega · Sylveon · Kingambit · Incineroar · Whimsicott · Rotom-Wash**

The owner's own list, with Whimsicott in for Sinistcha. Five of the six are already in the box; only
Incineroar has to be acquired.

The Sinistcha version had no speed control at all — four members at base 70 or slower with
Salamence, the fastest thing on the team, on top. That is a Trick Room shell and a Tailwind
sweeper sharing a roster, and neither half gets what it needs. Whimsicott resolves it in the
right direction: the team commits to Tailwind, and Salamence stays the point of it.

## Step 2-3: The core

**Mega Salamence and Sylveon share zero weaknesses**, and each answers the type that walls the other.

| | Mega Salamence | Sylveon |
|---|---|---|
| Type | Dragon/Flying | Fairy |
| Weak | Ice **4x**, Rock, Dragon, Fairy | Poison, Steel |
| Immune | Ground | **Dragon** |
| Resists | Fire, Water, Grass, Fighting, Bug | Fighting, Bug, Dark |
| Damage | Physical, single-target nuke | Special, **spread** |

- **Sylveon is immune to Dragon** — it walls the Salamence mirror, Baxcalibur, Garchomp Z,
  Dragonite, Hydreigon and Archaludon, and answers them at 2x.
- **Salamence covers most of Sylveon's Poison problem** — Aerilate Double-Edge is Flying, 2x on
  Sneasler (Fighting/Poison) and Scolipede (Bug/Poison). Glimmora (Rock/Poison) resists it and is
  Rotom-Wash's job.
- **Salamence's Iron Head answers opposing Fairy**, which Sylveon cannot (Fairy does not resist Fairy).
  Kingambit's Iron Head is the second copy.
- **Steel walls both core members** — Sylveon's Mystical Fire and Incineroar's Flare Blitz are the
  two answers, and this team needs both.

## Verified data behind the build

**Sylveon does NOT learn Tailwind in Champions.** Its full movepool has no Tailwind, Trick Room or
Icy Wind. The Week 8 meta report's "Tailwind: Charizard-Mega-Y + Sylveon + Farigiraf" archetype
gets Tailwind from a *partner*. The "Sylveon has backup Tailwind" line in
claude/team-mega-salamence-carry.md should be struck.

| Pokémon | Type | Ability (usage) | Base stats | Notes |
|---|---|---|---|---|
| Salamence | Dragon/Flying | Intimidate / Moxie | 95/135/80/110/80/100 | Mega: 95/145/130/120/90/120, Aerilate |
| Sylveon | Fairy | **Pixilate 98.9%** | 95/65/65/110/130/60 | Fairy Feather 91.2%; has Mystical Fire, Psyshock |
| Kingambit | Dark/Steel | **Defiant 98.4%** | 100/135/120/60/85/50 | Supreme Overlord only 1.5%; Black Glasses 36.7%, Chople 24% |
| Incineroar | Fire/Dark | **Intimidate 99.1%** | 95/115/90/80/90/60 | **Sitrus Berry 66.9%**; no Knock Off in Champions |
| Whimsicott | Grass/Fairy | **Prankster 99.5%** | 60/67/85/77/75/116 | Tailwind 97%, Moonblast 87.3%, Encore 68.1%, Focus Sash 80.3% |
| Rotom-Wash | Electric/Water | Levitate | 50/65/107/105/107/86 | Only weakness is Grass |

**Defiant, not Supreme Overlord** — usage is 98.4% Defiant, and it is correct. Intimidate is on
99.1% of Incineroar; every opposing Intimidate hands Kingambit **+2 Attack**. Your own Intimidates
only hit opponents, so there is no friendly-fire problem.

## Roster (6/6)

### 1. Salamence @ Salamencite — physical threat
**Double-Edge / Dragon Claw / Iron Head / Protect**
SP: **32 Atk / 32 Spe / 2 HP** · **Jolly**

`HP 172 / Atk 197 / Def 150 / SpA 126 / SpD 110 / Spe 189` → **378 under Tailwind**

- **Jolly, not Adamant — and the Whimsicott swap is what decides this.** My earlier draft ran
  Talonflame, whose Quick Guard blanked Ice Shard; with the priority blocker gone, Salamence's 4x
  Ice weakness is live and there will be turns without Tailwind up. 189 wins the base-120 mirror
  outright, which matters at M-C launch when Salamence mirrors are everywhere.
  Adamant alternative: `Atk 216 / Spe 172`.
- Send it in as **base Salamence so Intimidate procs**, then Mega Evolve into Aerilate. Base-form
  ability usage was Intimidate 92.86% / Aerilate 7.14%, which confirms the play.
- Double-Edge = 120 BP Normal → Aerilate Flying at 1.2x ≈ **144 BP STAB**.
- Body Slam (~102 BP, no recoil, 30% para) is the alternative when chip damage is what decides
  whether Salamence survives an Ice attack. With no Quick Guard on this version, calc it.

### 2. Sylveon @ Fairy Feather — special spread threat
**Hyper Voice / Mystical Fire / Psyshock / Protect**
SP: **32 SpA / 24 HP / 10 Spe** · **Modest**

`HP 194 / Atk 76 / Def 85 / SpA 178 / SpD 150 / Spe 90` → **180 under Tailwind**

- **The 10 Speed SP is deliberate.** At 0 SP Sylveon is 80 → 160 under Tailwind, which *loses* to a
  max-invested base 110 (178). 10 SP puts it at 90 → **180, beating base 110 outright**. Cheapest
  meaningful breakpoint on the team.
- Hyper Voice: 90 BP Normal → Pixilate Fairy at 1.2x ≈ 108 BP, ×1.5 STAB, ×1.2 Fairy Feather,
  ×0.75 spread. Hits **both** foes, never your ally.
- **Mystical Fire is mandatory** — Steel is the only type that walls both core members. Kingambit
  (2x), Metagross (2x), Excadrill (2x), Gholdengo (2x), Corviknight (2x), Scizor (4x). The SpA drop
  is a bonus into rain.
- **Psyshock is more important on this version than it was on the last one.** Sylveon *and*
  Whimsicott are both Poison-weak, so Sneasler and Glimmora hit two of your six. Psyshock hits
  Poison 2x and targets Def, breaking specially-bulky walls that eat Hyper Voice.
- Helping Hand is **not** needed here — Whimsicott's is Prankster and strictly better (see below).
- **Do not run Quick Attack** despite 21.1% usage. It is physical; 76 Atk makes it chip only.

### 3. Kingambit @ Chople Berry — priority damage and the Defiant pivot
**Sucker Punch / Kowtow Cleave / Iron Head / Protect**
SP: **32 Atk / 32 HP / 2 SpD** · **Adamant**

`HP 207 / Atk 205 / Def 140 / SpA 72 / SpD 107 / Spe 70` → 140 under Tailwind

- **Base 50 Speed is not a problem here**, which is why Kingambit works on a Tailwind team where
  Sinistcha did not. Sucker Punch is priority; Kingambit does not need to outrun anything.
  205 Atk behind Black Glasses is the biggest priority number on the team.
- **Defiant turns opposing Intimidate into +2 Attack.** Against the Incineroar-heavy field that is
  a free boost roughly every other game.
- Iron Head is the team's second Fairy answer and hits Baxcalibur 2x (Ice/Dragon).
- **Chople Berry over Black Glasses — Reg M-C forced this.** Kingambit is **4x weak to Fighting**
  and is the most-targeted Pokémon in the format. M-C just added **Grapploct, Sirfetch'd and
  Pawmot** (all Fighting) on top of **Cinderace's High Jump Kick**, and Mega Lucario Z arrives the
  same regulation. Four-plus new ways to delete your Kingambit is enough to buy the berry.
  Black Glasses (36.7% usage) stays the power option once you know the matchup has no Fighting.

### 4. Incineroar @ Sitrus Berry — Intimidate, tempo, and the Tailwind bodyguard
**Fake Out / Parting Shot / Flare Blitz / Protect**
SP: **32 HP / 20 Atk / 14 Def** · **Adamant**

`HP 202 / Atk 170 / Def 124 / SpA 90 / SpD 110 / Spe 80` → 160 under Tailwind

- **Fake Out is what protects Whimsicott's Tailwind.** Prankster Tailwind is +1 priority, so it
  loses to an opposing Fake Out (+3). Leading Incineroar + Whimsicott and Fake Out'ing the enemy
  Fake Out user is how you make the Tailwind land. This synergy did not exist in the Talonflame
  version and is the strongest argument for your six over mine.
- Intimidate stacks with Salamence's on entry — the double-Intimidate that made the 2019 Worlds
  Salamence team work.
- Parting Shot pivots either attacker in with the opponent's offense already cut.
- Flare Blitz off 170 Atk is the hard Steel removal that Mystical Fire's 75 BP cannot always finish.
- **Darkest Lariat is cut** — Kingambit already provides Dark, and Protect is worth more on a
  support piece. Take Lariat back if you need to ignore Def boosts.
- **Sitrus Berry, not Assault Vest.** AV blocks status moves and Parting Shot is one — the
  Incineroar @ Assault Vest set in claude/team-mega-salamence-carry.md is illegal.
- The 20 Atk SP is a compromise: enough that Flare Blitz kills Steel, not so much that Incineroar
  stops being a wall. Go 32 HP / 32 Def / 2 SpD if you only want the Intimidate body.

### 5. Whimsicott @ Focus Sash — speed control
**Tailwind / Helping Hand / Encore / Moonblast**
SP: **32 HP / 32 Spe / 2 Def** · **Timid**

`HP 167 / Atk 78 / Def 107 / SpA 97 / SpD 95 / Spe 184`

- **The 32 Speed SP is for the Prankster mirror, not for the Tailwind.** Tailwind lands at +1
  regardless. But the way a Prankster lead actually loses is an opposing Whimsicott Prankster-Taunting
  it first, and at equal priority raw Speed breaks the tie. **184 is max for base 116** — you win
  that mirror against any spread. The bulk alternative is Calm 32 HP / 32 SpD / 2 Def
  (`SpD 139 / Spe 136`), which loses it.
- **Helping Hand here is Prankster, and that is a real upgrade over Sylveon's.** On the previous
  version Sylveon at 180 was slower than Salamence at 378, so its Helping Hand always landed
  *after* Salamence had already attacked — the line did not work. Prankster Helping Hand always
  goes first. **Prankster Helping Hand → 197 Atk Aerilate Double-Edge is this team's biggest number.**
- Grass/Fairy is **immune to Dragon**, a second copy of Sylveon's best defensive trait.
- **Prankster status fails against Dark** — Encore and Taunt do nothing to Kingambit, the #1 mon in
  the format. Tailwind and Helping Hand target your own side and are unaffected.
- **Cost:** stacks a second Ice weakness alongside Salamence's 4x, and a second Poison/Steel
  weakness alongside Sylveon's.

### 6. Rotom-Wash @ Sitrus Berry — rain answer and glue
**Hydro Pump / Thunderbolt / Will-O-Wisp / Protect**
SP: **32 HP / 32 SpA / 2 SpD** · **Modest**

`HP 157 / Atk 76 / Def 127 / SpA 172 / SpD 129 / Spe 106` → 212 under Tailwind

- Electric/Water with **Levitate** — its only weakness is Grass (2x), the cleanest defensive profile
  in the format, and it resists Ice 0.5x.
- **This is the rain matchup.** Rain is the top-converting archetype; Thunderbolt off 172 SpA removes
  Pelipper, Basculegion and Archaludon, and Rotom resists Water.
- Will-O-Wisp handles the physical attackers Intimidate alone does not stop — Garchomp, Baxcalibur,
  and opposing Kingambit (burn halves its Sucker Punch).
- Its Ground immunity keeps Ground exposure to two members.

## Step 5: Weakness distribution

| Type | Weak | Resist / Immune |
|---|---|---|
| **Ice** | Salamence (4x), Whimsicott | Kingambit, Incineroar, Rotom (0.5x) |
| **Fighting** | Kingambit (**4x**), Incineroar | Whimsicott (0.25x), Sylveon, Salamence |
| Fire | Kingambit, Whimsicott | Incineroar, Rotom, Salamence |
| Ground | Kingambit, Incineroar | Salamence, Rotom (immune); Whimsicott 0.5x |
| Rock | Salamence, Incineroar | Kingambit |
| Poison | Sylveon, Whimsicott | **Kingambit (immune)** |
| Steel | Sylveon, Whimsicott | Kingambit, Incineroar, Rotom |
| Water | Incineroar | Rotom, Whimsicott, Salamence |
| Grass | Rotom | Whimsicott, Salamence, Incineroar, Kingambit |
| Flying | Whimsicott | Kingambit |
| Fairy | Salamence | Kingambit |
| Dragon | Salamence | **Sylveon + Whimsicott (both immune)**, Kingambit |

**Nothing hits three or more members** — this is better distributed than the Talonflame/Aegislash
version, which had three Rock-weak bodies including a 4x. The two sharp points:

1. **Kingambit at 4x Fighting.** It is the format's most-targeted Pokémon and Fighting is its
   answer. Chople Berry is the mitigation; Whimsicott resists Fighting at 0.25x and Sylveon at 0.5x.
2. **Every Ice-weak member is on the same side of the team.** Salamence 4x plus Whimsicott 2x, with
   no Quick Guard and no Armor Tail. See the honest holes below.

## Honest holes

These are the costs of the Sinistcha → Whimsicott swap and of the six as chosen. None is fatal; all
are worth knowing before you ladder.

1. **No priority blocking. This is the biggest one.** There is no Quick Guard, no Armor Tail, no
   Rage Powder. **Ice Shard from Weavile, Mamoswine or Baxcalibur kills Salamence outright.** Your
   only mitigations are Incineroar's Fake Out, Intimidate reducing the damage, and simply not
   leading Salamence into an Ice-Shard user. Sinistcha's Rage Powder was actually covering this in
   your original list — that was the good instinct in it, and the swap gives it up for speed control.
2. **No Wide Guard.** Rock Slide hits Salamence and Incineroar. Less severe than the Talonflame
   version, which had a 4x body, but Aegislash was the piece that solved it.
3. **No redirection at all**, which compounds 1 and 2 — nothing on this team can pull a targeted
   attack off Salamence.

If Ice Shard is what actually beats you in practice, the single highest-value change is
**Incineroar → Farigiraf** (Armor Tail blocks all opposing priority for the whole side), or
**Whimsicott → Talonflame** (Gale Wings Tailwind + Quick Guard), and you would flip Salamence back
to Adamant. Both cost acquisitions you do not have yet.

## Reg M-C new-Pokémon audit

What actually touches this team, verified against Champions data rather than mainline assumptions.

### Threats that got worse

| New Pokémon | Why it matters here |
|---|---|
| **Grapploct · Sirfetch'd · Pawmot** (Fighting) + **Cinderace** (High Jump Kick) | Four new Fighting attackers into a team whose Kingambit is **4x weak**, plus Mega Lucario Z the same regulation. **This is the single biggest shift and it is what moves Kingambit to Chople Berry.** |
| **Cinderace** — Fire · Libero · 80/116/75/65/75/**119** | **Court Change swaps Tailwind to their side.** A direct attack on this team's only speed control. Max Cinderace is 188 Spe; **Salamence at Jolly 189 outruns it by one point** — another reason not to go Adamant. |
| **Rillaboom** — Grass · **Grassy Surge** · 100/125/90/60/70/85 | **Grassy Glide is priority Grass at 2x on Rotom-Wash**, your only Grass-weak member. It also has Fake Out, which threatens the Whimsicott Tailwind, and Grassy Terrain heals its grounded side. |
| **Baxcalibur** — Ice/Dragon | 4x on Salamence, with Ice Shard. Sylveon is immune to its Dragon STAB and hits it 2x; Kingambit resists Ice and hits it 2x with Iron Head. **This is the matchup the Sylveon pairing exists for.** |
| **Mabosstiff** — Dark · **Guard Dog** | **Intimidate does not work on it — it gains +1 Attack instead.** This team runs two Intimidates. Second Intimidate trap after Defiant Kingambit: do not send Salamence or Incineroar in on a Mabosstiff. |
| **Toxtricity** — Electric/Poison · **Punk Rock** | Halves sound damage, so it eats Hyper Voice at 0.5x, and its Poison STAB hits **both** Sylveon and Whimsicott at 2x. Punk Rock Boomburst is ~182 BP spread. Psyshock answers it at 2x. |
| **Mr. Mime** — Psychic/Fairy · **Soundproof** | **Full immunity to Hyper Voice.** A hard Sylveon wall — click Mystical Fire or Psyshock into it, not the spread. |
| **Indeedee** — Psychic/Normal · **Psychic Surge** | Psychic Terrain blocks priority against **grounded** targets, which switches off **Kingambit's Sucker Punch** — the team's main priority damage. Salamence is Flying, so it is unaffected either way. |
| **Perrserker** — Steel · **Steely Spirit** | Boosts its allies' Steel moves by 50%. Not a threat by itself, but an opposing Perrserker plus any Steel partner hits Sylveon and Whimsicott very hard. |

**The pattern worth noting: two separate sound checks arrived in one regulation.** Soundproof is
full immunity and Punk Rock halves it. Hyper Voice is no longer a safe default click, and Sylveon's
Mystical Fire and Psyshock slots just earned their keep.

### What did not arrive

**Nothing new brings Quick Guard, Wide Guard or Armor Tail**, so the priority hole below stays open.

**Indeedee does not learn Follow Me in Champions** — checked its movepool directly, it is absent —
so it is not the redirection fix, and its Psychic Terrain would not protect a Flying-type Salamence
from Ice Shard anyway. The only new redirection is **Mr. Mime**, which has Follow Me *and*
Soundproof, but base 40 HP and a Steel/Poison weakness that would stack with Sylveon and Whimsicott
to three members. Not recommended.

## Speed reference (max SP + positive nature, Champions formula)

| Base | Max Spe | + Choice Scarf |
|---|---|---|
| 50 (Kingambit) | 112 | 168 |
| 60 (Sylveon, Incineroar) | 123 | 184 |
| 86 (Rotom-W) | 151 | 226 |
| 100 | 167 | 250 |
| 110 | 178 | 267 |
| 116 (Whimsicott) | **184** | 276 |
| 120 (Salamence-M) | **189** | 283 |
| 130 | 200 | 300 |

**Intra-team order once Tailwind is up:**
Salamence 378 → Whimsicott 368 → Rotom 212 → Sylveon 180 → Incineroar 160 → Kingambit 140.

Two things follow from that ordering:

- **Whimsicott's Helping Hand works and Sylveon's would not.** Prankster puts it ahead of Salamence
  regardless of the raw numbers. Route the Helping Hand line through Whimsicott.
- **Kingambit acts last on the team, every turn.** That is fine — Sucker Punch is priority and
  Kingambit *wants* the opponent to have committed. Do not invest Speed trying to fix it.

Per the confirmed Champions finding that move order is re-evaluated mid-turn, a Prankster Tailwind
benefits every partner that has not yet acted **that same turn**.

## Leads and game plan

- **Default lead: Incineroar + Whimsicott.** Fake Out the opposing Fake Out user or the biggest
  immediate threat, set Tailwind. Turn 2, Parting Shot into Salamence or Sylveon with the
  opponent's offense already cut twice.
- **Vs rain: Rotom-Wash + Incineroar.** Thunderbolt removes Pelipper before Drizzle pays off;
  Fake Out stalls Archaludon's Electro Shot. Bring Sylveon over Whimsicott — rain halves Mystical
  Fire, so lean on Incineroar's Flare Blitz for Archaludon.
- **Vs sand (Excadrill / Tyranitar-M / Sinistcha): Salamence + Sylveon** directly. Mystical Fire on
  Excadrill, Rotom Hydro Pump on Tyranitar. Sand chip does not threaten this team.
- **Vs Trick Room:** Whimsicott Encore or Taunt — but **not against a Dark-type setter**, where
  Prankster fails. Kingambit's Sucker Punch is your under-Trick-Room damage.
- **Vs opposing Fairy:** Salamence Iron Head and Kingambit Iron Head. Covered twice.
- **Back pair is the win condition:** Salamence + Sylveon under Tailwind, with Prankster Helping
  Hand from Whimsicott on the turn you need a specific KO.

## Acquisition

Owned: **Salamence** (M-C launch), **Sylveon, Kingambit, Whimsicott, Rotom-Wash**.
Needed: **Incineroar** only.

Box-legal stand-in if Incineroar is not available: **Mawile** — Steel/Fairy resists Ice, Rock, Fairy
and Dark and is Dragon- and Poison-immune, which covers the core well. But **Mawile has no Fake Out
in Champions**, and its Intimidate is only 46.6% usage (Hyper Cutter is the default — check the
ability on the one you own). Without Fake Out you lose the Tailwind bodyguard, which is much of why
Incineroar is in this team. **Incineroar is worth chasing.**

## Open decisions for playtest

- **Jolly vs Adamant on Salamence.** Jolly is correct while there is no Quick Guard on the team;
  revisit if you ever add Talonflame or Farigiraf. Run both in
  calc.pokemonshowdown.com/champions.html, Champions mode, Doubles.
- **Chople Berry vs Black Glasses on Kingambit** — surviving a Close Combat vs raw Sucker Punch
  damage. Chople is the M-C default; revisit if the Fighting influx does not show up on ladder.
- **Timid vs Calm on Whimsicott** — winning the Prankster mirror vs surviving a second hit.
- **Whether Incineroar wants Darkest Lariat back** over Protect.
- **Two-mega toggle.** Salamencite is committed here; Mega Mawile (Huge Power) is the natural
  matchup toggle per the standing interest in dual mega stones, but it means running Salamence
  unmegaed as an Intimidate/Moxie body, which is a different team.

## Alternative build: Talonflame + Aegislash

The version I drafted before the Whimsicott swap, kept for reference. Replace Kingambit and
Whimsicott with:

- **Talonflame @ Focus Sash** — Tailwind / Quick Guard / Flare Blitz / Brave Bird, Jolly
  32 Spe / 32 Atk / 2 HP (`Spe 195`). Gale Wings makes Tailwind priority; **Quick Guard blocks Ice
  Shard, Sucker Punch, Fake Out and Extreme Speed for the whole side.**
- **Aegislash @ Leftovers** — Wide Guard / King's Shield / Iron Head / Poltergeist, Adamant
  32 HP / 32 Atk / 2 Def (Blade `Atk 211`, Shield `Def 162 / SpD 160`). **Resists or is immune to
  every weakness of the core** and brings the Wide Guard this team lacks.

Trade-off: that version solves priority and spread moves but carries three Rock-weak bodies with
Talonflame at 4x, needs three acquisitions instead of one, and gives up Kingambit — the highest-scoring
Pokémon in the format. **The version above is the better team to actually ladder with.** Take
Talonflame first if you go shopping.

## Related project docs

- claude/team-mega-salamence-carry.md — the Salamence-as-sole-carry alternative. **Two corrections
  land on it:** Sylveon does not learn Tailwind, and Incineroar @ Assault Vest cannot run Parting Shot.
- claude/champions-roster.md — **stale.** M-B snapshot with a stated expiry of 2026-09-02; M-C is
  live through 2026-12-01.
- claude/salamence-movepool.md, claude/damage-calculator-guide.md, claude/teambuilding-methodology.md
