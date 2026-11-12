# THE COMPENDIUM — original-focus audit and release gate

Branch: `improvement/compendium-original-focus`. Review-only. No merge, deploy, migration, key rename, or deletion authorised.

## Verified architecture and identity

The original is a single offline `index.html` with seven separately embedded puzzle documents, displayed in same-origin frames; there is also an Android build. Existing keys include `cmp_theme`, legacy game history and game-specific progress. Compendium II independently embeds nine puzzles and uses the `c2.` storage prefix. The original launcher names, confirmed by the branch's source-contract test, are Causeway, Unpick, Longhand, Reckoner, Skein, Winnow and Cyphr.

Compendium II names are Fell, Mirrorwork, Riffle, Glean, Bight, Marquetry, Reeve, Shunt and Furlong. There is **genre overlap** (word, number and grid deduction), not identical seven-versus-nine puzzle inventory. No original volume should be erased simply because the sequel exists.

## Ranked editorial priority — provisional judgement, not measured retention

| Priority | Original puzzle | Mechanic | Clarity / tension / replay hypothesis | Recommended attention |
| --- | --- | --- | --- | --- |
| 1 | Causeway | Word ladder: transform one word into another via valid steps | Easy to explain; every step advances or blocks progress; many restartable puzzles | Flagship: input and undo, valid next-step feedback, reliable saved path and result |
| 2 | Winnow | Identify groups of related terms | Immediately approachable; mistakes create tension; completion is memorable | Flagship: selection clarity, preserved shuffle, error explanation and end-of-board result |
| 3 | Reckoner | Numerical constraint grid | High deduction depth and repeatability, but higher entry cost | Flagship for logic players: selected-cell clarity, keypad usability, mistake feedback and resume |
| 4 | Skein | Trace connected words through a grid | Tactile and distinct; touch tracing can frustrate keyboard users | Focus on accessible alternative tracing and recoverable selection |
| 5 | Longhand | Seven-letter daily word deduction | Strong daily return loop but overlaps the broader daily-word category | Maintain deterministic puzzle and clear duplicate-letter feedback; do not dilute |
| 6 | Cyphr | Decode numbered-letter mapping | Strong niche logic value, longer sessions | Ensure mappings, wrong attempts, and progress remain legible and saved |
| 7 | Unpick | Learn and solve cryptic clue constructions | Differentiated educational purpose but not directly comparable to quick-play puzzles | Protect its specialist teaching path; evaluate separately using skill transfer, not speed |

This is a **design-priority ranking, not a quantified quality or popularity score**. No real completion, retention, time-to-solve, or player preference telemetry has been obtained. Do not interpret it as observed user behaviour. Lightweight opt-in testing should compare first-try comprehension, independent completion, time lost to controls, restart intent and voluntary replay for the top three.

## Preservation inventory

| Volume | Important existing/branch keys | Protection requirement |
| --- | --- | --- |
| Causeway | `wl_seen_*`; `cmp.v1.causeway.session` | Preserve prior puzzles and in-progress ladder |
| Unpick | `unpick.v1`; `cmp.v1.unpick.session` | Preserve mastery/solved records and unfinished input |
| Longhand | `lh.daily` | Keep daily answer and interrupted guess unchanged |
| Reckoner | `rk_seen_*`; `cmp.v1.reckoner.session` | Keep board, givens, numbers and completion |
| Skein | `sk_seen_*`; `cmp.v1.skein.session` | Keep exact word paths, hints and found words |
| Winnow | `wn_streak`; `cmp.v1.winnow.session` | Keep original order, solved groups and streak |
| Cyphr | `cyphr` | Keep assignments and per-puzzle completion |
| Sequel (all nine) | `c2.*` | No read/write/delete by original's gameplay or migration |

Note: the original game's key catalogue is drawn from source assertions in `qa/verify.mjs` and browser assertions in `qa/browser.mjs`; some modern session keys are branch additions and are not historical keys from published `main`. These are browser-origin-scoped, so cross-origin and standalone Android WebView storage also need physical-device checks.

## Development-branch evidence and QA gaps

Inspected:
- `qa/verify.mjs` asserts exactly seven manifest entries, eight parsable scripts, standalone/offline constraints, original/legacy save keys, and 14 synthetic read-only status scenarios, including immunity to a `c2.` sentinel.
- `qa/browser.mjs` specifies opening, refreshing and leaving all seven; completion-and-recovery paths for Causeway, Winnow, Reckoner, Skein, Unpick, Longhand and Cyphr; basic keyboard tracing in Skein; and a sequel key sentinel.
- The branch browser script requires a local Chrome/Chromium binary and `playwright-core`.

**Not established by this review:** that the test suite has actually run green on the current branch; Playwright execution on a device/browser; Android/WebView acceptance; Safari and iOS behaviour; all malformed save payloads; the full invalid-input matrix; or real player-based engagement rankings. Code containing tests is not evidence of passing tests. Mark full P0 browser acceptance **pending** until CI or reproducible local test logs are attached.

### Required acceptance matrix

For **each** of seven puzzles: clean start; genuine first move; normal second/third moves; mid-game refresh; exact state recovery; full solve via rendered controls; visible result; post-solve refresh; replay; return; malformed saved JSON; unexpected schema version; touch/mobile viewport; keyboard; no console errors. Additionally run source check and browser QA with original legacy keys pre-populated and `c2.*` sentinel keys before and after every case.

For cross-product navigation: original to sequel should be an explicit ordinary hyperlink (not shared in-app navigation state), and sequel back navigation must be confirmed independently. Validate with both products on GitHub Pages, and with standalone files/Android where origins differ.

## Keep/consolidate decision

**Keep two independent collections for now.** Original = classic/accessible word-and-logic collection with cryptic teaching; sequel = a distinct nine-game experimental collection. Harmonise naming and discovery only. Preserve the seven original titles, their saved data, their rules and the Android path. A common public discovery page might eventually link both, but **never load sequel HTML in the original game's iframe or copy its `c2.` saves** without an explicit design and migration review.

## Future migration proposal — separate authorisation REQUIRED

1. Inventory every historical and current key on fresh and long-lived profiles, and validate old values against their real formats.
2. Design a launcher-only prototype on a new origin with links to both existing apps. Do not move, clone, erase or reinterpret saves in this phase.
3. If truly necessary, design an **opt-in export/import** scheme with per-volume schema/version, checksums, duplicate handling and a preview. Note that browser same-origin rules prevent a generic launcher from automatically reading both Pages origins' localStorage.
4. Test backup/export and rollback on Chromium, Safari and Android; include corrupt saves, partial exports, interrupted imports and repeated imports.
5. Obtain separate written approval for the exact migration mapping, UI, release and rollback plan. Never delete the originals until a retention/rollback decision is authorised.

## Release decision

**HOLD — not approved to merge/deploy.** Obtain passing branch-specific browser test evidence, mobile/Android and corrupted-state results, and explicit owner approval. This audit document is non-destructive and contains no player-data migration.
