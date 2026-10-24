// [STUB] Placeholder recovery scene for comparison; replace before canon.
// Never write Marcus's speech, thoughts or actions. All local knots use the scene ID prefix.
=== stub_salvage_scene ===
[STUB] At an unnamed station, the recovery desk has set an inert cargo frame apart from routine freight, with its inventory entry still disputed. A clerk can explain provisional handling terms, compare clearance windows, or let an attendant examine the outer seals and matching records. The frame remains unidentified, and no one claims it or accepts responsibility for it. The desk keeps later recovery access open while the paperwork is reviewed. # bg:hall
-> stub_salvage__menu

=== stub_salvage__menu ===
+ [\[STUB\] Ask about provisional handling terms #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_salvage__parley_clean, -> stub_salvage__parley_cost, -> stub_salvage__parley_fail)
+ [\[STUB\] Coordinate an available clearance window #hint:\[STUB\] Leadership / Tactics]
    -> roll("Leadership,Tactics", 8, "", -> stub_salvage__coordinate_clean, -> stub_salvage__coordinate_cost, -> stub_salvage__coordinate_fail)
+ [\[STUB\] Inspect external seals and inventory records #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> stub_salvage__inspect_clean, -> stub_salvage__inspect_cost, -> stub_salvage__inspect_fail)

=== stub_salvage__parley_clean ===
[STUB] The clerk lays out a provisional handling sheet with separate lines for custody, inspection, and later recovery, making each boundary legible without marking any line accepted. The inert frame stays in its assigned holding space while the desk records which terms remain open. Staff can provide the same draft at a later appointment. This exchange clarifies what a future decision would cover, while the inventory dispute itself remains unresolved.
~ note("gain", "[STUB] Provisional terms are itemized; no custody line is accepted.")
-> stub_salvage__after

=== stub_salvage__parley_cost ===
[STUB] The clerk can discuss provisional handling, but two copies of the draft use different descriptions for the same inventory line. Staff mark the mismatch for review and leave the handling fields blank, so neither copy governs the inert frame. A supervisor's desk can compare the versions during a later window. The conversation identifies the paperwork needed next, though it does not settle who may handle the cargo.
~ note("cost", "[STUB] Conflicting inventory descriptions require a supervisor review.")
-> stub_salvage__after

=== stub_salvage__parley_fail ===
[STUB] The desk cannot match the proposed provisional terms to its current inventory record, and the clerk declines to treat either version as authoritative. The frame remains inert in the station holding area, with its status left open rather than assigned to anyone. A review desk is available to compare the record copies during a later recovery window. That route keeps the question active, but the handling discussion yields no agreement today.
~ note("cost", "[STUB] Terms remain unverified; the review desk can compare copies later.")
-> stub_salvage__after

=== stub_salvage__coordinate_clean ===
[STUB] The station schedule shows two clearance windows that could accommodate a later look at the frame, subject to the inventory review. Staff pencil both options beside the open entry but reserve neither, preserving flexibility for the next decision. The handling bay's normal traffic remains uninterrupted, and the cargo stays where it was logged. The desk can reproduce the window list later, without implying any booking, access grant, or departure.
~ note("gain", "[STUB] Two possible clearance windows are recorded without reservation.")
-> stub_salvage__after

=== stub_salvage__coordinate_cost ===
[STUB] A shift change overlaps the first available clearance period, while the second depends on the disputed inventory entry being checked. The scheduler records both constraints and suggests bringing the record copies to a later review window. No slot is held, and the inert frame remains under its existing station log. The timing issue is now visible in the file, though access and any future appointment remain undecided.
~ note("cost", "[STUB] Shift overlap and record review narrow the available timing.")
-> stub_salvage__after

=== stub_salvage__coordinate_fail ===
[STUB] The scheduling desk cannot align the current clearance list with the open inventory entry, so it leaves the calendar unmarked. A later recovery window remains available after staff reconcile the relevant records, and a clerk can explain how to request that review. Nothing changes about the frame's inert status or its station location. The route forward is clear, but no access time or handling arrangement has been secured.
~ note("cost", "[STUB] No window is aligned; request review at a later recovery desk.")
-> stub_salvage__after

=== stub_salvage__inspect_clean ===
[STUB] An attendant compares the visible outer seal numbers with the inventory copies and finds that the copies can be sorted into a readable sequence. The inspection remains external, leaving the frame closed and its contents unidentified. Staff add a cross-reference note so a later reviewer can see which entries were compared. The record is easier to follow now, while custody, handling permission, and recovery timing remain separate open questions.
~ note("gain", "[STUB] External seal references are cross-indexed; the frame stays closed.")
-> stub_salvage__after

=== stub_salvage__inspect_cost ===
[STUB] One external seal number is partly obscured by a routine handling label, making the comparison slower without suggesting damage or hidden contents. The attendant logs the readable portion and requests a clearer inventory copy before marking the check complete. The frame stays inert and closed in the station's holding area. The partial record gives the review desk a specific follow-up, though access terms and the recovery window remain unsettled.
~ note("cost", "[STUB] A partly obscured seal number needs a clearer record copy.")
-> stub_salvage__after

=== stub_salvage__inspect_fail ===
[STUB] The copies use incompatible formats, so the attendant cannot verify the external seal list against the inventory entry today. The desk files the mismatch for a later records review and leaves the frame closed, inert, and unidentified. Staff can make the comparison again when a legible copy is available. The failed check therefore produces a concrete next step, while no handling access or recovery claim is established.
~ note("cost", "[STUB] Incompatible copies are queued for later inventory review.")
-> stub_salvage__after

=== stub_salvage__after ===
[STUB] The station file now contains the available notes on provisional terms, clearance timing, or external seal records, depending on which review occurred. The inert cargo frame remains unidentified, and its inventory entry may still need comparison. Staff can point to a recovery review desk or a later window when appropriate. Handling access, any agreement, and the next choice remain open for the player to decide.
# summary
-> scene_end