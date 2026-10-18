// The Written Clause. Same slice as shared/story.js, written natively in ink.
// Marcus is never written for: narration covers the world and NPCs only.
// PLACEHOLDER values: characteristic and skill numbers are invented for the slice.

VAR credits = 52000
VAR edge = 3
VAR strain = 0
VAR priya_read = false

VAR persuade = 1
VAR diplomat = 2
VAR leadership = 2
VAR tactics = 2
VAR soc_mod = 1
VAR int_mod = 1

VAR edge_used = false
VAR cur_mod = 0
VAR cur_target = 8
VAR cur_parts = ""
VAR r_d1 = 0
VAR r_d2 = 0
VAR r_total = 0
VAR r_grade = 0
VAR ledger = ""
VAR after_roll = -> hall

-> hall

// ---------- helpers ----------
=== function best(a, b)
{ a > b:
    ~ return a
- else:
    ~ return b
}

=== function note(kind, t)
~ ledger = ledger + kind + "::" + t + ";;"

=== function grade_of(total, target)
{ total >= target + 2:
    ~ return 2
}
{ total >= target:
    ~ return 1
}
~ return 0

=== function grade_label(g)
{ g:
- 2: ~ return "Clean success"
- 1: ~ return "Success with a cost"
- else: ~ return "Failure"
}

=== function do_roll()
~ r_d1 = RANDOM(1, 6)
~ r_d2 = RANDOM(1, 6)
~ r_total = r_d1 + r_d2 + cur_mod
~ r_grade = grade_of(r_total, cur_target)

// number of 2d6 combinations (out of 36) that are >= k
=== function ways(k)
~ temp kk = MAX(2, MIN(13, k))
{ kk:
- 2: ~ return 36
- 3: ~ return 35
- 4: ~ return 33
- 5: ~ return 30
- 6: ~ return 26
- 7: ~ return 21
- 8: ~ return 15
- 9: ~ return 10
- 10: ~ return 6
- 11: ~ return 3
- 12: ~ return 1
- else: ~ return 0
}

=== function pct(k)
~ return (ways(k) * 100 + 18) / 36

// ---------- scene ----------
=== hall ===
Renata lays the charter on the table between you and does not push it across. # bg:hall
“Three pages,” she says. “Berth, standing, arms. Hull by hull, with hours.” She taps the third page. “This is the one you want. And the one that costs.”
Priya reads upside down, lips moving. She sets two fingers on a clause and says nothing.
“Your people carry peace-bonded weapons on the ring. Fine. Your ships fire only in defence of life, ship and traffic. Also fine. But I will not write that down for you, because the moment it is written, I must write it for everyone.” Renata counts on her fingers. “The merchants. The tugs. The visiting navy. Every hull. And they have asked, Captain. Many times.”
Halvorsen looks at the viewport, at your ships, then at you.
Your crews already defend Hearthline’s traffic, yet you hold only an informal understanding. A hijack on the lanes could land them in an after-action review with nothing on paper to stand behind.
-> menu

=== hall2 ===
The charter lies where Renata left it, three pages square to the table’s edge. Priya’s pencilled marks run down the margins now.
“One cycle,” Renata says. “The offer stands until then. I do not extend.”
-> menu

=== menu ===
+ [Press for parity @@ Persuade / Diplomat] -> press
+ [Ask for protected-escort status @@ Leadership / Tactics] -> escort
+ {not priya_read} [Take the pages away and let Priya read them @@ No roll] -> priya_report
+ [Decline for now] -> unsigned

=== priya_report ===
Take the pages away and let Priya read them # pick
Priya brings the pages back before the cycle turns, her notes in small tight script down every margin.
“It is what Renata said, and no worse,” she says. “The arms clause binds the Compact to the same words for every hull, so push there and it reads as a precedent, not a favour. The escort clause is narrower, with hours and a reporting duty. But I know where she has room to move. I have marked it.”
+ [Return to the hall]
    Return to the hall # pick
    ~ priya_read = true
    ~ note("gain", "Priya’s reading gives you +1 on either approach.")
    ~ note("watch", "Renata notes the delay. A rival hull may take the berth you wanted.")
    -> hall2

=== unsigned ===
Decline for now # pick
Renata gathers the charter without comment and squares it against the table’s edge. What stays unwritten stays unwritten.
+ [Continue]
    ~ note("watch", "Nothing is written down. Your crews remain covered only by an informal understanding.")
    -> after

// ---------- the roll machinery ----------
// Approach knots set cur_mod / cur_target / after_roll, then divert here.
=== stage ===
+ [Try it]
    ~ edge_used = false
    -> rolled
+ [Odds]
    Need {cur_target}+ on 2d6, modifier {cur_mod >= 0:+}{cur_mod} ({cur_parts}).<br>Success {pct(cur_target - cur_mod)}% · Clean {pct(cur_target + 2 - cur_mod)}% # odds
    -> stage
+ [Back] -> menu

