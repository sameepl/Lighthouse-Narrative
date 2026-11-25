# Timing a local or deployed playtest

Open the game with `?timing=1` (append `&timing=1` if it already has a query). Start or continue normally. The optional **Export timing log** button downloads JSON; the flag must be present again after a reload. Without it no recorder or control is created.

Records use UTC epoch milliseconds (`at`), event type, cycle and scene/offer ID. Hub and run-start IDs are null. Resume is recorded separately from a new run. Choices record no prose, player input or save payload. Successful published transitions are recorded; failed actions are discarded. Logs use per-tab browser session storage, retain the most recent 5,000 events and survive reload. Tabs cannot overwrite one another. Export before closing the tab; closing it clears its diagnostics. If storage is blocked, export still works from memory until the page closes. Game saves are unaffected.
