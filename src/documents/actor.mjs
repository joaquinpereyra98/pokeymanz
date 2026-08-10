/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class PokeymanzActor extends foundry.documents.Actor {
  constructor(data, context) {
    super(data, context);

    /**
     * A collection of Application instances which should be re-rendered whenever this document is updated.
     * @type {Record<string,Application|ApplicationV2>}
     */
    Object.defineProperty(this, "relatedApps", {
      value: {},
      writable: false,
      enumerable: false,
    });
  }
  
  /**@inheritdoc */
  render(force = false, context = {}) {
    super.render(force, context);
    for (const app of Object.values(this.relatedApps)) {
      app.render(force, foundry.utils.deepClone(context));
    }
  }
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
      speaker: foundry.documents.ChatMessage.implementation.getSpeaker({
        actor: this.actor,
      }),
      flavor: _loc("POKEYMANZ.AttributePromptTitle", {
        attr: label,
      }),
      messageMode: game.settings.get("core", "messageMode"),
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
