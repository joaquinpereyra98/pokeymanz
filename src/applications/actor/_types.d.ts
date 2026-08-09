import {
  ApplicationRenderContext,
  ApplicationRenderOptions,
} from "@client/applications/_types.mjs";

import * as data from "../../data/_module.mjs";
import * as documents from "../../documents/_module.mjs";

declare module "./pokemon-sheet.mjs" {
  export default interface PokemonSheet {
    actor: Omit<documents.PokeymanzActor, "system"> & {
      system: data.actor.PokemonData;
    };
  }
}

declare module "./trainer-sheet.mjs" {
  export default interface TrainerSheet {
    actor: Omit<documents.PokeymanzActor, "system"> & {
      system: data.actor.TrainerData;
    };
  }
}

/**
 * Application V2 Part Context Preparation handler.
 */
export type PartContextHandler<
  Context extends Record<string, unknown> = ApplicationRenderContext,
  Options extends Record<string, unknown> = ApplicationRenderOptions,
> = (context: Context, options: Options) => Promise<Context>;
