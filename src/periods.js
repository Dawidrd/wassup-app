/* ============ Okres między badaniami (v0.8) ============ */
function activePeriod(){ return (S.periods||[]).find(p=>!p.closed)||null; }
function resultsFor(k){ return S.labs.filter(l=>labKey(l)===k).sort((a,b)=>a.date.localeCompare(b.date)||(a.ts||0)-(b.ts||0)); }
function baselineOf(it,P){ const r=resultsFor(it.k).filter(l=>l.date<=P.start); return r[r.length-1]||null; }
function afterOf(it,P){ const r=resultsFor(it.k).filter(l=>l.date>P.start); return r[r.length-1]||null; }
function goalFlag(l,it){ const v=convert(l.m,l.value,l.unit,it.unit); if(v==null) return null; return labFlag({value:v,lo:it.lo,hi:it.hi}); }
function goalText(it){ if(it.lo!=null&&it.hi!=null) return `${fmt(it.lo,2)}–${fmt(it.hi,2)} ${it.unit}`; if(it.lo!=null) return `powyżej ${fmt(it.lo,2)} ${it.unit}`; return `poniżej ${fmt(it.hi,2)} ${it.unit}`; }
const GST={ in:{c:"ok",t:"W celu"}, low:{c:"warn",t:"Poniżej celu"}, high:{c:"bad",t:"Powyżej celu"} };
function periodDays(P){ const end=today()<P.testDate?today():P.testDate; const out=[]; let k=P.start; while(k<=end && out.length<800){ out.push(k); k=addDays(k,1); } return out; }
function periodStats(P){
  const days=periodDays(P), prods=P.products.map(id=>S.products.find(p=>p.id===id)).filter(Boolean);
  const per=prods.map(p=>{ let need=0,got=0; days.forEach(k=>{ const dk=dailyOn(p,k); need+=dk; got+=Math.min(taken(k,p.id),dk); }); return {p,pct:need?Math.round(got/need*100):0}; });
  const ns=[...new Set(P.items.map(it=>(MK[it.m]||{}).n).filter(n=>n&&prods.some(p=>p.content[n])))];
  const avg={}; ns.forEach(n=>{ let s=0; days.forEach(k=>{ s+=totals(k).t[n]||0; }); avg[n]=days.length?s/days.length:0; });
  return {days:days.length,per,avg};
}
function doctorPlanFor(n){ const P=activePeriod(); if(!P||!P.doctor||!S.prefs.labsMode) return false; return P.products.some(id=>{ const p=S.products.find(x=>x.id===id); return p&&!p.ended&&p.content[n]; }); }

