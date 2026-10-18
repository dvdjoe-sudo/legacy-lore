/* Legacy Lore Clubhouse: shareable, read-only roster snapshots. Links never write local settings. */
(function(root){
'use strict';
const MAX_TOKEN=12000, MAX_JSON=9000;
const POS=new Set(['C','1B','2B','3B','SS','LF','CF','RF','DH','P']);
const BENCH=new Set(['C2','UTIL-IF','OF4','FLEX','BAT','BAT2','BAT3','BAT4']);
const ROT=new Set(['SP1','SP2','SP3','SP4','SP5']);
const PEN=new Set(['CL','SU1','SU2','LHS','LONG','MID1','MID2','MID3']);
function validPairs(rows,allowed,max,description){
  if(!Array.isArray(rows)||rows.length>max)throw new Error('Invalid '+description);
  const seen=new Set();
  return rows.map(pair=>{
    if(!Array.isArray(pair)||pair.length!==2)throw new Error('Invalid '+description+' entry');
    const [slot,name]=pair;
    if(typeof slot!=='string'||!allowed.has(slot)||seen.has(slot)||typeof name!=='string'||!name.trim()||name.length>110)throw new Error('Invalid '+description+' value');
    seen.add(slot);return [slot,name];
  });
}
function validate(data,expectedTeam){
  if(!data||typeof data!=='object'||Array.isArray(data)||data.v!==1||
     typeof data.t!=='string'||!(/^[a-z0-9-]{2,40}$/).test(data.t)||
     (expectedTeam&&data.t!==expectedTeam)||
     typeof data.n!=='string'||!data.n.trim()||data.n.length>110||
     typeof data.c!=='string'||data.c.length>100||
     typeof data.m!=='boolean'||typeof data.d!=='boolean')throw new Error('Invalid shared roster');
  const l=validPairs(data.l,POS,9,'lineup');
  const b=validPairs(data.b,BENCH,8,'bench');
  const r=validPairs(data.r,ROT,5,'rotation');
  const p=validPairs(data.p,PEN,7,'bullpen');
  if(l.length!==9||l.filter(x=>x[0]==='P').length!==(data.d?1:0)||
     l.some(x=>x[0]==='DH')===data.d||
     (data.d&&(l[8][0]!=='P'||l[8][1]!==r.find(x=>x[0]==='SP1')?.[1]))||
     l.length+b.length+r.length+p.length!==(data.d?27:26))throw new Error('Shared roster is incomplete or inconsistent');
  const selections=[...l.filter(x=>x[0]!=='P'),...b,...r,...p].map(x=>x[1]);
  if(new Set(selections).size!==26)throw new Error('Shared roster has duplicate players');
  return {v:1,t:data.t,n:data.n,c:data.c,m:data.m,d:data.d,l,b,r,p};
}
function capture(team,output,{city=null,bigMoments=false,noDH=false}={}){
  const data={v:1,t:team.key,n:team.name,c:city?city.city+' ('+city.years.join('–')+')':'',
    m:!!bigMoments,d:!!noDH,
    l:output.lineup.map(x=>[x.pos,x.name]),
    b:Object.entries(output.bench),r:Object.entries(output.rotation),p:Object.entries(output.pen)};
  return validate(data,team.key);
}
function encode(data){
  const json=JSON.stringify(validate(data));
  if(json.length>MAX_JSON)throw new Error('Shared roster is too large');
  const bytes=new TextEncoder().encode(json);
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decode(token,expectedTeam){
  if(typeof token!=='string'||!token||token.length>MAX_TOKEN||!/^[A-Za-z0-9_-]+$/.test(token))throw new Error('Invalid share link');
  try{
    const binary=atob(token.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-token.length%4)%4));
    const bytes=Uint8Array.from(binary,ch=>ch.charCodeAt(0));
    return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)),expectedTeam);
  }catch(e){throw new Error('This roster link is damaged or not supported');}
}
function toText(s){
  const lines=['LEGACY LORE CLUBHOUSE — '+s.n.toUpperCase(),'Shared all-time roster',
    s.c?('City: '+s.c):'Full franchise','Format: '+(s.d?'No DH (pitcher bats ninth)':'With DH')+(s.m?' · Big Moments ON':''),'','LINEUP'];
  s.l.forEach(([pos,name],i)=>lines.push((i+1)+'. '+name+' ('+pos+')'));
  for(const [label,rows] of [['BENCH',s.b],['ROTATION',s.r],['BULLPEN',s.p]]){
    lines.push('',label);
    rows.forEach(([slot,name])=>lines.push(slot+': '+name));
  }
  return lines.join('\n');
}
const API={capture,encode,decode,toText};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
else root.LLShare=API;
})(typeof window!=='undefined'?window:globalThis);
