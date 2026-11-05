function companionRestConfirm(kind,detail,apply){
 let d=document.getElementById('companionRestConfirm');
 if(!d){
  let s=document.createElement('style');s.id='companionRestConfirmStyle';s.textContent=`
dialog.companion-rest-confirm{--rest-accent:#c98242;width:min(480px,calc(100% - 24px));max-height:calc(100dvh - 32px);padding:20px;border:1px solid var(--rest-accent);border-radius:20px;background:linear-gradient(150deg,#222832,#10141a);color:#f4f6f8;box-shadow:0 25px 90px #000,0 0 35px color-mix(in srgb,var(--rest-accent) 24%,transparent);text-align:center}
dialog.companion-rest-confirm::backdrop{background:#030508dc;backdrop-filter:blur(8px)}
.companion-rest-kicker{color:var(--rest-accent);font-size:.72rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
.companion-rest-symbol{font:800 clamp(2.4rem,9vw,4.2rem)/1 Georgia,serif;color:#f8fbff;text-shadow:0 0 26px color-mix(in srgb,var(--rest-accent) 58%,transparent);margin:9px 0 5px}
.companion-rest-question{margin:8px 0 3px;font:700 1.18rem Georgia,serif;color:#f5f7f9}
.companion-rest-detail{margin:9px auto 15px;max-width:400px;color:#bcc5ce;font-size:.86rem;line-height:1.48}
.companion-rest-actions{display:grid;grid-template-columns:1fr;gap:9px}
.companion-rest-actions button{min-height:50px;border-radius:11px;font-weight:900;padding:9px 12px}
.companion-rest-go{border:1px solid var(--rest-accent);background:linear-gradient(135deg,color-mix(in srgb,var(--rest-accent) 58%,#18202a),color-mix(in srgb,var(--rest-accent) 82%,#27303a));color:#fff;box-shadow:0 0 20px color-mix(in srgb,var(--rest-accent) 20%,transparent)}
.companion-rest-cancel{border:1px solid #4b535d;background:#20262d;color:#cbd2d9}
`;document.head.appendChild(s);
  d=document.createElement('dialog');d.id='companionRestConfirm';d.className='companion-rest-confirm';d.innerHTML='<div class="companion-rest-kicker">Récupération</div><div class="companion-rest-symbol"></div><p class="companion-rest-question"></p><div class="companion-rest-detail"></div><div class="companion-rest-actions"><button class="companion-rest-go" type="button"></button><button class="companion-rest-cancel" type="button">Annuler</button></div>';document.body.appendChild(d);
  d.querySelector('.companion-rest-cancel').onclick=()=>d.close();
  d.addEventListener('click',e=>{if(e.target===d)d.close()});
  d.querySelector('.companion-rest-go').onclick=()=>{let fn=d._restApply;d._restApply=null;d.close();if(fn)fn()};
 }
 let isLong=kind==='long';d.querySelector('.companion-rest-symbol').textContent=isLong?'☾':'↻';d.querySelector('.companion-rest-question').textContent=isLong?'Effectuer un repos long ?':'Effectuer un repos court ?';d.querySelector('.companion-rest-detail').textContent=detail;d.querySelector('.companion-rest-go').textContent=isLong?'Confirmer le repos long':'Confirmer le repos court';d._restApply=apply;if(!d.open)d.showModal();
}
