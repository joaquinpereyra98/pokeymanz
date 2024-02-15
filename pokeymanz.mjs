const POKEYMANZ = {
  attributes: {
    heart: {
      label: "POKEYMANZ.Heart",
    },
    fitness: {
      label: "POKEYMANZ.Fitness",
    },
    research: {
      label: "POKEYMANZ.Research",
    },
    tatics: {
      label: "POKEYMANZ.Tatics",
    },
  },
  types: {
    none: "POKEYMANZ.None",
    normal: "POKEYMANZ.Normal",
    fire: "POKEYMANZ.Fire",
    water: "POKEYMANZ.Water",
    grass: "POKEYMANZ.Grass",
    flying: "POKEYMANZ.Flying",
    fighting: "POKEYMANZ.Fighting",
    poison: "POKEYMANZ.Poison",
    electric: "POKEYMANZ.Electric",
    ground: "POKEYMANZ.Ground",
    rock: "POKEYMANZ.Rock",
    psychic: "POKEYMANZ.Psychic",
    ice: "POKEYMANZ.Ice",
    bug: "POKEYMANZ.Bug",
    ghost: "POKEYMANZ.Ghost",
    steel: "POKEYMANZ.Steel",
    dragon: "POKEYMANZ.Dragon",
    dark: "POKEYMANZ.Dark",
    fairy: "POKEYMANZ.Fairy",
  },
  category:{
    battle: "POKEYMANZ.Battle",
    social:"POKEYMANZ.Social",
    utility:"POKEYMANZ.Utility",
  }
};
/*Restering Handlebars Helpers*/

Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

/* Defining CharacterData*/
function attributeDiceFields() {
  const fields = foundry.data.fields;
  return {
    die: new fields.SchemaField({
      sides: new fields.NumberField({
        initial: 4,
        min: 0,
        integer: true,
        positive: true,
      }),
      modifier: new fields.NumberField({
        initial: 0,
        integer: true,
        required: false,
      }),
    }),
  };
}
function ensureCurrencyIsNumeric(source) {
  if (!source.details || !Object.hasOwn(source.details, "currency")) return; // return early in case of update
  if (
    source.details.currency === null ||
    typeof source.details.currency === "number"
  )
    return;
  if (typeof source.details.currency === "string") {
    // remove all symbols that aren't numeric or a decimal point
    source.details.currency = Number(
      source.details.currency.replaceAll(/[^0-9.]/g, "")
    );
  }
}
function boundTraitDie(die) {
  const sides = die.sides;
  if (sides < 4 && sides !== 1) {
    die.sides = 4;
  } else if (sides > 12) {
    const difference = sides - 12;
    die.sides = 12;
    die.modifier += difference / 2;
  }
  return die;
}
class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      attributes: new fields.SchemaField({
        heart: new fields.SchemaField(attributeDiceFields()),
        fitness: new fields.SchemaField(attributeDiceFields()),
        research: new fields.SchemaField(attributeDiceFields()),
        tatics: new fields.SchemaField(attributeDiceFields()),
      }),
      stats: new fields.SchemaField({
        toughness: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true }),
          modifier: new fields.NumberField({
            initial: 0,
            integer: true,
            required: false,
          }),
          sum: new fields.NumberField({ integer: true }),
        }),
        types: new fields.SchemaField({
          primary: new fields.StringField({ initial: "none" }),
          secondary: new fields.StringField({ initial: "none" }),
        }),
        wounds: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          max: new fields.NumberField({ initial: 3 }),
        }),
      }),
      details: new fields.SchemaField({
        calling: new fields.StringField({ initial: "" }),
        currency: new fields.NumberField({ initial: 0, integer: true }),
        pronouns: new fields.StringField({ initial: "" }),
        age: new fields.NumberField({ integer: true }),
      }),
      setting: new fields.SchemaField({
        autoCalcToughness: new fields.BooleanField({ initial: true }),
      }),
    };
  }
  static migrateData(source) {
    ensureCurrencyIsNumeric(source);
    return super.migrateData(source);
  }
  prepareBaseData() {
    for (const key in this.attributes) {
      const attribute = this.attributes[key];
      attribute.effects = new Array();
    }
    if (this.setting.autoCalcToughness) {
      this.stats.toughness.value = 0;
    }
    this.stats.globalModifiers = {
      heart: new Array(),
      fitness: new Array(),
      research: new Array(),
      tatics: new Array(),
      toughness: new Array(),
      attack: new Array(),
      damage: new Array(),
    };
  }
  prepareDerivedData() {
    Object.entries(this.attributes).forEach(([key, attribute]) => {
      attribute.die = boundTraitDie(attribute.die);
    });
  }
}
class ItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      category: new fields.StringField({ initial: "", textSearch: true }),
      description: new fields.HTMLField({ initial: "description", textSearch: true }),
      requirement: new fields.StringField({ initial: "requirement", textSearch: true }),
      notes: new fields.StringField({ initial: "notes", textSearch: true }),
    };
  }
}

/*Registering dataModels*/
Hooks.on("init", () => {
  Object.assign(CONFIG.Actor.dataModels, {
    character: CharacterData,
  });
  Object.assign(CONFIG.Item.dataModels, {
    edge: ItemData,
  });
});

