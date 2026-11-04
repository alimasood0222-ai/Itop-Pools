(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const isTouch=matchMedia('(hover:none)').matches;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const ROOT=document.documentElement.dataset.root||'';
const START=document.documentElement.dataset.start||'/';
const PHOTOS={{PHOTOSJSON}};
const SITE={{SITEJSON}};
const imgSrc=(id,w=1200)=>{const p=PHOTOS[id];if(!p)return '';const use=p.w.filter(x=>x<=w).pop()||p.w[0];return ROOT+'img/'+id+'-'+use+'.webp'};
function pic(id,o={}){const p=PHOTOS[id];if(!p)return '<div class="ph-slot"><span>Photo: '+(o.alt||id)+'</span></div>';const ss=f=>p.w.map(w=>ROOT+'img/'+id+'-'+w+'.'+f+' '+w+'w').join(', ');const sizes=o.sizes||'100vw';const alt=String(o.alt===undefined?p.alt:o.alt).replace(/"/g,'&quot;');
 return '<picture><source type="image/avif" srcset="'+ss('avif')+'" sizes="'+sizes+'"><source type="image/webp" srcset="'+ss('webp')+'" sizes="'+sizes+'"><img src="'+imgSrc(id,1200)+'" alt="'+alt+'"'+(o.eager?'':' loading="lazy"')+' decoding="async" style="background:url('+p.lq+') center/cover"></picture>'}

/* =========================================================
   3D POOL SCENE
   ========================================================= */
let T=null; // three.js loads on demand, see load3D()
const C=h=>new T.Color(h);

const TIMES={
 day:{skyTop:'#2a74cc',skyHor:'#cdeeff',sunCol:'#fff1da',sunI:2.6,sun:[9,13,8],hemiS:'#bfe2ff',hemiG:'#5f7048',hemiI:.85,exp:.82,night:0,fog:'#d4f0ff'},
 sunset:{skyTop:'#2b3779',skyHor:'#ffab63',sunCol:'#ffb36f',sunI:2.6,sun:[15,4.2,-5],hemiS:'#ffc9a4',hemiG:'#4a3b2e',hemiI:.65,exp:1.02,night:.3,fog:'#e8a27a'},
 night:{skyTop:'#01050f',skyHor:'#0a1a36',sunCol:'#9db6ff',sunI:.32,sun:[-6,14,8],hemiS:'#34558a',hemiG:'#0e131a',hemiI:.38,exp:1.25,night:1,fog:'#0b1c38'}
};
const FINISH={
 aquamarine:{basin:'#2a86c9',deep:'#064f86',shallow:'#36b7ea',sw:['#5cc4f5','#1272b8']},
 arctic:{basin:'#cfe9f1',deep:'#1584a8',shallow:'#8fe6f2',sw:['#f2fbff','#9fd3e3']},
 california:{basin:'#45aee3',deep:'#0a6aa6',shallow:'#5fd0f4',sw:['#8fdcff','#2a8fcf']},
 eveningsky:{basin:'#5f7d9a',deep:'#13385a',shallow:'#4a9cc2',sw:['#9db6cc','#3d5b78']},
 ocean:{basin:'#1d4fae',deep:'#04286e',shallow:'#2b8fe0',sw:['#4f7fe6','#0d2f8a']},
 sandstone:{basin:'#9fd6cc',deep:'#0f7a80',shallow:'#7fe2d4',sw:['#d6f1ea','#6fbcb2']},
 silvermist:{basin:'#a9bfcc',deep:'#1d5f80',shallow:'#7cc8e0',sw:['#e2ecf2','#8aa4b4']}
};

function canvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;if(rep)t.repeat.set(rep,rep);t.anisotropy=8;if(T.sRGBEncoding)t.encoding=T.sRGBEncoding;return t}
const rnd=(a,b)=>a+Math.random()*(b-a);
function noise(g,w,h,n,alpha){for(let i=0;i<n;i++){g.fillStyle=`rgba(${Math.random()<.5?'90,70,40':'255,255,255'},${alpha*Math.random()})`;g.fillRect(Math.random()*w,Math.random()*h,rnd(1,3),rnd(1,3))}}
const DECKTEX={};
function deckTex(kind){
 if(DECKTEX[kind])return DECKTEX[kind];
 let t;
 if(kind==='travertine'){t=canvasTex(1024,1024,(g,w,h)=>{g.fillStyle='#cbbd9f';g.fillRect(0,0,w,h);const u=128;const rows=[[2,1,3,2],[1,2,2,3],[3,2,1,2],[2,3,2,1],[1,1,2,2,2],[3,1,2,2],[2,2,1,3],[1,3,2,2]];
   rows.forEach((r,ri)=>{let x=0;r.forEach(cw=>{const L=rnd(72,80),hu=rnd(34,40),s=rnd(30,42);g.fillStyle=`hsl(${hu},${s}%,${L}%)`;g.fillRect(x+3,ri*u+3,cw*u-6,u-6);
     for(let k=0;k<6;k++){g.strokeStyle=`hsla(${hu},30%,${L-rnd(6,12)}%,.35)`;g.lineWidth=rnd(.5,2);g.beginPath();const y=ri*u+rnd(10,u-10);g.moveTo(x+4,y);g.bezierCurveTo(x+cw*u*.3,y+rnd(-10,10),x+cw*u*.6,y+rnd(-10,10),x+cw*u-4,y+rnd(-8,8));g.stroke()}
     x+=cw*u})});noise(g,w,h,9000,.18)},.16)}
 else if(kind==='porcelain'){t=canvasTex(1024,1024,(g,w,h)=>{g.fillStyle='#9aa1a6';g.fillRect(0,0,w,h);const u=256;for(let y=0;y<4;y++)for(let x=0;x<4;x++){const L=rnd(80,85);g.fillStyle=`hsl(205,6%,${L}%)`;g.fillRect(x*u+2,y*u+2,u-4,u-4);
   const gr=g.createLinearGradient(x*u,y*u,x*u+u,y*u+u);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(0,0,0,.05)');g.fillStyle=gr;g.fillRect(x*u+2,y*u+2,u-4,u-4)}noise(g,w,h,6000,.12)},.12)}
 else {t=canvasTex(1024,1024,(g,w,h)=>{g.fillStyle='#8e7f6b';g.fillRect(0,0,w,h);const a=64,b=128;
   for(let y=-2;y<18;y++)for(let x=-2;x<18;x++){const ox=x*a*2,oy=y*a*2+((x%2)?a:0);const tone=()=>{const r=Math.random();return r<.33?`hsl(28,${rnd(18,28)}%,${rnd(58,66)}%)`:r<.66?`hsl(35,${rnd(14,22)}%,${rnd(66,74)}%)`:`hsl(20,${rnd(10,18)}%,${rnd(52,60)}%)`};
     g.fillStyle=tone();g.fillRect(ox+2,oy+2,b-4,a-4);g.fillStyle=tone();g.fillRect(ox+2,oy+a+2,a-4,b-4)}noise(g,w,h,8000,.15)},.32)}
 return DECKTEX[kind]=t;
}
const tileTex=()=>canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,30,60,.10)';g.lineWidth=2;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,h);g.stroke();g.beginPath();g.moveTo(0,i*32);g.lineTo(w,i*32);g.stroke()}},1.2);
const stoneTex=()=>canvasTex(512,256,(g,w,h)=>{g.fillStyle='#8a8e93';g.fillRect(0,0,w,h);let y=0;while(y<h){const rh=rnd(14,26);let x=-rnd(0,40);while(x<w){const rw=rnd(40,110);g.fillStyle=`hsl(${rnd(200,215)},${rnd(4,14)}%,${rnd(45,72)}%)`;g.fillRect(x+1.5,y+1.5,rw-3,rh-3);x+=rw}y+=rh}noise(g,w,h,3000,.15)},.9);

/* water shader */
const CAUS=`
float caustic(vec2 uv,float t){
  vec2 p=mod(uv*6.28318,6.28318)-250.0; vec2 i=p; float c=1.0; float inten=.005;
  for(int n=0;n<4;n++){float tt=t*(1.0-(3.5/float(n+1))); i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1.0/length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));}
  c/=4.0; c=1.17-pow(c,1.4); return clamp(pow(abs(c),8.0),0.0,1.0);
}`;
function waterMat(){
 return new T.ShaderMaterial({transparent:true,depthWrite:false,
  uniforms:{uTime:{value:0},uSun:{value:new T.Vector3(.5,.8,.3).normalize()},uSunCol:{value:C('#fff')},uSkyTop:{value:C('#2c7bd3')},uSkyHor:{value:C('#d4f0ff')},uDeep:{value:C('#05396f')},uShallow:{value:C('#2fb6ea')},uNight:{value:0},uLED:{value:C('#38e0ff')},uScale:{value:1}},
  vertexShader:`varying vec3 vW; void main(){vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w;}`,
  fragmentShader:`uniform float uTime,uNight,uScale; uniform vec3 uSun,uSunCol,uSkyTop,uSkyHor,uDeep,uShallow,uLED; varying vec3 vW; ${CAUS}
  void main(){
    vec2 p=vW.xz*uScale; float t=uTime;
    vec2 g=vec2(0.);
    vec2 d1=normalize(vec2(1.,.35)),d2=normalize(vec2(-.6,1.)),d3=normalize(vec2(.25,-1.)),d4=normalize(vec2(-1.,-.2));
    g+=d1*cos(dot(d1,p)*1.6+t*1.3)*.09; g+=d2*cos(dot(d2,p)*2.3+t*1.7)*.07; g+=d3*cos(dot(d3,p)*4.1+t*2.3)*.045; g+=d4*cos(dot(d4,p)*7.3+t*3.1)*.03;
    g+=vec2(sin(p.y*13.+t*4.),cos(p.x*11.-t*3.6))*.018;
    vec3 n=normalize(vec3(-g.x,1.0,-g.y));
    vec3 v=normalize(cameraPosition-vW);
    float fres=.02+.98*pow(1.0-max(dot(n,v),0.0),5.0);
    vec3 r=reflect(-v,n);
    vec3 sky=mix(uSkyHor,uSkyTop,smoothstep(0.0,.55,r.y));
    float c=caustic(vW.xz*.16+g*.08,t*.45);
    vec3 base=mix(uDeep,uShallow,.55+.35*c);
    base+=c*.28*uSunCol*(1.0-uNight*.9);
    vec3 led=uLED*(.55+.65*c);
    base=mix(base,base*.08+led*1.15,uNight);
    float spec=pow(max(dot(r,normalize(uSun)),0.0),260.0)*4.0+pow(max(dot(r,normalize(uSun)),0.0),40.0)*.25;
    vec3 col=mix(base,sky,fres*mix(.75,.35,uNight))+spec*uSunCol*(1.0-uNight*.75);
    gl_FragColor=vec4(col,mix(.82,.96,fres));
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`});
}
function spillMat(){
 return new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{uTime:{value:0},uNight:{value:0},uLED:{value:C('#38e0ff')}},
  vertexShader:`varying vec2 vU; void main(){vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform float uTime,uNight; uniform vec3 uLED; varying vec2 vU;
  float h(float x){return fract(sin(x*127.1)*43758.5);}
  void main(){ float col=floor(vU.x*60.); float s=h(col); float y=vU.y+uTime*(1.2+s*.6);
    float st=smoothstep(.3,.9,sin(y*28.+s*6.)*.5+.5); float a=(.35+.45*st)*smoothstep(0.,.08,vU.x)*smoothstep(1.,.92,vU.x);
    vec3 c=mix(vec3(.85,.95,1.),uLED*1.3,uNight*.7); gl_FragColor=vec4(c,a*.85);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`});
}
function skyMat(){
 return new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{uTop:{value:C('#2c7bd3')},uHor:{value:C('#d4f0ff')},uSun:{value:new T.Vector3(.5,.8,.3)},uSunCol:{value:C('#fff')},uNight:{value:0},uTime:{value:0}},
  vertexShader:`varying vec3 vD; void main(){vD=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform vec3 uTop,uHor,uSunCol,uSun; uniform float uNight,uTime; varying vec3 vD;
  float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
  float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
  float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p*=2.03;a*=.5;}return v;}
  void main(){ float y=max(vD.y,0.0); vec3 c=mix(uHor,uTop,pow(smoothstep(0.0,.75,y),.7));
    vec2 cp=vD.xz/(vD.y+.12)*1.4+vec2(uTime*.006,0.);float cl=smoothstep(.5,.82,fb(cp))*smoothstep(.03,.22,y);
    c=mix(c,mix(vec3(1.),uSunCol*1.05,.35)*mix(1.,.25,uNight),cl*.85);
    float sd=max(dot(vD,normalize(uSun)),0.0); c+=uSunCol*(pow(sd,600.)*6.0+pow(sd,10.)*.25)*(1.0-uNight*.6);
    vec3 q=floor(vD*260.); float st=step(.9975,hash(q))*smoothstep(.15,.6,y)*uNight; c+=st*.9;
    gl_FragColor=vec4(c,1.0);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }`});
}

