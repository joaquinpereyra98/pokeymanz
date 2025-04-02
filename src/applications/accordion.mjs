import gsap from "/scripts/greensock/esm/all.js";

/**
 * @typedef {object} AccordionConfiguration
 * @property {string} headingSelector    The CSS selector that identifies accordion headers in the given markup.
 * @property {string} contentSelector    The CSS selector that identifies accordion content in the given markup. This
 *                                       can match content within the heading element, or sibling to the heading
 *                                       element, with priority given to the former.
 * @property {boolean} [collapseOthers]  Au tomatically collapses the other headings in this group when one heading is
 *                                       clicked.
 * @property {boolean} [startCollapsed]  If `true`, all sections start collapsed.
 * @property {boolean} [startExpanded]   If `true`, all sections start expanded. Overrides `startCollapsed`.
 */

/**
 * A class responsible for augmenting markup with an accordion effect
 * based on the Accordion Class used on DnD5e FoundryVTT system.
 * @param {AccordionConfiguration} config  Configuration options.
 */
export default class Accordion {
  constructor(config) {
    this.#config = config;
  }

  /**
   * Configuration options.
   * @type {AccordionConfiguration}
   */
  #config;

  /**
   * A mapping of heading elements to content elements.
   * @type {Map<HTMLElement, HTMLElement>}
   */
  #sections = new Map();

  /**
   * Record the state of collapsed sections.
   * @type {boolean[]}
   */
  #collapsed;

  /* -------------------------------------------- */

  /**
   * Augment the given markup with an accordion effect.
   * @param {HTMLElement} root  The root HTML node.
   */
  bind(root) {
    const firstBind = this.#sections.size < 1;
    if (firstBind) this.#collapsed = [];
    this.#sections = new Map();
    const { headingSelector, contentSelector, startCollapsed, startExpanded } =
      this.#config;

    const forceExpand = startExpanded === true;
    const forceCollapse = (startCollapsed === true) && !forceExpand;

    let collapsedIndex = 0;
    for (const heading of root.querySelectorAll(headingSelector)) {
      const content =
        heading.querySelector(contentSelector) ??
        heading.parentElement.querySelector(contentSelector);
      if (!content) continue;

      this.#sections.set(heading, content);

      if (firstBind) {
        const isCollapsed = forceExpand
          ? false
          : forceCollapse || (this.#collapsed.length > 0);

        this.#collapsed.push(isCollapsed);

        if (isCollapsed) {
          heading.classList.add("collapsed");
          gsap.set(content, { height: 0, overflow: "hidden" });
        } else {
          gsap.set(content, { height: "auto", overflow: "hidden" });
        }
      } else if (this.#collapsed[collapsedIndex]) {
        heading.classList.add("collapsed");
        gsap.set(content, { height: 0, overflow: "hidden" });
      }

      heading.classList.add("accordion-heading");
      content.classList.add("accordion-content");

      heading.addEventListener("click", this._onClickHeading.bind(this));
      collapsedIndex++;
    }

    this._restoreCollapsedState();
  }

  /* -------------------------------------------- */

  /**
   * Handle clicking an accordion heading.
   * @param {PointerEvent} event  The triggering event.
   * @protected
   */
  _onClickHeading(event) {
    if (event.target.closest("a")) return;
    const heading = event.currentTarget;
    const content = this.#sections.get(heading);
    if (!content) return;
    event.preventDefault();
    const collapsed = heading.parentElement.classList.contains("collapsed");
    if (collapsed) this._onExpandSection(heading, content);
    else this._onCollapseSection(heading, content);
  }

  /* -------------------------------------------- */

  /**
   * Handle expanding a section.
   * @param {HTMLElement} heading             The section heading.
   * @param {HTMLElement} content             The section content.
   * @param {object} [options]
   * @param {boolean} [options.animate=true]  Whether to animate the expand effect.
   * @protected
   */
  _onExpandSection(heading, content) {
    if (this.#config.collapseOthers) {
      for (const [otherHeading, otherContent] of this.#sections.entries()) {
        if (
          (heading !== otherHeading) &&
          !otherHeading.parentElement.classList.contains("collapsed")
        ) {
          this._onCollapseSection(otherHeading, otherContent);
        }
      }
    }

    heading.parentElement.classList.remove("collapsed");
    gsap.to(content, { height: "auto", duration: 0.5, overflow: "hidden" });
    const icon = heading.querySelector(".accordion-icon");
    if (icon)
      gsap.to(icon, { rotation: "0", opacity: 1, scale: 1.2, duration: 0.5 });
  }

  /* -------------------------------------------- */

  /**
   * Handle collapsing a section.
   * @param {HTMLElement} heading             The section heading.
   * @param {HTMLElement} content             The section content.
   * @param {object} [options]
   * @param {boolean} [options.animate=true]  Whether to animate the collapse effect.
   * @protected
   */
  _onCollapseSection(heading, content) {
    heading.parentElement.classList.add("collapsed");
    gsap.to(content, { height: 0, duration: 0.5, overflow: "hidden" });
    const icon = heading.querySelector(".accordion-icon");
    if (icon)
      gsap.to(icon, {
        rotation: "-=90",
        opacity: 0.5,
        scale: 1,
        duration: 0.5,
      });
  }

  /**
   * Restore the accordion state.
   * @protected
   */
  _restoreCollapsedState() {
    const entries = Array.from(this.#sections.entries());
    for (let i = 0; i < entries.length; i++) {
      const collapsed = this.#collapsed[i];
      const [heading, content] = entries[i];
      if (collapsed) this._onCollapseSection(heading, content);
      else this._onExpandSection(heading, content);
    }
  }

  /**
   * Save the accordion state.
   * @protected
   */
  _saveCollapsedState() {
    this.#collapsed = [];
    for (const heading of this.#sections.keys()) {
      this.#collapsed.push(
        heading.parentElement.classList.contains("collapsed"),
      );
    }
  }
}
