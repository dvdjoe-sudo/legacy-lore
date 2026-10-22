const assert=require('node:assert/strict');
const E=require('../engine.js'), {load}=require('./data.cjs');
const ctx=load();
global.window={LLEngine:E,LL_DATA:ctx.LL_DATA,LL_CITIES:ctx.LL_CITIES};
require('../rankings.js');
const R=global.window.LLRankings;
let reviewed=0,complete=0,incomplete=0;
for(const bm of [false,true]){
 for(const base of ctx.LL_DATA.teams){
  const t=bm?E.withBM(base):base;
  const o=E.build(t,{}),r=R.rosterParts(t,o);
  const count=Object.keys(o.start).length+Object.keys(o.bench).length+Object.keys(o.rotation).length+Object.keys(o.pen).length;
  assert.equal(r.fullCount,count,'roster count '+base.key);
  assert.equal(r.lineup.length,o.lineup.length,'lineup '+base.key);
  assert.equal(r.bench.length,Object.keys(o.bench).length,'bench '+base.key);
  assert.equal(r.rotation.length,Object.keys(o.rotation).length,'rotation '+base.key);
  assert.equal(r.bullpen.length,Object.keys(o.pen).length,'pen '+base.key);
  assert.equal(r.ace,o.rotation.SP1,'ace '+base.key);
  if(r.full!==null){
    assert.equal(count,26,'complete 26 '+base.key);
    assert.equal(r.bench.length,5,'complete bench '+base.key);
    assert.equal(r.rotation.length,5,'complete rotation '+base.key);
    assert.equal(r.bullpen.length,7,'complete bullpen '+base.key);
    assert.ok(Math.abs(r.full-(r.nine+r.benchValue+r.rotationValue+r.bullpenValue))<1e-8,'breakdown '+base.key);
    complete++;
  }else incomplete++;
  reviewed++;
 }
 const rows=R.entries(bm);
 assert.equal(rows.length,30,'30 franchises in full ranking');
 assert.ok(rows.every(row=>row.full===null||Number.isFinite(row.full)),'numeric full score');
}
const results={};
for(const mode of ['full','nine','ace']){
 R.state.mode=mode;
 const html=R.view(false);
 assert.match(html,/All-Time Team Rankings/);
 assert.match(html,/rank-roster-details/);
 assert.match(html,/Batting order/);
 assert.match(html,/Bullpen/);
 assert.match(html,mode==='full'?/Bench \(5\)/:mode==='nine'?/Starting Nine/:/Ace Value/);
 results[mode]=html.length;
}
R.state.scope='city';
const cityRows=R.entries(false);
assert.ok(cityRows.length>=30,'historical editions available');
console.log(JSON.stringify({franchises:ctx.LL_DATA.teams.length,reviewed,complete,incomplete,cityEditions:cityRows.length,modeHtmlLengths:results},null,2));