/*Defining ActorDocumments*/
class PokeymanzActor extends Actor {
  prepareData() {
    super.prepareData();
  }
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.pokeymanz || {};
    if (systemData.setting.autoCalcToughness) {
      systemData.stats.toughness.value =
        systemData.attributes.fitness.die.sides / 2;
    }
    systemData.stats.toughness.sum =
      systemData.stats.toughness.value + systemData.stats.toughness.modifier;
  }
  getRollData() {
    const data = super.getRollData();
    const attributes = foundry.utils.deepClone(this.system.attributes);
    for (const [key, attribute] of Object.entries(attributes)) {
      data.attributes[key].name = game.i18n.localize(
        POKEYMANZ.attributes[key].label
      );
    }
    return data;
  }
  rollAttribute(event, option = {}) {
    event.preventDefault();
    const data = this.actor.getRollData();
    const attribute = event.currentTarget.dataset.attribute;
    const label = data.attributes[attribute].name;
    const die = data.attributes[attribute].die.sides;
    const mod = data.attributes[attribute].die.modifier;
    const Mod = mod >= 0 ? `+${mod}` : `${mod}`;

    const wounds = `${this.actor.calcWoundPenalties() || ""}`;

    const formula = `1d${die}x${Mod}${wounds}[${label}]`;
    let roll = new Roll(formula, data);
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: game.i18n.format("POKEYMANZ.AttributePromptTitle", {
        attr: label,
      }),
      rollMode: null,
    });
    return roll;
  }
  async attributeMenu(event) {
    const attributesPath = "system.attributes";
    const attributes = deepClone(this.actor.getRollData().attributes);
    const content = await renderTemplate(
      "systems/pokeymanz/templates/apps/attribute-menu.hbs",
      {
        actor: this.actor,
        attributes: attributes,
      }
    );
    let d = new Dialog(
      {
        title: game.i18n.format("POKEYMANZ.AttributeMenuTitle"),
        content: content,
        buttons: {
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.format("POKEYMANZ.CancelButton"),
          },
          accept: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.format("POKEYMANZ.ApplyButton"),
            callback: (html) => {
              const newData = Object.keys(attributes).reduce((data, att) => {
                data[`${attributesPath}.${att}.die.modifier`] = parseInt(
                  html.find(`input[name="${att}.modifier"]`).val() || 0
                );
                data[`${attributesPath}.${att}.die.sides`] = html
                  .find(`select[name="${att}.sides"]`)
                  .val();
                return data;
              }, {});
              this.actor.update(newData);
            },
          },
        },
        default: "cancel",
      },
      {
        classes: ["pokeymanz", "dialog"],
        height: 255,
      }
    );
    d.render(true);
  }
  async statMenu(event) {
    const toughnessBolean = this.actor.system.setting.autoCalcToughness;
    const toughness = this.actor.system.stats.toughness;
    const primary = this.actor.system.stats.types.primary;
    const secondary = this.actor.system.stats.types.secondary;
    const choices = POKEYMANZ.types;
    const content = await renderTemplate(
      "systems/pokeymanz/templates/apps/stat-menu.hbs",
      {
        actor: this.actor,
        toughness: toughness,
        toughnessBolean: toughnessBolean,
        primary: primary,
        secondary: secondary,
        choices: choices,
      }
    );

    let d = new Dialog(
      {
        title: game.i18n.format("POKEYMANZ.StatMenuTitle"),
        content: content,
        buttons: {
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.format("POKEYMANZ.CancelButton"),
          },
          accept: {
            icon: "<i class fas fa-check></i> ",
            label: game.i18n.format("POKEYMANZ.ApplyButton"),
            callback: (html) => {
              const newData = {};
              newData["system.setting.autoCalcToughness"] = html.find(
                `input[name="toughnessBolean"]`
              )[0].checked;
              newData["system.stats.toughness"] = {
                value: parseInt(
                  html.find('input[name="toughness.value"]').val() || 0
                ),
                modifier: parseInt(
                  html.find('input[name="toughness.modifier"]').val() || 0
                ),
              };
              newData["system.stats.types"] = {
                primary: html.find(`select[name="primaryType"]`).val(),
                secondary: html.find(`select[name="secondaryType"]`).val(),
              };
              this.actor.update(newData);
            },
          },
        },
        default: "cancel",
      },
      {
        classes: ["pokeymanz", "dialog"],
      }
    );
    d.render(true);
  }
  calcWoundPenalties() {
    const wounds = getProperty(this, "system.stats.wounds");
    return Math.clamped(wounds.value, 0, wounds.max) * -1;
  }
}

class PokeymanzItem extends Item {
  prepareData() {
    super.prepareData();
  }
  getRollData() {
    if (!this.actor) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);
    return rollData;
  }
}

/*Registering ActorDocumments*/
Hooks.on("init", () => {
  game.pokeymanz = {
    PokeymanzActor,
    PokeymanzItem,
  };
  CONFIG.Actor.documentClass = PokeymanzActor;
  CONFIG.Item.documentClass = PokeymanzItem;
});
/*Defining ActorSheets*/
class CharacterSheet extends ActorSheet {
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

class PokeymanzItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["pokeymanz", "sheet", "item"],
      width: 520,
      height: 480,
    });
  }
  get template() {
    return `systems/pokeymanz/templates/items/${this.item.type}-sheet.hbs`;
  }
  getData() {
    const context = super.getData();
    const itemData = context.item;

    let actor = this.object?.parent;
    context.rollData = actor?.getRollData() ?? null;

    context.system = itemData.system;
    context.flags = itemData.flags;

    context.edgeCategory=POKEYMANZ.category;
    console.log(context)
    return context;
  }
  activateListeners(html) {
    super.activateListeners(html);
  }
}

/*Registering ActorSheets*/
Hooks.on("init", () => {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Character Sheet", CharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Pokeymanz.CharacterSheet",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("Item Sheet", PokeymanzItemSheet, {
    makeDefault: true,
    label: "Pokeymanz.ItemSheet",
  });
});
