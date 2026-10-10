const fs=require('fs'),assert=require('assert/strict'),{load}=require('./data.cjs'),E=require('../engine.js');const c=load();let seed=20261009;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};let builds=0;const failures=[];
for(const t of c.LL_DATA.teams)for(let trial=0;trial<20;trial++){
 const pins={roster:{},staff:{},lineup:{},rules:{}};
 for(let i=0;i<5;i++)pins.roster[t.hitters[rnd(t.hitters.length)].name]=['C','1B','SS','DH','C2','OF4','BAT','invalid'][rnd(8)];
 for(let i=0;i<5;i++)pins.staff[t.pitchers[rnd(t.pitchers.length)].name]=['ROT','PEN','CL','SU1','LHS','LONG','MID1','invalid'][rnd(8)];
 for(let i=0;i<5;i++)pins.lineup[t.hitters[rnd(t.hitters.length)].name]=rnd(12);
 if(trial%3===0){const r=E.reviewPins(t,pins);pins.acknowledged=r.warnings.filter(w=>!w.structural).map(w=>w.key);}
 try{const o=E.build(trial%2?E.withBM(t):t,pins),rows=[...Object.values(o._objs.start),...Object.values(o._objs.bench),...o._objs.rot,...o._objs.pen];assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,'duplicate player');assert.equal(new Set(o.lineup.map(x=>x.name)).size,o.lineup.length,'duplicate lineup');assert.ok(o._objs.rot.length<=5&&o._objs.pen.length<=7,'staff capacity');assert.ok(Number.isFinite(o.team_runs)||(o.team_runs===null&&o.warnings.some(w=>w.kind==='value')),'finite or explicitly unavailable team value');}catch(e){failures.push({team:t.key,trial,message:e.message,pins});}builds++;
}
fs.writeFileSync('../../outputs/preview-stress-results.json',JSON.stringify({seed:20261009,builds,failures},null,2));console.log(JSON.stringify({builds,failures:failures.length}));assert.equal(failures.length,0);
