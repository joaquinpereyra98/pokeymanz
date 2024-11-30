const { api, sheets } = foundry.applications;

/**
 * The AmbientLight configuration application.
 * @extends sheets.ActorSheetV2
 * @mixes HandlebarsApplication
 * @alias PokeymanzActorSheet
 */
export default class PokeymanzActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  /* -------------------------------------------- */
  /*  Static Methods                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["pokeymanz", "sheet", "actor"],
    position: {
      width: 800,
      height: 700,
    },
    actions: {
      roll: PokeymanzActorSheet._onRoll,
      image: PokeymanzActorSheet._setImg,
      toggleMode: PokeymanzActorSheet._toggleMode,
      renderDialog: PokeymanzActorSheet._renderDialog,
    },
    window: {
      resizable: true,
      minizable: true,
      icon: "fa-solid fa-user",
    },
    form: {
      submitOnChange: true,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: "systems/pokeymanz/templates/actors/parts/header.hbs",
    },
    summary: {
      template: "systems/pokeymanz/templates/actors/parts/summary-party.hbs",
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

  _mode = PokeymanzActorSheet.MODES.PLAY;

  /**
   * Is this sheet in Play Mode?
   * @returns {boolean}
   */
  get isPlayMode() {
    return this._mode === PokeymanzActorSheet.MODES.PLAY;
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

  /* -------------------------------------------- */
  /*  Application States                          */
  /* -------------------------------------------- */

  /** @override */
  tabGroups = {
    primary: "summary",
  };

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const actor = this.actor;
    const system = actor.system;
    const { primaryType, secondaryType } = actor;
    return {
      editable: this.isEditable,
      actor,
      system,
      types: {
        primaryType,
        secondaryType,
      },
      flags: actor.flags,
      config: CONFIG.POKEYMANZ,
      tabs: this._getTabs(),
      isPlayMode: this.isPlayMode,
      systemSource: this.actor.system._source,
      systemFields: this.document.system.schema.fields,
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
   * Handler for make rolls
   *
   * @this PokeymanzActorSheet
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
  /**
   * Handle changing a Document's image
   *
   * @this PokeymanzActorSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
  static _setImg(event, target) {
    const current = foundry.utils.getProperty(this.object, "img");
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new FilePicker({
      current,
      type: "image",
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        target.src = path;
        if (this.options.submitOnChange) return this._onSubmit(event);
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Handle opened a Dialog application
   *
   * @this PokeymanzActorSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
  static _renderDialog(event, target) {
    event.preventDefault();
  }

  static _toggleMode(event, target) {
    event.preventDefault();
    if (!this.isEditable) {
      console.error("You can't switch to Edit mode if the sheet is uneditable");
      return;
    }
    this._mode = this.isPlayMode
      ? PokeymanzActorSheet.MODES.EDIT
      : PokeymanzActorSheet.MODES.PLAY;

    this.render();
  }
}
