=== slice_k1_passenger_scene ===
[STUB] The berth lights hum over a long cold bay. A transfer clerk waits beside the gate with a courier booking to a relief hab on the lane. At the berth office, a writ clerk lays a creditor’s collection writ across that booking. The gate officer keeps a hand on the closed gate. Beyond it, a fast unmarked hull scans the berth once and leaves. Nothing on the booking says why that hull came. # bg:berths
[STUB] The passenger has no cargo for your crew to sign for. The writ clerk wants either a transfer into the creditor’s custody or a reason to leave the booking alone. A crew member brings the ship’s register to the terminal. Against a pass, the screen prints a line; its holder is not displayed.
[STUB] Survey Service personnel authorisation, not revoked, one prior access.
[STUB] The transfer clerk looks at the screen, then at your crew, and says nothing. The writ clerk turns the booking so the gate officer can read it. Shelter means keeping the passenger aboard while the writ runs out. Handing them over gives the creditor the transfer. Smuggling them past the gate would be visible to the Compact watching it. The gate officer leaves the form unsigned. A crew member waits beside the terminal for the choice.
-> slice_k1_passenger__menu
=== slice_k1_passenger__menu ===
+ [\[STUB\] Shelter them aboard until the writ lapses #hint:\[STUB\] Electronics / Persuade]
    -> roll("Electronics,Persuade", 8, "", -> slice_k1_passenger__a0_clean, -> slice_k1_passenger__a0_cost, -> slice_k1_passenger__a0_fail)
+ [\[STUB\] Hand them to the writ clerk #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> slice_k1_passenger__a1_clean, -> slice_k1_passenger__a1_cost, -> slice_k1_passenger__a1_fail)
+ [\[STUB\] Smuggle them out past the gate #hint:\[STUB\] Pilot / Tactics; Pursuit +1 on any outcome]
    -> roll("Pilot,Tactics", 8, "", -> slice_k1_passenger__a2_clean, -> slice_k1_passenger__a2_cost, -> slice_k1_passenger__a2_fail)
=== slice_k1_passenger__a0_clean ===
[STUB] The crew member finds the booking’s still-valid shelter entry and shows it to the writ clerk. The clerk withdraws the objection against your ship and returns the gate copy without a complaint. Behind the crew member, the transfer clerk steps aboard. The berth office keeps the collection writ, but the gate officer accepts that it cannot interrupt this booking. Your crew leaves without another demand from the Compact.
~ temp before_strain = res("Strain")
~ add("Strain", -1)
~ note("gain", "[STUB] Scheduled: Strain -1. Applied: " + "Strain " + (res("Strain") - before_strain) + ". The writ clerk withdraws the objection against your crew.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a0_cost ===
[STUB] The writ clerk accepts a shelter entry after a crew member agrees to pay for holding the booking. The passenger crosses the gate while the gate officer watches the clerk enter a thousand-credit charge against your ship’s account. The booking stays valid until the writ lapses. The clerk stamps the payment copy before returning it; the shelter is real, but your crew carries the charge for that time.
~ temp before_credits = res("Credits")
~ add("Credits", -1000)
~ note("cost", "[STUB] Scheduled: Credits -1,000. Applied: " + "Credits " + (res("Credits") - before_credits) + ". Your crew is charged by the writ clerk for holding the booking.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a0_fail ===
[STUB] The terminal will not accept the crew member’s shelter entry. The gate officer adds your ship to the Compact’s complaint and sends the passenger to the registry counter for a fresh booking to the relief hab. The transfer clerk takes that route, carrying the unsigned copy. A berth office runner keeps your crew’s name with the rejected entry; the next conversation will begin with that complaint already on file.
~ temp before_strain = res("Strain")
~ add("Strain", 1)
~ note("cost", "[STUB] Scheduled: Strain +1. Applied: " + "Strain " + (res("Strain") - before_strain) + ". The gate officer files a complaint against your crew.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a1_clean ===
[STUB] A crew member checks the custody copy against the booking before passing it to the writ clerk. The clerk signs for the passenger and pays your crew fifteen hundred credits for completing the transfer. The transfer clerk goes through the gate beside the clerk. The gate officer returns your ship’s cleared copy. It carries a payment, and the creditor now has the passenger rather than your crew.
~ temp before_credits = res("Credits")
~ add("Credits", 1500)
~ note("gain", "[STUB] Scheduled: Credits +1,500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The writ clerk pays your crew for the transfer.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a1_cost ===
[STUB] The writ clerk signs for the passenger but disputes the crew member’s handling of the booking. Five hundred credits reach your ship’s account as the transfer clerk follows the clerk past the gate. The gate officer attaches the dispute to your crew’s Compact record. The payment is smaller than the booking promised, and the returned copy bears a complaint that your crew will have to carry onward.
~ temp before_credits = res("Credits")
~ temp before_strain = res("Strain")
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Scheduled: Credits +500, Strain +1. Applied: " + "Credits " + (res("Credits") - before_credits) + "; " + "Strain " + (res("Strain") - before_strain) + ". The writ clerk pays your crew; the gate officer records the dispute.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a1_fail ===
[STUB] The writ clerk refuses the crew member’s transfer terms and charges your ship five hundred credits for the aborted booking. The passenger is sent to the gate officer’s desk, where the clerk points out the route for a custody review. Your crew receives the cancelled booking rather than the promised payment. The transfer clerk follows the gate officer, with a desk to go to and the writ still in hand.
~ temp before_credits = res("Credits")
~ add("Credits", -500)
~ note("cost", "[STUB] Scheduled: Credits -500. Applied: " + "Credits " + (res("Credits") - before_credits) + ". The writ clerk bills your crew for the aborted booking.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a2_clean ===
[STUB] Your pilot takes the passenger out while the gate officer is still comparing the writ with the booking. At the relief hab, the transfer clerk reaches the receiving crew, who credit your ship by name for bringing them through. The berth office is left with an empty gate copy. The escape was visible: the unmarked hull’s scan and the watched departure leave your ship easier to follow.
~ temp before_renown = res("Renown")
~ temp before_pursuit = res("Pursuit")
~ add("Renown", 1)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Renown +1, Pursuit +1. Applied: " + "Renown " + (res("Renown") - before_renown) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". The receiving crew credit your ship; the watched escape exposes it.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a2_cost ===
[STUB] The pilot gets the passenger past the gate, but the receiving crew at the relief hab charge your ship five hundred credits to accept the late arrival. The transfer clerk crosses into their care with the booking still unsigned. Behind your ship, the gate officer logs the departure against the writ. The passenger is out, and your crew carries both the charge and the visible trail left by that departure.
~ temp before_credits = res("Credits")
~ temp before_pursuit = res("Pursuit")
~ add("Credits", -500)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Credits -500, Pursuit +1. Applied: " + "Credits " + (res("Credits") - before_credits) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". Your crew is charged by the receiving crew; the gate officer logs the escape.")
-> slice_k1_passenger__after
=== slice_k1_passenger__a2_fail ===
[STUB] The gate officer closes the departure before the pilot can clear it and files a Compact complaint against your crew. A crew member directs the passenger to the registry counter for the relief hab’s next booking. The transfer clerk takes the rejected copy there. Your ship has made its intention visible without carrying the passenger out; the gate log gives the watching hull a trail to follow.
~ temp before_strain = res("Strain")
~ temp before_pursuit = res("Pursuit")
~ add("Strain", 1)
~ add("Pursuit", 1)
~ note("cost", "[STUB] Scheduled: Strain +1, Pursuit +1. Applied: " + "Strain " + (res("Strain") - before_strain) + "; " + "Pursuit " + (res("Pursuit") - before_pursuit) + ". The gate officer records the complaint against your crew and exposed departure.")
-> slice_k1_passenger__after
=== slice_k1_passenger__after ===
[STUB] The berth office closes its copy of the courier booking. The gate lights keep their night setting. Your crew carries the returned paperwork onward, with the next departure still waiting to be arranged. # summary
-> scene_end
