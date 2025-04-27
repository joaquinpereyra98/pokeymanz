import NotesHTMLField from "../commons/notes-html-field.mjs";

export default class FeatData extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ITEM"];

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
      notes: new fields.SchemaField({
        description: new NotesHTMLField(),
        gmNotes: new NotesHTMLField({ gmOnly: true }),
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

  get hasSubtypes() {
    return true;
  }
}
