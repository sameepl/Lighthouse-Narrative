// TARGET (reference quality, not shipped): [STUB] The Wrong Lamp. See docs/targets/README.md.
// Marcus is never written for. All local knots use the scene ID prefix.
=== target_scout_shoal_scene ===
[STUB] Old voices loop from the wreck beacons, each repeating its last call over the others. Eleven amber lights hang in passive reach, and one of them is lying about what it is. A convoy of short-crewed haulers waits behind you for a safe line through. Going active would tell every watcher in the Shoal exactly where you are. # bg:hall
-> target_scout_shoal__menu

=== target_scout_shoal__menu ===
+ [\[STUB\] Go dark and listen to the beacons #hint:\[STUB\] Recon / Electronics]
    -> roll("Recon,Electronics", 8, "", -> target_scout_shoal__listen_clean, -> target_scout_shoal__listen_cost, -> target_scout_shoal__listen_fail)
+ [\[STUB\] Plot the lane against old hauler logs #hint:\[STUB\] Astrogation / Tactics]
    -> roll("Astrogation,Tactics", 8, "", -> target_scout_shoal__plot_clean, -> target_scout_shoal__plot_cost, -> target_scout_shoal__plot_fail)
+ [\[STUB\] Ask a passing salvage crew which beacon they avoid #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> target_scout_shoal__ask_clean, -> target_scout_shoal__ask_cost, -> target_scout_shoal__ask_fail)

=== target_scout_shoal__listen_clean ===
[STUB] The amber lights blink out of step with each other, all but one, which keeps a rhythm too even for a hulk’s dying battery. Passive sensors hold the bearing steady for a full minute. The convoy master takes the line and pays on the spot, relieved that nobody had to power up a single emitter.
~ add("Credits", 2000)
~ note("gain", "[STUB] Credits +2,000: the false beacon is found and the convoy master pays for the line.")
-> target_scout_shoal__after

=== target_scout_shoal__listen_cost ===
[STUB] The even beacon is found, but only after a probe drifts into the noise and goes quiet for good. The bearing is good and the probe is gone. Before she commits her haulers the master wants the lane marked, and a replacement probe is a fair price for the line.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500: the line is marked, and a probe is lost doing it.")
-> target_scout_shoal__after

=== target_scout_shoal__listen_fail ===
[STUB] Eleven carriers hiss together into one grey noise, and the sensors cannot pull a single bearing out of it. An hour of listening gives nothing, and the convoy has started to drift. She calls the lane unproven and gives you the hail words of a salvage tender working the middle belt, who may know better.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500: a day is lost. A salvage tender in the middle belt may know the lane.")
-> target_scout_shoal__after

=== target_scout_shoal__plot_clean ===
[STUB] Three hauler logs, all lost on this lane, put their last positions in a line, and ten of the eleven beacons sit exactly where wrecks should be. The eleventh sits in clean space. The plot goes to the master as a drawn chart, and by the next watch two other masters have copied it onto their own boards.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1: your chart names the false beacon and other masters copy it.")
-> target_scout_shoal__after

=== target_scout_shoal__plot_cost ===
[STUB] The logs agree on nine beacons and argue over two, and the plot takes most of a shift to settle. Though she still takes the chart, the master files a complaint about the delay with the Compact’s traffic desk. The wrong beacon is named. The lost time is not forgiven.
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Credits +500, Strain +1: the chart is delivered late and a complaint is filed with the Compact.")
-> target_scout_shoal__after

=== target_scout_shoal__plot_fail ===
[STUB] The logs disagree about where the lane’s second marker was, and the chart drawn from them puts a beacon in open space. Spotting it, the master says nothing kind and sends her haulers back to the third marker. A keeper’s tender working the middle belt keeps newer records, and she gives you its hail words.
~ add("Strain", 1)
~ note("cost", "[STUB] Strain +1: the chart is rejected. A keeper’s tender in the middle belt keeps newer records.")
-> target_scout_shoal__after

=== target_scout_shoal__ask_clean ===
[STUB] A salvage cutter slides alongside, and its skipper passes a flask across the gap, still warm through its wrapping. She names the beacon her crew never tows past, because its light has never once gone dark. She will take no credits, only a promise to run in company next time. The convoy master takes the warning and the line.
~ add("Credits", 1000)
~ note("gain", "[STUB] Credits +1,000: the false beacon is named and the convoy master pays for the line.")
-> target_scout_shoal__after

=== target_scout_shoal__ask_cost ===
[STUB] The skipper of a passing cutter names the beacon her crew avoids, but only for a price, and she counts it out loud against the flask in her hand. Distant hab work lights flicker across her cockpit while the price is agreed. The warning is good, and the master is told exactly what it cost.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000: the false beacon is named, at the skipper’s price.")
-> target_scout_shoal__after

=== target_scout_shoal__ask_fail ===
[STUB] The cutter’s skipper will not answer a stranger on an open channel, and says so, politely. Her hull slides back into the belt. Patience runs out on a lane that answers nobody. The skipper leaves one thing behind: the hail words of a hab desk, which she says will answer questions she will not.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500: a day is lost. A hab desk may answer what the skipper would not.")
-> target_scout_shoal__after

=== target_scout_shoal__after ===
[STUB] The beacons go on looping their last calls behind the convoy. The ledger card follows. # summary
-> scene_end
