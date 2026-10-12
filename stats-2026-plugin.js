/* Appends 2026 rows to the raw-stat table data. Load after companion.js. */
(function(){'use strict';const add=window.LL_STATS_2026,data=window.LL_COMPANION_DATA;if(!add||!data||!data.stats)return;
for(const [k,rows] of Object.entries(add)){const cur=data.stats[k]||(data.stats[k]=[]);for(const r of rows)if(!cur.some(x=>x.year===r.year&&x.teams===r.teams))cur.push(r);cur.sort((a,b)=>a.year-b.year);}})();
