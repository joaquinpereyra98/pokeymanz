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
          modifer: new fields.NumberField({
            initial: 0,
            integer: true,
            required: false,
          }),
        }),
      }),
      details: new fields.SchemaField({
        calling: new fields.StringField({ initial: ""}),
        currency: new fields.NumberField({ initial: 0, integer: true }),
        pronouns: new fields.StringField({ initial: "" }),
        age: new fields.NumberField({integer: true})
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
  //console.log(CONFIG.Actor.dataModels)
});

/*Defining ActorDocumments*/
class PokeymanzActor extends Actor {
  prepareData() {
    super.prepareData();
  }
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.boilerplate || {};
  }
  getRollData() {
      const data = super.getRollData();
      return data;
  }
}

/*Registering ActorDocumments*/
Hooks.on("init", () => {
  game.pokeymanz = {
    PokeymanzActor
  }
  CONFIG.Actor.documentClass=PokeymanzActor;
})
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
    context.flags = actorData.flags
    //console.log(context);
    return context;
  }
  activateListeners(html) {
    super.activateListeners(html);
    }
}

/*Registering ActorSheets*/
Hooks.on("init", () => {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Chatacter Sheet", CharacterSheet, {
    types:['character'],
    makeDefault: true,
    label: 'Pokeymanz.CharacterSheet'
  });
});