/* --- karta okresu w zakładce Badania --- */
function periodBlock(){
  const P=activePeriod(), closed=(S.periods||[]).filter(p=>p.closed).sort((a,b)=>b.start.localeCompare(a.start));
  let h="";
  if(!P){
    h+= S.labs.length ? `<div class="card period"><div class="pname">Okres do kolejnego badania</div>
      <div class="pmeta">Ustaw cel dla wyników (zakres z wydruku albo wartość od lekarza), wybierz produkty z planu i datę badania kontrolnego. Wassup pokaże regularność, przypomni o badaniu i porówna wyniki przed i po.</div>
      <button class="btn" data-act="period-new">Zaplanuj okres</button></div>` : "";
  } else h+=periodCard(P);
  h+= !closed.length?"":`<div class="section-t">Poprzednie okresy</div><div class="list">${closed.map(p=>`<div class="row"><div class="grow"><div class="pname">${esc(fullDate(p.start))} – ${esc(fullDate(p.closed.date))}</div><div class="pmeta">${p.items.map(it=>{ const b=baselineOf(it,p), a=resultsFor(it.k).filter(l=>l.date>p.start&&l.date<=p.closed.date).pop(); return `${esc(it.name)}: ${b?fmt(b.value,2)+" "+esc(b.unit):"–"} → ${a?fmt(a.value,2)+" "+esc(a.unit):"–"}`; }).join(" · ")}${p.doctor?" · plan od lekarza":""}</div></div></div>`).join("")}</div>`;
  return h;
}
function periodCard(P){
  const st=periodStats(P), left=Math.round((parseKey(P.testDate)-parseKey(today()))/864e5);
  const span=Math.max(1,Math.round((parseKey(P.testDate)-parseKey(P.start))/864e5)), done=Math.min(span,Math.max(0,daysSince(P.start)));
  const afters=P.items.map(it=>afterOf(it,P)), anyAfter=afters.some(Boolean);
  const when= left>0?`Badanie kontrolne za ${left} ${plural(left,["dzień","dni","dni"])} (${esc(fullDate(P.testDate))})`: left===0?`Badanie kontrolne dziś`:`Termin badania kontrolnego minął ${-left} ${plural(-left,["dzień","dni","dni"])} temu (${esc(fullDate(P.testDate))})`;
  const metProds=[];
  P.items.forEach((it,i)=>{ const a=afters[i]; if(a && goalFlag(a,it)==="in"){ const n=(MK[it.m]||{}).n; P.products.forEach(id=>{ const p=S.products.find(x=>x.id===id); if(p&&!p.ended&&n&&p.content[n]&&!metProds.some(x=>x.p.id===p.id)) metProds.push({p,it}); }); } });
  return `<div class="card period">
    <div class="ntop"><div><div class="pname">Okres do badania kontrolnego</div><div class="pmeta">od ${esc(fullDate(P.start))}${P.note?` · ${esc(P.note)}`:""}</div></div>${P.doctor?`<span class="chip ok">Plan od lekarza</span>`:`<span class="chip none">Plan własny</span>`}</div>
    <div><div class="ptrack"><i style="width:${done/span*100}%"></i></div><div class="pmeta" style="margin-top:6px">${when}</div></div>
    <div class="pname">Cele</div>
    <div class="goals">${P.items.map((it,i)=>{ const b=baselineOf(it,P), a=afters[i], gf=a?goalFlag(a,it):null, bf=b?goalFlag(b,it):null;
      return `<div class="goal"><div class="grow"><div class="pname">${esc(it.name)}</div>
        <div class="pmeta">Cel: ${esc(goalText(it))} · ${it.src==="doctor"?"od lekarza":"zakres z wydruku"}</div>
        <div class="pmeta num">Na starcie: ${b?`${fmt(b.value,2)} ${esc(b.unit)} (${esc(fullDate(b.date))})`:"brak wyniku"}${a?` → <b style="color:var(--ink)">teraz ${fmt(a.value,2)} ${esc(a.unit)}</b> (${esc(fullDate(a.date))})`:""}</div></div>
        ${a&&gf?`<span class="chip ${GST[gf].c}">${GST[gf].t}</span>`:b&&bf?`<span class="chip none">Start: ${({in:"w celu",low:"poniżej",high:"powyżej"})[bf]}</span>`:""}</div>`; }).join("")}</div>
    <div class="pname">Plan</div>
    ${st.per.length?`<div class="cmp">${st.per.map(x=>`<div><span>${esc(x.p.name)} · ${fmt(x.p.daily)} ${unitWord(x.p,x.p.daily)} dziennie${x.p.ended?" (zakończony)":""}</span><span class="num">regularność ${x.pct}%</span></div>`).join("")}
      ${Object.keys(st.avg).map(n=>`<div><span>${esc(NUTR[n].name)}: średnio dziennie z suplementów i leków</span><span class="num">${fmt(st.avg[n])} ${NUTR[n].unit}</span></div>`).join("")}</div>`:`<div class="pmeta">Bez produktów w planie.</div>`}
    ${anyAfter?`<div class="fieldset"><div class="pname">Przed i po: co dalej?</div>
      <div class="pmeta">Decyzję podejmujesz Ty, najlepiej z lekarzem. Wassup porównuje wyniki z Twoim celem, ale ich nie interpretuje.</div>
      ${metProds.map(({p,it})=>`<div class="note ok">${esc(it.name)} jest w celu. <b>Czy nadal potrzebujesz produktu ${esc(p.name)}?</b> Jeśli nie, zakończ go: historia zostanie.<div class="btns" style="margin-top:8px"><button class="btn sec" data-act="end" data-id="${p.id}">Kończę z ${esc(p.name)}</button></div></div>`).join("")}
      <div class="btns"><button class="btn" data-act="period-renew">Nowy okres</button><button class="btn sec" data-act="period-close">Zakończ okres</button></div></div>`:""}
    <div class="btns">${P.items[0]?`<button class="btn sec" data-act="lab-add" data-k="${esc(P.items[0].m)}">Wpisz wynik kontrolny</button>`:""}<button class="btn sec" data-act="period-ics">Dodaj do kalendarza</button><button class="btn sec" data-act="period-edit">Edytuj</button>${!anyAfter?`<button class="link small" data-act="period-close">Zakończ okres</button>`:""}</div>
  </div>`;
}

