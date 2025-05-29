import Accordion from "../accordion.mjs";
import * as SYSTEM_CONST from "../../constants.mjs";

export default function InteractiveUIFeaturesMixin(BaseApplication) {
  class InteractiveApplication extends BaseApplication {

    /** @inheritDoc */
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
    async _onRender(context, options) {
      await super._onRender(context, options);

      /**
       * ACCORDION
       */
      for (const accordion of this._accordions) {
        accordion._saveCollapsedState();
        accordion.bind(this.element);
      }

      /**
       * DragDrop
       */
      const DragDropCls = DragDrop.implementation ?? DragDrop;

      new DragDropCls({
        dragSelector: ".draggable",
        permissions: {
          dragstart: this._canDragStart.bind(this),
          drop: this._canDragDrop.bind(this),
        },
        callbacks: {
          dragstart: this._onDragStart.bind(this),
          dragover: this._onDragOver.bind(this),
          drop: this._onDrop.bind(this),
        },
      }).bind(this.element);
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
            if (game.release.generation >= 13)
              return this._createContextMenu(Array.isArray(menuItems) ? () => menuItems : menuItems, selector, { ...options });
            else
              return ContextMenu.create(
                this,
                this.element,
                selector,
                menuItems(),
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
    /*  Drag and Drop                               */
    /* -------------------------------------------- */

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector.
     * @param {string} selector       The candidate HTML selector for dragging
     * @returns {boolean}             Can the current user drag this selector?
     * @protected
     */
    _canDragStart(selector) {
      return this.isEditable;
    }

    /* -------------------------------------------- */

    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
      return this.isEditable;
    }

    /* -------------------------------------------- */

    /**
     * An event that occurs when a drag workflow begins for a draggable item on the sheet.
     * @param {DragEvent} event       The initiating drag start event
     * @returns {Promise<void>}
     * @protected
     */
    async _onDragStart(event) {
      const target = event.currentTarget;
      if ("link" in event.target.dataset) return;
      let dragData;

      const { documentClass, docId } = target.dataset;
      const doc = this.document.getEmbeddedDocument(documentClass, docId);
      dragData = doc.toDragData();

      // Set data transfer
      if (!dragData) return;
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    /* -------------------------------------------- */

    /**
     * An event that occurs when a drag workflow moves over a drop target.
     * @param {DragEvent} event
     * @protected
     */
    _onDragOver(event) { }
    /* -------------------------------------------- */

    /**
     * An event that occurs when data is dropped into a drop target.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     * @protected
     */
    async _onDrop(event) {
      const TextEditorCls = TextEditor.implementation ?? TextEditor;
      const data = TextEditorCls.getDragEventData(event);
      const actor = this.actor;
      const allowed = Hooks.call("pokeymanz.dropActorSheetData", actor, this, data);
      if (allowed === false) return;

      // Dropped Documents
      const documentClass = foundry.utils.getDocumentClass?.(data.type) ?? getDocumentClass?.(data.type);
      if (documentClass) {
        const document = await documentClass.fromDropData(data);
        await this._onDropDocument(event, document);
      }
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped document on the ActorSheet
     * @param {DragEvent} event         The initiating drop event
     * @param {Document} document       The resolved Document class
     * @returns {Promise<void>}
     * @protected
     */
    async _onDropDocument(event, document) {
      switch (document.documentName) {
        case "ActiveEffect":
          return this._onDropActiveEffect(event, /** @type ActiveEffect */ document);
        case "Actor":
          return this._onDropActor(event, /** @type Actor */ document);
        case "Item":
          return this._onDropItem(event, /** @type Item */ document);
        case "Folder":
          return this._onDropFolder(event, /** @type Folder */ document);
      }
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Active Effect on the Actor Sheet.
     * The default implementation creates an Active Effect embedded document on the Actor.
     * @param {DragEvent} event       The initiating drop event
     * @param {ActiveEffect} effect   The dropped ActiveEffect document
     * @returns {Promise<void>}
     * @protected
     */
    async _onDropActiveEffect(event, effect) {
      if (!this.actor.isOwner) return;
      if (!effect || (effect.target === this.actor)) return;
      const keepId = !this.actor.effects.has(effect.id);
      const ef = await ActiveEffect.implementation.create(effect.toObject(), { parent: this.actor, keepId });
      ui.notifications.info(`The ActiveEffect '${ef.name}' has been successfully created by '${this.actor.name}'.`);
      return ef;
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Actor on the Actor Sheet.
     * @param {DragEvent} event     The initiating drop event
     * @param {Actor} actor         The dropped Actor document
     * @returns {Promise<void>}
     * @protected
     */
    async _onDropActor(event, actor) { }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Item on the Actor Sheet.
     * @param {DragEvent} event     The initiating drop event
     * @param {Item} item           The dropped Item document
     * @returns {Promise<void>}
     * @protected
     */
    async _onDropItem(event, item) {
      if (!this.actor.isOwner) return;
      if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, item);
      const keepId = !this.actor.items.has(item.id);

      const i = await Item.implementation.create(item.toObject(), { parent: this.actor, keepId });
      ui.notifications.info(`The item '${i.name}' has been successfully created by '${this.actor.name}'.`);
      return i;
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Folder on the Actor Sheet.
     * @param {DragEvent} event     The initiating drop event
     * @param {Folder} folder       The dropped Folder document
     * @returns {Promise<void>}
     * @protected
     */
    async _onDropFolder(event, folder) { }

    /* -------------------------------------------- */

    /**
     * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings.
     * @param {DragEvent} event     The initiating drop event
     * @param {Item} item           The dropped Item document
     * @protected
     */
    _onSortItem(event, item) {
      const items = this.actor.items;
      const source = items.get(item.id);

      // Confirm the drop target
      const dropTarget = event.target.closest("[ data-document-class='Item']");
      if (!dropTarget) return;
      const target = items.get(dropTarget.dataset.docId);
      if (source.id === target.id) return;

      // Identify sibling items based on adjacent HTML elements
      const siblings = [];
      for (const element of dropTarget.parentElement.children) {
        const siblingId = element.dataset.itemId;
        if (siblingId && (siblingId !== source.id)) siblings.push(items.get(element.dataset.itemId));
      }

      // Perform the sort

      const sortUpdates = foundry.utils.performIntegerSort?.(source, { target, siblings })
        ?? SortingHelpers.performIntegerSort(source, { target, siblings });

      const updateData = sortUpdates.map(u => {
        const update = u.update;
        update._id = u.target._id;
        return update;
      });

      // Perform the update
      return this.actor.updateEmbeddedDocuments("Item", updateData);
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
