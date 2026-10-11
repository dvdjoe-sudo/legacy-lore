const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function buildOffline(root=path.resolve(__dirname,'..')){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8');let html=read('download/legacy_lore.html');
 const sources=[['engine.js','/* Legacy Lore clubhouse engine'],['app.js','/* Legacy Lore Clubhouse v1.9'],['compare.js','/* Legacy Lore app v1.9 Compare mode'],['companion.js','window.LL_COMPANION_DATA=']];
 for(const [file,start] of sources){let replaced=0;html=html.replace(/<script[^>]*>([\s\S]*?)<\/script>/g,(full,body)=>{if(!body.trimStart().startsWith(start))return full;replaced++;return '<script>\n'+read(file)+'\n</script>';});assert.equal(replaced,1,file+' inline script');}
 let styles=0;html=html.replace(/<style[^>]*>[\s\S]*?<\/style>/g,()=>'<style>\n'+read(['style.css','companion.css'][styles++]).replace(/url\("assets\/([^" ]+\.webp)"\)/g,(_,name)=>'url("data:image/webp;base64,'+fs.readFileSync(path.join(root,'assets',name)).toString('base64')+'")')+'\n</style>');assert.equal(styles,2,'base and companion styles');
 const index=read('data/ll_index.js').match(/index:"([^"]+)"/)[1];let replaced=0;html=html.replace(/(window\.LL_PACK=\{format:"ll-pack-1",index:")[^"]+("\s*,)/g,(_,a,b)=>{replaced++;return a+index+b;});assert.equal(replaced,1,'inline packed index');return html;
}
if(require.main===module){const root=path.resolve(__dirname,'..'),target=path.join(root,'download/legacy_lore.html'),html=buildOffline(root);if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n'),html.replace(/\r\n/g,'\n'),'Offline app is stale; run tests/update-offline.cjs');else fs.writeFileSync(target,html);console.log('Offline app includes current engine, app, comparison, companion, styles and packed index.');}
module.exports={buildOffline};
