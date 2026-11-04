
/* =========================================================
   COMMON UI
   ========================================================= */
const done=()=>{$('#loader').classList.add('done');setTimeout(()=>document.body.classList.add('ready'),150)};
if(document.readyState==='complete')setTimeout(done,900);else addEventListener('load',()=>setTimeout(done,900));
let ly=0;const nav=$('#nav'),mbar=$('#mbar');
addEventListener('scroll',()=>{const y=scrollY;document.body.classList.toggle('past-hero',y>innerHeight*.8);nav.classList.toggle('scrolled',y>40);nav.classList.toggle('hide',y>ly&&y>500&&!document.body.classList.contains('menu-open'));ly=y;mbar.classList.toggle('on',y>innerHeight*.7)},{passive:true});
$('#burger').addEventListener('click',()=>{const o=document.body.classList.toggle('menu-open');$('#burger').setAttribute('aria-expanded',o)});
$$('#mmenu a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');$('#burger').setAttribute('aria-expanded',false)}));
const heroEl=$('#top');addEventListener('scroll',()=>{const p=Math.min(1,scrollY/(heroEl.offsetHeight*.8));heroEl.style.setProperty('--dive',p.toFixed(3))},{passive:true});
document.addEventListener('click',e=>{const a=e.target.closest('a[data-scroll]');if(!a)return;e.preventDefault();const t=$(a.getAttribute('href'));t&&t.scrollIntoView({behavior:'smooth'})});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
let reveal=function(root=document){$$('.rv:not(.in),.flow:not(.in),.mtx:not(.in),.tli:not(.in)',root).forEach(el=>io.observe(el))};
const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,to=+el.dataset.to;let s=null;const step=ts=>{if(!s)s=ts;const k=Math.min(1,(ts-s)/1400);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step);co.unobserve(el)}),{threshold:.6});
$$('.count').forEach(el=>co.observe(el));
if(!isTouch&&!reduce){
 document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.tilt');$$('.tilt.tilting').forEach(x=>{if(x!==t){x.classList.remove('tilting');x.style.transform=''}});
  if(t){const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;t.classList.add('tilting');t.style.transform=`perspective(900px) rotateY(${(px-.5)*9}deg) rotateX(${(.5-py)*9}deg) translateY(-6px)`}
  $('#cursor').style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true});
 $$('.mag').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.25}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
}else $('#cursor').style.display='none';
$('#lb').onclick=()=>$('#lb').classList.remove('on');
const openLB=src=>{$('#lb img').src=src;$('#lb').classList.add('on')};
addEventListener('keydown',e=>{if(e.key==='Escape'){$('#lb').classList.remove('on');$('#cmpModal').classList.remove('on')}});
$('#megaPlan').outerHTML=planSVG(byId('aussie'),{fin:'california',dark:1});
$('#fLearn').innerHTML=ARTS.slice(0,6).map(a=>`<li><a href="#/learn/${a.id}">${a.t.split(/[:?]/)[0]}</a></li>`).join('');
$$('input[type=range]').forEach(r=>{setP(r);r.addEventListener('input',()=>setP(r))});

/* =========================================================
   HOME
   ========================================================= */
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
 const r=$('#fdRes');r.innerHTML=`<span class="fd-n">Your shortlist</span><h3>Best matches for your yard</h3><div class="fd-list">${top.map(({m,s})=>`<a class="fd-item" href="#/pools/${m.id}"><div class="pl">${planSVG(m,{fin:'california'})}</div><div><b>${m.n}</b><small>${m.t} · ${m.Ls} × ${m.Ws}${m.D?' · '+ft(m.D)+' deep':''}</small></div><div class="m">${s}%<small>MATCH</small></div></a>`).join('')}</div>
 <div class="fd-acts"><a href="#/quote?m=${top[0].m.id}" class="btn">Get a price for ${top[0].m.n} <span class="arr">→</span></a><a href="#/studio?m=${top[0].m.id}" class="btn ghost-d">See it in 3D <span class="arr">→</span></a><button class="redo" id="fdRedo">↺ Start over</button></div>`;r.classList.add('on');
 $('#fdRedo').onclick=()=>{r.classList.remove('on');qzGo(0)}}
qzGo(0);

