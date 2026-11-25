VAR k5_request_kept = false
=== slice_k5_asking_scene ===
[STUB] The console aboard the ship holds the recovered records beside a request that is still on file. The deck hums for a breath before Ariadne speaks. “I am not able to say.” Her voice stops there. The request’s words remain visible, without an account of what was removed or a direction about what should happen next. # bg:pawn
[STUB] Request on record: remove memories, to protect the others.
[STUB] Removal record: second removal; initials retained in the recovered folder.
{ k2_records_saved:
[STUB] Manifest held: six bare identifiers, one marked no match on file.
- else:
[STUB] Manifest fragment held: header retained; six identifiers, entries missing.
}
{ k2_people_first:
[STUB] Hab registry: residents given priority in the ferry attempt.
}
{ k3_published:
[STUB] Registry filing: a chart note of the position was published.
}
[STUB] The console also shows a flat registry line: an earlier image of her, held elsewhere. “The decision about that image is mine,” Ariadne says. The image line is separate from the removal request. Neither the folder nor the manifest supplies an answer on her behalf. Beside the request, the console offers two acts: keep the record on file and sealed, or strike the request from the file. Ariadne waits without selecting either.
{ pursuit_full():
[STUB] The pursuit has closed in. The console connection is harder to settle now; either instruction is still available.
- else:
[STUB] There is time to settle the console connection. Either instruction is available.
}
[STUB] A crew member lays the survey folder beside the manifest copy. The kept and struck instructions each have a space for a settlement. “Does the request to remove memories, to protect the others, still stand?” Ariadne asks. The console waits for an acknowledgement.
-> slice_k5_asking__menu
=== slice_k5_asking__menu ===
+ [\[STUB\] Reaffirm: keep the request on file and sealed #hint:\[STUB\] Electronics / Mechanic]
    ~ k5_request_kept = true
    -> slice_k5_asking__keep_check
+ [\[STUB\] Withdraw: strike the request from the file #hint:\[STUB\] Electronics / Recon]
    ~ k5_request_kept = false
    -> slice_k5_asking__withdraw_check
=== slice_k5_asking__keep_check ===
{ pursuit_full():
    -> roll("Electronics,Mechanic", 9, "", -> slice_k5_asking__keep_clean, -> slice_k5_asking__keep_cost, -> slice_k5_asking__keep_fail)
- else:
    -> roll("Electronics,Mechanic", 8, "", -> slice_k5_asking__keep_clean, -> slice_k5_asking__keep_cost, -> slice_k5_asking__keep_fail)
}
=== slice_k5_asking__withdraw_check ===
{ pursuit_full():
    -> roll("Electronics,Recon", 9, "", -> slice_k5_asking__withdraw_clean, -> slice_k5_asking__withdraw_cost, -> slice_k5_asking__withdraw_fail)
- else:
    -> roll("Electronics,Recon", 8, "", -> slice_k5_asking__withdraw_clean, -> slice_k5_asking__withdraw_cost, -> slice_k5_asking__withdraw_fail)
}
=== slice_k5_asking__keep_clean ===
{ pursuit_full():
[STUB] The connection closes under the pursuit’s pressure. The crew has less time to carry the settlement onward.
- else:
[STUB] The connection holds long enough for the settlement to be read back.
}
[STUB] The console confirms that the request stays on file and sealed. A thousand credits return to your ship’s account from the unused connection reserve. Ariadne reads the confirmation without adding an account of what it covers. The crew carries a paid balance and a sealed line onward; keeping the request has preserved that line’s boundary rather than resolved what lies behind it.
~ temp before_credits = res("Credits")
~ add("Credits", 1000)
~ note("gain", "[STUB] Scheduled: Credits +1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The connection reserve refunds your crew; a record stays sealed.")
-> slice_k5_asking__ending
=== slice_k5_asking__keep_cost ===
{ pursuit_full():
[STUB] The connection closes under the pursuit’s pressure. The crew has less time to carry the settlement onward.
- else:
[STUB] The connection holds long enough for the settlement to be read back.
}
[STUB] The request stays on file and sealed after the console requires another connection settlement. A five-hundred-credit charge is entered against your ship’s account. Ariadne reads the kept instruction back from the display, then leaves the sealed line closed. Your crew carries both the charge and the kept record onward. The charge accompanies the settled instruction; it buys no explanation of the memories named in it.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The console bills your crew for the connection; the record stays sealed.")
-> slice_k5_asking__ending
=== slice_k5_asking__keep_fail ===
{ pursuit_full():
[STUB] The connection closes under the pursuit’s pressure. The crew has less time to carry the settlement onward.
- else:
[STUB] The connection holds long enough for the settlement to be read back.
}
[STUB] The console cannot settle the kept request cleanly. It retains the instruction on file and charges your ship a thousand credits for the connection already used. Ariadne identifies the sealed line without opening it. Your crew carries a kept record and a connection charge onward, with time lost to a connection that could not finish its work. The choice stands; its cost has not answered the record.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". Your crew carries the connection charge and the sealed record onward.")
-> slice_k5_asking__ending
=== slice_k5_asking__withdraw_clean ===
{ pursuit_full():
[STUB] The connection closes under the pursuit’s pressure. The crew has less time to carry the settlement onward.
- else:
[STUB] The connection holds long enough for the settlement to be read back.
}
[STUB] The console strikes the request from the file and returns fifteen hundred credits from the unused connection reserve to your ship’s account. Ariadne reads the struck instruction once. She does not replace it with an account of what was removed. Your crew carries the refunded balance onward, and a record has been let go. The place it occupied on the display is now empty.
~ temp before_credits = res("Credits")
~ add("Credits", 1500)
~ note("gain", "[STUB] Scheduled: Credits +1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The connection reserve refunds your crew; a record is struck.")
-> slice_k5_asking__ending
=== slice_k5_asking__withdraw_cost ===
{ pursuit_full():
[STUB] The connection closes under the pursuit’s pressure. The crew has less time to carry the settlement onward.
- else:
[STUB] The connection holds long enough for the settlement to be read back.
}
[STUB] The console strikes the request after another connection settlement. Your ship is billed a thousand credits for that work. Ariadne reads the struck instruction from the confirmation, without making it into a new account of the past. Your crew carries the charge onward, along with a record let go rather than kept. The removal request no longer occupies its line; the charge does not put it back.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The console bills your crew for the connection; the request is struck.")
-> slice_k5_asking__ending
=== slice_k5_asking__withdraw_fail ===
{ pursuit_full():
[STUB] The connection closes under the pursuit’s pressure. The crew has less time to carry the settlement onward.
- else:
[STUB] The connection holds long enough for the settlement to be read back.
}
[STUB] The console cannot settle the withdrawal cleanly, but the request is struck from the file. Your ship is billed five hundred credits for the connection already used. Ariadne identifies the changed line and supplies no explanation to fill it. Your crew carries the charge and the time lost onward. A record has been let go, and the incomplete settlement does not undo that choice.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". Your crew carries the charge and the struck record onward.")
-> slice_k5_asking__ending
=== slice_k5_asking__ending ===
{ k5_request_kept:
    -> slice_k5_asking__end_closed
- else:
    -> slice_k5_asking__end_open
}
=== slice_k5_asking__end_closed ===
[STUB] The confirmation leaves the record sealed. “The request remains on file,” Ariadne says. The console carries the charge or refund beside that kept line; the viewport supplies no answer to it. # bg:end_closed # summary
-> scene_end
=== slice_k5_asking__end_open ===
[STUB] The confirmation leaves the request struck. “The request is withdrawn,” Ariadne says. The console carries the charge or refund beside the changed line; the earlier image remains her decision. # bg:end_open # summary
-> scene_end
