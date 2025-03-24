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
          value: pokemonTypeFields({ blank: false, required: true }),
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
      ...attributeDiceFields(),
    };
  }

  /* -------------------------------------------- */

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

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;

    const { actor } = this.parent;

    const isItemInvalidForActor =
      actor?.system?.constructor?.metadata?.invalidItemTypes?.includes(
        this.parent.type
      );
    const hasReachedMaxMoves = actor?.itemTypes?.move?.length >= 4;

    if (isItemInvalidForActor || hasReachedMaxMoves) return false;
  }
}
