export default class PokeymanzItem extends Item {
  /**
   * @inheritDoc
   */
  static getDefaultArtwork(itemData) {
    const img = CONFIG.POKEYMANZ.items[itemData.type].img ?? this.DEFAULT_ICON;
    return { img };
  }

  /**
   * @inheritDoc
   */
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
    if (!foundry.utils.hasProperty(this, "system.type")) return null;

    const id = foundry.utils.getProperty(this, "system.type");
    const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
    const type = pokemonTypesList.find((type) => type.id === id);

    return type;
  }

  /**
   * An array of ActiveEffect instances which are present on
   * the Actor which are active and dont have limited duration.
   * @returns {ActiveEffect[]}
   */
  get passiveEffects() {
    const effects = Array.from(this.effects);
    return effects.filter((ef) => !ef.isTemporary && ef.active);
  }

  /**
   * An array of ActiveEffect instances which are present on the Actor Actor which are active and have a limited duration.
   * @returns {ActiveEffect[]}
   */
  get temporaryEffectsActive() {
    const effects = Array.from(this.effects);
    return effects.filter((ef) => ef.isTemporary && ef.active);
  }

  /**
   * An array of ActiveEffect instances which are present on the Actor Actor which are inactive
   * @returns {ActiveEffect[]}
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
    const die = data.item.die.sides;
    const mod = data.item.die.modifier.signedString();

    const formula = `1d${die}x${mod}`;
    const roll = await Roll.create(formula, data).evaluate();

    const rollContente = await roll.render();

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.parent }),
      flavor: this.name,
      rollMode: game.settings.get("core", "rollMode"),
      content: `${data.item.description.value} ${rollContente}`,
    });

  }
}
