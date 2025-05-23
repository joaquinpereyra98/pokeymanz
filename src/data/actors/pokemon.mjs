import { pokemonTypeFields } from "../common.mjs";
import NotesHTMLField from "../commons/notes-html-field.mjs";

export default class PokemonData extends foundry.abstract.TypeDataModel {

  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ACTOR"];

  /**
   * Key information about this Actor subtype
   */
  static metadata = Object.freeze({
    invalidItemTypes: ["feat", "gear"],
  });

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      stats: new fields.SchemaField({
        mastery: new fields.SchemaField({
          value1: new fields.BooleanField({ initial: true }),
          value2: new fields.BooleanField({ initial: false }),
        }),
        exp: new fields.NumberField({
          initial: 0,
          integer: true,
        }),
        toughness: new fields.SchemaField({
          value: new fields.NumberField({ initial: 4, integer: true }),
        }),
        pokemonTypes: new fields.SchemaField({
          primary: new fields.SchemaField({
            value: pokemonTypeFields(),
          }),
          secondary: new fields.SchemaField({
            value: pokemonTypeFields(),
          }),
        }),
        wounds: new fields.SchemaField({
          value: new fields.NumberField({ initial: 3 }),
          max: new fields.NumberField({ initial: 3 }),
        }),
        ability: new fields.HTMLField({
          initial: "",
          label: "POKEYMANZ.Description",
        }),
      }),
      details: new fields.SchemaField({
        species: new fields.StringField({ initial: "", size: "medium" }),
        gender: new fields.StringField({ initial: "", size: "small" }),
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

  prepareBaseData() {
    for (const key in this.stats.pokemonTypes) {
      const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
      const type = this.stats.pokemonTypes[key];
      this.stats.pokemonTypes[key] = {
        ...type,
        ...pokemonTypesList.find((t) => t.id === type.value),
      };
    }
  }

  /* -------------------------------------------- */
}
