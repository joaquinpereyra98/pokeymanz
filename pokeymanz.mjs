import * as data from "./src/data/_module.mjs";
import * as documentClass from "./src/documents/_module.mjs";
import PokeymanzActorSheet  from "./src/sheets/actor-sheet.mjs"
import PokeymanzItemSheet from"./src/sheets/item-sheet.mjs"
const POKEYMANZ = {
  attributes: {
    heart: {
      label: "POKEYMANZ.Heart",
    },
    fitness: {
      label: "POKEYMANZ.Fitness",
    },
    research: {
      label: "POKEYMANZ.Research",
    },
    tatics: {
      label: "POKEYMANZ.Tatics",
    },
  },
  pokemonTypes: {
    none: "POKEYMANZ.None",
    normal: "POKEYMANZ.Normal",
    fire: "POKEYMANZ.Fire",
    water: "POKEYMANZ.Water",
    grass: "POKEYMANZ.Grass",
    flying: "POKEYMANZ.Flying",
    fighting: "POKEYMANZ.Fighting",
    poison: "POKEYMANZ.Poison",
    electric: "POKEYMANZ.Electric",
    ground: "POKEYMANZ.Ground",
    rock: "POKEYMANZ.Rock",
    psychic: "POKEYMANZ.Psychic",
    ice: "POKEYMANZ.Ice",
    bug: "POKEYMANZ.Bug",
    ghost: "POKEYMANZ.Ghost",
    steel: "POKEYMANZ.Steel",
    dragon: "POKEYMANZ.Dragon",
    dark: "POKEYMANZ.Dark",
    fairy: "POKEYMANZ.Fairy",
  },
  itemCategories: {
    edge: {
      battle: "POKEYMANZ.Battle",
      social: "POKEYMANZ.Social",
      utility: "POKEYMANZ.Utility",
    },
  },
  itemTypes: {
    edge: "POKEYMANZ.Edge",
  },
};
Hooks.once("init", () => {
  Object.assign(CONFIG.Actor.dataModels, {
    character: data.Character,
  });
  Object.assign(CONFIG.Item.dataModels, {
    edge: data.Item,
  });
  game.pokeymanz = {
    sheets: {
      PokeymanzActorSheet,
      PokeymanzItemSheet
    }
  };

  /*Registering ActorDocumments*/
  CONFIG.Actor.documentClass = documentClass.Actor;
  CONFIG.Item.documentClass = documentClass.Item;

  /*Registering ActorSheets*/
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Character Sheet", PokeymanzActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "POKEYMANZ.CharacterSheet",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("Item Sheet", PokeymanzItemSheet, {
    makeDefault: true,
    label: "POKEYMANZ.ItemSheet",
  });
});
