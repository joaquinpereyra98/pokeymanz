import NotesHTMLField from "../commons/notes-html-field.mjs";

/**
 * @typedef ItemMetadata
 * @property {string} icon
 * @property {string} type
 * @property {string} defaultImg
 * @property {string[]} invalidActorTypes
 */

export default class BaseItemData extends foundry.abstract.TypeDataModel {
  /**
   * Key information about this item subtype.
   * @type {ItemMetadata}
   */
  static get metadata() {
    return {
      icon: "fa-solid fa-suitcase",
      type: "base",
      defaultImg: "",
      invalidActorTypes: [],
    };
  }

  /** @override */
  static LOCALIZATION_PREFIXES = ["POKEYMANZ.BASE_ITEM"];

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      notes: new fields.SchemaField({
        description: new NotesHTMLField(),
        gmNotes: new NotesHTMLField({ gmOnly: true }),
      }),
    };
  }

  /* -------------------------------------------- */
  /*  Life Cycle Hooks                            */
  /* -------------------------------------------- */

  /** @override */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;

    const actor = this.parent?.actor;
    if (this.constructor.metadata.invalidActorTypes?.includes(actor?.type))
      return false;
  }
}