// collection carousel (coverflow)
(()=>{const tr=$('#r2Track');let list=MODELS.slice(),act=0,raf=0,cat='all';
 const CATS=[['all','All'],['rect','Rectangular'],['free','Freeform'],['kidney','Kidney'],['plunge','Plunge & compact']];
 $('#r2Fil').innerHTML=CATS.map(([k,l])=>`<button data-k="${k}" class="${k==='all'?'on':''}">${l}<sup>${k==='all'?MODELS.length:MODELS.filter(m=>m.cat===k).length}</sup></button>`).join('');
 function build(){tr.innerHTML=list.map((m,i)=>`<div class="r2c" data-i="${i}" role="group" aria-label="${m.n}">${m.feats.includes('new')?'<span class="tag">New 2026</span>':''}<div class="r2p">${planSVG(m,{fin:'aquamarine',dark:1})}<span class="r2s">${m.Ls} × ${m.Ws}</span></div><div class="r2n"><b>${m.n}</b><small>${m.t}</small></div></div>`).join('');
  $('#r2Ticks').innerHTML=list.map((m,i)=>`<button data-i="${i}" aria-label="${m.n}"><i></i><span>${m.n}</span></button>`).join('');
  $('#r2Tot').textContent='/ '+String(list.length).padStart(2,'0');
  $$('.r2c',tr).forEach(c=>c.onclick=()=>{if(moved)return;const i=+c.dataset.i;if(i===act)go('/pools/'+list[i].id);else to(i)});
  $$('#r2Ticks button').forEach(b=>b.onclick=()=>to(+b.dataset.i));act=-1;tr.scrollLeft=0;upd()}
 function to(i,inst){i=Math.max(0,Math.min(list.length-1,i));const c=tr.children[i];if(!c)return;tr.scrollTo({left:c.offsetLeft+c.offsetWidth/2-tr.clientWidth/2,behavior:inst||reduce?'auto':'smooth'})}
 function info(m){const sp=[['Size',m.Ls+' × '+m.Ws],['Deep end',m.D?ft(m.D):'See spec sheet'],['Water',m.gal?(m.galEst?'≈ ':'')+m.gal.toLocaleString()+' gal':'See spec sheet']];
  $('#r2Info').innerHTML=`<div class="r2i-l"><h3>${m.n}</h3><p>${m.blurb}</p><div class="r2i-tags">${m.feats.filter(f=>f!=='new').map(f=>`<span>${FT_LBL[f]}</span>`).join('')}<span>${m.sizes.length} version${m.sizes.length>1?'s':''}</span></div></div>
  <div class="r2i-m">${sp.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
  <div class="r2i-r"><a href="#/quote?m=${m.id}" class="btn">Get a price <span class="arr">→</span></a><div class="r2i-sub"><a href="#/pools/${m.id}">Full specs</a><a href="#/studio?m=${m.id}">See it in 3D</a></div></div>`}
 function upd(){raf=0;const cx=tr.scrollLeft+tr.clientWidth/2;let best=0,bd=1e9;
  [...tr.children].forEach((c,i)=>{const w=c.offsetWidth,d=(c.offsetLeft+w/2-cx)/w;const ad=Math.abs(d);if(ad<bd){bd=ad;best=i}
   if(!reduce){const k=Math.min(ad,2.5);c.style.transform=`perspective(1400px) translateX(${-Math.sign(d)*Math.min(ad,2)*18}px) rotateY(${Math.max(-38,Math.min(38,-d*26))}deg) scale(${1-k*.11})`}
   c.style.opacity=Math.max(0,1-ad*.36);c.style.visibility=ad>2.8?'hidden':'';c.style.zIndex=100-Math.round(ad*10)});
  if(best!==act){act=best;const m=list[act];[...tr.children].forEach((c,i)=>c.classList.toggle('on',i===act));$$('#r2Ticks button').forEach((b,i)=>b.classList.toggle('on',i===act));
   $('#r2Cur').textContent=String(act+1).padStart(2,'0');const bg=$('#r2Bg');bg.classList.remove('sw');void bg.offsetWidth;bg.textContent=m.n;bg.classList.add('sw');info(m);
   $('#r2Prev').disabled=act===0;$('#r2Next').disabled=act===list.length-1}}
 tr.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(upd)},{passive:true});addEventListener('resize',()=>{to(act,1);upd()});
 $('#r2Prev').onclick=()=>to(act-1);$('#r2Next').onclick=()=>to(act+1);
 tr.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();to(act+1)}if(e.key==='ArrowLeft'){e.preventDefault();to(act-1)}if(e.key==='Enter')go('/pools/'+list[act].id)});
 $$('#r2Fil button').forEach(b=>b.onclick=()=>{cat=b.dataset.k;$$('#r2Fil button').forEach(x=>x.classList.toggle('on',x===b));list=cat==='all'?MODELS.slice():MODELS.filter(m=>m.cat===cat);
  tr.classList.add('swap');setTimeout(()=>{build();tr.classList.remove('swap')},260)});
 let d=null,moved=false;
 tr.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;d={x:e.clientX,s:tr.scrollLeft,t:performance.now()};moved=false;tr.classList.add('drag')});
 addEventListener('pointermove',e=>{if(!d)return;const dx=e.clientX-d.x;if(Math.abs(dx)>5)moved=true;tr.scrollLeft=d.s-dx});
 addEventListener('pointerup',e=>{if(!d)return;const dx=e.clientX-d.x,v=dx/Math.max(1,performance.now()-d.t);d=null;tr.classList.remove('drag');
  if(moved){const c=tr.children[0];const w=c?c.offsetWidth+parseFloat(getComputedStyle(tr).columnGap||0):300;const fling=Math.abs(v)>.6?Math.round(-v*2.2):0;to(act+fling)}setTimeout(()=>moved=false,30)});
 build()})();

// flow
$('#flow').innerHTML=STEPS.map((s,i)=>`<div class="fl"><div class="dot">${String(i+1).padStart(2,'0')}</div><h3>${s[0]}</h3><p>${s[1]}</p><span class="who ${s[3]}">${s[2]}</span></div>`).join('');

// mini calc
(()=>{const r=$('#miniR');let term=15;const upd=()=>{$('#miniAmt').textContent=money(+r.value);$('#miniPay').textContent=money(pmt(+r.value,7.99,term))};
 r.addEventListener('input',upd);$$('#miniTerm button').forEach(b=>b.onclick=()=>{$$('#miniTerm button').forEach(x=>x.classList.remove('on'));b.classList.add('on');term=+b.dataset.v;upd()});upd()})();

// learn (shared)
function artCard(a){const s=STAGES.find(x=>x[0]===a.st);return `<a class="ac" href="#/learn/${a.id}"><div class="im"><img src="${IMG[a.img]}" alt="" loading="lazy"><span class="tag">${s[1]}</span></div><div class="tx"><h3>${a.t}</h3><p>${a.d}</p><div class="meta"><span>${a.min} min read</span><span>Read guide →</span></div></div></a>`}
function stageBar(el,cur,fn){el.innerHTML=STAGES.map(([k,n],i)=>`<button data-k="${k}" class="${k===cur?'on':''}"><i>0${i+1}</i>${n}</button>`).join('');$$('button',el).forEach(b=>b.onclick=()=>fn(b.dataset.k))}
function homeLearn(k){stageBar($('#stagesHome'),k,homeLearn);$('#artHome').innerHTML=ARTS.filter(a=>a.st===k).concat(ARTS.filter(a=>a.st!==k)).slice(0,3).map(artCard).join('')}
homeLearn('plan');

// gallery strip + faq
const gt=$('#gTrack');[...GAL,...GAL].forEach(([k,c,p])=>{const f=document.createElement('figure');f.className='g-it';f.innerHTML=`<img src="${IMG[k]}" alt="${c}, ${p}" loading="lazy"><figcaption>${c} · ${p}</figcaption>`;f.onclick=()=>openLB(IMG[k]);gt.appendChild(f)});
function faq(el){FAQ.forEach(([q,a],i)=>{const d=document.createElement('div');d.className='qa'+(i===0?' open':'');d.innerHTML=`<button aria-expanded="${i===0}">${q}<span class="pm"></span></button><div class="ans"><div><p>${a}</p></div></div>`;
 d.querySelector('button').onclick=()=>{const o=!d.classList.contains('open');$$('.qa',el).forEach(x=>{x.classList.remove('open');x.querySelector('button').setAttribute('aria-expanded',false)});if(o){d.classList.add('open');d.querySelector('button').setAttribute('aria-expanded',true)}};el.appendChild(d)})}
faq($('#faqList'));faq($('#faqList2'));

/* =========================================================
   POOLS FINDER
   ========================================================= */
const F={shape:new Set(),feat:new Set(),len:40,wid:16,sort:'len'};const CMP=new Set();
function cardHTML(m){return `<div class="pc"><div class="pl">${m.feats.includes('new')?'<span class="tag">New 2026</span>':''}<button class="cmp ${CMP.has(m.id)?'on':''}" data-id="${m.id}">${CMP.has(m.id)?'✓ Comparing':'+ Compare'}</button>${planSVG(m,{fin:'california'})}</div>
 <h3>${m.n}</h3><div class="t">${m.t}</div>
 <div class="dims"><div><small>Length</small><b>${m.Ls}</b></div><div><small>Width</small><b>${m.Ws}</b></div><div><small>Deep</small><b>${m.D?ft(m.D):'—'}</b></div></div>
 <div class="fts">${m.feats.filter(f=>f!=='new').map(f=>`<span>${FT_LBL[f]}</span>`).join('')}</div>
 <div class="acts"><a href="#/pools/${m.id}">View model</a><a href="#/studio?m=${m.id}">◆ 3D</a></div></div>`}
