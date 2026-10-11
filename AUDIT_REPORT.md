# Legacy Lore audit — October 10, 2026

The published Clubhouse 2.0 release was audited against commit `cbe344d3f5ed86f769b46c2517ebbeb2e015db3a`. No new scoring or automatic roster-selection error was found in the tested cases. Six application/maintenance issues were corrected in a separate local copy. A failing historical test was also repaired. The published repository was kept unchanged; nothing was committed, pushed, merged or deployed in this audit.

## Findings and local corrections

| Finding | Before | Audit preview |
|---|---|---|
| City comparison selections (medium) | Two players selected in the full franchise could disappear after changing city while occupying both comparison slots. Reproduced with Athletics: zero visible comparisons, zero enabled Compare buttons. | Selection scope now includes city. Hidden selections are also pruned from the active player pool. Same reproduction leaves 76 usable Compare buttons. Scores keep the approved full-franchise city-credit policy. |
| Cancelled swaps (medium) | Cancelling the replacement acknowledgment kept the roster unchanged but closed the swap sheet and falsely displayed “Pinned”. | Cancel returns immediately, retaining the sheet and saved assignment. The same guard applies to clearing a slot. |
| Unreadable saved settings (medium) | A stored JSON `null` displayed defaults, then caused a JavaScript error when roster balance was changed. Invalid JSON or malformed containers had no recovery explanation. | Validate stored containers and acknowledgment strings. Show defaults with a visible recovery warning, retain the original stored text, and block changes until recovery or reset. Users can copy original settings; resetting requires explicit confirmation. Cancelled reset preserves data; confirmed reset restores normal editing. |
| Pitcher swap feedback (medium) | Pitcher alternatives showed a starting-nine win change, normally 0.0, because that total measures hitters. It did not describe the pitching change. | Display the difference between the existing Starter or Reliever APEX scores, explicitly labeled as a slot-score comparison rather than net team value. Other staff assignments can reflow. LONG swap candidates also include qualifying approved SP6 options in the top candidate pool. Qualification and acknowledgment rules are unchanged. |
| APEX source description (medium) | Home page asserted “no WAR inside the scores”, despite dependencies documented by the recovered pipeline audit. | Describe APEX as custom player scores and explain its WAR/WAA-derived baselines and historical inputs on About. LSI remains separately identified as having no WAR inputs. No formula changed. |
| Offline maintenance (medium) | The update helper refreshed engine/app/index but omitted companion code, comparison code and styles. Later edits could produce a stale download. | Refresh all four application scripts, both stylesheets and the packed index; assert each expected block exists. Add `--check` to detect drift. A probe independently changed six assets and confirmed they all reached the offline output. |

Small related improvements: BAT2/BAT3 swap headings use “Bench bat 2/3”; the saved-settings copy message no longer implies optional capacity settings are supported by the frozen Python engine.

The historical `tests/frozen.cjs` initially failed on Git ownership in this environment and also guarded UI files that had legitimately changed in the approved release. It now uses immutable historical fixtures rather than runtime Git commands. It verifies 30 packed franchise score files, the loader, Big Moments arithmetic, and original packed index metadata/rules excluding the intentionally corrected roster references.

## Verification

| Test | Result |
|---|---|
| Published baseline regression | 3,099 checks; 120 builds, including 24 historical city pools; passed. |
| Roster capacity regression | 1,239 checks; 324 builds; 108 Standard comparisons against the approved prior fixture; passed. |
| LONG/SP6 boundaries and protected roles | 863 checks; 108 builds; passed. Its 50 changed builds are historical comparisons to the pre-SP6 fixture, not changes caused by this audit. |
| Baseline override stress | 600 randomized builds; zero failures. |
| Expanded audit override stress | 1,620 builds: 30 full franchises + 24 city pools × three capacities × ten trials, with Big Moments on/off and acknowledged exceptions; passed. 2,190 acknowledged exception warnings remained visible. |
| Audit before/after integrity | 113,796 assertions; 324 complete outputs exactly equal to the published engine across all franchise/city, capacity and Big Moments combinations. |
| Companion/source integrity | All 10,022 companion records, 55,654 LSI seasons, 55,654 raw season rows, the 1954 pilot, and embedded data unchanged. Numeric/availability bounds and unique ordered source seasons checked. |
| Corrected browser interactions | All 30 franchises; 180 capacity/Big Moments builds; 300 comparison-sort views; 90 pitcher swap sheets. City selection reset, cancelled swaps, Big Moments collapse, saved-data retention, and explicit reset passed. Zero page errors or mobile horizontal overflow in the tested roster view. |
| Other application navigation | 214 routes across Clubhouse, Compare, Hitters, Pitchers, History, Almanac, Lore and global pages; 60 hitter/pitcher cards; zero page errors or failed asset requests. |
| Downloadable app | 78 offline routes, self-check, rejected unacknowledged position assignment, cancelled exception and accepted acknowledgment; passed. |
| Live release | 30 franchises, 90 capacity builds, companion cards and self-check passed. All seven checked live assets matched the published manifest. |
| Frozen pipeline safeguards | Historical hashes, index metadata/rules and Big Moments arithmetic passed. `engine.js`, `compare.js`, loader, styles, workload, city assignments, packed index and all 30 franchise score assets are byte-identical to the published copy in this preview. |

