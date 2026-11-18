const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const isTouch=matchMedia('(hover:none)').matches;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const SITE={{SITEJSON}};
const PAGE=($('.route')||{dataset:{}}).dataset.route;
const TEST=window.__TEST=/[?&]test\b/.test(location.search);
window.dataLayer=window.dataLayer||[];const track=(event,o)=>window.dataLayer.push(Object.assign({event},o||{}));
/* Choices carried between pages: chosen model, estimate, 3D design, compare list */
const Brief={get(){try{return JSON.parse(sessionStorage.getItem('itop_brief'))||{}}catch(e){return {}}},set(o){try{sessionStorage.setItem('itop_brief',JSON.stringify({...Brief.get(),...o}))}catch(e){}}};
/* Content for sections that aren't on screen yet is built in small slices after first paint */
const laterQ=[];const later=fn=>laterQ.push(fn);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const k$=n=>'$'+(Math.round(n/1000)).toLocaleString('en-US')+'k';
const pmt=(P,apr,yrs)=>{const r=apr/100/12,n=yrs*12;return P<=0?0:r?P*r/(1-Math.pow(1+r,-n)):P/n};
function toast(msg){const t=$('#toast');$('#toastT').textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),4200)}
function setP(r){const p=(r.value-r.min)/(r.max-r.min)*100;r.style.setProperty('--p',p+'%')}
requestAnimationFrame(()=>document.body.classList.add('ready'));
let ly=0;const nav=$('#nav'),mbar=$('#mbar');
addEventListener('scroll',()=>{const y=scrollY;document.body.classList.toggle('past-hero',y>innerHeight*.8);nav.classList.toggle('scrolled',y>40);ly=y;mbar.classList.toggle('on',y>innerHeight*.7)},{passive:true});
/* mobile drawer */
const drawer=$('#drawer'),burger=$('#burger');let drLast=null;
function drOpen(){drLast=document.activeElement;drawer.inert=false;drawer.setAttribute('aria-hidden','false');document.body.classList.add('menu-open');burger.setAttribute('aria-expanded','true');burger.setAttribute('aria-label','Close menu');setTimeout(()=>$('#drClose').focus({preventScroll:true}),60)}
function drClose(){if(!document.body.classList.contains('menu-open'))return;document.body.classList.remove('menu-open');drawer.inert=true;drawer.setAttribute('aria-hidden','true');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu');drawer.style.transform='';if(drLast&&drLast.focus)drLast.focus({preventScroll:true})}
burger.addEventListener('click',()=>document.body.classList.contains('menu-open')?drClose():drOpen());
$('#drClose').addEventListener('click',drClose);$('#drBack').addEventListener('click',drClose);
$('#drPoolsBtn').addEventListener('click',e=>{const b=e.currentTarget,o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',o);$('#drPools').classList.toggle('open',o)});
drawer.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('a[href],button',drawer).filter(x=>x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
(()=>{let sx=null,sy=0,dx=0;drawer.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0},{passive:true});
 drawer.addEventListener('touchmove',e=>{if(sx===null)return;dx=e.touches[0].clientX-sx;if(Math.abs(e.touches[0].clientY-sy)>Math.abs(dx)){sx=null;drawer.style.transform='';return}if(e.cancelable)e.preventDefault();if(dx>0)drawer.style.transform='translateX('+dx+'px)'},{passive:false});
 drawer.addEventListener('touchend',()=>{if(sx!==null&&dx>70)drClose();else drawer.style.transform='';sx=null},{passive:true})})();
document.addEventListener('click',e=>{const a=e.target.closest('a[data-scroll]');if(!a)return;e.preventDefault();const t=$(a.getAttribute('href'));t&&t.scrollIntoView({behavior:'smooth'})});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
let reveal=function(root=document){$$('.rv:not(.in),.flow:not(.in),.mtx:not(.in),.tli:not(.in)',root).forEach(el=>io.observe(el))};
const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,to=+el.dataset.to;let s=null;const step=ts=>{if(!s)s=ts;const k=Math.min(1,(ts-s)/1400);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step);co.unobserve(el)}),{threshold:.6});
$$('.count').forEach(el=>co.observe(el));
$('#lb').onclick=()=>$('#lb').classList.remove('on');
const openLB=src=>{$('#lb img').src=src;$('#lb').classList.add('on')};
addEventListener('keydown',e=>{if(e.key==='Escape'){$('#lb').classList.remove('on');drClose();document.body.classList.remove('fp-open-s')}});
$$('input[type=range]').forEach(r=>{setP(r);r.addEventListener('input',()=>setP(r))});
document.addEventListener('click',e=>{const b=e.target.closest('.qa-h>button');if(!b)return;const d=b.closest('.qa'),list=d.parentElement,o=!d.classList.contains('open');$$(':scope>.qa',list).forEach(x=>{x.classList.remove('open');x.querySelector('button').setAttribute('aria-expanded',false)});if(o){d.classList.add('open');b.setAttribute('aria-expanded',true)}});
// split headings into masked words
function splitHead(h){if(h.dataset.split)return;h.dataset.split=1;let i=0;
 const walk=n=>{[...n.childNodes].forEach(c=>{
  if(c.nodeType===3){if(!c.textContent.trim())return;const frag=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(' '));return}const w=document.createElement('span');w.className='w';const s=document.createElement('span');s.style.setProperty('--i',i++);s.textContent=t;w.appendChild(s);frag.appendChild(w)});c.replaceWith(frag)}
  else if(c.nodeType===1){if(c.matches('.grad,.grad-blue,br')){const w=document.createElement('span');w.className='w'+(getComputedStyle(c).display==='block'?' wb':'');c.replaceWith(w);const inner=document.createElement('span');inner.style.setProperty('--i',i++);w.appendChild(inner);inner.appendChild(c)}else walk(c)}})};
 walk(h);h.classList.add('sh');if(!h.classList.contains('rv'))h.classList.add('rv')}
