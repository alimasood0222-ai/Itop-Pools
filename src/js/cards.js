const F={shape:new Set(),feat:new Set(),len:40,wid:16,sort:'len'};const CMP=new Set(Brief.get().cmp||[]);
function cardHTML(m){return `<div class="pc"><div class="pl pl-ph">${pic(m.photo,{sizes:'(max-width:680px) 100vw,340px'})}${m.feats.includes('new')?'<span class="tag">New 2026</span>':''}<button class="cmp ${CMP.has(m.id)?'on':''}" data-id="${m.id}">${CMP.has(m.id)?'✓ Comparing':'+ Compare'}</button><span class="pl-mini" aria-hidden="true">${planSVG(m,{fin:'california'})}</span></div>
 <h3>${m.n}</h3><div class="t">${m.t}</div>
 <div class="dims"><div><small>Length</small><b>${m.Ls}</b></div><div><small>Width</small><b>${m.Ws}</b></div><div><small>Deep</small><b>${m.D?(m.sizes[m.def].Ds):'—'}</b></div></div>
 <div class="fts">${m.feats.filter(f=>f!=='new').map(f=>`<span>${FT_LBL[f]}</span>`).join('')}</div>
 <div class="acts"><a href="/fiberglass-pools/${m.id}/">View model</a><a href="/3d-pool-design/?m=${m.id}">3D</a></div></div>`}
function toggleCmp(id){if(CMP.has(id))CMP.delete(id);else{if(CMP.size>=3){toast('You can compare up to 3 models. Remove one first.');return}CMP.add(id)}Brief.set({cmp:[...CMP]});cmpUpd();if(PAGE==='pools')fpRender();if(PAGE==='model')$('#mdCmp').textContent=CMP.has(id)?'✓ In compare':'+ Add to compare'}
function cmpUpd(){if(!$('#ctSlots'))return;const a=[...CMP];$('#ctSlots').innerHTML=[0,1,2].map(i=>a[i]?`<span>${byId(a[i]).n}</span>`:'<span class="e">Add a model</span>').join('');$('#cmpTray').classList.toggle('on',a.length>0)}
