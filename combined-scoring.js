(function(root){
'use strict';
const scores=root.LL_COMBINED_SCORES;
root.LL_DATA.version='v0.9.8 + slot scoring v1';
root.LL_DATA.bm.engine='v0.9.8 + slot scoring v1';
root.LL_DATA.rules='CURRENT SLOT SCORING (v1, October 12, 2026)\nSlot value = Off-APEX + projected glove value + positive position credit. Position rates (runs/150): C 27.5; 1B 2.5; 2B, 3B, CF 17.5; SS 22.5; LF, RF 7.5. DH adds no glove or position credit. Contributions use existing APEX exposure. LF, CF and RF use separate appearances, eligibility and regressed fielding rates. Total APEX, batting, baserunning and pitcher input scores remain the archived engine values. The roster selection references are JavaScript snapshots.\n\nARCHIVED BASE ENGINE RULES (slot-adjustment and pooled LF/RF passages below are superseded by the current slot rules above):\n\n'+root.LL_DATA.rules;

const prior=root.LLStatCorrections.apply;
for(const t of root.LL_DATA.teams){const data=scores[t.code];if(data){t.py=data.py;t.py_bm=data.py_bm;}}
root.LLStatCorrections.apply=function(t){prior(t);const data=scores[t.code];if(!data)return t;for(const h of t.hitters){const fields=data.scores[h.id];if(fields)Object.assign(h,fields);}delete t._S;delete t._P;delete t._bmT;t.py=data.py;t.py_bm=data.py_bm;return t;};
})(window);
