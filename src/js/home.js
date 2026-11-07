// finder quiz
const QZ={};
function qzScore(m){let s=50;const u=QZ.use,y=QZ.yard,l=QZ.look,L=m.L;
 if(u==='lounge'){if(m.feats.includes('ledge'))s+=25;if(m.spa)s+=10;if(L>=30)s+=5}
 if(u==='play'){if(m.feats.includes('ledge'))s+=12;if(m.s==='free')s+=10;if(m.W>=15)s+=12;if(m.cat==='plunge')s-=20}
 if(u==='laps'){if(m.s==='rect')s+=18;if(L>=35)s+=22;if(m.s!=='rect')s-=8;if(L<26)s-=25}
 if(u==='relax'){if(m.spa)s+=40;if(m.feats.includes('ledge'))s+=6;if(m.cat==='plunge')s+=6}
 if(y==='s'){if(L<=24)s+=30;else if(L<=30)s+=10;if(L>34)s-=40}
 if(y==='m'){if(L>=26&&L<=35.3)s+=25;if(L>36)s-=15;if(L<20)s-=10}
 if(y==='l'){if(L>=35)s+=25;if(L<26)s-=15}
 if(l&&l!=='any'){if(m.s===l)s+=25;else s-=8}
 return Math.max(40,Math.min(99,Math.round(s*.92)))}
function qzGo(i){$$('.fd-q').forEach(q=>{const n=+q.dataset.q;q.classList.toggle('on',n===i);q.classList.toggle('past',n<i)});$('#fdBar').style.width=(i/3*100)+'%'}
$$('.fd-opts').forEach(g=>$$('button',g).forEach(b=>b.onclick=()=>{QZ[g.dataset.k]=b.dataset.v;const i=+g.closest('.fd-q').dataset.q;if(i<2)qzGo(i+1);else qzShow()}));
function qzShow(){$$('.fd-q').forEach(q=>{q.classList.remove('on');q.classList.add('past')});$('#fdBar').style.width='100%';
 const top=MODELS.map(m=>({m,s:qzScore(m)})).sort((a,b)=>b.s-a.s||b.m.L-a.m.L).slice(0,3);
 const r=$('#fdRes');r.innerHTML=`<span class="fd-n">Your shortlist</span><h3>Best matches for your yard</h3><div class="fd-list">${top.map(({m,s})=>`<a class="fd-item" href="/fiberglass-pools/${m.id}/"><div class="pl">${planSVG(m,{fin:'california'})}</div><div><b>${m.n}</b><small>${m.t} · ${m.Ls} × ${m.Ws}${m.D?' · '+ft(m.D)+' deep':''}</small></div><div class="m">${s}%<small>MATCH</small></div></a>`).join('')}</div>
 <div class="fd-acts"><a href="/free-3d-design/?m=${top[0].m.id}" class="btn">Get a price for ${top[0].m.n} <span class="arr">→</span></a><a href="/3d-pool-design/?m=${top[0].m.id}" class="btn ghost-d">See it in 3D <span class="arr">→</span></a><button class="redo" id="fdRedo">↺ Start over</button></div>`;r.classList.add('on');
 $('#fdRedo').onclick=()=>{r.classList.remove('on');qzGo(0)}}
