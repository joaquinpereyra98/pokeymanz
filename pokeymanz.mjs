import * as data from "./src/data/_module.mjs";
import * as document from "./src/documents/_module.mjs";
import * as apps from "./src/applications/_module.mjs";

import { POKEYMANZ } from "./src/config.mjs";
import utils from "./src/utils/_module.mjs";

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
    trainer: data.actor.TrainerData,
    pokemon: data.actor.PokemonData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    feat: data.item.FeatData,
    gear: data.item.GearData,
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
  Actors.registerSheet("Pokemon Sheet", apps.actor.PokemonSheet, {
    types: ["pokemon"],
    label: "POKEYMANZ.PokemonSheet",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("Feat Sheet", apps.item.FeatSheet, {
    types: ["feat"],
    makeDefault: true,
    label: "POKEYMANZ.FeatSheet",
  });
  Items.registerSheet("Gear Sheet", apps.item.GearSheet, {
    types: ["gear"],
    makeDefault: true,
    label: "POKEYMANZ.GearSheet",
  });

  utils.renderTemplates();
});
