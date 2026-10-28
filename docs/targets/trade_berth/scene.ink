// TARGET (reference quality, not shipped): [STUB] The Fee Sheet. See docs/targets/README.md.
// Marcus is never written for. All local knots use the scene ID prefix.
=== target_trade_berth_scene ===
[STUB] The long bay is cold enough to show your breath. The chief of the berth crew stands over forty crates of water filters with a fee sheet in one hand, and past the gate the buyer’s tug idles, its crew watching the clock. Your filing is held at the berth office for a second countersign. Miss this window and the buyer walks. # bg:hall
-> target_trade_berth__menu

=== target_trade_berth__menu ===
+ [\[STUB\] Haggle the berth fee down #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> target_trade_berth__haggle_clean, -> target_trade_berth__haggle_cost, -> target_trade_berth__haggle_fail)
+ [\[STUB\] Reshuffle the unloading order #hint:\[STUB\] Leadership / Tactics]
    -> roll("Leadership,Tactics", 8, "", -> target_trade_berth__reorder_clean, -> target_trade_berth__reorder_cost, -> target_trade_berth__reorder_fail)
+ [\[STUB\] Check the crate seals for a fault #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> target_trade_berth__seals_clean, -> target_trade_berth__seals_cost, -> target_trade_berth__seals_fail)

=== target_trade_berth__haggle_clean ===
[STUB] The chief reads your offer twice. Then she strikes a line through the fee and initials it. The tug swings in, and the loose third plate clatters under its tow-bar as the first crate lifts. By the time the countersign comes down from upstairs, the buyer has signed for all forty, and a clerk counts the credits onto the sheet.
~ add("Credits", 1500)
~ note("gain", "[STUB] Credits +1,500: the fee is struck and the buyer pays in full.")
-> target_trade_berth__after

=== target_trade_berth__haggle_cost ===
[STUB] The fee is halved, but no crate moves without the countersign, and the chief’s runner goes up the spoke with the sheet. The berth lights hum while the tug waits at the gate. The paper returns late, stamped against your name. Pay comes, minus a tenth for the delay, and the buyer tells the whole queue why.
~ add("Credits", 1000)
~ add("Strain", 1)
~ note("cost", "[STUB] Credits +1,000, Strain +1: the delivery is made, and the berth office logs the late filing against you.")
-> target_trade_berth__after

=== target_trade_berth__haggle_fail ===
[STUB] Back goes the full fee. She shakes her head. The crates stay on the deck, and the tug drifts out of its slot to make room for a hull with its paper in order. You are handed a hold ticket for the next berth window, a day away, and a bill for the hours already used.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500: no delivery today. The hold ticket is good for the next berth window.")
-> target_trade_berth__after

=== target_trade_berth__reorder_clean ===
[STUB] The new order goes up on the board, and two lifts run at once, heavy crates first. A work-light clamped to the nearest crate swings with every hoist. The stack shrinks faster than the chief’s sheet said it could, and the tug crew is cheering from the gate before the last crate clears. A bonus follows for the early delivery.
~ add("Credits", 2000)
~ note("gain", "[STUB] Credits +2,000: the crates clear early and the buyer pays a bonus.")
-> target_trade_berth__after

=== target_trade_berth__reorder_cost ===
[STUB] Up on the board goes the new order, and the loader crews grumble about the extra lift. Two crates swing wide on the first pass and crack a corner against the frame. A clerk writes it up. The rest go through. Thirty-eight crates are paid for, not forty, and word of the noise reaches upstairs.
~ add("Credits", 500)
~ add("Strain", 1)
~ note("cost", "[STUB] Credits +500, Strain +1: two crates are lost to damage and the berth office takes note.")
-> target_trade_berth__after

=== target_trade_berth__reorder_fail ===
[STUB] Two orders now contradict each other, and the loaders stand between them, doing neither. A crate slips its strap and lands hard, spilling filters across the plating. The buyer’s tug leaves without waiting. The repair bay will sort the filters for resale at the next window, for a fee.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000: the buyer is gone. The repair bay will sort the spilled stock for resale.")
-> target_trade_berth__after

=== target_trade_berth__seals_clean ===
[STUB] A smell of fresh sealant hangs over the third pallet, and a hairline gap shows in the bead along one crate. It is the buyer’s own packing, not yours. It goes into the chief’s log, the tug crew thanks you for finding it before a vacuum test did, and upstairs writes your ship down as one that reads its cargo.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1: you caught the buyer’s bad seal and the berth office remembers.")
-> target_trade_berth__after

=== target_trade_berth__seals_cost ===
[STUB] A sealant bead has failed on one of your own crates, and the chief will not clear it as it is. The runner brings a tube and a patch kit, and the repair eats the better part of an hour. The tug waits. Once the bead cures the crates move, but the buyer shaves the price for the wait.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000: the crates are delivered after a repair, at a reduced price.")
-> target_trade_berth__after

=== target_trade_berth__seals_fail ===
[STUB] Before you do, the chief finds the flaw and writes a safety-lock citation against your registration. The crates stay put for the filing. The inspector will see the repaired crate at the next berth window, and until then your ship’s name sits on a short list upstairs.
~ add("Strain", 1)
~ note("cost", "[STUB] Strain +1: a citation is filed against your registration. The inspector will see the crate at the next window.")
-> target_trade_berth__after

=== target_trade_berth__after ===
[STUB] The night lamps stay on and the chief moves on to the next hull in her queue. The ledger card follows. # summary
-> scene_end
