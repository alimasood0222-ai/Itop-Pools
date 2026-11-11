const Q={step:0,project:new Set(),musts:new Set(),model:null,when:null,budget:null,hoa:null,existing:null,contact:'Call',estimate:null,files:[]};
const QN=['You','Project','Pool','Timing','Address','Submit'];
const QLEFT=['About 90 seconds','About 75 seconds left','About a minute left','About 45 seconds left','About 30 seconds left','Last step'];
const PL={pool:'New pool',spa:'Spa',pavers:'Pavers & deck',kitchen:'Outdoor kitchen',enclosure:'Screen enclosure',remodel:'Remodel'};
const WL={asap:'As soon as possible','3-6':'3–6 months','6-12':'6–12 months',later:'Just exploring'},BL={u60:'Under $60k','60-80':'$60k–$80k','80-100':'$80k–$100k','100+':'$100k+'};
const ZIPAREA={'320':'St. Johns County & the Beaches','321':'Clay & Nassau area','322':'Jacksonville / Duval'};
later(()=>{$('#qModels').innerHTML='<button type="button" class="ns" data-id="none"><span class="ns-ic">?</span><span><b>Help me choose</b><small>We\'ll recommend shells after measuring</small></span></button>'+MODELS.map(m=>`<button type="button" data-id="${m.id}"><img class="br-pl" src="/models-br/${m.id}.webp" alt="" width="140" height="70" loading="lazy" decoding="async"><b>${m.n}</b><small>${m.Ls} × ${m.Ws}</small></button>`).join('');
$$('#qModels button').forEach(b=>b.onclick=()=>{Q.model=b.dataset.id;qUpd()});qUpd()});
$$('#qForm [data-k]').forEach(g=>$$('button',g).forEach(b=>b.onclick=()=>{const k=g.dataset.k;if(g.classList.contains('multi')){Q[k].has(b.dataset.v)?Q[k].delete(b.dataset.v):Q[k].add(b.dataset.v)}else{Q[k]=b.dataset.v}
 g.closest('.qs').querySelectorAll('.q-err').forEach(e=>e.textContent='');qUpd();
 if(k==='budget'&&Q.when&&Q.step===3)setTimeout(()=>qGo(1),380)}));
const fmtPh=v=>{const d=v.replace(/\D/g,'').replace(/^1/,'').slice(0,10);return d.length>6?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:d.length>3?`(${d.slice(0,3)}) ${d.slice(3)}`:d};
$('#qPh').addEventListener('input',e=>{e.target.value=fmtPh(e.target.value);qUpd()});
$('#qZip').addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,5);qUpd()});
['#qFn','#qLn','#qEm','#qAddr','#qUnit','#qCity'].forEach(s=>$(s).addEventListener('input',()=>{const f=$(s).closest('.fi');f&&f.classList.remove('bad');qUpd()}));
/* Yard photos: each one is shrunk in the browser (max 1600px JPEG) and uploaded to /api/photo/ (Vercel Blob)
   as soon as it is picked. The lead then carries the photo URLs to GoHighLevel. */
