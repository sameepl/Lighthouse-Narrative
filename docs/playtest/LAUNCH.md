# Try the Lighthouse Narrative demo

Open **https://sameepl.github.io/Lighthouse-Narrative/** in Safari or Chrome.
No install or account is needed. Allow about 20 minutes.

1. Tap **Start** (or **New run** to replace an earlier saved run).
2. Choose an offer on the Board, review Prepare, then confirm.
3. Choose an approach. **Odds** explains the chance; **Try it** rolls.
   If offered Edge, spend it or **Accept the result**.
4. After upkeep, tap **Start cycle**. Continue until an ending and its ledger.

To resume, reopen the same link in the **same browser and device**, then tap
**Continue**. Progress is stored in that browser, not an account. Private mode,
clearing site data, or switching browsers can lose access to it.
At baseline `96e8676`, pause after accepting an outcome: restoring an unresolved
roll currently returns to its earlier choice (#185). Text marked [STUB] is draft.

Send back: roughly how long you played, where you got confused, and one choice
you remember. A screenshot helps; avoid including personal browser information.
You can use the demo's **Send feedback** link if you have a GitHub account,
or reply directly to the person who shared this link.

## Optional for a hosted playtest

Use https://sameepl.github.io/Lighthouse-Narrative/?timing=1 and tap
**Export timing log** before closing the tab. Share the downloaded
`lighthouse-timing.json` with the host. Timing is opt-in and stays local until
you share it; it records event times, scene IDs and cycles, not typed comments.
It is diagnostic data, not proof of active reading time. Tell the host about breaks.
No recording or file sharing is required to play.

## Local launch for developers

From your clean game checkout, with Node 22+ installed:

```powershell
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local address printed by the command. This address works on that
computer only; use the public link when sharing with a phone or another person.
Do not reset someone else's working checkout just to launch the game.
