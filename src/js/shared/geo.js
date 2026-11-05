/* shapes (2D: x right, y = toward house) */
const v2=(x,y)=>window.THREE?new THREE.Vector2(x,y):{x,y};
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
