const { chromium, devices } = require('playwright');
(async()=>{ const b=await chromium.launch();
 for(const [cs,method] of [['light','file'],['dark','ffq'],['light','none']]){
 const ctx=await b.newContext({...devices['iPhone 13'],locale:'pl-PL',colorScheme:cs}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8766/');
 await p.evaluate((method)=>{ const d=n=>{const x=new Date(); x.setDate(x.getDate()-n); return x.toISOString().slice(0,10);};
  const log={}; for(let i=1;i<=9;i++){ log[d(i)]={m1:2,d1:1}; }
  const diet= method==='none'?null: {method,date:d(5),items:40,days:7,coverage:.9,intake: method==='file'?{mg:672,d:4.6,b6:2.1,zn:9,fol:300,se:80,c:60}:{mg:350,d:3,b6:1.5,zn:12,fol:420,se:50,c:200}};
  localStorage.setItem('wassup.v1',JSON.stringify({v:1,profile:{sex:'m',age:'19-30',state:'none'},
   products:[{id:'m1',cid:'allnutrition-magb6',name:'MAG B6',brand:'Allnutrition',type:'suplement',unit:'kapsulka',content:{mg:102,b6:0.7},daily:2,producerDaily:2},
             {id:'d1',cid:'ibuvit-d3-4000',name:'Ibuvit D3 4000 IU',brand:'Polpharma',type:'lek',unit:'kapsulka',content:{d:100},daily:1,producerDaily:1},
             {id:'z1',name:'Cynk',type:'suplement',unit:'tabletka',content:{zn:10},daily:1}],
   log,labs:[],prefs:{},diet,created:d(12)})); }, method);
 await p.reload();
 console.log(cs,method,'att:', await p.$$eval('.att',e=>e.map(x=>x.innerText.split('\n')[0].slice(0,60))));
 const gaps=await p.$$eval('.card',cs=>cs.filter(c=>c.querySelector('.nname')).map(c=>{ const name=c.querySelector('.nname').innerText.replace(/\n/g,' '); const g=[...c.querySelectorAll('.cmp div')].find(d=>d.innerText.startsWith('Do normy')); const note=c.querySelector('.note.ok, .gapnote')||[...c.querySelectorAll('.note')].find(x=>x.innerText.includes('do normy')||x.innerText.includes('pokrywa'));
   return name+' | '+(g?g.innerText.replace(/\n/g,' '):'-')+' | '+(note?note.innerText.slice(0,110):''); }));
 gaps.forEach(x=>console.log('  ',x));
 await p.screenshot({path:`p2-${cs}-${method}.png`,fullPage:true});
 if(method==='none'){ await p.click('[data-act="backup-snooze"]'); console.log('after snooze att', await p.$$eval('.att',e=>e.length)); await p.click('[data-tab="me"]'); console.log(await p.$eval('.screen',e=>e.innerText.match(/Ostatnia kopia[^\n]*/)[0])); }
 if(method==='file'){ await p.click('.gaprow [data-act="info"]'); await p.waitForTimeout(200); await p.screenshot({path:'p2-info.png'}); }
 console.log('errs',errs); await ctx.close(); }
 await b.close(); })();