**Roster changes caused by this audit: zero.** All 324 tested automatic outputs, including receipts and warnings, match before/after. APEX, Big Moments and LSI calculations and weights were not edited. Pitcher swap numbers are newly accurate display comparisons of existing scores, not a new scoring formula.

## Files changed in the separate app copy

- `app.js`: cancellation guards, saved-settings recovery, pitcher-swap feedback/SP6 candidate visibility, accurate APEX wording, readable extra-bench headings and copy message.
- `companion.js`: scope comparison state by city and prune unavailable selections. Embedded data unchanged.
- `download/legacy_lore.html`: synchronized offline preview of the above changes.
- `tests/update-offline.cjs`: complete synchronization of the new application modules/styles and check mode; resolves paths from the script location.
- `tests/frozen.cjs`: portable historical scoring checks, separating approved UI changes from frozen data/arithmetic.
- `tests/fixtures/frozen-scoring-hashes.json`: new immutable historical asset hashes, arithmetic hash and original index metadata.

Separate copy: `work/audit-preview`. Preserved published checkout: `work/legacy-lore`. Preview: `outputs/legacy-lore-audit-preview.html`. Changed-file hashes: `outputs/audit-change-manifest.json`. Source diff: `outputs/audit-source-diff.patch` (offline output and large fixture omitted; both are provided separately).

Audit tooling added outside the app: `work/audit-browser.cjs`, `audit-navigation.cjs`, `audit-integrity.cjs`, `audit-stress.cjs`, `audit-offline-sync.cjs`, `prepare-audit.py`, `audit-wording.py`, `audit-swap-labels.py`, `repair-frozen-test.py`, and `finalize-audit.py`. These prepare the separate copy, reproduce issues, run checks and write artifacts; they are not application modules. Temporary offline probe copies are retained under `work/audit-sync-probe-*`.

## Remaining limitations and next priorities

- APEX is a custom ranking engine but is not wholly WAR-source independent. Removing those dependencies requires a separately reviewed scoring design; this audit preserves the frozen pipeline.
- LSI/raw Lahman data ends in 2025, while some APEX records extend into 2026. “Complete” companion coverage is bounded by that source snapshot, not a guarantee of current-season coverage.
- Pre-1955 batting career coverage remains incomplete. The labeled 1954 Retrosheet pilot is separate and retains reconstruction labels and the unresolved Jim Finigan walk discrepancy. No missing values were fabricated or treated as zero.
- Thin historical city pools may leave roles empty. Warned manual exceptions can deliberately violate eligibility after acknowledgment; missing approved position values remain unavailable.
- The companion asset is approximately 5.6 MB before transfer compression and eagerly decodes its full dataset. Loading it by franchise would be a worthwhile separate performance project. No low-end-device/network performance threshold was certified here.
- Pitcher slot-score differences are not net whole-staff or team-value estimates. They do not claim to measure all lineup/role changes following an override. Batting and pitching LSI are separate scales; no combined score was introduced.
- This is a repository/application audit and consistency regression, not independent reconciliation of every historical statistic, a penetration test, or exhaustive testing of every browser/device. External source accuracy and all Lore prose were not independently researched.
- Existing embedded frozen Rules text retains its original history. The current approved city, LONG/SP6 and optional capacity policies are recorded in the release/audit documentation; changing scoring rules or engines remains a separate decision.
- Saving is local to the browser/device. There is no account sync; exported rosters remain the user’s backup. Team combinations and game/milestone archives remain deferred.

Recommended next step: review the unpublished audit preview and approve these fixes for a separate release. No additional feature expansion is needed before that review.

## Subsequent approved preview change: lineup defense and speed

ISO+ was removed from the lineup display only; the engine still uses it for the approved batting-order calculation. Defense displays the existing `rf150_<assigned position>` fielding runs saved per 150 games, with no defensive value shown for DH or a position without recorded workload. Speed displays existing `rbr600` baserunning runs per 600 plate appearances, explicitly described as running value rather than sprint speed. Both use signed numbers; positive means above average. On small screens these new columns remain visible while OBP, SLG, OBP+ and Bat/600 remain available on player cards.

Changed application files for this addition: `app.js` and regenerated `download/legacy_lore.html`. Original files were preserved in `work/lineup-display-backup`. Added tooling: `work/update-lineup-display.py` and `work/test-lineup-display.cjs`. The offline preview and changed-file manifest/diff were refreshed. Validation passed across 30 franchises × Big Moments on/off × three roster capacities (180 builds, 1,620 lineup rows), at desktop and 390/320-pixel mobile widths, with zero page errors. A fresh 324-build exact-output comparison and 113,796 integrity checks passed; no scoring, automatic roster or batting-order changes occurred. Results are in `outputs/lineup-display-tests.json`. This remains unpublished.
