const { chromium, devices } = require('playwright');
(async()=>{ const b=await chromium.launch();
 for(const cs of ['light','dark']){
 const ctx=await b.newContext({...devices['iPhone 13'],locale:'pl-PL',colorScheme:cs,acceptDownloads:true}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8766/');
 await p.evaluate(()=>{ const d=n=>{const x=new Date(); x.setDate(x.getDate()-n); const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0'); return y+'-'+m+'-'+dd;};
  const log={}; for(let i=1;i<=40;i++){ if(i%7) log[d(i)]={m1:2,d1:1}; else log[d(i)]={d1:1}; }
  localStorage.setItem('wassup.v1',JSON.stringify({v:1,profile:{sex:'m',age:'19-30',state:'none'},
   products:[{id:'m1',cid:'allnutrition-magb6',name:'MAG B6',brand:'Allnutrition',type:'suplement',unit:'kapsulka',content:{mg:102,b6:0.7},daily:2,producerDaily:2},
             {id:'d1',cid:'ibuvit-d3-4000',name:'Ibuvit D3 4000 IU',brand:'Polpharma',type:'lek',unit:'kapsulka',content:{d:100},daily:1,producerDaily:1}],
   log,labs:[{id:'a',m:'d25',date:d(40),value:24,unit:'ng/ml',lo:30,hi:100,ts:1},{id:'b',m:'ferr',date:d(40),value:14.5,unit:'ng/ml',lo:30,hi:400,ts:2}],
   prefs:{labsMode:true,lastBackup:d(1)},diet:{method:'file',date:d(5),items:40,days:7,coverage:.9,intake:{mg:672,d:4.6}},created:d(45)})); });
 await p.reload(); await p.click('[data-tab="labs"]');
 await p.click('[data-act="period-new"]');
 const on=await p.$$eval('[data-pf-on]',e=>e.map(x=>x.checked)); console.log(cs,'default goals',on);
 const idx=await p.$$eval('.pfitem b',e=>e.map(x=>x.textContent)); console.log('items',idx);
 const fi=idx.findIndex(x=>x.includes('Ferrytyna')); await p.check(`[data-pf-on="${fi}"]`); await p.waitForTimeout(100);
 await p.click(`[data-act="pf-src"][data-i="${fi}"][data-v="doctor"]`); await p.fill(`[data-pf-lo="${fi}"]`,'50');
 await p.click('[data-act="pf-quick"][data-d="91"]'); await p.check('#pf-doctor'); await p.fill('#pf-note','zalecenie z wizyty');
 if(cs==='light') await p.screenshot({path:'p3-form.png',fullPage:false});
 await p.click('[data-act="pf-save"]'); await p.waitForTimeout(200);
 const card=await p.$('.card.period'); await card.screenshot({path:`p3-card-${cs}.png`});
 console.log('card:', (await card.innerText()).replace(/\n+/g,' | ').slice(0,600));
 await p.click('[data-tab="today"]'); console.log('att:', await p.$$eval('.att',e=>e.map(x=>x.innerText.split('\n')[0].slice(0,140))));
 // nowy wynik kontrolny
 await p.click('[data-tab="labs"]'); await p.click('.card.period [data-act="lab-add"]'); await p.fill('#lf-val','41'); await p.click('[data-act="lab-save"]'); await p.waitForTimeout(200);
 const card2=await p.$('.card.period'); await card2.screenshot({path:`p3-after-${cs}.png`});
 await p.click('[data-tab="today"]'); console.log('att2:', await p.$$eval('.att',e=>e.map(x=>x.innerText.split('\n')[0].slice(0,100))));
 await p.click('[data-tab="labs"]');
 const [dl]=await Promise.all([p.waitForEvent('download',{timeout:3000}).catch(()=>null), p.click('[data-act="period-ics"]')]);
 if(dl){ const path=await dl.path(); console.log('ics', require('fs').readFileSync(path,'utf8').split('\r\n').filter(l=>/DTSTART|SUMMARY|TRIGGER/.test(l)).join(' ')); }
 await p.click('[data-act="period-renew"]'); console.log('renew start/test', await p.inputValue('#pf-start'), await p.inputValue('#pf-test'));
 await p.click('[data-act="pf-save"]'); await p.waitForTimeout(200);
 console.log('periods', await p.evaluate(()=>JSON.parse(localStorage.getItem('wassup.v1')).periods.map(x=>[x.start,x.testDate,x.closed?x.closed.decision:'active',x.items.map(i=>i.name+':'+i.lo+'-'+i.hi+':'+i.src).join(',')].join(' '))));
 console.log('prev list:', await p.$$eval('.section-t',e=>e.map(x=>x.textContent)));
 // edit: uncheck ferritin
 await p.click('[data-act="period-edit"]'); const idx2=await p.$$eval('.pfitem b',e=>e.map(x=>x.textContent)); const f2=idx2.findIndex(x=>x.includes('Ferrytyna')); await p.uncheck(`[data-pf-on="${f2}"]`); await p.waitForTimeout(100); await p.click('[data-act="pf-save"]');
 console.log('after edit items', await p.evaluate(()=>JSON.parse(localStorage.getItem('wassup.v1')).periods.filter(x=>!x.closed)[0].items.length));
 await p.screenshot({path:`p3-labs-${cs}.png`,fullPage:true});
 console.log('errs',errs); await ctx.close(); }
 await b.close(); })();
