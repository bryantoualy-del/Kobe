// Selection only: this controller has no access to the rules store or dispatcher.
export function createRhythm({select,feedback,schedule=setTimeout,cancel=clearTimeout}){
 let count=0,timer=null;
 function reset(){if(timer!==null)cancel(timer);timer=null;count=0;feedback('Séquence réinitialisée · aucune dépense');}
 return {reset,hit(windowMs=800){
  if(!Number.isInteger(windowMs)||windowMs<400||windowMs>1600){reset();feedback('Fenêtre requise : 400 à 1600 ms');return;}
  count++;feedback(`${count} frappe${count>1?'s':''} · sélection en attente`);
  if(timer!==null)return;
  timer=schedule(()=>{const total=count;timer=null;count=0;if(total===1||total===3){feedback('Pouvoir sélectionné · choisissez les cibles puis confirmez');select(total===1?'pulse':'rally');}else feedback(`${total} frappes : séquence invalide · aucune dépense`);},windowMs);
 }};
}
