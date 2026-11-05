/* Pool School: chosen stage's guides come first */
const jb=$$('#journey .jy'),hub=$('#artHub');const cardsL=[...hub.children];
jb.forEach(b=>b.onclick=()=>{jb.forEach(x=>x.classList.toggle('on',x===b));const k=b.dataset.k;cardsL.slice().sort((x,y)=>(y.dataset.st===k)-(x.dataset.st===k)).forEach(c=>hub.appendChild(c))});
