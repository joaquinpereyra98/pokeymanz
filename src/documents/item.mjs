export default class PokeymanzItem extends foundry.documents.Item {
  /** @inheritDoc */
  static getDefaultArtwork(itemData) {
    const img = CONFIG.POKEYMANZ.items[itemData.type].img ?? this.DEFAULT_ICON;
    return { img };
  }

  /** @inheritDoc */
  getRollData() {
    const rollData = this.parent?.getRollData?.() || {};
    rollData.item = foundry.utils.deepClone(this.system);
    return rollData;
  }

  get havePrice() {
    return foundry.utils.hasProperty(this, "system.price");
  }

  get isEquipable() {
    return foundry.utils.hasProperty(this, "system.equipped");
  }

  /**
   * Gets the Pokémon type for this item.
   * @returns {Object|null} The primary type object from the Pokémon types list, or null if not found.
   */
  get moveType() {
    return this.system?.pokemonTypes?.primary ?? null;
  }

  /**
   * An array of ActiveEffect instances which are present on
   * the Actor which are active and dont have limited duration.
   * @returns {foundry.documents.ActiveEffect[]}
   */
  get passiveEffects() {
    const effects = Array.from(this.effects);
    return effects.filter((ef) => !ef.isTemporary && ef.active);
  }

  /**
   * An array of ActiveEffect instances which are present on the Actor Actor which are active and have a limited duration.
   * @returns {foundry.documents.ActiveEffect[]}
   */
  get temporaryEffectsActive() {
    const effects = Array.from(this.effects);
    return effects.filter((ef) => ef.isTemporary && ef.active);
  }

  /**
   * An array of ActiveEffect instances which are present on the Actor Actor which are inactive
   * @returns {foundry.documents.ActiveEffect[]}
   */
  get inactiveEffects() {
    const effects = Array.from(this.effects);
    return effects.filter((ef) => !ef.active);
  }

  /**
   *
   */
  async use() {
    const type = this.type;
    switch (type) {
      case "move":
        await this._useMove();
        break;

      default:
        break;
    }
  }

  async _useMove() {
    const data = this.getRollData();
    const { formula } = data.item.roll;
    const roll = await foundry.dice.Roll.create(formula, data).evaluate();

    const rollContent = await roll.render();

    roll.toMessage({
      speaker: foundry.documents.ChatMessage.implementation.getSpeaker({
        actor: this.parent,
      }),
      flavor: this.name,
      messageMode: game.settings.get("core", "messageMode"),
      content: `${this.system.notes.description} ${rollContent}`,
    });
  }
}
