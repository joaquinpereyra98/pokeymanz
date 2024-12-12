export default class PokeymanzItem extends Item {
  static getDefaultArtwork(itemData) {
    const img = CONFIG.POKEYMANZ.items[itemData.type].img ?? this.DEFAULT_ICON;
    return { img };
  }

  getRollData() {
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);
    return rollData;
  }
}
