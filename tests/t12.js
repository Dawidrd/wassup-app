const { chromium, devices } = require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({...devices['iPhone 13'],locale:'pl-PL'}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8766/');
 await p.evaluate(()=>{ const d=n=>{const x=new Date(); x.setDate(x.getDate()-n); const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0'); return y+'-'+m+'-'+dd;};
  const log={}; for(let i=1;i<=10;i++){ log[d(i)]={m1:1,d1:1,z1:2}; } log[d(0)]={m1:2,d1:1,z1:2};
  localStorage.setItem('wassup.v1',JSON.stringify({v:1,profile:{sex:'m',age:'19-30',state:'none'},
   products:[{id:'m1',cid:'allnutrition-magb6',name:'MAG B6',brand:'Allnutrition',type:'suplement',unit:'kapsulka',content:{mg:102,b6:0.7},daily:2,producerDaily:2},
             {id:'d1',cid:'ibuvit-d3-4000',name:'Ibuvit D3 4000 IU',brand:'Polpharma',type:'lek',unit:'kapsulka',content:{d:100},daily:1,producerDaily:1},
             {id:'z1',name:'Cynk',type:'suplement',unit:'tabletka',content:{zn:10},daily:1}],
   log,labs:[],prefs:{lastBackup:d(1)},created:d(30)})); });
 await p.reload();
 console.log('doses', await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('wassup.v1')).products.map(x=>[x.name,x.doses||null]))));
 console.log('hist stat', await p.evaluate(()=>{ document.querySelector('[data-tab="hist"]').click(); return document.querySelector('.stat').innerText.replace(/\n/g,' '); }));
 await p.click('[data-tab="me"]'); await p.click('[data-act="rep-open"]'); await p.click('[data-act="rep-range"][data-v="30"]');
 console.log(await p.$eval('.doc',e=>e.innerText.split('PRZYJMOWANE PRODUKTY')[1].split('DIETA')[0]));
 // zmiana porcji w Apteczce zapisuje historię
 await p.click('[data-act="rep-back"]'); await p.click('[data-tab="box"]'); await p.click('[data-act="dose+"][data-id="d1"]');
 console.log('d1 doses', await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('wassup.v1')).products[1].doses)));
 await p.click('[data-act="dose-"][data-id="d1"]'); console.log('d1 doses back', await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('wassup.v1')).products[1].doses)));
 console.log('errs',errs); await b.close(); })();
