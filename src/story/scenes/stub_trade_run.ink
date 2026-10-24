// [STUB] Replace all placeholder writing, hints, checks and consequences before publishing.
// Never write Marcus's speech, thoughts or actions. All local knots use the scene ID prefix.
=== stub_trade_run_scene ===
[STUB] The commercial dock hums with the low vibration of heavy cargo lifts and the sharp smell of ozone. A thick stack of stamped manifests sits on the central counter, waiting for a signature. Three empty berth slots glow softly in the background, each marked with a distinct color. The port staff stand behind the glass, their faces neutral and their movements precise. The air is thick with the scent of machine oil and damp concrete. # bg:hall
-> stub_trade_run__menu

=== stub_trade_run__menu ===
+ [\[STUB\] parley approach #hint:\[STUB\] Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "", -> stub_trade_run__parley_clean, -> stub_trade_run__parley_cost, -> stub_trade_run__parley_fail)
+ [\[STUB\] coordinate approach #hint:\[STUB\] Leadership / Tactics]
    -> roll("Leadership,Tactics", 8, "", -> stub_trade_run__coordinate_clean, -> stub_trade_run__coordinate_cost, -> stub_trade_run__coordinate_fail)
+ [\[STUB\] inspect approach #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> stub_trade_run__inspect_clean, -> stub_trade_run__inspect_cost, -> stub_trade_run__inspect_fail)

=== stub_trade_run__parley_clean ===
[STUB] The lead clerk nods slowly, her eyes scanning the document with a calm and steady gaze. The heavy metal seal on the crate is lifted and replaced with a fresh one. A digital stamp flashes green on the counter, confirming that the quoted terms remain available. The berth slot opens with a soft hiss, revealing a clean and empty space. The staff member steps back, allowing the cargo to move forward without delay.
~ note("gain", "[STUB] Parley clean consequence: The clerk grants a priority berth slot and a fresh seal.")
-> stub_trade_run__after

=== stub_trade_run__parley_cost ===
[STUB] The clerk shakes her head, her expression remaining flat and unchanging throughout the interaction. A secondary fee is quoted on the screen, requiring a manual confirmation to proceed. The cargo seal is checked twice, the metal clinking softly against the crate. The berth slot remains closed for a moment, the lights flickering in the distance. The staff member waits patiently, her hands resting on the counter.
~ note("cost", "[STUB] Parley cost consequence: A secondary fee is quoted and the seal is re-checked.")
-> stub_trade_run__after

=== stub_trade_run__parley_fail ===
[STUB] The clerk’s face hardens, and she turns away to consult a private terminal. The cargo seal is locked in place, the metal cold and unyielding. The berth slot stays dark, the surrounding area growing quiet and still. A warning light blinks red on the counter, signaling a temporary hold. The staff member remains silent, her posture rigid and unyielding. A staffed review desk remains available beside the next berth.
~ note("cost", "[STUB] Parley fail consequence: The seal is locked and the berth slot stays dark.")
-> stub_trade_run__after

=== stub_trade_run__coordinate_clean ===
[STUB] The dockmaster steps forward, his voice steady and clear as he issues the orders. The cargo lifts align perfectly, the heavy crates sliding into place with precision. The berth slot opens smoothly, the lights shifting from red to a bright green. The paperwork is stamped and filed, the ink drying quickly on the page. The staff members move in unison, their movements efficient and coordinated.
~ note("gain", "[STUB] Coordinate clean consequence: The dockmaster aligns the lifts and opens the berth slot.")
-> stub_trade_run__after

=== stub_trade_run__coordinate_cost ===
[STUB] The dockmaster frowns, his eyes narrowing as he reviews the schedule again. The cargo lifts pause, the heavy crates hanging in the air. The berth slot opens partially, the lights flickering between red and yellow. The paperwork is held up, the stamp waiting for a final decision. The staff members shift their weight, their movements slightly slower than before.
~ note("cost", "[STUB] Coordinate cost consequence: The lifts pause and the berth slot opens partially.")
-> stub_trade_run__after

=== stub_trade_run__coordinate_fail ===
[STUB] The dockmaster’s voice drops, his tone becoming sharp and commanding. The cargo lifts stop completely, the heavy crates frozen in place. The berth slot remains closed, the lights staying red and unchanging. The paperwork is set aside, the stamp unused and silent. The staff members stand still, their attention focused on the dockmaster. A later loading window remains available through the review desk.
~ note("cost", "[STUB] Coordinate fail consequence: The lifts stop and the berth slot remains closed.")
-> stub_trade_run__after

=== stub_trade_run__inspect_clean ===
[STUB] The technician runs a scanner over the cargo seal, the device beeping softly. The electronic lock releases with a click, the metal parts separating cleanly. The berth slot opens, the sensors confirming the cargo is safe and secure. The paperwork is updated, the digital log reflecting the successful inspection. The staff member nods, her expression calm and satisfied.
~ note("gain", "[STUB] Inspect clean consequence: The scanner confirms the seal is safe and the berth opens.")
-> stub_trade_run__after

=== stub_trade_run__inspect_cost ===
[STUB] The technician frowns, his eyes scanning the seal with a focused intensity. The electronic lock hesitates, the metal parts grinding slightly. The berth slot opens slowly, the sensors blinking in uncertainty. The paperwork is flagged, the digital log showing a minor discrepancy. The staff member waits, her hands resting on the counter.
~ note("cost", "[STUB] Inspect cost consequence: The lock hesitates and the paperwork is flagged.")
-> stub_trade_run__after

=== stub_trade_run__inspect_fail ===
[STUB] The technician’s scanner beeps rapidly, the device flashing a red warning. The electronic lock engages fully, the metal parts locking tight. The berth slot stays closed, the sensors remaining inactive and dark. The paperwork is rejected, the digital log showing a critical error. The staff member steps back, her expression serious and concerned. A separate repair queue offers another route through the paperwork.
~ note("cost", "[STUB] Inspect fail consequence: The lock engages and the paperwork is rejected.")
-> stub_trade_run__after

=== stub_trade_run__after ===
[STUB] The port board records the available berth or the reason for delay, leaving each quoted term visible beside its reference number. Staff return to the counter while cargo remains under the existing seals. No payment or departure is assumed. The available review desk and later loading window leave room for the next decision. # summary
-> scene_end
