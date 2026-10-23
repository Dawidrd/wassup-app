/* ============ Badania (tryb „Mam badania”) ============ */
// units: przelicznik z pierwszej (bazowej) jednostki: wartość_w_jednostce = wartość_bazowa × czynnik
const MARKERS = [
  { m:"d25",  name:"Witamina D (25(OH)D)", n:"d",   units:{"ng/ml":1,"nmol/l":2.496},
    note:"25(OH)D to najlepszy wskaźnik zapasów witaminy D. Latem skóra wytwarza ją pod wpływem słońca, więc wynik zmienia się z porą roku. Porównując dwa wyniki, pamiętaj, z jakiego miesiąca pochodzą." },
  { m:"ferr", name:"Ferrytyna",            n:"fe",  units:{"ng/ml":1,"µg/l":1},
    note:"Ferrytyna pokazuje zapasy żelaza. Infekcja albo stan zapalny mogą ją podnieść, dlatego lekarz ocenia ją razem z innymi badaniami (np. morfologią)." },
  { m:"fe",   name:"Żelazo w surowicy",    n:"fe",  units:{"µg/dl":1,"µmol/l":0.179},
    note:"Stężenie żelaza zmienia się w ciągu dnia i po posiłkach. Samo w sobie mówi niewiele, zwykle ocenia się je razem z ferrytyną." },
  { m:"b12",  name:"Witamina B12",         n:"b12", units:{"pg/ml":1,"pmol/l":0.738},
    note:"Wynik w dolnej części zakresu bywa niejednoznaczny. Lekarz może wtedy zlecić dodatkowe badanie." },
  { m:"fol",  name:"Kwas foliowy (foliany)", n:"fol", units:{"ng/ml":1,"nmol/l":2.266},
    note:"Stężenie folianów w surowicy w dużej mierze odzwierciedla to, co jadłeś w ostatnich dniach." },
  { m:"mg",   name:"Magnez w surowicy",    n:"mg",  units:{"mmol/l":1,"mg/dl":2.431},
    note:"We krwi jest ok. 1% magnezu z całego organizmu, a organizm utrzymuje jego stężenie w wąskim zakresie. Wynik w zakresie niewiele mówi o zapasach magnezu." },
  { m:"zn",   name:"Cynk",                 n:"zn",  units:{"µg/dl":1,"µmol/l":0.153},
    note:"Stężenie cynku we krwi słabo odzwierciedla jego zapasy i spada m.in. przy infekcji." },
  { m:"ca",   name:"Wapń całkowity",       n:"ca",  units:{"mmol/l":1,"mg/dl":4.008},
    note:"Organizm utrzymuje poziom wapnia we krwi bardzo stabilnie, więc wynik nie pokazuje, ile wapnia jest w diecie." },
  { m:"other", name:"Inny parametr", n:null, units:null }
];
const MK = Object.fromEntries(MARKERS.map(x=>[x.m,x]));
const LST = { low:{c:"warn",t:"Poniżej zakresu"}, in:{c:"ok",t:"W zakresie"}, high:{c:"bad",t:"Powyżej zakresu"}, none:{c:"none",t:"Bez zakresu"} };

function labName(l){ return l.m==="other" ? (l.name||"Inny parametr") : (MK[l.m]||{}).name || l.name || "Badanie"; }
function labKey(l){ return l.m==="other" ? "other:"+fNorm(l.name||"") : l.m; }
function labFlag(l){
  const has=l.lo!=null||l.hi!=null;
  if(has){ if(l.lo!=null && l.value<l.lo) return "low"; if(l.hi!=null && l.value>l.hi) return "high"; return "in"; }
  return l.flag||"none";
}
function rangeText(l){
  if(l.lo!=null && l.hi!=null) return `${fmt(l.lo,2)}–${fmt(l.hi,2)} ${l.unit}`;
  if(l.lo!=null) return `powyżej ${fmt(l.lo,2)} ${l.unit}`;
  if(l.hi!=null) return `poniżej ${fmt(l.hi,2)} ${l.unit}`;
  return "";
}
function convert(m,v,from,to){ if(from===to) return v; const u=(MK[m]||{}).units; if(!u||!u[from]||!u[to]) return null; return v/u[from]*u[to]; }
function labGroups(){
  const g={};
  for(const l of S.labs){ const k=labKey(l); (g[k]=g[k]||[]).push(l); }
  return Object.values(g).map(arr=>arr.sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0))).sort((a,b)=>b[0].date.localeCompare(a[0].date));
}
function activeWith(n){ return n ? live().filter(p=>p.daily>0 && p.content[n]) : []; }
function ago(k){ const d=Math.round((parseKey(today())-parseKey(k))/864e5); if(d<=0) return "dziś"; if(d===1) return "wczoraj"; if(d<14) return `${d} dni temu`; if(d<60) return `${Math.round(d/7)} tyg. temu`; const mo=Math.round(d/30.4); return mo<12?`${mo} mies. temu`:`ponad rok temu`; }
function fullDate(k){ return parseKey(k).toLocaleDateString("pl-PL",{day:"numeric",month:"short",year:"numeric"}); }

