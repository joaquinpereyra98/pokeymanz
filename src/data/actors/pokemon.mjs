import BaseActorData from "./base-actor.mjs";
import NotesHTMLField from "../fields/notes-html-field.mjs";
import TrainerDocumentField from "../fields/trainer-document-field.mjs";

export default class PokemonData extends BaseActorData {
  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ACTOR", "POKEYMANZ.POKEMON"];

  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = super.defineSchema();
    schema.stats.extendFields({
      toughness: new fields.SchemaField({
        value: new fields.NumberField({ initial: 4, integer: true }),
      }),
    });
    return {
      ...schema,
      progress: new fields.SchemaField({
        mastery: new fields.NumberField({ initial: 0 }),
      }),
      details: new fields.SchemaField({
        species: new fields.StringField({ initial: "" }),
        gender: new fields.StringField({ initial: "" }),
      }),
      notes: new fields.SchemaField({
        pokedexEntry: new NotesHTMLField(),
      }),
      trainer: new fields.SchemaField({
        value: new TrainerDocumentField(foundry.documents.BaseActor),
        inTeam: new fields.BooleanField({ initial: false }),
      }),
    };
  }

  /* -------------------------------------------- */

  get ability() {}

  /* -------------------------------------------- */

  /**@inheritdoc */
  async _preUpdate(changes, options, user) {
    const allowed = await super._preUpdate(changes, options, user);
    if (allowed === false) return false;

    const changeTrainerID = changes?.system?.trainer?.value;
    const sourceTrainerID = this._source?.trainer?.value;

    if (changeTrainerID !== undefined && changeTrainerID !== sourceTrainerID) {
      this._checkDependedApps(changeTrainerID, sourceTrainerID);
    }
  }

  /**
   *
   * @param {string} changeTrainerID
   * @param {string} sourceTrainerID
   * @returns
   */
  _checkDependedApps(changeTrainerID, sourceTrainerID) {
    const sheet = this.parent?.sheet;
    if (!sheet) return;

    const changedTrainer = changeTrainerID
      ? game.actors.get(changeTrainerID)
      : null;
    const sourceTrainer = sourceTrainerID
      ? game.actors.get(sourceTrainerID)
      : null;

    const appId = sheet.id;

    if (changedTrainer?.apps) {
      changedTrainer.apps[appId] = sheet;
    }

    if (sourceTrainer?.apps && sourceTrainer.apps[appId]) {
      delete sourceTrainer.apps[appId];
    }
  }

  /* -------------------------------------------- */
}
