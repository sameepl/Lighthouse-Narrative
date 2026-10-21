# Request: mining the campaign for a narrative game

You can read this file on its own; no other context is needed.

## What we are building

A mobile narrative game, about 20 to 30 minutes per playthrough, built from the owner's campaign as **source material and a theme guide**, not as a literal adaptation. The player is Marcus Torin. **The game never writes Marcus's speech, thoughts or actions.** His past appears only as evidence the world shows (a recording, a manifest, a stranger who knows his face).

The game is public on the web, so anything we write into player-visible text is public. That is why we ask you to tag every fact and to hold back spoilers by default.

You have already answered our first two rounds (Ariadne, backstory, voice, crew roles). This round asks for **writing and balancing data** to mine from the campaign files.

## Rules for every answer

1. **Tag every fact:** `[PLAYED]` (already on screen), `[GM-ONLY]` (private canon), `HELD` (a file says do not decide), `(TBD)` (unknown). Never guess. If a file or fact does not exist, say so.
2. **Default to `[PLAYED]` and player-safe material.** For valuable `[GM-ONLY]` material, do **not** send the content: list the file name and one line saying what it is. We will tell you whether we are authorised to use it.
3. **No card for Marcus.** Evidence only.
4. **Keep to the size limits.** Short, usable cards beat long summaries.
5. **Quote verbatim** where we ask for lines, and name the file or session each quote came from.
6. **No reproduced tabletop rulebook text or trademarked setting terms.**
7. Teen and up; mature themes without gore; no sexual content; no on-screen harm to children (records, evidence and aftermath only).

## How to return your answers

Send each item as its **own markdown code block**, and start each block with a line saying where we will file it, exactly like this:

```
FILE: docs/canon/voices/renata.md
STATUS: [PLAYED] unless a line says otherwise
SOURCE: <the campaign files or sessions you drew from>

<the card>
```

You may send items in any order and over several replies. Tier 1 first.

## Where the information is stored (for the owner)

The files live in the repo under `docs/canon/`. Agents read only the files a task names, so one file per person, place or ship keeps their context small.

| Item | Stored as | Later becomes |
|---|---|---|
| 1. Voice cards | `docs/canon/voices/<name>.md` (one per person) | Writing rules for scenes; dialogue checks |
| 2. Locations | `docs/canon/locations/<name>.md` (one per place) | Scene settings and backgrounds |
| 3. Ships | `docs/canon/ships/<name>.md` (one per ship) | `src/data/ships.json` (tags, upkeep) |
| 4. Economy and numbers | `docs/canon/economy.md` | `src/data/rules.json`, encounter `cost` values |
| 5. Scene seeds | `docs/canon/scene-seeds.md` | The six archetype encounters (M1) |
| 6. Documents and evidence | `docs/canon/documents.md` | Templates for evidence scenes |
| 7. Complication tables | `docs/canon/complications.md` | Swap-in variants for repeatable encounters |
| 8. Glossary and naming | `docs/canon/glossary.md` | Writing rules; consistent vocabulary |
| 9. Factions | `docs/canon/factions.md` | NPC motives; pursuit flavour |
| 10 to 13. Tone, motifs, pacing, "remembers" | `docs/canon/tone.md` | Voice calibration |

## Tier 1: needed to write the first playable slice

### 1. Voice cards, one per person

People: **Renata, Priya, Halvorsen, Cass, Tally, Merrow, Wren, Lysa, Eli, Miri, Ilse Vantor.** (Ariadne is done; add only how _other_ people speak about her, in a short `docs/canon/voices/about-ariadne.md`.)

Template, **at most 150 words each**:

```
Name:
Role:
Wants (stated or evidenced):
Fears:
Speech patterns (sentence length, vocabulary, tics, what they never say):
How they address Marcus:
How they address others:
Three verbatim [PLAYED] lines (with source):
One line they would never say:
Relationship to Marcus (as evidenced):
```

### 2. Locations

Places: **Hearthline** (the hall, the berths, the market as separate short entries), **the Shoal**, **Faraday Basin**, **Far Horizon**, **Halworth Deep Relay** (evidence only; nothing on screen), plus 2 to 3 dark or unknown lanes or stations used in play.

Template, **at most 150 words each**:

```
Name:
What it is:
Tone:
Five sensory details (sound, smell, light, temperature, texture):
Who is usually there:
The paperwork or rules that govern it:
One memorable image:
Typical problems there:
```

### 3. Ships

Ships: **_Errant Pawn_, _Ardent Venture_**, and the other two hulls.

Template:

```
Name (italicised):
Class and size:
Role:
Quirks:
What upkeep and fuel feel like:
Who flies her:
What is in the sickbay, workshop and launch bay (if any):
Three details only someone who has flown her would know:
```

### 4. Economy and numbers (data, not prose)

Give plain numbers with ranges, tagged:

- Typical Credits for: a trade run, an escort job, a salvage claim, a courier job, a scouting contract.
- A berth fee; repairs by severity (minor, serious, major); fuel; crew pay; fines; bribes.
- Where the Cr40,000 reserve came from and what it must cover.
- The target numbers the GM used for easy, average, hard and very hard (is 8+ the average?).
- Typical skill levels for a competent NPC and for an expert.
- What "doing right costs" looked like in play: the consequences actually used for a success with a cost and for a failure.

### 5. Scene seeds

For each archetype, give **2 to 3 `[PLAYED]` examples, at most 100 words each**:

- trade run that gets interrupted
- courier of a person or cargo
- salvage that finds something strange
- scouting a lane that has gone dark
- a mysterious distress call
- a standoff or dispute (social, tactical or mercantile)

Template: `Situation | the approaches the players took | what each cost or paid | what it set up`.

## Tier 2: improves quality

### 6. Documents and evidence

The house format of in-world documents: charter page, berth record, manifest, service record entry, registry line, log fragment, message, receipt, arms register entry. One real or typical sample each, **at most 80 words**, with headers, codes and tone. These become the way the game shows Marcus's past.

### 7. Complication tables

For each of the six archetypes, **6 to 8 complications** that were used or are typical (for example shakedown, customs hold, buyer defaults, claim jumpers, dead beacon, ghost signal). One line each.

### 8. Glossary and naming

Jargon and terms of art, forms of address (Captain; "Lantern" as a title), naming patterns for ships, stations and people, units (Cr, cycles, days), and how time is written. **At most 40 terms.**

### 9. Factions (player-safe only)

Compact, Faraday Basin, hijack crews, Hesperis, Serein, Tessary, Admiralty Audit. Template, **at most 80 words each**: `Want | method | public face | how they treat Marcus's people`.

## Tier 3: if easy

10. **15 short `[PLAYED]` exchanges**, at most 40 words each, that capture the campaign's tone at its best (barks, dry humour, moral-cost moments).
11. **Recurring motifs:** objects, phrases, sounds and images that make the campaign feel like itself.
12. **Pacing:** how long a typical played scene ran, and the usual beat structure (setup, complication, choice, cost).
13. **"X remembers" moments:** places where an NPC referred back to a player choice.

Items 10 to 13 go together in `docs/canon/tone.md`.

## Thank you

If a whole category does not exist in the files, say so in one line and move on. A short, honest answer is more useful than a long invented one.
