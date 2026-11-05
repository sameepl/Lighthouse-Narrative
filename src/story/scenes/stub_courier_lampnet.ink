// @content {"id":"stub_courier_lampnet","location":"docs/canon/locations/corda-reach-lamp-net.md","state_nouns":["case","lane","parts"]}
=== stub_courier_lampnet_scene ===
[STUB] At the lamp net marker, your ship's captain has a sealed case of lamp parts bound for the keepers' tender. A hull's steady running lights hang a hull-length off. The tender cannot hold its schedule; a missed delivery leaves the lamps hungry and your crew carrying the blame. The watcher matches every shift.
-> stub_courier_lampnet__menu

=== stub_courier_lampnet__menu ===
+ [\[STUB\] Fly the case in on a slow arc #hint:\[STUB\] Pilot / Astrogation]
    -> roll("Pilot,Astrogation", 8, "", -> stub_courier_lampnet__a1_clean, -> stub_courier_lampnet__a1_cost, -> stub_courier_lampnet__a1_fail)
+ [\[STUB\] Hail the watching hull and ask its business #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_courier_lampnet__a2_clean, -> stub_courier_lampnet__a2_cost, -> stub_courier_lampnet__a2_fail)
+ [\[STUB\] Pass the case by a relay buoy #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> stub_courier_lampnet__a3_clean, -> stub_courier_lampnet__a3_cost, -> stub_courier_lampnet__a3_fail)

=== stub_courier_lampnet__a1_clean ===
[STUB] The keepers' tender catches the case at the end of the long curve, with its departure count still running. Its captain checks the parts and transfers fifteen hundred credits to your crew. A payment receipt flashes aboard. Behind it, a grey chart still fails to show where anything is.
~ add("Credits", 1500)
~ note("gain", "[STUB] Credits +1,500")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a1_cost ===
[STUB] Fuel burns through the long curve while the watching vessel keeps the same distance from your ship. The tender takes the lamp parts before its departure count expires. Its captain sends back the empty carrying sling. Five hundred credits leave your crew's account for the extra fuel, and the supplier's invoice shows the debit.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a1_fail ===
[STUB] The watching hull cuts across the curve, forcing the tender to depart before it can receive the parts. A thousand credits pass from your crew to its captain for the missed schedule. The departure board advances. A recovery instruction names the lamp net marker, where the tender will collect the case on its return pass.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a2_clean ===
[STUB] The watching captain keeps the channel short, identifies the vessel's business as observation, and gives the tender room to receive the case. The parts arrive before departure. Afterwards, the captain broadcasts to other crews that yours kept its nerve under scrutiny. Your ship's name travels with that account.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a2_cost ===
[STUB] An answer comes back with a thousand-credit charge attached: the vessel is watching traffic through the net. Payment from your crew reaches the captain, and the recorded reply arrives with the debit acknowledged. The channel closes promptly. Beyond the hull, the tender receives the lamp parts before its scheduled departure.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a2_fail ===
[STUB] A comm voice answers before it is asked, drowning out the tender's receiving instructions with an unsolicited transmission. The transfer is called off. Five hundred credits from your crew reach its captain for the ruined run, and a reset bill arrives. The replacement instructions name the tender's receiving catcher for another delivery attempt on its return pass.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a3_clean ===
[STUB] The relay buoy carries the case behind the tender's hull while the observer holds its line on your ship. The receiving captain signs for the parts and pays your crew a thousand credits. A delivery voucher returns. The watcher gets no sight of the transfer, and the tender departs on schedule.
~ add("Credits", 1000)
~ note("gain", "[STUB] Credits +1,000")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a3_cost ===
[STUB] The buoy releases the parts into the tender's catcher, then strikes the receiving frame hard enough to split its casing. The captain dislikes seeing the same lane logged twice. One entry now records wreckage. A replacement buoy costs your crew fifteen hundred credits while the lamp shipment leaves aboard the tender.
~ add("Credits", -1500)
~ note("cost", "[STUB] Credits -1,500")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__a3_fail ===
[STUB] The relay buoy loses power with the case still attached, leaving both drifting beyond the receiving catcher. Delivery is called off. Recovery costs your crew five hundred credits, and the salvage hook brings the load back intact. The tender's captain offers a direct transfer alongside its hull on the return pass.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_courier_lampnet__after

=== stub_courier_lampnet__after ===
[STUB] Your ship is at the lamp net marker. The ledger card follows. # summary
-> scene_end
