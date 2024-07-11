export default class PokeymanzItemSheet extends ItemSheet {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["pokeymanz", "sheet", "item"],
        width: 605,
        height: 480,
      });
    }
    get template() {
      return `systems/pokeymanz/templates/items/${this.item.type}-sheet.hbs`;
    }
    async getData(options) {
      const context = await super.getData(options);
      const itemData = context.item;
  
      const actor = this.object?.parent;
      return foundry.utils.mergeObject(context, {
        rollData: actor?.getRollData() ?? null,
  
        system: itemData.system,
        flags: itemData.flags,
        itemCategory: CONFIG.POKEYMANZ.itemCategories[this.item.type],
        itemType: game.i18n.localize(CONFIG.POKEYMANZ.itemTypes[this.item.type]),
        enrichedHTML: Object.fromEntries(
          await Promise.all(
            Object.entries(this.item.system.enrichedTexts).map(
              async ([key, val]) => [
                key + "HTML",
                await TextEditor.enrichHTML(val, { async: true }),
              ]
            )
          )
        ),
      });
    }
    activateListeners(html) {
      super.activateListeners(html);
    }
  }