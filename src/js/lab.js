function initLab3D(){if(lab||failed3D)return;load3D().then(()=>{if(lab)return;lab=new Lab($('#labCanvas'),$('#labStage'));lab.set('a',LS.a);lab.set('b',LS.b);loop3D()}).catch(fail3D)}
init3D.lab=initLab3D;
const LS={a:'ocean',b:'arctic',focus:'a'};
function labSet(side,k){LS[side]=k;LS.focus=side;lab&&lab.set(side,k);
 $$('#labSw'+side.toUpperCase()+' button').forEach(b=>b.classList.toggle('on',b.dataset.v===k));
 $('#labTag'+side.toUpperCase()).textContent=FIN_META[k].n;const m=FIN_META[k];$('#labName').textContent=m.n;$('#labDesc').textContent=m.d;$('#labPair').textContent=m.p}
['a','b'].forEach(s=>{const box=$('#labSw'+s.toUpperCase());FIN_KEYS.forEach(k=>{const b=document.createElement('button');b.dataset.v=k;b.style.background=swBg(k);b.title=FIN_META[k].n;b.setAttribute('aria-label',FIN_META[k].n);b.onclick=()=>labSet(s,k);box.appendChild(b)})});
labSet('b','arctic');labSet('a','ocean');
near3D.observe($('#lab'));$('#lab').addEventListener('pointerdown',()=>track('color_lab_use'),{once:true});
(()=>{const stg=$('#labStage'),sp=$('#labSplit');let drag=false;
 const mv=e=>{const r=stg.getBoundingClientRect();const x=Math.min(.97,Math.max(.03,(e.clientX-r.left)/r.width));sp.style.left=x*100+'%';lab&&lab.split(x)};
 stg.addEventListener('pointerdown',e=>{if(e.target.closest('.lab-light'))return;drag=true;$('#lab').classList.add('touched');stg.setPointerCapture(e.pointerId);mv(e)});
 stg.addEventListener('pointermove',e=>{if(drag)mv(e)});stg.addEventListener('pointerup',()=>drag=false);stg.addEventListener('pointercancel',()=>drag=false);
 $$('#labLight button').forEach(b=>b.onclick=()=>{$$('#labLight button').forEach(x=>x.classList.remove('on'));b.classList.add('on');lab&&lab.light(+b.dataset.v)});
 $('#labTo3d').addEventListener('click',()=>{$('#labTo3d').href='/3d-pool-design/?f='+LS[LS.focus]});
})();

$$('#palGrid .pal').forEach(b=>b.onclick=()=>{labSet(LS.focus==='a'?'b':'a',b.dataset.v);$('#lab').scrollIntoView({behavior:'smooth',block:'center'})});
