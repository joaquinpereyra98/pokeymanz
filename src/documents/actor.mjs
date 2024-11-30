export default class PokeymanzActor extends Actor {
  get primaryType() {
    const id = this.system.stats.types.primary;
    const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
    const type = pokemonTypesList.find((type) => type.id === id);
    return type;
  }
  get secondaryType() {
    const id = this.system.stats.types.secondary;
    const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
    const type = pokemonTypesList.find((type) => type.id === id);
    return type;
  }
  getRollData() {
    const data = super.getRollData();
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
