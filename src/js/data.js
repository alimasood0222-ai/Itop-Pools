const PHOTOS={{PHOTOSJSON}};
const imgSrc=(id,w=1200)=>{const p=PHOTOS[id];if(!p)return '';const use=p.w.filter(x=>x<=w).pop()||p.w[0];return '/img/'+p.f+'-'+use+'.webp'};
function pic(id,o={}){const p=PHOTOS[id];if(!p)return '';const ss=f=>p.w.map(w=>'/img/'+p.f+'-'+w+'.'+f+' '+w+'w').join(', ');const sizes=o.sizes||'100vw';const alt=String(o.alt===undefined?p.alt:o.alt).replace(/"/g,'&quot;');
 return '<picture><source type="image/avif" srcset="'+ss('avif')+'" sizes="'+sizes+'"><source type="image/webp" srcset="'+ss('webp')+'" sizes="'+sizes+'"><img src="'+imgSrc(id,1200)+'" width="'+p.nw+'" height="'+p.nh+'" alt="'+alt+'"'+(o.eager?' fetchpriority="high"':' loading="lazy"')+' decoding="async" draggable="false" style="background:url('+p.lq+') center/cover"></picture>'}
{{FINISH}}
{{GEO}}
const ft=x=>{if(x==null)return '—';const f=Math.floor(x+1e-6);const i=Math.round((x-f)*12);return i===12?(f+1)+"'":(i?f+"'"+i+'"':f+"'")};
/* Official Barrier Reef Pools USA list and specs: src/data/models.json. The largest version is the model's headline size. */
const MODELS={{MODELSJSON}};
MODELS.forEach(m=>{const z=m.sizes.reduce((a,b)=>b.L>a.L?b:a,m.sizes[0]);m.def=m.sizes.indexOf(z);Object.assign(m,{L:z.L,W:z.W,S:z.S,D:z.D,gal:z.gal,Ls:z.Ls,Ws:z.Ws,photo:'m-'+m.id})});
const byId=id=>MODELS.find(m=>m.id===id);
const FT_LBL={ledge:'Lounging ledge',spa:'Integrated spa',bench:'Built-in seating',deep:'Deep end 6\'+',new:'New 2026'};
const CAT_LBL={rect:'Rectangular',free:'Freeform',kidney:'Kidney',roman:'Roman',plunge:'Plunge'};
const FIN_META={
 aquamarine:{n:'Aquamarine',d:'Classic resort blue. Bright and clear in full Florida sun.',p:'Travertine, white coping'},
 arctic:{n:'Arctic',d:'The lightest finish. It gives that shallow-lagoon turquoise water.',p:'Shell stone, light pavers'},
 california:{n:'California',d:'A sunny, saturated sky blue that photographs beautifully.',p:'Travertine, warm pavers'},
 eveningsky:{n:'Evening Sky',d:'A muted blue-grey that reads calm and modern.',p:'Charcoal porcelain, grey pavers'},
 ocean:{n:'Ocean',d:'Deep royal blue. The darkest, most dramatic water in the range.',p:'Light travertine for contrast'},
 sandstone:{n:'Sandstone',d:'A tropical teal-green, like water over a sandbar.',p:'Coral stone, natural pavers'},
 silvermist:{n:'Silver Mist',d:'A soft silver-blue. Pairs with grey pavers and porcelain.',p:'Grey porcelain, modern decks'}
};
const FIN_KEYS=Object.keys(FIN_META);
const swBg=k=>{const c=FINISH[k].sw;return `radial-gradient(circle at 35% 30%,${c[0]},${c[1]})`};
/* Each model's outline, traced from its Barrier Reef drawing (src/data/outlines.json): the same shape as its card on the Pools page and in the 3D studio */
const OUTLINES={{OUTLINESJSON}};
/* Each drawing's size and the box its shell fills: [imgW, imgH, left, top, w, h] */
const DRAWBOX={{DRAWBOXJSON}};
const planMemo={};
function planPath(s,L,Wd,id){const k=(id||s)+L+'x'+Wd;if(planMemo[k])return planMemo[k];const sx=L/40,sy=Wd/16;const o=id&&OUTLINES[id];const pts=o?o.map(([u,v])=>({x:u*12*sx,y:v*4.8*sy})):poolPts(s,sx,sy);return planMemo[k]='M'+pts.map(p=>`${(p.x*10+70).toFixed(1)},${(-p.y*10+30).toFixed(1)}`).join('L')+'Z'}
let gid=0;
function planSVG(m,o={}){const id='pg'+(gid++);const p=planPath(m.s,m.L,m.W,m.id);const fin=FINISH[o.fin||'california'];const dark=o.dark;
 const own=!!OUTLINES[m.id];
 /* the Barrier Reef drawing itself, laid over the finish color so its steps and benches show and the finish swatches still tint it */
 const bx=DRAWBOX[m.id],sx=m.L/40,sy=m.W/16;
 const draw=own&&bx?`<g style="mix-blend-mode:luminosity"><svg x="${(70-60*sx).toFixed(2)}" y="${(30-24*sy).toFixed(2)}" width="${(120*sx).toFixed(2)}" height="${(48*sy).toFixed(2)}" viewBox="${bx[2]} ${bx[3]} ${bx[4]} ${bx[5]}" preserveAspectRatio="none"><image href="/models-br/${m.id}.webp" width="${bx[0]}" height="${bx[1]}"/></svg></g>`:'';
 const ledge=!own&&m.feats.includes('ledge')?`<rect x="${(70-60*m.L/40+2.2).toFixed(1)}" y="${(30-10*m.W/16*2.4+3).toFixed(1)}" width="${(9*m.L/40+4).toFixed(1)}" height="${(10*m.W/16*4.8-6).toFixed(1)}" rx="2" fill="rgba(255,255,255,.32)"/>`:'';
 const spa=!own&&m.spa?`<rect x="${(70+60*m.L/40-15).toFixed(1)}" y="${(30-10*m.W/16*2.4+2.5).toFixed(1)}" width="12" height="11" rx="2.5" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.7)" stroke-width=".8"/>`:'';
 return `<svg viewBox="0 0 140 60" style="isolation:isolate" ${o.attr||''}><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${fin.shallow}"/><stop offset=".55" stop-color="${fin.basin}"><animate attributeName="offset" values=".35;.7;.35" dur="5s" repeatCount="indefinite"/></stop><stop offset="1" stop-color="${fin.deep}"/></linearGradient></defs><path d="${p}" fill="none" stroke="${dark?'rgba(242,234,217,.9)':'#f2ead9'}" stroke-width="5.5" stroke-linejoin="round"/><path d="${p}" fill="url(#${id})" stroke="#fff" stroke-width="1.2"/>${draw}${ledge}${spa}</svg>`}
/* version name without the model's own words: "Whitsunday 35 Lounger" -> "35 Lounger" */
function zLabel(m,z){const own=m.n.split(' ');return z.label.split(' ').filter(w=>!own.includes(w)).join(' ')||(m.sizes.length>1?'Standard':z.Ls+' × '+z.Ws)}
function allSizes(m){const v=x=>x||'See spec sheet';return `<div class="ct-wrap"><table class="cost-tbl"><thead><tr><th scope="col">Version</th>${['Length','Width','Shallow','Deep','Lounger','Gallons'].map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${m.sizes.map(z=>`<tr><th scope="row">${z.label}</th><td data-l="Length">${v(z.Ls)}</td><td data-l="Width">${v(z.Ws)}</td><td data-l="Shallow">${v(z.Ss)}</td><td data-l="Deep">${v(z.Ds)}</td><td data-l="Lounger">${z.lounger||'None listed'}</td><td data-l="Gallons">${z.gal?z.gal.toLocaleString('en-US'):'See spec sheet'}</td></tr>`).join('')}</tbody></table></div>`}
