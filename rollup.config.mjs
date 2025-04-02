export default {
  input: "./pokeymanz.mjs",
  output: {
    file: "./dist/pokeymanz.mjs",
    format: "esm",
  },
  external: ["/scripts/greensock/esm/all.js"],
};
