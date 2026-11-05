// @content {"id":"stub_standoff_lane","location":"docs/canon/locations/hearthline-market.md","state_nouns":["pallet","tag","lane"]}
=== stub_standoff_lane_scene ===
[STUB] Onions fry somewhere above the Ring Two food stalls in Hearthline, the market, while a loader foreman guards a pallet of crates across the walking lane. He wants someone to move it before off-shift crowds arrive. A hire steps across: receiving is closed to visitors. Stallholders face a lost evening and an Exchange closure notice. The crowd is coming.
-> stub_standoff_lane__menu

=== stub_standoff_lane__menu ===
+ [\[STUB\] Offer your crew to shift the pallet #hint:\[STUB\] Leadership / Tactics]
    -> roll("Leadership,Tactics", 8, "", -> stub_standoff_lane__a1_clean, -> stub_standoff_lane__a1_cost, -> stub_standoff_lane__a1_fail)
+ [\[STUB\] Read the lane markings to both sides #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_standoff_lane__a2_clean, -> stub_standoff_lane__a2_cost, -> stub_standoff_lane__a2_fail)
+ [\[STUB\] Check the pallet tag and the notice #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> stub_standoff_lane__a3_clean, -> stub_standoff_lane__a3_cost, -> stub_standoff_lane__a3_fail)

=== stub_standoff_lane__a1_clean ===
[STUB] The foreman folds his arms, then beckons your crew through when the hire steps aside. Nearby, a loader argues with a scanner. Crates travel out of the crossing, and the stallholders wave customers forward. Both sides praise your crew to the gathering loaders; the foreman repeats their names so the newcomers hear who cleared the obstruction.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1")
-> stub_standoff_lane__after

=== stub_standoff_lane__a1_cost ===
[STUB] Arms folded, the foreman names two hired hands who can finish before the crowd arrives. Their price is five hundred credits. Your crew's payment goes onto a wage chit, and the hire lets them through receiving. The pair shoulder the crates aside while the foreman drags the empty pallet clear of the walking lane.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_standoff_lane__after

=== stub_standoff_lane__a1_fail ===
[STUB] Still folding his arms, the foreman refuses to let your crew past the hire. The pallet stays put. At the Exchange sentry post, the sentry records your crew standing inside a closed lane and sends the report to the Compact desk on Ring Two. He points to the lane notice board, where the named loader can be called back to authorize removal.
~ add("Strain", 1)
~ note("cost", "[STUB] Strain +1")
-> stub_standoff_lane__after

=== stub_standoff_lane__a2_clean ===
[STUB] Pointing at his own paperwork, the foreman finds the painted boundary matches the stallholders' claim. Warm bowls wait along the counter. He orders his loaders to pull the pallet behind that line, and the hire yields the crossing. Once customers can pass, the stallholders count one thousand credits into a settling purse for your crew.
~ add("Credits", 1000)
~ note("gain", "[STUB] Credits +1,000")
-> stub_standoff_lane__after

=== stub_standoff_lane__a2_cost ===
[STUB] His paperwork gets another jab of the foreman's finger before he orders the crates moved behind the lane markings. The argument carries. He pays your crew five hundred credits for settling the boundary, but the sentry adds a noise annotation beside your crew's name. A copy goes to the Compact desk on Ring Two as customers return.
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Credits +500; Strain +1")
-> stub_standoff_lane__after

=== stub_standoff_lane__a2_fail ===
[STUB] Paperwork raised, the foreman disputes which painted line governs the pallet, and the hire keeps receiving shut. A lane fine follows. Five hundred credits leave your crew's account, but the crates still block passage. The sentry directs the dispute to the Exchange sentry post, where the duty sentry can compare the original boundary drawing with the foreman's copy.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_standoff_lane__after

=== stub_standoff_lane__a3_clean ===
[STUB] Watching your crew's hands, the foreman holds the pallet tag beside the posted notice until their matching numbers are visible. Lids click onto bowls at the stall. The sentry orders the obstruction shifted and stamps your crew's entry as having kept the peace. His written commendation reaches Ring Two's Compact desk, while loaders reopen the pedestrian route.
~ add("Strain", -1)
~ note("gain", "[STUB] Strain -1")
-> stub_standoff_lane__after

=== stub_standoff_lane__a3_cost ===
[STUB] The foreman's gaze follows your crew's hands as the damaged tag is laid against the notice. Its destination cannot be read. A replacement tag costs your crew one thousand credits, paid before the sentry attaches it to the pallet. With receiving identified on the new label, the hire steps back and the loaders haul everything out of the walking lane.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_standoff_lane__after

=== stub_standoff_lane__a3_fail ===
[STUB] Your crew's hands stay under the foreman's watch while the sentry compares a torn tag with an outdated notice. Neither identifies authorized receiving space. Against a re-inspection invoice, the sentry collects five hundred credits from your crew, leaving the pallet where it stands. At the lane notice board, he points out the receiving supervisor's posted call number for obtaining a current instruction.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_standoff_lane__after

=== stub_standoff_lane__after ===
[STUB] Your crew is at Hearthline's Ring Two food stalls. The ledger card follows. # summary
-> scene_end
