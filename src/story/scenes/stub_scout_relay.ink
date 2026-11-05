// @content {"id":"stub_scout_relay","location":"docs/canon/locations/shoal-east-relay.md","state_nouns":["queue","header","lane"]}
=== stub_scout_relay_scene ===
[STUB] At Shoal East Relay, the relay dish points back the way your ship came. A waiting hauler master wants the missing cargo hull's lane recovered from its last messages before the next long jump. His charter depends on it. One manifest destination is redacted, and its message window closes before your ship can arrive; a wrong lane sends your crew astray and his charter elsewhere.
-> stub_scout_relay__menu

=== stub_scout_relay__menu ===
+ [\[STUB\] Read the relay's whole message queue #hint:\[STUB\] Electronics / Recon]
    -> roll("Electronics,Recon", 8, "", -> stub_scout_relay__a1_clean, -> stub_scout_relay__a1_cost, -> stub_scout_relay__a1_fail)
+ [\[STUB\] Ask the waiting master what he saw #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_scout_relay__a2_clean, -> stub_scout_relay__a2_cost, -> stub_scout_relay__a2_fail)
+ [\[STUB\] Plot the hull's likely lane from its burn #hint:\[STUB\] Astrogation / Pilot]
    -> roll("Astrogation,Pilot", 8, "", -> stub_scout_relay__a3_clean, -> stub_scout_relay__a3_cost, -> stub_scout_relay__a3_fail)

=== stub_scout_relay__a1_clean ===
[STUB] Messages arrive in thin careful bursts as the stamped headers gather into a readable sequence. The final sender's desk header identifies the lane the missing hull took, despite the redacted destination. The master checks the power gauge twice. He takes a copy of the header strip and transfers two thousand credits to your crew for the reading.
~ add("Credits", 2000)
~ note("gain", "[STUB] Credits +2,000")
-> stub_scout_relay__after

=== stub_scout_relay__a1_cost ===
[STUB] The relay's battery looks too weak to run a toaster, and its gauge drops while the final header comes through. That stamp identifies the cargo vessel's departure lane before the power dies. Two taps on the dead gauge confirm it. A replacement cell passes from the master's supplies to the relay, and your crew pays him five hundred credits for it.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_scout_relay__after

=== stub_scout_relay__a1_fail ===
[STUB] Too few entries survive in the message queue to establish which lane the missing hull took. After checking the power gauge twice, the master presents a chit for the hours his hauler lost waiting. Your crew pays five hundred credits. He offers another route: bring the surviving departure timestamp to him, and he can compare it with his burn chart.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_scout_relay__after

=== stub_scout_relay__a2_clean ===
[STUB] Beside a relay no bigger than a small boat, the waiting master separates what he witnessed from what other ships claimed. He will not repeat a rumour. His account identifies the missing hull's lane, and he sends the message queue a recommendation telling other masters that your crew listens before it guesses. His signature goes beneath it.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1")
-> stub_scout_relay__after

=== stub_scout_relay__a2_cost ===
[STUB] The master puts aside an unsigned rumour and produces his own departure record, with the freighter's lane written beside its time. He names his price: one thousand credits. Your crew's payment reaches him, and he hands over the record for the favour. The redacted destination no longer prevents a lane choice before the long jump.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_scout_relay__after

=== stub_scout_relay__a2_fail ===
[STUB] An unverified account earns only a shake of the master's head; he will not guess which lane the cargo hull followed. He counts five hundred credits from your crew against the wasted wait. His receipt names the delay. For firmer evidence, he points to the queued messages, where sender's desk headers can establish a departure sequence without repeating rumours.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_scout_relay__after

=== stub_scout_relay__a3_clean ===
[STUB] Across his burn chart, the master lays a copy of the lane plot calculated from the missing hull's departure. Both tracks meet on the same lane. He circles the match and transfers one thousand credits to your crew for the work. The marked chart supplies a route before the long jump, even with the manifest destination blacked out.
~ add("Credits", 1000)
~ note("gain", "[STUB] Credits +1,000")
-> stub_scout_relay__after

=== stub_scout_relay__a3_cost ===
[STUB] Fuel readings from a checking jump settle the uncertain part of the burn calculation and identify the departed freighter's lane. The hauler's master has his own chart. He marks the confirmed track on it while your ship's account records fifteen hundred credits spent on the jump of fuel used to check the plot.
~ add("Credits", -1500)
~ note("cost", "[STUB] Credits -1,500")
-> stub_scout_relay__after

=== stub_scout_relay__a3_fail ===
[STUB] The checking burn ends with the predicted track outside the cargo ship's possible departure path. Fuel worth one thousand credits is gone. On his own chart, the master crosses out that track, leaving the sought lane unidentified. He points your crew toward the queued transmissions: their stamped sender headers offer a specific way to rebuild the departure order.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_scout_relay__after

=== stub_scout_relay__after ===
[STUB] Your ship is at Shoal East Relay. The ledger card follows. # summary
-> scene_end
