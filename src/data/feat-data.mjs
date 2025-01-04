import { descriptionsFields } from "./common.mjs";

export default class FeatData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
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
      description: descriptionsFields(),
    };
  }
  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    if (this.type.value) {
      const config = CONFIG.POKEYMANZ.items.feat.types[this.type.value];
      if (config) {
        this.type.label = config.label ?? null;
        this.subtype.label = config.subtypes?.[this.subtype.value] ?? null;
      }
    }
  }
}
