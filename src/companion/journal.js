export function initJournal(panel,api){
 const host=panel.querySelector('#log');
 let shared=[],roomKey='';
 try{roomKey=localStorage.getItem('kobe-last-activity-room')||'';if(roomKey)shared=RPGActivityModel.merge([],JSON.parse(localStorage.getItem(roomKey)||'[]'));}catch{}
 document.addEventListener('kobe-activity',event=>{
   const key='kobe-room-activity:'+event.detail.room;
   if(key!==roomKey){roomKey=key;shared=[];try{shared=RPGActivityModel.merge([],JSON.parse(localStorage.getItem(key)||'[]'));}catch{}}
   shared=RPGActivityModel.merge(shared,event.detail.rows);
   try{localStorage.setItem(key,JSON.stringify(shared));localStorage.setItem('kobe-last-activity-room',key);}catch{}
   journal.render();
 });
 const rows=()=>api.events().map(e=>({
   id:e.id,actionId:e.commandId??e.id,actorId:'kobe',actor:'Kobe',
   combatId:e.after?.turn?.combatId,round:Number(e.after?.combat?.round)||1,turn:(Number(e.after?.turn?.startRevision)||0)+1,
   kind:e.kind,action:e.sourceId==='private-roll'?'Jet privé':e.label,text:e.label,
   roll:e.rolls?.length?e.rolls.join(' · '):undefined,done:e.sourceId==='turn-end',local:true
 })).concat(shared);
 const journal=window.RPGJournalUI.mount(host,{getRows:rows});
 document.addEventListener('kobe-mechanical-update',()=>journal.render());
 const exportButton=document.createElement('button');exportButton.textContent='Exporter';exportButton.id='exportJournal';
 exportButton.onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([api.events().map(e=>e.label).join('\n')],{type:'text/plain;charset=utf-8'}));a.download='kobe-journal.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
 host.querySelector('.rpg-journal-toolbar').append(exportButton);
 journal.render();
}
