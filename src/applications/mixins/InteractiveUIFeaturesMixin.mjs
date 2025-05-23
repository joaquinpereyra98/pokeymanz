import Accordion from "../accordion.mjs";
import * as SYSTEM_CONST from "../../constants.mjs";

export default function InteractiveUIFeaturesMixin(BaseApplication) {
  class InteractiveApplication extends BaseApplication {
    static DEFAULT_OPTIONS = {
      actions: {
        toggleMode: InteractiveApplication._toggleMode,
      },
      contextMenus: [],
    };

    _accordions = this._createAccordions();

    /**
     * Instantiate accordion widgets.
     * @returns {Accordion[]}
     * @protected
     */
    _createAccordions() {
      if (Array.isArray(this.options.accordions))
        return this.options.accordions.map((config) => new Accordion(config));
      else {
        console.error(
          `${SYSTEM_CONST.SYSTEM_NAME} | Error _createAccordions | this.options.accordions should be a Array`,
        );
        return [];
      }
    }

    _contextMenus;

    /**
     * @type {Array<Partial<import("../../../v12/resources/app/client-esm/applications/_types.mjs").ApplicationTab>>}
     */
    static TABS = [];

    /**
     * Available sheet modes.
     * @enum {number}
     */
    static MODES = {
      PLAY: 1,
      EDIT: 2,
    };

    _mode = InteractiveApplication.MODES.PLAY;

    /**
     * Is this sheet in Play Mode?
     * @returns {boolean}
     */
    get isPlayMode() {
      return this._mode === InteractiveApplication.MODES.PLAY;
    }

    /** @inheritDoc */
    _onRender(context, options) {
      for (const accordion of this._accordions) {
        accordion._saveCollapsedState();
        accordion.bind(this.element);
      }
    }
    /** @inheritDoc */
    _onFirstRender(context, options) {
      super._onFirstRender(context, options);
      this._contextMenus = this._createContextMenus();
    }

    /**
     * @returns {ContextMenu[]}
     */
    _createContextMenus() {
      if (Array.isArray(this.options.contextMenus))
        return this.options.contextMenus.map(
          ({ selector, menuItems, options }) => {
            return ContextMenu.create(
              this,
              this.element,
              selector,
              menuItems,
              options,
            );
          },
        );
      else {
        console.error(
          `${SYSTEM_CONST.SYSTEM_NAME} | Error _createContextMenus | this.options.contextMenus should be a Array`,
        );
        return [];
      }
    }

    /** @override */
    async _prepareContext(options) {
      const baseContext = await super._prepareContext(options);
      return {
        ...baseContext,
        isPlayMode: this.isPlayMode,
        tabs: this._getTabs(),
      };
    }

    /**
     * Prepare an array of sheet tabs.
     * @returns {Record<string, Partial<import("../../v12/resources/app/client-esm/applications/_types.mjs").ApplicationTab>}
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

    /** @override */
    async _preparePartContext(partId, context, options) {
      if (this.constructor.TABS.some((tab) => tab.id === partId))
        context.tab = context.tabs[partId];

      return await super._preparePartContext(partId, context, options);
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /**
     * Handle to toggle the Sheet Mode.
     *
     * @this BaseActorSheet
     * @param {PointerEvent} event - The originating click event
     * @private
     */
    static _toggleMode(event) {
      event.preventDefault();

      if (!this.isEditable)
        return console.error(
          "You can't switch to Edit mode if the sheet is uneditable",
        );

      const { EDIT, PLAY } = InteractiveApplication.MODES;
      this._mode = this.isPlayMode ? EDIT : PLAY;
      this.render();
    }
  }

  return InteractiveApplication;
}
