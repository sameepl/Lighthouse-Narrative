# First-player test kit

Goal: three first-time players finish unaided in 18–24 minutes. This is a target,
not an achieved result. Use anonymous IDs P01–P03; no names are needed.
Launch instructions: [LAUNCH.md](LAUNCH.md). Device checks: [MOBILE.md](MOBILE.md).
Copy [RESULTS.csv](RESULTS.csv) per session; keep actual participant notes outside
Git unless the participant agrees to sharing them. Do not record audio/video by default.

## Before each session

- Confirm the public page loads; record URL, tested commit/deployment, date,
  browser/OS, device, theme and text size. The visible 0.1.0 stamp is not a unique revision.
- Use a fresh browser profile/device or ask whether replacing the existing save
  is okay. Never clear a participant's browser data for them.
- Check known issues #183–#185. Randomized fresh runs, ordinary-play foreclosure,
  save-content compatibility and unresolved-roll recovery are not established fixes.
  Current fresh runs use the same seed; repeated routes are not independent balance samples.
- Try the launch steps yourself. Reserve 30 minutes, including debrief.
- Optional: use timing=1; explain the file and obtain agreement before collecting it.

## Moderator script

“This is an unfinished narrative-game demo. We are testing the game, not you.
Please play as you normally would. If useful, say what you are trying to do and
what you expect to happen. You can stop or take a break at any time.”

Start the timer at Start. Do not teach rules, recommend choices or explain lore.
If asked for help, first ask: “What would you try next?” After a clear stall,
offer only enough help to continue and record exactly what you said.
A helped run does not count as unaided. Do not force players to finish inside the window.

## Observe

Use RESULTS.csv for timestamped events and note exact wording rather than diagnoses.
Watch the first Board/Prepare, first roll/Edge, K2's second decision, upkeep,
and the finale. Record hesitation, accidental taps, repeated navigation,
skipped passages, missing feedback and apparent excitement. Distinguish reading
from confusion; ask afterward rather than assuming. Record breaks separately.
Stop the timer when the player finishes reviewing the ending ledger.
Do not count a fast automated playthrough as a timing result.

## Five closing questions

1. What were you trying to accomplish at the start?
2. Which choice felt consequential, and what changed because of it?
3. What did you think Pursuit and upkeep would do?
4. What did your ending mean, and why did you choose that final action?
5. Where were you most engaged or confused; what would you change first?

## Report and prioritize

Report elapsed time and breaks separately; include assisted/abandoned runs.
For each finding: observed event → player explanation → proposed smallest fix.
Priority: blocked/lost progress, then misunderstood commitment, then readability,
then pacing or cosmetic polish. Retest a fix with another new player.
Publish only anonymous aggregate findings. Three small sessions reveal problems;
they do not prove universal usability or statistical balance.

## Current technical evidence

Production Chromium smoke covers both K5 endings, upkeep reload and restart.
The companion recovery/accessibility suite adds browser-state checkpoints and
mobile layout checks. A known expected failure must remain visible as a gap,
not be described as passing. Foreclosure UI fixture checks do not demonstrate
that foreclosure is reachable through ordinary production play (#183).
Real iPhone/Android and assistive-technology results are pending until entered.