=== rolled ===
~ do_roll()
{r_d1} + {r_d2} {cur_mod >= 0:+}{cur_mod} = {r_total} · {grade_label(r_grade)} # roll:{r_grade}
{ r_grade < 2 and edge > 0 and not edge_used:
    -> edge_offer
}
-> after_roll

=== edge_offer ===
+ [Spend Edge — {r_grade == 0:re-roll|make it clean} ({edge} left)]
    ~ edge = edge - 1
    ~ edge_used = true
    { r_grade == 0:
        ~ do_roll()
        {r_d1} + {r_d2} {cur_mod >= 0:+}{cur_mod} = {r_total} · {grade_label(r_grade)} # roll:{r_grade} # edge:Edge spent: re-rolled
    - else:
        ~ r_grade = 2
        {r_d1} + {r_d2} {cur_mod >= 0:+}{cur_mod} = {r_total} · {grade_label(r_grade)} # roll:{r_grade} # edge:Edge spent: upgraded
    }
    -> after_roll
+ [Accept the result]
    -> after_roll

// ---------- approach 1: press for parity ----------
=== press ===
Press for parity # pick
~ cur_mod = best(persuade, diplomat) + soc_mod
~ cur_target = 8
{ persuade > diplomat:
    ~ cur_parts = "Persuade +" + persuade
- else:
    ~ cur_parts = "Diplomat +" + diplomat
}
~ cur_parts = cur_parts + ", SOC +" + soc_mod
{ priya_read:
    ~ cur_mod = cur_mod + 1
    ~ cur_parts = cur_parts + ", Priya’s reading +1"
}
~ after_roll = -> press_resolve
-> stage

=== press_resolve ===
{ r_grade:
- 0:
    Renata squares the pages and slides one stack, then the other, toward Priya. “No. Berth and standing. Not arms.” She does not raise her voice. “I will remember that you asked for the whole table.”
    ~ note("cost", "You leave with the berth and standing pages only. No arms clause.")
    ~ note("cost", "Renata remembers you pushed. Strain with the Compact +1.")
    ~ strain = MIN(strain + 1, 5)
- else:
    Renata is silent for a long beat. Then she draws the third page toward her and uncaps a pen. “For every hull,” she says, writing. “On the ring and the lanes. In ink.”
    Priya lets out a breath she has clearly been holding.
    ~ note("gain", "The self-defence clause is written for every hull on Compact lanes, yours included.")
    ~ note("gain", "Merchants and tug crews trust your alliance more.")
    { r_grade == 1:
        Halvorsen’s pen is moving too. Four hulls, one captain, written down in a column. “The Compact will want to know how large you mean to become,” he says, to no one in particular.
        ~ note("cost", "The Compact grows wary of your fleet’s size. Strain with the Compact +1.")
        ~ strain = MIN(strain + 1, 5)
    }
}
-> after

// ---------- approach 2: protected-escort status ----------
=== escort ===
Ask for protected-escort status # pick
~ cur_mod = best(leadership, tactics)
~ cur_target = 8
{ leadership > tactics:
    ~ cur_parts = "Leadership +" + leadership
    ~ cur_mod = cur_mod + soc_mod
    ~ cur_parts = cur_parts + ", SOC +" + soc_mod
- else:
    ~ cur_parts = "Tactics +" + tactics
    ~ cur_mod = cur_mod + int_mod
    ~ cur_parts = cur_parts + ", INT +" + int_mod
}
{ priya_read:
    ~ cur_mod = cur_mod + 1
    ~ cur_parts = cur_parts + ", Priya’s reading +1"
}
~ after_roll = -> escort_resolve
-> stage

=== escort_resolve ===
{ r_grade:
- 0:
    “You are asking for a favour the Compact cannot afford,” Renata says. She sets her hand flat on the charter. “The offer stays on this table for one cycle. Berth priority is another matter.” Priya’s pencil stops moving.
    ~ note("cost", "The offer stands for one cycle, but your berth priority slips.")
    ~ note("cost", "Renata thinks you want special treatment. Strain with the Compact +1.")
    ~ strain = MIN(strain + 1, 5)
- else:
    Renata turns the third page over and writes on the back, slowly, counting as she goes. “Escorts of record. Defence of other hulls on Compact lanes. Priority on contested jobs.” She caps the pen. “In return: hours, owed. And you report to this room, on a schedule, for as long as the clause stands.”
    ~ note("gain", "Explicit protection as escorts of record, with priority on contested jobs.")
    ~ note("cost", "In return: escort hours owed, and a standing reporting duty to the Compact.")
    { r_grade == 1:
        “The hours are the high figure,” she says, without apology. “Halvorsen will be your reporting officer.” Halvorsen inclines his head a quarter inch.
        ~ note("cost", "Hours set at the heavy end, and Halvorsen is your reporting officer. Owed hours displace paid work: Credits −3,000.")
        ~ credits = credits - 3000
    }
}
-> after

// ---------- ending ----------
=== after ===
The council room empties by degrees. Through the viewport your four hulls ride quietly at their arms, hull numbers lit amber against the dark.
<b>End of prototype slice.</b> # summary
-> END
