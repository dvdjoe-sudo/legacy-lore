# Swap comparison preview

Adds the same six hitter statistics used by the lineup: OBP, SLG, OBP+, Bat/600, position fielding runs/150, and baserunning runs/600. The current selection appears above alternatives as a comparison baseline. DH has no defensive rate; bench roles without a fixed field position show a dash. All numbers use the active franchise/city and Big Moments data already loaded by the app. Slot score and starting-nine value change remain visible.

Changed application files: work/dh-consistent-preview/app.js and style.css, plus regenerated download/legacy_lore.html. Source data, scoring engine, selection rules, and pitcher screens retain their existing behavior. Original app/style files are in work/swap-stats-backup. Added work/add-swap-stats.py and work/test-swap-stats.cjs; outputs include the standalone preview, test JSON and desktop/mobile screenshots.

This is an unpublished preview incorporating the previous DH and audit corrections. No deployment or published checkout changes.
Validation passed: 60 CF/DH sheets and 870 player rows across all 30 franchises; swap contents fit 320/390-pixel widths, with no browser errors. Broader browser regression also passed. Existing background Yankees field layout extends about 9 pixels at 320 pixels; unchanged by this work. Rendering tests dispatch the swap event to isolate modal behavior from existing field SVG pointer interception.
