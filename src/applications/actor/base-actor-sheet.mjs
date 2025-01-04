import gsap from "/scripts/greensock/esm/all.js";

const { ActorSheetV2 } = foundry.applications.sheets;

export default class BaseActorSheet extends ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["pokeymanz", "sheet", "actor"],
    actions: {
      setImg: BaseActorSheet._setImg,
      renderIP: BaseActorSheet._renderIP,
      toggleEffect: BaseActorSheet._toggleEffect,
      createDoc: BaseActorSheet._createDoc,
      deleteDoc: BaseActorSheet._deleteDoc,
      viewDoc: BaseActorSheet._viewDoc,
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

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  async _prepareContext(options) {
    return {
      actor: this.document,
      config: CONFIG.POKEYMANZ,
      editable: this.isEditable,
      effects: this._prepareEffects(),
      flags: this.document.flags,
      system: this.document.system,
      systemSource: this.document.system._source,
      systemFields: this.document.system.schema.fields,
    };
  }

  /**
   * @typedef {Object} EffectCategories
   * @property {string} type - The category effect type ("temporary", "passive" or "inactive").
   * @property {string} label - The localized label for the category..
   * @property {ActiveEffect[]} effects - A sorted list of effects belonging to the category.
   */

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
   * Handle changing a Document's image
   *
   * @this BaseActorSheet
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
   * @this BaseActorSheet
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
   * Handle to create a new embedded document.
   * @this BaseActorSheet
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
   * Handle to delete a embedded document.
   * @this BaseActorSheet
   * @param {PointerEvent} event
   * @param {HTMLElement} target
   * @returns
   */
  static async _deleteDoc(event, target) {
    event.preventDefault();
    const li = target.closest(".item");

    const { documentClass, docId } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    gsap.to(li, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      onComplete: () => doc?.delete(),
    });
  }

  /**
   * Handle to open a embedded document sheet.
   * @this BaseActorSheet
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
}
