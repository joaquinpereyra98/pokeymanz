import {
  attributeDiceFields,
  pokemonTypeFields,
  descriptionsFields,
} from "../common.mjs";

export default class TrainerData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      attributes: new fields.SchemaField({
        heart: new fields.SchemaField(attributeDiceFields()),
        fitness: new fields.SchemaField(attributeDiceFields()),
        research: new fields.SchemaField(attributeDiceFields()),
        tactics: new fields.SchemaField(attributeDiceFields()),
      }),
      stats: new fields.SchemaField({
        toughness: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true }),
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
      details: new fields.SchemaField({
        calling: new fields.StringField({ initial: "", size: "large" }),
        pronouns: new fields.StringField({ initial: "", size: "medium" }),
        age: new fields.NumberField({ integer: true, size: "xsmall" }),
      }),
      description: descriptionsFields(),
      currency: new fields.NumberField({
        initial: 0,
        integer: true,
        size: "xsmall",
      }),
    };
  }
  prepareBaseData() {
    for (const key in this.stats.pokemonTypes) {
      const pokemonTypesList = CONFIG.POKEYMANZ.pokemonTypesList;
      const type = this.stats.pokemonTypes[key];
      this.stats.pokemonTypes[key] = {
        ...type,
        ...pokemonTypesList.find((t) => t.id === type.value),
      };
    }

    for (const key in this.attributes) {
      const attribute = this.attributes[key];
      attribute.name = `POKEYMANZ.Attributes.${key.capitalize()}`;
    }
  }

  /** @override */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    this.parent.updateSource({
      prototypeToken: {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        sight: {
          enabled: true,
        },
      },
    });
  }
}