qzGo(0);
// collection carousel (coverflow)
(()=>{const tr=$('#r2Track');let list=MODELS.slice(),act=0,raf=0,cat='all';
 const CATS=[['all','All'],['rect','Rectangular'],['free','Freeform'],['kidney','Kidney'],['roman','Roman'],['plunge','Plunge & compact']];
 $('#r2Fil').innerHTML=CATS.map(([k,l])=>`<button data-k="${k}" class="${k==='all'?'on':''}">${l}<sup>${k==='all'?MODELS.length:MODELS.filter(m=>m.cat===k).length}</sup></button>`).join('');
 function build(){tr.innerHTML=list.map((m,i)=>`<div class="r2c" data-i="${i}" role="group" aria-label="${m.n}">${m.feats.includes('new')?'<span class="tag">New 2026</span>':''}<div class="r2p r2br"><img src="/models-br/${m.id}.webp" alt="${m.n} fiberglass pool shape" width="400" height="200" loading="lazy" decoding="async"><span class="r2s">${m.Ls} × ${m.Ws}</span></div><div class="r2n"><b>${m.n}</b><small>${m.t}</small></div></div>`).join('');
  $('#r2Ticks').innerHTML=list.map((m,i)=>`<button data-i="${i}" aria-label="${m.n}"><i></i><span>${m.n}</span></button>`).join('');
  $('#r2Tot').textContent='/ '+String(list.length).padStart(2,'0');
  $$('.r2c',tr).forEach(c=>c.onclick=()=>{if(moved)return;const i=+c.dataset.i;if(i===act)location.href='/fiberglass-pools/'+list[i].id+'/';else to(i)});
  $$('#r2Ticks button').forEach(b=>b.onclick=()=>to(+b.dataset.i));act=-1;tr.scrollLeft=0;upd()}
 function to(i,inst){i=Math.max(0,Math.min(list.length-1,i));const c=tr.children[i];if(!c)return;tr.scrollTo({left:c.offsetLeft+c.offsetWidth/2-tr.clientWidth/2,behavior:inst||reduce?'auto':'smooth'})}
 function info(m){const sp=[['Size',m.Ls+' × '+m.Ws],['Deep end',m.D?ft(m.D):'See spec sheet'],['Water',m.gal?m.gal.toLocaleString()+' gal':'See spec sheet']];
  $('#r2Info').innerHTML=`<div class="r2i-l"><h3>${m.n}</h3><p>${m.blurb}</p><div class="r2i-tags">${m.feats.filter(f=>f!=='new').map(f=>`<span>${FT_LBL[f]}</span>`).join('')}<span>${m.sizes.length} version${m.sizes.length>1?'s':''}</span></div></div>
  <div class="r2i-m">${sp.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
  <div class="r2i-r"><a href="/free-3d-design/?m=${m.id}" class="btn">Get a price <span class="arr">→</span></a><div class="r2i-sub"><a href="/fiberglass-pools/${m.id}/">Full specs</a><a href="/3d-pool-design/?m=${m.id}">See it in 3D</a></div></div>`}
 function upd(){raf=0;const cx=tr.scrollLeft+tr.clientWidth/2;let best=0,bd=1e9;
  [...tr.children].forEach((c,i)=>{const w=c.offsetWidth,d=(c.offsetLeft+w/2-cx)/w;const ad=Math.abs(d);if(ad<bd){bd=ad;best=i}
   if(!reduce){const k=Math.min(ad,2.5);c.style.transform=`perspective(1400px) translateX(${-Math.sign(d)*Math.min(ad,2)*18}px) rotateY(${Math.max(-38,Math.min(38,-d*26))}deg) scale(${1-k*.11})`}
   c.style.opacity=Math.max(0,1-ad*.36);c.style.visibility=ad>2.8?'hidden':'';c.style.zIndex=100-Math.round(ad*10)});
  if(best!==act){act=best;const m=list[act];[...tr.children].forEach((c,i)=>c.classList.toggle('on',i===act));$$('#r2Ticks button').forEach((b,i)=>b.classList.toggle('on',i===act));
   $('#r2Cur').textContent=String(act+1).padStart(2,'0');const bg=$('#r2Bg');bg.classList.remove('sw');void bg.offsetWidth;bg.textContent=m.n;bg.classList.add('sw');info(m);
   $('#r2Prev').disabled=act===0;$('#r2Next').disabled=act===list.length-1}}
 tr.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(upd)},{passive:true});addEventListener('resize',()=>{to(act,1);upd()});
 $('#r2Prev').onclick=()=>to(act-1);$('#r2Next').onclick=()=>to(act+1);
 tr.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();to(act+1)}if(e.key==='ArrowLeft'){e.preventDefault();to(act-1)}if(e.key==='Enter')location.href='/fiberglass-pools/'+list[act].id+'/'});
 $$('#r2Fil button').forEach(b=>b.onclick=()=>{cat=b.dataset.k;$$('#r2Fil button').forEach(x=>x.classList.toggle('on',x===b));list=cat==='all'?MODELS.slice():MODELS.filter(m=>m.cat===cat);
  tr.classList.add('swap');setTimeout(()=>{build();tr.classList.remove('swap')},260)});
 let d=null,moved=false;
 tr.addEventListener('dragstart',e=>e.preventDefault());
 addEventListener('pointercancel',()=>{d=null;tr.classList.remove('drag')});
 tr.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;d={x:e.clientX,s:tr.scrollLeft,t:performance.now()};moved=false;tr.classList.add('drag')});
 addEventListener('pointermove',e=>{if(!d)return;const dx=e.clientX-d.x;if(Math.abs(dx)>5)moved=true;tr.scrollLeft=d.s-dx});
 addEventListener('pointerup',e=>{if(!d)return;const dx=e.clientX-d.x,v=dx/Math.max(1,performance.now()-d.t);d=null;tr.classList.remove('drag');
  if(moved){const c=tr.children[0];const w=c?c.offsetWidth+parseFloat(getComputedStyle(tr).columnGap||0):300;const fling=Math.abs(v)>.6?Math.round(-v*2.2):0;to(act+fling)}setTimeout(()=>moved=false,30)});
 later(build)})();

const gt=$('#gTrack');gt&&gt.addEventListener('click',e=>{const f=e.target.closest('[data-full]');f&&openLB(f.dataset.full)});
