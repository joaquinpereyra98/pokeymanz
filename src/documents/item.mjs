export default class PokeymanzItem extends Item {
    prepareData() {
      super.prepareData();
    }
    getRollData() {
      if (!this.actor) return null;
      const rollData = this.actor.getRollData();
      rollData.item = foundry.utils.deepClone(this.system);
      return rollData;
    }
    async _preCreate(data, options, user){
      await super._preCreate(data, options, user);
      if (!data.img) {
        this.updateSource({
            img: `systems/pokeymanz/assets/item-img/${data.type}.svg`,
        });
    }
    }
  }