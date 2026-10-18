// A skill check. The story pauses here; the game UI runs the interactive roll (Try it / Odds / Edge)
// and sets roll_grade, then the story continues into one of the three outcome knots.
//
//   -> roll("Persuade,Diplomat", 8, "priya_read", -> win_clean, -> win_cost, -> lose)
//
//   skills  comma-separated skill names; the best one is used (names must exist in src/data/rules.json)
//   target  number to meet on 2d6 + modifier
//   bonus   comma-separated names of ink flags (VAR x = false); each one that is true adds its bonus from
//           rules.json. Use "" for none.
//   The three diverts are the clean success, success with a cost, and failure outcomes. Failure still moves
//   the story on: write what it costs, not a dead end.

VAR roll_grade = 0      // set by the game: 2 clean, 1 cost, 0 fail
VAR chk_skills = ""
VAR chk_target = 8
VAR chk_bonus = ""

=== roll(skills, target, bonus, -> on_clean, -> on_cost, -> on_fail)
~ chk_skills = skills
~ chk_target = target
~ chk_bonus = bonus
+ [__check__]
- { roll_grade:
    - 2: -> on_clean
    - 1: -> on_cost
    - else: -> on_fail
  }
