const WF=[['all','All'],['fiberglass','Fiberglass pools'],['features','Spas & features'],['pavers','Pavers & decks'],['enclosure','Enclosures']];
const figs=$$('#wkGrid .mi');
function wkRender(k){$('#wkFil').innerHTML=WF.map(([v,l])=>`<button class="${v===k?'on':''}" data-v="${v}">${l}<sup>${v==='all'?figs.length:figs.filter(f=>f.dataset.cat===v).length}</sup></button>`).join('');$$('#wkFil button').forEach(b=>b.onclick=()=>wkRender(b.dataset.v));figs.forEach(f=>{f.hidden=!(k==='all'||f.dataset.cat===k)})}
wkRender('all');$('#wkGrid').addEventListener('click',e=>{const f=e.target.closest('[data-full]');f&&openLB(f.dataset.full)});
