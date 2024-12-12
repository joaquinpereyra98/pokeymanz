const { api, sheets } = foundry.applications;

/**
 * The Pokeymanz Items application.
 * @extends ItemSheetV2
 * @mixes HandlebarsApplication
 * @alias PokeymanzItemSheet
 */
export default class PokeymanzItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  /* -------------------------------------------- */

  /** @inheritDoc */
  _initializeApplicationOptions(options) {
    options = super._initializeApplicationOptions(options);
    switch (options.document.type) {
      case "feat":
        options.window.icon = "fa-solid fa-star";
        break;

      default:
        break;
    }
    return options;
  }
  /* -------------------------------------------- */
  /*  Static Methods                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["pokeymanz", "sheet", "item"],
    position: {
      width: 600,
      height: 400,
    },
    actions: {
      toggleMode: PokeymanzItemSheet._toggleMode,
    },
    window: {
      resizable: true,
      minizable: true,
      icon: "fa-solid fa-briefcase",
    },
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/pokeymanz/templates/items/parts/header.hbs",
    },
    summary: {
      template: "systems/pokeymanz/templates/items/parts/summary.hbs",
    },
  };

  /**
   * Available sheet modes.
   * @enum {number}
   */
  static MODES = {
    PLAY: 1,
    EDIT: 2,
  };

  _mode = PokeymanzItemSheet.MODES.PLAY;

  /**
   * Is this sheet in Play Mode?
   * @returns {boolean}
   */
  get isPlayMode() {
    return this._mode === PokeymanzItemSheet.MODES.PLAY;
  }

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

  /* -------------------------------------------- */
  /*  Application States                          */
  /* -------------------------------------------- */

  /** @override */
  tabGroups = {
    primary: "summary",
  };

  async _prepareContext(options) {
    const item = this.document;
    return {
      editable: this.isEditable,
      item: item,
      tabs: this._getTabs(),
      actor: item.parent,
      system: item.system,
      isPlayMode: this.isPlayMode,
      fields: item.system.schema.fields,
      choices: this._getChoices(),
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
  /* -------------------------------------------- */

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case "summary":
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }
  /**
   * Prepare an array of sheet tabs.
   * @returns {Record<string, Partial<import("../../v12/resources/app/client-esm/applications/_types.mjs").ApplicationTab>>}
   */
  _getTabs() {
    return this.constructor.TABS.reduce((acc, tab) => {
      acc[tab.id] = {
        ...tab,
        active: this.tabGroups[tab.group] === tab.id,
        cssClass: this.tabGroups[tab.group] === tab.id ? "active" : "",
      };
      return acc;
    }, {});
  }

  /**
   *
   * @param {Event} event
   * @param {HTMLElement} target
   * @returns
   */
  static _toggleMode(event, target) {
    event.preventDefault();
    if (!this.isEditable) {
      console.error("You can't switch to Edit mode if the sheet is uneditable");
      return;
    }
    this._mode = this.isPlayMode
      ? PokeymanzItemSheet.MODES.EDIT
      : PokeymanzItemSheet.MODES.PLAY;

    this.render();
  }
}
