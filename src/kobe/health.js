import {afterDamage} from "./combat.js";
const need=(v,m)=>{if(!v)throw Error(m);};
const integer=(v,min,max)=>need(Number.isSafeInteger(v)&&v>=min&&v<=max,"Nombre hors limites.");
export const hpOf=(s,id)=>id==="kobe"?s.hp:s.combat.targets.find(t=>t.id===id)?.hp;
export function roll(values, n, faces) {
  need(Array.isArray(values) && values.length === n, `${n}d${faces} requis.`);
  values.forEach((v) => integer(v, 1, faces));
  return values.reduce((a, b) => a + b, 0);
}
export function applyHP(s, id, amount, healing, c) {
  const hp = hpOf(s, id);
  if (!hp) return "à annoncer (PV inconnus)";
  if (healing) {
    if (id === "kobe") need(!s.combat.death.dead, "Un soin ne ressuscite pas.");
    const old = hp.current;
    hp.current = Math.min(hp.max, hp.current + amount);
    if (id === "kobe" && hp.current > 0)
      s.combat.death = { success: 0, failure: 0, stable: false, dead: false };
    return `+${hp.current - old} PV`;
  }
  const old = hp.current,
    absorbed = Math.min(hp.temp, amount);
  hp.temp -= absorbed;
  if (id !== "kobe") s.combat.targets.find((t) => t.id === id).temp = hp.temp;
  if (!hp.temp) hp.source = null;
  hp.current = Math.max(0, hp.current - amount + absorbed);
  if (id === "kobe") afterDamage(s, amount, c.id, old, false, absorbed);
  return `−${old - hp.current} PV, ${absorbed} PV temp absorbés`;
}