/* --- Uwaga na ekranie Dziś --- */
function periodAttention(){
  const P=activePeriod(); if(!P||!S.prefs.labsMode) return [];
  const left=Math.round((parseKey(P.testDate)-parseKey(today()))/864e5), anyAfter=P.items.some(it=>afterOf(it,P));
  if(anyAfter) return [`<div class="att stock"><div><b>Masz nowy wynik w okresie do badania kontrolnego.</b> Porównaj go z celem i zdecyduj, co dalej z planem.</div><div class="btns"><button class="btn sec" data-act="go-labs">Przed i po</button></div></div>`];
  if(left>7) return [];
  const head= left>0?`Badanie kontrolne za ${left} ${plural(left,["dzień","dni","dni"])} (${esc(fullDate(P.testDate))}).`: left===0?"Badanie kontrolne dziś.":`Termin badania kontrolnego minął (${esc(fullDate(P.testDate))}).`;
  const bio=live().some(p=>p.content.bio)?" Bierzesz biotynę: powiedz o niej w laboratorium, bo może zakłócać niektóre wyniki.":"";
  return [`<div class="att stock"><div><b>${head}</b> ${left>=0?"Umów się, jeśli jeszcze tego nie zrobiłeś.":"Gdy będziesz mieć wynik, wpisz go w Badaniach."}${bio}</div><div class="btns"><button class="btn sec" data-act="go-labs">Badania</button></div></div>`];
}

