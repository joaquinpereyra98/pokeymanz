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
    const config = CONFIG.POKEYMANZ.items.feat;

    this.type.choices = Object.fromEntries(
      Object.entries(config.types).map(([key, { label }]) => [key, label])
    );
    
    if (this.type.value) {
      const typeConfig = config.types[this.type.value] || {};
      this.subtype.choices = { "": "", ...typeConfig.subtypes };
      this.type.label = typeConfig.label ?? null;
      this.subtype.label = typeConfig.subtypes?.[this.subtype.value] ?? null;
    }
    
  }
}
