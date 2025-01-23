import {
  attributeDiceFields,
  pokemonTypeFields,
  descriptionsFields,
} from "../common.mjs";

export default class PokemonData extends foundry.abstract.TypeDataModel {
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
        types: new fields.SchemaField({
          primary: pokemonTypeFields(),
          secondary: pokemonTypeFields(),
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
        species: new fields.StringField({ initial: "" }),
        gender: new fields.StringField({ initial: "" }),
      }),
      description: descriptionsFields(),
    };
  }
}
