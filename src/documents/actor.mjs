export default class PokeymanzActor extends Actor {
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.pokeymanz || {};
    if (systemData.setting.autoCalcToughness) {
      systemData.stats.toughness.value =
        systemData.attributes.fitness.die.sides / 2;
    }
    systemData.stats.toughness.sum =
      systemData.stats.toughness.value + systemData.stats.toughness.modifier;
  }
  getRollData() {
    const data = super.getRollData();
    const attributes = foundry.utils.deepClone(this.system.attributes);
    for(const attributeKey of Object.keys(attributes)){
      data.attributes[attributeKey].name = game.i18n.localize(`POKEYMANZ.Attributes.${attributeKey.capitalize()}`)
    }
    return data;
  }
  rollAttribute(attribute, option = {}) {
    const data = this.getRollData();
    const label = data.attributes[attribute].name;
    const die = data.attributes[attribute].die.sides;
    const mod = data.attributes[attribute].die.modifier.signedString();

    const wounds = `${this.calcWoundPenalties() || ""}`;

    const formula = `1d${die}x${mod}${wounds}[${label}]`;
    let roll = new Roll(formula, data);
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: game.i18n.format("POKEYMANZ.AttributePromptTitle", {
        attr: label,
      }),
      rollMode: game.settings.get("core", "rollMode"),
    });
    return roll;
  }

  calcWoundPenalties() {
    const wounds = foundry.utils.getProperty(this, "system.stats.wounds");
    return Math.clamp(wounds.value, 0, wounds.max) * -1;
  }
}
