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
const STAG='.tr-items,.counters,.loans,.pal-grid,.wty-grid,.mfg-stats,.sp-tips,.journey,.p-points,.flow,.rv-grid,.q-trust';
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

/* Chat widget, bottom right on every page. With SITE.ghlChatWidgetId set (src/data/site.json), GoHighLevel's own
   chat widget loads instead. Otherwise messages post to SITE.chatWebhook, or, until that is set, the visitor sends
   them by text or email, so nobody is told a message went through when it didn't. Messages go to the /api/lead relay
   (GoHighLevel via GHL_CHAT_WEBHOOK_URL or GHL_WEBHOOK_URL in Vercel) unless SITE.chatWebhook is set. */
(()=>{const box=$('#chat');if(!box)return;
 if(SITE.ghlChatWidgetId){box.hidden=true;box.style.display='none';const load=()=>{const s=document.createElement('script');s.src='https://widgets.leadconnectorhq.com/loader.js';s.dataset.resourcesUrl='https://widgets.leadconnectorhq.com/chat-widget/loader.js';s.dataset.widgetId=SITE.ghlChatWidgetId;document.body.appendChild(s)};('requestIdleCallback' in window?requestIdleCallback:setTimeout)(load,2500);return}
 if($('#qNav'))box.classList.add('above-nav');
 const btn=$('#chatBtn'),panel=$('#chatPanel'),form=$('#chatForm'),done=$('#chatDone'),errEl=$('#chatErr'),name=$('#chatName'),ph=$('#chatPhone'),msg=$('#chatMsg');
 const open=o=>{panel.hidden=!o;box.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Close chat':'Chat with iTop Pools');if(o){track('chat_open');if(!isTouch)setTimeout(()=>(form.hidden?btn:name).focus(),60)}};
 btn.onclick=()=>open(panel.hidden);$('#chatClose').onclick=()=>{open(false);btn.focus()};
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){open(false);btn.focus()}});
 $$('.chat-quick a').forEach(a=>a.addEventListener('click',()=>track(a.dataset.track)));
 ph.addEventListener('input',()=>{const d=ph.value.replace(/\D/g,'').replace(/^1/,'').slice(0,10);ph.value=d.length>6?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:d.length>3?`(${d.slice(0,3)}) ${d.slice(3)}`:d});
 // Keep a half-written message if the visitor moves to another page
 try{const d=JSON.parse(sessionStorage.getItem('itop_chat')||'{}');name.value=d.n||'';ph.value=d.p||'';msg.value=d.m||''}catch(e){}
 form.addEventListener('input',()=>{errEl.textContent='';try{sessionStorage.setItem('itop_chat',JSON.stringify({n:name.value,p:ph.value,m:msg.value}))}catch(e){}});
 const finish=html=>{form.hidden=true;done.hidden=false;done.innerHTML=html;try{sessionStorage.setItem('itop_chat','{}')}catch(e){}};
 form.addEventListener('submit',e=>{e.preventDefault();
  const n=name.value.trim(),p=ph.value,m=msg.value.trim(),bad=(el,t)=>{errEl.textContent=t;el.focus();return false};
  if(!n)return bad(name,'Please add your name.');if(p.replace(/\D/g,'').length!==10)return bad(ph,'Enter a 10-digit mobile number so we can reply.');if(!m)return bad(msg,'Type a short message.');
  track('chat_message');
  const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;'),first=esc(n.split(' ')[0]),text=`Hi iTop Pools, this is ${n} (${p}). ${m}`;
  const manual=lead=>finish(`<p class="chat-msg"><b>Almost there, ${first}.</b> ${lead} Tap below to send your message by text or email.</p><div class="chat-quick"><a href="sms:+19046852555?&body=${encodeURIComponent(text)}">Send as a text</a><a href="mailto:${SITE.leadEmail}?subject=${encodeURIComponent('Website chat from '+n)}&body=${encodeURIComponent(text)}">Send by email</a></div>`);
  $('#chatSend').disabled=true;
  fetch(SITE.chatWebhook||'/api/lead/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({company:$('#chatCo').value,name:n,first_name:n.split(' ')[0],last_name:n.split(' ').slice(1).join(' '),phone:p,message:m,page:location.pathname,source:'website_chat'})})
   .then(r=>{if(!r.ok)throw 0;finish(`<p class="chat-msg"><b>Thanks, ${first}.</b> Your message is with our crew. We'll reply by text or call during business hours.</p>`)})
   .catch(()=>manual(''))
   .finally(()=>{$('#chatSend').disabled=false})});
})();
