export default async function renderTemplates() {
    return await loadTemplates({
        "pokeymanz.effect-list": "systems/pokeymanz/templates/commons/effects-list.hbs",
        "pokeymanz.attributes-container": "systems/pokeymanz/templates/actors/partials/attributes-container.hbs",
    })
}
