function initStudio3D(){if(cfg||failed3D)return;load3D().then(()=>{if(cfg)return;cfg=new PoolScene($('#cfgCanvas'),{interactive:true,time:'day'});cfg.autospin=true;
  cfg.onInteract=()=>{if(!cfg.seen){cfg.seen=1;track('design_3d_interaction')}cfg.autospin=false;st.touched=true;const h=$('#cfgHint');if(h)h.style.opacity=0};
  $$('#optDeck .dk').forEach(b=>{try{b.querySelector('span').style.backgroundImage=`url(${deckTex(b.dataset.v).image.toDataURL('image/jpeg',.7)})`}catch(e){}});
  pickModel(st.model);setFinish(st.finish);const dk=$('#optDeck .dk.on');dk&&cfg.set({deck:dk.dataset.v});loop3D()}).catch(fail3D)}
init3D.studio=initStudio3D;
const st={model:byId('whitsunday'),finish:'ocean',deck:'Travertine',touched:false};
const ml=$('#mList');
later(()=>{MODELS.forEach((m,i)=>{const b=document.createElement('button');b.className='mbtn';b.dataset.id=m.id;
 b.innerHTML=`<svg viewBox="0 0 140 60"><path d="${planPath(m.s,m.L,m.W)}" fill="#1e9be0" stroke="#bfe9fd" stroke-width="4"/></svg><span><b>${m.n}</b><small>${m.Ls} × ${m.Ws}</small></span>`;
 b.onclick=()=>{pickModel(m);st.touched=true};ml.appendChild(b)});$$('.mbtn',ml).forEach(b=>b.classList.toggle('on',b.dataset.id===st.model.id))});
function pickModel(m){st.model=m;if(cfg)cfg.set({shape:m.s,sx:m.L/40,sy:m.W/16,ledge:m.feats.includes('ledge'),spa:m.spa?true:cfg.state.spa});
 $$('.mbtn',ml).forEach(b=>b.classList.toggle('on',b.dataset.id===m.id));$('#mName').textContent=m.n;$('#hudModel').textContent=m.n;$('#hudSize').textContent=m.Ls+' × '+m.Ws;syncToggles();sum()}
function syncToggles(){if(!cfg)return;$$('#optToggles .tg').forEach(t=>{const on=!!cfg.state[t.dataset.k];t.classList.toggle('on',on);t.setAttribute('aria-checked',on)})}
function sum(){const f=[];if(cfg){cfg.state.spa&&f.push('spa');cfg.state.ledge&&f.push('tanning ledge');cfg.state.cage&&f.push('screen enclosure')}
 $('#sum').innerHTML=`<b>${st.model.n}</b> · ${st.model.Ls} × ${st.model.Ws} · ${FIN_META[st.finish].n} finish · ${st.deck} deck${f.length?' · '+f.join(', '):''}`}
function setFinish(k){st.finish=k;cfg&&cfg.set({finish:k});$$('#optFinish .sw').forEach(x=>x.classList.toggle('on',x.dataset.v===k));$('#finName').textContent=FIN_META[k].n;sum()}
const of=$('#optFinish');FIN_KEYS.forEach(k=>{const b=document.createElement('button');b.className='sw';b.dataset.v=k;b.dataset.n=FIN_META[k].n;b.style.background=swBg(k);b.setAttribute('aria-label',FIN_META[k].n);b.onclick=()=>{setFinish(k);st.touched=true};of.appendChild(b)});
$$('#optDeck .dk').forEach(b=>{
 b.onclick=()=>{$$('#optDeck .dk').forEach(x=>x.classList.remove('on'));b.classList.add('on');cfg&&cfg.set({deck:b.dataset.v});st.deck=b.querySelector('b').textContent;$('#deckName').textContent=st.deck;st.touched=true;sum()}});
$$('#optToggles .tg').forEach(t=>{const fn=()=>{const on=!t.classList.contains('on');t.classList.toggle('on',on);t.setAttribute('aria-checked',on);cfg&&cfg.set({[t.dataset.k]:on});st.touched=true;sum()};t.onclick=fn;t.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();fn()}}});
$$('#lightSeg button').forEach(b=>b.onclick=()=>{$$('#lightSeg button').forEach(x=>x.classList.remove('on'));b.classList.add('on');cfg&&cfg.setTime(b.dataset.v)});
$$('#views button[data-v]').forEach(b=>b.onclick=()=>{$$('#views button[data-v]').forEach(x=>x.classList.remove('on'));b.classList.add('on');cfg&&cfg.view(b.dataset.v);cfg&&cfg.onInteract()});
$('#fsBtn').onclick=()=>{const s=$('#studio');if(document.fullscreenElement)document.exitFullscreen();else if(s.requestFullscreen)s.requestFullscreen()};
$('#cfgBtn').addEventListener('click',()=>{st.touched=true;Brief.set({model:st.model.id,design:$('#sum').innerHTML.replace(/<\/?b>/g,'')})});
pickModel(st.model);setFinish('ocean');
near3D.observe($('#studio'));
(()=>{const q=new URLSearchParams(location.search);const m=q.get('m'),f=q.get('f');if(m&&byId(m)){pickModel(byId(m));st.touched=true}if(f&&FINISH[f])setFinish(f)})();
