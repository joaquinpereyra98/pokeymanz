import BaseItemSheet from "./base-item-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

/**
 * The Pokeymanz Move application.
 * @extends BaseItemSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias MoveSheet
 */
export default class MoveSheet extends InteractiveUIFeaturesMixin(
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
      template: "systems/pokeymanz/templates/items/parts/move-summary.hbs",
    },
    stats: {
      template: "systems/pokeymanz/templates/items/parts/stats.hbs",
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
      label: "POKEYMANZ.Sheets.TABS.Summary",
    },
    {
      id: "stats",
      group: "primary",
      icon: "fa-solid fa-list",
      label: "POKEYMANZ.Sheets.TABS.Stats",
    },
    {
      id: "effects",
      group: "primary",
      icon: "fa-solid fa-bolt",
      label: "POKEYMANZ.Sheets.TABS.Effects",
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
      categoryField: this._prepareCategory(),
      pokemonType: this._preparePokemonType(),
    };
  }

  _prepareCategory() {
    const { system } = this.document;
    return {
      field: system.schema.getField("category"),
      value: system.category,
      img: CONFIG.POKEYMANZ.items.move.categories[system.category]?.img ?? "",
    };
  }

  _preparePokemonType() {
    const { pokemonTypes, schema } = this.document.system;
    return {
      primary: {
        ...pokemonTypes.primary,
        field: schema.getField("pokemonTypes.primary.value"),
      },
    };
  }
}
