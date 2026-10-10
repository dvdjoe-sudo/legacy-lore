# Approved roster corrections release — October 9, 2026

The user explicitly approved publication after reviewing the all-changes preview. This release preserves the frozen APEX and Big Moments scoring values and engines.

Changes: assign players to the franchise city with the most games and credit full franchise statistics with an explicit scope label; require positive net value for automatic DH defensive swaps while retaining the one-run-per-150-games eligibility threshold; certify LONG from exact recovered workload metadata and allow SP6 outside the selected five with three qualifying seasons, 300 starter IP and 100 relief IP; retain acknowledged manual eligibility exceptions and flag duplicate/conflicting assignments. Missing approved position values show N/A without fabricated scores.

Validation: 3,099 regression assertions across all 30 franchises, both modes and 24 city variants; 863 LONG/SP6 checks over 108 builds; 600 randomized override builds with zero failures; 78 Chrome offline browser routes with zero page errors. The release removes only the preview banner and synchronizes the offline download. LONG tests include a frozen pre-preview engine fixture.

Roster effects: nine franchises have improved DH/field alignment; LONG policy changes 26 full-franchise/mode builds across 15 franchises and 24 city/mode builds. The selected five starters, closer, setup roles and LHS remain protected. Full comparisons and exact pitcher qualifications are documented in LONG_SP6_PREVIEW_REPORT.md and the local test outputs.

Changed files are recorded in the release commit. RECOVERY_REPORT.md, REVIEW_REPORT.md, PREVIEW_REPORT.md and LONG_SP6_PREVIEW_REPORT.md retain their historical review-stage context; their statements about nonpublication describe that stage. This release report supersedes their publication status. LOCAL_RECOVERY_REPORT.md documents remaining external dependencies for a fresh upstream score rebuild. PIV is not included.

Rollback: backup/pre-roster-corrections-2026-10-09 preserves the previous live commit 14ac62685cffd1a32c8e3bf798d91c0d709bca03. Publication updates main with a non-forced, expected-head check.
