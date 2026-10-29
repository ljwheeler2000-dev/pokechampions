# Salamence — Complete Movepool (Pokémon Champions)

Source: https://pokebase.app/pokemon-champions/pokemon/salamence
94 moves total. Applies to both Salamence and Mega Salamence (Mega only changes stats/ability).

## Flying
Aerial Ace (P, 60, —) · Air Cutter (S, 60, 95) · Air Slash (S, 75, 95) · Dual Wingbeat (P, 40×2, 100)
Fly (P, 90, 85) · Hurricane (S, 110, 70) · **Roost** (status, heal) · **Tailwind** (status)

## Dragon
Breaking Swipe (P, 60, 100) · Dragon Breath (S, 60, 100) · Dragon Cheer (status)
**Dragon Claw** (P, 80, 100) · **Dragon Dance** (status) · Dragon Pulse (S, 85, 100)
Dragon Tail (P, 60, 90) · Draco Meteor (S, 130, 90) · **Outrage** (P, 120, 100) · Twister (S, 40, 100)

## Normal — all Aerilate-converted to Flying at 1.2x
**Double-Edge** (P, 120 → ~144 Flying) · **Hyper Voice** (S, 90 → ~108 Flying, **spread**)
Body Slam (P, 85 → ~102, no recoil, 30% para) · Facade (P, 70 → ~84, 140 if statused)
Swift (S, 60 → 72, spread, never misses) · Headbutt (P, 70) · Strength (P, 80) · Take Down (P, 90, 85)
Giga Impact (P, 150, 90) · Hyper Beam (S, 150, 90) · Round (S, 60) · Snore (S, 50) · Cut (P, 50, 95)
**Protect** · Substitute · Endure · Helping Hand · Roar · Scary Face · Leer · Defense Curl
Double Team · Attract · Confide · Mimic · Sleep Talk

**Disabled in Champions ("cannot be used"):** Return, Frustration, Hidden Power, Natural Gift,
Rage, Secret Power, Captivate. **Return being disabled matters** — it was the standard Aerilate
STAB in VGC 2015; Double-Edge (recoil) or Body Slam (no recoil) replace it here.

## Fire — categories verified 2026-09-09

| Move | BP | Acc | Category |
|---|---|---|---|
| Fire Blast | 110 | 85 | Special |
| **Heat Wave** | 95 | 90 | Special, **spread** |
| Flamethrower | 90 | 100 | Special |
| **Temper Flare** | **75** | **100** | **Physical** |
| **Fire Fang** | **65** | **95** | **Physical** |
| Incinerate | 60 | 100 | Special |
| Ember | 40 | 100 | Special |
| Fire Spin | 35 | 85 | Special |

Plus Sunny Day (status).

> **Correction (2026-09-09):** an earlier version of this doc listed **Incinerate as physical**. It
> is **special**. Only **Fire Fang and Temper Flare** are physical Fire moves — the distinction
> decides whether Fire coverage is usable at all on a physical SP spread.

## Steel
**Iron Head** (P, 80, 100) · Iron Tail (P, 100, 75) · Steel Wing (P, 70, 100) · Iron Defense (status)

## Ground
**Earthquake** (P, 100, 100) · Bulldoze (P, 60, 100)

## Rock
**Rock Slide** (P, 75, 90, **spread**) · Stone Edge (P, 100, 80) · Rock Tomb (P, 60, 95)
Rock Smash (P, 40) · Rollout (P, 30)

## Dark
Crunch (P, 80, 100) · Bite (P, 60) · Brutal Swing (P, 60) · Hone Claws (status)

## Water
Aqua Tail (P, 90, 90) · Hydro Pump (S, 110, 80) · Mud-Slap (S, 20) · Rain Dance (status)

## Psychic
Psychic Fangs (P, 85, 100) · Zen Headbutt (P, 80, 100) · Rest (status)

## Other
Brick Break (Fighting, P, 75) · Shadow Claw (Ghost, P, 70) · Thunder Fang (Electric, P, 65, 95)
Fury Cutter (Bug, P, 40) · Toxic (Poison, status, 90) · Defog · Focus Energy · Laser Focus
Tera Blast (80) — **listed but questionable**; Champions has no Terastallization mechanic, so
treat as unusable until confirmed in-game.

## What this resolves for the carry build

**1. Roost is confirmed.** Recall the quirk: it removes the Flying type for that turn, so Salamence
is pure Dragon and **Ice drops 4x → 2x on the Roost turn**, at the cost of the Ground immunity.

**2. Iron Head answers Fairy without help.** Salamence's two hard walls are Steel (resists Flying
and Dragon) and Fairy. **Iron Head is physical Steel off 145 base Atk and hits Fairy for 2x** — so
Salamence can beat Sylveon by itself.

**3. Steel coverage exists, and Temper Flare is the physical option.**

| Option | Cat. | Hits Steel | Cost |
|---|---|---|---|
| **Temper Flare** (75) | **Phys** | **2x** | Low BP, no STAB — but doubles to **150 BP if your previous move failed**, including being blocked by Protect |
| Fire Fang (65) | Phys | 2x | Weaker still |
| Earthquake (100) | Phys | 2x | Hits your ally in doubles |
| Heat Wave (95) | Spec | 2x, spread | Special — dead on a physical spread |
| Fire Blast (110) | Spec | 2x | Same problem |
| Brick Break (75) | Phys | 2x | No STAB, worse than Temper Flare |

**Temper Flare is the best physical Steel answer Salamence has on its own.** Against a Steel target
it roughly doubles the output of clicking Double-Edge (Steel resists Flying 0.5x; Fire hits 2x).
Earthquake is stronger raw but needs a Flying/Levitate partner. It is still usually correct to keep
a dedicated Steel remover on the team rather than spend a Salamence slot here.

**4. Body Slam is the no-recoil alternative** to Double-Edge — ~102 BP Aerilate Flying with a
30% paralysis chance, versus ~144 with recoil. Worth calc'ing on a carry with a 4x Ice weakness,
where chip damage decides whether it survives an Ice Shard.

**5. Dual Wingbeat breaks Focus Sash and Substitute** (2 hits). Situational tech against Sash
leads, which are common on Whimsicott, Talonflame and Sneasler.
