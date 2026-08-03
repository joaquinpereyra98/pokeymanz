import { ITEMS_ASSETS_PATH } from "../../constants.mjs";
import BaseItemData from "./base-item.mjs";

export default class AbilityData extends BaseItemData {
  /**@inheritdoc */
  static get metadata() {
    return {
      ...super.metadata,
      icon: "fa-solid fa-foot-wing",
      type: "ability",
      defaultImg: `${ITEMS_ASSETS_PATH}/wingfoot.svg`,
      invalidActorTypes: ["trainer"],
    };
  }

  /**@inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
    };
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /**@inheritdoc */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
  }
}
