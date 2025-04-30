import * as SYSTEM_CONST from "../../constants.mjs";

const { DataModel } = foundry.abstract;
const { fields } = foundry.data;

export default class AttributeDiceField extends fields.EmbeddedDataField {
  constructor(options) {
    super(AttributeDiceData, options);
  }
}

class AttributeDiceData extends DataModel {
  static defineSchema() {
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
      modifier: new fields.NumberField({ initial: 0, required: false, integer: true }),
    };
  }

  get formula() {
    const formula = `${this._diceFormulaPart}${this._modFormulaPart}`;
    return Roll.validate(formula) ? formula : `${this._diceFormulaPart}`;
  }

  get label() {
    return game.i18n.localize(this.schema.label);
  }

  _diceFormulaPart = `1d${this.faces}x`;

  _modFormulaPart = this.modifier.signedString();

  get diceIcon() {
    return `${SYSTEM_CONST.ASSETS_PATH}/dice/d${this.faces}.svg`;
  }

}
