export default class PokeymanzActor extends Actor {
    prepareData() {
      super.prepareData();
    }
    prepareDerivedData() {
      const actorData = this;
      const systemData = actorData.system;
      const flags = actorData.flags.pokeymanz || {};
      if (systemData.setting.autoCalcToughness) {
        systemData.stats.toughness.value =
          systemData.attributes.fitness.die.sides / 2;
      }
      systemData.stats.toughness.sum =
        systemData.stats.toughness.value + systemData.stats.toughness.modifier;
    }
    getRollData() {
      const data = super.getRollData();
      const attributes = foundry.utils.deepClone(this.system.attributes);
      for (const [key, attribute] of Object.entries(attributes)) {
        data.attributes[key].name = game.i18n.localize(
          POKEYMANZ.attributes[key].label
        );
      }
      return data;
    }
    rollAttribute(event, option = {}) {
      event.preventDefault();
      const data = this.actor.getRollData();
      const attribute = event.currentTarget.dataset.attribute;
      const label = data.attributes[attribute].name;
      const die = data.attributes[attribute].die.sides;
      const mod = data.attributes[attribute].die.modifier;
      const Mod = mod >= 0 ? `+${mod}` : `${mod}`;
  
      const wounds = `${this.actor.calcWoundPenalties() || ""}`;
  
      const formula = `1d${die}x${Mod}${wounds}[${label}]`;
      let roll = new Roll(formula, data);
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: game.i18n.format("POKEYMANZ.AttributePromptTitle", {
          attr: label,
        }),
        rollMode: null,
      });
      return roll;
    }
    async attributeMenu(event) {
      const attributesPath = "system.attributes";
      const attributes = deepClone(this.actor.getRollData().attributes);
      const content = await renderTemplate(
        "systems/pokeymanz/templates/apps/attribute-menu.hbs",
        {
          actor: this.actor,
          attributes: attributes,
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
      );
      d.render(true);
    }
    async statMenu(event) {
      const toughnessBolean = this.actor.system.setting.autoCalcToughness;
      const toughness = this.actor.system.stats.toughness;
      const primary = this.actor.system.stats.types.primary;
      const secondary = this.actor.system.stats.types.secondary;
      const choices = POKEYMANZ.pokemonTypes;
      const content = await renderTemplate(
        "systems/pokeymanz/templates/apps/stat-menu.hbs",
        {
          actor: this.actor,
          toughness: toughness,
          toughnessBolean: toughnessBolean,
          primary: primary,
          secondary: secondary,
          choices: choices,
        }
      );
  
      let d = new Dialog(
        {
          title: game.i18n.format("POKEYMANZ.StatMenuTitle"),
          content: content,
          buttons: {
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.format("POKEYMANZ.CancelButton"),
            },
            accept: {
              icon: "<i class fas fa-check></i> ",
              label: game.i18n.format("POKEYMANZ.ApplyButton"),
              callback: (html) => {
                const newData = {};
                newData["system.setting.autoCalcToughness"] = html.find(
                  `input[name="toughnessBolean"]`
                )[0].checked;
                newData["system.stats.toughness"] = {
                  value: parseInt(
                    html.find('input[name="toughness.value"]').val() || 0
                  ),
                  modifier: parseInt(
                    html.find('input[name="toughness.modifier"]').val() || 0
                  ),
                };
                newData["system.stats.types"] = {
                  primary: html.find(`select[name="primaryType"]`).val(),
                  secondary: html.find(`select[name="secondaryType"]`).val(),
                };
                this.actor.update(newData);
              },
            },
          },
          default: "cancel",
        },
        {
          classes: ["pokeymanz", "dialog"],
        }
      );
      d.render(true);
    }
    calcWoundPenalties() {
      const wounds = getProperty(this, "system.stats.wounds");
      return Math.clamped(wounds.value, 0, wounds.max) * -1;
    }
  }
  