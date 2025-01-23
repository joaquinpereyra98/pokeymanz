import { descriptionsFields, pokemonTypeFields } from "../common.mjs";

export default class MovesData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    return {
      type: pokemonTypeFields(),
      category: new fields.StringField({
        blank: true,
        textSearch: true,
        choices: Object.entries(CONFIG.POKEYMANZ.items.moves.categories).reduce( (acc,v) => {
        acc[v[0]] = v[1].label;
        return acc;
    }, {}),
      }),
      description: descriptionsFields(),
    };
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  get hasSubtypes() {
    return false;
  }
}
