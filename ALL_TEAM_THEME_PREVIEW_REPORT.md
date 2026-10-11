# All 30 franchise editions — preview

All franchise pages now use team color accents, cool tinted surfaces, a faint original ballpark masthead, and an ace/SP1 marker that opens the pitcher card. The shared roster layout and familiar statistics stay consistent. Team-colored alternating season rows and click-to-sort columns are enabled for every franchise. LSI remains absent from active screens; preserved research archives are untouched.

## Validation

Passed across 30 franchises: 60 hitter/pitcher cards, 930 column checks in both directions, 390px and 320px mobile layouts with no added overflow, accessible button-driven sorting, ace cards, team theme switching, and home theme reset. No JavaScript errors. All 30 final artwork files are distinct and load in the final preview.

Every default roster matches the previous Baltimore preview, including starting nine, bench, rotation and bullpen. Engine.js, compare.js, companion.js, packed index and all franchise data files are byte-identical. There are no scoring, statistical or roster changes.

## Changed files

The separate preview is work/all-team-theme-preview. Its app.js adds shared franchise mastheads, ace markers for all teams and expands existing season sorting to all franchises. Its style.css supplies franchise palettes and shared theme rules. Its download/legacy_lore.html is regenerated with relative artwork links. assets/artwork-manifest.json records the 28 new generation prompts and source paths; the earlier Yankees/Baltimore prompts are documented in their existing preview reports. All 30 saved image assets are listed below. Previous previews and the published checkout are retained.

Supporting build/verification files: work/build-all-team-themes.py, work/link-team-preview-assets.py, work/test-all-team-themes.cjs, work/check-theme-image-loads.cjs, work/verify-theme-assets.py, work/report-all-team-themes.py, work/read-theme-index.py, work/list-theme-keys.py, work/adjust-team-test-output.py, work/theme-index.json and work/team-art-final-manifest.json. Outputs: legacy-lore-all-team-theme-preview.html, all-team-theme-tests.json, team-artwork-hashes.json, team-theme-gallery.html, team-theme-gallery.png and 60 desktop/mobile screenshots under team-theme-screenshots.

| Franchise | Existing source colors | Saved artwork file in preview |
|---|---|---|
| New York Mets | #002D72, #FF5910 | assets/mets-stadium-original.png |
| New York Yankees | #0C2340, #C4CED3 | assets/yankees-stadium-original.png |
| Pittsburgh Pirates | #27251F, #FDB827 | assets/pirates-stadium-original.png |
| Arizona Diamondbacks | #A71930, #E3D4AD | assets/diamondbacks-stadium-original.png |
| Athletics | #003831, #EFB21E | assets/athletics-stadium-original.png |
| Atlanta Braves | #13274F, #CE1141 | assets/braves-stadium-original.png |
| Baltimore Orioles | #DF4601, #000000 | assets/orioles-stadium-original.png |
| Boston Red Sox | #BD3039, #0C2340 | assets/redsox-stadium-original.png |
| Chicago Cubs | #0E3386, #CC3433 | assets/cubs-stadium-original.png |
| Chicago White Sox | #27251F, #C4CED4 | assets/whitesox-stadium-original.png |
| Cincinnati Reds | #C6011F, #000000 | assets/reds-stadium-original.png |
| Cleveland Guardians | #00385D, #E50022 | assets/guardians-stadium-original.png |
| Colorado Rockies | #33006F, #C4CED4 | assets/rockies-stadium-original.png |
| Detroit Tigers | #0C2340, #FA4616 | assets/tigers-stadium-original.png |
| Houston Astros | #002D62, #EB6E1F | assets/astros-stadium-original.png |
| Kansas City Royals | #004687, #BD9B60 | assets/royals-stadium-original.png |
| Los Angeles Angels | #BA0021, #003263 | assets/angels-stadium-original.png |
| Los Angeles Dodgers | #005A9C, #EF3E42 | assets/dodgers-stadium-original.png |
| Miami Marlins | #00A3E0, #EF3340 | assets/marlins-stadium-original.png |
| Milwaukee Brewers | #12284B, #FFC52F | assets/brewers-stadium-original.png |
| Minnesota Twins | #002B5C, #D31145 | assets/twins-stadium-original.png |
| Philadelphia Phillies | #E81828, #002D72 | assets/phillies-stadium-original.png |
| San Diego Padres | #2F241D, #FFC425 | assets/padres-stadium-original.png |
| Seattle Mariners | #0C2C56, #005C5C | assets/mariners-stadium-original.png |
| San Francisco Giants | #27251F, #FD5A1E | assets/giants-stadium-original.png |
| St. Louis Cardinals | #C41E3A, #0C2340 | assets/cardinals-stadium-original.png |
| Tampa Bay Rays | #092C5C, #8FBCE6 | assets/rays-stadium-original.png |
| Texas Rangers | #003278, #C0111F | assets/rangers-stadium-original.png |
| Toronto Blue Jays | #134A8E, #1D2D5C | assets/bluejays-stadium-original.png |
| Washington Nationals | #AB0003, #14225A | assets/nationals-stadium-original.png |

## Artwork and limitations

The built-in image_gen.imagegen tool generated one original illustration per new franchise; previously approved Yankees and Baltimore assets are reused. No external logos or photographs were added. Images evoke franchise ballparks and heritage; they are not accurate stadium maps or depictions of every historical city/era. Athletics artwork evokes Oakland heritage. The diamond itself retains its existing schematic shape; only the Yankees has the earlier stylized asymmetric field outline.

Original high-resolution PNG files total approximately 101.5 MB across all teams. The active page loads its own image, rather than embedding all images in one HTML file. The local preview consequently depends on the assets folder in the workspace; keep it with the preview when copying. A production asset-size pass can be considered before release.

This is an unpublished preview. No deployment, push or merge was performed.
