/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class PokeymanzActor extends Actor {
  /**
   * Gets the primary Pokémon type for this actor.
   * @returns {Object|null} The primary type object from the Pokémon types list, or null if not found.
   */
  get primaryType() {
    const id = this.system.stats.types.primary;
    const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
    const type = pokemonTypesList.find((type) => type.id === id);
    return type;
  }
  /**
   *
   * Gets the secondary Pokémon type for this actor.
   * @returns {Object|null} The secondary type object from the Pokémon types list, or null if not found.
   */
  get secondaryType() {
    const id = this.system.stats.types.secondary;
    const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
    const type = pokemonTypesList.find((type) => type.id === id);
    return type;
  }

  get haveAttributes() {
    return foundry.utils.hasProperty(this, "system.attributes");
  }

  /**
   * @inheritDoc
   */
  getRollData() {
    const data = super.getRollData();
    return data;
  }

  /**
   * Rolls an attribute for this actor.
   * Generates a roll formula based on the specified attribute's die, modifier, and wound penalties.
   * Sends the roll result to chat.
   *
   * @param {string} attribute - The name of the attribute to roll.
   * @param {Object} [option={}] - Additional options for the roll (not currently used).
   * @returns {Roll} The resulting roll object.
   */
  rollAttribute(attribute, option = {}) {
    const data = this.getRollData();
    const label = data.attributes[attribute].name;
    const die = data.attributes[attribute].die.sides;
    const mod = data.attributes[attribute].die.modifier.signedString();

    const wounds = `${this.calcWoundPenalties() || ""}`;

    const formula = `1d${die}x${mod}${wounds}[${label}]`;
    const roll = Roll.create(formula, data);
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: game.i18n.format("POKEYMANZ.AttributePromptTitle", {
        attr: label,
      }),
      rollMode: game.settings.get("core", "rollMode"),
    });
    return roll;
  }

  /**
   * Calculates the penalties from wounds for this actor.
   * The penalty is determined as the negative of the clamped wound value.
   *
   * @returns {number} The calculated wound penalty.
   */
  calcWoundPenalties() {
    const wounds = foundry.utils.getProperty(this, "system.stats.wounds");
    return Math.clamp(wounds.value, 0, wounds.max) * -1;
  }

  /**
   * An array of ActiveEffect instances which are present on
   * the Actor which are active and dont have limited duration.
   * @returns {ActiveEffect[]}
   */
  get passiveEffects() {
    const effects = Array.from(this.allApplicableEffects());
    return effects.filter((ef) => !ef.isTemporary && ef.active);
  }

  /**
   * An array of ActiveEffect instances which are present on the Actor Actor which are active and have a limited duration.
   * @returns {ActiveEffect[]}
   */
  get temporaryEffectsActive() {
    const effects = Array.from(this.allApplicableEffects());
    return effects.filter((ef) => ef.isTemporary && ef.active);
  }

  /**
   * An array of ActiveEffect instances which are present on the Actor Actor which are inactive
   * @returns {ActiveEffect[]}
   */
  get inactiveEffects() {
    const effects = Array.from(this.allApplicableEffects());
    return effects.filter((ef) => !ef.active);
  }
}
