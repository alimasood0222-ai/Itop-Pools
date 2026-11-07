// Pool models: Length, Width, Shape and Features filters over the server-rendered cards.
// As on Barrier Reef: a card size like "31' / 40'" covers everything between its numbers, so a model matches
// a range it overlaps. Every checked feature must match.
(()=>{const form=$('#bmFil');if(!form)return;
const cards=$$('#bmGrid .bm'),len=$('#bmLen'),wid=$('#bmWid'),shape=$('#bmShape'),fb=$('#bmFeatBtn'),fm=$('#bmFeatMenu'),boxes=$$('#bmFeatMenu input');
const inRange=(vals,r)=>{if(!r)return true;const [a,b]=r.split('-').map(Number);return Math.max(...vals)>=a&&Math.min(...vals)<b+1};
function apply(){const feats=boxes.filter(b=>b.checked).map(b=>b.value);let n=0;
 cards.forEach(c=>{const ok=inRange(c.dataset.l.split(' ').map(Number),len.value)&&inRange(c.dataset.w.split(' ').map(Number),wid.value)&&(!shape.value||c.dataset.s.split(' ').includes(shape.value))&&feats.every(f=>c.dataset.f.split(' ').includes(f));c.hidden=!ok;if(ok)n++});
 $('#bmCount').textContent=n+(n===1?' model':' models');$('#bmNone').hidden=n>0;
 fb.textContent=feats.length?`Features (${feats.length})`:'Features';fb.classList.toggle('on',feats.length>0);
 [len,wid,shape].forEach(s=>s.classList.toggle('on',!!s.value));
 const q=new URLSearchParams();if(len.value)q.set('length',len.value);if(wid.value)q.set('width',wid.value);if(shape.value)q.set('shape',shape.value);if(feats.length)q.set('features',feats.join(','));
 history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash)}
const menu=open=>{fm.hidden=!open;fb.setAttribute('aria-expanded',open)};
fb.onclick=e=>{e.stopPropagation();menu(fm.hidden)};
document.addEventListener('click',e=>{if(!e.target.closest('#bmFeat'))menu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!fm.hidden){menu(false);fb.focus()}});
[len,wid,shape,...boxes].forEach(el=>el.addEventListener('change',apply));
form.addEventListener('submit',e=>e.preventDefault());
const clear=()=>{form.reset();menu(false);setTimeout(apply)};
form.addEventListener('reset',()=>{menu(false);setTimeout(apply)});$('#bmNoneClear').onclick=clear;
// Links can preselect filters, for example /fiberglass-pools/?shape=plunge
const q=new URLSearchParams(location.search),set=(el,v)=>{if(v&&[...el.options].some(o=>o.value===v))el.value=v};
set(len,q.get('length'));set(wid,q.get('width'));set(shape,q.get('shape'));(q.get('features')||'').split(',').forEach(v=>{const b=boxes.find(x=>x.value===v);if(b)b.checked=true});
apply();
})();
