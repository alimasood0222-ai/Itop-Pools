// 3D design studio. All choices live in `st` and are applied to the scene when it loads,
// so anything picked before the 3D view is ready still takes effect.
const SPA_N={cube:'Cube',horseshoe:'Horseshoe',oval:'Oval',resort:'Resort'};
/* Tremron paver lines, colors and coping (src/data/pavers.json) */
const PAVERS={{PAVERSJSON}};
/* Each model's outline, traced from its Barrier Reef drawing (src/data/outlines.json), so the 3D pool has the same shape as the card */

const pvLine=id=>PAVERS.lines.find(l=>l.id===id),pvColor=(l,id)=>l.colors.find(c=>c.id===id)||l.colors[0];
const st={model:byId('whitsunday'),size:0,finish:'ocean',deck:'Travertine',deckV:'travertine',feats:{spa:true,ledge:true,cage:false},spaType:'cube',spaAttached:true,paverLine:'olde-towne',paverColor:'sand-dune',coping:null,light:'day',view:'poolside',touched:false};
st.size=st.model.def;
const sz=()=>st.model.sizes[st.size]||st.model.sizes[st.model.def];
function initStudio3D(){if(cfg||failed3D)return;load3D().then(()=>{if(cfg)return;cfg=new PoolScene($('#cfgCanvas'),{interactive:true,time:st.light});cfg.autospin=true;
  if(TEST)window.__studio=cfg;
  cfg.onInteract=()=>{if(!cfg.seen){cfg.seen=1;track('design_3d_interaction')}cfg.autospin=false;st.touched=true;const h=$('#cfgHint');if(h)h.style.opacity=0};
  cfg.onSpaMove=s=>{st.spaAttached=s.attached;spaWhere()};
  cfg.onSpaDrop=()=>{st.touched=true;sum();track('design_3d_spa_moved',{attached:st.spaAttached})};
  $$('#optDeck .dk').forEach(b=>{try{b.querySelector('span').style.backgroundImage=`url(${deckTex(b.dataset.v).image.toDataURL('image/jpeg',.7)})`}catch(e){}});
  cfg.set({finish:st.finish,deck:st.deckV,spaType:st.spaType});applyModel();applyPaver();applyCoping();if(st.view!=='poolside')cfg.view(st.view);loop3D()}).catch(fail3D)}
init3D.studio=initStudio3D;
const ml=$('#mList'),msz=$('#mSizes');
later(()=>{MODELS.forEach(m=>{const b=document.createElement('button');b.className='mbtn';b.dataset.id=m.id;
 b.innerHTML=`<img src="/models-br/${m.id}.webp" alt="" width="72" height="32" loading="lazy" decoding="async"><span><b>${m.n}</b><small>${m.sizes.length>1?m.sizes.length+' sizes':m.Ls+' × '+m.Ws}</small></span>`;
 b.onclick=()=>{pickModel(m);st.touched=true};ml.appendChild(b)});$$('.mbtn',ml).forEach(b=>b.classList.toggle('on',b.dataset.id===st.model.id))});
// The model's shape, size and built-in features go to the scene; the feature toggles follow the model
function applyModel(){const z=sz(),m=st.model;if(cfg)cfg.set({shape:m.s,outline:OUTLINES[m.id]||null,sx:z.L/40,sy:z.W/16,ledge:st.feats.ledge,spa:st.feats.spa,cage:st.feats.cage})}
function pickModel(m,size){st.model=m;st.size=size!=null&&m.sizes[size]?size:m.def;st.feats.ledge=m.feats.includes('ledge');if(m.spa)st.feats.spa=true;
 $$('.mbtn',ml).forEach(b=>b.classList.toggle('on',b.dataset.id===m.id));
 msz.hidden=m.sizes.length<2;msz.innerHTML=m.sizes.length<2?'':m.sizes.map((z,i)=>`<button type="button" data-i="${i}" class="${i===st.size?'on':''}"><b>${z.label}</b><small>${z.Ls} × ${z.Ws}</small></button>`).join('');
 $$('button',msz).forEach(b=>b.onclick=()=>{pickSize(+b.dataset.i);st.touched=true});
 applyModel();showModel();syncToggles();sum()}
