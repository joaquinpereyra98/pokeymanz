import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * The Pokeymanz Actor application.
 * @extends BaseActorSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias TrainerSheet
 */
export default class TrainerSheet extends InteractiveUIFeaturesMixin(
  HandlebarsApplicationMixin(BaseActorSheet)
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
    accordions: [
      {
        headingSelector: ".description-header",
        contentSelector: ".description-content",
      },
      {
        headingSelector: ".effects-header",
        contentSelector: ".effect-list",
        startExpanded: true,
      },
    ],
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/pokeymanz/templates/actors/parts/header.hbs",
    },
    summary: {
      template: "systems/pokeymanz/templates/actors/parts/summary.hbs",
    },
    effects: {
      template: "systems/pokeymanz/templates/actors/parts/effects.hbs",
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
      id: "inventory",
      group: "primary",
      icon: "fa-solid fa-backpack",
      label: "POKEYMANZ.Actor.TABS.Inventory",
    },
    {
      id: "pokemons",
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