function fpRender(){
 let list=MODELS.filter(m=>(!F.shape.size||F.shape.has(m.cat)||F.shape.has(m.s)&&m.cat!=='plunge')&&[...F.feat].every(f=>m.feats.includes(f))&&m.L<=F.len+.3&&m.W<=F.wid+.1);
 const so={len:(a,b)=>b.L-a.L,'len-a':(a,b)=>a.L-b.L,name:(a,b)=>a.n.localeCompare(b.n),gal:(a,b)=>(b.gal||0)-(a.gal||0)}[F.sort];list.sort(so);
 $('#fpCards').innerHTML=list.map(cardHTML).join('');$$('#fpCards .pc').forEach((c,i)=>c.style.animationDelay=(i*.04)+'s');
 $('#fpCount').textContent=list.length+(list.length===1?' model':' models');$('#fpEmpty').classList.toggle('on',!list.length);
 const act=[...[...F.shape].map(v=>['shape',v,CAT_LBL[v]]),...[...F.feat].map(v=>['feat',v,FT_LBL[v]])];if(F.len<40)act.push(['len',0,'≤ '+F.len+' ft long']);if(F.wid<16)act.push(['wid',0,'≤ '+F.wid+' ft wide']);
 $('#fpActive').innerHTML=act.map(a=>`<button data-t="${a[0]}" data-v="${a[1]}">${a[2]}</button>`).join('');
 $$('#fpActive button').forEach(b=>b.onclick=()=>{const t=b.dataset.t;if(t==='len'){F.len=40;$('#fpLen').value=40}else if(t==='wid'){F.wid=16;$('#fpWid').value=16}else F[t].delete(b.dataset.v);fpSync()});
 $$('#fpCards .cmp').forEach(b=>b.onclick=()=>toggleCmp(b.dataset.id))}
function fpSync(){$$('.fp-chips').forEach(g=>$$('button',g).forEach(b=>b.classList.toggle('on',F[g.dataset.f].has(b.dataset.v))));$('#fpLenV').textContent=F.len+' ft';$('#fpWidV').textContent=F.wid+' ft';setP($('#fpLen'));setP($('#fpWid'));fpRender()}
$$('.fp-chips').forEach(g=>$$('button',g).forEach(b=>b.onclick=()=>{const s=F[g.dataset.f];s.has(b.dataset.v)?s.delete(b.dataset.v):s.add(b.dataset.v);fpSync()}));
$('#fpLen').addEventListener('input',e=>{F.len=+e.target.value;fpSync()});$('#fpWid').addEventListener('input',e=>{F.wid=+e.target.value;fpSync()});
$('#fpSort').onchange=e=>{F.sort=e.target.value;fpRender()};
const fpClear=()=>{F.shape.clear();F.feat.clear();F.len=40;F.wid=16;$('#fpLen').value=40;$('#fpWid').value=16;fpSync()};$('#fpClear').onclick=fpClear;$('#fpReset').onclick=fpClear;
function toggleCmp(id){if(CMP.has(id))CMP.delete(id);else{if(CMP.size>=3){toast('You can compare up to 3 models. Remove one first.');return}CMP.add(id)}cmpUpd();if(cur.r==='pools')fpRender();if(cur.r==='model')$('#mdCmp').textContent=CMP.has(id)?'✓ In compare':'+ Add to compare'}
function cmpUpd(){const a=[...CMP];$('#ctSlots').innerHTML=[0,1,2].map(i=>a[i]?`<span>${byId(a[i]).n}</span>`:'<span class="e">Add a model</span>').join('');$('#cmpTray').classList.toggle('on',a.length>0&&cur.r==='pools')}
$('#ctClear').onclick=()=>{CMP.clear();cmpUpd();fpRender()};
$('#ctGo').onclick=()=>{const ms=[...CMP].map(byId);if(ms.length<2){toast('Pick at least 2 models to compare.');return}
 const row=(l,f,c='')=>`<div class="mo-r ${c}" style="--n:${ms.length}"><span>${l}</span>${ms.map(f).join('')}</div>`;
 $('#moTbl').innerHTML=row('',m=>`<a href="#/pools/${m.id}">${m.n}</a>`,'hd')+row('Plan',m=>`<div>${planSVG(m,{fin:'california'})}</div>`,'pl')+row('Type',m=>`<span>${m.t}</span>`)+row('Length',m=>`<b>${m.Ls}</b>`)+row('Width',m=>`<b>${m.Ws}</b>`)+row('Deep end',m=>`<b>${m.D?ft(m.D):'Spec sheet'}</b>`)+row('Water',m=>`<span>${m.gal?(m.galEst?'≈ ':'')+m.gal.toLocaleString()+' gal':'Spec sheet'}</span>`)+row('Features',m=>`<span>${m.feats.map(f=>FT_LBL[f]).join(', ')||'—'}</span>`)+row('Versions',m=>`<span>${m.sizes.join(' · ')}</span>`);
 $('#cmpModal').classList.add('on')};
$('#moX').onclick=()=>$('#cmpModal').classList.remove('on');$('#cmpModal').addEventListener('click',e=>{if(e.target.id==='cmpModal')$('#cmpModal').classList.remove('on')});
$('#moTbl').addEventListener('click',e=>{if(e.target.closest('a'))$('#cmpModal').classList.remove('on')});

/* =========================================================
   MODEL DETAIL
   ========================================================= */
let mdM=null,mdFin='california';
function mdPlan(){const m=mdM;const x1=70-60*m.L/40,x2=70+60*m.L/40;const hw=(m.s==='rect'?24:25.5)*m.W/16;const yT=30-hw,yB=30+hw;
 const svg=planSVG(m,{fin:mdFin,dark:1,attr:'class="fillw" x="0" y="0" width="140" height="60"'});const p=planPath(m.s,m.L,m.W);
 $('#mdPlan').innerHTML=`<svg viewBox="-4 -6 156 76"><path class="draw" d="${p}" fill="none" stroke="#7dd3fc" stroke-width=".7"/>${svg}
  <g class="fillw"><path class="dl" d="M${x1} ${yT-5}H${x2}M${x1} ${yT-7}v4M${x2} ${yT-7}v4"/><rect x="${70-8}" y="${yT-8.2}" width="16" height="5" rx="2.5" fill="#04101f"/><text class="dt" x="70" y="${yT-4.6}" text-anchor="middle">${m.Ls}</text>
  <path class="dl" d="M${x2+5} ${yT}V${yB}M${x2+3} ${yT}h4M${x2+3} ${yB}h4"/><rect x="${x2+0.5}" y="27.5" width="9" height="5" rx="2.5" fill="#04101f"/><text class="dt" x="${x2+5}" y="31.1" text-anchor="middle" style="font-size:3px">${m.Ws}</text></g></svg><span class="scale">PLAN VIEW · ${FIN_META[mdFin].n.toUpperCase()} FINISH</span>`}