$$('.sec-head h2,.studio-head h2,.finder h2,.costt h2,.why h2,.faq h2,.mfg h2').forEach(splitHead);
// stagger groups
const STAG='.tr-items,.counters,.loans,.pal-grid,.wty-grid,.mfg-stats,.sp-tips,.journey,.p-points,.flow,.rv-grid,.q-acts';
function stagger(root=document){$$(STAG,root).forEach(g=>{if(g.classList.contains('stg-g'))return;g.classList.add('stg-g');[...g.children].forEach((c,i)=>c.style.setProperty('--d',(i*70)+'ms'));io.observe(g)})}
// image reveal
function imgRev(root=document){$$('.ac .im,.mi,.stack .ph,.step .im',root).forEach(el=>{if(el.classList.contains('ir'))return;el.classList.add('ir');io.observe(el)})}
// scroll progress + hero parallax
const prog=document.createElement('div');prog.id='prog';document.body.appendChild(prog);
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;prog.style.transform=`scaleX(${h>0?scrollY/h:0})`;
 if(reduce||innerWidth<1100)return;const ph=$('.route.on .phero .wrap,.route.on .md-hero .md-copy');if(ph){const y=Math.min(scrollY,600);ph.style.transform=`translateY(${y*.16}px)`;ph.style.opacity=Math.max(0,1-y/700)}},{passive:true});
