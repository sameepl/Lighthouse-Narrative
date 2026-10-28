# Pilot 1 writer prompt

Give a writer model exactly the text below the line and nothing else (no repository access, no other candidates, no targets). Collect the JSON it returns.

---

You are a writer model in a blind quality comparison. Write placeholder game text for ONE scene from the brief below.

Rules for you:
- Use only this message. Do not read any files, search the web, or use any tool. Do not read anything under docs/canon-gm.
- Return ONLY a single JSON object and nothing else: no prose before or after, no code fences.
- Do not mention which model you are.

JSON shape:
{"open": "...", "outcomes": {"<label exactly as in the brief>": {"clean": {"text": "...", "note": "..."}, "cost": {...}, "fail": {...}}, ... one entry per label}, "ending": "..."}
Every `open`, outcome `text` and `ending` begins with "[STUB] ". Notes do not begin with "[STUB]"; each note states its effect with the signed number exactly as in the brief (for example "Credits +1,500"). Never write ink syntax, `add()` calls or knot names. Never write the player character's words, thoughts or actions.

=== BRIEF ===
{
  "id": "stub_pilot_market",
  "title": "The Double Order",
  "archetype": "standoff",
  "layer": "crisis",
  "location": "docs/canon/locations/hearthline-market.md",
  "who": "stallholder at the Ring Two food stalls",
  "want": "Rule on a dispute before the market bell: the stallholder says a crew never collected a paid order of forty bowls, and the crew says it was collected and paid for twice.",
  "at_stake": "If the dispute is not settled before the bell, the crew boycotts the stall and the Exchange clerk logs a complaint against whoever let it stand.",
  "complication": "Paper against paper: both sides hold a receipt for the same order. (complications.md, standoff 6)",
  "state_nouns": [
    "order",
    "receipt",
    "bowls",
    "bell"
  ],
  "approaches": [
    {
      "label": "Offer to split the cost",
      "skills": [
        "Diplomat",
        "Persuade"
      ],
      "npc_reaction": "counts what she stands to lose",
      "effects": {
        "clean": [
          [
            "Renown",
            1
          ]
        ],
        "cost": [
          [
            "Credits",
            -1000
          ]
        ],
        "fail": [
          [
            "Strain",
            1
          ]
        ]
      }
    },
    {
      "label": "Check the stall’s scale and receipts",
      "skills": [
        "Electronics",
        "Mechanic"
      ],
      "npc_reaction": "hovers over her own books",
      "effects": {
        "clean": [
          [
            "Strain",
            -1
          ]
        ],
        "cost": [
          [
            "Credits",
            500
          ],
          [
            "Strain",
            1
          ]
        ],
        "fail": [
          [
            "Credits",
            -500
          ]
        ]
      }
    },
    {
      "label": "Call the Exchange clerk to rule",
      "skills": [
        "Leadership",
        "Tactics"
      ],
      "npc_reaction": "does not want the clerk involved",
      "effects": {
        "clean": [
          [
            "Credits",
            1000
          ]
        ],
        "cost": [
          [
            "Credits",
            -500
          ]
        ],
        "fail": [
          [
            "Strain",
            1
          ]
        ]
      }
    }
  ],
  "sensory_details_used": {
    "sound": "",
    "smell": "",
    "temperature": "",
    "texture": ""
  }
}

=== LOCATION FILE ===
STATUS: [PLAYED] unless a line says otherwise
SOURCE: S4E0 transcript (Ring Two stall, ring noise); S3E12 transcript (market lines); S4E1 transcript (Rinn on ring prices); Terms_Glossary_Player_Safe.md (Exchange overhead, registry notice)

Name: Hearthline, the market
What it is: The Hearthline Exchange, plus Ring Two's food stalls and chandlers.
Tone: Noisy, practical, priced for residents.
Five sensory details:
- Sound: market lines "noisy again"; a loader arguing with a scanner.
- Smell: onions frying somewhere above.
- Light: (TBD)
- Temperature: bowls still warm.
- Texture: bowls once ladled now come with a lid.
Who is usually there: stallholders, brokers (Perrin), off-shift crews.
Paperwork or rules: the Exchange takes 10% overhead on prize sales; the registry wants 14 days' notice.
One memorable image: covered bowls of beans from the stall by the water reclaimer.
Typical problems: ring prices suit residents, not transients; prize sales wait on notice.


=== CONTRACT (sections 3, 4, 5 and 7 of the content guide, as clarified 2026-10-26) ===
## 3. The outcome contract

Every roll has three outcomes. Each outcome must change **something the player can point to**.

