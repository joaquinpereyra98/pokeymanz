import BaseItemSheet from "./base-item-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

/**
 * The Pokeymanz Gear application.
 * @extends BaseItemSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias GearSheet
 */
export default class GearSheet extends InteractiveUIFeaturesMixin(
  BaseItemSheet
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 510,
      height: 510,
    },
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: "systems/pokeymanz/templates/items/parts/summary.hbs",
    },
  };

  /**
   * Available tabs for the sheet.
   * @type {Array<{id: string, group: string, icon: string, label: string}>}
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
    };
  }
}