const PHOTO_URL=SITE.photoUpload||'/api/photo/';
const shrink=f=>new Promise((ok,no)=>{const i=new Image(),src=URL.createObjectURL(f);i.onload=()=>{const k=Math.min(1,1600/Math.max(i.naturalWidth,i.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(i.naturalWidth*k);c.height=Math.round(i.naturalHeight*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(src);c.toBlob(b=>b?ok(b):no(),'image/jpeg',.82)};i.onerror=()=>{URL.revokeObjectURL(src);no()};i.src=src});
const upPhoto=it=>{it.st='up';it.p=shrink(it.f).then(b=>fetch(PHOTO_URL,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:b})).then(r=>r.ok?r.json():null).then(j=>{it.url=j&&j.url||null;it.st=it.url?'ok':'fail'}).catch(()=>{it.st='fail'}).then(()=>{qThumbs();qUpd()});return it.p};
const addFiles=fl=>{[...fl].filter(f=>f.type.startsWith('image/')).slice(0,6-Q.files.length).forEach(f=>{const it={n:f.name,u:URL.createObjectURL(f),f};Q.files.push(it);upPhoto(it)});qThumbs();qUpd()};
function qThumbs(){$('#qThumbs').innerHTML=Q.files.map((f,i)=>`<figure class="${f.st||'ok'}"><img src="${f.u}" alt=""><button type="button" data-i="${i}" aria-label="Remove photo">✕</button></figure>`).join('');$$('#qThumbs button').forEach(b=>b.onclick=()=>{Q.files.splice(+b.dataset.i,1);qThumbs();qUpd()})}
$('#qState').addEventListener('change',()=>qUpd());
$('#qFiles').addEventListener('change',e=>addFiles(e.target.files));
const dr=$('#qDrop');['dragenter','dragover'].forEach(ev=>dr.addEventListener(ev,e=>{e.preventDefault();dr.classList.add('over')}));['dragleave','drop'].forEach(ev=>dr.addEventListener(ev,e=>{e.preventDefault();dr.classList.remove('over')}));dr.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
const qAddress=()=>{const z=$('#qZip').value,c=$('#qCity').value.trim(),st=[$('#qAddr').value.trim(),$('#qUnit').value.trim()].filter(Boolean).join(', ');const tail=[c,($('#qState').value+' '+(z.length===5?z:'')).trim()].filter(Boolean).join(', ');return st||c||z.length===5?[st,tail].filter(Boolean).join(', '):''};
function qBrief(){const m=Q.model&&Q.model!=='none'?byId(Q.model):null;
 return [['Name',[$('#qFn').value,$('#qLn').value].join(' ').trim()],['Project',[...Q.project].map(p=>PL[p]).join(', ')],['Pool',m?m.n+' · '+m.Ls+' × '+m.Ws:Q.model==='none'?'Help me choose':''],['Must-haves',[...Q.musts].join(', ')],['Timing',WL[Q.when]||''],['Budget',BL[Q.budget]||''],
  ...(Q.estimate?[['Estimate',Q.estimate]]:[]),['Address',qAddress()],['Yard',[Q.existing,Q.hoa?'HOA: '+Q.hoa:''].filter(Boolean).join(' · ')],['Photos',Q.files.length?Q.files.length+' attached':'']]}
function qUpd(){
 $$('#qForm [data-k]').forEach(g=>$$('button',g).forEach(b=>{const v=Q[g.dataset.k];b.classList.toggle('on',v instanceof Set?v.has(b.dataset.v):v===b.dataset.v)}));
 $$('#qModels button').forEach(b=>b.classList.toggle('on',b.dataset.id===Q.model));
 $('#qSteps').innerHTML=QN.map((n,i)=>`<button type="button" data-i="${i}" class="${i===Q.step?'on':i<Q.step?'dn':''}" ${i<Q.step?'':'disabled'}><i>${i<Q.step?'✓':i+1}</i>${n}</button>`).join('');
 $$('#qSteps button').forEach(b=>b.onclick=()=>{Q.step=+b.dataset.i;qUpd()});
 $('#qBar').style.width=(Q.step>5?100:Q.step/6*100+8)+'%';$('#qStepN').textContent=Q.step>5?'Done':`Step ${Q.step+1} of 6`;$('#qLeft').textContent=Q.step>5?'':QLEFT[Q.step];
 $$('.qs').forEach(s=>s.classList.toggle('on',+s.dataset.s===Q.step));
 $('#qBack').disabled=Q.step===0;$('#qNav').style.display=Q.step>5?'none':'';$('.q-prog').style.display=Q.step>5?'none':'';$('#qIntro').style.display=Q.step>5?'none':'';
 $('#qNext').innerHTML=Q.step===5?'Submit my request <span class="arr">→</span>':(Q.step===2&&!Q.model)||(Q.step===3&&!Q.files.length&&$('#qZip').value.length===5&&false)?'Skip for now <span class="arr">→</span>':'Continue <span class="arr">→</span>';
 const z=$('#qZip').value;const zo=$('#zipOk');const ok=/^32[0-2]/.test(z);
 zo.className='q-zip'+(z.length===5?(ok?' y':' n'):'');zo.innerHTML=z.length===5?(ok?`<i>✓</i><span><b>Great news, we build in your area.</b>${ZIPAREA[z.slice(0,3)]}</span>`:`<i>i</i><span><b>Just outside our usual area.</b>We'll confirm when we call.</span>`):'<span>Enter your ZIP to check our service area</span>';
 const B=qBrief();const filled=B.filter(r=>r[1]).length;$('#qPct').textContent=Math.round(filled/B.length*100)+'%';
 if(Q.step===5){const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);const rv=[B[0],['Phone',$('#qPh').value],['Email',$('#qEm').value.trim()],['Reach me by',Q.contact],...B.slice(1)].filter(r=>r[1]);$('#qReview').innerHTML=rv.map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}
 $('#qSum').innerHTML=B.map(([k,v])=>`<div class="q-row ${v?'f':''}"><span>${k}</span><b>${v||'—'}</b></div>`).join('');
 const bi=['u60','60-80','80-100','100+'].indexOf(Q.budget);$('#qbFill').style.width=bi<0?'0':((bi+1)/4*100)+'%';
 const dsn=Brief.get().design,qs=$('#qStudio');qs.classList.toggle('on',!!dsn);if(dsn)qs.innerHTML='<b>3D design attached</b><span>'+dsn+'</span>';
 try{sessionStorage.setItem('itop_form',JSON.stringify({v:2,step:Q.step,project:[...Q.project],musts:[...Q.musts],model:Q.model,when:Q.when,budget:Q.budget,hoa:Q.hoa,existing:Q.existing,contact:Q.contact,estimate:Q.estimate,photos:Q.files.filter(f=>f.url).map(f=>f.url),fields:Object.fromEntries(['qAddr','qUnit','qCity','qState','qZip','qFn','qLn','qPh','qEm','qNotes'].map(k=>[k,$('#'+k).value]))}))}catch(e){}}
function err(key,msg){const e=$(`.qs.on .q-err[data-for="${key}"]`);if(e){e.textContent=msg;const f=e.closest('.fi');f&&f.classList.add('bad');if(!err.shown){err.shown=1;(f||e).scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'})}}const s=$('.qs.on');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');return false}
function qValid(){const s=Q.step;err.shown=0;$$('.qs.on .q-err').forEach(e=>e.textContent='');$$('.qs.on .fi.bad').forEach(e=>e.classList.remove('bad'));
 if(s===1&&!Q.project.size)return err('project','Pick at least one, even if you are only exploring.');
 if(s===4){let ok=true;if($('#qAddr').value.trim().length<4)ok=err('addr','Please add the street address.');if(!$('#qCity').value.trim())ok=err('city','Please add the city.');if($('#qZip').value.length!==5)ok=err('zip','Enter a 5-digit ZIP code.');return ok}
 if(s===0){let ok=true;if(!$('#qFn').value.trim())ok=err('fn','Please add your first name.');if($('#qPh').value.replace(/\D/g,'').length!==10)ok=err('ph','Enter a 10-digit US phone number.');
  const em=$('#qEm').value.trim();if(em&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em))ok=err('em','That email doesn\'t look right.');return ok}
 return true}
/* Enquiry delivery: posts to the /api/lead relay, which forwards to GoHighLevel (GHL_WEBHOOK_URL in Vercel). SITE.leadWebhook, if set, is used instead.
   If sending fails or the relay isn't configured, the visitor is asked to email or call, so nobody is told a request went through when it didn't. */
const LEAD_URL=SITE.leadWebhook||'/api/lead/';
const SRC=(()=>{let s=null;try{s=JSON.parse(sessionStorage.getItem('itop_src'))}catch(e){}if(!s){const u=new URLSearchParams(location.search);s={utm_source:u.get('utm_source')||'',utm_medium:u.get('utm_medium')||'',utm_campaign:u.get('utm_campaign')||'',utm_term:u.get('utm_term')||'',utm_content:u.get('utm_content')||'',referrer:document.referrer||'',landing_page:location.pathname+location.search};try{sessionStorage.setItem('itop_src',JSON.stringify(s))}catch(e){}}return s})();
function qLead(){return {...SRC,company:$('#qCo').value,first_name:$('#qFn').value,last_name:$('#qLn').value,phone:$('#qPh').value,email:$('#qEm').value,address1:$('#qAddr').value.trim(),address2:$('#qUnit').value.trim(),city:$('#qCity').value.trim(),state:$('#qState').value,postal_code:$('#qZip').value,full_address:qAddress(),project:[...Q.project].join(', '),model:Q.model,must_haves:[...Q.musts].join(', '),timing:Q.when,budget:Q.budget,hoa:Q.hoa,existing:Q.existing,contact_pref:Q.contact,notes:$('#qNotes').value,sms_consent:$('#qSms').checked,estimate:Q.estimate,...qPhotos()}}
function qPhotos(){const u=Q.files.map(f=>f.url).filter(Boolean),o={photo_count:u.length,photo_urls:u.join(', ')};u.forEach((x,i)=>o['photo_'+(i+1)]=x);return o}
/* Submit: the visitor always sees the confirmation. The lead is sent in the background with retries; if every try
   fails (offline, relay down), it is kept in this browser and base.js sends it again on the next page view. */
function qSubmit(){track('form_complete');
 $('#qDoneTitle').firstChild.textContent="You're all set";$('#qDoneSub').textContent="We've got your request. Here's what happens next.";
 track('generate_lead',{model:Q.model||'',budget:Q.budget||'',zip:$('#qZip').value});try{sessionStorage.removeItem('itop_form')}catch(e){}
 let lead;const send=n=>fetch(LEAD_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lead),keepalive:true}).then(r=>{if(!r.ok)throw new Error(r.status)})
  .catch(()=>{if(n<2)return new Promise(r=>setTimeout(r,2500*(n+1))).then(()=>send(n+1));leadQueue(LEAD_URL,lead)});
 // wait (up to 20s) for photos still uploading, then send
 Promise.race([Promise.all(Q.files.map(f=>f.p||0)),new Promise(r=>setTimeout(r,20000))]).then(()=>{lead={...qLead(),stage:'complete'};send(0)})}
