export default class NotesHTMLField extends foundry.data.fields.HTMLField {
  /**
    * Enrich the HTML content of this field value.
    * @param {string} value - The raw HTML value to enrich.
    * @param {Document} document 
    * @param {EnrichmentOptions} [options] - Options passed to TextEditor.enrichHTML
    * @returns {Promise<string>} Enriched HTML content.
    */
  async enrich(value, document, options) {
    return await TextEditor.enrichHTML(value, {
      secrets: document.isOwner,
      relativeTo: document,
      rollData: document.getRollData?.() ?? {},
      ...options,
    });
  }

  /** @override */
  toFormGroup(groupConfig = {}, inputConfig = {}) {
    if (groupConfig.widget instanceof Function) return groupConfig.widget(this, groupConfig, inputConfig);

    const {
      localize = true,
      classes = [],
    } = groupConfig;

    const { accordion } = inputConfig;

    delete inputConfig.accordion;

    const label = groupConfig.label ?? this.label ?? this.fieldPath;
    let input = groupConfig.input ?? this.toInput(inputConfig);
    input = input instanceof HTMLCollection ? input : [input];

    const group = document.createElement("div");

    if (accordion) classes.unshift("accordion-container");

    classes.unshift("note-container");
    group.className = classes.join(" ");

    const header = document.createElement("div");
    header.className = "note-header";
    const headerChild = [];

    const lbl = document.createElement("label");
    lbl.innerText = localize ? game.i18n.localize(label) : label;
    headerChild.push(lbl);

    if (accordion) {
      const icon = document.createElement("i");
      icon.className = "accordion-icon fa-solid fa-caret-down";
      headerChild.unshift(icon);
    }

    header.prepend(...headerChild);
    group.prepend(header);

    const content = document.createElement("div");
    content.className = "note-content";
    content.append(...input);
    group.append(content);

    return group;
  }
}
