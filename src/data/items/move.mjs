import { ITEMS_ASSETS_PATH } from "../../constants.mjs";
import BaseItemData from "./base-item.mjs";
import { pokemonTypeFields } from "../common.mjs";
import AttributeData from "../attribute-data.mjs";

export default class MoveData extends BaseItemData {
  /**@inheritdoc */
  static get metadata() {
    return {
      ...super.metadata,
      icon: "fa-solid fa-meteor",
      type: "move",
      defaultImg: `${ITEMS_ASSETS_PATH}/comet-spark.svg`,
    };
  }

  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ITEM"];

  /**@inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      pokemonTypes: new fields.SchemaField({
        primary: new fields.SchemaField({
          value: pokemonTypeFields({ blank: false, required: true }),
        }),
      }),
      category: new fields.StringField({
        blank: true,
        textSearch: true,
        choices: Object.entries(CONFIG.POKEYMANZ.items.move.categories).reduce(
          (acc, v) => {
            acc[v[0]] = v[1].label;
            return acc;
          },
          {},
        ),
      }),
      roll: new fields.EmbeddedDataField(AttributeData, {
        label: "POKEYMANZ.Moves.Dice",
      }),
    };
  }

  /* -------------------------------------------- */

  prepareBaseData() {
    for (const key in this.pokemonTypes) {
      const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
      const type = this.pokemonTypes[key];
      this.pokemonTypes[key] = {
        ...type,
        ...pokemonTypesList.find((t) => t.id === type.value),
      };
    }
  }

  /* -------------------------------------------- */
}