function qPartial(){track('lead_started');try{if(sessionStorage.getItem('itop_partial'))return;sessionStorage.setItem('itop_partial','1')}catch(e){}
 fetch(LEAD_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...qLead(),stage:'contact_only'}),keepalive:true}).catch(()=>{})}
function qGo(dir){if(dir>0&&!qValid())return;const from=Q.step;Q.step=Math.max(0,Math.min(6,Q.step+dir));if(dir>0&&from===0)qPartial();
 if(Q.step===6){qSubmit();$('#qDoneName').textContent=$('#qFn').value.trim()?', '+$('#qFn').value.trim():'';$('#qDoneVisit').textContent='We\'ll agree a time that suits you, then measure your yard and check access.'}
 qUpd();const t=$('.q-main').getBoundingClientRect().top+scrollY-110;if(scrollY>t)scrollTo({top:t,behavior:'smooth'});
 setTimeout(()=>{const f=$('.qs.on input:not([type=checkbox]):not([type=file])');if(f&&!isTouch)f.focus({preventScroll:true})},420)}
$('#qNext').addEventListener('click',e=>{e.preventDefault();qGo(1)});
$('#qBack').onclick=()=>qGo(-1);
$('#qBriefBtn').onclick=e=>{const o=e.currentTarget.getAttribute('aria-expanded')!=='true';e.currentTarget.setAttribute('aria-expanded',o);$('#qCard').classList.toggle('open',o)};
$('#qForm').addEventListener('keydown',e=>{if(e.key!=='Enter'||e.target.tagName==='TEXTAREA'||e.isComposing)return;if(e.target.tagName==='BUTTON'){if(e.target.classList.contains('on')&&e.target.closest('[data-k]')){e.preventDefault();qGo(1)}return}e.preventDefault();qGo(1)});
(()=>{const q=new URLSearchParams(location.search),b=Brief.get();let saved=null;try{saved=JSON.parse(sessionStorage.getItem('itop_form'))}catch(e){}
 if(saved&&saved.step<6){if(saved.v!==2)saved.step=0;Object.assign(Q,saved,{project:new Set(saved.project),musts:new Set(saved.musts),files:(saved.photos||[]).map(u=>({n:'',u,url:u,st:'ok'}))});delete Q.photos;later(qThumbs);Object.entries(saved.fields||{}).forEach(([k,v])=>{const el=$('#'+k);if(el)el.value=v})}
 const p=q.get('p'),m=q.get('m')||b.model;if(p&&PL[p])Q.project.add(p);if(m&&byId(m))Q.model=m;if(b.estimate)Q.estimate=b.estimate;if(!Q.project.size&&Q.model)Q.project.add('pool');qUpd()})();
