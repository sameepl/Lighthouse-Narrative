// [STUB] Placeholder survey scene for comparison; replace before canon.
// Never write Marcus's speech, thoughts or actions. All local knots use the scene ID prefix.
=== stub_scout_scene ===
[STUB] At an unnamed station, the survey desk has incomplete route records, a passive observation docket, and a queue awaiting routine review. A clerk can explain how to request the records, compare proposed observation windows, or examine existing passive sensor entries. Nothing in the docket establishes a destination, hazard, or completed scan. The desk can hold the paperwork for a later review while the available choices remain open. # bg:hall
-> stub_scout__menu

=== stub_scout__menu ===
+ [\[STUB\] Ask for access to route records #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_scout__parley_clean, -> stub_scout__parley_cost, -> stub_scout__parley_fail)
+ [\[STUB\] Coordinate proposed observation windows #hint:\[STUB\] Leadership / Tactics]
    -> roll("Leadership,Tactics", 8, "", -> stub_scout__coordinate_clean, -> stub_scout__coordinate_cost, -> stub_scout__coordinate_fail)
+ [\[STUB\] Inspect passive sensor records #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> stub_scout__inspect_clean, -> stub_scout__inspect_cost, -> stub_scout__inspect_fail)

=== stub_scout__parley_clean ===
[STUB] The clerk explains which route-record pages can be requested and marks the applicable index references for review. The available entries remain incomplete, but their gaps are now listed beside the request procedure rather than scattered through the docket. Staff leave authorization undecided and keep the records in the review queue. This makes a future examination easier to prepare, while no route, destination, or observation is confirmed by the conversation.
~ note("gain", "[STUB] Route-record index references are listed for a later access request.")
-> stub_scout__after

=== stub_scout__parley_cost ===
[STUB] The desk finds that two index pages use different labels for the same route-record section, so the clerk attaches a clarification slip before explaining the request process. The records remain incomplete and are not released from the review queue. A later reviewer can reconcile the labels using the attached note. Access remains undecided, but the discrepancy is now localized and the request path is visible.
~ note("cost", "[STUB] Conflicting index labels require clarification before access review.")
-> stub_scout__after

=== stub_scout__parley_fail ===
[STUB] The clerk cannot identify which request category fits the incomplete route records and declines to mark them accessible. The pages remain in the survey desk's review queue, with no route conclusion drawn from the missing sections. Staff point to a review clerk who can classify the request during a later queue pass. The conversation does not open access, but it leaves a practical administrative next step.
~ note("cost", "[STUB] Request category remains unclear; a review clerk can classify it later.")
-> stub_scout__after

=== stub_scout__coordinate_clean ===
[STUB] The scheduling board lists two proposed observation windows that avoid the desk's routine maintenance blocks. Staff record both as options beside the passive observation docket, without reserving a slot or authorizing equipment use. The route records remain incomplete, so the proposals are explicitly subject to review. The calendar is easier to discuss at the next appointment, while any decision to observe or scan remains unmade.
~ note("gain", "[STUB] Two proposed windows are recorded without a reservation.")
-> stub_scout__after

=== stub_scout__coordinate_cost ===
[STUB] One proposed window overlaps a routine staff handover, and the other depends on the incomplete route pages reaching the review desk first. The scheduler notes both limits and leaves the docket in its existing queue. A later window can be proposed once the paperwork is sorted, but no appointment is held now. The timing constraints are concrete, and the survey remains a pending possibility rather than an active operation.
~ note("cost", "[STUB] Handover overlap and queued records constrain proposed timing.")
-> stub_scout__after

=== stub_scout__coordinate_fail ===
[STUB] The scheduler cannot match the proposed windows to the current review queue, so the calendar receives no entry. Staff explain that another window can be considered after the route pages are reviewed, keeping the docket available for follow-up. No scan or travel is authorized, and the incomplete records remain unchanged. The failed coordination still identifies the queue as the next step, without closing future observation options.
~ note("cost", "[STUB] No window is matched; the review queue remains the next step.")
-> stub_scout__after

=== stub_scout__inspect_clean ===
[STUB] The passive sensor docket contains entries that can be sorted by their recorded time labels, though they do not fill the route-record gaps. The desk clerk adds a cross-reference to the corresponding index pages and leaves the underlying entries unchanged. No new observation is made; this is a review of existing paperwork only. The docket is easier to navigate, while interpretation and any future scanning decision remain open.
~ note("gain", "[STUB] Existing passive entries are cross-referenced to the route index.")
-> stub_scout__after

=== stub_scout__inspect_cost ===
[STUB] Several passive entries use a time-label format that differs from the survey desk's current index, slowing the comparison. The clerk marks the affected rows for a format check and keeps the docket in the review queue. The entries remain existing records, not results from a new scan. A later reviewer can reconcile the labels, though the mismatch leaves the route pages and proposed observation choices unresolved.
~ note("cost", "[STUB] Time-label formats differ and need a records review.")
-> stub_scout__after

=== stub_scout__inspect_fail ===
[STUB] The passive docket cannot be aligned with the incomplete route index using the copies currently available. The clerk records the mismatch and leaves both sets of paperwork in the review queue, without inferring what the missing pages contain. A later records pass can compare them when a consistent index copy is available. The check reveals an administrative route forward, but no observation, scan, or access decision occurs.
~ note("cost", "[STUB] Docket and route index need comparison at a later review.")
-> stub_scout__after

=== stub_scout__after ===
[STUB] The survey desk now has notes about record access, proposed observation timing, or existing passive entries, depending on which review took place. Route information remains incomplete, and the passive docket stays a record of prior entries rather than a new scan. Staff can direct the next inquiry to the review queue or a later window. Access, scheduling, and any further action remain decisions for the player.
# summary
-> scene_end