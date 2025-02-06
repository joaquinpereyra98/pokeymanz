import {
  descriptionsFields,
  pokemonTypeFields,
  attributeDiceFields,
} from "../common.mjs";

export default class MoveData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      pokemonTypes: new fields.SchemaField({
        primary: new fields.SchemaField({
          value: pokemonTypeFields(),
        }),
      }),
      category: new fields.StringField({
        blank: true,
        textSearch: true,
        choices: Object.entries(CONFIG.POKEYMANZ.items.move.categories).reduce(
          (acc, v) => {
            acc[v[0]] = v[1].label;
            return acc;
          },
          {}
        ),
      }),
      description: descriptionsFields(),
      stats: new fields.SchemaField({
        ...attributeDiceFields(),
      }),
    };
  }

  prepareBaseData() {
    for (const key in this.pokemonTypes) {
      const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
      const type = this.pokemonTypes[key];
      this.pokemonTypes[key] = {
        ...type,
        ...pokemonTypesList.find((t) => t.id === type.value),
      };
    }
  }
}
