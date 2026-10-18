// Functions the game engine provides to the story. See docs/WRITING.md.
//   res("Credits")              current value of a resource
//   add("Strain", 1)            change a resource (clamped to its limits; unknown names are an error)
//   note("cost", "text")        add a consequence line: kinds are gain, cost, watch
EXTERNAL res(name)
EXTERNAL add(name, n)
EXTERNAL note(kind, text)
