# Design impact of the planner's notes

Review of [`ariadne-and-backstory.md`](ariadne-and-backstory.md). Read [`README.md`](README.md) first for the status tags and the spoiler rules.
Everything here is a **proposal**, except where the owner has ruled: see [`owner-decisions.md`](owner-decisions.md), which is authoritative and resolves the decisions in section 3 and the checklist in section 5. Keystone titles, the pieces and K5's stances remain proposals until the design PR is merged.

## 1. The correction that matters most

Our earlier design (and the prompt we sent) assumed Marcus would eventually **reach** Ariadne, as a person to find. The notes correct that:
she has been **aboard the _Errant Pawn_ since Session 0**: EID-0, the first and root Eidolon, recovered as an isolated core from Far Horizon `[PLAYED]`. There is no reunion on file.

So Ariadne is not a destination. She is **a companion with a past that other people want**. That changes the finale from "find her" to "decide what to ask her, and what asking costs".

## 2. What the notes settle

| Question | Answer from the notes | Status |
|---|---|---|
| Who is Ariadne? | EID-0, built for Lantern One (Marcus); he named her as a child; Miri calls her "Ari" | `[PLAYED]` |
| Where is she? | Aboard the Pawn, protected and compartmentalised, in the open alliance | `[PLAYED]` |
| Is she hunted? | Yes: the Section wants her for root authority; authenticating on an open channel reveals her location | `[GM-ONLY]` |
| What does she want? | Not stated in any file | `(TBD)` |
| Why did Marcus lose his memories? | Childhood: he asked EID-0 to erase him, to be useless as a locator for the others. Adulthood: the Section removed it again without consent | request `[PLAYED]`, detail `[GM-ONLY]` |
| The three hooks in our brief | Sealed folder = the debrief of the second removal. Cut continuity mast = cut from the Section's tender. The number = a Quiet Registry segment designation where he drifted (which one is TBD) | folder, mast `[PLAYED]`; number meaning `(TBD)` |
| Who pursues him? | The Section (a surviving cell; acting head; Merrow exposed). Its case is "custody as protection", argued sincerely | `[GM-ONLY]` |
| Theme | Custody against consent, and "doing right costs" | `[GM-ONLY]` plan |
| Tone at the end | Relief mixed with guilt | planner's read |

## 3. Conflicts and things to decide