/* --- alerty bezpieczeństwa (Badania + Dziś) --- */
function labAlerts(){
  const out=[];
  for(const arr of labGroups()){ const l=arr[0], mk=MK[l.m]||{}, f=labFlag(l), prods=activeWith(mk.n);
    if(f==="high" && prods.length) out.push({kind:"high",l,html:`<b>${esc(labName(l))}: wynik powyżej zakresu</b> (${esc(fullDate(l.date))}), a w Apteczce masz produkt z tym składnikiem: ${prods.map(p=>esc(p.name)).join(", ")}. Pokaż ten wynik lekarzowi, zanim przyjmiesz kolejne dawki.`});
    else if(f==="low") out.push({kind:"low",l,html:`<b>${esc(labName(l))}: wynik poniżej zakresu</b> (${esc(fullDate(l.date))}). Taki wynik warto omówić z lekarzem: przyczyną nie zawsze jest dieta, a dawkę dobiera lekarz.`});
  }
  return out;
}
function todayLabAlert(){
  const a=labAlerts().filter(x=>x.kind==="high"); if(!a.length) return "";
  return a.map(x=>`<div class="note warn" role="alert">${x.html} <button class="link" data-act="go-labs">Badania</button></div>`).join("");
}

/* --- widok --- */
function viewLabs(){
  const groups=labGroups(), alerts=labAlerts();
  return `<section class="screen">
  <div class="head"><div><div class="sub">Wyniki z laboratorium</div><h1>Badania</h1></div><button class="btn" data-act="lab-add">Dodaj</button></div>
  ${!groups.length?`<div class="card empty"><div class="pname" style="color:var(--ink)">Przepisz wynik z wydruku</div>
    <div style="margin-top:6px">Wybierz badanie, wpisz wynik, jednostkę i zakres referencyjny z wydruku. Wassup pokaże, czy wynik jest w tym zakresie, i zapamięta go, żeby porównać z kolejnym badaniem.</div>
    <button class="btn" style="margin-top:14px" data-act="lab-add">Dodaj wynik</button></div>`:""}
  ${alerts.map(x=>`<div class="note ${x.kind==="high"?"warn":""}">${x.html}</div>`).join("")}
  ${periodBlock()}
  ${groups.length||S.products.length?`<button class="card reprow" data-act="rep-open"><div class="grow"><div class="pname">Raport dla lekarza</div><div class="pmeta">Wyniki, plan, regularność i dawki na jednej stronie</div></div><span class="pmeta">›</span></button>`:""}
  ${groups.length?`<div class="section-t">Wyniki</div>`:""}
  ${groups.map(labCard).join("")}
  <p class="src" style="padding:0 4px">Wassup porównuje wynik tylko z zakresem z Twojego wydruku. Nie stawia diagnozy i nie dobiera dawek: o tym decyduje lekarz. Laboratoria mają różne zakresy i jednostki, dlatego zawsze przepisuj zakres z tego samego wydruku.</p>
  </section>`;
}
function labCard(arr){
  const l=arr[0], f=labFlag(l), st=LST[f], prev=arr[1];
  let delta="";
  if(prev){ const pv=convert(l.m,prev.value,prev.unit,l.unit); if(pv!=null){ const d=l.value-pv; delta=`<div class="pmeta">Poprzednio ${fmt(pv,2)} ${esc(l.unit)} (${esc(fullDate(prev.date))}) · zmiana ${d>0?"+":d<0?"−":"±"}${fmt(Math.abs(d),2)} ${esc(l.unit)}</div>`; } }
  const old=(parseKey(today())-parseKey(l.date))/864e5>183;
  return `<button class="card labcard" data-act="lab-open" data-k="${esc(labKey(l))}" aria-label="${esc(labName(l))}: szczegóły">
    <div class="ntop"><div><div class="nname">${l.m!=="other"&&MK[l.m].n?sym(MK[l.m].n):""}${esc(labName(l))}</div>
      <div style="margin-top:8px" class="big num">${fmt(l.value,2)}<small>${esc(l.unit)}</small></div>
      <div class="pmeta">${esc(fullDate(l.date))} · ${ago(l.date)}${old?" · wynik ma ponad pół roku":""}</div></div>
      <span class="chip ${st.c}">${st.t}</span></div>
    ${rangeBar(l)}
    ${arr.length>1?trendSVG(arr):""}
    ${delta}
  </button>`;
}
function rangeBar(l){
  if(l.lo==null && l.hi==null) return `<div class="pmeta">${l.flag&&l.flag!=="none"?"Oznaczenie przepisane z wydruku (bez liczbowego zakresu).":"Bez zakresu z wydruku. Dopisz go, żeby zobaczyć wynik na tle zakresu."}</div>`;
  const top=Math.max((l.hi!=null?l.hi:l.lo)*1.35, l.value*1.12, l.lo!=null?l.lo*1.6:0);
  const p=x=>Math.max(0,Math.min(100,x/top*100));
  const a=l.lo!=null?p(l.lo):0, b=l.hi!=null?p(l.hi):100, v=p(l.value), f=labFlag(l);
  return `<div class="rbar" role="img" aria-label="Wynik ${fmt(l.value,2)} ${esc(l.unit)}, zakres z wydruku ${esc(rangeText(l))}">
    <div class="rtrack"></div><div class="rband" style="left:${a}%;width:${b-a}%"></div>
    <i class="rdot ${f}" style="left:${v}%"></i>
    ${l.lo!=null?`<span class="rlab" style="left:${a}%">${fmt(l.lo,2)}</span>`:""}${l.hi!=null?`<span class="rlab" style="left:${b}%">${fmt(l.hi,2)}</span>`:""}
  </div><div class="pmeta">Zakres z wydruku: ${esc(rangeText(l))}</div>`;
}
function trendSVG(arr){
  const unit=arr[0].unit, pts=arr.slice().reverse().map(x=>({d:x.date,v:convert(x.m,x.value,x.unit,unit),f:labFlag(x)})).filter(x=>x.v!=null);
  if(pts.length<2) return "";
  const l=arr[0], W=320,H=120,L=8,R=8,T=12,B=22,pw=W-L-R,ph=H-T-B;
  const pv=pts.map(p=>p.v), pmax=Math.max(...pv), vals=pv.concat([l.lo,l.hi].filter(x=>x!=null && x<=pmax*1.6));
  let lo=Math.min(...vals), hi=Math.max(...vals); const pad=(hi-lo||hi||1)*0.18; lo=Math.max(0,lo-pad); hi=hi+pad;
  const t0=parseKey(pts[0].d).getTime(), t1=parseKey(pts[pts.length-1].d).getTime(), span=Math.max(1,t1-t0);
  const x=d=>L+(parseKey(d).getTime()-t0)/span*pw, y=v=>T+ph-(v-lo)/(hi-lo)*ph;
  let s=`<svg class="trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Wyniki w czasie: ${pts.map(p=>fmt(p.v,2)+" "+unit+" ("+fullDate(p.d)+")").join(", ")}">`;
  if(l.lo!=null||l.hi!=null){ const ya=y(l.hi!=null?Math.min(l.hi,hi):hi), yb=y(l.lo!=null?Math.max(l.lo,lo):lo); s+=`<rect x="${L}" y="${ya}" width="${pw}" height="${Math.max(0,yb-ya)}" fill="var(--ok)" opacity=".13" rx="4"/>`; }
  s+=`<polyline fill="none" stroke="var(--muted)" stroke-width="1.5" points="${pts.map(p=>x(p.d)+","+y(p.v)).join(" ")}"/>`;
  pts.forEach((p,i)=>{ const cx=x(p.d), cy=y(p.v), last=i===pts.length-1;
    s+=`<circle cx="${cx}" cy="${cy}" r="${last?5:4}" class="tdot ${p.f}"/>`;
    s+=`<text x="${cx}" y="${cy-9}" text-anchor="${i===0?"start":last?"end":"middle"}" font-size="10.5" font-weight="${last?700:500}" fill="var(--ink)">${fmt(p.v,1)}</text>`;
    if(i===0||last) s+=`<text x="${cx}" y="${H-6}" text-anchor="${i===0?"start":"end"}" font-size="10" fill="var(--muted)">${esc(shortDate(p.d))} ${String(parseKey(p.d).getFullYear()).slice(2)}</text>`; });
  return s+"</svg>";
}