function pickSize(i){st.size=i;$$('button',msz).forEach(b=>b.classList.toggle('on',+b.dataset.i===i));applyModel();showModel();sum()}
function showModel(){const z=sz();$('#mName').textContent=st.model.sizes.length>1?z.label:st.model.n;$('#hudModel').textContent=st.model.n;$('#hudSize').textContent=z.Ls+' × '+z.Ws}
function syncToggles(){$$('#optToggles .tg').forEach(t=>{const on=!!st.feats[t.dataset.k];t.classList.toggle('on',on);t.setAttribute('aria-checked',on)});$('#spaOpts').hidden=!st.feats.spa}
function spaWhere(){const w=$('#spaWhere');if(w)w.textContent=st.spaAttached?'At the pool edge, spilling into the pool. Drag it in the 3D view to move it.':'Freestanding on the deck. Drag it against the pool for a spillover.'}
function sum(){const z=sz(),f=[];st.feats.spa&&f.push(`${SPA_N[st.spaType]} spa ${st.spaAttached?'at the pool edge':'on the deck'}`);st.feats.ledge&&f.push('tanning ledge');st.feats.cage&&f.push('screen enclosure');
 $('#sum').innerHTML=`<b>${st.model.sizes.length>1?z.label:st.model.n}</b> · ${z.Ls} × ${z.Ws} · ${FIN_META[st.finish].n} finish · ${deckText()}${f.length?' · '+f.join(', '):''}`}
function setFinish(k){st.finish=k;cfg&&cfg.set({finish:k});$$('#optFinish .sw').forEach(x=>x.classList.toggle('on',x.dataset.v===k));$('#finName').textContent=FIN_META[k].n;sum()}
const of=$('#optFinish');FIN_KEYS.forEach(k=>{const b=document.createElement('button');b.className='sw';b.dataset.v=k;b.dataset.n=FIN_META[k].n;b.style.background=swBg(k);b.setAttribute('aria-label',FIN_META[k].n);b.onclick=()=>{setFinish(k);st.touched=true};of.appendChild(b)});
$$('#optDeck .dk').forEach(b=>{
 b.onclick=()=>{$$('#optDeck .dk').forEach(x=>x.classList.remove('on'));b.classList.add('on');st.deckV=b.dataset.v;st.deck=b.querySelector('b').textContent;$('#pvOpts').hidden=st.deckV!=='pavers';if(st.deckV==='pavers')applyPaver();else cfg&&cfg.set({deck:st.deckV});deckLabel();st.touched=true;sum()}});
// Tremron pavers: pick a style, then a color. The pool coping can use Tremron bullnose colors.
// Chips come from one strip image per line (<line>-chips.webp), one 64px square per color.
const chip=(line,i)=>`background-image:url(/pavers/${line.id}-chips.webp);background-size:${line.colors.length*100}% 100%;background-position:${line.colors.length>1?i/(line.colors.length-1)*100:0}% 0`;
function deckText(){if(st.deckV!=='pavers')return st.deck+' deck';const l=pvLine(st.paverLine);return `Tremron ${l.n} pavers in ${pvColor(l,st.paverColor).n}`+(st.coping?`, ${pvColor(PAVERS.coping,st.coping).n} bullnose coping`:'')}
function deckLabel(){const l=pvLine(st.paverLine),c=pvColor(l,st.paverColor);$('#deckName').textContent=st.deckV==='pavers'?c.n:st.deck;$('#pvLineName').textContent=l.n+(l.sizes?' · '+l.sizes:'');$('#pvColorName').textContent=c.n;
 const pb=$('#optDeck .dk[data-v=pavers] span');if(pb)pb.setAttribute('style',chip(l,l.colors.indexOf(c)))}
function renderPaverColors(){const l=pvLine(st.paverLine);
 $('#pvColors').innerHTML=l.colors.map((c,i)=>`<button type="button" class="pvc${c.id===st.paverColor?' on':''}" data-v="${c.id}"><i style="${chip(l,i)}"></i><span>${c.n}</span></button>`).join('');
 $$('#pvColors .pvc').forEach(b=>b.onclick=()=>{st.paverColor=b.dataset.v;$$('#pvColors .pvc').forEach(x=>x.classList.toggle('on',x===b));applyPaver();st.touched=true;track('design_3d_paver',{line:st.paverLine,color:st.paverColor})})}
