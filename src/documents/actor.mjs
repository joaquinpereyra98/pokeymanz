/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class PokeymanzActor extends foundry.documents.Actor {
  /**@inheritdoc */
  getRollData() {
    const data = super.getRollData();

    switch (this.type) {
      case "trainer":
        data.initiativeFormula = data.attributes.tactics.formula;
        break;
      case "pokemon":
        data.initiativeFormula = "1d6x";
    }

    return data;
  }

  /**
   * Rolls an attribute for this actor.
   * Generates a roll formula based on the specified attribute's die, modifier, and wound penalties.
   * Sends the roll result to chat.
   *
   * @param {string} attribute - The name of the attribute to roll.
   * @param {Object} [option={}] - Additional options for the roll (not currently used).
   * @returns {foundry.dice.Roll} The resulting roll object.
   */
  rollAttribute(attribute, option = {}) {
    const data = this.getRollData();
    const { label, formula } = foundry.utils.getProperty(
      data,
      `attributes.${attribute}`,
    );

    const wounds = `${this.calcWoundPenalties() || ""}`;

    const rollFormula = `${formula}${wounds}[${label}]`;
    const roll = foundry.dice.Roll.create(rollFormula, data);

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
    const { value, max } = this.system.stats.wounds;
    return (max - value) * -1;
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
