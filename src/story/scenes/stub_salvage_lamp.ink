// @content {"id":"stub_salvage_lamp","location":"docs/canon/locations/psalter-lamp-field.md","state_nouns":["lamp","line","housing"]}
=== stub_salvage_lamp_scene ===
[STUB] At the third marker, lamps hang like a slow constellation beyond the keepers' tender. A young keeper on its arm points out a loose kept lamp disguised as a wreck beacon; its loop breathes between words. Bring it aboard without touching it while lit. Otherwise, the lost loop goes against your hull at the next tender round, and its carrier is already pulling taut.
-> stub_salvage_lamp__menu

=== stub_salvage_lamp__menu ===
+ [\[STUB\] Net the lamp with the tender's line #hint:\[STUB\] Pilot / Mechanic]
    -> roll("Pilot,Mechanic", 8, "", -> stub_salvage_lamp__a1_clean, -> stub_salvage_lamp__a1_cost, -> stub_salvage_lamp__a1_fail)
+ [\[STUB\] Wait out the loop and cut its carrier #hint:\[STUB\] Electronics / Recon]
    -> roll("Electronics,Recon", 8, "", -> stub_salvage_lamp__a2_clean, -> stub_salvage_lamp__a2_cost, -> stub_salvage_lamp__a2_fail)
+ [\[STUB\] Ask the keeper to cut it free #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_salvage_lamp__a3_clean, -> stub_salvage_lamp__a3_cost, -> stub_salvage_lamp__a3_fail)

=== stub_salvage_lamp__a1_clean ===
[STUB] A plain, ugly housing settles whole into the net as the tender's line draws tight. The keeper watches its last turn clear the arm, then lowers the cradle aboard without touching the lit lamp. She counts fifteen hundred credits into your crew's payment. The keepers pay for the whole recovery.
~ add("Credits", 1500)
~ note("gain", "[STUB] Credits +1,500")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a1_cost ===
[STUB] A kettle ticks aboard the tender while a crack spreads beneath the net's tightest knot. The lamp comes aboard still lit, with its loop audible and no hand upon it. Recovery is complete. Its keeper sets the split casing before your crew and takes five hundred credits for its repair.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a1_fail ===
[STUB] The line doubles around the arm, and the loose light swings beyond the net before its loop breaks off. A snarl stays behind. The keeper takes five hundred credits from your crew, marking the lost loop against your hull; she points to the third marker, where a keeper can attempt another recovery at the next tender round.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a2_clean ===
[STUB] The carrier falls silent between breaths, letting the lit lamp drift into a waiting basket aboard the tender. Nobody touches its housing. A flask passes to your crew, warm through its wrapping, while the keeper repeats the timing aloud; at the next marker, the keepers name your ship when describing the patience that saved the loop.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a2_cost ===
[STUB] A severed strand curls away, and the basket catches the lamp with its loop still breathing. Its watcher exhales at last. She lays a tally beside the basket and takes five hundred credits from your crew for working too close to a lit kept lamp, then draws the recovered light inside the tender.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a2_fail ===
[STUB] The carrier tears through its mounting, leaving the lamp swinging outside the basket and beyond the tender's arm. Its ruined end strikes the rail. Your crew pays the tender one thousand credits for the damaged carrier; the keeper offers her own hand to cut the guest free when it swings back past the third marker.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a3_clean ===
[STUB] “Fourth marker, all hands aboard, lamp lit, lamp lit” sounds from the recovered lamp as the keeper withdraws her blade. Her steady hand has cut the guest free, and the tender settles around its quiet recovery. The light is aboard. A payment chit brings your crew one thousand credits from the tender.
~ add("Credits", 1000)
~ note("gain", "[STUB] Credits +1,000")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a3_cost ===
[STUB] An hour passes before the keeper finds the gap she needs, refusing every offered stranger's hand near the lamp. Her blade finally parts the attachment. The light comes aboard untouched and lit, but she records the lost hour beside her working time, and takes one thousand credits from your crew for the tender.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__a3_fail ===
[STUB] Her blade arrives after the attachment snaps tight, throwing the lamp beyond her reach and leaving an empty hook aboard. The young woman lowers her arm. A five-hundred-credit fee passes from your crew to the tender because her hand was late; she offers a second cutting attempt from the tender's arm on the next round.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_salvage_lamp__after

=== stub_salvage_lamp__after ===
[STUB] Your ship is at the third marker beside the keepers' tender. The ledger card follows. # summary
-> scene_end
