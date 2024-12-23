import * as data from "./src/data/_module.mjs";
import * as documentClass from "./src/documents/_module.mjs";
import * as apps from "./src/applications/_module.mjs";
import { POKEYMANZ } from "./src/config.mjs";

Hooks.once("init", () => {
  CONFIG.POKEYMANZ = POKEYMANZ;
  Object.assign(CONFIG.Actor.dataModels, {
    character: data.Character,
  });
  Object.assign(CONFIG.Item.dataModels, {
    feat: data.Feat,
  });
  game.pokeymanz = {
    sheets: {
      actor: apps.ActorSheet,
      item: apps.ItemSheet,
    },
  };

  /*Registering ActorDocumments*/
  CONFIG.Actor.documentClass = documentClass.Actor;
  CONFIG.Item.documentClass = documentClass.Item;

  /*Registering ActorSheets*/
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Character Sheet", apps.ActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "POKEYMANZ.CharacterSheet",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("Item Sheet", apps.ItemSheet, {
    makeDefault: true,
    label: "POKEYMANZ.ItemSheet",
  });
});
