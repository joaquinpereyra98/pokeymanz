export default class HindrancesData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      const fields = foundry.data.fields;
      return {
        category: new fields.StringField({ initial: "", textSearch: true }),
        source: new fields.StringField({initial: "", textSearch: true}),
        enrichedTexts:new fields.SchemaField({
          description: new fields.HTMLField({initial: "" }),
          requirement: new fields.HTMLField({ initial: "" }),
          notes: new fields.HTMLField({ initial: "" }),
        })
      };
    }
  }