const { api, sheets } = foundry.applications;
export default class PokeymanzActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  static DEFAULT_OPTIONS = {
    classes: ["pokeymanz", "sheet", "actor"],
    position: {
      width: 600,
      height: 600,
    },
    actions: {
      openConfigMenu: this._openMenu,
      modifyWounds: this._modifyWounds,
      roll: this._onRoll,
    },
    window: {
      resizable: true,
      minizable: true,
      icon: "fa-solid fa-user",
    },
    form: {
      submitOnChange: true,
    },
  };
  static PARTS = {
    main: {
      template: "systems/pokeymanz/templates/character-sheet.hbs",
    },
  };
  async _prepareContext(options) {
    const context = {
      editable: this.isEditable,
      actor: this.actor,
      system: this.actor.system,
      flags: this.actor.flags,
    };

    return context;
  }
  static async _openMenu(event, target) {
    switch (target.dataset.menu) {
      case "attribute":
        await this._renderAttributeMenu();
        break;
      case "stat":
        await this._renderStatMenu();
        break;
      default:
        break;
    }
  }
  async _renderAttributeMenu() {
    const attributesPath = "system.attributes";
    const attributes = foundry.utils.deepClone(
      this.actor.getRollData().attributes
    );
    const dieChoice = {
      4: "d4",
      6: "d6",
      8: "d8",
      10: "d10",
      12: "d12",
    };
    const content = await renderTemplate(
      "systems/pokeymanz/templates/apps/attribute-menu.hbs",
      {
        actor: this.actor,
        attributes: attributes,
        dieChoice: dieChoice,
      }
    );
    let d = new Dialog(
      {
        title: game.i18n.format("POKEYMANZ.AttributeMenuTitle"),
        content: content,
        buttons: {
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.format("POKEYMANZ.CancelButton"),
          },
          accept: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.format("POKEYMANZ.ApplyButton"),
            callback: (html) => {
              const newData = Object.keys(attributes).reduce((data, att) => {
                data[`${attributesPath}.${att}.die.modifier`] = parseInt(
                  html.find(`input[name="${att}.modifier"]`).val() || 0
                );
                data[`${attributesPath}.${att}.die.sides`] = html
                  .find(`select[name="${att}.sides"]`)
                  .val();
                return data;
              }, {});
              this.actor.update(newData);
            },
          },
        },
        default: "cancel",
      },
      {
        classes: ["pokeymanz", "dialog"],
        height: 255,
      }
    ).render(true);
  }
  async _renderStatMenu() {
    const { system: systemData } = this.actor;
    const { fields } = foundry.data;
    const pokemonTypesChoices = CONFIG.POKEYMANZ.pokemonTypesList.reduce(
      (choices, type) => {
        choices[type.id] = type.name;
        return choices;
      },
      {}
    );

    const renderData = {
      systemData,
      toughnessBoleanField: new fields.BooleanField({
        label: "POKEYMANZ.ToughnessBooleanLabel",
        hint: "POKEYMANZ.ToughnessBooleanText",
        value: systemData.setting.autoCalcToughness,
      }),
      toughnessValueField: new fields.NumberField({
        value: systemData.stats.toughness.value,
        label: "POKEYMANZ.Value",
        step: 1,
        integer: true,
        min: 0,
      }),
      toughnessModField: new fields.NumberField({
        value: systemData.stats.toughness.modifier,
        label: "POKEYMANZ.Modifier",
        step: 1,
      }),
      primaryTypeField: new fields.StringField({
        value: systemData.stats.types.primary,
        label: "POKEYMANZ.Stat.PrimaryType",
        choices: pokemonTypesChoices,
      }),
      secondaryTypeField: new fields.StringField({
        value: systemData.stats.types.secondary,
        label: "POKEYMANZ.Stat.SecondaryType",
        choices: pokemonTypesChoices,
      }),
    };
    const content = await renderTemplate(
      "systems/pokeymanz/templates/apps/stat-menu.hbs",
      renderData
    );

    const dialog = new foundry.applications.api.DialogV2({
      title: game.i18n.format("POKEYMANZ.StatMenuTitle"),
      content: content,
      classes: ["pokeymanz", "dialog"],
      buttons: [
        {
          action: "cancel",
          default: true,
          icon: "fas fa-times",
          label: game.i18n.format("POKEYMANZ.CancelButton"),
        },
        {
          action: "accept",
          icon: "fas fa-check",
          label: game.i18n.format("POKEYMANZ.ApplyButton"),
          callback: (event, button, dialog) => {
            const formData = new FormDataExtended(button.form).object;
            this.actor.update({
              system: {
                "setting.autoCalcToughness": formData.toughnessBolean,
                stats: {
                  toughness: {
                    value: formData.toughnessValue,
                    modifier: formData.toughnessMod,
                  },
                  types: {
                    primary: formData.primaryType,
                    secondary: formData.secondaryType,
                  },
                },
              },
            });
          },
        },
      ],
    });
    dialog.addEventListener("render", () => {
      const checkbox = dialog.element.querySelector(
        "input[name='toughnessBolean']"
      );
      const input = dialog.element.querySelector(
        "input[name='toughnessValue']"
      );

      const updateInput = () => (input.readOnly = checkbox.checked);

      updateInput();
      checkbox.addEventListener("change", updateInput);
    });
    dialog.render(true);
  }
  static _modifyWounds(event, target) {
    const action = target.dataset;
    const wounds = this.actor.system.stats.wounds;
    switch (action) {
      case "wounds-plus":
        this.actor.update({
          "system.stats.wounds.value": Math.min(wounds.max, wounds.value + 1),
        });
        break;
      case "wounds-minus":
        this.actor.update({
          "system.stats.wounds.value": Math.max(0, wounds.value - 1),
        });
        break;
      default:
        break;
    }
  }
  static _onRoll(event, target) {
    const roll = target.dataset.roll;
    switch (roll) {
      case "attribute":
        const { attribute } = target.dataset;
        this.actor.rollAttribute(attribute);
        break;

      default:
        break;
    }
  }
}
