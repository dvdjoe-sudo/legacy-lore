const assert=require('node:assert/strict');
const E=require('../engine.js'), {load}=require('./data.cjs');
const {LL_DATA}=load();
let tested=0;
for(const team of LL_DATA.teams){
  for(const opts of [{no_dh:true},{no_dh:true,bench_size:6},{no_dh:true,bench_size:7}]){
    const o=E.build(team,{rules:opts});
    assert.equal(Object.keys(o.start).length,8,team.key+' eight fielders');
    assert(!('DH' in o.start),team.key+' DH is disabled');
    assert.equal(o.lineup.length,9,team.key+' batting order');
    assert.equal(o.lineup[8].pos,'P',team.key+' pitcher bats ninth');
    assert.equal(o.lineup[8].name,o.rotation.SP1,team.key+' pitcher identity');
    assert.equal(Object.keys(o.bench).length,opts.bench_size===7?8:opts.bench_size===6?7:6,team.key+' extra bench hitter');
    assert.equal(Object.keys(o.pen).length,12-(opts.bench_size||5),team.key+' staff balance');
    assert.equal([...Object.values(o.start),...Object.values(o.bench),...Object.values(o.rotation),...Object.values(o.pen)].length,26,team.key+' total 26');
    const names=[...Object.values(o.start),...Object.values(o.bench),...Object.values(o.rotation),...Object.values(o.pen)];
    assert.equal(new Set(names).size,26,team.key+' unique players');
    tested++;
  }
  const standard=E.build(team,{});
  assert('DH' in standard.start,team.key+' DH default unchanged');
  assert.equal(standard.lineup.length,9,team.key+' DH lineup');
}
console.log('No-DH roster-mode assertions passed for '+tested+' configurations across '+LL_DATA.teams.length+' franchises.');
