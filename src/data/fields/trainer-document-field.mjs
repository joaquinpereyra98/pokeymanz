/**
 * A special {@link foundry.data.fields.ForeignDocumentField} which defines the Trainer actor of a Pokemon actor.
 */
export default class TrainerDocumentField
  extends foundry.data.fields.ForeignDocumentField
{
  /**
   * @param {foundry.data.types.StringFieldOptions} [options]    Options which configure the behavior of the field
   * @param {foundry.data.types.DataFieldContext} [context]      Additional context which describes the field
   */
  constructor(options = {}, context = {}) {
    super(foundry.documents.BaseActor, options, context);
  }

  /** @inheritdoc */
  static get _defaults() {
    return Object.assign(super._defaults, {
      choices: () =>
        game.actors.reduce((acc, a) => {
          if (a.type === "trainer") acc[a.id] = a.name;
          return acc;
        }, {}),
    });
  }
}