function mdElev(){const m=mdM;if(!m.D){$('#mdElev').innerHTML='<p class="fine">A full depth profile for this model is on the Barrier Reef spec sheet. Ask us for a copy.</p>';return}
 const S=m.S||Math.min(3.5,m.D),D=m.D,y=d=>22+d*13.5;const flat=m.cat==='plunge'&&S===D;
 const pts=flat?`M40 ${y(0)}V${y(D)}H560V${y(0)}`:`M40 ${y(0)}V${y(S*.33)}H62V${y(S*.66)}H84V${y(S)}H${250}L${380} ${y(D)}H520Q560 ${y(D)} 560 ${y(D)-30}V${y(0)}`;
 $('#mdElev').innerHTML=`<svg viewBox="0 0 600 ${y(D)+40}"><defs><linearGradient id="elg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${FINISH[mdFin].shallow}"/><stop offset="1" stop-color="${FINISH[mdFin].deep}"/></linearGradient></defs>
 <rect x="0" y="${y(0)-3}" width="600" height="${y(D)+40}" fill="#f2ead9" opacity=".5"/><path d="${pts}Z" fill="url(#elg)" stroke="#0b2545" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 ${y(0)}H560" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>
 <g font-family="Inter Tight,Inter,sans-serif" font-size="13" font-weight="600" fill="#0b2545"><text x="150" y="${y(S)+20}" text-anchor="middle">${m.S?'':'≈ '}${ft(S)} shallow</text><text x="460" y="${y(D)+22}" text-anchor="middle">${ft(D)} deep</text><text x="300" y="${y(0)-8}" text-anchor="middle" fill="#41566e" font-weight="500">${m.Ls} long</text></g></svg>${m.S?'':'<p class="fine">Shallow-end depth shown is approximate. Confirm it on the spec sheet.</p>'}`}
function renderModel(id,q){const m=byId(id);if(!m){go('/pools');return}mdM=m;mdFin=q.f&&FINISH[q.f]?q.f:'california';
 document.title=`${m.n} Fiberglass Pool · iTop Pools Jacksonville`;
 $('#mdCrumb').textContent=m.n;$('#mdName').textContent=m.n;$('#mdBlurb').textContent=m.blurb;
 $('#mdTags').innerHTML=(m.feats.includes('new')?'<span class="n">New for 2026</span>':'')+`<span>${m.t}</span><span>Barrier Reef</span>`;
 $('#mdSizes').innerHTML='<small>Available versions</small>'+m.sizes.map((s,i)=>`<span class="${i?'':'on'}">${s}</span>`).join('');
 $('#md3d').href='#/studio?m='+m.id;$('#mdQuote').href=$('#mdAsideQ').href='#/quote?m='+m.id;
 const sp=[['Length',m.Ls],['Width',m.Ws]];if(m.D)sp.push(['Deep end',ft(m.D)]);if(m.S)sp.push(['Shallow end',ft(m.S)]);if(m.walk)sp.push(['Lounger walk-in',ft(m.walk)]);
 const gal=m.gal?`<div class="${m.galEst?'est':''}"><small>Water ${m.galEst?'(est.)':''}</small><b>${m.galEst?'≈':''}${m.gal.toLocaleString()}<em>gal</em></b></div>`:'';
 $('#mdSpec').innerHTML=sp.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')+gal;
 $('#mdSpecNote').textContent=m.galEst?'Water volume is our estimate from the dimensions. Exact gallons are on the Barrier Reef spec sheet.':m.gal?'Specifications from the Barrier Reef Pools USA spec sheet for the '+m.n+' 40.':'Full specifications are on the Barrier Reef spec sheet.';
 $('#mdFeat').innerHTML=m.fl.map(f=>`<li>${f}</li>`).join('');
 $('#mdSw').innerHTML=FIN_KEYS.map(k=>`<button data-v="${k}" class="${k===mdFin?'on':''}"><i style="background:${swBg(k)}"></i>${FIN_META[k].n}</button>`).join('');
 $$('#mdSw button').forEach(b=>b.onclick=()=>{mdFin=b.dataset.v;$$('#mdSw button').forEach(x=>x.classList.toggle('on',x===b));mdPlan();mdElev();$('#mdAsideFin').textContent=FIN_META[mdFin].n;$('#md3d').href=`#/studio?m=${m.id}&f=${mdFin}`});
 $('#mdAsideName').textContent=m.n;$('#mdAsideSize').textContent=m.Ls+' × '+m.Ws;$('#mdAsideFin').textContent=FIN_META[mdFin].n;
 $('#mdCmp').textContent=CMP.has(m.id)?'✓ In compare':'+ Add to compare';$('#mdCmp').onclick=()=>{toggleCmp(m.id);if(CMP.size>1)toast(CMP.size+' models in compare. Open Pool models to compare them.')};
 const sim=MODELS.filter(x=>x!==m).sort((a,b)=>(b.cat===m.cat)-(a.cat===m.cat)||Math.abs(a.L-m.L)-Math.abs(b.L-m.L)).slice(0,3);
 $('#mdSim').innerHTML=sim.map(cardHTML).join('');$$('#mdSim .cmp').forEach(b=>b.onclick=()=>toggleCmp(b.dataset.id));
 mdPlan();mdElev()}

/* =========================================================
   COLOURS PAGE
   ========================================================= */
$('#palGrid').innerHTML=FIN_KEYS.map(k=>{const f=FINISH[k],m=FIN_META[k];return `<button class="pal" data-v="${k}"><div class="chip-c" style="background:linear-gradient(160deg,${f.shallow},${f.basin} 45%,${f.deep})"></div><div class="tx"><b>${m.n}</b><p>${m.d}</p><div class="dp"><i style="background:${f.shallow}"></i><i style="background:${f.basin}"></i><i style="background:${f.deep}"></i></div></div></button>`}).join('');
$$('#palGrid .pal').forEach(b=>b.onclick=()=>{labSet(LS.focus==='a'?'b':'a',b.dataset.v);$('#lab').scrollIntoView({behavior:'smooth',block:'center'})});

/* =========================================================
   LEARN
   ========================================================= */
let lStage='dream';
function renderLearn(q){lStage=q.s||lStage;
 $('#journey').innerHTML=STAGES.map(([k,n,d],i)=>`<button class="jy ${k===lStage?'on':''}" data-k="${k}"><small>STAGE 0${i+1}</small><b>${n}</b><span>${d} · ${ARTS.filter(a=>a.st===k).length} guides</span></button>`).join('');
 $$('#journey .jy').forEach(b=>b.onclick=()=>{lStage=b.dataset.k;renderLearn({})});
 $('#artHub').innerHTML=ARTS.filter(a=>a.st===lStage).concat(ARTS.filter(a=>a.st!==lStage)).map(artCard).join('');
 $$('#artHub .ac').forEach((c,i)=>c.style.animationDelay=(i*.05)+'s')}
