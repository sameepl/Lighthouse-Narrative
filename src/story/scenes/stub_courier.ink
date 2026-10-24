// [STUB] Replace all placeholder writing, hints, checks and consequences before publishing.
// Never write Marcus's speech, thoughts or actions. All local knots use the scene ID prefix.
=== stub_courier_scene ===
[STUB] A sealed message container rests on the dispatch counter of an unnamed station. The paperwork lists alternative delivery windows that are currently open. Staff members stand ready to process the manifest discrepancy. The physical seals appear intact under the station lighting. The counter displays standard commercial terms for handling such items. The situation requires a decision on how to proceed. # bg:hall
-> stub_courier__menu

=== stub_courier__menu ===
+ [\[STUB\] parley approach #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_courier__parley_clean, -> stub_courier__parley_cost, -> stub_courier__parley_fail)
+ [\[STUB\] coordinate approach #hint:\[STUB\] Leadership / Tactics]
    -> roll("Leadership,Tactics", 8, "", -> stub_courier__coordinate_clean, -> stub_courier__coordinate_cost, -> stub_courier__coordinate_fail)
+ [\[STUB\] inspect approach #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> stub_courier__inspect_clean, -> stub_courier__inspect_cost, -> stub_courier__inspect_fail)

=== stub_courier__parley_clean ===
[STUB] The dispatch staff accepts the parley and reviews the manifest. They confirm the sealed container matches the listed delivery window. The counter clerk stamps the paperwork with a clean approval mark. No additional fees are quoted during this interaction. The staff member gestures toward the open dispatch lane. The process concludes without any recorded discrepancies or delays.
~ note("gain", "[STUB] The current dispatch window is cleared without an extra fee.")
-> stub_courier__after

=== stub_courier__parley_cost ===
[STUB] The dispatch staff accepts the parley but notes a minor delay. They require a secondary signature on the manifest form. The sealed container remains on the counter during the review. The clerk quotes a standard processing fee for the hold. The delivery window remains open but the timeline shifts slightly. The interaction ends with the paperwork partially completed.
~ note("cost", "[STUB] A second signature is required and a processing fee is quoted.")
-> stub_courier__after

=== stub_courier__parley_fail ===
[STUB] The dispatch staff rejects the parley and cites a protocol gap. They point to a review desk located further down the hall. The sealed container is moved to a secure holding shelf. The current delivery window closes due to the administrative hold. A later dispatch window is indicated on the station board. The staff member provides a reference number for the review.
~ note("cost", "[STUB] The current window closes; a review reference and later window remain available.")
-> stub_courier__after

=== stub_courier__coordinate_clean ===
[STUB] The routing coordination succeeds and the dispatch staff confirms the path. They align the sealed container with the optimal delivery window. The manifest discrepancy is resolved through the routing adjustment. The counter displays a green status light for the lane. The staff member hands over the updated routing slip. The process is smooth and the container is cleared for movement.
~ note("gain", "[STUB] The routing slip clears the current dispatch lane.")
-> stub_courier__after

=== stub_courier__coordinate_cost ===
[STUB] The routing coordination succeeds but requires a manual override. The dispatch staff logs the override in the station records. The sealed container waits while the system recalculates the path. The delivery window remains open but the process is slower. The clerk notes the manual intervention in the manifest. The container is eventually cleared for the next stage.
~ note("cost", "[STUB] A manual routing override adds a recorded delay.")
-> stub_courier__after

=== stub_courier__coordinate_fail ===
[STUB] The routing coordination fails and the dispatch staff flags an error. They direct attention to a review desk for manual handling. The sealed container is placed in a temporary holding area. The current delivery window is suspended pending further review. A later dispatch window is suggested on the station display. The staff member provides a ticket for the review queue.
~ note("cost", "[STUB] A routing error redirects the item to the manual review queue.")
-> stub_courier__after

=== stub_courier__inspect_clean ===
[STUB] The inspection of the seals and records confirms integrity. The dispatch staff verifies the container against the manifest details. The physical seals show no signs of tampering or damage. The paperwork matches the physical item perfectly. The counter clerk approves the inspection and clears the item. The process concludes with a clean record entry.
~ note("gain", "[STUB] The seals and manifest match; the inspection record is clear.")
-> stub_courier__after

=== stub_courier__inspect_cost ===
[STUB] The inspection of the seals and records reveals a minor mismatch. The dispatch staff requires a detailed report on the discrepancy. The sealed container is held while the report is drafted. The delivery window remains open but the process is extended. The clerk notes the mismatch in the station logs. The container is eventually released after the report is filed.
~ note("cost", "[STUB] A manifest mismatch requires a report before release.")
-> stub_courier__after

=== stub_courier__inspect_fail ===
[STUB] The inspection of the seals and records fails to resolve the issue. The dispatch staff cites a protocol violation and halts the process. They point to a review desk for further investigation. The sealed container is moved to a secure storage unit. The current delivery window closes due to the failed check. A later dispatch window is indicated for the next attempt.
~ note("cost", "[STUB] The item is held for investigation; a later dispatch window remains available.")
-> stub_courier__after

=== stub_courier__after ===
[STUB] The station records now reflect the outcome of the interaction. The dispatch counter displays the current status of the sealed container. Alternative delivery windows remain visible on the station board. The paperwork shows the specific actions taken during the process. The staff members are ready for the next decision. The situation is stable and the next steps are available. # summary
-> scene_end
