// @content {"id":"upkeep_recovery","location":"docs/canon/locations/hearthline-hall.md","state_nouns":["route list","packet","copy","receipt","fee","payment slip","page","tally mark"]}
// [STUB] Repeatable commercial courier job at Hearthline hall.

=== upkeep_recovery ===
[STUB] A master stands beside Hearthline hall’s job board with a tied packet of corrected trade slips. A broker at the far end of the dock hall will pay for the packet before the next posting. The master’s terms ask no fee up front, and the papers fit under one arm. A drawer key turns, small and final, as the master taps a late countersign on the top sheet. The board queue is already moving. # bg:hall
-> upkeep_recovery__menu

=== upkeep_recovery__menu ===
+ [\[STUB\] Sort the packet by route #hint:\[STUB\] Electronics / Diplomat]
    -> roll("Electronics,Diplomat", 8, "", -> upkeep_recovery__sort_clean, -> upkeep_recovery__sort_cost, -> upkeep_recovery__sort_fail)
+ [\[STUB\] Negotiate the broker’s share #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> upkeep_recovery__share_clean, -> upkeep_recovery__share_cost, -> upkeep_recovery__share_fail)
+ [\[STUB\] Match each slip to its copy #hint:\[STUB\] Recon / Electronics]
    -> roll("Recon,Electronics", 8, "", -> upkeep_recovery__match_clean, -> upkeep_recovery__match_cost, -> upkeep_recovery__match_fail)

=== upkeep_recovery__sort_clean ===
[STUB] Route marks pass inspection, then the slips are tied in posting order. Coffee and hot metal scent the air while the broker verifies each page against the packet. Because the countersign is attached, no second trip is needed. Payment of 2,000 Credits comes from the agreed courier fee, and the cleared route list is pinned beside the job board. The packet leaves intact.
~ add("Credits", 2000)
~ note("gain", "[STUB] Courier fee paid to your crew: Credits +2,000.")
-> upkeep_recovery__after

=== upkeep_recovery__sort_cost ===
[STUB] Reordered slips pass the master’s check, and the packet reaches the broker before the posting queue advances. A clerk spots one route copied twice, but the broker accepts the corrected packet for this posting. The deduction for the duplicate leaves your crew 500 Credits from the fee. The late-delivery notation is entered beside the master’s countersign, putting your crew’s handoff on record. The accepted packet is now with the broker.
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Partial courier fee: Credits +500; Strain +1 with the Compact.")
-> upkeep_recovery__after

=== upkeep_recovery__sort_fail ===
[STUB] One route points two slips to the same buyer, so the master pulls back the packet. A complaint goes into Compact’s registry against your crew, and the sorting copy is marked refused. That packet is set aside. The dock hall job board carries the retry: a fresh courier posting after the next registry posting, with a corrected route list.
~ add("Strain", 1)
~ note("cost", "[STUB] Compact complaint: Strain +1.")
-> upkeep_recovery__after

=== upkeep_recovery__share_clean ===
[STUB] After studying the split, the broker signs the master’s copy without asking for a larger cut. Grey chairs scrape as the waiting queue shifts forward, and full courier payment lands on the counter. The receipt bears the broker’s signature beside the agreed full share. Before the posting, the corrected slips reach the broker and secure your crew 2,500 Credits. Preparation earns the master the remaining fee. A blue tally mark now identifies the paid job on the board.
~ add("Credits", 2500)
~ note("gain", "[STUB] Agreed courier share paid to your crew: Credits +2,500.")
-> upkeep_recovery__after

=== upkeep_recovery__share_cost ===
[STUB] Agreement comes with a charge for a second copy of the trade slips. The amber recorder light stays on while the broker records the deduction beside the payment receipt. The second copy stays attached. Your crew receives 500 Credits after the charge, and the packet is accepted before posting changes. The master countersigns the receipt, recording the short share with the Compact. The broker keeps the copy with its papers.
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Copy charge and recorded short share: Credits +500; Strain +1 with the Compact.")
-> upkeep_recovery__after

=== upkeep_recovery__share_fail ===
[STUB] The broker rejects the proposed share and closes the payment ledger. No packet changes hands. A clerk enters the refusal in the registry against your crew, and the unsigned terms sheet returns to the master. The dock hall job board lists the next courier posting with a fixed share, giving the work a clear route back.
~ add("Strain", 1)
~ note("cost", "[STUB] Compact refusal notation: Strain +1.")
-> upkeep_recovery__after

=== upkeep_recovery__match_clean ===
[STUB] Beside its copy, each corrected slip shows a matching figure. Paper curls at the corners of the job board as the broker lifts the verified packet from the table. The countersign is present, so the handoff clears before the next posting. Payment from the courier fund gives your crew 1,500 Credits, and the matched copy stays with the master. A paid stamp marks the delivery receipt.
~ add("Credits", 1500)
~ note("gain", "[STUB] Verified courier fee paid to your crew: Credits +1,500.")
-> upkeep_recovery__after

=== upkeep_recovery__match_cost ===
[STUB] One copy carries an older figure, but the broker accepts the packet after a replacement page is copied. Pen scratching carries across the hall while the broker reduces the fee for the delay. A 500 Credit fee goes to your crew, and the full packet is delivered before the posting. A late-copy notation enters the Compact registry, which now expects careful handling on the next job. The replaced page stays filed.
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Reduced courier fee and late-copy notation: Credits +500; Strain +1 with the Compact.")
-> upkeep_recovery__after

=== upkeep_recovery__match_fail ===
[STUB] A corrected figure cannot be matched, so the broker refuses the packet and payment. The master marks the disputed slip and files a complaint in the Compact registry against your crew. The slip is returned for review. Hearthline hall’s job board lists the next courier posting with a reconciled copy, a specific route back to the handoff.
~ add("Strain", 1)
~ note("cost", "[STUB] Compact complaint over the disputed figure: Strain +1.")
-> upkeep_recovery__after

=== upkeep_recovery__after ===
[STUB] The job board remains in Hearthline hall, and the ledger card follows.
-> scene_end
