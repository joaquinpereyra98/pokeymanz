const { SchemaField, NumberField, StringField, HTMLField } =
  foundry.data.fields;

export function attributeDiceFields() {
  return {
    die: new SchemaField({
      sides: new NumberField({
        initial: 4,
        min: 0,
        integer: true,
        positive: true,
        label: "POKEYMANZ.DieSides",
      }),
      modifier: new NumberField({
        initial: 0,
        integer: true,
        required: false,
        label: "POKEYMANZ.AttributeMod",
      }),
    }),
  };
}

export function pokemonTypeFields() {
  const choices = CONFIG.POKEYMANZ.pokemonTypesList.reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
  }, {});

  return new StringField({
    choices,
    blank: true,
  });
}

export function descriptionsFields() {
  return new SchemaField({
    value: new HTMLField({ initial: "", label: "POKEYMANZ.Description" }),
    gmNotes: new HTMLField({ initial: "", label: "POKEYMANZ.GMNotes" }),
  });
}
