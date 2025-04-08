import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

/**
 * The Pokeymanz Actor application.
 * @extends BaseActorSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias TrainerSheet
 */
export default class TrainerSheet extends InteractiveUIFeaturesMixin(
  BaseActorSheet,
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 720,
      height: 550,
    },
    actions: {
      roll: TrainerSheet._onRoll,
      viewExternalActor: TrainerSheet._viewExternalActor,
      togglePokemonTeam: TrainerSheet._togglePokemonTeam,
    },
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: "systems/pokeymanz/templates/actors/parts/summary.hbs",
    },
    inventory: {
      template: "systems/pokeymanz/templates/actors/parts/inventory.hbs",
    },
    features: {
      template: "systems/pokeymanz/templates/actors/parts/features.hbs",
    },
    pokemon: {
      template: "systems/pokeymanz/templates/actors/parts/pokemon.hbs",
    },
  };

  /* -------------------------------------------- */
  /*  TABS                                        */
  /* -------------------------------------------- */

  /**
   * Available tabs for the sheet.
   * @type {Array<{id: string, group: string, icon: string}>}
   */
  static TABS = [
    {
      id: "summary",
      group: "primary",
      icon: "fa-solid fa-address-card",
      label: "POKEYMANZ.Sheets.TABS.Summary",
    },
    {
      id: "features",
      group: "primary",
      icon: "fa-solid fa-list",
      label: "POKEYMANZ.Sheets.TABS.Features",
    },
    {
      id: "inventory",
      group: "primary",
      icon: "fa-solid fa-backpack",
      label: "POKEYMANZ.Sheets.TABS.Inventory",
    },
    {
      id: "pokemon",
      group: "primary",
      icon: "fa-solid fa-paw",
      label: "POKEYMANZ.Sheets.TABS.Pokemon",
    },
    {
      id: "effects",
      group: "primary",
      icon: "fa-solid fa-bolt",
      label: "POKEYMANZ.Sheets.TABS.Effects",
    },
  ];

  /** @override */
  tabGroups = {
    primary: "summary",
  };

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const baseContext = await super._prepareContext(options);
    const { stats, schema } = this.document.system;
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
      pokemons: this._preparePokemons(options),
    };
  }

  _preparePokemons(options) {
    const pokemons = this.document.system.pokemons ?? [];

    return {
      team: pokemons.filter(p => p.system.trainer.inTeam),
      pc: pokemons.filter(p => !p.system.trainer.inTeam),
    };
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handler for make rolls
   *
   * @this TrainerSheet
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
   * 
   * @param {PointerEvent} event 
   * @param {HTMLElement} target 
   */
  static _viewExternalActor(event, target) {
    const div = target.closest(".pokemon");

    const { docId } = div?.dataset;
    if (!docId) return;
    const pokemon = game.actors.get(docId);

    pokemon?.sheet?.render({ force: true });
  }

  static async _togglePokemonTeam(event, target) {
    const div = target.closest(".pokemon");

    const { docId } = div?.dataset;
    if (!docId) return;
    const pokemon = game.actors.get(docId);

    await pokemon?.update({ "system.trainer.inTeam": !pokemon.system.trainer.inTeam });
    this.render({ parts: ["pokemon"] });
  }
}
