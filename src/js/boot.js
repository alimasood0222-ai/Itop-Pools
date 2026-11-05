reveal();(function drain(){if(!laterQ.length){reveal();return}const fn=laterQ.shift();fn();setTimeout(drain,16)})();
