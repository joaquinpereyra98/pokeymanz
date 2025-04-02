import BaseActorSheet from "./base-actor-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";

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
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 800,
      height: 550,
    },
    actions: {},
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
      template: "systems/pokeymanz/templates/actors/parts/summary.hbs",
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
  /*  Drop-Down Menus                             */
  /* -------------------------------------------- */

  static _getMoveMenuItems() {
    return [
      {
        name: "POKEYMANZ.Item.EditItem",
        icon: "<i class=\"fas fa-edit\"></i>",
        callback: ([html]) => {
          const uuid = html.dataset.itemUuid;
          fromUuidSync(uuid)?.sheet?.render({ force: true });
        },
      },
      {
        name: "Delete",
        icon: "<i class=\"fas fa-trash\"></i>",
        callback: ([html]) => {
          const uuid = html.dataset.itemUuid;
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
        enrichDescription: await TextEditor.enrichHTML(
          move.system.description.value,
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
}
