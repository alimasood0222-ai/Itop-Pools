addEventListener('scroll',()=>{const t=$('#tl'),r=t.getBoundingClientRect();const p=Math.min(1,Math.max(0,(innerHeight*.6-r.top)/r.height));$('#tlFill').style.height=(p*100)+'%'},{passive:true});
