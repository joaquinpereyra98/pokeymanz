import gsap from "/scripts/greensock/esm/all.js";
import { TEMPLATES_PATH } from "../../constants.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs"
 * @import { DocumentSheetMetadata } from "../_types";
 */

export default class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  /**
   * Default metadata which applies to each instance of this Document Sheet.
   * @type {Readonly<DocumentSheetMetadata>}
   */
  static metadata = Object.freeze({
    label: "DOCUMENT.Actor",
    types: [],
    isDefault: false,
    register: false,
  });

  /** @type {Partial<foundry.applications.types.ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    classes: ["pokeymanz", "sheet", "actor"],
    actions: {
      renderIP: BaseActorSheet._renderIP,
      toggleEffect: BaseActorSheet._toggleEffect,
      createDoc: BaseActorSheet._createDoc,
      deleteDoc: BaseActorSheet._deleteDoc,
      viewDoc: BaseActorSheet._viewDoc,
      toggleGear: BaseActorSheet._toggleGear,
      useItem: BaseActorSheet._useItem,
      roll: BaseActorSheet._onRoll,
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
        headingSelector: ".note-header",
        contentSelector: ".note-content",
      },
      {
        headingSelector: ".item-list .item .item-header",
        contentSelector: ".item-list .item .item-description",
        startCollapsed: true,
      },
    ],
    contextMenus: [],
  };

  /**
   * This getter dynamically retrieves and merges `_PARTS` from the current class and the parent class
   * @type {Record<string, HandlebarsTemplatePart>}
   */
  static get PARTS() {
    return [...this.inheritanceChain()].reverse().reduce((combined, cls) => {
      return { ...combined, ...cls._PARTS };
    }, {});
  }

  /**
   * Defines the specific parts for the current class.
   * @type {Record<string, HandlebarsTemplatePart>}
   */
  static _PARTS = {
    header: {
      template: `${TEMPLATES_PATH}/actors/parts/header.hbs`,
    },
    effects: {
      template: `${TEMPLATES_PATH}/actors/parts/effects.hbs`,
      scrollable: [""],
    },
    notes: {
      template: `${TEMPLATES_PATH}/actors/parts/notes.hbs`,
      scrollable: [""],
    },
  };

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /**
   * Prepare application rendering context data for a given render request.
   * @param {foundry.applications.types.ApplicationRenderOptions} options - Options which configure application rendering behavior
   * @returns {Promise<foundry.applications.types.ApplicationRenderContext>} - Context data for the render operation
   * @protected
   */
  async _prepareContext(options = {}) {
    return {
      ...super._prepareContext(options),
      actor: this.document,
      config: CONFIG.POKEYMANZ,
      editable: this.isEditable,
      flags: this.document.flags,
      system: this.document.system,
      systemSource: this.document.system._source,
      systemFields: this.document.system.schema.fields,
      detailsFields: this._prepareDetails(),
    };
  }

  /**@inheritdoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "notes":
        context.notes = await this._prepareNotes(context);
      default:
        break;
    }

    const handlerName = `_prepare${partId.capitalize()}Part`;
    /**@type {import("./_types").PartContextHandler} */
    const handler = this[handlerName];

    if (typeof handler === "function")
      context = await handler.call(this, context, options);

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

  /**@type {import("./_types").PartContextHandler} */
  async _prepareEffectsPart(context) {
    const { temporaryEffectsActive, passiveEffects, inactiveEffects } =
      this.actor;

    const prepareEffectsArray = (effects) => {
      return Promise.all(
        effects
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
          .map(async (e) => {
            const value = e.description;
            const enrich =
              await foundry.applications.ux.TextEditor.implementation.enrichHTML(
                value,
                {
                  secrets: e.isOwner,
                  relativeTo: e,
                  rollData: e.getRollData?.() ?? {},
                },
              );

            return { doc: e, description: enrich };
          }),
      );
    };

    const categories = {
      temporary: {
        type: "temporary",
        label: _loc("POKEYMANZ.Effect.Temporary"),
        effects: await prepareEffectsArray(temporaryEffectsActive),
      },
      passive: {
        type: "passive",
        label: _loc("POKEYMANZ.Effect.Passive"),
        effects: await prepareEffectsArray(passiveEffects),
      },
      inactive: {
        type: "inactive",
        label: _loc("POKEYMANZ.Effect.Inactive"),
        effects: await prepareEffectsArray(inactiveEffects),
      },
    };

    context.effects = categories;
    return context;
  }

  /**
   * A point on a two dimensional plane.
   * @typedef {Object} DetailsFields
   * @property {String} key - key of the field details
   * @property {String|Number} value - original value from of the details
   * @property {String} name -  Representation of the field path within the system schema.
   * @property {String} label - Localized label for the detail field
   * @property {String} type - The type of the field, either "text" or "number".
   */

  /**
   * Prepares the details fields.
   * Each detail is enriched with a key, value, name, label, and type.
   * @returns {DetailsFields}
   */
  _prepareDetails() {
    const details = this.document.system.details;
    const schemaFields = this.document.system.schema;

    const entries = Object.entries(details).map(([key, value]) => [
      key,
      {
        value,
        field: schemaFields.getField(`details.${key}`),
        label: game.i18n.localize(
          `POKEYMANZ.Actor.Details.${key.capitalize()}`,
        ),
      },
    ]);

    return Object.fromEntries(entries);
  }

  async _prepareNotes() {
    const { system } = this.document;

    const notes = [];

    for (const [key, value] of Object.entries(system.notes)) {
      const field = system.schema.getField(`notes.${key}`);

      notes.push({
        field,
        value,
        enritch:
          await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            value,
            {
              secrets: this.document.isOwner,
              relativeTo: this.document,
              rollData: this.document.getRollData?.() ?? {},
            },
          ),
      });
    }

    return notes;
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
   * Handle render ImagePopout of a image
   *
   * @this BaseActorSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static _renderIP(event, target) {
    event.preventDefault();
    const src = target.src ?? target.querySelector("img")?.src;
    if (!src) return;

    const ip = new foundry.applications.apps.ImagePopout({
      window: { title: this.document.name },
      src,
      uuid: this.document.uuid,
    });

    ip.render(true);
  }

  /**
   * Handle to toggle a ActiveEffect
   * @this BaseActorSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async _toggleEffect(event, target) {
    event.preventDefault();

    const li = target.closest(".item");
    const { documentClass, docId, effectType } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    const effects = Array.from(this.document.effects).sort(
      (a, b) => (a.sort || 0) - (b.sort || 0),
    );

    const previousEffect = effects
      .slice(
        0,
        effects.findIndex((ef) => ef.id === doc.id),
      )
      .findLast((effect) =>
        effectType === "inactive"
          ? doc.isTemporary === effect.isTemporary && effect.active
          : !effect.active,
      );

    const newCategory =
      effectType === "inactive"
        ? doc.isTemporary
          ? "temporary"
          : "passive"
        : "inactive";
    const ol = li.closest(".items-list");
    const effectList = ol?.querySelector(
      `.item-list[data-category="${newCategory}"]`,
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
   * Handle to toggle a Item
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async _toggleGear(event, target) {
    event.preventDefault();

    const li = target.closest(".item");
    const { documentClass, docId } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    const items = this.document.items
      .filter((i) => i.isEquipable)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));

    const previousItem = items
      .slice(
        0,
        items.findIndex((i) => i.id === doc.id),
      )
      .findLast((i) => doc.system.equipped !== i.system.equipped);

    const newCategory = doc.system.equipped ? "computer" : "backpack";
    const ol = li.closest(".items-list");
    const itemList = ol?.querySelector(
      `.item-list[data-category="${newCategory}"]`,
    );

    if (!itemList)
      return await doc?.update({ "system.equipped": !doc.system.equipped });

    const previousItemId = previousItem?.id || null;
    const prevLi = previousItemId
      ? itemList.querySelector(`[data-doc-id="${previousItemId}"]`)
      : null;

    await this._movingItemList(li, prevLi, itemList);

    return await doc?.update({ "system.equipped": !doc.system.equipped });
  }

  /**
   * Handle to create a new embedded document.
   * @this BaseActorSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async _createDoc(event, target) {
    event.preventDefault();
    const { type, documentClass, systemType, equipped } = target.dataset;

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
      case "Item":
        Object.assign(data, {
          name: game.i18n.format("DOCUMENT.New", { type }),
          type,
          "system.type": systemType,
          "system.equipped": equipped === "true",
        });
        break;
      default:
        return;
    }

    const doc = await cls.create(data, { parent: this.document });
    doc.sheet?.render({ force: true });
  }

  /**
   * Handle to delete a embedded document.
   * @this BaseActorSheet
   * @type {foundry.applications.types.ApplicationClickAction}
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
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static _viewDoc(event, target) {
    event.preventDefault();
    const li = target.closest(".item") ?? target.closest(".pokemon");

    const { documentClass, docId } = li.dataset;
    const doc = this.document.getEmbeddedDocument(documentClass, docId);

    doc?.sheet?.render({force: true});
  }

  /**
   * Handler for make rolls
   * @this BaseActorSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static _onRoll(event, target) {
    const roll = target.dataset.roll;
    switch (roll) {
      case "attribute":
        const { attribute } = target.dataset;
        this.actor.rollAttribute(attribute);
        break;
      default:
        break;
    }
  }

  /**
   * Handle to use a item.
   * @this PokemonSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async _useItem(event, target) {
    const { itemUuid } = target.dataset;
    const item = await fromUuid(itemUuid);
    await item.use();
  }
}
