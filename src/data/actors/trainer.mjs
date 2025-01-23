import {
  attributeDiceFields,
  boundTraitDie,
  pokemonTypeFields,
  descriptionsFields,
} from "../common.mjs";

export default class TrainerData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      attributes: new fields.SchemaField(
        {
          heart: new fields.SchemaField(attributeDiceFields()),
          fitness: new fields.SchemaField(attributeDiceFields()),
          research: new fields.SchemaField(attributeDiceFields()),
          tactics: new fields.SchemaField(attributeDiceFields()),
        }
      ),
      stats: new fields.SchemaField({
        toughness: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true }),
        }),
        types: new fields.SchemaField({
          primary: pokemonTypeFields(),
          secondary: pokemonTypeFields(),
        }),
        wounds: new fields.SchemaField({
          value: new fields.NumberField({ initial: 3 }),
          max: new fields.NumberField({ initial: 3 }),
        }),
      }),
      details: new fields.SchemaField({
        calling: new fields.StringField({ initial: "" }),
        currency: new fields.NumberField({ initial: 0, integer: true }),
        pronouns: new fields.StringField({ initial: "" }),
        age: new fields.NumberField({ integer: true }),
      }),
      description: descriptionsFields(),
    };
  }
  prepareBaseData() {
    for (const key in this.attributes) {
      const attribute = this.attributes[key];
      attribute.name = `POKEYMANZ.Attributes.${key.capitalize()}`;
    }
  }
  prepareDerivedData() {
    Object.entries(this.attributes).forEach(([key, attribute]) => {
      attribute.die = boundTraitDie(attribute.die);
    });
  }
}
