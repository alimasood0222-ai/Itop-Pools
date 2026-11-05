let mdM=null,mdFin='california',mdZ=0;
const mdS=()=>({...mdM,...mdM.sizes[mdZ]});
function mdPlan(){const m=mdS();const x1=70-60*m.L/40,x2=70+60*m.L/40;const hw=(m.s==='rect'?24:25.5)*m.W/16;const yT=30-hw,yB=30+hw;
 const svg=planSVG(m,{fin:mdFin,dark:1,attr:'class="fillw" x="0" y="0" width="140" height="60"'});const p=planPath(m.s,m.L,m.W);
 $('#mdPlan').innerHTML=`<svg viewBox="-4 -6 156 76"><path class="draw" d="${p}" fill="none" stroke="#7dd3fc" stroke-width=".7"/>${svg}
  <g class="fillw"><path class="dl" d="M${x1} ${yT-5}H${x2}M${x1} ${yT-7}v4M${x2} ${yT-7}v4"/><rect x="${70-8}" y="${yT-8.2}" width="16" height="5" rx="2.5" fill="#04101f"/><text class="dt" x="70" y="${yT-4.6}" text-anchor="middle">${m.Ls}</text>
  <path class="dl" d="M${x2+5} ${yT}V${yB}M${x2+3} ${yT}h4M${x2+3} ${yB}h4"/><rect x="${x2+0.5}" y="27.5" width="9" height="5" rx="2.5" fill="#04101f"/><text class="dt" x="${x2+5}" y="31.1" text-anchor="middle" style="font-size:3px">${m.Ws}</text></g></svg><span class="scale">PLAN VIEW · ${FIN_META[mdFin].n.toUpperCase()} FINISH</span>`}
function mdElev(){const m=mdS();if(!m.D){$('#mdElev').innerHTML='<p class="fine">A full depth profile for this model is on the Barrier Reef spec sheet. Ask us for a copy.</p>';return}
 const D=m.D,S=m.S||D,y=d=>22+d*13.5;const flat=S===D;
 const pts=flat?`M40 ${y(0)}V${y(D)}H560V${y(0)}`:`M40 ${y(0)}V${y(S*.33)}H62V${y(S*.66)}H84V${y(S)}H${250}L${380} ${y(D)}H520Q560 ${y(D)} 560 ${y(D)-30}V${y(0)}`;
 $('#mdElev').innerHTML=`<svg viewBox="0 0 600 ${y(D)+40}"><defs><linearGradient id="elg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${FINISH[mdFin].shallow}"/><stop offset="1" stop-color="${FINISH[mdFin].deep}"/></linearGradient></defs>
 <rect x="0" y="${y(0)-3}" width="600" height="${y(D)+40}" fill="#f2ead9" opacity=".5"/><path d="${pts}Z" fill="url(#elg)" stroke="#0b2545" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 ${y(0)}H560" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/>
 <g font-family="Inter Tight,Inter,sans-serif" font-size="13" font-weight="600" fill="#0b2545">${m.Ss&&!flat?`<text x="150" y="${y(S)+20}" text-anchor="middle">${m.Ss} shallow</text>`:''}<text x="460" y="${y(D)+22}" text-anchor="middle">${m.Ds} ${flat&&m.Ss?'deep throughout':'deep'}</text><text x="300" y="${y(0)-8}" text-anchor="middle" fill="#41566e" font-weight="500">${m.Ls} long</text></g></svg>${m.Ss?'':'<p class="fine">Shallow-end depth isn\'t published for this model. See the spec sheet.</p>'}`}
function mdSpec(){const m=mdS();const sp=[['Length',m.Ls],['Width',m.Ws],['Shallow end',m.Ss||'See spec sheet'],['Deep end',m.Ds||'See spec sheet']];if(m.lounger)sp.push(['Lounger',m.lounger]);
 const gal=m.gal?`<div><small>Water</small><b>${m.gal.toLocaleString()}<em>gal</em></b></div>`:'<div><small>Water</small><b>See spec sheet</b></div>';
 $('#mdSpec').innerHTML=sp.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('')+gal;
 $('#mdSpecNote').textContent='Specifications for the '+m.label+', from Barrier Reef Pools USA.';$('#mdAsideSize').textContent=m.Ls+' × '+m.Ws}
function mdPick(i){mdZ=i;$$('#mdSizes button').forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-pressed',k===i)});mdSpec();mdPlan();mdElev()}
(()=>{const id=location.pathname.split('/').filter(Boolean)[1];const m=byId(id);if(!m)return;mdM=m;mdZ=m.def;const q=new URLSearchParams(location.search);mdFin=q.get('f')&&FINISH[q.get('f')]?q.get('f'):'california';
 $$('#mdSizes button').forEach(b=>b.onclick=()=>mdPick(+b.dataset.i));
 $('#mdSw').innerHTML=FIN_KEYS.map(k=>`<button data-v="${k}" class="${k===mdFin?'on':''}"><i style="background:${swBg(k)}"></i>${FIN_META[k].n}</button>`).join('');
 $$('#mdSw button').forEach(b=>b.onclick=()=>{mdFin=b.dataset.v;$$('#mdSw button').forEach(x=>x.classList.toggle('on',x===b));mdPlan();mdElev();$('#mdAsideFin').textContent=FIN_META[mdFin].n;$('#md3d').href=`/3d-pool-design/?m=${m.id}&f=${mdFin}`});
 $('#mdAsideName').textContent=m.n;$('#mdAsideFin').textContent=FIN_META[mdFin].n;
 $('#mdCmp').textContent=CMP.has(m.id)?'✓ In compare':'+ Add to compare';$('#mdCmp').onclick=()=>{toggleCmp(m.id);if(CMP.size>1)toast(CMP.size+' models in compare. Open Pool models to compare them.')};
 mdPick(mdZ)})();
