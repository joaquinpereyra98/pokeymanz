import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";
import * as SYSTEM_CONST from "../../constants.mjs";

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
      viewExternalActor: TrainerSheet._viewExternalActor,
      togglePokemonTeam: TrainerSheet._togglePokemonTeam,
    },
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: `${SYSTEM_CONST.TEMPLATES_PATH}/actors/parts/summary.hbs`,
    },
    inventory: {
      template: `${SYSTEM_CONST.TEMPLATES_PATH}/actors/parts/inventory.hbs`,
    },
    features: {
      template: `${SYSTEM_CONST.TEMPLATES_PATH}/actors/parts/features.hbs`,
    },
    pokemon: {
      template: `${SYSTEM_CONST.TEMPLATES_PATH}/actors/parts/pokemon.hbs`,
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
    {
      id: "notes",
      group: "primary",
      icon: "fa-solid fa-notebook",
      label: "POKEYMANZ.Sheets.TABS.Notes",
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
      attributes: this._prepareAttributes(),
      pokemons: this._preparePokemons(),
    };
  }

  _prepareAttributes() {
    const { attributes } = this.actor.system;
    return Object.fromEntries(
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
  }

  _preparePokemons() {
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
    this.render();
  }
}
