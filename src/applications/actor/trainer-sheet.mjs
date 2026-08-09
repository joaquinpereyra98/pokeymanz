import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";
import { TRAINER_TEMPLATES_PATH, TEMPLATES_PATH } from "../../constants.mjs";

/**
 * The Pokeymanz Actor application.
 * @extends BaseActorSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias TrainerSheet
 */
export default class TrainerSheet extends InteractiveUIFeaturesMixin(BaseActorSheet) {
  /** @inheritdoc */
  static metadata = Object.freeze(
    foundry.utils.mergeObject(
      super.metadata,
      {
        label: "POKEYMANZ.SHEETS.TrainerSheet",
        types: ["trainer"],
        register: true,
      },
      { inplace: false },
    ),
  );

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["trainer"],
    position: {
      width: 720,
      height: 550,
    },
    actions: {
      viewExternalActor: TrainerSheet._viewExternalActor,
      togglePokemonTeam: TrainerSheet._togglePokemonTeam,
    },
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: `${TRAINER_TEMPLATES_PATH}/summary.hbs`,
      templates: [
        `${TRAINER_TEMPLATES_PATH}/parts/sidebar.hbs`,
        `${TEMPLATES_PATH}/actors/partials/attributes-container.hbs`,
      ],
      scrollable: [""],
    },
    inventory: {
      template: `${TEMPLATES_PATH}/actors/parts/inventory.hbs`,
      scrollable: [""],
    },
    features: {
      template: `${TEMPLATES_PATH}/actors/parts/features.hbs`,
      scrollable: [""],
    },
    pokemon: {
      template: `${TEMPLATES_PATH}/actors/parts/pokemon.hbs`,
      scrollable: [
        ".pokemon-list[data-category='team']",
        ".pokemon-list[data-category='pc']",
      ],
    },
  };

  /* -------------------------------------------- */
  /*  TABS                                        */
  /* -------------------------------------------- */

  /**@inheritdoc */
  static TABS = {
    primary: {
      tabs: [
        {
          id: "summary",
          icon: "fa-solid fa-address-card",
        },
        {
          id: "features",
          icon: "fa-solid fa-list",
        },
        {
          id: "inventory",
          icon: "fa-solid fa-backpack",
        },
        {
          id: "pokemon",
          icon: "fa-solid fa-paw",
        },
        {
          id: "effects",
          icon: "fa-solid fa-bolt",
        },
        {
          id: "notes",
          icon: "fa-solid fa-notebook",
        },
      ],
      initial: "summary",
      labelPrefix: "POKEYMANZ.Sheets.TABS",
    },
  };

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    for (const pokemon of this.actor.system.pokemons) {
      if (!pokemon.apps[this.id]) pokemon.apps[this.id] = this;
    }
  }

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const baseContext = await super._prepareContext(options);
    const { stats, schema } = this.actor.system;
    this._preparePokemons(baseContext);
    return {
      ...baseContext,
      pokemonType: {
        primary: {
          ...stats.pokemonTypes.primary,
          field: schema.getField("stats.pokemonTypes.primary.value"),
        },
        secondary: {
          ...stats.pokemonTypes.secondary,
          field: schema.getField("stats.pokemonTypes.secondary.value"),
        },
      },
    };
  }

  /**@type {import("./_types").PartContextHandler} */
  async _prepareSummaryPart(context, options) {
    const { attributes } = this.actor.system;

    context.attributes = Object.fromEntries(
      Object.entries(attributes).map(([key, attr]) => [
        key,
        {
          faces: attr.faces,
          modifier: attr.modifier,
          icon: attr.diceIcon,
          label: attr.label,
          fields: attr.schema.fields,
        },
      ]),
    );

    return context;
  }

  /**@type {import("./_types").PartContextHandler} */
  async _prepareInventoryPart(context) {
    const items = this.actor.items
      .filter((i) => i.isEquipable)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));

    const categories = {
      backpack: {
        type: "backpack",
        icon: "fa-solid fa-backpack",
        label: _loc("POKEYMANZ.Item.Backpack"),
        items: [],
      },
      computer: {
        type: "computer",
        icon: "fa-solid fa-computer-classic",
        label: _loc("POKEYMANZ.Item.Computer"),
        items: [],
      },
    };

    await Promise.all(
      items.map(async (item) => {
        const value = item.system.notes.description;
        const targetCategory = item.system.equipped ? "backpack" : "computer";

        const enrich =
          await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            value,
            {
              secrets: item.isOwner,
              relativeTo: item,
              rollData: item.getRollData?.() ?? {},
            },
          );

        categories[targetCategory].items.push({
          doc: item,
          description: enrich,
        });
      }),
    );

    context.inventory = categories;
    return context;
  }

  /**
   *
   * @param {foundry.applications.types.ApplicationRenderContext} context
   */
  async _preparePokemons(context) {
    const { true: teamDocs = [], false: pcDocs = [] } = Object.groupBy(
      this.actor.system.pokemons ?? [],
      (p) => p.system?.trainer?.inTeam ?? false,
    );

    const categories = {
      team: {
        label: "Team",
        icon: "fa-solid fa-backpack",
        docs: teamDocs,
        id: "team",
      },
      pc: {
        label: "PC",
        icon: "fa-solid fa-computer-classic",
        docs: pcDocs,
        id: "pc",
      },
    };

    context.pokemons = categories;
  }

  /**@type {import("./_types").PartContextHandler} */
  async _prepareFeaturesPart(context) {
    const { types } = CONFIG.POKEYMANZ.items.feat;

    const items = this.actor.itemTypes.feat.sort(
      (a, b) => (a.sort || 0) - (b.sort || 0),
    );

    const categories = Object.fromEntries(
      Object.entries(types).map(([key, { label }]) => [
        key,
        {
          icon: `fa-solid fa-star-shooting fa-flip-${key === "edge" ? "both" : "horizontal"}`,
          label: _loc(label),
          items: [],
        },
      ]),
    );

    await Promise.all(
      items.map(async (item) => {
        const value = item.system.notes.description;

        const enrich =
          await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            value,
            {
              secrets: item.isOwner,
              relativeTo: item,
              rollData: item.getRollData?.() ?? {},
            },
          );

        categories[item.system.type.value].items.push({
          doc: item,
          description: enrich,
        });
      }),
    );

    context.feats = categories;
    return context;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   *
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static _viewExternalActor(_, target) {
    const { uuid } = target.closest("[data-uuid]")?.dataset;
    if (!uuid) return;
    const actor = foundry.utils.fromUuidSync(uuid);
    actor?.sheet?.render({ force: true });
  }

  /**
   *
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async _togglePokemonTeam(_, target) {
    const { uuid } = target.closest("[data-uuid]")?.dataset;
    if (!uuid) return;

    const pokemon = foundry.utils.fromUuidSync(uuid);
    await pokemon?.update({
      "system.trainer.inTeam": !pokemon.system.trainer.inTeam,
    });
  }
}
