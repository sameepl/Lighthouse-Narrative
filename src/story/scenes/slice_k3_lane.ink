VAR k3_published = false
=== slice_k3_lane_scene ===
[STUB] The survey tender holds at the edge of Fenrir Gap while your crew compares the last plotted position with a chart that no longer covers it. The tender’s lead can guide a passive approach as far as the calibration buoy. Beyond that point, the chart offers no completed route. A sealed folder comes across to your crew with the position copy. Its cover opens on the display. # bg:dark_lane
[STUB] Segment ______ (no chart). Second removal: M.
[STUB] A separate scrap lies beside the cover, attributed only to a hand: “Bearing heard. Could be wrong.”
[STUB] The tender’s lead asks for a chart note of the position, not for the folder’s contents. A published position would give other crews a route back to the tender and put your ship’s name beside it. Keeping the survey sealed would leave that copy with your crew alone. Taking only the folder would mean leaving the chart unfinished and accepting the tender’s way out. The lead keeps the return bearing available while your crew checks the alternatives.
[STUB] The registry desk will accept a chart filing if one is made. It will also settle the tender’s survey account against your ship. The open folder stays with your crew whichever route is chosen; the scrap is kept separately from its designation. No one at the tender supplies an explanation for either record.
-> slice_k3_lane__menu
=== slice_k3_lane__menu ===
+ [\[STUB\] Chart it and publish the position #hint:\[STUB\] Astrogation / Electronics; Pursuit +1 on any outcome]
    -> roll("Astrogation,Electronics", 8, "", -> slice_k3_lane__a0_clean, -> slice_k3_lane__a0_cost, -> slice_k3_lane__a0_fail)
+ [\[STUB\] Chart it and keep the record sealed #hint:\[STUB\] Astrogation / Recon]
    -> roll("Astrogation,Recon", 8, "", -> slice_k3_lane__a1_clean, -> slice_k3_lane__a1_cost, -> slice_k3_lane__a1_fail)
+ [\[STUB\] Take only the folder and leave #hint:\[STUB\] Pilot / Tactics]
    -> roll("Pilot,Tactics", 8, "", -> slice_k3_lane__a2_clean, -> slice_k3_lane__a2_cost, -> slice_k3_lane__a2_fail)
=== slice_k3_lane__a0_clean ===
~ k3_published = true
[STUB] Your navigator sends a usable chart note to the registry desk. The survey tender’s lead credits your ship by name for a route other crews can now request. Only the position is published; the folder and its separate scrap stay with your crew. The filing is also a trail back to the ship that made it. Your crew leaves with a public credit and an easier position to follow.
~ temp before_renown = res("Renown")
~ temp before_pursuit = res("Pursuit")
~ add("Renown", 1)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Renown +1, Pursuit +1. Applied: " + "Renown " + (res("Renown") - before_renown) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". The tender credits your ship; the public position exposes it.")
-> slice_k3_lane__after
=== slice_k3_lane__a0_cost ===
~ k3_published = true
[STUB] The registry desk accepts the position after the tender’s lead supplies a correction. The tender bills your crew five hundred credits for the extra survey work. Other crews can use the filed route, but your ship’s name travels with it. The open folder and the separate scrap remain aboard. The chart has reached the registry at a price, and its public copy gives a follower the same position your crew has just left.
~ temp before_credits = res("Credits")
~ temp before_pursuit = res("Pursuit")
~ add("Credits", -500)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Credits -500, Pursuit +1. Applied: " + "Credits " + (res("Credits") - before_credits) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". Your crew is charged by the tender; the filing exposes your ship.")
-> slice_k3_lane__after
=== slice_k3_lane__a0_fail ===
~ k3_published = false
[STUB] The registry desk rejects your navigator’s chart note as incomplete. The tender’s lead points to the calibration buoy as the place to take another position reading and bills your crew five hundred credits for the failed survey. The attempted filing has already named your ship in public. Your crew retains the folder and scrap, with a route back to the buoy and a trail left by the rejected chart.
~ temp before_credits = res("Credits")
~ temp before_pursuit = res("Pursuit")
~ add("Credits", -500)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Credits -500, Pursuit +1. Applied: " + "Credits " + (res("Credits") - before_credits) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". The tender bills your crew; the attempted filing exposes it.")
-> slice_k3_lane__after
=== slice_k3_lane__a1_clean ===
~ k3_published = false
[STUB] Your navigator closes a usable survey copy without sending it to the registry desk. The tender’s lead pays your crew a thousand credits for the contracted reading, accepting that its copy will stay sealed aboard your ship. The folder remains open beside it, with the hand’s scrap kept apart. Your crew has a paid survey and a private route; other crews receive no new position from this departure.
~ temp before_credits = res("Credits")
~ add("Credits", 1000)
~ note("gain", "[STUB] Scheduled: Credits +1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The tender pays your crew for the sealed survey.")
-> slice_k3_lane__after
=== slice_k3_lane__a1_cost ===
~ k3_published = false
[STUB] The sealed survey is usable after the tender’s lead checks the return bearing against the calibration buoy. The tender bills your crew five hundred credits for that correction rather than filing an uncertain position in public. The navigator keeps the corrected copy with the folder, and the scrap stays separate. The tender files its charge. Your crew leaves with the private chart it wanted and a survey charge for carrying it.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". Your crew is charged by the tender for correcting the sealed survey.")
-> slice_k3_lane__after
=== slice_k3_lane__a1_fail ===
~ k3_published = false
[STUB] Your navigator cannot close a reliable survey from this approach. The tender’s lead gives your crew the calibration buoy as the next place to take a reading and charges a thousand credits for the survey already used. The folder and scrap stay aboard, separate from the unfinished chart. There is a route for another attempt, but no private chart ready to use and no registry payment coming back.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The tender charges your crew for the unfinished survey.")
-> slice_k3_lane__after
=== slice_k3_lane__a2_clean ===
~ k3_published = false
[STUB] Your pilot follows the tender’s return bearing without spending another approach on the chart. The lead pays your crew fifteen hundred credits for carrying the folder out under the agreed recovery booking. Its cover and the separate scrap are readable aboard your ship. No position is sent to the registry desk. The survey remains unfinished, but the recovery account is paid and the crew has a way clear.
~ temp before_credits = res("Credits")
~ add("Credits", 1500)
~ note("gain", "[STUB] Scheduled: Credits +1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The tender pays your crew for the folder recovery.")
-> slice_k3_lane__after
=== slice_k3_lane__a2_cost ===
~ k3_published = false
[STUB] The pilot brings the folder out by the tender’s return bearing, but the approach consumes support the survey crew had reserved for its own work. The tender bills your ship a thousand credits for it. The cover and scrap stay with your crew; no chart note reaches the registry desk. The folder is clear of the corridor, carried with the support bill rather than a completed survey.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". Your crew is charged by the tender for the recovery support.")
-> slice_k3_lane__after
=== slice_k3_lane__a2_fail ===
~ k3_published = false
[STUB] Your pilot cannot clear the approach by the tender’s first return bearing. The lead supplies a route back through the calibration buoy and charges your crew five hundred credits for the extra support. The folder and its scrap remain aboard throughout; the failed departure never takes either away. The next bearing gives the pilot a way onward, while the chart stays unfinished and the recovery account stays unpaid.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". Your crew is charged by the tender for the alternate departure.")
-> slice_k3_lane__after
=== slice_k3_lane__after ===
[STUB] The tender’s lead closes the survey account. Your crew keeps the folder and the separate scrap together in its care, ready for another reading when there is time to lay them out again. # summary
-> scene_end
