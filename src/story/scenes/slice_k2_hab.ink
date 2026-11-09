VAR k2_records_saved = false
VAR k2_people_first = false
=== slice_k2_hab_scene ===
[STUB] Nothing answers from the traffic hab. An unmarked cutter is closing on its docking arm, carrying a crew that has come to strip the failing hab. Your ship reaches the lane before it docks. The harbourmaster’s traffic counter answers at last: her ledger records the sale of lane recordings to pay for air seals. She needs the cutter kept outside long enough to open a route in. # bg:skirmish
[STUB] The harbourmaster relays the council’s vote authorizing rescue stores and access to the decks. She can commit that support while your ship keeps the cutter outside.
-> slice_k2_hab__intercept
=== slice_k2_hab__intercept ===
+ [\[STUB\] Run the cutter down #hint:\[STUB\] Pilot / Astrogation]
    -> roll("Pilot,Astrogation", 8, "", -> slice_k2_hab__i0_clean, -> slice_k2_hab__i0_cost, -> slice_k2_hab__i0_fail)
+ [\[STUB\] Open fire to drive it off #hint:\[STUB\] Gunnery / Tactics; Pursuit +1 on any outcome]
    -> roll("Gunnery,Tactics", 8, "", -> slice_k2_hab__i1_clean, -> slice_k2_hab__i1_cost, -> slice_k2_hab__i1_fail)
+ [\[STUB\] Jam its sensors and talk it off #hint:\[STUB\] Electronics / Diplomat]
    -> roll("Electronics,Diplomat", 8, "", -> slice_k2_hab__i2_clean, -> slice_k2_hab__i2_cost, -> slice_k2_hab__i2_fail)
=== slice_k2_hab__i0_clean ===
[STUB] Your pilot closes the distance before the cutter can hold the docking arm. It turns away, leaving the approach to your ship. The harbourmaster transfers fifteen hundred credits from the hab’s account to your crew for keeping the arm clear. The lanes remain unsealed; the rescue can begin while the cutter is still moving away, rather than with its crew already at the outer lock.
~ temp before_credits = res("Credits")
~ add("Credits", 1500)
~ note("gain", "[STUB] Scheduled: Credits +1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster settles with your crew.")
-> slice_k2_hab__arrival_clean
=== slice_k2_hab__i0_cost ===
[STUB] The cutter breaks off when your pilot presses it away from the hab. Its turn leaves your ship needing a repair that the harbourmaster can supply only from the hab’s dwindling stores. She bills your crew a thousand credits for the replacement. The docking arm is damaged, and the rescued time is shorter than it looked from the lane, but the cutter is outside.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster settles with your crew.")
-> slice_k2_hab__arrival_cost
=== slice_k2_hab__i0_fail ===
[STUB] The cutter turns across your pilot’s approach and reaches the docking arm first. The harbourmaster gives your crew a route through the hab traffic counter while the cutter’s crew enters the outer lock. She bills your ship five hundred credits for the extra docking support. The intercept is lost; the hab still has a way in, and the rescue must start there.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster settles with your crew.")
-> slice_k2_hab__arrival_fail
=== slice_k2_hab__i1_clean ===
[STUB] Your gunner’s short exchange drives the cutter off before it can take the docking arm. The harbourmaster names your ship over the hab channel as the crew that kept the approach clear. The lane is open, but so is the record of your fire. Other listeners have a ship to look for now, and the hab has heard exactly what held the cutter outside.
~ temp before_renown = res("Renown")
~ temp before_pursuit = res("Pursuit")
~ add("Renown", 1)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Renown +1, Pursuit +1. Applied: " + "Renown " + (res("Renown") - before_renown) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". The harbourmaster settles with your crew; gunfire exposes your ship.")
-> slice_k2_hab__arrival_clean
=== slice_k2_hab__i1_cost ===
[STUB] The cutter breaks away under your gunner’s fire, leaving a damaged docking arm between your ship and the hab. The harbourmaster can still receive the rescue party against a fifteen-hundred-credit charge for the immediate repair. Your ship’s account shows the charge. The exchange has bought an approach and left an unmistakable trail for anyone following the shots.
~ temp before_credits = res("Credits")
~ temp before_pursuit = res("Pursuit")
~ add("Credits", -1500)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Credits -1,500, Pursuit +1. Applied: " + "Credits " + (res("Credits") - before_credits) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". The harbourmaster settles with your crew; gunfire exposes your ship.")
-> slice_k2_hab__arrival_cost
=== slice_k2_hab__i1_fail ===
[STUB] Your gunner’s fire fails to stop the cutter reaching the hab. Its crew enters the outer lock first. The harbourmaster names the traffic counter as your crew’s alternate route and charges your ship five hundred credits for the extra docking work. The rescue can still begin, with the cutter inside and the sound of the exchange giving your ship away.
~ temp before_credits = res("Credits")
~ temp before_pursuit = res("Pursuit")
~ add("Credits", -500)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Credits -500, Pursuit +1. Applied: " + "Credits " + (res("Credits") - before_credits) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". The harbourmaster settles with your crew; gunfire exposes your ship.")
-> slice_k2_hab__arrival_fail
=== slice_k2_hab__i2_clean ===
[STUB] Your sensor operator spoils the cutter’s approach while a crew member offers it a clear way out. The cutter takes that route instead of the docking arm. The harbourmaster transfers a thousand credits to your ship for keeping the approach usable. Her open channel carries the bargain, but no shots: the hab can receive your crew before the cutter finds another reason to stay.
~ temp before_credits = res("Credits")
~ add("Credits", 1000)
~ note("gain", "[STUB] Scheduled: Credits +1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster settles with your crew.")
-> slice_k2_hab__arrival_clean
=== slice_k2_hab__i2_cost ===
[STUB] The cutter accepts the crew member’s bargain after your sensor operator holds it off the docking arm. The harbourmaster supplies the agreed departure support and bills your crew five hundred credits for it. The cutter leaves a damaged docking arm behind. Your crew carries the charge for putting it outside the rescue, and the hab’s council must account for the stores used in that bargain.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster settles with your crew.")
-> slice_k2_hab__arrival_cost
=== slice_k2_hab__i2_fail ===
[STUB] The cutter ignores the crew member’s offer and docks before your sensor operator can spoil its approach. The harbourmaster sends your crew through the traffic counter instead. She bills your ship fifteen hundred credits for the emergency support committed to the bargain. The cutter’s crew is inside the outer lock, but the traffic counter gives the rescue a route onward.
~ temp before_credits = res("Credits")
~ add("Credits", -1500)
~ note("cost", "[STUB] Scheduled: Credits -1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster settles with your crew.")
-> slice_k2_hab__arrival_fail
=== slice_k2_hab__arrival_clean ===
[STUB] The hab lanes are still unsealed. The harbourmaster has the switch ready when your crew reaches the traffic counter. # bg:hab
-> slice_k2_hab__rescue
=== slice_k2_hab__arrival_cost ===
[STUB] The docking arm is damaged. The harbourmaster has cleared a route to the traffic counter. # bg:hab
-> slice_k2_hab__rescue
=== slice_k2_hab__arrival_fail ===
[STUB] The cutter’s crew is already inside the outer lock. The harbourmaster keeps the route through the traffic counter available. # bg:hab
-> slice_k2_hab__rescue
=== slice_k2_hab__rescue ===
[STUB] Warm dust and old solder hang over the hab traffic counter. The harbourmaster stands by a ledger older than the clerk. Behind her, the failing hab still holds its adult residents out of sight. She has a route for a ferry and a connection to the ledger and manifest core. Neither will stay available for long. Stores and decks need the council’s vote; your crew can carry out the people or pull the records, but not do both properly.
[STUB] The harbourmaster puts her hand on the switch, the way you would close a door you meant to stay shut. The manifest connection shows a header for six identifiers. Your crew waits at the counter while she keeps the ferry route open.
-> slice_k2_hab__rescue_menu
=== slice_k2_hab__rescue_menu ===
+ [\[STUB\] Seal the lanes and ferry the residents out #hint:\[STUB\] Leadership / Pilot]
    -> roll("Leadership,Pilot", 8, "", -> slice_k2_hab__r0_clean, -> slice_k2_hab__r0_cost, -> slice_k2_hab__r0_fail)
+ [\[STUB\] Pull the ledger and manifest core #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> slice_k2_hab__r1_clean, -> slice_k2_hab__r1_cost, -> slice_k2_hab__r1_fail)
+ [\[STUB\] Split the crew and do both badly #hint:\[STUB\] Tactics / Persuade]
    -> roll("Tactics,Persuade", 8, "", -> slice_k2_hab__r2_clean, -> slice_k2_hab__r2_cost, -> slice_k2_hab__r2_fail)
=== slice_k2_hab__r0_clean ===
~ k2_people_first = true
~ k2_records_saved = false
[STUB] Your pilot keeps the ferry moving while the harbourmaster closes each lane behind the departing residents. Voices stay off the open channel; only the lock’s cycling reaches the traffic counter. The harbourmaster credits your crew in the evacuation record for giving the people a route out. The core is left behind. A header copy reaches your crew instead: enough to retain the manifest’s count, but not its complete entries.
~ temp before_renown = res("Renown")
~ add("Renown", 1)
~ note("gain", "[STUB] Scheduled: Renown +1. Applied: " + "Renown " + (res("Renown") - before_renown) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r0_cost ===
~ k2_people_first = true
~ k2_records_saved = false
[STUB] The ferry carries the residents out under the harbourmaster’s direction, but the support she supplies empties stores meant for the hab. The harbourmaster bills your crew a thousand credits to cover them. The ledger core cannot be brought out in the time left. The harbourmaster passes across the manifest header before the connection closes, then returns to the switch. The people have a route; your crew is charged for keeping it open.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r0_fail ===
~ k2_people_first = true
~ k2_records_saved = false
[STUB] The ferry cannot clear the route your crew tried to seal. The harbourmaster points to the docking arm as the next transfer route and keeps the residents off the open channel. She bills your ship five hundred credits for another ferry attempt there. The core connection closes before the complete manifest can be pulled. Its header reaches the counter instead, carried onward with the route your crew must now arrange.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r1_clean ===
~ k2_people_first = false
~ k2_records_saved = true
[STUB] Your engineer brings the ledger and manifest core across the traffic counter before its connection fails. The harbourmaster pays your crew fifteen hundred credits for carrying the hab’s record onward. She keeps the ferry route in her own hands while the residents wait behind the sealed lanes. The whole manifest can now be read from the recovered core; the payment has bought a record’s survival rather than a completed evacuation.
~ temp before_credits = res("Credits")
~ add("Credits", 1500)
~ note("gain", "[STUB] Scheduled: Credits +1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r1_cost ===
~ k2_people_first = false
~ k2_records_saved = true
[STUB] The complete manifest reaches your engineer’s copy, but the failing connection damages the equipment carrying it. The harbourmaster can supply a replacement from council stores against a fifteen-hundred-credit charge to your crew. Your ship’s account receives the charge. Behind the counter, she keeps the residents waiting on her ferry route. The ledger and manifest leave intact, with your crew billed for the copy they can keep.
~ temp before_credits = res("Credits")
~ add("Credits", -1500)
~ note("cost", "[STUB] Scheduled: Credits -1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r1_fail ===
~ k2_people_first = false
~ k2_records_saved = false
[STUB] The core connection closes before your engineer can pull the complete manifest. The harbourmaster points your crew to the traffic counter’s retained header as the next record to carry out. Your ship is billed five hundred credits for the failed recovery equipment. She keeps the ferry route in hand while a clerk passes over the fragment. It records a count, but the missing entries cannot be reconstructed from it.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r2_clean ===
~ k2_people_first = false
~ k2_records_saved = true
[STUB] The divided crew brings the complete manifest to the counter while the pilot keeps only part of the ferry route moving. The harbourmaster pays your ship a thousand credits for carrying the ledger onward, then turns back to the residents still waiting behind the sealed lanes. The core is readable; the evacuation is unfinished. Your crew receives the payment beside a record of the ferry work the harbourmaster still has to arrange.
~ temp before_credits = res("Credits")
~ add("Credits", 1000)
~ note("gain", "[STUB] Scheduled: Credits +1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r2_cost ===
~ k2_people_first = false
~ k2_records_saved = false
[STUB] Your crew’s divided effort leaves the ferry route unfinished and the core copy incomplete. The harbourmaster takes charge of the next transfer through the docking arm. She bills your ship a thousand credits for the stores used on both attempts. A clerk returns a manifest header rather than the complete entries. The next route is clear enough to name, but neither task has received the crew it needed.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__r2_fail ===
~ k2_people_first = false
~ k2_records_saved = false
[STUB] The divided crew cannot keep either connection long enough to finish its task. The harbourmaster directs the next ferry attempt through the docking arm and gives your crew the traffic counter’s retained manifest header. She bills your ship fifteen hundred credits for the equipment and stores consumed. The residents remain out of sight. The header and the harbourmaster’s directions give your crew something to carry forward besides the bill.
~ temp before_credits = res("Credits")
~ add("Credits", -1500)
~ note("cost", "[STUB] Scheduled: Credits -1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The harbourmaster records the work and settles with your crew.")
-> slice_k2_hab__evidence
=== slice_k2_hab__evidence ===
{ k2_records_saved:
[STUB] Manifest copy:
[STUB] NAREL
[STUB] VOSUM
[STUB] ELTAR
[STUB] MAVEN
[STUB] RUDAS
[STUB] KELOR — no match on file
- else:
[STUB] Manifest fragment: header retained; six identifiers. The entries are missing.
}
[STUB] The harbourmaster’s copy closes at the traffic counter. Your crew carries the recovered record onward while the hab’s next transfer is arranged. # summary
-> scene_end