const MTX=[['Typical install','2–6 weeks','3–6 months','Several weeks'],['Surface feel','Smooth gelcoat','Textured plaster or pebble','Soft vinyl'],['Algae resistance','High (non-porous)','Lower (porous)','Medium'],['Shape freedom','Choose from molds','Unlimited','Many shapes'],['Big future cost','Rare','Resurfacing','Liner replacement'],['Best for','Fast, low-upkeep family pools','Fully custom designs','Lowest upfront price']];
$('#mtx').innerHTML=`<div class="mtx-r h"><span></span><span>Fiberglass</span><span>Concrete</span><span>Vinyl liner</span></div>`+MTX.map((r,i)=>`<div class="mtx-r"><span>${r[0]}</span><span>${r[1]}${i===0?'<em class="bar"><i style="--w:92%"></i></em>':''}</span><span>${r[2]}${i===0?'<em class="bar"><i style="--w:18%"></i></em>':''}</span><span>${r[3]}${i===0?'<em class="bar"><i style="--w:55%"></i></em>':''}</span></div>`).join('');
function renderArticle(id){const a=ARTS.find(x=>x.id===id);if(!a){go('/learn');return}const s=STAGES.find(x=>x[0]===a.st);
 document.title=a.t+' · iTop Pools';$('#artHero').style.backgroundImage=`url(${IMG[a.img]})`;$('#artCrumb').textContent=s[1];$('#artStage').textContent=s[1]+' stage';$('#artTitle').textContent=a.t;$('#artSub').textContent=a.d;
 $('#artMeta').innerHTML=`<span>${a.min} min read</span><span>iTop Pools crew</span><span>Northeast Florida</span>`;$('#artBody').innerHTML=a.b;
 $('#artMore').innerHTML=ARTS.filter(x=>x!==a).sort((x,y)=>(y.st===a.st)-(x.st===a.st)).slice(0,4).map(x=>`<a href="#/learn/${x.id}">${x.t}<span>${STAGES.find(z=>z[0]===x.st)[1]} · ${x.min} min</span></a>`).join('')}

/* =========================================================
   ESTIMATOR
   ========================================================= */
const E={model:'coral-sea',opts:new Set(['led','heat']),deckType:'pavers',deck:600,site:'easy',term:20,down:10000,apr:7.99};
$('#esModels').innerHTML=MODELS.map(m=>`<button data-id="${m.id}"><svg viewBox="0 0 140 60"><path d="${planPath(m.s,m.L,m.W)}" fill="#1e9be0" stroke="#bfe9fd" stroke-width="4"/></svg><b>${m.n}</b><small>${m.Ls} × ${m.Ws}</small></button>`).join('');
$('#esOpts').innerHTML=PRICE.opts.map(([k,n,d,r])=>`<button class="eopt" data-k="${k}"><span class="ck">✓</span><span><b>${n}</b><small>${d}</small></span><em>+${k$(r[0])}–${k$(r[1])}</em></button>`).join('');
$$('#esModels button').forEach(b=>b.onclick=()=>{E.model=b.dataset.id;est()});
$$('#esOpts .eopt').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='spa'&&byId(E.model).spa)return;E.opts.has(k)?E.opts.delete(k):E.opts.add(k);est()});
const segBind=(sel,key,num)=>$$(sel+' button').forEach(b=>b.onclick=()=>{$$(sel+' button').forEach(x=>x.classList.remove('on'));b.classList.add('on');E[key]=num?+b.dataset.v:b.dataset.v;est()});
segBind('#esDeckType','deckType');segBind('#esSite','site');segBind('#eoTerm','term',1);
$('#esDeck').addEventListener('input',e=>{E.deck=+e.target.value;est()});$('#eoDown').addEventListener('input',e=>{E.down=+e.target.value;est()});$('#eoApr').addEventListener('input',e=>{E.apr=+e.target.value;est()});
function est(){const m=byId(E.model);if(m.spa)E.opts.delete('spa');
 const pool=PRICE.base(m.L).slice();if(m.spa){pool[0]+=PRICE.spaModel[0];pool[1]+=PRICE.spaModel[1]}
 const feat=[0,0];E.opts.forEach(k=>{const o=PRICE.opts.find(x=>x[0]===k);feat[0]+=o[3][0];feat[1]+=o[3][1]});
 const dr=PRICE.deck[E.deckType],deck=[E.deck*dr[0],E.deck*dr[1]];const site=[PRICE.site[E.site][0]+PRICE.permits[0],PRICE.site[E.site][1]+PRICE.permits[1]];
 const lo=pool[0]+feat[0]+deck[0]+site[0],hi=pool[1]+feat[1]+deck[1]+site[1];E.lo=lo;E.hi=hi;
 $('#eoLo').textContent=k$(lo);$('#eoHi').textContent=k$(hi);
 $('#eoBars').innerHTML=[['Pool & install'+(m.spa?' (incl. spa)':''),pool],['Features',feat],['Deck',deck],['Site & permits',site]].map(([n,r])=>`<div class="eb"><div><span>${n}</span><b>${k$(r[0])}–${k$(r[1])}</b></div><i><em style="width:${(r[1]/hi*100).toFixed(1)}%"></em></i></div>`).join('');
 const P=Math.max(0,(lo+hi)/2-E.down);$('#eoPay').textContent=money(pmt(P,E.apr,E.term))+'/mo';$('#eoDownV').textContent=money(E.down);$('#eoAprV').textContent=E.apr.toFixed(2)+'%';$('#esDeckV').textContent=E.deck+' sq ft';
 $$('#esModels button').forEach(b=>b.classList.toggle('on',b.dataset.id===E.model));
 $$('#esOpts .eopt').forEach(b=>{const k=b.dataset.k;const inc=!!(k==='spa'&&m.spa);b.classList.toggle('on',E.opts.has(k)||inc);b.style.opacity=inc?.6:1;b.querySelector('em').textContent=inc?'Included':'+'+k$(PRICE.opts.find(x=>x[0]===k)[3][0])+'–'+k$(PRICE.opts.find(x=>x[0]===k)[3][1])});
 ['#esDeck','#eoDown','#eoApr'].forEach(s=>setP($(s)))}
$('#eoSend').addEventListener('click',()=>{Q.model=E.model;Q.estimate=`${k$(E.lo)}–${k$(E.hi)}`});
$('#loans').innerHTML=LOANS.map((l,i)=>`<div class="loan rv d${i+1}"><i>OPTION 0${i+1}</i><h3>${l[0]}</h3><p>${l[1]}</p><ul>${l[2].map(x=>`<li class="p">${x}</li>`).join('')}${l[3].map(x=>`<li class="m">${x}</li>`).join('')}</ul></div>`).join('');
est();

/* =========================================================
   WORK
   ========================================================= */
