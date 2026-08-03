import * as SYSTEM_CONST from "../constants.mjs";

export default async function renderTemplates() {
  return await foundry.applications.handlebars.loadTemplates({
    "pokeymanz.effect-list": `${SYSTEM_CONST.TEMPLATES_PATH}/commons/effects-list.hbs`,
  });
}
