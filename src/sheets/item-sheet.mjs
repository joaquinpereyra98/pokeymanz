import Accordion from "../applications/accordion.mjs";
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
  constructor(...args) {
    super(...args);

    this._accordions = this._createAccordions();
  }
  /**
   * Instantiate accordion widgets.
   * @returns {Accordion[]}
   * @protected
   */
  _createAccordions() {
    return this.options.accordions.map((config) => new Accordion(config));
  }
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

  _onRender(context, options) {
    this._accordions.forEach((accordion) => accordion.bind(this.element));
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
    accordions: [
      {
        headingSelector: ".description-header",
        contentSelector: ".description-content",
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
      descriptionFields: await this._prepareDescription(),
    };
  }

  async _prepareDescription() {
    const { description: desctipionSystem, schema } = this.document.system;
    const descriptionFields = schema.getField("description").fields;
    const descriptions = {};
    for (const [key, value] of Object.entries(desctipionSystem)) {
      descriptions[key] = {
        field: descriptionFields[key],
        label: game.i18n.localize(descriptionFields[key].label),
        value,
        enriched: await TextEditor.enrichHTML(value, {
          rollData: this.document.getRollData(),
          relativeTo: this.document,
        }),
      };
    }
    return descriptions;
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
  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   *Handle to toggle the Sheet Mode
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event
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