const WF=[['all','All projects'],['fiberglass','Fiberglass pools'],['features','Spas & features'],['pavers','Pavers & decks'],['enclosure','Enclosures']];
function wkRender(k){$('#wkFil').innerHTML=WF.map(([v,l])=>`<button class="${v===k?'on':''}" data-v="${v}">${l}<sup>${v==='all'?GAL.length:GAL.filter(g=>g[3]===v).length}</sup></button>`).join('');
 $$('#wkFil button').forEach(b=>b.onclick=()=>wkRender(b.dataset.v));
 $('#wkGrid').innerHTML=GAL.filter(g=>k==='all'||g[3]===k).map(([i,c,p],n)=>`<figure class="mi" data-k="${i}" style="animation-delay:${n*.05}s"><img src="${IMG[i]}" alt="${c}, ${p}"><figcaption><b>${c}</b><span>${p}</span></figcaption></figure>`).join('');
 $$('#wkGrid .mi').forEach(f=>f.onclick=()=>openLB(IMG[f.dataset.k]))}
wkRender('all');

/* =========================================================
   WHY / TIMELINE
   ========================================================= */
$('#tl').insertAdjacentHTML('beforeend',TL.map((s,i)=>`<div class="tli"><div class="dot">${String(i+1).padStart(2,'0')}</div><div class="card"><span class="who ${s[2]==='Barrier Reef'?'mf':''}">${s[2]}</span><h3>${s[0]}</h3><p>${s[1]}</p><span class="dur">⏱ ${s[3]}</span></div></div>`).join(''));
addEventListener('scroll',()=>{if(cur.r!=='why')return;const t=$('#tl'),r=t.getBoundingClientRect();const p=Math.min(1,Math.max(0,(innerHeight*.6-r.top)/r.height));$('#tlFill').style.height=(p*100)+'%'},{passive:true});

/* =========================================================
   QUOTE (concierge form)
   ========================================================= */
const Q={step:0,project:new Set(),musts:new Set(),model:null,when:null,budget:null,hoa:null,existing:null,day:null,slot:null,callFirst:false,contact:'Call',estimate:null,files:[]};
const QN=['Project','Pool','Timing','Yard','Visit','Contact'];
const QLEFT=['About 90 seconds left','About 75 seconds left','About a minute left','About 45 seconds left','About 30 seconds left','Last step'];
const PL={pool:'New pool',spa:'Spa',pavers:'Pavers & deck',kitchen:'Outdoor kitchen',enclosure:'Screen enclosure',remodel:'Remodel'};
const WL={asap:'As soon as possible','3-6':'3–6 months','6-12':'6–12 months',later:'Just exploring'},BL={u60:'Under $60k','60-80':'$60k–$80k','80-100':'$80k–$100k','100+':'$100k+'};
const ZIPAREA={'320':'St. Johns County & the Beaches','321':'Clay & Nassau area','322':'Jacksonville / Duval'};
$('#qModels').innerHTML='<button type="button" class="ns" data-id="none"><span class="ns-ic">?</span><span><b>Help me choose</b><small>We\'ll recommend shells after measuring</small></span></button>'+MODELS.map(m=>`<button type="button" data-id="${m.id}"><svg viewBox="0 0 140 60"><path d="${planPath(m.s,m.L,m.W)}" fill="#1e9be0" stroke="#bfe9fd" stroke-width="4"/></svg><b>${m.n}</b><small>${m.Ls} × ${m.Ws}</small></button>`).join('');
$$('#qModels button').forEach(b=>b.onclick=()=>{Q.model=b.dataset.id;qUpd()});
// days
(()=>{const d=new Date();const out=[];while(out.length<10){d.setDate(d.getDate()+1);if(d.getDay()!==0)out.push(new Date(d))}
 $('#qDays').innerHTML=out.map(x=>{const v=x.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});return `<button type="button" data-v="${v}"><small>${x.toLocaleDateString('en-US',{weekday:'short'})}</small><b>${x.getDate()}</b><span>${x.toLocaleDateString('en-US',{month:'short'})}</span></button>`}).join('');
 $$('#qDays button').forEach(b=>b.onclick=()=>{Q.day=b.dataset.v;Q.callFirst=false;qUpd()})})();
$('#qCallFirst').onclick=()=>{Q.callFirst=true;Q.day=null;Q.slot=null;qUpd();qGo(1)};
$$('#qForm [data-k]').forEach(g=>$$('button',g).forEach(b=>b.onclick=()=>{const k=g.dataset.k;if(g.classList.contains('multi')){Q[k].has(b.dataset.v)?Q[k].delete(b.dataset.v):Q[k].add(b.dataset.v)}else{Q[k]=b.dataset.v;if(k==='slot')Q.callFirst=false}
 g.closest('.qs').querySelectorAll('.q-err').forEach(e=>e.textContent='');qUpd();
 if(k==='budget'&&Q.when&&Q.step===2)setTimeout(()=>qGo(1),380)}));
const fmtPh=v=>{const d=v.replace(/\D/g,'').replace(/^1/,'').slice(0,10);return d.length>6?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:d.length>3?`(${d.slice(0,3)}) ${d.slice(3)}`:d};
$('#qPh').addEventListener('input',e=>{e.target.value=fmtPh(e.target.value);qUpd()});
$('#qZip').addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,5);qUpd()});
['#qFn','#qLn','#qEm'].forEach(s=>$(s).addEventListener('input',()=>{const f=$(s).closest('.fi');f&&f.classList.remove('bad');qUpd()}));
// photos (stay in the browser; mockup only)
const addFiles=fl=>{[...fl].filter(f=>f.type.startsWith('image/')).slice(0,6-Q.files.length).forEach(f=>{const r=new FileReader();r.onload=()=>{Q.files.push({n:f.name,u:r.result});qThumbs();qUpd()};r.readAsDataURL(f)})};
function qThumbs(){$('#qThumbs').innerHTML=Q.files.map((f,i)=>`<figure><img src="${f.u}" alt=""><button type="button" data-i="${i}" aria-label="Remove photo">✕</button></figure>`).join('');$$('#qThumbs button').forEach(b=>b.onclick=()=>{Q.files.splice(+b.dataset.i,1);qThumbs();qUpd()})}
$('#qFiles').addEventListener('change',e=>addFiles(e.target.files));
const dr=$('#qDrop');['dragenter','dragover'].forEach(ev=>dr.addEventListener(ev,e=>{e.preventDefault();dr.classList.add('over')}));['dragleave','drop'].forEach(ev=>dr.addEventListener(ev,e=>{e.preventDefault();dr.classList.remove('over')}));dr.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
function qBrief(){const m=Q.model&&Q.model!=='none'?byId(Q.model):null;const z=$('#qZip').value;
 return [['Project',[...Q.project].map(p=>PL[p]).join(', ')],['Pool',m?m.n+' · '+m.Ls+' × '+m.Ws:Q.model==='none'?'Help me choose':''],['Must-haves',[...Q.musts].join(', ')],['Timing',WL[Q.when]||''],['Budget',BL[Q.budget]||''],
  ...(Q.estimate?[['Estimate',Q.estimate]]:[]),['Yard',z.length===5?z+(Q.hoa?' · HOA: '+Q.hoa:''):''],['Photos',Q.files.length?Q.files.length+' attached':''],['Visit',Q.callFirst?'Call me to schedule':Q.day?Q.day+(Q.slot?' · '+Q.slot:''):''],['Name',[$('#qFn').value,$('#qLn').value].join(' ').trim()]]}
