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
};
/*Restering Handlebars Helpers*/

Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
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
        }),
        type: new fields.StringField({ initial: "" }),
      }),
      details: new fields.SchemaField({
        calling: new fields.StringField({ initial: "" }),
        currency: new fields.NumberField({ initial: 0, integer: true }),
        pronouns: new fields.StringField({ initial: "" }),
        age: new fields.NumberField({ integer: true }),
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
  }
  prepareDerivedData() {
    Object.entries(this.attributes).forEach(([key, attribute]) => {
      attribute.die = boundTraitDie(attribute.die);
    });
  }
}

/*Registering dataModels*/
Hooks.on("init", () => {
  Object.assign(CONFIG.Actor.dataModels, {
    character: CharacterData,
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
  }
  getRollData() {
    const data = super.getRollData();
    const attributes = foundry.utils.deepClone(this.system.attributes);
    for (const [key, attribute] of Object.entries(attributes)) {
      data.attributes[key].name = game.i18n.localize(POKEYMANZ.attributes[key].label);
    }
    return data;
  }
  rollAttribute(event, option={}){
    event.preventDefault();
    const data = this.actor.getRollData();
    const attribute = event.currentTarget.dataset.attribute;
    const label = data.attributes[attribute].name; 
    const die = data.attributes[attribute].die.sides;
    const mod = data.attributes[attribute].die.modifier;
    let Mod;
    if(mod>=0)Mod=`+${mod}`
    else Mod=`${mod}`

    const formula = `1d${die}x${Mod}[${label}]`;
    let roll = new Roll(formula, data)
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: game.i18n.format("POKEYMANZ.AttributePromptTitle", {attr: label}),
      rollMode: null,
    })
    return roll;
  }
  async attributeMenu(event){
    const attributesPath = 'system.attributes';
    const attributes = deepClone(this.actor.getRollData().attributes);
    const content = await renderTemplate("systems/pokeymanz/templates/apps/attribute-menu.hbs",{
      actor: this.actor,
      attributes: attributes
    });
    let d = new Dialog({
      title: game.i18n.format("POKEYMANZ.AttributeMenuTitle"),
      content: content,
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel Changes"
         },
       accept: {
        icon: '<i class="fas fa-check"></i>',
        label: "Apply Changes",
        callback: (html) => {
          const newData = Object.keys(attributes).reduce((data, att) => {
            data[`${attributesPath}.${att}.die.modifier`] = parseInt(html.find(`input[name="${att}.modifier"]`).val());
            data[`${attributesPath}.${att}.die.sides`] = html.find(`select[name="${att}.sides"]`).val();
            return data;
          }, {});
          this.actor.update(newData)
        }
       }
      },
      default: "cancel",
     },{
      classes:['pokeymanz','dialog'],
      height: 255
     });
     d.render(true);
  } 
}

/*Registering ActorDocumments*/
Hooks.on("init", () => {
  game.pokeymanz = {
    PokeymanzActor,
  };
  CONFIG.Actor.documentClass = PokeymanzActor;
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

    /*ROLL ATTRIBUTES BUTTON*/
    html.find(".config-button").click(this.actor.attributeMenu.bind(this));
    html.find(".rollable[data-attribute]").click(this.actor.rollAttribute.bind(this));
  }
}

/*Registering ActorSheets*/
Hooks.on("init", () => {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Chatacter Sheet", CharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Pokeymanz.CharacterSheet",
  });
});
