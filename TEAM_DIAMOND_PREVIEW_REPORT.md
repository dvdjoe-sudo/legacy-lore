# Franchise diamond preview

Extended the Yankees field treatment to every franchise: original schematic outfield profiles, a pale warning track, team-colored perimeter and striped grass. Each franchise has its own outline. Yankees geometry is preserved exactly. All ten player markers, including SP1, remain interactive with the existing roster data and placement.

This separate preview is work/all-team-diamond-preview. Changed files: app.js (29 new profile definitions and the ballparkOutline SVG renderer), regenerated download/legacy_lore.html and its relative artwork links. Supporting files: work/build-team-diamonds.py and work/test-team-diamonds.cjs. Outputs: legacy-lore-all-team-diamond-preview.html, team-diamond-tests.json, team-diamond-gallery.html, team-diamond-gallery.png and 60 field screenshots under team-diamond-screenshots. Existing mastheads, season sorting and image assets are retained.

Passed: all 30 franchise routes and 30 distinct outlines; all 30 ace cards; ten markers on each field; no additional overflow at 390px or 320px; no JavaScript errors. Every default roster matches the previous all-team-theme preview. Engine, comparison, companion, packed index and all franchise data are byte-identical. No scoring, statistics or roster changes.

The outlines are stylized original illustrations, not measured representations of stadium boundaries. Historical cities and every era of a ballpark are not depicted separately. The player coordinates remain schematic. Earlier previews and the published checkout are preserved. This preview has not been deployed, pushed or merged.
