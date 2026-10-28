# Owner rulings

Decisions and canon additions from the owner. These are **authoritative** (tag `[OWNER]`) and override anything in our review (`design-impact.md`) that they contradict.
Recorded 2026-10-19 from the owner's answers to the four open decisions in the first design review.

## 1. Powers stay unexplained

Coherence, Lantern powers, Fenrir object pressure and the discontinuities are **never named or shown as powers** in Season 1. The world behaves strangely around Marcus; loud consequences are expressed as Pursuit ticks. This also keeps the original brief's "no psychics on screen".

## 2. Child-welfare treatment

Records, evidence and aftermath only. **No on-screen harm to children.** This sits inside the existing content line (mature themes without gore, teen and up, no sexual content).

## 3. Authorised `[GM-ONLY]` items for Season 1

These items may be used in player-visible text. Nothing else that is `[GM-ONLY]` is authorised, and `HELD` items stay unresolved.

- Ariadne tells Marcus things only if asked.
- Opening an authenticated channel for Ariadne tells the Section where she is (the Pursuit +2 rule).
- The Section as the pursuers, with the "custody as protection" argument.
- Ariadne holds a removal record of what Marcus asked to remove (the detail, not just the request).
- The Section holds an image of Ariadne "before Marcus".
- Merrow as the man in both doorways (the reveal, not just the initials).
- Coherence and Lantern powers appear only as unexplained strangeness (ruling 1).

Note: the owner approved the list as proposed ("that's fine"). If the intent was narrower or broader, correct this file; agents follow what is written here.

## 4. Cryogenics explains the ages `[OWNER]`

The owner's explanation of the apparent age inconsistencies: **cryogenics**. Tally was frozen and "lost" for much longer than the others. Marcus is the only one who has had minimal age loss.

Our reading, to be confirmed: Marcus lost the least time to cryogenics, so he has aged the most; the Lantern Six lost years frozen and are biologically younger than the calendar suggests, Tally most of all. That reconciles the planner's "Tally, eldest, anchor" (by birth order) with the crew list's "young pilot" (by apparent age).

Consequences:

- `src/data/crew.json` keeps short, spoiler-light roles, because the Sheet shows them to players. Tally stays "Young pilot". The cryogenics explanation is backstory to be shown as evidence, not stated in the Sheet.
- Still unknown: the roles and ages of **Wren** and **Lysa** (not in the planner's notes), and the exact ages of Cass and Miri.
- Use "they" for Tally (the notes use "their own custody"); do not guess pronouns for anyone else.

## 5. Unpaid upkeep has teeth `[OWNER]` (2026-10-21, issue #29)

Unpaid upkeep must (a) increase the difficulty of some rolls, (b) burn down resources such as Renown and similar, and (c) eventually produce a game fail state. See `../game-design.md` ("Unpaid upkeep: arrears and the fail state") for the design reading. Thresholds and numbers are placeholders.

## 6. Planner exports received (2026-10-21)

The planner's player-safe export is filed in `docs/canon/` (voices, locations, ships, glossary, factions, economy, scene seeds, documents, complications, tone). The GM-only export is filed in `docs/canon-gm/` as spoiler reference. **Filing is not authorisation:** the authorised list in section 3 is unchanged, and the planner's own rulings (PL1 to PL7, Lantern numbers, the craft strand) are campaign canon only.


## 7. Answers to the open design questions `[OWNER]` (2026-10-21)

- **Pursuit +2 applies only when a channel is opened.** Asking Ariadne a question does not tick Pursuit; opening an authenticated channel for her does (section 3).
- **Ariadne can be busy** for assignment, like any crew member.
- **The `[NEW]` Ariadne sample lines and the Season 4 "ladder" may be used.** Writers still follow `ariadne-voice.md` and keep the ladder as evidence, never as named powers.
- Two endings or three stances in M1: still open (M1 is the 20-minute vertical slice in `../ROADMAP.md`).

## 8. Stub content (2026-10-24) `[OWNER]`

For the M0 stub scenes (issue #10): stubs may carry small **placeholder effects** (`add` calls) so a run can be tuned; clean outcomes carry a visible gain; each stub uses a **different location** from `docs/canon/locations/`. The rules are in `../CONTENT_GENERATION.md`. Effects stay placeholders until the economy is reconciled (issue #35).

## 9. Slice decisions (2026-10-28) `[OWNER]`

- **Art direction:** hard-surface vector sci-fi (`../art/ART_PLAN.md`), not painterly raster.
- **Endings:** the M1 slice has **two endings**, each with **its own backdrop** (`end_open`, `end_closed`). Three stances are deferred to M2.
- **Playtest target:** a 20-minute run (`../SLICE.md`), with at least one ship-versus-ship action scene (K2's first beat).
- **The clock:** Option A. The finale is on a fixed schedule (K5 in cycle 4; K2 and K3 forced by cycle 3); a full clock hardens K5 and does not force it early.
- **Foreclosure:** the slice includes the foreclosure ending (Option 1), reusing `end_closed` with a tint.
- Still open: what "several hours" means as a structure.

