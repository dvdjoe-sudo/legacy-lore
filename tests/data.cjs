const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function load(){
 const ctx={TextDecoder,Uint8Array,atob,performance,fflate:{gunzipSync:u=>zlib.gunzipSync(u)}}; ctx.window=ctx;
 vm.createContext(ctx);
 for(const file of ['data/ll_index.js','loader.js','data/ll_cities.js','data/ll_workload.js',...fs.readdirSync(path.join(root,'data/teams')).map(f=>'data/teams/'+f)]) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 ctx.LL_DATA.teams.forEach(t=>ctx.LLData.loadSync(t.key));
 ctx.LL_DATA.teams.forEach(t=>t.workload=ctx.LL_WORKLOAD[t.code]);
 return ctx;
}
module.exports={load,root};
