import * as data from "./src/data/_module.mjs";
import * as documentClass from "./src/documents/_module.mjs";
import PokeymanzActorSheet  from "./src/sheets/actor-sheet.mjs"
import PokeymanzItemSheet from"./src/sheets/item-sheet.mjs"
import { POKEYMANZ } from "./src/config.mjs";

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

  CONFIG.POKEYMANZ = POKEYMANZ;
  
});
