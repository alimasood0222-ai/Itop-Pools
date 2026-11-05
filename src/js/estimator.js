const PRICE={base:L=>L<=24?[38000,48000]:L<=31?[48000,60000]:L<=36?[56000,70000]:[62000,78000],spaModel:[8000,12000],
 opts:[['spa','Raised spillover spa','Sheer descent into the pool',[12000,18000]],['heat','Heat pump','Swim through the winter',[4500,6500]],['led','Colour LED lighting','Pool and spa lights',[1800,3000]],['auto','Automation','Pump, heat and lights from your phone',[2500,4500]],['salt','Salt system','Softer-feeling water',[1800,2800]],['water','Water features','Sheer descents or bubblers',[2500,6000]],['cage','Screen enclosure','Hurricane-code aluminum',[14000,24000]],['kitchen','Outdoor kitchen','Grill, sink and counters',[15000,35000]]],
 deck:{pavers:[14,20],travertine:[20,28],porcelain:[24,34]},site:{easy:[0,0],tight:[2000,4000],crane:[3500,7000]},permits:[2000,4000]};
const E={model:'coral-sea',opts:new Set(['led','heat']),deckType:'pavers',deck:600,site:'easy',term:20,down:10000,apr:7.99};
later(()=>{$('#esModels').innerHTML=MODELS.map(m=>`<button data-id="${m.id}"><svg viewBox="0 0 140 60"><path d="${planPath(m.s,m.L,m.W)}" fill="#1e9be0" stroke="#bfe9fd" stroke-width="4"/></svg><b>${m.n}</b><small>${m.Ls} × ${m.Ws}</small></button>`).join('');
$('#esOpts').innerHTML=PRICE.opts.map(([k,n,d,r])=>`<button class="eopt" data-k="${k}"><span class="ck">✓</span><span><b>${n}</b><small>${d}</small></span><em>+${k$(r[0])}–${k$(r[1])}</em></button>`).join('');
$$('#esModels button').forEach(b=>b.onclick=()=>{E.model=b.dataset.id;est()});
$$('#esOpts .eopt').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='spa'&&byId(E.model).spa)return;E.opts.has(k)?E.opts.delete(k):E.opts.add(k);est()});est()});
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
$('#eoSend').addEventListener('click',()=>{track('estimator_complete',{model:E.model,range:`${k$(E.lo)}–${k$(E.hi)}`});Brief.set({model:E.model,estimate:`${k$(E.lo)}–${k$(E.hi)}`})});
(()=>{const m=new URLSearchParams(location.search).get('m');if(m&&byId(m)){E.model=m;later(est)}})();
