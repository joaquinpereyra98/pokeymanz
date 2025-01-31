import gsap from "/scripts/greensock/esm/all.js";
const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class BaseItemSheet extends HandlebarsApplicationMixin(
  ItemSheetV2
) {
  static DEFAULT_OPTIONS = {
    classes: ["pokeymanz", "sheet", "item"],
    actions: {
      createDoc: BaseItemSheet._createDoc,
      toggleEffect: BaseItemSheet._toggleEffect,
      viewDoc: BaseItemSheet._viewDoc,
      deleteDoc: BaseItemSheet._deleteDoc,
      setImg: BaseItemSheet._setImg,
      renderIP: BaseItemSheet._renderIP,
      toggleEquip: BaseItemSheet._toggleEquip,
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

  /**
   * This getter dynamically retrieves and merges `_PARTS` from the current class and the parent class
   * @type {Record<string, import("../../../v12/resources/app/client-esm/applications/api/handlebars-application.mjs").HandlebarsTemplatePart>}
   */
  static get PARTS() {
    return [...this.inheritanceChain()].reverse().reduce((combined, cls) => {
      return { ...combined, ...cls._PARTS };
    }, {});
  }

  static _PARTS = {
    header: {
      template: "systems/pokeymanz/templates/items/parts/header.hbs",
    },
    effects: {
      template: "systems/pokeymanz/templates/items/parts/effects.hbs",
    },
  };

  /** @inheritDoc */
  _initializeApplicationOptions(options) {
    options = super._initializeApplicationOptions(options);

    foundry.utils.setProperty(
      options,
      "window.icon",
      CONFIG.POKEYMANZ.items[options.document.type]?.icon ?? "fas fa-suitcase"
    );

    return options;
  }

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    return {
      editable: this.isEditable,
      item: this.document,
      actor: this.document.parent,
      system: this.document.system,
      fields: this.document.system.schema.fields,
      effects: this._prepareEffects(),
      descriptionFields: await this._prepareDescription(),
      havePrice: this.document.havePrice,
    };
  }

  /** @override */
  async _preparePartContext(partId, context, options) {
    switch (partId) {
      case "header":
        context.tabWidth = this.constructor.TABS.length * 64;
        break;

      default:
        break;
    }
    return await super._preparePartContext(partId, context, options);
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
        hidden: key === "gmNotes" && !game.user.isGM,
      };
    }
    return descriptions;
  }

  /**
   * Prepares and categorizes the effects associated with the actor into
   * "temporary", "passive", and "inactive" groups. Each category contains
   * a type, a localized label, and a sorted list of effects.
   * @returns {EffectCategories}
   */
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
  /* -------------------------------------------- */
  /*  Animations Handlers                         */
  /* -------------------------------------------- */

  /**
   * Handles the animation and DOM manipulation for moving items/effects between a list.
   *
   * @param {HTMLElement} li - The list item representing the item/effect.
   * @param {HTMLElement|null} insertAfter - The element to insert after, or null to append.
   * @param {HTMLElement} itemList - The container element for the items/effects.
   * @private
   */
  async _movingItemList(li, insertAfter, itemList) {
    await gsap.to(li, { duration: 0.2, opacity: 0 }); //fade Out
    if (insertAfter) insertAfter.after(li);
    else itemList.prepend(li);
    return gsap.fromTo(li, { opacity: 0 }, { opacity: 1, duration: 0.2 }); //fade in
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle to create a new ActiveEffect
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns
   */
  static _createDoc(event, target) {
    event.preventDefault();
    const { type, documentClass } = target.dataset;

    const cls = getDocumentClass(documentClass);
    if (!cls) return;

    const data = {
      name: game.i18n.format("DOCUMENT.New", { type: "Effect" }),
      disabled: type === "inactive",
      transfer: true,
      origin: this.document.uuid,
      img: "icons/svg/aura.svg",
      duration: type === "temporary" ? { rounds: 1 } : null,
    };

    cls.create(data, { parent: this.document }).then((v) => {
      v.sheet?.render(true);
    });
  }

  /**
   * Handle to toggle a ActiveEffect
   * @this BaseActorSheet
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

    await this._movingItemList(li, prevLi, effectList);
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

    const { documentClass, docId } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    doc?.sheet?.render(true);
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
    const { documentClass, docId } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    gsap.to(li, { height: 0, opacity: 0, duration: 0.5 }).then(() => {
      doc?.delete();
    });
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

  /**
   * Handle to equip/unquip the item;
   *
   * @this PokeymanzItemSheet
   * @param {PointerEvent} event - The originating click event
   * @param {HTMLElement} target - The capturing HTML element which defined a [data-action]
   * @private
   */
  static _toggleEquip(event, target) {
    event.preventDefault();
    const doc = this.document;
    doc.update({ "system.equipped": !doc.system.equipped });
  }
}
