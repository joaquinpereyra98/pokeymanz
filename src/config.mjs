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
 *
 * @typedef {Object} DiceOption
 * @property {number} value - The numerical value of the die.
 * @property {string} label - The label representing the die (e.g., "d4").
 *
 *
 * @type {Object}
 * @property {PokemonType[]} pokemonTypesList - List of Pokémon types with their respective resistances, weaknesses, and icons.
 * @property {DiceOption[]} diceOptions - List of dice options available for use in the game.
 */
export const POKEYMANZ = {
  pokemonTypesList: [
    {
      id: "normal",
      resistances: ["ghost"],
      weaknesses: ["fighting"],
      color: "#9FA19F",
    },
    {
      id: "fire",
      resistances: ["fire", "grass", "ice", "bug", "steel", "fairy"],
      weaknesses: ["water", "rock", "ground"],
      color: "#E62829",
    },
    {
      id: "water",
      resistances: ["fire", "water", "ice", "steel"],
      weaknesses: ["electric", "grass"],
      color: "#2980EF",
    },
    {
      id: "grass",
      resistances: ["water", "electric", "grass", "ground"],
      weaknesses: ["fire", "ice", "poison", "flying", "bug"],
      color: "#3FA129",
    },
    {
      id: "flying",
      resistances: ["grass", "fighting", "bug"],
      weaknesses: ["electric", "ice", "rock"],
      color: "#81B9EF",
    },
    {
      id: "fighting",
      resistances: ["bug", "rock", "dark"],
      weaknesses: ["flying", "psychic", "fairy"],
      color: "#FF8000",
    },
    {
      id: "poison",
      resistances: ["grass", "fighting", "poison", "bug", "fairy"],
      weaknesses: ["ground", "psychic"],
      color: "#9141CB",
    },
    {
      id: "electric",
      resistances: ["electric", "flying", "steel"],
      weaknesses: ["ground"],
      color: "#FAC000",
    },
    {
      id: "ground",
      resistances: ["poison", "rock"],
      weaknesses: ["water", "grass", "ice"],
      color: "#915121",
    },
    {
      id: "rock",
      resistances: ["normal", "fire", "poison", "flying"],
      weaknesses: ["water", "grass", "fighting", "ground", "steel"],
      color: "#AFA981",
    },
    {
      id: "psychic",
      resistances: ["fighting", "psychic"],
      weaknesses: ["bug", "ghost", "dark"],
      color: "#EF4179",
    },
    {
      id: "ice",
      resistances: ["ice"],
      weaknesses: ["fire", "fighting", "rock", "steel"],
      color: "#3DCEF3",
    },
    {
      id: "bug",
      resistances: ["grass", "fighting", "ground"],
      weaknesses: ["fire", "flying", "rock"],
      color: "#91A119",
    },
    {
      id: "ghost",
      resistances: ["poison", "bug"],
      weaknesses: ["ghost", "dark"],
      color: "#704170",
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
      color: "#60A1B8",
    },
    {
      id: "dragon",
      resistances: ["fire", "water", "electric", "grass"],
      weaknesses: ["ice", "dragon", "fairy"],
      color: "#5060E1",
    },
    {
      id: "dark",
      resistances: ["ghost", "dark"],
      weaknesses: ["fighting", "bug", "fairy"],
      color: "#624D4E",
    },
    {
      id: "fairy",
      resistances: ["fighting", "bug", "dark"],
      weaknesses: ["poison", "steel"],
      color: "#EF70EF",
    },
  ].map((type) => ({
    ...type,
    name: `POKEYMANZ.Types.${type.id.capitalize()}`,
    img: `systems/pokeymanz/assets/icons/types/${type.id.capitalize()}_icon.png`,
  })),
  items: {
    feat: {
      img: "systems/pokeymanz/assets/icons/items/round-star.svg",
      icon: "fa-solid fa-star",
      types: {
        edge: {
          label: "POKEYMANZ.ItemTypes.Edge",
          subtypes: {
            battle: "POKEYMANZ.ItemSubtypes.Edge.Battle",
            social: "POKEYMANZ.ItemSubtypes.Edge.Social",
            utility: "POKEYMANZ.ItemSubtypes.Edge.Utility",
          },
        },
        hindrance: {
          label: "POKEYMANZ.ItemTypes.Hindrance",
          subtypes: {
            minor: "POKEYMANZ.ItemSubtypes.Hindrance.Minor",
            major: "POKEYMANZ.ItemSubtypes.Hindrance.Major",
          },
        },
      },
    },
  },
  diceOptions: [
    { value: 4, label: "d4" },
    { value: 6, label: "d6" },
    { value: 8, label: "d8" },
    { value: 10, label: "d10" },
    { value: 12, label: "d12" },
  ],
};
