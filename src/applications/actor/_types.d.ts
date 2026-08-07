declare module "./pokemon-sheet.mjs" {
  export default interface PokemonSheet {
    actor: Omit<documents.PokeymanzActor, "system"> & {
      system: data.Actor.PokemonData;
    };
  }
}
