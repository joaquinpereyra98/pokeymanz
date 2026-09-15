import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";
import { POKEMON_TEMPLATES_PATH } from "../../constants.mjs";

/**
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs"
 */

/**
 * The Pokeymanz Actor application.
 * @extends BaseActorSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias PokemonSheet
 */
export default class PokemonSheet extends InteractiveUIFeaturesMixin(
  BaseActorSheet,
) {
  /** @inheritdoc */
  static metadata = Object.freeze(
    foundry.utils.mergeObject(
      super.metadata,
      {
        label: "POKEYMANZ.SHEETS.PokemonSheet",
        types: ["pokemon"],
        register: true,
      },
      { inplace: false },
    ),
  );

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["pokemon"],
    position: {
      width: 800,
      height: 550,
    },
    actions: {
      toggleTrainerTeam: PokemonSheet.#toggleTrainerTeam,
      createAbility: PokemonSheet.#createAbility,
    },
    accordions: [
      {
        headingSelector: ".ability-container",
        contentSelector: ".ability-content",
        startCollapsed: true,
      },
    ],
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: `${POKEMON_TEMPLATES_PATH}/summary.hbs`,
      templates: [`${POKEMON_TEMPLATES_PATH}/parts/sidebar.hbs`],
      scrollable: [""],
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
    const trainer = this.actor.system.trainer.value;
    if (trainer && !trainer.relatedApps[this.id]) {
      trainer.relatedApps[this.id] = this;
    }
  }

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const baseContext = await super._prepareContext(options);
    const { trainer, stats, schema } = this.document.system;

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
      trainer: {
        value: trainer.value?.id ?? "",
        field: schema.getField("trainer.value"),
        inTeam: trainer.inTeam,
      },
      abilities: await this._prepareAbilties(),
    };
  }

  /**
   * Prepare the abilities context owned by this Pokémon
   * @returns {Promise<Array<object>>}
   * @protected
   */
  async _prepareAbilties() {
    const abilities = [];

    for (const ability of this.document.itemTypes.ability) {
      abilities.push({
        doc: ability,
        uuid: ability.uuid,
        enrichDescription:
          await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            ability.system.notes.description,
            {
              secrets: ability.isOwner,
              rollData: ability.getRollData(),
              relativeTo: ability,
            },
          ),
      });
    }

    abilities.sort((a, b) => a.sort - b.sort);

    return abilities;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   *T oggle whether this Pokémon is currently in the trainer's active team
   * @this PokemonSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async #toggleTrainerTeam(event, target) {
    event.preventDefault();
    await this.document.update({
      "system.trainer.inTeam": !this.document.system.trainer.inTeam,
    });
  }

  /**
   * Create a new Ability item on this Pokémon
   * @this PokemonSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async #createAbility(event) {
    const doc = await foundry.documents.Item.implementation.create(
      {
        name: _loc("DOCUMENT.New", { type: "Ability" }),
        type: "ability",
      },
      { parent: this.document },
    );

    if (!event.shiftKey) doc.sheet?.render({ force: true });
  }
}
