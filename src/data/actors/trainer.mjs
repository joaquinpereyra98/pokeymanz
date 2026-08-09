import BaseActorData from "./base-actor.mjs";

import NotesHTMLField from "../commons/notes-html-field.mjs";

import AttributeDiceField from "../commons/attribute-dice-field.mjs";

/**
 * @import PokeymanzActor from "../../documents/actor.mjs";
 * @import PokemonData from "./pokemon.mjs";
 */

export default class TrainerData extends BaseActorData {
  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ACTOR"];

  /**@inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      attributes: new fields.SchemaField(
        ["heart", "fitness", "research", "tactics"].reduce((acc, v) => {
          acc[v] = new AttributeDiceField({
            label: `POKEYMANZ.Attributes.${v.capitalize()}`,
          });
          return acc;
        }, {}),
      ),

      details: new fields.SchemaField({
        calling: new fields.StringField({ initial: "" }),
        pronouns: new fields.StringField({ initial: "" }),
        age: new fields.NumberField({ integer: true }),
      }),
      currency: new fields.NumberField({
        initial: 0,
        integer: true,
      }),
      notes: new fields.SchemaField({
        biography: new NotesHTMLField(),
      }),
    };
  }

  /* -------------------------------------------- */

  /**@inheritdoc */
  prepareBaseData() {
    super.prepareBaseData();

    for (const key in this.attributes) {
      const attribute = this.attributes[key];
      attribute.name = `POKEYMANZ.Attributes.${key.capitalize()}`;
    }
  }

  /* -------------------------------------------- */

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

  /* -------------------------------------------- */
  /**
   * @type {Omit<PokeymanzActor, "system"> & {
   *   system: PokemonData;
   * }}
   */
  get pokemons() {
    return game.actors.filter(
      (a) =>
        a.system?.trainer?.value?.id === this.parent.id && a.type === "pokemon",
    );
  }
}
