import { pokemonTypeFields } from "../common.mjs";

export default class BaseActorData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ACTOR"];

  /**@inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      stats: new fields.SchemaField({
        toughness: new fields.SchemaField({
          value: new fields.NumberField({
            initial: 0,
            integer: true,
            nullable: false,
            required: true,
          }),
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
      }),
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  prepareBaseData() {
    super.prepareBaseData();

    // Common logic for hydrating pokemon type data
    if (this.stats?.pokemonTypes) {
      const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
      for (const key in this.stats.pokemonTypes) {
        const type = this.stats.pokemonTypes[key];
        this.stats.pokemonTypes[key] = {
          ...type,
          ...pokemonTypesList.find((t) => t.id === type.value),
        };
      }
    }
  }
}
