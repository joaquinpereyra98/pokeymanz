import BaseActorData from "./base-actor.mjs";
import NotesHTMLField from "../fields/notes-html-field.mjs";
import AttributeData from "../attribute-data.mjs";

/**
 * @import PokeymanzActor from "../../documents/actor.mjs";
 * @import PokemonData from "./pokemon.mjs";
 */

export default class TrainerData extends BaseActorData {
  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ACTOR", "POKEYMANZ.TRAINER"];

  /**@inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      progress: new fields.SchemaField({
        advancement: new fields.NumberField({ initial: 0 }),
        experience: new fields.NumberField({ initial: 0 }),
      }),
      attributes: new fields.SchemaField({
        heart: new fields.EmbeddedDataField(AttributeData),
        fitness: new fields.EmbeddedDataField(AttributeData),
        research: new fields.EmbeddedDataField(AttributeData),
        tactics: new fields.EmbeddedDataField(AttributeData),
      }),
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
