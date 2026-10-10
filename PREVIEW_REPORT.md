> Update: LONG/SP6 is now implemented in the isolated preview using the user-approved 300 starter IP / 100 relief IP / three-season requirements. See LONG_SP6_PREVIEW_REPORT.md for the current policy, tests and all staff changes. Earlier blocked-status statements below describe the prior preview.

# Legacy Lore — all changes preview

Prepared October 9, 2026. This is an isolated local preview; the reviewed Git branch and published build are unchanged. No push, merge or deployment occurred.

## Open and stress-test

Open `legacy-lore-all-changes-preview.html` in Chrome or Edge. The file is self-contained. It does not require a server or an upload. The purple PREVIEW banner identifies the test build. Select a franchise, then a city where available. Try Big Moments, player swaps, lineup pins, Compare, Copy roster and Export roster JSON. Cancel an exception prompt to check that the selection stays unchanged; accept an exception to check its visible warning. Test the same actions in a narrow window or on a mobile device.

All 30 franchises and 24 city variants are included. The source ZIP is also supplied for local hosting if desired. Preview-only changes have not been applied to the reviewed branch.

## Included corrections

- DH/fielding swaps require a strictly positive net team-value improvement, plus the existing one-run-per-150-games glove threshold.
- Manual overrides retain user authority. Position/role exceptions require explicit acknowledgment; structural conflicts and duplicates are rejected with warnings.
- Latest approved city policy: the player belongs to the city with the most franchise games and retains **100% of franchise statistics**, including all APEX and Big Moments components. The city banner and JSON export state this scope explicitly. City years describe the assignment period, not a restriction on the credited statistics. A plurality wins even without an absolute majority.
- Missing-score exception handling: if an explicitly accepted position override has no approved positional score, retain the chosen player and report the team-value comparison as unavailable. Do not invent a defensive score or silently treat it as zero.
- LONG/SP6 remains pending: the recovered v0.9.8 rule excludes emergency-SP6 force-ins and uses highest IP/G within the selected bullpen. This conflicts with the requested new qualification policy; the preview retains the existing assignment and shows a warning.

PIV is still only a proposed feature. No PIV values or replacement scoring formulas are included.

## Verification

- 3,039 regression assertions passed across all 30 franchises; 60 default/Big Moments builds, 60 blocked-SP6-option builds, and 48 city/mode builds.
- 600 deterministic randomized manual-override builds passed without crashes, duplicate roster players, duplicate lineup players, or exceeded staff capacity. Unsupported accepted positions produce an explicit unavailable-value warning.
- 78 browser routes passed in Chrome against the self-contained preview: 30 franchise pages and 24 city roster/Compare pairs. Both cancellation and acknowledgment paths passed. Zero page errors. Desktop (1440 pixels) and mobile (390 pixels) screenshots were captured and inspected.
- The installed Edge failed to launch in the current sandbox. Chrome localhost navigation was denied by the environment, so browser testing used the actual downloadable HTML via a local file URL. Current HTTP hosting was not browser-tested; the offline deliverable was.
- Exact APEX season game totals validate 3,691 assigned players: zero assignment errors. No exact game-count ties or no-majority cases occur in the current qualified pools. Future exact ties require a tie policy before refreshing city membership.
- All 64 data files in the preview are byte-identical to the reviewed branch. Scores, weights, raw data and Big Moments arithmetic remain unchanged. Full franchise records are retained for every assigned player.

## Before/after roster effects

Compared with the original repository, nine franchises change fielding/DH alignment in both modes (18 builds), as detailed in the earlier REVIEW_REPORT.md. There are no full-franchise membership or pitching-assignment changes. The revised city policy restores the original assignment pools and their full scores; the DH correction produces alignment changes in 15 of the 48 city/mode builds. Each city change and its value gain is listed in `preview-city-roster-changes.json`; all 48 comparisons are in `preview-city-comparison.json`.

## Preview delta from the reviewed local branch

`engine.js`: restores full-score city assignment pools; explicitly marks missing team value for accepted positions without scores; updates the pending LONG warning.

`app.js`: adds preview/scope banners; preserves full city-assigned export/copy values; restores city Compare; evaluates Big Moments within the same city-assignment pool; handles unavailable override values in labels and comparisons.

`compare.js`: marks the starting-nine total unavailable if a selected position has no approved value, instead of silently omitting that player's value.

`download/legacy_lore.html`: synchronizes those scripts into the self-contained preview.

Preview tests (`tests/regression.cjs`, `tests/browser.cjs`, `tests/city-comparison.cjs`, and new `tests/stress.cjs`) exercise the approved assignment policy and exceptional overrides. Source reports from the earlier review are historical; this report states the current preview policy.

## Approval boundary

Inspect and stress-test this preview first. Applying it to the reviewed branch or adding it to the published build remains a separate step. Publication requires the user's explicit approval. The unresolved LONG/SP6 qualification policy is not certified by these tests.
