/**
 * Pokemon Champions roster - Regular Roster M-B.
 *
 * Source: https://bulbapedia.bulbagarden.net/wiki/List_of_Pokemon_in_Pokemon_Champions
 * Snapshot valid until 2026-09-02. Rosters rotate; re-check before relying on this
 * after that date.
 *
 * Names are @smogon/calc dex keys, produced by resolving the Bulbapedia names
 * against the dex rather than transliterated by hand. The dex also carries Megas
 * that are NOT legal here (Mewtwo, Rayquaza, CAP Pokemon and others), which is
 * exactly why a legality filter is needed rather than just offering the whole dex.
 */

const split = (rows: readonly string[]): string[] =>
  rows.flatMap((r) => r.split(', ')).map((s) => s.trim()).filter(Boolean);

/** Base-form species obtainable in the current roster. */
export const ROSTER_SPECIES: readonly string[] = split([
  "Venusaur, Charizard, Blastoise, Beedrill, Pidgeot, Arbok, Pikachu, Raichu, Raichu-Alola",
  "Clefable, Ninetales, Ninetales-Alola, Vileplume, Arcanine, Arcanine-Hisui, Alakazam, Machamp",
  "Victreebel, Slowbro, Slowbro-Galar, Gengar, Kangaskhan, Starmie, Pinsir, Tauros",
  "Tauros-Paldea-Combat, Tauros-Paldea-Blaze, Tauros-Paldea-Aqua, Gyarados, Ditto, Vaporeon",
  "Jolteon, Flareon, Aerodactyl, Snorlax, Dragonite, Meganium, Typhlosion, Typhlosion-Hisui",
  "Feraligatr, Ariados, Ampharos, Azumarill, Politoed, Espeon, Umbreon, Slowking",
  "Slowking-Galar, Forretress, Steelix, Qwilfish, Scizor, Heracross, Skarmory, Houndoom",
  "Tyranitar, Sceptile, Blaziken, Swampert, Pelipper, Gardevoir, Sableye, Mawile, Aggron",
  "Medicham, Manectric, Sharpedo, Camerupt, Torkoal, Altaria, Milotic, Castform, Banette",
  "Chimecho, Absol, Glalie, Metagross, Torterra, Infernape, Empoleon, Staraptor, Luxray",
  "Roserade, Rampardos, Bastiodon, Lopunny, Spiritomb, Garchomp, Lucario, Hippowdon, Toxicroak",
  "Abomasnow, Weavile, Rhyperior, Leafeon, Glaceon, Gliscor, Mamoswine, Gallade, Froslass",
  "Rotom, Serperior, Emboar, Samurott, Samurott-Hisui, Watchog, Liepard, Simisage, Simisear",
  "Simipour, Musharna, Excadrill, Audino, Conkeldurr, Scolipede, Whimsicott, Krookodile",
  "Scrafty, Cofagrigus, Garbodor, Zoroark, Zoroark-Hisui, Reuniclus, Vanilluxe, Emolga",
  "Eelektross, Chandelure, Beartic, Stunfisk, Stunfisk-Galar, Golurk, Hydreigon, Volcarona",
  "Chesnaught, Delphox, Greninja, Diggersby, Talonflame, Vivillon, Pyroar, Floette, Florges",
  "Pangoro, Furfrou, Meowstic, Aegislash-Shield, Aromatisse, Slurpuff, Malamar, Barbaracle",
  "Dragalge, Clawitzer, Heliolisk, Tyrantrum, Aurorus, Sylveon, Hawlucha, Dedenne, Goodra",
  "Goodra-Hisui, Klefki, Trevenant, Gourgeist, Avalugg, Avalugg-Hisui, Noivern, Decidueye",
  "Decidueye-Hisui, Incineroar, Primarina, Toucannon, Crabominable, Lycanroc, Toxapex, Mudsdale",
  "Araquanid, Salazzle, Tsareena, Oranguru, Passimian, Mimikyu, Drampa, Kommo-o, Corviknight",
  "Flapple, Appletun, Sandaconda, Polteageist, Hatterene, Grimmsnarl, Mr. Rime, Runerigus",
  "Alcremie, Falinks, Morpeko, Dragapult, Wyrdeer, Kleavor, Basculegion, Sneasler, Overqwil",
  "Meowscarada, Skeledirge, Quaquaval, Maushold, Garganacl, Armarouge, Ceruledge, Bellibolt",
  "Scovillain, Espathra, Tinkaton, Palafin, Orthworm, Glimmora, Houndstone, Annihilape",
  "Farigiraf, Kingambit, Gholdengo, Sinistcha, Archaludon, Hydrapple",
]);

