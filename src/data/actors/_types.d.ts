import PokeymanzActor from "../../documents/actor.mjs";
import { AttributeDiceData } from "../commons/attribute-dice-field.mjs";
/**
 =========================
 * Base Actor Data Model 
 =========================
 */
interface BaseActorStats {
  toughness: {
    value: numberM;
  };
  pokemonTypes: {
    primary: {
      value: string;
    };
    secondary: {
      value: string;
    };
  };
  wounds: {
    value: number;
    max: number;
  };
}

declare module "./base-actor.mjs" {
  export default interface BaseActorData {
    parent: PokeymanzActor;
    stats: BaseActorStats;
  }
}

/**
 =========================
 * Pokemon Actor Data Model 
 =========================
 */
declare module "./pokemon.mjs" {
  export default interface PokemonData {
    stats: BaseActorStats & {};
    details: {
      species: string;
      gender: string;
    };
    trainer: {
      value: foundry.documents.BaseActor | null;
      inTeam: boolean;
    };
    notes: {
      pokedexEntry: string;
    };
  }
}

/**
 =========================
 * Trainer Actor Data Model 
 =========================
 */

declare module "./trainer.mjs" {
  export default interface TrainerData {
    stats: BaseActorStats;
    attributes: {
      heart: AttributeDiceData;
      fitness: AttributeDiceData;
      research: AttributeDiceData;
      tactics: AttributeDiceData;
    };
    details: {
      calling: string;
      pronouns: string;
      age: number;
    };
    currency: number;
    notes: {
      biography: string;
    };
  }
}
