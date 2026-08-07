import BaseActorData from "./base-actor.mjs";
import NotesHTMLField from "../commons/notes-html-field.mjs";

export default class PokemonData extends BaseActorData {
  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ACTOR"];

  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = super.defineSchema();
    schema.stats.extendFields({
      toughness: new fields.SchemaField({
        value: new fields.NumberField({ initial: 4, integer: true }),
      }),
      mastery: new fields.SchemaField({
        value1: new fields.BooleanField({ initial: true }),
        value2: new fields.BooleanField({ initial: false }),
      }),
      exp: new fields.NumberField({
        initial: 0,
        integer: true,
      }),
    });
    return {
      ...schema,
      details: new fields.SchemaField({
        species: new fields.StringField({ initial: "" }),
        gender: new fields.StringField({ initial: "" }),
      }),
      notes: new fields.SchemaField({
        pokedexEntry: new NotesHTMLField(),
      }),
      trainer: new fields.SchemaField({
        value: new fields.ForeignDocumentField(foundry.documents.BaseActor),
        inTeam: new fields.BooleanField({ initial: false }),
      }),
    };
  }

  /* -------------------------------------------- */

  get ability() {}

  /* -------------------------------------------- */

  /**@inheritdoc */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /* -------------------------------------------- */
}
