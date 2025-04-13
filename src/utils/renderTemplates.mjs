import * as SYSTEM_CONST from "../constants.mjs";

export default async function renderTemplates() {
  return await loadTemplates({
    "pokeymanz.effect-list": `${SYSTEM_CONST.TEMPLATES_PATH}/commons/effects-list.hbs`,
    "pokeymanz.attributes-container": `${SYSTEM_CONST.TEMPLATES_PATH}/actors/partials/attributes-container.hbs`,
  });
}
