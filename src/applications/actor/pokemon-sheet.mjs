import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

/**
 * The Pokeymanz Actor application.
 * @extends BaseActorSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias PokemonSheet
 */
export default class PokemonSheet extends InteractiveUIFeaturesMixin(
  BaseActorSheet
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 800,
      height: 700,
    },
    actions: {},
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: "systems/pokeymanz/templates/actors/parts/pokemon-summary.hbs",
    },
  };

  /* -------------------------------------------- */
  /*  TABS                                        */
  /* -------------------------------------------- */

  /**
   * Available tabs for the sheet.
   * @type {Array<{id: string, group: string, icon: string}>}
   */
  static TABS = [
    {
      id: "summary",
      group: "primary",
      icon: "fa-solid fa-address-card",
      label: "POKEYMANZ.Actor.TABS.Summary",
    },
    {
      id: "effects",
      group: "primary",
      icon: "fa-solid fa-bolt",
      label: "POKEYMANZ.Actor.TABS.Effects",
    },
  ];

   /** @override */
   tabGroups = {
    primary: "summary",
  };

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const baseContext = await super._prepareContext(options);
    return {
      ...baseContext,
      types: {
        primaryType: this.document.primaryType,
        secondaryType: this.document.secondaryType,
      },
    };
  }
  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */
}
