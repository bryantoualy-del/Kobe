// Lifecycle extensions called by the existing combat engine, never a second clock.
export function cleanupSpellEffect(s,e){
 if(e.spellId==='aid'&&e.applied){for(const id of e.targetIds){const hp=id==='kobe'?s.hp:s.combat.targets.find(t=>t.id===id)?.hp;if(hp){hp.max=Math.max(1,hp.max-e.amount);hp.current=Math.max(0,Math.min(hp.max,hp.current-e.amount));}}}
 if(e.spellId==='enhance-ability'&&e.ability==='CON'){for(const id of e.targetIds){const hp=id==='kobe'?s.hp:s.combat.targets.find(t=>t.id===id)?.hp;if(hp?.source===e.id){hp.temp=0;hp.source=null;}}}
}
export function removeSpellEffects(s,predicate){const removed=s.effects.filter(predicate);for(const e of removed)cleanupSpellEffect(s,e);s.effects=s.effects.filter(e=>!removed.includes(e));return removed;}
