export const skills=[['Athlétisme',1],['Acrobaties',6],['Discrétion',4],['Escamotage',4],['Arcanes',1],['Histoire',1],['Investigation',1],['Nature',1],['Religion',1],['Dressage',3],['Intuition',9,'Expertise'],['Médecine',3],['Perception',10,'Expertise · valeur de fiche, calcul standard +9'],['Survie',3],['Intimidation',7],['Persuasion',13,'Expertise'],['Représentation',13,'Expertise'],['Tromperie',7]];

const abilities=['Force','Dextérité','Constitution','Intelligence','Sagesse','Charisme'];
const checks=[1,4,5,1,3,7], saves=[-1,6,3,-1,1,9];
export const groups={
 'Caractéristiques':abilities.map((n,i)=>[n,checks[i],`Score ${[8,14,16,8,12,20][i]} · Touche-à-tout`]),
 'Compétences':skills.map(([n,b,rank])=>[n,b,rank??(n==='Acrobaties'?'Maîtrise':'Touche-à-tout')]),
 'Sauvegardes':abilities.map((n,i)=>['Sauvegarde '+n,saves[i],[1,5].includes(i)?'Maîtrise':'']),
 'Initiative':[['Initiative',4,'Touche-à-tout']]
};
export function resolveRoll({name,mode,dice}){
 const row=Object.values(groups).flat().find(([label])=>label===name);
 if(!row||!['normal','adv','dis'].includes(mode)||!Array.isArray(dice)||dice.length!==(mode==='normal'?1:2)||dice.some(x=>!Number.isInteger(x)||x<1||x>20))throw Error('Saisissez un d20 valide par dé demandé.');
 const chosen=mode==='adv'?Math.max(...dice):Math.min(...dice);
 return {label:name,bonus:row[1],mode,dice,total:chosen+row[1]};
}
