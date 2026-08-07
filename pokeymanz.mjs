import * as data from "./src/data/_module.mjs";
import * as document from "./src/documents/_module.mjs";
import * as apps from "./src/applications/_module.mjs";

import { POKEYMANZ } from "./src/config.mjs";
import utils from "./src/utils/_module.mjs";
import { SYSTEM_ID } from "./src/constants.mjs";

/* Exposing classes and variables */
CONFIG.POKEYMANZ = POKEYMANZ;

game[SYSTEM_ID] = {
  apps,
  document,
  data,
};

Hooks.once("init", () => {
  /*Registering data models*/
  Object.assign(CONFIG.Actor.dataModels, {
    trainer: data.actor.TrainerData,
    pokemon: data.actor.PokemonData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    ability: data.item.AbilityData,
    feat: data.item.FeatData,
    gear: data.item.GearData,
    move: data.item.MoveData,
  });

  /*Registering document class*/
  CONFIG.Actor.documentClass = document.PokeymanzActor;
  CONFIG.Item.documentClass = document.PokeymanzItem;

  /*Registering Sheets*/
  foundry.documents.collections.Actors.registerSheet(
    "Trainer Sheet",
    apps.actor.TrainerSheet,
    {
      types: ["trainer"],
      label: "POKEYMANZ.TrainerSheet",
    },
  );

  foundry.documents.collections.Actors.registerSheet(
    "Pokemon Sheet",
    apps.actor.PokemonSheet,
    {
      types: ["pokemon"],
      label: "POKEYMANZ.PokemonSheet",
    },
  );

  for (const sheet of Object.values(apps.item)) {
    if (!sheet.metadata.register) continue;
    const options = foundry.utils.duplicate(sheet.metadata);
    delete options.register;

    foundry.applications.apps.DocumentSheetConfig.registerSheet(
      foundry.documents.Item,
      SYSTEM_ID,
      sheet,
      options,
    );
  }

  utils.renderTemplates();
});
