import BaseItemSheet from "./base-item-sheet.mjs";
import InteractiveUIFeaturesMixin from "../mixins/InteractiveUIFeaturesMixin.mjs";
import * as SYSTEM_CONST from "../../constants.mjs";

export default class FeatSheet extends InteractiveUIFeaturesMixin(BaseItemSheet) {
  /** @inheritdoc */
  static metadata = Object.freeze(
    foundry.utils.mergeObject(
      super.metadata,
      {
        label: "POKEYMANZ.SHEETS.FeatSheet",
        types: ["feat"],
        isDefault: true,
        register: true,
      },
      { inplace: false },
    ),
  );

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 650,
      height: 510,
    },
  };

  /** @override */
  static _PARTS = {
    summary: {
      template: `${SYSTEM_CONST.TEMPLATES_PATH}/items/parts/summary.hbs`,
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
    };
  }
}
