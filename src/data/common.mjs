export function pokemonTypeFields({ blank = true, required = false } = {}) {
  const choices = CONFIG.POKEYMANZ.pokemonTypesList.reduce((acc, v) => {
    acc[v.id] = v.name;
    return acc;
  }, {});

  return new foundry.data.fields.StringField({
    choices,
    required,
    blank,
    initial: blank ? "" : Object.keys(choices)[0],
  });
}
