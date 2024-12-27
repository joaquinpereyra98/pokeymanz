import Accordion from "../accordion.mjs";
import gsap from "/scripts/greensock/esm/all.js";

const { api, sheets } = foundry.applications;

/**
 * The Pokeymanz Actor application.
 * @extends ActorSheetV2
 * @mixes HandlebarsApplication
 * @alias PokeymanzActorSheet
 */
export default class PokeymanzActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
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
    classes: ["pokeymanz", "sheet", "actor"],
    position: {
      width: 800,
      height: 700,
    },
    actions: {
      roll: PokeymanzActorSheet._onRoll,
      setImg: PokeymanzActorSheet._setImg,
      renderIP: PokeymanzActorSheet._renderIP,
      toggleMode: PokeymanzActorSheet._toggleMode,
      createDoc: PokeymanzActorSheet._createDoc,
      viewDoc: PokeymanzActorSheet._viewDoc,
      toggleEffect: PokeymanzActorSheet._toggleEffect,
      deleteDoc: PokeymanzActorSheet._deleteDoc,
    },
    window: {
      resizable: true,
      minizable: true,
      icon: "fa-solid fa-user",
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
      template: "systems/pokeymanz/templates/actors/parts/header.hbs",
    },
    summary: {
      template: "systems/pokeymanz/templates/actors/parts/summary.hbs",
    },
    effects: {
      template: "systems/pokeymanz/templates/actors/parts/effects.hbs",
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
        effects: this.document.temporaryEffectsActive,
      },
      passive: {
        type: "passive",
        label: game.i18n.localize("POKEYMANZ.Effect.Passive"),
        effects: this.document.passiveEffects,
      },
      inactive: {
        type: "inactive",
        label: game.i18n.localize("POKEYMANZ.Effect.Inactive"),
        effects: this.document.inactiveEffects,
      },
    };

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
   * Handle render ImagePopout of a image
   *
   * @this PokeymanzActorSheet
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

  /**
   * Handle to toggle the Sheet Mode.
   *
   * @this PokeymanzActorSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
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

  /**
   * Handle to create a new embedded document.
   * @this PokeymanzActorSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
  static _createDoc(event, target) {
    event.preventDefault();
    const { type, documentClass } = target.dataset;

    const cls = getDocumentClass(documentClass);
    if (!cls) return;

    const data = {};

    switch (documentClass) {
      case "ActiveEffect":
        Object.assign(data, {
          name: game.i18n.format("DOCUMENT.New", { type: "Effect" }),
          disabled: type === "inactive",
          transfer: true,
          origin: this.document.uuid,
          img: "icons/svg/aura.svg",
          duration: type === "temporary" ? { rounds: 1 } : null,
        });
        break;

      default:
        break;
    }

    const doc = cls.create(data, { parent: this.document });
    doc.sheet?.render(true);
  }

  /**
   * Handle to open a embedded document sheet.
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   */
  static _viewDoc(event, target) {
    event.preventDefault();
    const li = target.closest(".item");

    const { documentClass, docId } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    doc?.sheet?.render(true);
  }

  /**
   * Handle to toggle a ActiveEffect
   * @this PokeymanzActorSheet
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
   * Handle to delete a embedded document.
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns
   */
  static async _deleteDoc(event, target) {
    event.preventDefault();
    const li = target.closest(".item");

    const { documentClass, docId } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    gsap.to(li, { height: 0, opacity: 0, duration: 0.5 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await doc?.delete();
  }
}
