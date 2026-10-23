const { chromium, devices } = require('playwright');
(async()=>{ const b=await chromium.launch();
 for(const cs of ['light','dark']){
 const ctx=await b.newContext({...devices['iPhone 13'],locale:'pl-PL',colorScheme:cs}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8766/');
 await p.evaluate(()=>{ const d=n=>{const x=new Date(); x.setDate(x.getDate()-n); return x.toISOString().slice(0,10);};
  const log={}; for(let i=1;i<=3;i++){ log[d(i)]={m1:1,d1:1}; }
  localStorage.setItem('wassup.v1',JSON.stringify({v:1,profile:{sex:'m',age:'19-30',state:'none'},
   products:[{id:'m1',cid:'allnutrition-magb6',name:'MAG B6',brand:'Allnutrition',type:'suplement',unit:'kapsulka',content:{mg:102,b6:0.7},daily:1,producerDaily:2,stock:{count:8,since:d(3)}},
             {id:'d1',cid:'ibuvit-d3-4000',name:'Ibuvit D3 4000 IU',brand:'Polpharma',type:'lek',unit:'kapsulka',content:{d:100},daily:1,producerDaily:1,stock:{count:60,since:d(3)}}],
   log,labs:[],prefs:{},diet:{method:'file',date:d(5),items:40,days:7,coverage:.9,intake:{mg:672,d:4.6,b6:2.1}},created:d(10)})); });
 await p.reload();
 const att=async()=>p.$$eval('.att',e=>e.map(x=>x.innerText.split('\n')[0].slice(0,90)));
 console.log(cs,'start',await att());
 await p.click('[data-tab="box"]'); await p.click('[data-act="dose+"][data-id="m1"]');
 console.log('daily after +', await p.evaluate(()=>JSON.parse(localStorage.getItem('wassup.v1')).products[0].daily));
 await p.click('[data-tab="today"]'); console.log('after dose 2',await att());
 if(true) await p.screenshot({path:`p1-today-${cs}.png`,fullPage:false});
 await p.click('[data-tab="box"]'); await p.click('[data-act="dose+"][data-id="m1"]'); await p.screenshot({path:`p1-box-${cs}.png`});
 console.log('over note:', await p.$$eval('.note.warn',e=>e.map(x=>x.innerText.slice(0,80))));
 await p.click('[data-act="dose-"][data-id="m1"]');
 await p.click('[data-tab="today"]'); await p.click('[data-act="snooze"][data-id="m1"]'); console.log('after snooze',await att());
 await p.evaluate(()=>{ const s=JSON.parse(localStorage.getItem('wassup.v1')); s.prefs.snooze={}; localStorage.setItem('wassup.v1',JSON.stringify(s)); }); await p.reload();
 await p.click('.att.stock [data-act="refill"]'); await p.screenshot({path:`p1-refill-${cs}.png`}); await p.fill('#r-add','30'); await p.click('[data-act="refill-save"]');
 console.log('after refill',await att(), await p.evaluate(()=>JSON.parse(localStorage.getItem('wassup.v1')).products[0].stock));
 await p.click('[data-tab="box"]'); await p.click('[data-act="edit"][data-id="m1"]'); await p.click('.sheet [data-act="end"]'); await p.click('[data-act="end-yes"]');
 await p.screenshot({path:`p1-ended-${cs}.png`,fullPage:true});
 await p.click('[data-tab="today"]'); console.log('today rows', await p.$$eval('.list .row .pname',e=>e.map(x=>x.textContent)));
 await p.click('[data-tab="box"]'); await p.click('[data-act="resume"]'); await p.click('[data-tab="today"]'); console.log('after resume rows', await p.$$eval('.list .row .pname',e=>e.map(x=>x.textContent)));
 await p.click('[data-tab="hist"]'); console.log('hist ok', (await p.$$('.chart svg')).length);
 console.log('errs',errs); await ctx.close(); }
 await b.close(); })();
