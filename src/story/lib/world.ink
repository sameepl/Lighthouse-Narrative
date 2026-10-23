// Functions the game engine provides to the story. See docs/WRITING.md.
//   res("Pursuit")             clock value; add("Pursuit", n) clamps the single engine clock
//   res("Credits")              current value of a resource
//   add("Strain", 1)            change a resource (clamped to its limits; unknown names are an error)
//   note("cost", "text")        add a consequence line: kinds are gain, cost, watch
EXTERNAL res(name)
EXTERNAL add(name, n)
EXTERNAL note(kind, text)
// Change current crew trust by an integer delta, clamped to 0..3; returns the new value.
EXTERNAL trust(id, delta)

// Bridge consumes this sentinel; it never appears as a player choice.
=== scene_end ===
+ [__scene_end__]
    -> END
