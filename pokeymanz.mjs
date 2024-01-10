/* Defining CharacterData*/
function attributeDiceFields() {
  const fields = foundry.data.fields;
  return {
    die: new fields.SchemaField({
      sides: new foundry.data.fields.NumberField({
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
    }
    else if (sides > 12) {
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
        heart: attributeDiceFields(),
        fitness: attributeDiceFields(),
        research: attributeDiceFields(),
        tatics: attributeDiceFields(),
      }),
      stats: new fields.SchemaField({
        toughness: {
          value: new fields$1.NumberField({ initial: 0, integer: true }),
          modifer: new fields$1.NumberField({
            initial: 0,
            integer: true,
            required: false,
          }),
        },
      }),
      details: new fields$1.SchemaField({
        calling: new fields$1.HTMLField({ initial: "", textSearch: true }),
        currency: new fields$1.NumberField({ initial: 0 }),
        biography: new fields$1.HTMLField({ initial: "", textSearch: true }),
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
  prepareDerivedData(){
    Object.entries(this.attributes).forEach(([key, attribute]) => {
        attribute.die = boundTraitDie(attribute.die);
      });
      this.stats.toughness.value = this.attribute.fitness.die/2;
  }
}

/*Registering DataModel*/
Hooks.on("init", ()=>{
    Object.assign(CONFIG.Actor.dataModels,{
        "character":CharacterData,
    })
    console.log(CONFIG.Actor.dataModels)
});