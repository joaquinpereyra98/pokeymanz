export default {
  input: "./pokeymanz.mjs",
  output: {
    file: "./public/pokeymanz.mjs",
    format: "esm",
  },
  external: ["/scripts/greensock/esm/all.js"],
};
