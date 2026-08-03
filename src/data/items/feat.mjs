import { ITEMS_ASSETS_PATH } from "../../constants.mjs";
import BaseItemData from "./base-item.mjs";

export default class FeatData extends BaseItemData {
  /**@inheritdoc */
  static get metadata() {
    return {
      ...super.metadata,
      icon: "fa-solid fa-star",
      type: "feat",
      defaultImg: `${ITEMS_ASSETS_PATH}/round-star.svg`,
      invalidActorTypes: ["pokemon"],
    };
  }

  /**@inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      type: new fields.SchemaField({
        value: new fields.StringField({
          initial: "edge",
          required: true,
          textSearch: true,
        }),
      }),
      subtype: new fields.SchemaField({
        value: new fields.StringField({
          blank: true,
          textSearch: true,
        }),
      }),
    };
  }
  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    const config = CONFIG.POKEYMANZ.items.feat;

    this.type.choices = Object.fromEntries(
      Object.entries(config.types).map(([key, { label }]) => [key, label]),
    );

    if (this.type.value) {
      const typeConfig = config.types[this.type.value] || {};
      this.subtype.choices = { "": "", ...typeConfig.subtypes };
      this.type.label = typeConfig.label ?? null;
      this.subtype.label = typeConfig.subtypes?.[this.subtype.value] ?? null;
    }
  }
}
