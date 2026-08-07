import PokeymanzActor from "../../documents/actor.mjs";
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
    stats: BaseActorStats & {
      mastery: {
        value1: boolean;
        value2: boolean;
      };
      exp: number;
    };
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
export interface AttributeSchema {
  faces: number;
  modifier: number;
}

declare module "./trainer.mjs" {
  export default interface TrainerData {
    stats: BaseActorStats;
    attributes: {
      heart: AttributeSchema;
      fitness: AttributeSchema;
      research: AttributeSchema;
      tactics: AttributeSchema;
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
