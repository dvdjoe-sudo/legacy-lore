const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),c={window:{},TextDecoder,Uint8Array,atob,fflate:{gunzipSync:u=>zlib.gunzipSync(u)}};vm.createContext(c);
const source=fs.readFileSync(path.join(root,'companion.js'),'utf8');vm.runInContext(source.slice(0,source.indexOf('\n(function')),c);
const original=JSON.stringify(c.window.LL_COMPANION_DATA.stats);
for(const name of ['display-games-data.js','stats-2026-data.js','stats-2026-plugin.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),c);
const add=c.window.LL_STATS_2026,stats=c.window.LL_COMPANION_DATA.stats;
assert.equal(Object.keys(add).length,387);assert.equal(Object.keys(add).filter(k=>k.includes(':bat:')).length,199);assert.equal(new Set(Object.keys(add).map(k=>k.split(':')[0])).size,30);
for(const [k,rows] of Object.entries(add)){
 assert.equal(rows.length,1);const r=rows[0];assert.equal(r.year,2026);assert.equal(stats[k].filter(x=>x.year===2026&&x.teams===r.teams).length,1);
 for(const v of Object.values(r))if(typeof v==='number')assert.ok(Number.isInteger(v)&&v>=0,k);
 if(k.includes(':bat:')){const [code,,id]=k.split(':');assert.equal(stats[k].reduce((n,x)=>n+x.G,0),c.window.LL_DISPLAY_G[code][id],k+' header total');assert.ok(r.H>=r['2B']+r['3B']+r.HR&&r.AB>=r.H,k+' hit totals');}
 else assert.ok(r.G>=r.GS&&r.G>=r.W+r.L,k+' pitcher totals');
}
const first=JSON.stringify(stats);vm.runInContext(fs.readFileSync(path.join(root,'stats-2026-plugin.js'),'utf8'),c);assert.equal(JSON.stringify(stats),first);
const restored=JSON.parse(first);for(const k of Object.keys(add))restored[k]=restored[k].filter(r=>r.year!==2026);assert.equal(JSON.stringify(restored),original,'historical raw rows preserved');
assert.equal(c.window.LL_DISPLAY_G.CLE.fryda01,337);assert.equal(c.window.LL_DISPLAY_G.SDP.campulu01,249);
assert.equal(c.window.LL_DISPLAY_SEASON_G.CLE.fryda01[2025],66);assert.equal(c.window.LL_DISPLAY_SEASON_G.SDP.campulu01[2025],10);
const html=fs.readFileSync(path.join(root,'download/legacy_lore.html'),'utf8');for(const name of ['companion.js','stats-2026-data.js','stats-2026-plugin.js','display-games-data.js','app.js'])assert.ok(html.includes(fs.readFileSync(path.join(root,name),'utf8')),name+' offline synchronized');
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
console.log(JSON.stringify({rows:387,hitters:199,pitchers:188,franchises:30,allHitterHeaderTotalsMatch:true,historicalRowsPreserved:true,idempotent:true,offlineSynchronized:true}));
