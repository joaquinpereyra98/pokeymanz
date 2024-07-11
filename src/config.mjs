export const POKEYMANZ = {
  attributes: {
    heart: {
      name: "POKEYMANZ.Attributes.Heart",
    },
    fitness: {
      name: "POKEYMANZ.Attributes.Fitness",
    },
    research: {
      name: "POKEYMANZ.Attributes.Research",
    },
    tatics: {
      name: "POKEYMANZ.Attributes.Tatics",
    },
  },
  pokemonTypesList: [
    {
      id: "none",
      name: "POKEYMANZ.Types.None",
      resistances: [],
      weaknesses: [],
      img: "Pokemon_Type_Icon_None.svg",
    },
    {
      id: "normal",
      name: "POKEYMANZ.Types.Normal",
      resistances: ["ghost"],
      weaknesses: ["fighting"],
      img: "Pokemon_Type_Icon_Normal.svg",
    },
    {
      id: "fire",
      name: "POKEYMANZ.Types.Fire",
      resistances: ["fire", "grass", "ice", "bug", "steel", "fairy"],
      weaknesses: ["water", "rock", "ground"],
      img: "Pokemon_Type_Icon_Fire.svg",
    },
    {
      id: "water",
      name: "POKEYMANZ.Types.Water",
      resistances: ["fire", "water", "ice", "steel"],
      weaknesses: ["electric", "grass"],
      img: "Pokemon_Type_Icon_Water.svg",
    },
    {
      id: "grass",
      name: "POKEYMANZ.Types.Grass",
      resistances: ["water", "electric", "grass", "ground"],
      weaknesses: ["fire", "ice", "poison", "flying", "bug"],
      img: "Pokemon_Type_Icon_Grass.svg",
    },
    {
      id: "flying",
      name: "POKEYMANZ.Types.Flying",
      resistances: ["grass", "fighting", "bug"],
      weaknesses: ["electric", "ice", "rock"],
      img: "Pokemon_Type_Icon_Flying.svg",
    },
    {
      id: "fighting",
      name: "POKEYMANZ.Types.Fighting",
      resistances: ["bug", "rock", "dark"],
      weaknesses: ["flying", "psychic", "fairy"],
      img: "Pokemon_Type_Icon_Fighting.svg",
    },
    {
      id: "poison",
      name: "POKEYMANZ.Types.Poison",
      resistances: ["grass", "fighting", "poison", "bug", "fairy"],
      weaknesses: ["ground", "psychic"],
      img: "Pokemon_Type_Icon_Poison.svg",
    },
    {
      id: "electric",
      name: "POKEYMANZ.Types.Electric",
      resistances: ["electric", "flying", "steel"],
      weaknesses: ["ground"],
      img: "Pokemon_Type_Icon_Electric.svg",
    },
    {
      id: "ground",
      name: "POKEYMANZ.Types.Ground",
      resistances: ["poison", "rock"],
      weaknesses: ["water", "grass", "ice"],
      img: "Pokemon_Type_Icon_Ground.svg",
    },
    {
      id: "rock",
      name: "POKEYMANZ.Types.Rock",
      resistances: ["normal", "fire", "poison", "flying"],
      weaknesses: ["water", "grass", "fighting", "ground", "steel"],
      img: "Pokemon_Type_Icon_Rock.svg",
    },
    {
      id: "psychic",
      name: "POKEYMANZ.Types.Psychic",
      resistances: ["fighting", "psychic"],
      weaknesses: ["bug", "ghost", "dark"],
      img: "Pokemon_Type_Icon_Psychic.svg",
    },
    {
      id: "ice",
      name: "POKEYMANZ.Types.Ice",
      resistances: ["ice"],
      weaknesses: ["fire", "fighting", "rock", "steel"],
      img: "Pokemon_Type_Icon_Ice.svg",
    },
    {
      id: "bug",
      name: "POKEYMANZ.Types.Bug",
      resistances: ["grass", "fighting", "ground"],
      weaknesses: ["fire", "flying", "rock"],
      img: "Pokemon_Type_Icon_Bug.svg",
    },
    {
      id: "ghost",
      name: "POKEYMANZ.Types.Ghost",
      resistances: ["poison", "bug"],
      weaknesses: ["ghost", "dark"],
      img: "Pokemon_Type_Icon_Ghost.svg",
    },
    {
      id: "steel",
      name: "POKEYMANZ.Types.Steel",
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
      img: "Pokemon_Type_Icon_Steel.svg",
    },
    {
      id: "dragon",
      name: "POKEYMANZ.Types.Dragon",
      resistances: ["fire", "water", "electric", "grass"],
      weaknesses: ["ice", "dragon", "fairy"],
      img: "Pokemon_Type_Icon_Dragon.svg",
    },
    {
      id: "dark",
      name: "POKEYMANZ.Types.Dark",
      resistances: ["ghost", "dark"],
      weaknesses: ["fighting", "bug", "fairy"],
      img: "Pokemon_Type_Icon_Dark.svg",
    },
    {
      id: "fairy",
      name: "POKEYMANZ.Types.Fairy",
      resistances: ["fighting", "bug", "dark"],
      weaknesses: ["poison", "steel"],
      img: "Pokemon_Type_Icon_Fairy.svg",
    },
  ],
  itemCategories: {
    edge: {
      battle: "POKEYMANZ.ItemCategories.Edge.Battle",
      social: "POKEYMANZ.ItemCategories.Edge.Social",
      utility: "POKEYMANZ.ItemCategories.Edge.Utility",
    },
    hindrance: {
      minor: "POKEYMANZ.ItemCategories.Hindrance.Minor",
      major: "POKEYMANZ.ItemCategories.Hindrance.Major"
    }
  },
  itemTypes: {
    edge: "POKEYMANZ.ItemTypes.Edge",
    hindrance: "POKEYMANZ.ItemTypes.Hindrance"
  },
  diceOptions: {
    4: "d4",
    6: "d6",
    8: "d8",
    10: "d10",
    12: "d12",
  }
};
