# Slice briefs

Briefs for the M1 slice (`docs/SLICE.md`, epic #105, issue #88). Roster briefs are assembler input (`npm run build:prompt -- --brief <file>` prints the writer prompt, `npm run assemble:scene` builds the scene). Keystone briefs are larger and are written by hand with a strong model.

| Brief | Archetype | Location | Status |
|---|---|---|---|
| `stub_trade_convoy.json` | trade run | the-shoal | ready |
| `stub_standoff_lane.json` | standoff | hearthline-market | ready |
| `stub_salvage_lamp.json` | salvage | psalter-lamp-field | ready |
| `stub_distress_hab.json` | distress call | traffic-hab | ready |
| `stub_scout_gap.json` | scout | fenrir-gap | ready; the location has no written sensory details (see below) |
| `stub_courier_filing.json` | courier | faraday-basin | ready; the location has no written sensory details (see below) |
| `k1.md` | keystone, courier | hearthline-berths | ready (planner answers filed) |
| `k2.md` | keystone, distress call | traffic-hab | draft (planner answered, #103) |
| `k3.md` | keystone, scout | fenrir-gap | draft (planner answered, #103); no written sensory details |
| `k5.md` | keystone, finale | errant-pawn | draft (planner answered, #103) |

Every roster brief uses a different location, a complication from `docs/canon/complications.md`, three approaches written as intent, effects inside the placeholder bands, `effect_reasons` and `places`. Each passes the `build:prompt` schema check.

**Two locations have no written sensory details** (`faraday-basin`, `fenrir-gap`). Until the planner supplies them, writers use paperwork and instrument detail only and invent no smells, textures or temperatures. A follow-up request to the planner is on #103.

**Open items.** (1) The roster distress call (`stub_distress_hab`) and K2 both use `traffic-hab`; one run could show both. Resolve by moving the roster distress call to a new location once the planner supplies one. (2) The planner has no file for "hijack crews": the cutter in K2 is unnamed and unmarked, and `SLICE.md` and `ART_PLAN.md` say so.
