// @content {"id":"stub_distress_dark","location":"docs/canon/locations/dark-stretch.md","state_nouns":["call","emitter","lamp"]}
=== stub_distress_dark_scene ===
[STUB] In the Dark Stretch, dimmed lamps mark the distance ahead of the keepers' tender. Its captain needs a decision about closing on a distress call that answers every challenge with the same words: Say again your request. Hold station. Time is burning. A false call exposes your crew; a real one leaves a lamp starving while the answer repeats.
-> stub_distress_dark__menu

=== stub_distress_dark__menu ===
+ [\[STUB\] Send the challenge phrase again, slowly #hint:\[STUB\] Tactics / Recon]
    -> roll("Tactics,Recon", 8, "", -> stub_distress_dark__a1_clean, -> stub_distress_dark__a1_cost, -> stub_distress_dark__a1_fail)
+ [\[STUB\] Cut the emitter quietly before closing #hint:\[STUB\] Electronics / Mechanic]
    -> roll("Electronics,Mechanic", 8, "", -> stub_distress_dark__a2_clean, -> stub_distress_dark__a2_cost, -> stub_distress_dark__a2_fail)
+ [\[STUB\] Ask the captain to hold the tender back #hint:\[STUB\] Leadership / Persuade]
    -> roll("Leadership,Persuade", 8, "", -> stub_distress_dark__a3_clean, -> stub_distress_dark__a3_cost, -> stub_distress_dark__a3_fail)

=== stub_distress_dark__a1_clean ===
[STUB] The captain keeps the tender moving at one speed while a sensor operator compares each answer against the challenge. The repetition exposes a recording. A separate live response gives the captain grounds to close, and the keepers tell other tenders that your crew tested the call before anybody moved toward it.
~ add("Renown", 1)
~ note("gain", "[STUB] Renown +1")
-> stub_distress_dark__after

=== stub_distress_dark__a1_cost ===
[STUB] A live voice finally breaks through the repeated instructions and supplies the missing answer to the challenge. The tender turns toward it. Before closing, its captain hands your crew a lamp-time bill for five hundred credits, then marks that amount paid against the minutes spent waiting for the reply.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_distress_dark__after

=== stub_distress_dark__a1_fail ===
[STUB] The answer repeats with exactly the same clipped pause, giving the sensors crew no way to distinguish distress from bait. Challenge traffic stops. Your crew pays one thousand credits to the captain for the time lost; a passive examination of the second emitter is the alternative offered before any closer movement.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_distress_dark__after

=== stub_distress_dark__a2_clean ===
[STUB] The slab wakes, fires, and goes quiet when its antenna parts, leaving the false transmission exposed on a sensor display. No shot follows. With the signal cleared before the tender closes, the keepers transfer fifteen hundred credits to your crew for removing the false emitter without drawing gunfire.
~ add("Credits", 1500)
~ note("gain", "[STUB] Credits +1,500")
-> stub_distress_dark__after

=== stub_distress_dark__a2_cost ===
[STUB] An emitter's sub-second burst reaches your ship just before the antenna is cut, burning a black line across its own antenna coupling. The false call stops. With that signal silenced, the captain can close without it drawing the tender onward, while your crew pays one thousand credits to replace the damaged coupling.
~ add("Credits", -1000)
~ note("cost", "[STUB] Credits -1,000")
-> stub_distress_dark__after

=== stub_distress_dark__a2_fail ===
[STUB] The first transmission cuts out, but the second emitter wakes before an operator can confirm silence. Its signal prevents closing. A payment of five hundred credits passes from your crew to the tender for the lamp it starved; the captain offers another route, tracing that new signal while keeping the hull clear.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_distress_dark__after

=== stub_distress_dark__a3_clean ===
[STUB] Holding clear gives the sensor team time to separate the repeating transmission from a live request for help. A clear bearing appears. Along that bearing, the captain orders a cautious closing course, then pays your crew one thousand credits for the safe passage that the requested wait allowed the tender to find.
~ add("Credits", 1000)
~ note("gain", "[STUB] Credits +1,000")
-> stub_distress_dark__after

=== stub_distress_dark__a3_cost ===
[STUB] A pencil mark on the captain's chart fixes the distance the tender will keep while the call is checked. The hull stays back. Five hundred credits from your crew cover the captain's charge for holding off, buying the requested separation while the repeated message continues to occupy the open channel.
~ add("Credits", -500)
~ note("cost", "[STUB] Credits -500")
-> stub_distress_dark__after

=== stub_distress_dark__a3_fail ===
[STUB] The captain refuses any further waiting as the lamp's reported output drops again. The bow begins to turn. For the delay already incurred, your crew hands the captain fifteen hundred credits; direct contact through the sensors crew is now offered, allowing questions to reach the caller while the tender moves.
~ add("Credits", -1500)
~ note("cost", "[STUB] Credits -1,500")
-> stub_distress_dark__after

=== stub_distress_dark__after ===
[STUB] Your ship is in the Dark Stretch beside the keepers' tender. The ledger card follows. # summary
-> scene_end
