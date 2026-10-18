const assert = require('node:assert/strict');
const Share = require('../share.js');
const names='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function sample(noDH=false){
  const lineupPositions=noDH?['C','1B','2B','3B','SS','LF','CF','RF','P']:['C','1B','2B','3B','SS','LF','CF','RF','DH'];
  const lineupNames=noDH?names.slice(0,8).concat([names[14]]):names.slice(0,9);
  const benchNames=noDH?names.slice(8,14):names.slice(9,14);
  const benchSlots=noDH?['C2','UTIL-IF','OF4','FLEX','BAT','BAT2']:['C2','UTIL-IF','OF4','FLEX','BAT'];
  const o={lineup:lineupPositions.map((pos,i)=>({pos,name:lineupNames[i]})),
    bench:Object.fromEntries(benchSlots.map((pos,i)=>[pos,benchNames[i]])),
    rotation:Object.fromEntries(['SP1','SP2','SP3','SP4','SP5'].map((slot,i)=>[slot,names[14+i]])),
    pen:Object.fromEntries(['CL','SU1','SU2','LHS','LONG','MID1','MID2'].map((slot,i)=>[slot,names[19+i]]))};
  return o;
}
for(const noDH of [false,true]){
  const team={key:'yankees',name:'New York Yankees'};
  const snap=Share.capture(team,sample(noDH),{noDH,bigMoments:!noDH});
  const token=Share.encode(snap);
  const decoded=Share.decode(token,'yankees');
  assert.deepEqual(decoded,snap);
  assert.equal(decoded.l.length,9);
  assert.equal(decoded.l[8][0],noDH?'P':'DH');
  assert.equal(decoded.b.length,noDH?6:5);
  assert.equal(new Set([...decoded.l.filter(x=>x[0]!=='P'),...decoded.b,...decoded.r,...decoded.p].map(x=>x[1])).size,26);
  assert.match(Share.toText(decoded),/LINEUP/);
  assert.throws(()=>Share.decode(token,'mets'),/link|roster|damaged/i);
}
const unicode=Share.capture({key:'yankees',name:'New York Yankees'},sample(false));
unicode.l[0][1]='José Hernández – ⚾';
const unicodeDecoded=Share.decode(Share.encode(unicode),'yankees');
assert.equal(unicodeDecoded.l[0][1],'José Hernández – ⚾');
assert.throws(()=>Share.decode('not%a%valid','yankees'),/link/i);
assert.throws(()=>Share.decode('A'.repeat(12001),'yankees'),/link/i);
assert.throws(()=>Share.encode({...unicode,l:unicode.l.slice(1)}),/incomplete|invalid/i);
assert.throws(()=>Share.encode({...unicode,l:[[unicode.l[0][0],'A'],...unicode.l.slice(1)].map((x,i)=>i===1?['C',x[1]]:x)}),/invalid/i);
console.log('Shared roster encoding and validation assertions passed.');