function qUpd(){
 $$('#qForm [data-k]').forEach(g=>$$('button',g).forEach(b=>{const v=Q[g.dataset.k];b.classList.toggle('on',v instanceof Set?v.has(b.dataset.v):v===b.dataset.v)}));
 $$('#qModels button').forEach(b=>b.classList.toggle('on',b.dataset.id===Q.model));
 $$('#qDays button').forEach(b=>b.classList.toggle('on',b.dataset.v===Q.day));
 $('#qSteps').innerHTML=QN.map((n,i)=>`<button type="button" data-i="${i}" class="${i===Q.step?'on':i<Q.step?'dn':''}" ${i<Q.step?'':'disabled'}><i>${i<Q.step?'✓':i+1}</i>${n}</button>`).join('');
 $$('#qSteps button').forEach(b=>b.onclick=()=>{Q.step=+b.dataset.i;qUpd()});
 $('#qBar').style.width=(Q.step>5?100:Q.step/6*100+8)+'%';$('#qStepN').textContent=Q.step>5?'Done':`Step ${Q.step+1} of 6`;$('#qLeft').textContent=Q.step>5?'':QLEFT[Q.step];
 $$('.qs').forEach(s=>s.classList.toggle('on',+s.dataset.s===Q.step));
 $('#qBack').disabled=Q.step===0;$('#qNav').style.display=Q.step>5?'none':'';$('.q-prog').style.display=Q.step>5?'none':'';$('#qIntro').style.display=Q.step>5?'none':'';
 $('#qNext').innerHTML=Q.step===5?'Book my free visit <span class="arr">→</span>':(Q.step===1&&!Q.model)||(Q.step===3&&!Q.files.length&&$('#qZip').value.length===5&&false)?'Skip for now <span class="arr">→</span>':'Continue <span class="arr">→</span>';
 const z=$('#qZip').value;const zo=$('#zipOk');const ok=/^32[0-2]/.test(z);
 zo.className='q-zip'+(z.length===5?(ok?' y':' n'):'');zo.innerHTML=z.length===5?(ok?`<i>✓</i><span><b>Great news, we build in your area.</b>${ZIPAREA[z.slice(0,3)]}</span>`:`<i>i</i><span><b>Just outside our usual area.</b>We'll confirm when we call.</span>`):'<span>Enter your ZIP to check our service area</span>';
 const B=qBrief();const filled=B.filter(r=>r[1]).length;$('#qPct').textContent=Math.round(filled/B.length*100)+'%';
 $('#qSum').innerHTML=B.map(([k,v])=>`<div class="q-row ${v?'f':''}"><span>${k}</span><b>${v||'—'}</b></div>`).join('');
 const bi=['u60','60-80','80-100','100+'].indexOf(Q.budget);$('#qbFill').style.width=bi<0?'0':((bi+1)/4*100)+'%';
 const qs=$('#qStudio');qs.classList.toggle('on',!!st.touched);if(st.touched)qs.innerHTML='<b>◆ 3D design attached</b><span>'+$('#sum').innerHTML.replace(/<\/?b>/g,'')+'</span>'}
function err(key,msg){const e=$(`.qs.on .q-err[data-for="${key}"]`);if(e){e.textContent=msg;const f=e.closest('.fi');f&&f.classList.add('bad')}const s=$('.qs.on');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');return false}
function qValid(){const s=Q.step;$$('.qs.on .q-err').forEach(e=>e.textContent='');$$('.qs.on .fi.bad').forEach(e=>e.classList.remove('bad'));
 if(s===0&&!Q.project.size)return err('project','Pick at least one, even if you are only exploring.');
 if(s===3&&$('#qZip').value.length!==5)return err('zip','Enter a 5-digit ZIP code.');
 if(s===5){let ok=true;if(!$('#qFn').value.trim())ok=err('fn','Please add your first name.');if($('#qPh').value.replace(/\D/g,'').length!==10)ok=err('ph','Enter a 10-digit US phone number.');
  const em=$('#qEm').value.trim();if(em&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))ok=err('em','That email doesn\'t look right.');return ok}
 return true}
function qGo(dir){if(dir>0&&!qValid())return;Q.step=Math.max(0,Math.min(6,Q.step+dir));
 if(Q.step===6){$('#qDoneName').textContent=$('#qFn').value.trim()?', '+$('#qFn').value.trim():'';$('#qDoneVisit').textContent=Q.callFirst||!Q.day?'We\'ll agree a time that suits you, then measure your yard and check access.':`Requested for ${Q.day}${Q.slot?' ('+Q.slot.toLowerCase()+')':''}. We'll confirm the exact time.`}
 qUpd();const t=$('.q-main').getBoundingClientRect().top+scrollY-110;if(scrollY>t)scrollTo({top:t,behavior:'smooth'});
 setTimeout(()=>{const f=$('.qs.on input:not([type=checkbox]):not([type=file])');if(f&&!isTouch)f.focus({preventScroll:true})},420)}
$('#qNext').addEventListener('click',e=>{e.preventDefault();qGo(1)});
$('#qBack').onclick=()=>qGo(-1);
$('#qForm').addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target.tagName==='TEXTAREA'||e.target.tagName==='BUTTON'||e.isComposing)return;e.preventDefault();qGo(1)});

/* =========================================================
   MOTION LAYER
   ========================================================= */
// sub-page hero CTAs -> form
$$('.phero .ph-grid').forEach(g=>{const l=g.querySelector('.lead');if(!l)return;const w=document.createElement('div');w.className='ph-side';l.replaceWith(w);w.appendChild(l);
 w.insertAdjacentHTML('beforeend','<div class="ph-ctas"><a href="#/quote" class="btn">Get my free 3D design <span class="arr">→</span></a><a href="tel:+19046852555" class="ph-call">or call (904) 685-2555</a></div>')});
// split headings into masked words
function splitHead(h){if(h.dataset.split)return;h.dataset.split=1;let i=0;
 const walk=n=>{[...n.childNodes].forEach(c=>{
  if(c.nodeType===3){if(!c.textContent.trim())return;const frag=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(' '));return}const w=document.createElement('span');w.className='w';const s=document.createElement('span');s.style.setProperty('--i',i++);s.textContent=t;w.appendChild(s);frag.appendChild(w)});c.replaceWith(frag)}
  else if(c.nodeType===1){if(c.matches('.grad,.grad-blue,br')){const w=document.createElement('span');w.className='w'+(getComputedStyle(c).display==='block'?' wb':'');c.replaceWith(w);const inner=document.createElement('span');inner.style.setProperty('--i',i++);w.appendChild(inner);inner.appendChild(c)}else walk(c)}})};
 walk(h);h.classList.add('sh');if(!h.classList.contains('rv'))h.classList.add('rv')}
