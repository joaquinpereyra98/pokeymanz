import BaseItemData from "./base-item.mjs";

export default class GearData extends BaseItemData {
  /**@inheritdoc */
  static get metadata() {
    return {
      ...super.metadata,
      icon: "fa-solid fa-backpack",
      type: "gear",
      defaultImg: `${ITEMS_ASSETS_PATH}/backpack.svg`,
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
          initial: "curative",
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
      price: new fields.NumberField({
        initial: 0,
        integer: true,
      }),
      equipped: new fields.BooleanField({
        initial: false,
      }),
    };
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    const config = CONFIG.POKEYMANZ.items.gear;

    this.type.choices = Object.fromEntries(
      Object.entries(config.types).map(([key, { label }]) => [key, label]),
    );

    if (this.type.value) {
      const typeConfig = config.types[this.type.value] || {};
      this.subtype.choices = { "": "", ...typeConfig.subtypes };
      this.type.label = typeConfig.label ?? null;
      this.subtype.label = typeConfig.subtypes?.[this.subtype.value] ?? null;
    }

    if ((!this.parent.parent) instanceof Actor) this.equipped = false;
  }
}
