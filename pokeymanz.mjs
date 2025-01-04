import * as data from "./src/data/_module.mjs";
import * as document from "./src/documents/_module.mjs";
import * as apps from "./src/applications/_module.mjs";

import { POKEYMANZ } from "./src/config.mjs";

Hooks.once("init", () => {
  /* Exposing classes and variables */
  CONFIG.POKEYMANZ = POKEYMANZ;

  game.pokeymanz = {
    apps,
    document,
    data,
  };

  /*Registering data models*/
  Object.assign(CONFIG.Actor.dataModels, {
    trainer: data.TrainerData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    feat: data.FeatData,
  });

  /*Registering document class*/
  CONFIG.Actor.documentClass = document.Actor;
  CONFIG.Item.documentClass = document.Item;

  /*Registering Sheets*/
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Trainer Sheet", apps.actor.TrainerSheet, {
    types: ["trainer"],
    label: "POKEYMANZ.TrainerSheet",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("Feat Sheet", apps.item.FeatSheet, {
    makeDefault: true,
    label: "POKEYMANZ.ItemSheet",
  });
});
