# Mobile and accessibility test card

Status: **real-device and screen-reader runs pending**. Browser emulation and
DOM checks are useful coverage; they are not iOS, Android or accessibility certification.
Use one iPhone/Safari and one Android/Chrome; record OS/browser versions and tested
revision. Also use desktop keyboard and at least one VoiceOver or TalkBack run.

| Check | Procedure | Pass condition | Result |
|---|---|---|---|
| Launch | Open shared public link on cellular/Wi-Fi | Start and first Board work | Pending |
| Layout | Portrait/landscape; both themes; browser text enlargement/zoom 200% | No hidden choices or horizontal text scrolling | Pending |
| Touch | Board, ship/crew, Odds, Edge, Sheet, theme, restart, ledger | Deliberate taps hit intended control; no adjacent accidental action | Pending |
| Readability | Read body, notes and meters over each backdrop | Text is legible; meaning does not rely on colour alone | Pending |
| Keyboard | Tab/Shift+Tab/Enter/Space through the flow | Visible focus; logical order; no inaccessible control | Pending |
| Sheet | Open, cycle focus, Escape/Close | Named dialog; focus stays inside; closing restores opener | Pending |
| Screen reader | Read Board, Prepare, roll result, upkeep and ending | Names/states and transitions understandable; no duplicate/conflicting announcements | Pending |
| Motion | Enable OS reduced motion before launch | No unnecessary movement; no loss of feedback | Pending |
| Resume | Background/close tab after accepted outcome, upkeep and ending; reopen same URL | Correct continuation, balances/evidence unchanged | Pending |
| Recovery gap | Reload before accepting a rolled result | Record #185; do not mark passed while it rewinds the choice | Known gap |
| Restart | Play again after ending; reload | Fresh Board; prior ending/evidence absent | Pending |

For every failure record the exact step, expected/actual result, device and
whether help was needed. Attach a screenshot only with permission.
File defects separately from content preferences; retain failures after fixes
and add the revision/retest result rather than overwriting the evidence.

## Automation scope

`npm run e2e` runs the existing production Chromium smoke plus demo QA checks.
Automated font enlargement approximates text reflow; it is not browser pinch zoom.
Keyboard/dialog focus and minimum button dimensions are assertions, not substitutes
for manual screen-reader comprehension or colour-contrast measurement.
No claim of WCAG conformance is made by this card.