1. **"No psychics on screen" (brief) versus the notes.** The notes mention coherence use, Lantern powers, Fenrir object pressure, and discontinuities. Proposal: in Season 1 these are never named or shown as powers; the world just behaves strangely around Marcus and the "loud" consequences are expressed as Pursuit ticks. **Ruled: approved** (`owner-decisions.md` 1).
2. **Child-welfare content.** The backstory involves children in a program, an erased past, and a procedure "scheduled for Six". Proposal: records, evidence and aftermath only; no on-screen harm to children; keep within the "mature themes without gore, teen and up" line. **Ruled: approved** (`owner-decisions.md` 2).
3. **Crew data may be stale.** `crew.json` says Tally is a "young pilot"; the notes call Tally "eldest, anchor" and a Lantern Six ally (with Cass, Eli, Jonah, Miri). Cass and Miri are in both. **Ruled:** cryogenics explains it; Tally was frozen much longer, and Marcus lost the least time (`owner-decisions.md` 4). Wren and Lysa are still not mentioned in the notes, so their roles are unconfirmed.
4. **Start point for new players.** Fixed points run through S4E0 and beyond (the Tally revival, S3E13, Merrow's admission). A new player has seen none of it. Proposal: those events are **backstory shown as evidence**, and the 30-minute game starts at a quiet moment (as the brief says) with the past surfacing. Which fixed points are backstory, and which are on screen, needs the owner's call.
5. **Spoilers are the best material.** Most of the strongest twists are `[GM-ONLY]`. We should authorise the specific items Season 1 may use (section 5), and keep everything else out of text.
6. **Ariadne needs a voice and wants.** Without them she is a plot device, not a companion. We need a few sample lines and what she wants now.
7. **HELD items stay unresolved.** Contact 1, Tally's name and number, Helena's and Adrian's whereabouts. Season 1 may point at the gaps but never fill them.

## 4. What I want to change in the design

1. **Ariadne is a companion asset, always aboard.** She works like a crew member (assist, trait) but is never "busy"; her sheet is INT 14, EDU 13 (a +2 modifier each) `[Ariadne_Season4_Player_Safe_DRAFT.md]`. Suggested assist: Electronics, Astrogation or Recon, +1 (placeholder).
2. **The price of knowing.** She tells Marcus things only if asked `[GM-ONLY]`, and authenticating her on an open channel tells the Section where she is `[GM-ONLY]`. So: **asking Ariadne for a truth is a choice with a cost: a Pursuit tick (+2)**. This is the game's "doing right costs" in one move. The two canon facts it rests on are **authorised** (`owner-decisions.md` 3); the mechanic itself is part of the design PR.
3. **Pursuit has story-driven ticks**, not only the per-cycle tick: authenticating Ariadne on an open channel (+2), and other loud events the story names. M0-01 adds a way for ink to advance the clock.
4. **Replace the three "pieces"** (Where, Who, Why) with canon-shaped ones:

   | Piece | Meaning | Evidence the world shows |
   |---|---|---|
   | **Removed** | What Marcus took out, and who took it out later | the sealed folder, Merrow's initials, the number, Jonah's report |
   | **The Six** | Who they were: the six children | the six-place table drawn three times; the manifest with six identifiers, one matching no one |
   | **The Claim** | Who is pursuing, and what they want | the cut mast and the old continuity signal; the Section's argument for custody |

5. **Keystones, re-mapped to canon** (still proposals; K1 to K4 keep their archetypes):

   | # | Keystone | Archetype | Canon thread it can draw on | Piece |
   |---|---|---|---|---|
   | K1 | The Passenger | Courier | A hunted passenger who recognises Marcus: a Palisade or Registry connection (Ilse Vantor is a played ally whose report was buried; whether it is her or someone new is TBD). **Not** Contact 1: that identity is HELD | opens the pursuit |
   | K2 | The Silent Hab | Distress call | A failing hab; records include the six-place manifest | The Six |
   | K3 | The Dark Lane | Scout | A lane with no chart: the Quiet Registry segment from the folder's number (which segment is TBD) | Removed |
   | K4 | The Cargo They Want | Trade run | A sealed case wanted by a Section-linked buyer; the Section's offer of "continuity care" | The Claim |
   | K5 | **The Asking** (replaces "Ariadne") | finale | Ariadne holds the removal record and a partition; Cass holds the sealed 41-hour core (still shut `[PLAYED]`) | resolves the pieces |

6. **K5, The Asking.** Not a reunion: a decision about **whether to ask**, with the Pursuit clock and the Section closing in. Proposed stances (the player picks one): **Open it** (ask Ariadne for the record and open the partition; learn everything, pay the Pursuit cost), **Leave it closed** (honour what a younger Marcus chose; protect Ariadne and the fleet; stay in the dark), or **Share it** (take the decision to Cass and the others; slower and costlier, but not Marcus's alone). Each maps to the theme of custody against consent. A proposal until the design PR is merged.
7. **Season question:** _Who gets to decide what a person keeps, and what will you pay to protect that right?_
8. **Tone for K5:** relief mixed with guilt, per the planner. Ariadne's unprompted thank-you was a played beat `[PLAYED]`; a version of it can close the game.

## 5. Authorisation list (approved by the owner)

Approved as proposed, 2026-10-19 (`owner-decisions.md` 3). Items marked `[PLAYED]` need no approval. Any other `[GM-ONLY]` item is **not usable in text**.

- [x] Ariadne tells Marcus things only if asked.
- [x] Opening an authenticated channel for Ariadne tells the Section where she is (the Pursuit +2 rule).
- [x] The Section as the pursuers, with the "custody as protection" argument.
- [x] Ariadne holds a removal record of what Marcus asked to remove (the detail, not just the request).
- [x] The Section holds an image of Ariadne "before Marcus".
- [x] Merrow as the man in both doorways (the reveal, not just the initials).
- [x] Coherence and Lantern powers appear only as unexplained strangeness (section 3.1).

## 6. Questions for the planner (still open)

Also in [`../planner-prompts.md`](../planner-prompts.md) as prompt 3. Answered by the owner already: powers visibility, the authorisation list, child-welfare treatment, and why the ages differ (cryogenics).

1. What does Ariadne want now? Give 5 to 8 sample lines in her voice (short, no spoilers needed), and how she speaks to Marcus versus to Miri.
2. Roles of **Wren** and **Lysa** (not in the notes), and the apparent ages of Cass and Miri. Tally is settled by the cryogenics ruling.
3. Which fixed points are backstory only, and which should be seen on screen in Season 1?
4. Anything to add to the authorised list (section 5)?
5. Which segment or ship does the number refer to (TBD in the notes)? A placeholder is fine for now.
6. Is "relief mixed with guilt" the intended ending tone, and is the custody-against-consent season question right?

## 7. What changed in the repo because of this (including the owner rulings)

- New: `docs/canon/` (this folder), including `owner-decisions.md`.
- `docs/game-design.md` section 6 and the open questions are updated (Ariadne aboard; pieces; K5).
- `docs/decisions/0006-ariadne-aboard-and-canon-status.md` records the decision.
- `AGENTS.md` and the PR template now say: no `[GM-ONLY]` or HELD material in player-visible text without authorisation.
- Task cards M0-01 (story-driven Pursuit ticks) and M0-10 (K5 title, canon rule) are updated, along with issues #1 and #10.
