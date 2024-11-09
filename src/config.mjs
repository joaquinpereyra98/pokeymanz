/**
 * A configuration object for the POKEYMANZ game module.
 *
 * @typedef {Object} PokemonType
 * @property {string} id - Unique identifier for the Pokémon type.
 * @property {string} name - Localized name key for the Pokémon type.
 * @property {string[]} resistances - List of type IDs that this type is resistant to.
 * @property {string[]} weaknesses - List of type IDs that this type is weak to.
 * @property {string} img - system/pokeymanz/assets/icon-type/The filename for the type's icon image.
 *
 * @typedef {Object} ItemCategory
 * @property {Object} edge - Object containing different types of edges.
 * @property {string} edge.battle - Localized name key for battle edges.
 * @property {string} edge.social - Localized name key for social edges.
 * @property {string} edge.utility - Localized name key for utility edges.
 * @property {Object} hindrance - Object containing different types of hindrances.
 * @property {string} hindrance.minor - Localized name key for minor hindrances.
 * @property {string} hindrance.major - Localized name key for major hindrances.
 *
 * @typedef {Object} ItemType
 * @property {string} edge - Localized name key for the edge item type.
 * @property {string} hindrance - Localized name key for the hindrance item type.
 *
 * @typedef {Object} DiceOption
 * @property {number} value - The numerical value of the die.
 * @property {string} label - The label representing the die (e.g., "d4").
 *
 * @type {Object}
 * @property {PokemonType[]} pokemonTypesList - List of Pokémon types with their respective resistances, weaknesses, and icons.
 * @property {ItemCategory} itemCategories - Object categorizing items into edges and hindrances with localized names.
 * @property {ItemType} itemTypes - Object containing localized name keys for item types.
 * @property {DiceOption[]} diceOptions - List of dice options available for use in the game.
 */
export const POKEYMANZ = {
  pokemonTypesList: [
    {
      id: "none",
      resistances: [],
      weaknesses: [],
    },
    {
      id: "normal",
      resistances: ["ghost"],
      weaknesses: ["fighting"],
    },
    {
      id: "fire",
      resistances: ["fire", "grass", "ice", "bug", "steel", "fairy"],
      weaknesses: ["water", "rock", "ground"],
    },
    {
      id: "water",
      resistances: ["fire", "water", "ice", "steel"],
      weaknesses: ["electric", "grass"],
    },
    {
      id: "grass",
      resistances: ["water", "electric", "grass", "ground"],
      weaknesses: ["fire", "ice", "poison", "flying", "bug"],
    },
    {
      id: "flying",
      resistances: ["grass", "fighting", "bug"],
      weaknesses: ["electric", "ice", "rock"],
    },
    {
      id: "fighting",
      resistances: ["bug", "rock", "dark"],
      weaknesses: ["flying", "psychic", "fairy"],
    },
    {
      id: "poison",
      resistances: ["grass", "fighting", "poison", "bug", "fairy"],
      weaknesses: ["ground", "psychic"],
    },
    {
      id: "electric",
      resistances: ["electric", "flying", "steel"],
      weaknesses: ["ground"],
    },
    {
      id: "ground",
      resistances: ["poison", "rock"],
      weaknesses: ["water", "grass", "ice"],
    },
    {
      id: "rock",
      resistances: ["normal", "fire", "poison", "flying"],
      weaknesses: ["water", "grass", "fighting", "ground", "steel"],
    },
    {
      id: "psychic",
      resistances: ["fighting", "psychic"],
      weaknesses: ["bug", "ghost", "dark"],
    },
    {
      id: "ice",
      resistances: ["ice"],
      weaknesses: ["fire", "fighting", "rock", "steel"],
    },
    {
      id: "bug",
      resistances: ["grass", "fighting", "ground"],
      weaknesses: ["fire", "flying", "rock"],
    },
    {
      id: "ghost",
      resistances: ["poison", "bug"],
      weaknesses: ["ghost", "dark"],
    },
    {
      id: "steel",
      resistances: [
        "normal",
        "grass",
        "ice",
        "flying",
        "psychic",
        "bug",
        "rock",
        "dragon",
        "steel",
        "fairy",
      ],
      weaknesses: ["fire", "fighting", "ground"],
    },
    {
      id: "dragon",
      resistances: ["fire", "water", "electric", "grass"],
      weaknesses: ["ice", "dragon", "fairy"],
    },
    {
      id: "dark",
      resistances: ["ghost", "dark"],
      weaknesses: ["fighting", "bug", "fairy"],
    },
    {
      id: "fairy",
      resistances: ["fighting", "bug", "dark"],
      weaknesses: ["poison", "steel"],
    },
  ].map((type) => ({
    ...type,
    name: `POKEYMANZ.Types.${type.id.capitalize()}`,
    img:
      type.id === "none"
        ? ""
        : `systems/pokeymanz/assets/icons/types/${type.id.capitalize()}_icon.png`,
  })),
  itemCategories: {
    edge: {
      battle: "POKEYMANZ.ItemCategories.Edge.Battle",
      social: "POKEYMANZ.ItemCategories.Edge.Social",
      utility: "POKEYMANZ.ItemCategories.Edge.Utility",
    },
    hindrance: {
      minor: "POKEYMANZ.ItemCategories.Hindrance.Minor",
      major: "POKEYMANZ.ItemCategories.Hindrance.Major",
    },
  },
  itemTypes: {
    edge: "POKEYMANZ.ItemTypes.Edge",
    hindrance: "POKEYMANZ.ItemTypes.Hindrance",
  },
  diceOptions: [
    { value: 4, label: "d4" },
    { value: 6, label: "d6" },
    { value: 8, label: "d8" },
    { value: 10, label: "d10" },
    { value: 12, label: "d12" },
  ],
};
