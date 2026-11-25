// @content {"id":"stub_trade_convoy","location":"docs/canon/locations/the-shoal.md","state_nouns":["seals","order","string"]}
=== stub_trade_convoy_scene ===
[STUB] In the Shoal, amber beacons blink on separate rhythms around four haulers waiting short of the third marker. The lead pilot asks whether the string should turn back. The air seals aboard are already paid for by a hab; a retreat means its order lapses and your crew keeps them. Another pilot starts counting down.
-> stub_trade_convoy__menu

=== stub_trade_convoy__menu ===
+ [\[STUB\] Fly at the string's tail #hint:\[STUB\] Pilot / Tactics]
    -> roll("Pilot,Tactics", 8, "", -> stub_trade_convoy__a1_clean, -> stub_trade_convoy__a1_cost, -> stub_trade_convoy__a1_fail)
+ [\[STUB\] Read the hab's paid order aloud #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_trade_convoy__a2_clean, -> stub_trade_convoy__a2_cost, -> stub_trade_convoy__a2_fail)
+ [\[STUB\] Check the string's challenge words #hint:\[STUB\] Electronics / Recon]
    -> roll("Electronics,Recon", 8, "", -> stub_trade_convoy__a3_clean, -> stub_trade_convoy__a3_cost, -> stub_trade_convoy__a3_fail)

=== stub_trade_convoy__a1_clean ===
[STUB] Four hulls pass the marker, with your ship holding the rear position while their pilots count one another over the channel. Distant hab work lights catch each hauler as it reaches the delivery point. All four arrive intact. Receipt of the air seals brings a transfer from the hab: two thousand credits for your crew's escort bonus.
~ add("Credits", 2000)
~ note("gain", "[STUB] Credits +2,000")
-> stub_trade_convoy__after

=== stub_trade_convoy__a1_cost ===
[STUB] A hauler clips a mooring line beyond the marker, snapping its attachment against the hull. Its pilot holds position while three companions gather around it, and all four continue together after the line is replaced. The seals reach the hab. The repair invoice names your crew, and one thousand credits pays it.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_trade_convoy__after

=== stub_trade_convoy__a1_fail ===
[STUB] Beacon carriers hiss across the channel as the rear hauler breaks formation and the remaining hulls scatter. Their delivery run stops. A report reaches the Compact traffic desk, where an officer records the delay against your crew. That officer offers to assemble the four pilots at the third marker for another departure.
~ add("Strain", 1)
~ note("cost", "[STUB] Strain +1")
-> stub_trade_convoy__after

=== stub_trade_convoy__a2_clean ===
[STUB] A request for the paid order comes slowly from the lead pilot, who repeats its delivery terms to his companions. Their countdown stops. All four haulers pass the marker and deliver the seals, while their pilots send accounts of your crew's help to every hab they call afterward. Replies arrive asking which ship kept them moving.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1")
-> stub_trade_convoy__after

=== stub_trade_convoy__a2_cost ===
[STUB] Hearing the order's payment record brings four pilots back onto the channel, and the leading hauler resumes its course. The delivery reaches the hab late. From its traffic desk comes your crew's five-hundred-credit fee, followed by confirmation that the string's complaint reached the Compact traffic desk. An officer enters your ship beside the late-arrival report.
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Credits +500; Strain +1")
-> stub_trade_convoy__after

=== stub_trade_convoy__a2_fail ===
[STUB] After hearing the order, one pilot asks whether its payment will cover another frightened hour beyond the marker. Three refusals answer him. The four-hauler string turns back toward the third marker, charging your crew five hundred credits for its fuel. At the hab traffic desk, a clerk offers to discuss a replacement order once those vessels regroup.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_trade_convoy__after

=== stub_trade_convoy__a3_clean ===
[STUB] Overlapping old voices loop from wreck beacons while each hauler answers with its agreed challenge words. Four matching replies settle their pilots. The convoy continues beyond the marker and delivers the seals; a Compact traffic desk officer notes that your crew held it together and removes an outstanding adverse entry beside your ship.
~ add("Strain", -1)
~ note("gain", "[STUB] Strain -1")
-> stub_trade_convoy__after

=== stub_trade_convoy__a3_cost ===
[STUB] One hauler answers with challenge words that its companions no longer recognize, and its pilot refuses another open-channel exchange. A private re-key settles it. Your crew pays that hauler five hundred credits for the work, after which four matching replies bring the vessels beyond the marker and onward to deliver the seals.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_trade_convoy__after

=== stub_trade_convoy__a3_fail ===
[STUB] Two pilots give conflicting challenge words, and their lead cuts the shared channel before either will repeat them. The departure breaks down. A Compact traffic desk complaint names your crew, adding another adverse entry beside your ship. From the hab traffic desk comes an offer of a direct confirmation call to rebuild the string's agreed words.
~ add("Strain", 1)
~ note("cost", "[STUB] Strain +1")
-> stub_trade_convoy__after

=== stub_trade_convoy__after ===
[STUB] Your ship is in the Shoal. The ledger card follows. # summary
-> scene_end
