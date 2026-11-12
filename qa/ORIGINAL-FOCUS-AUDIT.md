# THE COMPENDIUM — original-focus audit and release gate

Release: approved merge of `improvement/compendium-original-focus` into `main` on 12 November 2026 (PR #2, merge commit `5f58308`). The original and sequel remain separate. No player-data migration, key rename or deletion authorised.

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

**Confirmed CI evidence:** GitHub Actions review run [#7](https://github.com/connex222/COMPENDIUM/actions/runs/43246147986), job `original-seven` (12 November 2026), completed **successfully**: `node qa/verify.mjs` passed 7 original volumes, 8 scripts and **14 save/status scenarios**; `node qa/browser.mjs` passed **20 Chromium checks**. These cover actual completion and refresh restoration across all seven, original-to-sequel link presence, keyboard tracing in Skein and a `c2.` saved-data sentinel. The runner used Node 24.22.2 and Chrome headless. This is real test execution, not just inspection of test source.

**Still not established:** Android/WebView acceptance; Safari and iOS behaviour; all malformed save payloads; complete invalid-input coverage; live cross-product return navigation; or measured player engagement. CI is green for its stated scope but the full P0 acceptance matrix remains **partially open**.

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

## Classic flagship polish — development branch only (12 November 2026)

After the successful initial seven-puzzle acceptance run, three non-destructive UI improvements were implemented in the original embedded volume documents:

- **Causeway:** a persistent sentence explains the shortest known remaining route and warns if the current word has no route forward. The existing word validation, puzzle pool, clock, hint cost and save keys are unchanged.
- **Winnow:** an explicit selection counter (0–4) and completed-group counter (0–4) provide visual and screen-reader progress. Tile names, ranks, random order, lives, penalties and result logic are unchanged.
- **Reckoner:** a progress/constraint sentence reports filled cells and rule-conflict cells; this does not reveal correct numbers or alter deduction rules. Existing check actions retain their original cost.

GitHub Actions [run #14](https://github.com/connex222/COMPENDIUM/actions/runs/43251891548), from the PR review of commit `f93c964`, completed successfully: **18 saved-state scenarios**, **21 browser checks**, all **7 original puzzles**. The latest browser test asserts the visible feedback for Causeway, Winnow and Reckoner in addition to the full solve/resume suite. Headless Chromium evidence does not replace real Safari/Android testing, user research or a full corrupted-state matrix.

## Release decision

**MERGED WITH OWNER APPROVAL — GitHub PR #2.** GitHub Actions run #17 passed 21 Chromium browser checks and 18 saved-state scenarios. GitHub Pages is configured/documented to publish from `main`, but the live page could not be independently reached from this environment, so live deployment verification remains **unconfirmed**. Safari iOS, Android WebView, fuller corrupted-input scenarios and real-player evaluation remain open acceptance follow-ups. No player-data migration was performed.
