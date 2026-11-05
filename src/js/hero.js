/* hero photo carousel */
(()=>{const hero=$('#top'),slides=$$('#hsStage .hs');if(!slides.length)return;let i=0,timer=0,userPaused=reduce,overUi=false,kbUi=false,seen=true;const DUR=6500;
 const fill=s=>{if(s&&!s.querySelector('picture'))s.innerHTML=pic(s.dataset.id,{eager:true})};
 $('#hsDots').innerHTML=slides.map((s,n)=>'<button aria-label="Show photo '+(n+1)+': '+s.dataset.cap.replace(/"/g,'&quot;')+'"><i></i></button>').join('');
 const dots=$$('#hsDots button');
 const running=()=>!userPaused&&!overUi&&!kbUi&&seen&&!document.hidden&&!!hero.offsetParent;
 function arm(){clearTimeout(timer);hero.classList.toggle('hs-run',running());if(running())timer=setTimeout(()=>show(i+1),DUR)}
 const onHome=()=>!!hero.offsetParent;
 function show(n,first){i=(n+slides.length)%slides.length;if(onHome()){fill(slides[i]);if(!first)fill(slides[(i+1)%slides.length])}slides.forEach((s,k)=>{s.classList.toggle('on',k===i);s.setAttribute('aria-hidden',k!==i)});dots.forEach((d,k)=>{d.classList.toggle('on',k===i);if(k===i)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current')});$('#hsCap').textContent=slides[i].dataset.cap;arm()}
 dots.forEach((d,k)=>d.onclick=()=>show(k));$('#hsPrev').onclick=()=>show(i-1);$('#hsNext').onclick=()=>show(i+1);
 const syncPause=()=>{hero.classList.toggle('hs-paused',userPaused);$('#hsPause').setAttribute('aria-label',userPaused?'Play slideshow':'Pause slideshow');arm()};
 $('#hsPause').onclick=()=>{userPaused=!userPaused;syncPause()};
 const ui=$('#hsUi');ui.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){overUi=true;arm()}});ui.addEventListener('pointerleave',()=>{overUi=false;arm()});
 ui.addEventListener('focusin',e=>{kbUi=e.target.matches(':focus-visible');arm()});ui.addEventListener('focusout',()=>{kbUi=false;arm()});
 new IntersectionObserver(es=>{seen=es[0].isIntersecting;arm()}).observe(hero);
 hero.addEventListener('keydown',e=>{if(e.target.closest('input,textarea'))return;if(e.key==='ArrowLeft'){show(i-1)}else if(e.key==='ArrowRight'){show(i+1)}});
 document.addEventListener('visibilitychange',arm);
 let sx=null,sy=0;hero.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
 hero.addEventListener('touchmove',e=>{if(sx===null)return;const t=e.touches[0];if(e.cancelable&&Math.abs(t.clientX-sx)>Math.abs(t.clientY-sy))e.preventDefault()},{passive:false});
 hero.addEventListener('touchend',e=>{if(sx===null)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;sx=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)show(i+(dx<0?1:-1))},{passive:true});
 if(innerWidth<=680)dots.forEach(d=>{d.tabIndex=-1;d.setAttribute('aria-hidden','true')});
 syncPause();show(0,true);
 if(onHome())addEventListener('load',()=>setTimeout(()=>fill(slides[1]),1500));})();