/* --- arkusz szczegółów --- */
function labDetail(k){
  const arr=labGroups().find(a=>labKey(a[0])===k); if(!arr) return;
  const l=arr[0], mk=MK[l.m]||{}, n=mk.n, prods=activeWith(n);
  sheet(labName(l),`
    ${mk.note?`<div class="note">${esc(mk.note)}</div>`:""}
    <div class="pname">Wszystkie wyniki</div>
    <div class="list">${arr.map(x=>{ const st=LST[labFlag(x)]; return `<button class="row" style="width:100%;text-align:left" data-act="lab-edit" data-id="${x.id}">
      <div class="grow"><div class="pname num">${fmt(x.value,2)} ${esc(x.unit)}</div><div class="pmeta">${esc(fullDate(x.date))}${rangeText(x)?" · zakres "+esc(rangeText(x)):""}</div></div>
      <span class="chip ${st.c}">${st.t}</span></button>`; }).join("")}</div>
    ${n?`<div class="pname">Z czym to się łączy w Wassup</div>
      <div class="cmp">
        <div><span>W Apteczce z tym składnikiem</span><span>${prods.length?prods.map(p=>esc(p.name)).join(", "):"nic"}</span></div>
        ${S.diet&&!NOT_FROM_DIET[n]&&S.diet.intake[n]?`<div><span>Z diety (szacunek)</span><span class="num">ok. ${fmt(S.diet.intake[n],0)} ${NUTR[n].unit}/dzień</span></div>`:""}
      </div>
      ${SOURCES[n]?`<div class="pmeta"><b>Źródła w diecie:</b> ${esc(SOURCES[n])}.</div>`:NOT_FROM_DIET[n]?`<div class="pmeta">${esc(NOT_FROM_DIET[n])}</div>`:""}`:""}
    <button class="btn full" data-act="lab-add" data-k="${esc(l.m)}">Dodaj nowszy wynik</button>
    <p class="src">Wassup nie interpretuje wyników. Co dalej z suplementacją, ustal z lekarzem.</p>`);
}