| Grade | Must do |
|---|---|
| **Clean** | The player gets what they wanted **and** one visible gain (an effect in section 4). |
| **Cost** | The player gets what they wanted, but pays a **named price**: a resource, a lasting fact, or a person's attitude. |
| **Fail** | The player does **not** get it, a **specific alternative route** is shown (a named desk, a day, a person), and there is a cost that stays inside the fail band in section 4. Failure moves the story on. |

Rules that apply to all nine outcomes in a scene:

1. **Distinct.** No two outcomes may share the same key noun for their result. If "the fee" is what changed in one, a different object changes in the others. The test: can a reader tell from the outcome alone which approach and which grade it was?
2. **Concrete.** Name a person, an object or a number from the brief. "Staff" and "personnel" are not people.
3. **State changes are shown, not announced.** Write "the tug swings in", not "the process concludes". Never name the menu or the roll ("the parley succeeds").
4. **Notes mirror effects exactly.** If an outcome calls `add("Credits", 1500)` the note says "Credits +1,500". A note that promises something with no effect is a bug (for example "priority berth slot" with no slot in the prose or effects).
5. **No hedging.** Do not write that nothing is decided, that nothing is implied, or that a thing "remains open" unless the brief says it does. A scene that ends with nothing changed fails the contract.
6. Marcus is never written for. Narrate the world. "You" is allowed only for what the player's ship or crew can plainly see or are handed.

## 4. Effects in stubs (owner ruling, 2026-10-24)

Stubs carry **placeholder effects** so a run can be tuned. The owner decided: clean outcomes carry a visible gain, and stubs may use small effects.

Effects are written by the coordinator in the brief and rendered by the scaffold or a person. The writer model never types `add(...)`. Each effect line is `[STUB]`-marked in the brief and kept in one table so the owner tunes them in one place.

Placeholder bands (not canon; replace when the economy is reconciled, issue #35):

| Grade | Allowed effects, at most two per outcome |
|---|---|
| Clean | Credits +1,000 to +3,000, or Renown +1, or Strain -1 |
| Cost | Credits +0 to +1,000 with Strain +1, or Credits -500 to -1,500 with something gained |
| Fail | Credits -500 to -1,500, or Strain +1 |

- Use `Pursuit` only for an explicitly loud (+1) or quiet (-1) choice, per `WRITING.md`.
- Use `Renown` rarely: it is both reward and risk (`game-design.md`).
- Never invent a new resource, flag or meter. Never use `trust` in stubs.

## 5. Prose rules

**Shape.** Each passage is 40 to 80 words and 3 to 6 sentences, with at least one sentence over 12 words and one under 9. Start every passage with `[STUB]`. The opening passage sets: where, who, what is wanted, what is at stake, and ends on pressure.

**Place.** The opening and at least four outcomes each use one sensory detail from the location file (sound, smell, light, temperature or texture). A category is not a detail: amber beacons and distant hab work lights are two different light details. Do not reuse a detail within a scene. Two scenes may not share a location.

**Show consequences through objects and people.** Good: "The chief draws a line through the fee and initials it." Bad: "The clerk grants a priority berth slot."

**Banned phrases** (fail the lint): the situation, the process, the interaction, next steps, the next decision, stable, smoothly, efficiently, precision, in unison, eyes narrowing, remains open, left open, without implying, nothing is decided, no decision, accepts the parley, approach, coordination succeeds, staff members, personnel, "her hands resting", "unyielding".

**Repetition limits.** No sentence opener repeated more than twice in a scene. No noun phrase of three or more words repeated more than twice across the nine outcomes. No outcome may open with the same four words as another.

**Shared ending.** The ending passage runs after all nine outcomes, so it must be true after every one. Rules: at most 40 words; no seals, fees, slots, windows, cargo state or anything an outcome can change; it says only where the player is and that the ledger card follows. If an outcome needs a closing line, put it in that outcome.

**Canon.** Use only the brief and the named location file. Never read `docs/canon-gm/`. Do not mention Ariadne, the pursuers, Marcus's past, powers, or children. A named canon person only if the brief names them, and then follow their voice card.

## 7. Prompt for the writer model

Give the model the brief, sections 3 to 5 of this file, the location file, and ask for JSON only. The assembler or a person turns the JSON into ink. The model must never write ink syntax.

```
You write placeholder game text. Follow the brief exactly. Return only JSON:
{
  "open": "...",
  "outcomes": {
    "<approach_1>": { "clean": {"text": "...", "note": "..."}, "cost": {...}, "fail": {...} },
    "<approach_2>": { ... },
    "<approach_3>": { ... }
  },
  "ending": "..."
}
Every text starts with "[STUB] ". 40 to 80 words (ending at most 40). Follow the outcome contract:
clean = gain, cost = price paid, fail = a named alternative route plus a cost inside the fail band.
Each note repeats its effect exactly. Never write the player character's words, thoughts or actions.
Use no banned phrase. Use one sensory detail from the location per passage at most.
```

