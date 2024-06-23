export default class PokeymanzActorSheet extends ActorSheet {
    static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["pokeymanz", "sheet", "actor"],
        width: 600,
        height: 600,
        resizable: true,
        tabs: [
          {
            group: "primary",
            navSelector: ".tabs",
            contentSelector: ".sheet-body",
            initial: "features",
          },
        ],
      });
    }
    get template() {
      const base = "systems/pokeymanz/templates/";
      //if(this.actor.limited)return base+'limited.hbs'; //Create limited template later.
      return base + "character-sheet.hbs";
    }
    async getData(options) {
      const context = super.getData();
      const actorData = this.actor.toObject(false);
      context.system = actorData.system;
      context.flags = actorData.flags;
  
      return context;
    }
    activateListeners(html) {
      super.activateListeners(html);
  
      /*ATTRIBUTES BUTTON*/
      html
        .find(".attributes .config-button")
        .click(this.actor.attributeMenu.bind(this));
      html
        .find(".rollable[data-attribute]")
        .click(this.actor.rollAttribute.bind(this));
      /*STATS BUTTONS*/
      html.find(".stats .config-button").click(this.actor.statMenu.bind(this));
      /*COUNTERS BUTTONS*/
      html.find(".wounds .wounds-button").on("click", (event) => {
        const wounds = this.actor.system.stats.wounds;
        switch (event.currentTarget.dataset.action) {
          case "wounds-plus":
            this.actor.update({
              "system.stats.wounds.value": Math.min(wounds.max, wounds.value + 1),
            });
            break;
          case "wounds-minus":
            this.actor.update({
              "system.stats.wounds.value": Math.max(0, wounds.value - 1),
            });
            break;
        }
      });
    }
  }