// The Written Clause. A conversation at the Compact's hall at Hearthline.
// Marcus is never written for: narrate the world and the NPCs, never his speech, thoughts or actions.

VAR priya_read = false

=== written_clause ===
Renata lays the charter on the table between you and does not push it across. # bg:hall
“Three pages,” she says. “Berth, standing, arms. Hull by hull, with hours.” She taps the third page. “This is the one you want. And the one that costs.”
Priya reads upside down, lips moving. She sets two fingers on a clause and says nothing.
“Your people carry peace-bonded weapons on the ring. Fine. Your ships fire only in defence of life, ship and traffic. Also fine. But I will not write that down for you, because the moment it is written, I must write it for everyone.” Renata counts on her fingers. “The merchants. The tugs. The visiting navy. Every hull. And they have asked, Captain. Many times.”
Halvorsen looks at the viewport, at your ships, then at you.
Your crews already defend Hearthline’s traffic, yet you hold only an informal understanding. A hijack on the lanes could land them in an after-action review with nothing on paper to stand behind.
-> menu

=== offer_stands ===
The charter lies where Renata left it, three pages square to the table’s edge. Priya’s pencilled marks run down the margins now.
“One cycle,” Renata says. “The offer stands until then. I do not extend.”
-> menu

=== menu ===
+ [Press for parity #hint:Persuade / Diplomat]
    -> roll("Persuade,Diplomat", 8, "priya_read", -> parity_clean, -> parity_cost, -> parity_fail)
+ [Ask for protected-escort status #hint:Leadership / Tactics]
    -> roll("Leadership,Tactics", 8, "priya_read", -> escort_clean, -> escort_cost, -> escort_fail)
+ {not priya_read} [Take the pages away and let Priya read them #hint:No roll]
    -> priya_report
+ [Decline for now]
    -> unsigned

// ---- Priya reads the pages (no roll) -----------------------------------------------
=== priya_report ===
Priya brings the pages back before the cycle turns, her notes in small tight script down every margin.
“It is what Renata said, and no worse,” she says. “The arms clause binds the Compact to the same words for every hull, so push there and it reads as a precedent, not a favour. The escort clause is narrower, with hours and a reporting duty. But I know where she has room to move. I have marked it.”
+ [Return to the hall]
    ~ priya_read = true
    ~ note("gain", "Priya’s reading gives you +1 on either approach.")
    ~ note("watch", "Renata notes the delay. A rival hull may take the berth you wanted.")
    -> offer_stands

=== unsigned ===
Renata gathers the charter without comment and squares it against the table’s edge. What stays unwritten stays unwritten.
+ [Continue]
    ~ note("watch", "Nothing is written down. Your crews remain covered only by an informal understanding.")
    -> after

// ---- Approach 1: press for parity --------------------------------------------------
=== parity_clean ===
Renata is silent for a long beat. Then she draws the third page toward her and uncaps a pen. “For every hull,” she says, writing. “On the ring and the lanes. In ink.”
Priya lets out a breath she has clearly been holding.
~ note("gain", "The self-defence clause is written for every hull on Compact lanes, yours included.")
~ note("gain", "Merchants and tug crews trust your alliance more.")
-> after

=== parity_cost ===
Renata is silent for a long beat. Then she draws the third page toward her and uncaps a pen. “For every hull,” she says, writing. “On the ring and the lanes. In ink.”
Priya lets out a breath she has clearly been holding.
Halvorsen’s pen is moving too. Four hulls, one captain, written down in a column. “The Compact will want to know how large you mean to become,” he says, to no one in particular.
~ note("gain", "The self-defence clause is written for every hull on Compact lanes, yours included.")
~ note("gain", "Merchants and tug crews trust your alliance more.")
~ note("cost", "The Compact grows wary of your fleet’s size. Strain with the Compact +1.")
~ add("Strain", 1)
-> after

=== parity_fail ===
Renata squares the pages and slides one stack, then the other, toward Priya. “No. Berth and standing. Not arms.” She does not raise her voice. “I will remember that you asked for the whole table.”
~ note("cost", "You leave with the berth and standing pages only. No arms clause.")
~ note("cost", "Renata remembers you pushed. Strain with the Compact +1.")
~ add("Strain", 1)
-> after

// ---- Approach 2: protected-escort status -------------------------------------------
=== escort_clean ===
Renata turns the third page over and writes on the back, slowly, counting as she goes. “Escorts of record. Defence of other hulls on Compact lanes. Priority on contested jobs.” She caps the pen. “In return: hours, owed. And you report to this room, on a schedule, for as long as the clause stands.”
~ note("gain", "Explicit protection as escorts of record, with priority on contested jobs.")
~ note("cost", "In return: escort hours owed, and a standing reporting duty to the Compact.")
-> after

=== escort_cost ===
Renata turns the third page over and writes on the back, slowly, counting as she goes. “Escorts of record. Defence of other hulls on Compact lanes. Priority on contested jobs.” She caps the pen. “In return: hours, owed. And you report to this room, on a schedule, for as long as the clause stands.”
“The hours are the high figure,” she says, without apology. “Halvorsen will be your reporting officer.” Halvorsen inclines his head a quarter inch.
~ note("gain", "Explicit protection as escorts of record, with priority on contested jobs.")
~ note("cost", "In return: escort hours owed, and a standing reporting duty to the Compact.")
~ note("cost", "Hours set at the heavy end, and Halvorsen is your reporting officer. Owed hours displace paid work: Credits −3,000.")
~ add("Credits", -3000)
-> after

=== escort_fail ===
“You are asking for a favour the Compact cannot afford,” Renata says. She sets her hand flat on the charter. “The offer stays on this table for one cycle. Berth priority is another matter.” Priya’s pencil stops moving.
~ note("cost", "The offer stands for one cycle, but your berth priority slips.")
~ note("cost", "Renata thinks you want special treatment. Strain with the Compact +1.")
~ add("Strain", 1)
-> after

// ---- Ending ------------------------------------------------------------------------
=== after ===
The council room empties by degrees. Through the viewport your four hulls ride quietly at their arms, hull numbers lit amber against the dark.
<b>End of prototype slice.</b> # summary
-> END