/* shapes (2D: x right, y = toward house) */
const v2=(x,y)=>T?new T.Vector2(x,y):{x,y};
function poolPts(kind,sx,sy){
 let pts=[];
 if(kind==='roman'){const w=4.9,h=2.4,r=.5,seg=10,cap=1.1;const corner=(cx,cy,a0)=>{for(let i=0;i<=seg;i++){const a=a0+i/seg*Math.PI/2;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}};
   for(let i=0;i<=20;i++){const a=-Math.PI/2+i/20*Math.PI;pts.push([w+Math.cos(a)*cap,Math.sin(a)*cap])}
   corner(w-r,h-r,0);corner(-w+r,h-r,Math.PI/2);
   for(let i=0;i<=20;i++){const a=Math.PI/2+i/20*Math.PI;pts.push([-w+Math.cos(a)*cap,Math.sin(a)*cap])}
   corner(-w+r,-h+r,Math.PI);corner(w-r,-h+r,-Math.PI/2);}
 else if(kind==='rect'){const w=6,h=2.4,r=.55,seg=10;const corner=(cx,cy,a0)=>{for(let i=0;i<=seg;i++){const a=a0+i/seg*Math.PI/2;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}};
   corner(w-r,-h+r,-Math.PI/2);corner(w-r,h-r,0);corner(-w+r,h-r,Math.PI/2);corner(-w+r,-h+r,Math.PI);}
 else{const ctrl=kind==='free'?[[-6,.2],[-5.4,1.9],[-3.3,2.45],[-.6,2.15],[2,2.55],[4.6,2.45],[6.05,1.1],[5.85,-1.3],[4.1,-2.45],[1.6,-2.35],[-.6,-1.85],[-3.1,-2.45],[-5.3,-1.95]]
   :[[-6,0],[-5.5,1.85],[-3.6,2.55],[-1.6,2.1],[.05,1.05],[1.6,1.85],[3.3,2.55],[5.2,2.3],[6.15,.55],[5.6,-1.6],[3.6,-2.55],[.5,-2.55],[-3,-2.4],[-5.4,-1.65]];
   const n=ctrl.length,seg=12;for(let i=0;i<n;i++){const a=ctrl[(i-1+n)%n],b=ctrl[i],c=ctrl[(i+1)%n],d=ctrl[(i+2)%n];for(let j=0;j<seg;j++){const t=j/seg,t2=t*t,t3=t2*t;pts.push([0,1].map(k=>.5*(2*b[k]+(c[k]-a[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(3*b[k]-a[k]-3*c[k]+d[k])*t3)))}}}
 return pts.map(p=>v2(p[0]*sx,p[1]*sy));
}
function offsetPts(pts,d){
 let area=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];area+=a.x*b.y-b.x*a.y}
 const s=area>0?1:-1;
 return pts.map((p,i)=>{const a=pts[(i-1+pts.length)%pts.length],b=pts[(i+1)%pts.length];const tx=b.x-a.x,ty=b.y-a.y,l=Math.hypot(tx,ty)||1;return v2(p.x+ty/l*d*s,p.y-tx/l*d*s)});
}
const shapeFrom=pts=>new T.Shape(pts);
const pathFrom=pts=>new T.Path(pts);
function extr(shape,depth){const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24});g.rotateX(-Math.PI/2);return g}

