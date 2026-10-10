const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');const E=require('../engine.js'),{load,root}=require('./data.cjs');const c=load();
const file=root+'/data/ll_index.js',src=fs.readFileSync(file,'utf8');const packed=JSON.parse(zlib.gunzipSync(Buffer.from(c.LL_PACK.index,'base64')));
for(const t of c.LL_DATA.teams){const p=packed.teams.find(x=>x.key===t.key);for(const [key,team] of [['py',t],['py_bm',E.withBM(t)]]){const o=E.build(team,{});delete o._objs;p[key]=o;}}
const index=zlib.gzipSync(JSON.stringify(packed)).toString('base64');fs.writeFileSync(file,src.replace(c.LL_PACK.index,index));
console.log('Updated only derived selection reference outputs for 30 teams / both modes.');
