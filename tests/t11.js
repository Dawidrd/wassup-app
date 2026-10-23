const { chromium, devices } = require('playwright');
(async()=>{ const b=await chromium.launch();
 for(const cs of ['light','dark']){
 const ctx=await b.newContext({...devices['iPhone 13'],locale:'pl-PL',colorScheme:cs}); await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://localhost:8766'}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8766/');
 await p.evaluate(()=>{ const d=n=>{const x=new Date(); x.setDate(x.getDate()-n); const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0'); return y+'-'+m+'-'+dd;};
  const log={}; for(let i=1;i<=40;i++){ if(i%7) log[d(i)]={m1:2,d1:1}; else log[d(i)]={d1:1}; } log[d(0)]={d1:1};
  localStorage.setItem('wassup.v1',JSON.stringify({v:1,profile:{sex:'m',age:'19-30',state:'none'},
   products:[{id:'m1',cid:'allnutrition-magb6',name:'MAG B6',brand:'Allnutrition',type:'suplement',unit:'kapsulka',content:{mg:102,b6:0.7},daily:2,producerDaily:2},
             {id:'d1',cid:'ibuvit-d3-4000',name:'Ibuvit D3 4000 IU',brand:'Polpharma',type:'lek',unit:'kapsulka',content:{d:100},daily:1,producerDaily:1}],
   log,labs:[{id:'a',m:'d25',date:d(40),value:24,unit:'ng/ml',lo:30,hi:100,ts:1},{id:'b',m:'ferr',date:d(40),value:14.5,unit:'ng/ml',lo:30,hi:400,ts:2},{id:'c',m:'d25',date:d(2),value:41,unit:'ng/ml',lo:30,hi:100,ts:3},{id:'e',m:'mg',date:d(40),value:0.85,unit:'mmol/l',lo:null,hi:null,flag:'in',ts:4}],
   periods:[{id:'p1',start:d(40),testDate:d(-50),items:[{k:'d25',m:'d25',name:'Witamina D (25(OH)D)',unit:'ng/ml',lo:30,hi:100,src:'lab'},{k:'ferr',m:'ferr',name:'Ferrytyna',unit:'ng/ml',lo:50,hi:null,src:'doctor'}],products:['d1'],doctor:true,note:'zalecenie z wizyty'}],
   prefs:{labsMode:true,lastBackup:d(1)},diet:{method:'ffq',date:d(5),intake:{mg:350,d:3,b6:1.5,zn:12,fol:420,se:50,c:200,ca:900,fe:11,b12:4,k:80,pot:3000,om3:150}},created:d(45)})); });
 await p.reload(); await p.click('[data-tab="labs"]'); await p.click('.reprow');
 const txt=await p.$eval('.doc',e=>e.innerText); console.log(cs,'len',txt.length); console.log(txt.split('\n').filter(l=>/Zakres|Witamina D|Ibuvit|MAG|Magnez|Uwagi|Ferrytyna/.test(l)).slice(0,14).join('\n'));
 await p.screenshot({path:`p4-report-${cs}.png`,fullPage:true});
 for(const r of ['30','90','period']){ await p.click(`[data-act="rep-range"][data-v="${r}"]`); console.log(r, await p.$eval('.kv dd:nth-of-type(2)',e=>e.textContent)); }
 await p.click('[data-act="rep-share"]'); await p.waitForTimeout(300); const clip=await p.evaluate(()=>navigator.clipboard.readText().catch(()=>'' )); console.log('clip lines', clip.split('\n').length, clip.split('\n').slice(0,6).join(' // '));
 if(cs==='light'){ await p.emulateMedia({media:'print'}); await p.pdf({path:'raport.pdf',format:'A4',printBackground:true}).catch(e=>console.log('pdf err',e.message)); await p.emulateMedia({media:'screen'}); }
 await p.click('[data-act="rep-back"]'); console.log('back to', await p.$eval('.head h1',e=>e.textContent));
 await p.click('[data-tab="me"]'); await p.click('[data-act="rep-open"]'); await p.click('[data-act="rep-back"]'); console.log('back to', await p.$eval('.head h1',e=>e.textContent));
 console.log('errs',errs); await ctx.close(); }
 await b.close(); })();
