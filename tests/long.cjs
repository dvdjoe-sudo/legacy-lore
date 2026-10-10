const fs=require('fs'),assert=require('assert/strict'),{load}=require('./data.cjs'),E=require('../engine.js'),old=require('./fixtures/reviewed-engine.js');const c=load();let checks=0;const ok=(v,m)=>{checks++;assert.ok(v,m)};const changes=[];
const p={id:'fixture',sp_ok:true,rp_ok:false},fixture=w=>({code:'FIX',workload:{fixture:w}}),w={starterIP:300,reliefIP:100,reliefG:80,qualifyingSeasons:3};
ok(E.longQualification(fixture(w),p).type==='LONG/SP6','SP6 boundaries accepted');
for(const [key,value] of [['starterIP',299.999],['reliefIP',99.999],['qualifyingSeasons',2]])ok(!E.longQualification(fixture({...w,[key]:value}),p).ok,key+' under floor rejected');
ok(!E.longQualification(fixture(w),{...p,sp_ok:false}).ok,'starter role fit required');ok(!E.longQualification({workload:{}},p).ok,'missing data cannot certify');
ok(E.longQualification(fixture({...w,starterIP:0,reliefIP:150,reliefG:100}),{...p,sp_ok:false,rp_ok:true}).type==='LONG','historical long relief boundary accepted');
ok(!E.longQualification(fixture({...w,starterIP:0,reliefIP:149.99,reliefG:100}),{...p,sp_ok:false,rp_ok:true}).ok,'short relief cannot qualify using total workload');
for(const t0 of c.LL_DATA.teams)for(const city of [null,...((c.LL_CITIES[t0.code]||{}).cities||[])])for(const bm of [false,true]){
 const t=city?E.withCity(t0,city):t0,team=bm?E.withBM(t):t,b=old.build(team,{}),o=E.build(team,{});
 ok(JSON.stringify(o.rotation)===JSON.stringify(b.rotation),t.key+' rotation protected');
 for(const k of ['CL','SU1','SU2','LHS'])ok(o.pen[k]===b.pen[k],t.key+' '+k+' protected');
 const q=o._objs.roles.LONG;
 if(q){const f=E.longQualification(team,q);ok(f.ok,t.key+' certified LONG');ok(f.workload.qualifyingSeasons>=3&&f.workload.reliefIP>=100,t.key+' workload floors');ok(!o._objs.rot.some(r=>r.id===q.id),t.key+' emergency outside rotation');}
 else ok((o.gaps||[]).includes('LONG')||!t.hitters.length,t.key+' vacancy flag');
 if(JSON.stringify(o.pen)!==JSON.stringify(b.pen))changes.push({team:t.key,city:city?.key||null,big_moments:bm,before:b.pen,after:o.pen,qualification:q?E.longQualification(team,q):null,log:o.pen_log.filter(x=>x.includes('LONG'))});
}
const t=c.LL_DATA.teams.find(t=>t.key==='mets'),zero=Object.fromEntries(t.pitchers.map(p=>[p.id,{starterIP:0,reliefIP:0,reliefG:0,qualifyingSeasons:0}]));
const empty={...t,workload:zero};delete empty._S;delete empty._P;delete empty._bmT;const vacancy=E.build(empty,{});ok(!vacancy.pen.LONG&&vacancy.warnings.some(w=>w.slot==='LONG'),'no qualified candidate produces vacancy');
const raw={staff:{[t.pitchers[0].name]:'LONG'}},review=E.reviewPins(empty,raw);ok(!review.pins.staff[t.pitchers[0].name],'invalid LONG pin rejected');raw.acknowledged=review.warnings.filter(w=>!w.structural).map(w=>w.key);ok(E.build(empty,raw).pen.LONG===t.pitchers[0].name,'acknowledged LONG exception retained');
const prior=old.build(t,{}),used=new Set([...prior._objs.rot,...prior._objs.pen].map(p=>p.id)),candidate=t.pitchers.filter(p=>p.sp_ok&&!used.has(p.id)).sort((a,b)=>b.SPx-a.SPx)[0];
const emergency={...t,workload:{...zero,[candidate.id]:w}};delete emergency._S;delete emergency._P;delete emergency._bmT;
const forced=E.build(emergency,{});ok(forced.pen.LONG===candidate.name,'best qualified starter outside five fills emergency LONG');ok(forced._objs.pen.length===7,'emergency preserves bullpen capacity');
const protectedPins={staff:Object.fromEntries(prior._objs.pen.map(p=>[p.name,'PEN']))};const protectedBuild=E.build(emergency,protectedPins);ok(!protectedBuild.pen.LONG,'protected bullpen prevents forced replacement');ok(protectedBuild.warnings.some(w=>w.slot==='LONG'),'protected vacancy warning');
fs.writeFileSync('../../outputs/preview-long-results.json',JSON.stringify({checks,builds:108,changes},null,2));console.log(JSON.stringify({checks,builds:108,changed_builds:changes.length}));