/* --- formularz wyniku --- */
let LF=null;
function labForm(id,preset){
  const e=id?S.labs.find(x=>x.id===id):null;
  if(e) LF={id:e.id,m:e.m,name:e.name||"",date:e.date,value:String(e.value).replace(".",","),unit:e.unit,lo:e.lo!=null?String(e.lo).replace(".",","):"",hi:e.hi!=null?String(e.hi).replace(".",","):"",flag:e.flag||"none"};
  else { const m=preset&&MK[preset]?preset:"d25"; LF={id:null,m,name:"",date:today(),value:"",unit:"",lo:"",hi:"",flag:"none"}; prefillRange(); }
  labSheet();
}
function prefillRange(){
  const mk=MK[LF.m]; if(mk.units && !mk.units[LF.unit]) LF.unit=Object.keys(mk.units)[0];
  if(LF.id) return;
  const prev=S.labs.filter(x=>x.m===LF.m && (LF.m!=="other") && x.unit===LF.unit && (x.lo!=null||x.hi!=null)).sort((a,b)=>b.date.localeCompare(a.date))[0];
  LF.lo=prev&&prev.lo!=null?String(prev.lo).replace(".",","):""; LF.hi=prev&&prev.hi!=null?String(prev.hi).replace(".",","):""; LF.prefilled=!!prev;
}
function readLF(){ const g=id=>{ const el=document.getElementById(id); return el?el.value:null; };
  for(const [k,id] of [["m","lf-m"],["name","lf-name"],["date","lf-date"],["value","lf-val"],["unit","lf-unit"],["lo","lf-lo"],["hi","lf-hi"]]){ const v=g(id); if(v!=null) LF[k]=v; } }
