(()=>{const r=$('#miniR');let term=15;const upd=()=>{$('#miniAmt').textContent=money(+r.value);$('#miniPay').textContent=money(pmt(+r.value,7.99,term))};
 r.addEventListener('input',upd);$$('#miniTerm button').forEach(b=>b.onclick=()=>{$$('#miniTerm button').forEach(x=>x.classList.remove('on'));b.classList.add('on');term=+b.dataset.v;upd()});upd()})();
