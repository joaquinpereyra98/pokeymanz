import gsap from "/scripts/greensock/esm/all.js";
import Accordion from "../accordion.mjs";
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

    options.window.icon =
      CONFIG.POKEYMANZ.items[options.document.type]?.icon ?? "fas fa-suitcase";
    return options;
  }

  /** @inheritDoc */
  _onRender(context, options) {
    this._accordions.forEach((accordion) => {
      accordion._saveCollapsedState();
      accordion.bind(this.element);
    });
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
      createEffect: PokeymanzItemSheet._createEffect,
      toggleEffect: PokeymanzItemSheet._toggleEffect,
      viewDoc: PokeymanzItemSheet._viewDoc,
      deleteDoc: PokeymanzItemSheet._deleteDoc,
      setImg: PokeymanzItemSheet._setImg,
      renderIP: PokeymanzItemSheet._renderIP,
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
    if (this.constructor.TABS.some((tab) => tab.id === partId))
      context.tab = context.tabs[partId];

    switch (partId) {
      case "effects":
        context.effects = this._prepareEffects();
        break;
    }
    return context;
  }

  _prepareEffects() {
    const categories = {
      temporary: {
        type: "temporary",
        label: game.i18n.localize("POKEYMANZ.Effect.Temporary"),
        effects: [],
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("POKEYMANZ.Effect.Passive"),
        effects: [],
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("POKEYMANZ.Effect.Inactive"),
        effects: [],
      },
    };

    for (const e of this.item.effects) {
      if (!e.active) categories.inactive.effects.push(e);
      else if (e.isTemporary) categories.temporary.effects.push(e);
      else categories.passive.effects.push(e);
    }

    for (const c of Object.values(categories)) {
      c.effects.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }
    return categories;
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
   * Handles the animation and DOM manipulation for moving items/effects between a list.
   *
   * @param {HTMLElement} li - The list item representing the item/effect.
   * @param {HTMLElement|null} insertAfter - The element to insert after, or null to append.
   * @param {HTMLElement} itemList - The container element for the items/effects.
   * @private
   */
  async _animateItemList(li, insertAfter, itemList) {
    gsap.to(li, {
      duration: 0.2,
      opacity: 0,
      onComplete: () => {
        if (insertAfter) {
          insertAfter.after(li); // Insert after the specified element
        } else {
          itemList.insertBefore(li, itemList.firstChild); // Append to the start if no insertAfter
        }
        gsap.fromTo(li, { opacity: 0 }, { opacity: 1, duration: 0.2 }); // Animate fade-in
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 410));
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

  /**
   *Handle to create a new ActiveEffect
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns
   */
  static _createEffect(event, target) {
    event.preventDefault();
    const cls = getDocumentClass("ActiveEffect");

    const data = {
      name: game.i18n.format("DOCUMENT.New", { type: "Effect" }),
      disabled: target.dataset.type === "inactive",
      transfer: true,
      origin: this.document.uuid,
      img: "icons/svg/aura.svg",
      duration: target.dataset.type === "temporary" ? { rounds: 1 } : null,
    };

    cls.create(data, { parent: this.document });
  }

  /**
   * Handle to toggle a ActiveEffect
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns
   */
  static async _toggleEffect(event, target) {
    event.preventDefault();
    const li = target.closest(".item");
    const { documentClass, docId, effectType } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    const effects = Array.from(this.document.effects).sort(
      (a, b) => (a.sort || 0) - (b.sort || 0)
    );

    const previousEffect = effects
      .slice(
        0,
        effects.findIndex((ef) => ef.id === doc.id)
      )
      .findLast((effect) =>
        effectType === "inactive"
          ? doc.isTemporary === effect.isTemporary && effect.active
          : !effect.active
      );

    const newCategory =
      effectType === "inactive"
        ? doc.isTemporary
          ? "temporary"
          : "passive"
        : "inactive";
    const ol = li.closest(".effects-list");
    const effectList = ol?.querySelector(
      `.effect-list[data-effect-type="${newCategory}"]`
    );

    if (!effectList) return await doc?.update({ disabled: !doc.disabled });

    const previousEffectId = previousEffect?.id || null;
    const prevLi = previousEffectId
      ? effectList.querySelector(`[data-doc-id="${previousEffectId}"]`)
      : null;
    await this._animateItemList(li, prevLi, effectList);

    return await doc?.update({ disabled: !doc.disabled });
  }

  /**
   *Handle to create a new ActiveEffect
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns
   */
  static _viewDoc(event, target) {
    event.preventDefault();
    const li = target.closest(".item");
    const effect = this.document.effects.get(li.dataset.effectId);
    effect.sheet.render(true);
  }

  /**
   *Handle to create a new ActiveEffect
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns
   */
  static async _deleteDoc(event, target) {
    event.preventDefault();
    const li = target.closest(".item");
    const effect = this.document.effects.get(li.dataset.effectId);
    gsap.to(li, { height: 0, opacity: 0, duration: 0.5 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await effect.delete();
  }

  /**
   * Handle changing a Document's image
   *
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
  static _setImg(event, target) {
    event.preventDefault();
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
   * Handle render ImagePopout of a image
   *
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
  static _renderIP(event, target) {
    event.preventDefault();
    const src = target.src ?? target.querySelector("img")?.src;
    if (!src) return;

    const ip = new ImagePopout(src, {
      title: this.document.name,
      uuid: this.document.uuid,
    });

    ip.render(true);
  }
}
