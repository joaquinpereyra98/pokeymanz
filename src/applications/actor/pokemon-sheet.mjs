import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";
import { POKEMON_TEMPLATES_PATH } from "../../constants.mjs";

/**
 * The Pokeymanz Actor application.
 * @extends BaseActorSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias PokemonSheet
 */
export default class PokemonSheet extends InteractiveUIFeaturesMixin(BaseActorSheet) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 800,
      height: 550,
    },
    actions: {
      toggleTrainerTeam: PokemonSheet.#toggleTrainerTeam,
    },
    contextMenus: [
      {
        selector: ".move-menu",
        menuItems: PokemonSheet._getMoveMenuItems(),
        options: {
          eventName: "click",
        },
      },
    ],
    accordions: [
      {
        headingSelector: ".move-header",
        contentSelector: ".move-content",
        startCollapsed: true,
      },
    ],
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: `${POKEMON_TEMPLATES_PATH}/summary.hbs`,
      templates: [`${POKEMON_TEMPLATES_PATH}/parts/sidebar.hbs`],
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

  /* -------------------------------------------- */
  /*  Drop-Down Menus                             */
  /* -------------------------------------------- */

  /**
   * @returns {ContextMenuEntry[]} An array of context menu item objects.
   */
  static _getMoveMenuItems() {
    return [
      {
        label: "POKEYMANZ.Item.EditItem",
        icon: '<i class="fas fa-edit"></i>',
        callback: (html) => {
          const element = html instanceof HTMLElement ? html : html[0];
          const uuid = element.dataset.itemUuid;
          fromUuidSync(uuid)?.sheet?.render({ force: true });
        },
      },
      {
        label: "Delete",
        icon: '<i class="fas fa-trash"></i>',
        callback: (html) => {
          const element = html instanceof HTMLElement ? html : html[0];
          const uuid = element.dataset.itemUuid;
          fromUuidSync(uuid)?.delete();
        },
      },
    ];
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
      moves: await this._prepareMoves(),
    };
  }

  async _prepareMoves() {
    const moves = [];

    for (const move of this.document.itemTypes.move) {
      moves.push({
        ...move.toObject(),
        uuid: move.uuid,
        moveType: move.system.pokemonTypes.primary,
        enrichDescription:
          await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            move.system.notes.description,
            {
              secrets: move.isOwner,
              rollData: move.getRollData(),
              relativeTo: move,
            },
          ),
      });
    }
    moves.sort((a, b) => a.sort - b.sort);

    while (moves.length < 4) {
      moves.push(null);
    }

    return moves;
  }
  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * 
   * @this PokemonSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static async #toggleTrainerTeam(event, target) {
    event.preventDefault();
    await this.document.update({
      "system.trainer.inTeam": !this.document.system.trainer.inTeam,
    });
  }
}
