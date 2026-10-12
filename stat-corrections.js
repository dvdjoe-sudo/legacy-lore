(function(root){
 'use strict';
 const data=root.LL_STAT_CORRECTIONS;
 function apply(t){const c=data.teams[t.code];if(!c||!t.hitters)return t;for(const h of t.hitters){const p=c.positions[h.id];if(p)for(const [pos,g] of Object.entries(p))h['g_'+pos]=g;}return t;}
 function era(code,id,year,role){const v=data.teams[code]?.era[id+'|'+year+'|'+role];return v===undefined?null:v;}
 root.LLStatCorrections={apply,era};
})(window);
