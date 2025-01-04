import BaseItemSheet from "./base-item-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class FeatSheet extends InteractiveUIFeaturesMixin(
  HandlebarsApplicationMixin(BaseItemSheet)
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 600,
      height: 400,
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
      template: "systems/pokeymanz/templates/items/parts/header.hbs",
    },
    summary: {
      template: "systems/pokeymanz/templates/items/parts/summary.hbs",
    },
    effects: {
      template: "systems/pokeymanz/templates/items/parts/effects.hbs",
    },
  };

  /* -------------------------------------------- */
  /*  TABS                                        */
  /* -------------------------------------------- */

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

  async _prepareContext(options) {
    const baseContext = await super._prepareContext(options);
    return {
      ...baseContext,
      choices: this._getChoices(),
      descriptionFields: await this._prepareDescription(),
    };
  }

  _getChoices() {
    const config = CONFIG.POKEYMANZ.items.feat.types;
    const itemType = this.document.system.type.value;
    const typeChoices = Object.fromEntries(
      Object.entries(config).map(([key, value]) => [key, value.label])
    );
    const subtypeChoices = itemType
      ? { "": "", ...config[itemType].subtypes }
      : { "": "" };
    return {
      typeChoices,
      subtypeChoices,
    };
  }
}
