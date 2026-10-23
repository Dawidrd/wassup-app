const { chromium, devices } = require('playwright');
const SP=process.argv[2];
(async()=>{
 const b=await chromium.launch();
 for(const cs of ['light','dark']){
 const ctx=await b.newContext({...devices['iPhone 13'],locale:'pl-PL',colorScheme:cs}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8766/');
 await p.evaluate(()=>localStorage.setItem('wassup.v1',JSON.stringify({v:1,profile:{sex:'m',age:'19-30',state:'none'},
   products:[{id:'d1',cid:'ibuvit-d3-4000',name:'Ibuvit D3 4000 IU',brand:'Polpharma',type:'lek',unit:'kapsulka',content:{d:100},daily:1},{id:'m1',name:'MAG B6',brand:'Allnutrition',type:'suplement',unit:'kapsulka',content:{mg:102,b6:0.7},daily:1}],
   log:{},labs:[{n:'d',date:'2026-03-10',value:18,unit:'ng/ml'}],prefs:{},created:'2026-10-07'}))); await p.reload();
 const tabs=await p.$$eval('.tab span',e=>e.map(x=>x.textContent)); console.log(cs,'tabs',tabs.join('|'));
 await p.click('[data-tab="labs"]');
 // dodaj D25 wysoki
 await p.click('.head [data-act="lab-add"]'); await p.selectOption('#lf-m','d25');
 await p.fill('#lf-date','2026-10-01'); await p.fill('#lf-val','112'); await p.fill('#lf-lo','30'); await p.fill('#lf-hi','100');
 const prev=await p.textContent('#lf-prev'); console.log('preview:',prev.trim());
 if(cs==='light') await p.screenshot({path:'lab-form.png'});
 await p.click('[data-act="lab-save"]');
 // ferrytyna niska
 await p.click('.head [data-act="lab-add"]'); await p.selectOption('#lf-m','ferr'); await p.fill('#lf-date','2026-10-01'); await p.fill('#lf-val','14,5'); await p.fill('#lf-lo','30'); await p.fill('#lf-hi','400'); await p.click('[data-act="lab-save"]');
 // magnez bez zakresu, oznaczenie W normie
 await p.click('.head [data-act="lab-add"]'); await p.selectOption('#lf-m','mg'); await p.fill('#lf-date','2026-10-01'); await p.fill('#lf-val','0,85');
 await p.click('[data-lf-flag="in"]'); if(cs==='light') await p.screenshot({path:'lab-form2.png'}); await p.click('[data-act="lab-save"]');
 // inny parametr
 await p.click('.head [data-act="lab-add"]'); await p.selectOption('#lf-m','other'); await p.fill('#lf-name','Selen'); await p.fill('#lf-date','2026-10-01'); await p.fill('#lf-val','95'); await p.fill('#lf-unit','µg/l'); await p.fill('#lf-hi','150'); await p.click('[data-act="lab-save"]');
 await p.waitForTimeout(300);
 await p.screenshot({path:`labs-${cs}.png`,fullPage:true});
 await p.click('[data-act="lab-open"][data-k="d25"]'); await p.waitForTimeout(200); await p.screenshot({path:`labs-detail-${cs}.png`});
 await p.click('.sheet-head [data-act="close"]');
 // prefill check: nowy wynik D25 -> zakres uzupełniony
 await p.click('.head [data-act="lab-add"]'); await p.selectOption('#lf-m','ferr'); console.log('prefill ferr', await p.inputValue('#lf-lo'), await p.inputValue('#lf-hi')); await p.click('.sheet-head [data-act="close"]');
 await p.click('[data-tab="today"]'); await p.screenshot({path:`today-${cs}.png`});
 await p.click('[data-tab="hist"]'); await p.selectOption('#hist-n','d'); await p.waitForTimeout(200);
 const h=await p.$eval('.screen',e=>e.innerText.slice(-400)); console.log('hist:',h.replace(/\n/g,' | '));
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('wassup.v1')).labs.map(l=>[l.m,l.value,l.unit,l.lo,l.hi,l.flag||''].join(',')));
 console.log(st.join(' ; ')); console.log('errs',errs);
 await ctx.close(); }
 await b.close(); })();