$('#pvLines').innerHTML=PAVERS.lines.map(l=>`<button type="button" class="pvl${l.id===st.paverLine?' on':''}" data-v="${l.id}"><i style="${chip(l,0)}"></i><b>${l.n}</b></button>`).join('');
$$('#pvLines .pvl').forEach(b=>b.onclick=()=>{b.scrollIntoView({block:'nearest',inline:'nearest'});st.paverLine=b.dataset.v;$$('#pvLines .pvl').forEach(x=>x.classList.toggle('on',x===b));const l=pvLine(st.paverLine);if(!l.colors.some(c=>c.id===st.paverColor))st.paverColor=l.colors[0].id;renderPaverColors();applyPaver();st.touched=true});
const CP=PAVERS.coping;
$('#copColors').innerHTML='<button type="button" class="pvc on" data-v=""><i style="background:#e6dcc6"></i><span>Natural stone</span></button>'+CP.colors.map((c,i)=>`<button type="button" class="pvc" data-v="${c.id}"><i style="${chip(CP,i)}"></i><span>${c.n}</span></button>`).join('');
$$('#copColors .pvc').forEach(b=>b.onclick=()=>{st.coping=b.dataset.v||null;$$('#copColors .pvc').forEach(x=>x.classList.toggle('on',x===b));$('#copName').textContent=st.coping?pvColor(CP,st.coping).n+' bullnose':'Natural stone';applyCoping();st.touched=true;sum()});
function applyPaver(){deckLabel();sum();if(cfg&&st.deckV==='pavers'){const l=pvLine(st.paverLine);if(cfg.state.deck!=='pavers')cfg.set({deck:'pavers'});cfg.setPaver(l,pvColor(l,st.paverColor)).catch(e=>console.warn('paver texture',e))}}
function applyCoping(){if(cfg)cfg.setCoping(CP,st.coping?pvColor(CP,st.coping):null).catch(e=>console.warn('coping texture',e))}
renderPaverColors();deckLabel();
$$('#optToggles .tg').forEach(t=>{const fn=()=>{const k=t.dataset.k;st.feats[k]=!st.feats[k];syncToggles();cfg&&cfg.set({[k]:st.feats[k]});st.touched=true;sum()};t.onclick=fn;t.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();fn()}}});
$$('#spaTypes button').forEach(b=>b.onclick=()=>{st.spaType=b.dataset.v;$$('#spaTypes button').forEach(x=>x.classList.toggle('on',x===b));cfg&&cfg.set({spaType:st.spaType});st.touched=true;sum()});
$('#spaReset').onclick=()=>{cfg&&cfg.resetSpa();st.touched=true;sum()};
$$('#lightSeg button').forEach(b=>b.onclick=()=>{$$('#lightSeg button').forEach(x=>x.classList.toggle('on',x===b));st.light=b.dataset.v;cfg&&cfg.setTime(st.light)});
$$('#views button[data-v]').forEach(b=>b.onclick=()=>{$$('#views button[data-v]').forEach(x=>x.classList.toggle('on',x===b));st.view=b.dataset.v;if(cfg){cfg.view(st.view);cfg.onInteract()}});
$('#fsBtn').onclick=()=>{const s=$('#studio');if(document.fullscreenElement)document.exitFullscreen();else if(s.requestFullscreen)s.requestFullscreen();else if(s.webkitRequestFullscreen)s.webkitRequestFullscreen()};
$('#cfgBtn').addEventListener('click',()=>{st.touched=true;Brief.set({model:st.model.id,design:$('#sum').innerHTML.replace(/<\/?b>/g,'')})});
pickModel(st.model);setFinish('ocean');spaWhere();
near3D.observe($('#studio'));
// Links can preselect a model (?m=bondi), a size (?s=0) and a finish (?f=arctic)
(()=>{const q=new URLSearchParams(location.search);const m=q.get('m'),f=q.get('f'),s=q.get('s');if(m&&byId(m)){pickModel(byId(m),s!=null?+s:null);st.touched=true}if(f&&FINISH[f])setFinish(f)})();