$$('.sec-head h2,.studio-head h2,.phero h1,.finder h2,.costt h2,.why h2,.faq h2,.mfg h2,.sp-head h1').forEach(splitHead);
// stagger groups
const STAG='.tr-items,.counters,.loans,.pal-grid,.wty-grid,.mfg-stats,.sp-tips,.journey,.p-points,.flow,.rv-grid,.q-trust';
function stagger(root=document){$$(STAG,root).forEach(g=>{if(g.classList.contains('stg-g'))return;g.classList.add('stg-g');[...g.children].forEach((c,i)=>c.style.setProperty('--d',(i*70)+'ms'));io.observe(g)})}
// image reveal
function imgRev(root=document){$$('.ac .im,.mi,.stack .ph,.step .im',root).forEach(el=>{if(el.classList.contains('ir'))return;el.classList.add('ir');io.observe(el)})}
// scroll progress + hero parallax
const prog=document.createElement('div');prog.id='prog';document.body.appendChild(prog);
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;prog.style.transform=`scaleX(${h>0?scrollY/h:0})`;
 if(reduce)return;const ph=$('.route.on .phero .wrap,.route.on .md-hero .md-copy');if(ph){const y=Math.min(scrollY,600);ph.style.transform=`translateY(${y*.16}px)`;ph.style.opacity=Math.max(0,1-y/700)}},{passive:true});
// magnetic buttons
if(!isTouch&&!reduce){document.addEventListener('pointermove',e=>{const b=e.target.closest&&e.target.closest('.btn');$$('.btn.magon').forEach(x=>{if(x!==b){x.classList.remove('magon');x.style.transform=''}});if(!b||b.closest('.panel-f,.q-nav,.lab-side'))return;const r=b.getBoundingClientRect();b.classList.add('magon');b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.18}px)`},{passive:true})}
const _reveal=reveal;reveal=function(root){stagger(root);imgRev(root);_reveal(root)};

/* =========================================================
   ROUTER
   ========================================================= */
const cur={r:null,key:null};
const TITLES={home:'iTop Pools · Barrier Reef Fiberglass Pools · Jacksonville, FL',pools:'Pool Models · iTop Pools',studio:'3D Pool Design Studio · iTop Pools',colours:'Colour Lab · Barrier Reef Finishes · iTop Pools',learn:'Pool School · iTop Pools',cost:'Pool Cost Estimator & Financing · iTop Pools',work:'Our Work · iTop Pools',why:'Process & Warranty · iTop Pools',quote:'Free 3D Design · iTop Pools'};
const LABEL={home:'Home',pools:'Pool models',model:'Model',studio:'3D studio',colours:'Colour lab',learn:'Pool school',article:'Pool school',cost:'Cost & financing',work:'Our work',why:'Why iTop',quote:'Free 3D design'};
let VP=(location.hash||'#/').slice(1)||'/';
function parse(h){h=(h||VP).replace(/^#?\/?/,'');const [path,qs]=h.split('?');const q=Object.fromEntries(new URLSearchParams(qs||''));const p=(path||'').split('/').filter(Boolean);
 if(!p.length)return{r:'home',q};if(p[0]==='pools'&&p[1])return{r:'model',id:p[1],q};if(p[0]==='learn'&&p[1])return{r:'article',id:p[1],q};
 return{r:TITLES[p[0]]?p[0]:'home',q}}
function go(path){VP=path;try{history.pushState(null,'','#'+path)}catch(e){}route()}
function portals(){['studio','lab','reviews'].forEach(n=>{const el=n==='reviews'?$('#reviewsBlock'):$('#'+n);const slot=$(`.route.on .portal[data-p="${n}"]`);(slot||$('#parking')).appendChild(el)});dispatchEvent(new Event('resize'))}
function show(R){
 $$('.route').forEach(x=>x.classList.toggle('on',x.dataset.route===R.r));
 const root=R.r==='model'?'pools':R.r==='article'?'learn':R.r;$$('#navLinks a[data-r]').forEach(a=>a.classList.toggle('on',a.dataset.r===root));
 document.title=TITLES[R.r]||document.title;portals();
 if(R.r==='pools'){if(R.q.shape||R.q.feat){F.shape.clear();F.feat.clear();R.q.shape&&F.shape.add(R.q.shape);R.q.feat&&F.feat.add(R.q.feat)}fpSync()}
 if(R.r==='model')renderModel(R.id,R.q);
 if(R.r==='studio'||R.r==='home'){if(R.q.m&&byId(R.q.m)){pickModel(byId(R.q.m));st.touched=true}if(R.q.f&&FINISH[R.q.f])setFinish(R.q.f)}
 if(R.r==='learn')renderLearn(R.q);if(R.r==='article')renderArticle(R.id);
 if(R.r==='cost'&&R.q.m&&byId(R.q.m)){E.model=R.q.m;est()}
 if(R.r==='quote'){if(R.q.p&&PL[R.q.p])Q.project.add(R.q.p);if(R.q.m&&byId(R.q.m))Q.model=R.q.m;if(Q.step>5)Q.step=0;if(!Q.project.size&&Q.model)Q.project.add('pool');if(Q.step===0&&Q.project.size&&(R.q.p||R.q.m))Q.step=1;qUpd()}
 cur.r=R.r;cmpUpd();reveal();
 if(cfg&&cfg.ctl&&R.r==='studio')cfg.autospin=!st.touched}
let busy=false,first=true;
function route(){const R=parse();const key=VP;
 if(first){first=false;show(R);cur.key=key;return}
 const sameRoute=cur.r===R.r&&R.r!=='model'&&R.r!=='article';
 if(sameRoute){show(R);return}
 const c=$('#curtain');$('#curtainT').textContent=R.r==='model'?(byId(R.id)||{n:'Model'}).n:LABEL[R.r];
 if(reduce||TEST){show(R);scrollTo(0,0);return}
 c.classList.remove('go');void c.offsetWidth;c.classList.add('go');
 setTimeout(()=>{show(R);scrollTo({top:0,behavior:'instant'})},520);
 setTimeout(()=>c.classList.remove('go'),1200)}
addEventListener('hashchange',()=>{const h=(location.hash||'#/').slice(1)||'/';if(h!==VP){VP=h;route()}});
addEventListener('popstate',()=>{const h=(location.hash||'#/').slice(1)||'/';if(h!==VP){VP=h;route()}});
document.addEventListener('click',e=>{const h=e.target.closest('a[href^="#"]:not([href^="#/"])');if(h&&!h.hasAttribute('data-scroll')){e.preventDefault();const id=h.getAttribute('href').slice(1);const t=id&&document.getElementById(id);t&&t.scrollIntoView({behavior:'smooth'});return}const a=e.target.closest('a[href^="#/"]');if(!a||e.metaKey||e.ctrlKey)return;e.preventDefault();document.body.classList.remove('menu-open');const p=a.getAttribute('href').slice(1);if(p===VP&&cur.r!=='quote'){scrollTo({top:0,behavior:'smooth'});return}go(p)});
route();reveal();
