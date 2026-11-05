let cfg=null,lab=null,looping=false,failed3D=false,PoolScene=null,Lab=null,deckTex=null;
const script=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
function load3D(){if(!load3D.p)load3D.p=script('/js/three.min.js').then(()=>script(SITE.engine)).then(()=>{({PoolScene,Lab,deckTex}=window.ITOP3D)});return load3D.p}
function loop3D(){if(looping)return;looping=true;(function tick(){if(!document.hidden){cfg&&cfg.frame();lab&&lab.frame()}TEST?setTimeout(tick,700):requestAnimationFrame(tick)})()}
function fail3D(err){if(failed3D)return;failed3D=true;console.warn('WebGL unavailable',err);document.body.classList.add('no3d');$$('.stage,.lab-stage').forEach(s=>s.insertAdjacentHTML('beforeend','<p class="no3d-msg">This device cannot show the 3D preview. <a href="/free-3d-design/">Ask us for your free 3D design</a>.</p>'))}
const init3D={};
const near3D=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;near3D.unobserve(e.target);init3D[e.target.id]&&init3D[e.target.id]()}),{rootMargin:'400px'});
