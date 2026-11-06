// Gallery: filters, load more and the photo viewer. Data comes from #galData (see build.js).
(()=>{const dataEl=$('#galData');if(!dataEl)return;
const GD=JSON.parse(dataEl.textContent),grid=$('#galGrid'),more=$('#galMore'),count=$('#galCount'),PAGE=24;
const items=GD.i.map(([f,t,m,c,o])=>{const mm=GD.m[m];return{f,t,m,c,tags:{shape:mm?mm[1]:[],model:m?[m]:[],color:c?[c]:[],other:[...(o?o.split(' '):[]),...(mm?[mm[2]]:[])]}}});
const sel={shape:new Set(),model:new Set(),color:new Set(),other:new Set()};
let list=items,shown=PAGE;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const name=it=>it.m?GD.m[it.m][0]:'iTop Pools';
const altBase=it=>it.m?`${it.t}, a Barrier Reef ${GD.m[it.m][0]} fiberglass pool`:it.t;
const seen={};items.forEach(it=>{const a=altBase(it);seen[a]=(seen[a]||0)+1;it.alt=seen[a]>1?`${a} (photo ${seen[a]})`:a});
const alt=it=>it.alt;
const badge=it=>it.m?GD.m[it.m][0]:(GD.o[it.tags.other[0]]||'Pool');
const sw=c=>`linear-gradient(135deg,${GD.c[c][1]},${GD.c[c][2]})`;
const card=(it,i)=>`<a class="gc" href="/gallery/${it.f}-1280.webp" data-i="${i}"><span class="gc-img"><img src="/gallery/${it.f}-640.webp" alt="${esc(alt(it))}" width="640" height="427"${i<3?'':' loading="lazy"'} decoding="async"></span><span class="gc-b">${esc(badge(it))}</span><span class="gc-f"><span class="gc-t"><b>${esc(name(it))}</b><small>${esc(it.t)}</small></span>${it.c?`<span class="gc-c"><i style="background:${sw(it.c)}"></i>${GD.c[it.c][0]}</span>`:''}</span></a>`;
const match=it=>Object.keys(sel).every(k=>!sel[k].size||it.tags[k].some(v=>sel[k].has(v)));
const active=()=>Object.values(sel).some(s=>s.size);
function render(keep){
 list=items.filter(match);if(!keep)shown=PAGE;
 grid.innerHTML=list.length?list.slice(0,shown).map(card).join(''):'<p class="gal-none">No photos match these filters. Try removing one.</p>';
 more.hidden=shown>=list.length;
 count.textContent=`Showing ${Math.min(shown,list.length)} of ${list.length} photo${list.length===1?'':'s'}`;
 $('#gfAll').classList.toggle('on',!active());
 $$('.gf-d').forEach(d=>{const n=sel[d.dataset.k].size;d.querySelector('summary b').textContent=n?` (${n})`:'';d.classList.toggle('has',!!n)});
 const q=new URLSearchParams();Object.entries(sel).forEach(([k,s])=>s.size&&q.set(k,[...s].join(',')));
 history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:''));
}
// Start from the address bar, so links like /our-work/?model=bondi open pre-filtered
const qs=new URLSearchParams(location.search);
Object.keys(sel).forEach(k=>(qs.get(k)||'').split(',').filter(Boolean).forEach(v=>{const box=$(`.gf-d[data-k="${k}"] input[value="${v}"]`);if(box){box.checked=true;sel[k].add(v)}}));
$$('.gf-d input').forEach(box=>box.addEventListener('change',()=>{const s=sel[box.closest('.gf-d').dataset.k];box.checked?s.add(box.value):s.delete(box.value);render()}));
const clear=()=>{Object.values(sel).forEach(s=>s.clear());$$('.gf-d input').forEach(b=>b.checked=false);$$('.gf-d').forEach(d=>d.open=false);render()};
$('#gfAll').onclick=clear;$('#gfClear').onclick=clear;
// One menu open at a time; close on outside click or Escape
$$('.gf-d').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)$$('.gf-d').forEach(o=>o!==d&&(o.open=false))}));
document.addEventListener('click',e=>{if(!e.target.closest('.gf-d'))$$('.gf-d[open]').forEach(d=>d.open=false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.gf-d[open]').forEach(d=>{d.open=false;d.querySelector('summary').focus()})});
more.onclick=()=>{shown+=PAGE;render(true);track&&track('gallery_load_more',{shown})};
// Photo viewer
const lb=$('#galLb'),lbImg=lb.querySelector('img'),lbB=lb.querySelector('figcaption b'),lbS=lb.querySelector('figcaption span');let cur=0;
function show(i){cur=(i+list.length)%list.length;const it=list[cur];lbImg.src=`/gallery/${it.f}-1280.webp`;lbImg.alt=alt(it);lbB.textContent=[name(it),it.c&&GD.c[it.c][0]].filter(Boolean).join(' · ');lbS.textContent=`${it.t} · ${cur+1} of ${list.length}`;
 [cur+1,cur-1].forEach(j=>{const n=list[(j+list.length)%list.length];if(n)new Image().src=`/gallery/${n.f}-1280.webp`})}
grid.addEventListener('click',e=>{const a=e.target.closest('.gc');if(!a||!lb.showModal)return;e.preventDefault();show(+a.dataset.i);lb.showModal()});
lb.querySelector('.glb-x').onclick=()=>lb.close();
lb.querySelector('.glb-p').onclick=()=>show(cur-1);lb.querySelector('.glb-n').onclick=()=>show(cur+1);
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
let sx=null;lb.addEventListener('pointerdown',e=>sx=e.clientX);lb.addEventListener('pointerup',e=>{if(sx!==null&&Math.abs(e.clientX-sx)>50)show(cur+(e.clientX<sx?1:-1));sx=null});
render();
})();
