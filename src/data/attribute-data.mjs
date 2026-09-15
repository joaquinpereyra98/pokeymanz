import { ASSETS_PATH } from "../constants.mjs";

export default class AttributeData extends foundry.abstract.DataModel {
  static defineSchema() {
    const { fields } = foundry.data;
    return {
      faces: new fields.NumberField({
        initial: 4,
        required: true,
        integer: true,
        positive: true,
        min: 1,
        choices: CONFIG.POKEYMANZ.diceSteps.reduce((acc, value) => {
          acc[value] = `d${value}`;
          return acc;
        }, {}),
      }),
      modifier: new fields.NumberField({
        initial: 0,
        required: false,
        integer: true,
      }),
    };
  }

  get formula() {
    const modifier = (this.modifier && this.modifier.signedString()) || "";
    const formula = `1d${this.faces}x${modifier}`;
    return foundry.dice.Roll.defaultImplementation.validate(formula)
      ? formula
      : `1d${this.faces}x`;
  }

  get label() {
    return _loc(this.schema.label);
  }


  get diceIcon() {
    return `${ASSETS_PATH}/dice/d${this.faces}.svg`;
  }
}