function lfPreview(){
  const v=parseNum(LF.value), lo=parseNum(LF.lo), hi=parseNum(LF.hi);
  if(lo==null && hi==null) return `<div class="pname">Jak laboratorium oznaczyło wynik?</div>
    <div class="pmeta">Jeśli na wydruku nie ma zakresu, przepisz oznaczenie (np. „L”, „H”, strzałka albo pogrubienie).</div>
    <div class="seg" role="group" aria-label="Oznaczenie z wydruku">${[["low","Poniżej"],["in","W normie"],["high","Powyżej"],["none","Brak"]].map(([f,t])=>`<button data-lf-flag="${f}" class="${LF.flag===f?"on":""}">${t}</button>`).join("")}</div>`;
  if(v==null) return `<div class="pmeta">Wpisz wynik, a zobaczysz go na tle zakresu.</div>`;
  if(lo!=null && hi!=null && lo>=hi) return `<div class="pmeta" style="color:var(--bad)">Dolna granica musi być mniejsza od górnej.</div>`;
  const st=LST[labFlag({value:v,lo,hi})];
  return `<div class="lfprev"><span>Według zakresu z wydruku:</span><span class="chip ${st.c}">${st.t}</span></div>`;
}
function labSheet(){
  const mk=MK[LF.m], units=mk.units?Object.keys(mk.units):null, bio=activeWith("bio");
  sheet(LF.id?"Edytuj wynik":"Dodaj wynik",`
    <label class="f">Badanie<select id="lf-m">${MARKERS.map(x=>`<option value="${x.m}" ${x.m===LF.m?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
    ${LF.m==="other"?`<label class="f">Nazwa badania<input id="lf-name" value="${esc(LF.name)}" placeholder="np. Selen" autocomplete="off"></label>`:""}
    <div class="f-row"><label class="f">Data badania<input id="lf-date" type="date" max="${today()}" value="${esc(LF.date)}"></label>
      <label class="f">Wynik<input id="lf-val" inputmode="decimal" value="${esc(LF.value)}" placeholder="z wydruku"></label></div>
    <label class="f">Jednostka${units?`<select id="lf-unit">${units.map(u=>`<option ${u===LF.unit?"selected":""}>${u}</option>`).join("")}</select>`:`<input id="lf-unit" value="${esc(LF.unit)}" placeholder="np. µg/l" autocomplete="off">`}</label>
    <div class="fieldset"><div class="pname">Zakres referencyjny z wydruku</div>
      <div class="pmeta">Przepisz z kolumny „Zakres referencyjny”, „Wartości prawidłowe” albo „Norma”. Jeśli jest tylko jedna granica (np. „&gt; 30”), wpisz tylko ją.${LF.prefilled?" Uzupełniliśmy go z Twojego poprzedniego wyniku: sprawdź, czy się zgadza.":""}</div>
      <div class="f-row"><label class="f">Od<input id="lf-lo" inputmode="decimal" value="${esc(LF.lo)}"></label><label class="f">Do<input id="lf-hi" inputmode="decimal" value="${esc(LF.hi)}"></label></div>
      <div id="lf-prev">${lfPreview()}</div></div>
    ${bio.length?`<div class="note">${esc(NUTR.bio.warn)}</div>`:""}
    <button class="btn full" data-act="lab-save">Zapisz</button>
    ${LF.id?`<button class="btn danger full" data-act="lab-del" data-id="${LF.id}">Usuń ten wynik</button>`:""}
    <p class="src">Wassup porównuje wynik z zakresem, który wpiszesz. Nie podpowiada zakresów, bo każde laboratorium ma własne.</p>`);
}
function labSave(){
  readLF();
  const v=parseNum(LF.value), lo=parseNum(LF.lo), hi=parseNum(LF.hi), unit=(LF.unit||"").trim(), name=(LF.name||"").trim();
  if(LF.m==="other" && !name){ toast("Wpisz nazwę badania"); return false; }
  if(!LF.date){ toast("Podaj datę badania"); return false; }
  if(LF.date>today()){ toast("Data badania nie może być z przyszłości"); return false; }
  if(v==null || v<0){ toast("Wpisz wynik z wydruku"); return false; }
  if(!unit){ toast("Podaj jednostkę"); return false; }
  if(lo!=null && hi!=null && lo>=hi){ toast("Dolna granica zakresu musi być mniejsza od górnej"); return false; }
  let e=LF.id?S.labs.find(x=>x.id===LF.id):null; if(!e){ e={id:uid(),ts:Date.now()}; S.labs.push(e); }
  Object.assign(e,{ m:LF.m, n:(MK[LF.m]||{}).n||null, name:LF.m==="other"?name:undefined, date:LF.date, value:v, unit, lo, hi, flag:(lo==null&&hi==null)?LF.flag:undefined });
  S.prefs.labsMode=true; save(); return true;
}
function labsMigrate(s){
  (s.labs||[]).forEach(l=>{ if(!l.id) l.id=uid(); if(!l.m) l.m = l.n==="d"?"d25":"other"; if(l.lo===undefined) l.lo=null; if(l.hi===undefined) l.hi=null; });
  if(s.labs && s.labs.length && s.prefs && s.prefs.labsMode==null) s.prefs.labsMode=true;
}
