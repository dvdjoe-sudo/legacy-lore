const fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm'),zlib=require('node:zlib'),assert=require('node:assert/strict');const c=require('./data.cjs').load();
const original={window:{}};vm.createContext(original);vm.runInContext(cp.execFileSync('git',['show','14ac62685cffd1a32c8e3bf798d91c0d709bca03:data/ll_index.js'],{encoding:'utf8',maxBuffer:20000000}),original);
const before=JSON.parse(zlib.gunzipSync(Buffer.from(original.window.LL_PACK.index,'base64'))),after=JSON.parse(zlib.gunzipSync(Buffer.from(c.LL_PACK.index,'base64')));
for(const t of after.teams){const b=before.teams.find(b=>b.key===t.key);t.py=b.py;t.py_bm=b.py_bm;}assert.deepEqual(after,before);
const frozen=cp.execFileSync('git',['diff','--name-only','14ac62685cffd1a32c8e3bf798d91c0d709bca03','--','data/teams','loader.js','compare.js','style.css','index.html'],{encoding:'utf8'});assert.equal(frozen.trim(),'');
const old=cp.execFileSync('git',['show','14ac62685cffd1a32c8e3bf798d91c0d709bca03:engine.js'],{encoding:'utf8'}),now=fs.readFileSync('engine.js','utf8').replace(/\r\n/g,'\n');assert.equal(now.slice(now.indexOf('const BM_HCOLS'),now.indexOf('const API=')),old.slice(old.indexOf('const BM_HCOLS'),old.indexOf('const API=')));
console.log('Frozen scoring tables, scoring/BM arithmetic, index metadata/rules, and unrelated UI files unchanged.');

