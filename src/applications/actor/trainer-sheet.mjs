import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

/**
 * The Pokeymanz Actor application.
 * @extends BaseActorSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias TrainerSheet
 */
export default class TrainerSheet extends InteractiveUIFeaturesMixin(
  BaseActorSheet
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 800,
      height: 700,
    },
    actions: {
      roll: TrainerSheet._onRoll,
    },
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: "systems/pokeymanz/templates/actors/parts/summary.hbs",
    },
    inventory: {
      template: "systems/pokeymanz/templates/actors/parts/inventory.hbs",
    },
    features: {
      template: "systems/pokeymanz/templates/actors/parts/features.hbs",
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
      id: "features",
      group: "primary",
      icon: "fa-solid fa-list",
      label: "POKEYMANZ.Actor.TABS.Features",
    },
    {
      id: "inventory",
      group: "primary",
      icon: "fa-solid fa-backpack",
      label: "POKEYMANZ.Actor.TABS.Inventory",
    },
    {
      id: "pokemon",
      group: "primary",
      icon: "fa-solid fa-paw",
      label: "POKEYMANZ.Actor.TABS.Pokemon",
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

  /**
   * Handler for make rolls
   *
   * @this TrainerSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
  static _onRoll(event, target) {
    const { rollAttribute } = this.actor;
    const roll = target.dataset.roll;
    switch (roll) {
      case "attribute":
        const { attribute } = target.dataset;
        rollAttribute(attribute);
        break;

      default:
        break;
    }
  }
}
