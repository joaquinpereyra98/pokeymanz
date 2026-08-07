/* Foundry Types */
import EmbeddedCollection from "@common/abstract/embedded-collection.mjs";
import { ActorData, ItemData } from "@common/documents/_types.mjs";
import { ActiveEffect } from "@client/documents/_module.mjs";

/* System Types */
import { actor as ActorModels, item as ItemModels } from "../data/_module.mjs";
import { PokeymanzActor, PokeymanzItem } from "./_module.mjs";

type ClientDocument = ReturnType<
  typeof foundry.documents.abstract.ClientDocumentMixin
>;

type ActorModel = (typeof ActorModels)[Exclude<
  keyof typeof ActorModels,
  "BaseActorData"
>];
type ItemModel = (typeof ItemModels)[Exclude<
  keyof typeof ItemModels,
  "BaseItemData"
>];

declare module "@client/documents/_module.mjs" {
  interface BaseActor<Model extends ActorModel = ActorModel>
    extends ActorData, InstanceType<ClientDocument> {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    items: EmbeddedCollection<PokeymanzItem>;
    effects: EmbeddedCollection<ActiveEffect>;
  }

  interface BaseItem<Model extends ItemModel = ItemModel>
    extends ItemData, InstanceType<ClientDocument> {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    effects: EmbeddedCollection<ActiveEffect>;
  }
}