/* --- formularz okresu --- */
let PF=null;
function periodForm(mode){
  const P=activePeriod(), groups=labGroups();
  if(mode==="edit" && P){ PF={id:P.id,start:P.start,testDate:P.testDate,doctor:!!P.doctor,note:P.note||"",items:{},products:{}};
    P.items.forEach(it=>{ PF.items[it.k]={on:true,src:it.src,lo:it.lo!=null?String(it.lo).replace(".",","):"",hi:it.hi!=null?String(it.hi).replace(".",","):""}; }); P.products.forEach(id=>PF.products[id]=true); }
  else {
    const src=mode==="renew"&&P?P:null;
    const lastAfter=src?src.items.map(it=>afterOf(it,src)).filter(Boolean).map(l=>l.date).sort().pop():null;
    const start=lastAfter||(groups[0]?groups[0][0].date:today());
    const span=src?Math.max(7,Math.round((parseKey(src.testDate)-parseKey(src.start))/864e5)):91;
    PF={id:null,start,testDate:addDays(start,span),doctor:src?!!src.doctor:false,note:src?src.note||"":"",items:{},products:{},renewOf:src?src.id:null};
    if(src){ src.items.forEach(it=>{ PF.items[it.k]={on:true,src:it.src,lo:it.lo!=null?String(it.lo).replace(".",","):"",hi:it.hi!=null?String(it.hi).replace(".",","):""}; }); src.products.forEach(id=>{ const p=S.products.find(x=>x.id===id); if(p&&!p.ended) PF.products[id]=true; }); }
    else if(groups[0]){ const l=groups[0][0], n=(MK[l.m]||{}).n; PF.items[labKey(l)]={on:true,src:(l.lo!=null||l.hi!=null)?"lab":"doctor",lo:"",hi:""}; live().forEach(p=>{ if(n&&p.content[n]) PF.products[p.id]=true; }); }
  }
  periodSheet();
}
function pfItems(){ return labGroups().map(arr=>({k:labKey(arr[0]),l:arr[0]})); }
function periodSheet(){
  const items=pfItems();
  if(!items.length){ sheet("Okres do badania",`<div class="pmeta">Najpierw dodaj wynik badania, od którego zaczynasz.</div><button class="btn full" data-act="lab-add">Dodaj wynik</button>`); return; }
  const span=Math.round((parseKey(PF.testDate)-parseKey(PF.start))/864e5);
  sheet(PF.id?"Edytuj okres":"Nowy okres",`
    <div class="f-row"><label class="f">Początek okresu<input id="pf-start" type="date" value="${esc(PF.start)}"></label><label class="f">Badanie kontrolne<input id="pf-test" type="date" value="${esc(PF.testDate)}"></label></div>
    <div class="seg" role="group" aria-label="Długość okresu">${[[42,"6 tyg."],[91,"3 mies."],[182,"6 mies."]].map(([d,t])=>`<button data-act="pf-quick" data-d="${d}" class="${Math.abs(span-d)<=2?"on":""}">${t}</button>`).join("")}</div>
    <div class="fieldset"><div class="pname">Cele</div><div class="pmeta">Cel ustawiasz Ty: zakres z wydruku laboratorium albo wartość, którą podał lekarz. Wassup nie podpowiada celów.</div>
    ${items.map(({k,l},i)=>{ const f=PF.items[k]||{on:false,src:"lab",lo:"",hi:""}, hasRange=l.lo!=null||l.hi!=null, src=hasRange?f.src:"doctor";
      return `<div class="pfitem"><label class="chkrow"><input type="checkbox" data-pf-on="${i}" ${f.on?"checked":""}><span><b>${esc(labName(l))}</b><br><span class="pmeta">ostatnio ${fmt(l.value,2)} ${esc(l.unit)} (${esc(fullDate(l.date))})</span></span></label>
        ${f.on?`<div class="seg" role="group" aria-label="Źródło celu">${[["lab","Zakres z wydruku"],["doctor","Od lekarza"]].map(([v,t])=>`<button data-act="pf-src" data-i="${i}" data-v="${v}" class="${src===v?"on":""}" ${v==="lab"&&!hasRange?"disabled":""}>${t}</button>`).join("")}</div>
          ${src==="lab"?`<div class="pmeta">Cel: ${esc(rangeText(l))} (z wyniku z ${esc(fullDate(l.date))})</div>`:`${!hasRange?`<div class="pmeta">Ten wynik nie ma zakresu z wydruku, więc wpisz cel od lekarza.</div>`:""}<div class="f-row"><label class="f">Od (${esc(l.unit)})<input data-pf-lo="${i}" inputmode="decimal" value="${esc(f.lo)}"></label><label class="f">Do (${esc(l.unit)})<input data-pf-hi="${i}" inputmode="decimal" value="${esc(f.hi)}"></label></div>`}`:""}
      </div>`; }).join("")}</div>
    <div class="fieldset"><div class="pname">Plan: co bierzesz w tym okresie</div>
      ${live().length?live().map(p=>`<label class="chkrow"><input type="checkbox" data-pf-prod="${p.id}" ${PF.products[p.id]?"checked":""}><span><b>${esc(p.name)}</b><br><span class="pmeta">${fmt(p.daily)} ${unitWord(p,p.daily)} dziennie · ${doseText(p,p.daily)}</span></span></label>`).join(""):`<div class="pmeta">Apteczka jest pusta.</div>`}
      <div class="pmeta">Porcję zmienisz w Apteczce.</div></div>
    <label class="switchrow card"><span class="grow"><span class="pname">Plan ustalony z lekarzem</span><span class="pmeta" style="display:block">Wtedy przy dawce powyżej granicy bezpieczeństwa Wassup przypomni, żeby stosować ją tylko pod kontrolą lekarza, zamiast ostrzegać jak przy planie własnym.</span></span><input type="checkbox" id="pf-doctor" class="switch" ${PF.doctor?"checked":""}></label>
    <label class="f">Notatka (opcjonalnie)<input id="pf-note" value="${esc(PF.note)}" placeholder="np. zalecenie z wizyty 10.10" autocomplete="off"></label>
    <button class="btn full" data-act="pf-save">Zapisz okres</button>
    ${PF.id?`<button class="btn danger full" data-act="period-del">Usuń ten okres</button>`:""}
    <p class="src">Wassup śledzi Twój plan i porównuje wyniki z celem, który ustawisz. Nie wylicza dawek i nie prognozuje wyników.</p>`);
}
function readPF(){
  const g=id=>{ const el=document.getElementById(id); return el?el.value:null; };
  const s=g("pf-start"), t=g("pf-test"); if(s) PF.start=s; if(t) PF.testDate=t;
  const d=document.getElementById("pf-doctor"); if(d) PF.doctor=d.checked;
  const nt=g("pf-note"); if(nt!=null) PF.note=nt;
  const items=pfItems();
  document.querySelectorAll("[data-pf-on]").forEach(el=>{ const k=items[+el.dataset.pfOn].k; PF.items[k]=PF.items[k]||{src:"lab",lo:"",hi:""}; PF.items[k].on=el.checked; });
  document.querySelectorAll("[data-pf-lo]").forEach(el=>{ PF.items[items[+el.dataset.pfLo].k].lo=el.value; });
  document.querySelectorAll("[data-pf-hi]").forEach(el=>{ PF.items[items[+el.dataset.pfHi].k].hi=el.value; });
  document.querySelectorAll("[data-pf-prod]").forEach(el=>{ PF.products[el.dataset.pfProd]=el.checked; });
}
function periodSave(){
  readPF();
  if(!PF.start||!PF.testDate){ toast("Podaj obie daty"); return false; }
  if(PF.testDate<=PF.start){ toast("Badanie kontrolne musi być po początku okresu"); return false; }
  const out=[];
  for(const {k,l} of pfItems()){ const f=PF.items[k]; if(!f||!f.on) continue; const hasRange=l.lo!=null||l.hi!=null, src=hasRange?f.src:"doctor";
    let lo,hi; if(src==="lab"){ lo=l.lo; hi=l.hi; } else { lo=parseNum(f.lo); hi=parseNum(f.hi); if(lo==null&&hi==null){ toast(`Wpisz cel dla: ${labName(l)}`); return false; } if(lo!=null&&hi!=null&&lo>=hi){ toast("Dolna granica celu musi być mniejsza od górnej"); return false; } }
    out.push({k,m:l.m,name:labName(l),unit:l.unit,lo:lo??null,hi:hi??null,src}); }
  if(!out.length){ toast("Wybierz przynajmniej jeden cel"); return false; }
  const products=Object.keys(PF.products).filter(id=>PF.products[id]&&S.products.some(p=>p.id===id));
  S.periods=S.periods||[];
  if(PF.renewOf){ const old=S.periods.find(p=>p.id===PF.renewOf); if(old&&!old.closed) old.closed={date:PF.start<=today()?PF.start:today(),decision:"renew"}; }
  let P=PF.id?S.periods.find(p=>p.id===PF.id):null; if(!P){ P={id:uid(),created:today()}; S.periods.push(P); }
  Object.assign(P,{start:PF.start,testDate:PF.testDate,items:out,products,doctor:PF.doctor,note:(PF.note||"").trim()});
  save(); return true;
}
function periodICS(){
  const P=activePeriod(); if(!P) return;
  const d=P.testDate.replace(/-/g,""), d2=addDays(P.testDate,1).replace(/-/g,""), stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z");
  const desc=`Cele: ${P.items.map(it=>it.name+" "+goalText(it)).join("; ")}. Wpisz wynik w Wassup (zakładka Badania).`.replace(/[,;]/g,m=>"\\"+m);
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wassup//PL","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:wassup-${P.id}@dawidrd.github.io`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${d}`,`DTEND;VALUE=DATE:${d2}`,"SUMMARY:Badanie kontrolne (Wassup)",`DESCRIPTION:${desc}`,"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Badanie kontrolne","TRIGGER:-P2DT15H","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const file=new File([ics],"badanie-kontrolne.ics",{type:"text/calendar"});
  (async()=>{ try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:"Badanie kontrolne"}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
    const a=document.createElement("a"); a.href=URL.createObjectURL(file); a.download="badanie-kontrolne.ics"; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500); })();
}
function periodAct(act,a){
  if(act==="period-new"){ closeSheet(); periodForm("new"); return true; }
  if(act==="period-edit"){ closeSheet(); periodForm("edit"); return true; }
  if(act==="period-renew"){ periodForm("renew"); return true; }
  if(act==="pf-quick"){ readPF(); PF.testDate=addDays(PF.start,+a.dataset.d); periodSheet(); return true; }
  if(act==="pf-src"){ readPF(); const k=pfItems()[+a.dataset.i].k; PF.items[k].src=a.dataset.v; periodSheet(); return true; }
  if(act==="pf-save"){ if(periodSave()){ closeSheet(); TAB="labs"; render(); toast("Zapisano okres"); } return true; }
  if(act==="period-close"){ const P=activePeriod(); if(P){ P.closed={date:today(),decision:"close"}; save(); render(); toast("Okres zakończony"); } return true; }
  if(act==="period-del"){ const id=PF&&PF.id; S.periods=(S.periods||[]).filter(p=>p.id!==id); save(); closeSheet(); render(); toast("Usunięto okres"); return true; }
  if(act==="period-ics"){ periodICS(); return true; }
  return false;
}
function periodChange(el){
  if(el.dataset && el.dataset.pfOn!=null){ readPF(); periodSheet(); return true; }
  return false;
}