// magnetic buttons
if(!isTouch&&!reduce){document.addEventListener('pointermove',e=>{const b=e.target.closest&&e.target.closest('.btn');$$('.btn.magon').forEach(x=>{if(x!==b){x.classList.remove('magon');x.style.transform=''}});if(!b||b.closest('.panel-f,.q-nav,.lab-side'))return;const r=b.getBoundingClientRect();b.classList.add('magon');b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.18}px)`},{passive:true})}
const _reveal=reveal;reveal=function(root){stagger(root);imgRev(root);_reveal(root)};
/* marks the current section in the menus */
(()=>{const root={model:'pools',article:'learn',shape:'pools',compare:'learn',financing:'cost'}[PAGE]||PAGE;$$('#navLinks a[data-r]').forEach(a=>a.classList.toggle('on',a.dataset.r===root));$$('#drawer [data-r]').forEach(a=>{const on=a.dataset.r===root;a.classList.toggle('on',on);if(on&&a.tagName==='A')a.setAttribute('aria-current','page')})})();
document.addEventListener('click',e=>{if(e.target.closest('a[href^="tel:"]'))track('phone_click');if(e.target.closest('a[href^="mailto:"]'))track('email_click');const h=e.target.closest('a[href^="#"]');if(h&&!h.hasAttribute('data-scroll')){e.preventDefault();const id=h.getAttribute('href').slice(1);const t=id&&document.getElementById(id);t&&t.scrollIntoView({behavior:'smooth'})}});
/* a link to one question opens its answer */
if(location.hash.startsWith('#q-')){const t=document.getElementById(location.hash.slice(1));if(t&&!t.classList.contains('open'))t.querySelector('button').click()}

/* Chat & voice, bottom right on every page. With SITE.ghlWidgetId set (src/data/site.json), the orange button opens the
   GoHighLevel widget, which offers live chat (the AI chatbot) and a Voice AI call. GHL's own bubble and its automatic
   pop-up are hidden, so there's one button. If GHL hasn't loaded (blocked, slow, down), the button opens our own panel
   instead: Chat sends a message and Voice offers tap-to-call or a call-back request, all through /api/lead
   (source "website_chat"; call-backs add request "callback"). */
(()=>{const box=$('#chat');if(!box)return;
 if($('#qNav'))box.classList.add('above-nav');
 const btn=$('#chatBtn'),panel=$('#chatPanel'),form=$('#chatForm'),done=$('#chatDone'),errEl=$('#chatErr'),name=$('#chatName'),ph=$('#chatPhone'),msg=$('#chatMsg');
 const tabs=[$('#chatTabC'),$('#chatTabV')],panes=[$('#chatPaneC'),$('#chatPaneV')];let cur=0;
 const tab=i=>{cur=i;tabs.forEach((t,k)=>{t.setAttribute('aria-selected',k===i);t.tabIndex=k===i?0:-1;panes[k].hidden=k!==i});if(i===1)track('chat_tab_voice')};
 tabs.forEach((t,i)=>{t.onclick=()=>tab(i);t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=1-i;tab(n);tabs[n].focus()}})});
 const first=()=>cur===1?$('#cbName'):(form.hidden?btn:name);
 const open=o=>{panel.hidden=!o;box.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Close chat':'Chat or talk with iTop Pools');if(o){track('chat_open');if(!isTouch)setTimeout(()=>first().focus(),60)}};
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){open(false);btn.focus()}});
 $$('.chat-quick a,.chat-act[data-track]').forEach(a=>a.addEventListener('click',()=>track(a.dataset.track)));
 // GoHighLevel widget: load it once the page is idle, hide its own bubble and pop-up, and open it from our button
 const G={ok:false};
 const api=()=>window.leadConnector&&window.leadConnector.chatWidget;
 const sync=()=>{const w=api(),on=!!(w&&w.isActive&&w.isActive());box.classList.toggle('open',on);box.classList.toggle('ghl-on',on);btn.setAttribute('aria-expanded',on);btn.setAttribute('aria-label',on?'Close chat':'Chat or talk with iTop Pools');return on};
 const watch=()=>{clearInterval(G.t);G.t=setInterval(()=>{if(!sync())clearInterval(G.t)},400)};
 btn.onclick=()=>{if(G.ok&&panel.hidden){const w=api();if(w.isActive()){w.closeWidget();sync()}else{w.openWidget();track('chat_open_ghl');sync();watch()}return}open(panel.hidden)};$('#chatClose').onclick=()=>{open(false);btn.focus()};
 if(SITE.ghlWidgetId){const load=()=>{const s=document.createElement('script');s.src='https://widgets.leadconnectorhq.com/loader.js';s.dataset.resourcesUrl='https://widgets.leadconnectorhq.com/chat-widget/loader.js';s.dataset.widgetId=SITE.ghlWidgetId;document.body.appendChild(s);
   let n=0;const t=setInterval(()=>{const el=document.querySelector('chat-widget'),sr=el&&el.shadowRoot,w=api();
    if(sr&&sr.querySelector('.lc_text-widget--bubble')&&w&&w.openWidget){clearInterval(t);
     if(!sr.getElementById('itop-hide')){const st=document.createElement('style');st.id='itop-hide';st.textContent='.lc_text-widget--bubble,.lc_text-widget--prompt{display:none!important}';sr.appendChild(st)}
     G.ok=true}else if(++n>80)clearInterval(t)},250)};
  setTimeout(()=>{try{'requestIdleCallback' in window?requestIdleCallback(load,{timeout:4000}):load()}catch(e){}},2500)}
 const fmt=el=>el.addEventListener('input',()=>{const d=el.value.replace(/\D/g,'').replace(/^1/,'').slice(0,10);el.value=d.length>6?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:d.length>3?`(${d.slice(0,3)}) ${d.slice(3)}`:d});
 fmt(ph);fmt($('#cbPhone'));
 const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const post=body=>fetch(SITE.chatWebhook||'/api/lead/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,page:location.pathname,source:'website_chat'})}).then(r=>{if(!r.ok)throw 0});
 const fallback=(n,p,m)=>{const text=`Hi iTop Pools, this is ${n} (${p}). ${m}`;return `<div class="chat-quick"><a href="sms:+19046852555?&body=${encodeURIComponent(text)}">Send as a text</a><a href="mailto:${SITE.leadEmail}?subject=${encodeURIComponent('Website message from '+n)}&body=${encodeURIComponent(text)}">Send by email</a></div>`};
 // Keep a half-written message if the visitor moves to another page
 try{const d=JSON.parse(sessionStorage.getItem('itop_chat')||'{}');name.value=d.n||'';ph.value=d.p||'';msg.value=d.m||''}catch(e){}
 form.addEventListener('input',()=>{errEl.textContent='';try{sessionStorage.setItem('itop_chat',JSON.stringify({n:name.value,p:ph.value,m:msg.value}))}catch(e){}});
 const finish=(el,f,html)=>{f.hidden=true;el.hidden=false;el.innerHTML=html};
 form.addEventListener('submit',e=>{e.preventDefault();
  const n=name.value.trim(),p=ph.value,m=msg.value.trim(),bad=(el,t)=>{errEl.textContent=t;el.focus();return false};
  if(!n)return bad(name,'Please add your name.');if(p.replace(/\D/g,'').length!==10)return bad(ph,'Enter a 10-digit mobile number so we can reply.');if(!m)return bad(msg,'Type a short message.');
  track('chat_message');const f1=esc(n.split(' ')[0]);$('#chatSend').disabled=true;
  post({company:$('#chatCo').value,name:n,first_name:n.split(' ')[0],last_name:n.split(' ').slice(1).join(' '),phone:p,message:m})
   .then(()=>{finish(done,form,`<p class="chat-msg"><b>Thanks, ${f1}.</b> Your message is with our crew. We'll reply by text or call during business hours.</p>`);try{sessionStorage.setItem('itop_chat','{}')}catch(e){}})
   .catch(()=>finish(done,form,`<p class="chat-msg"><b>Almost there, ${f1}.</b> Tap below to send your message by text or email.</p>`+fallback(n,p,m)))
   .finally(()=>{$('#chatSend').disabled=false})});
 const cb=$('#cbForm'),cbN=$('#cbName'),cbP=$('#cbPhone'),cbE=$('#cbErr');
 cb.addEventListener('input',()=>cbE.textContent='');
 cb.addEventListener('submit',e=>{e.preventDefault();
  const n=cbN.value.trim(),p=cbP.value,bad=(el,t)=>{cbE.textContent=t;el.focus();return false};
  if(!n)return bad(cbN,'Please add your name.');if(p.replace(/\D/g,'').length!==10)return bad(cbP,'Enter a 10-digit mobile number.');
  track('voice_callback');const f1=esc(n.split(' ')[0]);$('#cbSend').disabled=true;
  post({company:$('#cbCo').value,name:n,first_name:n.split(' ')[0],last_name:n.split(' ').slice(1).join(' '),phone:p,message:'Please call me back.',request:'callback'})
   .then(()=>finish($('#cbDone'),cb,`<p class="chat-msg"><b>Thanks, ${f1}.</b> We'll call you at ${esc(p)} soon. During office hours that's usually quick.</p>`))
   .catch(()=>finish($('#cbDone'),cb,`<p class="chat-msg"><b>Sorry, ${f1}, that didn't go through.</b> Please call us at <a href="tel:+19046852555">(904) 685-2555</a>, or send a text below.</p>`+fallback(n,p,'Please call me back.')))
   .finally(()=>{$('#cbSend').disabled=false})});
})();

/* Leads that could not be delivered are kept here (max 5, 14 days) and re-sent on later page views. */
function leadQueue(url,lead){try{const k='itop_pending',a=JSON.parse(localStorage.getItem(k)||'[]').filter(x=>Date.now()-x.t<12096e5);a.push({t:Date.now(),u:url,l:lead});localStorage.setItem(k,JSON.stringify(a.slice(-5)))}catch(e){}}
(()=>{let a;try{a=JSON.parse(localStorage.getItem('itop_pending')||'[]')}catch(e){return}if(!a.length)return;
 setTimeout(()=>Promise.all(a.map(x=>Date.now()-x.t>12096e5?Promise.resolve(true):fetch(x.u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...x.l,resent:true}),keepalive:true}).then(r=>r.ok).catch(()=>false)))
  .then(ok=>{try{const left=a.filter((x,i)=>!ok[i]);left.length?localStorage.setItem('itop_pending',JSON.stringify(left)):localStorage.removeItem('itop_pending')}catch(e){}}),3000)})();
