import BaseItemSheet from "./base-item-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";
import * as SYSTEM_CONST from "../../constants.mjs";

/**
 * The Pokeymanz Move application.
 * @extends BaseItemSheet
 * @mixes InteractiveApplication
 * @mixes HandlebarsApplication
 * @alias MoveSheet
 */
export default class MoveSheet extends InteractiveUIFeaturesMixin(BaseItemSheet) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 600,
      height: 550,
    },
    actions: {
      roll: MoveSheet._onRoll,
    },
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: `${SYSTEM_CONST.TEMPLATES_PATH}/items/parts/move-summary.hbs`,
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
          id: "effects",
          icon: "fa-solid fa-bolt",
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
    return {
      ...baseContext,
      categoryField: this._prepareCategory(),
      pokemonType: this._preparePokemonType(),
      roll: {
        faces: baseContext.system.roll.faces,
        modifier: baseContext.system.roll.modifier,
        icon: baseContext.system.roll.diceIcon,
        label: baseContext.system.roll.label,
        fields: baseContext.system.roll.schema.fields,
      },
    };
  }

  _prepareCategory() {
    const { system } = this.document;
    return {
      field: system.schema.getField("category"),
      value: system.category,
      img: CONFIG.POKEYMANZ.items.move.categories[system.category]?.img ?? "",
    };
  }

  _preparePokemonType() {
    const { pokemonTypes, schema } = this.document.system;
    return {
      primary: {
        ...pokemonTypes.primary,
        field: schema.getField("pokemonTypes.primary.value"),
      },
    };
  }

  /**
   * Handler for make rolls
   * @this MoveSheet
   * @type {foundry.applications.types.ApplicationClickAction}
   */
  static _onRoll(event, target) {
    const roll = target.dataset.roll;
    switch (roll) {
      case "move":
        this.document.use();
        break;
      default:
        break;
    }
  }
}