function PoolScene(canvas,opts){
 const S=this; S.opts=opts;
 const mobile=innerWidth<700;
 const R=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 R.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));
 R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1;
 if(T.sRGBEncoding)R.outputEncoding=T.sRGBEncoding;
 R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();S.scene=scene;
 const cam=new T.PerspectiveCamera(opts.hero?38:42,1,.1,800);S.cam=cam;
 scene.fog=new T.Fog('#d4f0ff',60,230);
 const sky=new T.Mesh(new T.SphereGeometry(400,32,16),skyMat());scene.add(sky);
 const hemi=new T.HemisphereLight('#cfeaff','#6d7e55',1);scene.add(hemi);
 const sun=new T.DirectionalLight('#fff',3);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
 Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:80});sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;
 scene.add(sun,sun.target);
 const lanai=new T.PointLight('#ffcf8a',0,14,2);lanai.position.set(0,2.9,-9.6);scene.add(lanai);
 const pl1=new T.PointLight('#38e0ff',0,9,2),pl2=new T.PointLight('#38e0ff',0,9,2);scene.add(pl1,pl2);

 const M={
  lawn:new T.MeshStandardMaterial({color:'#ffffff',roughness:1,map:canvasTex(256,256,(g,w,h)=>{g.fillStyle='#4f7d34';g.fillRect(0,0,w,h);for(let i=0;i<9000;i++){g.fillStyle=`hsl(${rnd(85,105)},${rnd(35,55)}%,${rnd(24,40)}%)`;g.fillRect(Math.random()*w,Math.random()*h,1,rnd(2,4))}},90)}),
  wall:new T.MeshStandardMaterial({color:'#e9dcc2',roughness:.9}),
  trim:new T.MeshStandardMaterial({color:'#ffffff',roughness:.6}),
  roof:new T.MeshStandardMaterial({color:'#ffffff',roughness:.8,map:canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5d636b';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16){g.fillStyle=`hsl(212,6%,${rnd(36,46)}%)`;g.fillRect(0,y,w,13);for(let x=0;x<w;x+=rnd(18,30)){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y,1.5,13)}}},.35)}),
  glass:new T.MeshStandardMaterial({color:'#20303f',roughness:.08,metalness:.6,emissive:'#ffc47a',emissiveIntensity:0}),
  coping:new T.MeshStandardMaterial({color:'#e6dcc6',roughness:.75}),
  stone:new T.MeshStandardMaterial({color:'#ffffff',map:stoneTex(),roughness:.9}),
  deck:new T.MeshStandardMaterial({color:'#ffffff',map:deckTex('travertine'),roughness:.82}),
  basin:new T.MeshStandardMaterial({color:'#1a5fb4',map:tileTex(),roughness:.35,side:T.BackSide}),
  ledge:new T.MeshStandardMaterial({color:'#1a5fb4',map:tileTex(),roughness:.35}),
  white:new T.MeshStandardMaterial({color:'#f7f7f5',roughness:.5}),
  cushion:new T.MeshStandardMaterial({color:'#dfeef6',roughness:.9}),
  trunk:new T.MeshStandardMaterial({color:'#8c7356',roughness:1}),
  frond:new T.MeshStandardMaterial({color:'#3f7a2c',roughness:.85,side:T.DoubleSide}),
  hedge:new T.MeshStandardMaterial({color:'#2f5a25',roughness:1}),
  flower:new T.MeshStandardMaterial({color:'#d22c58',roughness:.8}),
  canvas:new T.MeshStandardMaterial({color:'#f4efe6',roughness:.9,side:T.DoubleSide}),
  cage:new T.LineBasicMaterial({color:'#1f262e',transparent:true,opacity:.6})
 };
 // basin caustics + LED glow
 const causU={uTime:{value:0},uNight:{value:0},uLED:{value:C('#38e0ff')},uSunCol:{value:C('#fff')}};
 [M.basin,M.ledge].forEach(m=>m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,causU);
  sh.vertexShader='varying vec3 vWP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader='varying vec3 vWP;\nuniform float uTime,uNight;uniform vec3 uLED,uSunCol;\n'+CAUS+'\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat cz=caustic(vWP.xz*.16,uTime*.45);float under=step(vWP.y,-.13);\ntotalEmissiveRadiance+=under*(cz*.55*uSunCol*(1.0-uNight)+uLED*(.25+.6*cz)*uNight*.9);')});
 S.causU=causU;

 // ground
 const lawn=new T.Mesh(new T.CircleGeometry(260,48),M.lawn);lawn.rotation.x=-Math.PI/2;lawn.position.y=-.27;lawn.receiveShadow=true;scene.add(lawn);

 // house
 const house=new T.Group();scene.add(house);
 const wall=new T.Mesh(new T.BoxGeometry(34,4.6,8),M.wall);wall.position.set(0,2.0,-15);wall.castShadow=wall.receiveShadow=true;house.add(wall);
 const rs=new T.Shape();rs.moveTo(-5.2,0);rs.lineTo(5.2,0);rs.lineTo(0,2.6);rs.lineTo(-5.2,0);
 const roofG=new T.ExtrudeGeometry(rs,{depth:35,bevelEnabled:false});roofG.translate(0,0,-17.5);roofG.rotateY(Math.PI/2);
 const roof=new T.Mesh(roofG,M.roof);roof.position.set(0,4.3,-15);roof.castShadow=true;house.add(roof);
 const lan=new T.Mesh(new T.BoxGeometry(20,.35,4.2),M.trim);lan.position.set(0,3.3,-9.3);lan.castShadow=true;house.add(lan);
 const lanRoof=new T.Mesh(new T.BoxGeometry(20.6,.25,4.8),M.roof);lanRoof.position.set(0,3.6,-9.3);lanRoof.rotation.x=.05;lanRoof.castShadow=true;house.add(lanRoof);
 [-9.6,-3.2,3.2,9.6].forEach(x=>{const c=new T.Mesh(new T.BoxGeometry(.45,3.3,.45),M.trim);c.position.set(x,1.4,-7.4);c.castShadow=true;house.add(c)});
 [-6.6,0,6.6].forEach(x=>{const g=new T.Mesh(new T.BoxGeometry(4.4,2.7,.1),M.glass);g.position.set(x,1.12,-10.96);house.add(g);
   const f=new T.Mesh(new T.BoxGeometry(4.6,.12,.14),M.trim);f.position.set(x,2.5,-10.94);house.add(f)});
 const fas=new T.Mesh(new T.BoxGeometry(20.8,.3,.12),M.trim);fas.position.set(0,3.45,-6.95);house.add(fas);
 [-6.6,0,6.6].forEach(x=>{[-1.1,0,1.1].forEach(dx=>{const m=new T.Mesh(new T.BoxGeometry(.07,2.6,.16),M.trim);m.position.set(x+dx,1.15,-10.92);house.add(m)})});
 M.sconce=new T.MeshStandardMaterial({color:'#fff3d6',emissive:'#ffcf8a',emissiveIntensity:0});
 [-9.9,-3.3,3.3,9.9].forEach(x=>{const sc=new T.Mesh(new T.BoxGeometry(.18,.32,.12),M.sconce);sc.position.set(x,2.2,-10.9);house.add(sc)});
 const patio=new T.Mesh(new T.BoxGeometry(21,.25,4.4),M.deck);patio.position.set(0,-.12,-9.2);patio.receiveShadow=true;house.add(patio);
 // outdoor kitchen island
 const isl=new T.Mesh(new T.BoxGeometry(4,1,1),M.stone);isl.position.set(-6.5,.5,-8.8);isl.castShadow=true;house.add(isl);
 const top=new T.Mesh(new T.BoxGeometry(4.2,.1,1.2),M.coping);top.position.set(-6.5,1.05,-8.8);house.add(top);

 // palms
 function palm(x,z,h,lean,rot){const g=new T.Group();const pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push(new T.Vector3(Math.sin(t*1.4)*lean,t*h,0))}
  const curve=new T.CatmullRomCurve3(pts);const tr=new T.Mesh(new T.TubeGeometry(curve,24,.2,8,false),M.trunk);tr.castShadow=true;g.add(tr);
  const topP=pts[8];const n=11;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2+rnd(-.2,.2);const L=rnd(2.6,3.4);const segs=10;const pos=[],idx=[];
    for(let s=0;s<=segs;s++){const t=s/segs;const r=t*L;const y=Math.sin(t*Math.PI*.9)*.9-t*t*1.9;const w=Math.sin(t*Math.PI)*.42+.04;
      const cx=Math.cos(a)*r,cz=Math.sin(a)*r;const px=-Math.sin(a)*w,pz=Math.cos(a)*w;pos.push(cx+px,y-.12*Math.abs(Math.sin(t*9)),cz+pz,cx-px,y-.12*Math.abs(Math.sin(t*9)),cz-pz);
      if(s<segs){const k=s*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
    const f=new T.Mesh(geo,M.frond);f.position.copy(topP);f.castShadow=true;g.add(f)}
  const cn=new T.Mesh(new T.SphereGeometry(.17,8,6),M.trunk);for(let i=0;i<3;i++){const c=cn.clone();c.position.set(topP.x+Math.cos(i*2)*.22,topP.y-.25,Math.sin(i*2)*.22);g.add(c)}
  g.position.set(x,-.25,z);g.rotation.y=rot;scene.add(g);return g}
 for(let i=0;i<14;i++){const x=-34+i*5.2+rnd(-1.5,1.5);palm(x,-24-rnd(0,8),rnd(8,12),rnd(-1.2,1.2),rnd(0,6))}
 S.palms=[palm(-12.5,-5.5,7.4,1.2,.4),palm(-14,-1,6.2,1.6,1.2),palm(12.8,-4.5,7.8,-1.3,2.6),palm(14.5,1.5,6.4,-1.1,2.0),palm(-13,6,5.8,1,.8)];
 // shrubs (organic clusters) & tropical flowers
 const bgeo=(()=>{const g=new T.IcosahedronGeometry(1,2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i);v.multiplyScalar(1+(Math.sin(v.x*5.1)+Math.sin(v.y*6.3)+Math.sin(v.z*4.7))*.06);p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();return g})();
 const hedgeM=[M.hedge,new T.MeshStandardMaterial({color:'#3d6e2c',roughness:1}),new T.MeshStandardMaterial({color:'#28501f',roughness:1})];
 function bush(x,z,s,flower){const g=new T.Group();const n=3+Math.floor(Math.random()*2);for(let i=0;i<n;i++){const m=new T.Mesh(bgeo,hedgeM[i%3]);const k=s*rnd(.55,.85);m.scale.set(k,k*.85,k);m.position.set(rnd(-.45,.45)*s,k*.55,rnd(-.4,.4)*s);m.castShadow=true;m.receiveShadow=true;g.add(m)}
   if(flower)for(let i=0;i<5;i++){const f=new T.Mesh(bgeo,M.flower);const k=rnd(.09,.14);f.scale.set(k,k,k);f.position.set(rnd(-.5,.5)*s,s*rnd(.75,1.05),rnd(-.45,.45)*s);g.add(f)}
   g.position.set(x,-.25,z);scene.add(g);return g}
 for(let z=-6.8;z<=4.2;z+=1.25){bush(-11+rnd(-.2,.2),z,rnd(.8,1.05),Math.random()<.4);bush(11+rnd(-.2,.2),z,rnd(.8,1.05),Math.random()<.4)}
 for(let x=-9.5;x<=9.5;x+=2.4)if(Math.abs(x)>1.6)bush(x,-7.85,rnd(.6,.75),Math.random()<.5);
 // planters
 const potM=new T.MeshStandardMaterial({color:'#3a4048',roughness:.6});
 [[-8.9,6.2],[8.9,6.2]].forEach(([x,z])=>{const p=new T.Mesh(new T.CylinderGeometry(.55,.38,.9,24),potM);p.position.set(x,.45,z);p.castShadow=true;scene.add(p);const b=bush(x,z,.6,false);b.position.y=.7});
 // loungers + umbrella
 function lounger(x,z,r){const g=new T.Group();const base=new T.Mesh(new T.BoxGeometry(.75,.14,2.1),M.white);base.position.y=.32;const cus=new T.Mesh(new T.BoxGeometry(.7,.1,1.4),M.cushion);cus.position.set(0,.43,.3);
  const back=new T.Mesh(new T.BoxGeometry(.7,.12,.85),M.cushion);back.position.set(0,.68,-.72);back.rotation.x=.75;
  [[-.3,.9],[.3,.9],[-.3,-.9],[.3,-.9]].forEach(p=>{const l=new T.Mesh(new T.BoxGeometry(.06,.3,.06),M.white);l.position.set(p[0],.15,p[1]);g.add(l)});
  g.add(base,cus,back);g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.position.set(x,0,z);g.rotation.y=r;scene.add(g)}
 lounger(-4.6,4.6,Math.PI);lounger(-3.1,4.6,Math.PI);lounger(4.6,4.7,Math.PI+.12);lounger(6.0,4.6,Math.PI+.12);
 {const tb=new T.Mesh(new T.CylinderGeometry(.28,.28,.5,20),M.white);tb.position.set(-3.85,.25,5.2);tb.castShadow=true;scene.add(tb)}
 const um=new T.Group();const pole=new T.Mesh(new T.CylinderGeometry(.05,.05,3,8),M.white);pole.position.y=1.5;const cone=new T.Mesh(new T.ConeGeometry(1.9,.7,10,1,true),M.canvas);cone.position.y=3;um.add(pole,cone);um.traverse(o=>{if(o.isMesh)o.castShadow=true});um.position.set(-4,0,5.6);scene.add(um);

 // cage
 const cg=[];const X0=-10.2,X1=10.2,Z0=-7.1,Z1=7.2,H1=4.6,H0=6.4;
 const yAt=z=>H1+(H0-H1)*(Z1-z)/(Z1-Z0);
 for(let x=X0;x<=X1+.01;x+=2.04){cg.push(x,0,Z1,x,H1,Z1);cg.push(x,H1,Z1,x,H0,Z0)}
 for(let z=Z0;z<=Z1+.01;z+=2.1){[X0,X1].forEach(x=>{cg.push(x,0,z,x,yAt(z),z)});cg.push(X0,yAt(z),z,X1,yAt(z),z)}
 cg.push(X0,1,Z1,X1,1,Z1,X0,1,Z0,X0,1,Z1,X1,1,Z0,X1,1,Z1,X0,H1,Z1,X1,H1,Z1);
 const cgeo=new T.BufferGeometry();cgeo.setAttribute('position',new T.Float32BufferAttribute(cg,3));
 const cage=new T.LineSegments(cgeo,M.cage);cage.visible=false;scene.add(cage);S.cage=cage;

 // pool group
 const pool=new T.Group();scene.add(pool);
 const W=waterMat(),SW=waterMat(),SP=spillMat();S.mats={W,SW,SP,M};
 SW.uniforms.uScale.value=1.4;
 S.state={shape:'rect',finish:'ocean',deck:'travertine',spa:true,ledge:true,cage:false,sx:1,sy:1};
 S.build=function(){
  pool.children.slice().forEach(o=>{pool.remove(o);o.traverse&&o.traverse(m=>{if(m.geometry)m.geometry.dispose()})});
  const st=S.state;const pts=poolPts(st.shape,st.sx,st.sy);
  const cop=offsetPts(pts,.34);
  // deck with hole
  const d=new T.Shape([new T.Vector2(-10,-6.8),new T.Vector2(10,-6.8),new T.Vector2(10,7.1),new T.Vector2(-10,7.1)]);d.holes.push(pathFrom(cop));
  const deck=new T.Mesh(extr(d,.25),M.deck);deck.position.y=-.25;deck.receiveShadow=true;pool.add(deck);
  // coping ring
  const cs=shapeFrom(cop);cs.holes.push(pathFrom(pts));
  const copM=new T.Mesh(extr(cs,.07),M.coping);copM.receiveShadow=true;copM.castShadow=true;pool.add(copM);
  // basin
  const b=new T.Mesh(extr(shapeFrom(pts),1.8),M.basin);b.position.y=-1.8;b.receiveShadow=true;pool.add(b);
  // water
  const wg=new T.ShapeGeometry(shapeFrom(pts),24);wg.rotateX(-Math.PI/2);const w=new T.Mesh(wg,W);w.position.y=-.12;w.renderOrder=2;pool.add(w);
  // ledge
  if(st.ledge){const lx=-6*st.sx+.12;const lw=Math.max(1.2,2.1*st.sx);const lh=(st.shape==='rect'?4.5:3.0)*st.sy;
    const l=new T.Mesh(new T.BoxGeometry(lw,1.45,lh),M.ledge);l.position.set(lx+lw/2,-.38-.725,0);pool.add(l);}
  // spa
  if(st.spa){const ex=3*st.sx;let edge=-1e9;pts.forEach(p=>{if(Math.abs(p.x-ex)<.6&&p.y>edge)edge=p.y});if(edge<0)edge=2.4*st.sy;edge-=.04;const sg=new T.Group();const s=2.5;
    const box=new T.Mesh(new T.BoxGeometry(s,.95,s),M.stone);box.position.set(0,.22,-s/2);box.castShadow=box.receiveShadow=true;sg.add(box);
    [[0,-s,1],[0,0,1],[-s/2,-s/2,0],[s/2,-s/2,0]].forEach(([x,z,hz])=>{const c=new T.Mesh(new T.BoxGeometry(hz?s+.2:.2,.08,hz?.2:s+.2),M.coping);c.position.set(x,.72,z);c.castShadow=true;sg.add(c)});
    const sw=new T.Mesh(new T.PlaneGeometry(s-.25,s-.25),SW);sw.rotation.x=-Math.PI/2;sw.position.set(0,.71,-s/2);sw.renderOrder=3;sg.add(sw);
    const sp=new T.Mesh(new T.PlaneGeometry(1.5,.84),SP);sp.position.set(0,.28,.11);sp.renderOrder=4;sg.add(sp);
    sg.position.set(ex,0,-edge);pool.add(sg)}
  S.cage.visible=st.cage;
  // pool LEDs
  const xs=pts.reduce((a,p)=>[Math.min(a[0],p.x),Math.max(a[1],p.x)],[1e9,-1e9]);
  pl1.position.set(xs[0]*.5,.2,0);pl2.position.set(xs[1]*.5,.2,0);
  // finish
  const f=FINISH[st.finish];M.basin.color.set(f.basin);M.ledge.color.set(f.basin);[W,SW].forEach(m=>{m.uniforms.uDeep.value.set(f.deep);m.uniforms.uShallow.value.set(f.shallow)});
  M.deck.map=deckTex(st.deck);M.deck.needsUpdate=true;patio.material=M.deck;
 };
 S.set=function(o){Object.assign(S.state,o);S.build()};
 S.build();

 // time of day blend
 const cur={};const tgt={};
 function apply(p){const L=(k)=>p[k];
  sky.material.uniforms.uTop.value.copy(p.skyTop);sky.material.uniforms.uHor.value.copy(p.skyHor);sky.material.uniforms.uSunCol.value.copy(p.sunCol);sky.material.uniforms.uNight.value=p.night;
  const sd=p.sun.clone().normalize();sky.material.uniforms.uSun.value.copy(sd);
  sun.position.copy(p.sun);sun.color.copy(p.sunCol);sun.intensity=p.sunI;
  hemi.color.copy(p.hemiS);hemi.groundColor.copy(p.hemiG);hemi.intensity=p.hemiI;
  R.toneMappingExposure=p.exp;scene.fog.color.copy(p.fog);
  [W,SW].forEach(m=>{const u=m.uniforms;u.uSkyTop.value.copy(p.skyTop);u.uSkyHor.value.copy(p.skyHor);u.uSunCol.value.copy(p.sunCol);u.uSun.value.copy(sd);u.uNight.value=p.night});
  SP.uniforms.uNight.value=p.night;causU.uNight.value=p.night;causU.uSunCol.value.copy(p.sunCol);
  M.glass.emissiveIntensity=p.night*1.6;if(M.sconce)M.sconce.emissiveIntensity=p.night*4;lanai.intensity=p.night*14;pl1.intensity=pl2.intensity=p.night*16;
  M.cage.color.set(p.night>.6?'#5b6b80':'#1f262e');
 }
 function toP(name){const t=TIMES[name];return{skyTop:C(t.skyTop),skyHor:C(t.skyHor),sunCol:C(t.sunCol),sunI:t.sunI,sun:new T.Vector3(...t.sun).multiplyScalar(2),hemiS:C(t.hemiS),hemiG:C(t.hemiG),hemiI:t.hemiI,exp:t.exp,night:t.night,fog:C(t.fog)}}
 let from=toP(opts.time||'day'),to=from,blend=1;apply(from);
 S.setTime=function(name){from=lerpP(from,to,blend);to=toP(name);blend=0};
 function lerpP(a,b,k){return{skyTop:a.skyTop.clone().lerp(b.skyTop,k),skyHor:a.skyHor.clone().lerp(b.skyHor,k),sunCol:a.sunCol.clone().lerp(b.sunCol,k),sunI:a.sunI+(b.sunI-a.sunI)*k,sun:a.sun.clone().lerp(b.sun,k),hemiS:a.hemiS.clone().lerp(b.hemiS,k),hemiG:a.hemiG.clone().lerp(b.hemiG,k),hemiI:a.hemiI+(b.hemiI-a.hemiI)*k,exp:a.exp+(b.exp-a.exp)*k,night:a.night+(b.night-a.night)*k,fog:a.fog.clone().lerp(b.fog,k)}}

 // camera control
 const ctl={theta:opts.hero?.34:.55,phi:opts.hero?1.47:1.02,rad:opts.hero?(mobile?30:24):(mobile?38:31),tt:0,tp:0,tr:0,target:new T.Vector3(opts.hero?.5:0,opts.hero?2.3:.2,opts.hero?-3:-1)};
 ctl.tt=ctl.theta;ctl.tp=ctl.phi;ctl.tr=ctl.rad;S.ctl=ctl;
 const VIEWS={aerial:{t:.15,p:.42,r:mobile?40:33,y:0,z:-.5},poolside:{t:.62,p:1.22,r:mobile?36:27,y:.4,z:-1},lanai:{t:Math.PI+.3,p:1.42,r:9.8,y:1.1,z:-1.2}};
 S.view=function(n){const v=VIEWS[n];if(!v)return;S.autospin=false;let d=v.t-ctl.tt;d=Math.atan2(Math.sin(d),Math.cos(d));ctl.tt+=d;ctl.tp=v.p;ctl.tr=v.r;S.tgt=new T.Vector3(0,v.y,v.z)};
 if(!opts.hero){const v=VIEWS.poolside;ctl.theta=ctl.tt=v.t;ctl.phi=ctl.tp=v.p;ctl.rad=ctl.tr=v.r;ctl.target.set(0,v.y,v.z)}
 let mx=0,my=0;
 if(opts.hero){addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true})}
 if(opts.interactive){let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,t:ctl.tt,p:ctl.tp};canvas.setPointerCapture(e.pointerId);S.onInteract&&S.onInteract()});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;ctl.tt=drag.t-(e.clientX-drag.x)*.006;ctl.tp=Math.min(1.45,Math.max(.3,drag.p-(e.clientY-drag.y)*.005))});
  const end=()=>drag=null;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('wheel',e=>{e.preventDefault();ctl.tr=Math.min(42,Math.max(8,ctl.tr+e.deltaY*.02));S.onInteract&&S.onInteract()},{passive:false});
  let pinch=0;canvas.addEventListener('touchmove',e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)ctl.tr=Math.min(38,Math.max(12,ctl.tr-(d-pinch)*.05));pinch=d}},{passive:true});
  canvas.addEventListener('touchend',()=>pinch=0);
 }
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;
  if(opts.hero&&w>900){cam.setViewOffset(w,h,-w*.17,h*.02,w,h)}else if(opts.hero){cam.setViewOffset(w,h,0,-h*.12,w,h)}else cam.clearViewOffset();cam.updateProjectionMatrix()}
 new ResizeObserver(resize).observe(canvas);resize();
 S.visible=true;
 new IntersectionObserver(es=>es.forEach(e=>S.visible=e.isIntersecting),{rootMargin:'100px'}).observe(canvas);
 const clock=new T.Clock();let t0=0;
 const ledCols=[C('#38e0ff'),C('#3b6dff'),C('#a046ff'),C('#22f0c0')];
 S.frame=function(){if(!S.visible)return;const dt=Math.min(clock.getDelta(),.05);t0+=dt;
  if(blend<1){blend=Math.min(1,blend+Math.max(dt,.05)*(window.__TEST?4:.9));const e=1-Math.pow(1-blend,3);apply(lerpP(from,to,e))}
  const ci=(t0*.12)%ledCols.length,a=ledCols[Math.floor(ci)],b=ledCols[(Math.floor(ci)+1)%ledCols.length];const led=a.clone().lerp(b,ci%1);
  [W,SW].forEach(m=>{m.uniforms.uTime.value=t0;m.uniforms.uLED.value.copy(led)});SP.uniforms.uTime.value=t0;SP.uniforms.uLED.value.copy(led);causU.uTime.value=t0;causU.uLED.value.copy(led);pl1.color.copy(led);pl2.color.copy(led);
  if(opts.hero&&!reduce){ctl.theta=ctl.tt+Math.sin(t0*.07)*.38+mx*.25;ctl.phi=ctl.tp+my*.08-Math.sin(t0*.05)*.04;ctl.rad=ctl.tr-scrollY*.004}
  else{if(S.tgt)ctl.target.lerp(S.tgt,.06);ctl.theta+=(ctl.tt-ctl.theta)*.07;ctl.phi+=(ctl.tp-ctl.phi)*.08;ctl.rad+=(ctl.tr-ctl.rad)*.08;if(!opts.hero&&S.autospin&&!reduce)ctl.tt+=dt*.06}
  const sp=Math.sin(ctl.phi);cam.position.set(ctl.target.x+ctl.rad*sp*Math.sin(ctl.theta),ctl.target.y+ctl.rad*Math.cos(ctl.phi),ctl.target.z+ctl.rad*sp*Math.cos(ctl.theta));cam.lookAt(ctl.target);
  sky.material.uniforms.uTime.value=t0;
  S.palms.forEach((p,i)=>p.children.forEach((c,j)=>{if(j>0&&j<12)c.rotation.z=Math.sin(t0*1.1+i+j)*.035}));
  R.render(scene,cam)};
}

