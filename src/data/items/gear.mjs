import NotesHTMLField from "../commons/notes-html-field.mjs";

export default class GearData extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ITEM"];

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
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
      notes: new fields.SchemaField({
        description: new NotesHTMLField(),
        gmNotes: new NotesHTMLField(),
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

    if (!this.parent.parent instanceof Actor) this.equipped = false;

  }

  get hasSubtypes() {
    return !["rareItems", "supplies", "keyItems"].includes(this.type.value);
  }
}
