function fpRender(){
 let list=MODELS.filter(m=>(!F.shape.size||F.shape.has(m.cat)||F.shape.has(m.s)&&m.cat!=='plunge')&&[...F.feat].every(f=>m.feats.includes(f))&&m.sizes.some(z=>z.L<=F.len+.3&&z.W<=F.wid+.1));
 const so={len:(a,b)=>b.L-a.L,'len-a':(a,b)=>a.L-b.L,name:(a,b)=>a.n.localeCompare(b.n),gal:(a,b)=>(b.gal||0)-(a.gal||0)}[F.sort];list.sort(so);
 $('#fpCards').innerHTML=list.map(cardHTML).join('');$$('#fpCards .pc').forEach((c,i)=>c.style.animationDelay=(i*.04)+'s');
 $('#fpCount').textContent=list.length+(list.length===1?' model':' models');$('#fpApply').textContent='Show '+list.length+(list.length===1?' model':' models');const nf=F.shape.size+F.feat.size+(F.len<40?1:0)+(F.wid<16?1:0);$('#fpOpenN').textContent=nf?'('+nf+')':'';$('#fpEmpty').classList.toggle('on',!list.length);
 const act=[...[...F.shape].map(v=>['shape',v,CAT_LBL[v]]),...[...F.feat].map(v=>['feat',v,FT_LBL[v]])];if(F.len<40)act.push(['len',0,'≤ '+F.len+' ft long']);if(F.wid<16)act.push(['wid',0,'≤ '+F.wid+' ft wide']);
 $('#fpActive').innerHTML=act.map(a=>`<button data-t="${a[0]}" data-v="${a[1]}">${a[2]}</button>`).join('');
 $$('#fpActive button').forEach(b=>b.onclick=()=>{const t=b.dataset.t;if(t==='len'){F.len=40;$('#fpLen').value=40}else if(t==='wid'){F.wid=16;$('#fpWid').value=16}else F[t].delete(b.dataset.v);fpSync()});
 $$('#fpCards .cmp').forEach(b=>b.onclick=()=>toggleCmp(b.dataset.id))}
function fpSync(){$$('.fp-chips').forEach(g=>$$('button',g).forEach(b=>b.classList.toggle('on',F[g.dataset.f].has(b.dataset.v))));$('#fpLenV').textContent=F.len+' ft';$('#fpWidV').textContent=F.wid+' ft';setP($('#fpLen'));setP($('#fpWid'));fpRender()}
$$('.fp-chips').forEach(g=>$$('button',g).forEach(b=>b.onclick=()=>{const s=F[g.dataset.f];s.has(b.dataset.v)?s.delete(b.dataset.v):s.add(b.dataset.v);fpSync()}));
$('#fpLen').addEventListener('input',e=>{F.len=+e.target.value;fpSync()});$('#fpWid').addEventListener('input',e=>{F.wid=+e.target.value;fpSync()});
$('#fpSort').onchange=e=>{F.sort=e.target.value;fpRender()};
function fpSheet(o){document.body.classList.toggle('fp-open-s',o);$('#fpOpen').setAttribute('aria-expanded',o)}
$('#fpOpen').onclick=()=>fpSheet(true);$('#fpBack').onclick=()=>fpSheet(false);$('#fpApply').onclick=()=>fpSheet(false);
const fpClear=()=>{F.shape.clear();F.feat.clear();F.len=40;F.wid=16;$('#fpLen').value=40;$('#fpWid').value=16;fpSync()};$('#fpClear').onclick=fpClear;$('#fpReset').onclick=fpClear;
$('#ctClear').onclick=()=>{CMP.clear();Brief.set({cmp:[]});cmpUpd();fpRender()};
$('#ctGo').onclick=()=>{const ms=[...CMP].map(byId);if(ms.length<2){toast('Pick at least 2 models to compare.');return}
 const row=(l,f,c='')=>`<div class="mo-r ${c}" style="--n:${ms.length}"><span>${l}</span>${ms.map(f).join('')}</div>`;
 $('#moTbl').innerHTML=row('',m=>`<a href="/fiberglass-pools/${m.id}/">${m.n}</a>`,'hd')+row('Photo',m=>`<div class="mo-ph">${pic(m.photo,{sizes:'300px'})}</div>`,'pl')+row('Type',m=>`<span>${m.t}</span>`)+row('Length',m=>`<b>${m.Ls}</b>`)+row('Width',m=>`<b>${m.Ws}</b>`)+row('Deep end',m=>`<b>${m.sizes[m.def].Ds||'Spec sheet'}</b>`)+row('Water',m=>`<span>${m.gal?m.gal.toLocaleString()+' gal':'Spec sheet'}</span>`)+row('Features',m=>`<span>${m.feats.map(f=>FT_LBL[f]).join(', ')||'—'}</span>`)+row('Versions',m=>`<span>${m.sizes.map(z=>zLabel(m,z)).join(' · ')}</span>`);
 $('#cmpModal').classList.add('on')};
$('#moX').onclick=()=>$('#cmpModal').classList.remove('on');$('#cmpModal').addEventListener('click',e=>{if(e.target.id==='cmpModal')$('#cmpModal').classList.remove('on')});
$('#moTbl').addEventListener('click',e=>{if(e.target.closest('a'))$('#cmpModal').classList.remove('on')});
(()=>{const q=new URLSearchParams(location.search);const s=q.get('shape'),f=q.get('feat');s&&F.shape.add(s);f&&F.feat.add(f);fpSync();cmpUpd()})();