/** Mega Evolution forms available in the current roster. */
export const ROSTER_MEGAS: readonly string[] = split([
  "Venusaur-Mega, Charizard-Mega-X, Charizard-Mega-Y, Blastoise-Mega, Beedrill-Mega",
  "Pidgeot-Mega, Raichu-Mega-X, Raichu-Mega-Y, Clefable-Mega, Alakazam-Mega, Victreebel-Mega",
  "Slowbro-Mega, Gengar-Mega, Kangaskhan-Mega, Starmie-Mega, Pinsir-Mega, Gyarados-Mega",
  "Aerodactyl-Mega, Dragonite-Mega, Meganium-Mega, Feraligatr-Mega, Ampharos-Mega, Steelix-Mega",
  "Scizor-Mega, Heracross-Mega, Skarmory-Mega, Houndoom-Mega, Tyranitar-Mega, Sceptile-Mega",
  "Blaziken-Mega, Swampert-Mega, Gardevoir-Mega, Sableye-Mega, Mawile-Mega, Aggron-Mega",
  "Medicham-Mega, Manectric-Mega, Sharpedo-Mega, Camerupt-Mega, Altaria-Mega, Banette-Mega",
  "Chimecho-Mega, Absol-Mega, Glalie-Mega, Metagross-Mega, Staraptor-Mega, Lopunny-Mega",
  "Garchomp-Mega, Lucario-Mega, Abomasnow-Mega, Gallade-Mega, Froslass-Mega, Emboar-Mega",
  "Excadrill-Mega, Audino-Mega, Scolipede-Mega, Scrafty-Mega, Eelektross-Mega, Chandelure-Mega",
  "Golurk-Mega, Chesnaught-Mega, Delphox-Mega, Greninja-Mega, Pyroar-Mega, Floette-Mega",
  "Meowstic-M-Mega, Meowstic-F-Mega, Malamar-Mega, Barbaracle-Mega, Dragalge-Mega",
  "Hawlucha-Mega, Crabominable-Mega, Drampa-Mega, Falinks-Mega, Scovillain-Mega, Glimmora-Mega",
]);

/**
 * In-battle and appliance forms of roster species.
 *
 * Bulbapedia lists these under the base species, but they are separate dex
 * entries with different typings and stats - Rotom-Wash is Electric/Water where
 * plain Rotom is Electric/Ghost - so they must be enumerated or the whole Rotom
 * line reads as illegal.
 */
export const ROSTER_FORMS: readonly string[] = split([
  "Rotom-Wash, Rotom-Heat, Rotom-Frost, Rotom-Fan, Rotom-Mow, Lycanroc-Midnight, Lycanroc-Dusk",
  "Basculegion-F, Meowstic-F, Maushold-Four, Palafin-Hero, Gourgeist-Small, Gourgeist-Large",
  "Gourgeist-Super, Morpeko-Hangry, Mimikyu-Busted, Castform-Sunny, Castform-Rainy",
  "Castform-Snowy, Aegislash-Blade, Sinistcha-Masterpiece",
]);

/** Everything legal: base forms, in-battle forms and Megas. */
export const ROSTER_ALL: readonly string[] = [
  ...ROSTER_SPECIES, ...ROSTER_FORMS, ...ROSTER_MEGAS,
];

const LEGAL = new Set(ROSTER_ALL);

/** Forms excluded regardless of how they were obtained. */
export const BANNED_FORMS: readonly string[] = split([
  "Pikachu-Original, Pikachu-Hoenn, Pikachu-Sinnoh, Pikachu-Unova, Pikachu-Kalos",
  "Pikachu-Alola, Pikachu-Partner, Pikachu-World",
]);

/** Legal, but only obtainable by transfer - not through normal Champions play. */
export const TRANSFER_ONLY: readonly string[] = ['Floette-Eternal'];

/** Legal species, but with an ability that is banned. */
export const BANNED_ABILITIES: Record<string, string[]> = {
  Greninja: ['Battle Bond'],
};

export interface LegalityResult {
  legal: boolean;
  reason?: string;
}

/** Is this species usable in the current Champions roster? */
export function checkLegality(species: string): LegalityResult {
  if (BANNED_FORMS.includes(species)) {
    return { legal: false, reason: `${species} is an excluded form (cap Pikachu)` };
  }
  if (TRANSFER_ONLY.includes(species)) {
    return { legal: true, reason: `${species} is legal but transfer-only via Pokemon HOME` };
  }
  if (!LEGAL.has(species)) {
    return { legal: false, reason: `${species} is not in the current M-B roster` };
  }
  return { legal: true };
}

export const isLegal = (species: string): boolean => checkLegality(species).legal;

/** Is this species + ability pairing usable? Greninja may not run Battle Bond. */
export function checkAbilityLegality(species: string, ability?: string): LegalityResult {
  const base = checkLegality(species);
  if (!base.legal || !ability) return base;
  const banned = BANNED_ABILITIES[species];
  if (banned?.includes(ability)) {
    return { legal: false, reason: `${species} may not run ${ability} in this format` };
  }
  return base;
}

/** Roster entries whose name contains the query, case-insensitive. */
export function searchRoster(query: string, limit = 50): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return ROSTER_ALL.slice(0, limit);
  const starts: string[] = [], contains: string[] = [];
  for (const n of ROSTER_ALL) {
    const l = n.toLowerCase();
    if (l.startsWith(q)) starts.push(n);
    else if (l.includes(q)) contains.push(n);
  }
  return [...starts, ...contains].slice(0, limit);
}
