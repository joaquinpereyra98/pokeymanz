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
      scrollable: ["tab"],
    },
    inventory: {
      template: `${TEMPLATES_PATH}/actors/parts/inventory.hbs`,
      scrollable: ["tab"],
    },
    features: {
      template: `${TEMPLATES_PATH}/actors/parts/features.hbs`,
      scrollable: ["tab"],
    },
    pokemon: {
      template: `${TEMPLATES_PATH}/actors/parts/pokemon.hbs`,
      scrollable: ["tab"],
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
      team: pokemons.filter((p) => p.system.trainer.inTeam),
      pc: pokemons.filter((p) => !p.system.trainer.inTeam),
    };
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   *
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static _viewExternalActor(_, target) {
    const div = target.closest(".pokemon");

    const { docId } = div?.dataset;
    if (!docId) return;
    const pokemon = game.actors.get(docId);

    pokemon?.sheet?.render({ force: true });
  }

  /**
   *
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async _togglePokemonTeam(_, target) {
    const div = target.closest(".pokemon");

    const { docId } = div?.dataset;
    if (!docId) return;
    const pokemon = game.actors.get(docId);

    await pokemon?.update({
      "system.trainer.inTeam": !pokemon.system.trainer.inTeam,
    });
    this.render();
  }
}
