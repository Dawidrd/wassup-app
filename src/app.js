"use strict";
/* ============ Dane referencyjne (źródła: baza regulacyjna Wassup) ============
   RWS: rozp. 1169/2011 zał. XIII · normy i UL: Normy żywienia dla populacji Polski 2024 (NIZP PZH–PIB)
   limity GIS: uchwały Zespołu ds. Suplementów Diety · oświadczenia: rozp. 432/2012 */
const APP_VERSION = "0.9.1";
const CLAIMS = __CLAIMS__;
const NUTR = {
  mg:  { name:"Magnez", sym:"Mg", unit:"mg", rws:375, ul:250,
         ulNote:"UL magnezu (250 mg) dotyczy tylko magnezu z suplementów, wody i żywności wzbogacanej, nie z jedzenia." },
  d:   { name:"Witamina D", sym:"D", unit:"µg", rws:5, ul:100, iu:40,
         ulNote:"UL witaminy D (100 µg = 4000 IU) obejmuje dietę i suplementy razem. Synteza w skórze ze słońca się do niego nie wlicza." },
  b6:  { name:"Witamina B6", sym:"B6", unit:"mg", rws:1.4, ul:12, ulNote:"UL witaminy B6 (12 mg) obejmuje wszystkie źródła." },
  c:   { name:"Witamina C", sym:"C", unit:"mg", rws:80, ul:null,
         ulNote:"Dla witaminy C nie ustalono górnego tolerowanego poziomu spożycia.",
         warn:"GIS rekomenduje przy wysokich dawkach ostrzeżenie: nie stosować u osób z predyspozycją do kamicy nerkowej." },
  zn:  { name:"Cynk", sym:"Zn", unit:"mg", rws:10, ul:25, ulNote:"UL cynku (25 mg) obejmuje wszystkie źródła." },
  b12: { name:"Witamina B12", sym:"B12", unit:"µg", rws:2.5, ul:null, ulNote:"Dla witaminy B12 nie ustalono górnego tolerowanego poziomu spożycia." },
  fe:  { name:"Żelazo", sym:"Fe", unit:"mg", rws:14, ul:40, ulNote:"40 mg to bezpieczny poziom spożycia żelaza przyjęty w Normach 2024.",
         warn:"Dla kobiet w ciąży GIS dopuszcza do 30 mg z ostrzeżeniem: stosować po konsultacji z lekarzem." },
  fol: { name:"Kwas foliowy", sym:"B9", unit:"µg", rws:200, ul:1000, normFactor:1.7,
         ulNote:"UL (1000 µg) dotyczy syntetycznego kwasu foliowego z suplementów i żywności wzbogacanej.",
         normNote:"Norma jest podana w równoważniku folianów (DFE). 1 µg kwasu foliowego z suplementu to ok. 1,7 µg DFE i tak to przeliczamy." },
  ca:  { name:"Wapń", sym:"Ca", unit:"mg", rws:800, ul:2500, ulNote:"UL wapnia (2500 mg) obejmuje wszystkie źródła." },
  k:   { name:"Witamina K", sym:"vit K", unit:"µg", rws:75, ul:null, ulNote:"Dla witaminy K nie ustalono górnego tolerowanego poziomu spożycia.",
         warn:"GIS rekomenduje ostrzeżenie: produkt nie dla osób przyjmujących leki przeciwzakrzepowe z grupy antagonistów witaminy K (np. warfaryna, acenokumarol)." },
  se:  { name:"Selen", sym:"Se", unit:"µg", rws:55, ul:255, ulNote:"UL selenu (255 µg) obejmuje wszystkie źródła." },
  i:   { name:"Jod", sym:"I", unit:"µg", rws:150, ul:600, ulNote:"UL jodu (600 µg) obejmuje wszystkie źródła, także sól jodowaną." },
  bio: { name:"Biotyna", sym:"B7", unit:"µg", rws:50, ul:null,
         ulNote:"Dla biotyny nie ustalono górnego tolerowanego poziomu spożycia ani limitu GIS.",
         warn:"Wysokie dawki biotyny mogą zakłócać wyniki niektórych badań krwi (np. hormonów tarczycy). Przed badaniem powiedz o niej lekarzowi lub w laboratorium." },
  pot: { name:"Potas", sym:"K", unit:"mg", rws:2000, ul:null,
         ulNote:"Dla potasu nie ustalono UL. Większość potasu dostarczają warzywa i owoce.",
         warn:"Przy suplementach z ponad 1000 mg potasu dziennie GIS wymaga ostrzeżenia: produkt nie dla osób starszych, z chorobami nerek, cukrzycą insulinooporną, nadciśnieniem tętniczym lub zaburzeniami rytmu serca." },
  om3: { name:"Omega-3 (EPA+DHA)", sym:"Ω3", unit:"mg", rws:null, ul:null,
         ulNote:"Nie ustalono UL. EFSA uznała, że do 5 g EPA+DHA dziennie z suplementów nie budzi obaw o bezpieczeństwo.",
         normNote:"Wpisuj sumę EPA i DHA z tabeli składu, a nie masę oleju rybiego." }
};
const ORDER = ["mg","d","b6","c","zn","b12","fe","fol","ca","k","se","i","bio","pot","om3"];
// Normy żywienia 2024: RDA, dla wit. D, K i EPA+DHA: AI
const NB = { mg:400, d:15, b6:1.3, c:90, zn:11, b12:2.4, fe:10, fol:400, ca:1000, k:65, se:55, i:150, bio:40, pot:3500, om3:250 };
const NF = { mg:310, d:15, b6:1.3, c:75, zn:8,  b12:2.4, fe:18, fol:400, ca:1000, k:55, se:55, i:150, bio:40, pot:3500, om3:250 };
const NORMS = {
  m: { "19-30":{...NB}, "31-50":{...NB,mg:420}, "51-65":{...NB,mg:420,b6:1.7}, "66-75":{...NB,mg:420,b6:1.7,ca:1200}, "75+":{...NB,mg:420,b6:1.7,ca:1200} },
  f: { "19-30":{...NF}, "31-50":{...NF,mg:320}, "51-65":{...NF,mg:320,b6:1.5,fe:10,ca:1200}, "66-75":{...NF,mg:320,b6:1.5,fe:10,ca:1200}, "75+":{...NF,mg:320,b6:1.5,fe:10,ca:1200} },
  preg:{ mg:360, d:15, b6:1.9, c:85,  zn:11, b12:2.6, fe:27, fol:600, ca:1000, k:55, se:60, i:220, bio:40, pot:3500, om3:450 },
  lact:{ mg:320, d:15, b6:2.0, c:120, zn:12, b12:2.8, fe:10, fol:500, ca:1000, k:55, se:70, i:290, bio:45, pot:4000, om3:450 }
};
const AGES = ["19-30","31-50","51-65","66-75","75+"];
const UNITS = { kapsulka:["kapsułka","kapsułki","kapsułek","kapsułce"], tabletka:["tabletka","tabletki","tabletek","tabletce"], kropla:["kropla","krople","kropli","kropli"], saszetka:["saszetka","saszetki","saszetek","saszetce"], porcja:["porcja","porcje","porcji","porcji"] };
const CATALOG = [
  { cid:"allnutrition-magb6", name:"MAG B6", brand:"Allnutrition", type:"suplement", unit:"kapsulka", content:{mg:102,b6:0.7},
    form:"cytrynian magnezu (670 mg w kapsułce)", producerDaily:2, pack:30,
    info:"Na opakowaniu „670 mg” to masa całego cytrynianu magnezu. Samego magnezu jest 102 mg (27% RWS). Producent zaleca 2 kapsułki dziennie." },
  { cid:"ibuvit-d3-4000", name:"Ibuvit D3 4000 IU", brand:"Polpharma", type:"lek", unit:"kapsulka", content:{d:100},
    form:"cholekalcyferol", producerDaily:1, pack:60,
    info:"Lek bez recepty, nie suplement, więc limit GIS dla suplementów go nie dotyczy. Wskazanie z ulotki: zapobieganie niedoborowi witaminy D u dorosłych z otyłością (BMI ≥ 30), zwykle od października do kwietnia. Nie łączyć z innymi produktami z witaminą D bez konsultacji." }
];

/* Pakiety „Sprawdzone działanie”: wyłącznie składniki z zatwierdzonym działaniem (rozp. 432/2012) */
const PACKS = [
  { id:"fatigue", name:"Mniej zmęczenia", claim:"przyczynia się do zmniejszenia uczucia zmęczenia i znużenia", match:/zmęczenia/,
    nutrients:["mg","b6","b12","c","fol","fe"],
    flags:{ fe:"Żelazo suplementuj tylko wtedy, gdy badanie krwi potwierdzi taką potrzebę. Jego nadmiar odkłada się w organizmie." },
    doctor:"Zmęczenie, które trwa kilka tygodni, może mieć przyczynę medyczną (np. niedokrwistość albo choroby tarczycy). Skonsultuj je z lekarzem." },
  { id:"muscles", name:"Prawidłowa praca mięśni", claim:"pomaga w prawidłowym funkcjonowaniu mięśni", match:/mięśni/,
    nutrients:["mg","d","ca","pot"],
    flags:{ pot:"Powyżej 1000 mg potasu dziennie GIS wymaga ostrzeżeń dla osób starszych oraz z chorobami nerek lub serca, nadciśnieniem albo cukrzycą insulinooporną." },
    doctor:"Częste lub bolesne skurcze mięśni skonsultuj z lekarzem. Dla żadnego składnika nie zatwierdzono w UE działania na skurcze." },
  { id:"hair", name:"Zdrowe włosy, skóra i paznokcie", claim:"pomaga zachować zdrowe włosy, skórę lub paznokcie", match:/włos|skór|paznokci/,
    nutrients:["bio","zn","se","c"], flags:{},
    doctor:"Nagłe lub nasilone wypadanie włosów, zmiany skórne czy łamliwe paznokcie mogą mieć przyczynę medyczną. Skonsultuj je z lekarzem lub dermatologiem.",
    fact:"Suplement z samym kolagenem nie ma w UE żadnego zatwierdzonego działania. Zatwierdzono działanie witaminy C, która pomaga organizmowi wytwarzać kolagen." }
];
const STEPS = [
  { k:"min", t:"Minimum w suplemencie (15% RWS)", d:"Najmniejsza ilość, przy której składnik w suplemencie w ogóle się liczy. Poniżej niej producent nie może przypisywać mu żadnego działania." },
  { k:"rws", t:"Wartość z etykiety (RWS)", d:"Uśredniona wartość odniesienia dla dorosłego, używana na opakowaniach (np. „27% RWS”). Służy do porównywania produktów, nie jest Twoją normą." },
  { k:"norm", t:"Twoja norma", d:"Ile potrzebujesz dziennie ze wszystkich źródeł razem, przede wszystkim z jedzenia. Suplement tylko ją uzupełnia, więc wynik poniżej normy w aplikacji nie oznacza niedoboru." },
  { k:"gap", t:"Do normy brakuje", d:"Twoja norma minus szacunek z diety. Pokazuje, ile według norm dla zdrowych osób nie pokrywa jedzenie. To informacja, a nie zalecana dawka: wynik z ankiety jest przybliżony (±25%), a o suplementacji decydujesz Ty, najlepiej z lekarzem lub dietetykiem. „Nic” oznacza, że z punktu widzenia normy suplement z tym składnikiem nie jest potrzebny." },
  { k:"goal", t:"Twój cel", d:"Ilość z suplementów, którą ustawiasz sam, najlepiej razem z lekarzem lub dietetykiem. Aplikacja nie pozwoli ustawić celu powyżej granicy bezpieczeństwa." },
  { k:"gis", t:"Limit GIS", d:"Najwyższa ilość w dziennej porcji jednego suplementu według Zespołu ds. Suplementów Diety przy Głównym Inspektoracie Sanitarnym. Nie dotyczy leków." },
  { k:"ul", t:"Granica bezpieczeństwa (UL)", d:"Najwyższe codzienne spożycie, przy którym nie spodziewamy się szkód dla zdrowia. To sufit, nie cel: więcej nie daje dodatkowych korzyści, a zwiększa ryzyko. Nie przekraczaj jej." }
];
function rangeFor(n){ const N=NUTR[n], lims=[gisFor(n),N.ul].filter(Boolean); return { lo:N.rws?N.rws*0.15:null, hi:lims.length?Math.min(...lims):null }; }
function packClaims(pk,n){ return (CLAIMS[n]||[]).filter(c=>pk.match.test(c)); }

/* ============ Stan i zapis ============ */
const KEY = "wassup.v1";
let S = load();
function blank(){ return { v:1, profile:null, products:[], log:{}, labs:[], periods:[], prefs:{}, goals:{}, packs:[], foodMap:{}, diet:null, created:today() }; }
function load(){ try{ const raw = localStorage.getItem(KEY); if(raw){ const s = JSON.parse(raw); if(s && s.v===1){ fill(s); return s; } } }catch(e){} return blank(); }
function fill(s){ s.prefs=s.prefs||{}; s.labs=s.labs||[]; s.goals=s.goals||{}; s.packs=s.packs||[]; s.foodMap=s.foodMap||{}; s.periods=s.periods||[]; labsMigrate(s); dosesMigrate(s); return s; }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){ toast("Nie udało się zapisać danych na tym urządzeniu"); } }
try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persist(); }catch(e){}

/* ============ Narzędzia ============ */
function today(){ return dkey(new Date()); }
function dkey(d){ const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), dd=String(d.getDate()).padStart(2,"0"); return y+"-"+m+"-"+dd; }
function parseKey(k){ const [y,m,d]=k.split("-").map(Number); return new Date(y,m-1,d); }
function addDays(k,n){ const d=parseKey(k); d.setDate(d.getDate()+n); return dkey(d); }
function fmt(n,max){ return Number(n).toLocaleString("pl-PL",{maximumFractionDigits:max==null?1:max}); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function plural(n,forms){ n=Math.abs(n); if(n===1) return forms[0]; if(!Number.isInteger(n)) return forms[1]; const d=n%10, h=n%100; if(d>=2&&d<=4&&(h<12||h>14)) return forms[1]; return forms[2]; }
function unitWord(p,n){ return plural(n, UNITS[p.unit]||UNITS.porcja); }
function uid(){ return Math.random().toString(36).slice(2,9); }
function dayLabel(k){ const t=today(); if(k===t) return "Dziś"; if(k===addDays(t,-1)) return "Wczoraj"; return parseKey(k).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"}); }
function longDate(k){ return parseKey(k).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"}); }
function shortDate(k){ return parseKey(k).toLocaleDateString("pl-PL",{day:"numeric",month:"short"}); }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function sym(n){ return `<span class="sym" title="${esc(NUTR[n].name)}">${NUTR[n].sym}</span>`; }
function syms(content){ return `<div class="syms">${Object.keys(content).filter(n=>content[n]&&NUTR[n]).map(sym).join("")}</div>`; }
function norms(){ const p=S.profile; if(!p) return {}; if(p.state==="preg") return NORMS.preg; if(p.state==="lact") return NORMS.lact; return (NORMS[p.sex]||NORMS.m)[p.age]||{}; }
function gisFor(n){
  const p=S.profile||{}, preg=p.state==="preg", lact=p.state==="lact";
  return ({ mg:400, d:p.age==="75+"?100:50, b6:6, c:1000, zn:15, b12:100, fe:preg?30:20, fol:preg?800:600, ca:1500, k:200, se:200, i:(preg||lact)?200:150, bio:null, pot:1500, om3:null })[n];
}
/* porcja dzienna z historią zmian: p.doses=[{since,daily}] */
function dailyOn(p,k){ const d=p.doses; if(!d||!d.length) return p.daily; let v=d[0].daily; for(const e of d){ if(e.since<=k) v=e.daily; else break; } return v; }
function setDaily(p,v){ v=Math.round(v*1000)/1000; if(!(v>0)||v===p.daily) return; const t=today();
  if(!p.doses||!p.doses.length) p.doses=[{since:"0000-00-00",daily:p.daily}];
  const last=p.doses[p.doses.length-1]; if(last.since===t) last.daily=v; else p.doses.push({since:t,daily:v});
  if(p.doses.length>1 && p.doses[p.doses.length-2].daily===v) p.doses.pop();
  p.daily=v; }
function dosesMigrate(s){ // jednorazowo: odtwórz zmianę porcji z historii przyjęć (sprzed wersji 0.9.1)
  if(s.prefs && s.prefs.dosesMigrated) return; (s.products||[]).forEach(p=>{ if(p.doses&&p.doses.length) return;
    const days=Object.keys(s.log||{}).filter(k=>s.log[k][p.id]>0).sort(); if(!days.length) return;
    let lastDiff=-1; days.forEach((k,i)=>{ if(s.log[k][p.id]!==p.daily) lastDiff=i; }); if(lastDiff<0) return;
    const before=days.slice(0,lastDiff+1).map(k=>s.log[k][p.id]), cnt={}; before.forEach(v=>cnt[v]=(cnt[v]||0)+1);
    const mode=+Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0]; if(mode===p.daily) return;
    const since=lastDiff+1<days.length?days[lastDiff+1]:null; if(!since) return;
    p.doses=[{since:"0000-00-00",daily:mode},{since,daily:p.daily}]; });
  if(s.prefs) s.prefs.dosesMigrated=true; }
function live(){ return S.products.filter(p=>!p.ended); }
function taken(k,pid){ return (S.log[k]&&S.log[k][pid])||0; }
function totals(k){ const t={}, byType={}; for(const p of S.products){ const u=taken(k,p.id); if(!u) continue; for(const n in p.content){ const v=(p.content[n]||0)*u; if(!v) continue; t[n]=(t[n]||0)+v; byType[n]=byType[n]||{}; byType[n][p.type]=(byType[n][p.type]||0)+v; } } return {t,byType}; }
function planned(){ const t={}; for(const p of live()) for(const n in p.content) if(p.content[n]) t[n]=(t[n]||0)+p.content[n]*p.daily; return t; }
function activeNutrients(){ const s=new Set(Object.keys(S.goals||{})); for(const p of live()) for(const n in p.content) if(p.content[n]) s.add(n); return ORDER.filter(n=>s.has(n)); }
function status(n,v){
  const ul=NUTR[n].ul, gis=gisFor(n);
  if(!v) return {c:"none",t:"Brak dziś"};
  if(ul && v>ul+1e-9) return {c:"bad",t:"Powyżej UL"};
  if(ul && v>=ul-1e-9) return {c:"warn",t:"Na granicy UL"};
  if(gis && v>gis+1e-9) return {c:"warn",t:"Powyżej limitu GIS"};
  return {c:"ok",t:"Poniżej limitów"};
}
function stockLeft(p){ if(!p.stock || p.stock.count==null) return null; let used=0; for(const k in S.log){ if(k>=p.stock.since) used+=(S.log[k][p.id]||0); } return Math.max(0,p.stock.count-used); }
function runOut(p){ const left=stockLeft(p); if(left==null || !p.daily) return null; const days=Math.floor(left/p.daily); return {left,days,date:addDays(today(),days)}; }
function compText(p){ return "1 "+UNITS[p.unit][0]+": "+Object.keys(p.content).filter(n=>p.content[n]).map(n=>`${fmt(p.content[n])} ${NUTR[n].unit} ${NUTR[n].sym}${n==="d"?` (${fmt(p.content[n]*40,0)} IU)`:""}`).join(" + "); }
function doseText(p,u){ return Object.keys(p.content).filter(n=>p.content[n]).map(n=>`${fmt(p.content[n]*u)} ${NUTR[n].unit} ${NUTR[n].sym}${n==="d"?` (${fmt(p.content[n]*u*40,0)} IU)`:""}`).join(" + "); }

/* ============ Ikony ============ */
const I = {
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  left:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chev:'',right:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/></svg>',
  hist:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 20V12M10 20V6M15 20v-9M20 20V9"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M12 11v5M9.5 13.5h5"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/></svg>',
  lab:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3.5h5M10.5 3.5v5.2L5.6 17.4A2 2 0 0 0 7.4 20.5h9.2a2 2 0 0 0 1.8-3.1l-4.9-8.7V3.5"/><path d="M7.8 14h8.4"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4"/></svg>'
};

/* ============ Nawigacja ============ */
let TAB="today", DAY=today(), KNOW="mg";
function TABS(){ const t=[["today","Dziś",I.today],["hist","Historia",I.hist]]; if(S.prefs.labsMode) t.push(["labs","Badania",I.lab]); return t.concat([["box","Apteczka",I.box],["know","Wiedza",I.book],["me","Ty",I.user]]); }
function renderTabs(){
  document.querySelector(".tabbar").hidden = !S.profile;
  document.getElementById("tabs").innerHTML = TABS().map(([id,l,ic])=>`<button class="tab ${TAB===id?"on":""}" data-tab="${id}" aria-current="${TAB===id?"page":"false"}">${ic}<span>${l}</span></button>`).join("");
}
function render(){
  renderTabs();
  const el=document.getElementById("app");
  if(!S.profile){ el.innerHTML=viewWelcome(); return; }
  if(TAB==="labs" && !S.prefs.labsMode) TAB="me";
  el.innerHTML=({today:viewToday,hist:viewHist,labs:viewLabs,report:viewReport,box:viewBox,know:viewKnow,me:viewMe})[TAB]();
  if(TAB==="hist") bindChart();
}
function nutrientSelect(id,list,cur){ return `<label class="f"><span class="sr">Składnik</span><select id="${id}">${list.map(n=>`<option value="${n}" ${n===cur?"selected":""}>${esc(NUTR[n].name)}</option>`).join("")}</select></label>`; }

/* ============ Ekran powitalny ============ */
let OB={ sex:"m", age:"19-30", state:"none", pick:{"allnutrition-magb6":true,"ibuvit-d3-4000":true} };
function ageOptions(cur){ return AGES.map(a=>`<option value="${a}" ${cur===a?"selected":""}>${a==="75+"?"powyżej 75 lat":a.replace("-","–")+" lat"}</option>`).join(""); }
function viewWelcome(){
  return `<section class="screen">
  <div class="head"><div><div class="sub">Suplementy, które rozumiesz</div><h1>Witaj w Wassup</h1></div></div>
  <div class="card"><div class="pname">Twój profil</div>
    <div class="pmeta">Normy żywienia zależą od płci i wieku. Dane zostają tylko na tym telefonie.</div>
    <div class="seg" role="group" aria-label="Płeć">${[["m","Mężczyzna"],["f","Kobieta"]].map(([v,l])=>`<button data-ob-sex="${v}" class="${OB.sex===v?"on":""}">${l}</button>`).join("")}</div>
    <label class="f">Wiek<select id="ob-age">${ageOptions(OB.age)}</select></label>
    ${OB.sex==="f"?`<label class="f">Stan<select id="ob-state"><option value="none">brak szczególnego</option><option value="preg" ${OB.state==="preg"?"selected":""}>ciąża</option><option value="lact" ${OB.state==="lact"?"selected":""}>karmienie piersią</option></select></label>`:""}
  </div>
  <div class="section-t">Co bierzesz?</div>
  <div class="list">${CATALOG.map(c=>`<button class="row" style="width:100%;text-align:left" data-ob-pick="${c.cid}">
      ${syms(c.content)}
      <div class="grow"><div class="pname">${esc(c.name)} <span class="pill ${c.type==="lek"?"lek":""}">${c.type==="lek"?"Lek OTC":"Suplement"}</span></div><div class="pmeta">${esc(c.brand)} · ${compText(c)}</div></div>
      <span class="check ${OB.pick[c.cid]?"on":""}" aria-hidden="true">${I.check}</span></button>`).join("")}</div>
  <div class="pmeta" style="padding:0 4px">Inne produkty dodasz później w Apteczce.</div>
  <button class="btn full" data-act="ob-done">Zaczynamy</button>
  <p class="src" style="padding:0 4px">Wassup informuje i liczy, ale nie zaleca dawek. W sprawie dawkowania zapytaj lekarza lub farmaceutę.</p>
  </section>`;
}

/* ============ Dziś ============ */
function viewToday(){
  const k=DAY, isToday=k===today(), only=!!S.prefs.onlyLeft;
  const {t,byType}=totals(k), plan=planned();
  const L=live(), done=L.filter(p=>taken(k,p.id)>=dailyOn(p,k));
  const prods=only?L.filter(p=>taken(k,p.id)<dailyOn(p,k)):L;
  const ns=activeNutrients().filter(n=>!only || (t[n]||0) < ((S.goals[n]!=null?S.goals[n]:plan[n])||0)-1e-9);
  const allDone=L.length && done.length===L.length;
  return `<section class="screen">
  <div class="head"><div><div class="sub">${isToday?esc(longDate(k)):"Uzupełniasz dzień"}</div><h1>${esc(cap(dayLabel(k)))}</h1></div>
    <div class="datenav"><button class="iconbtn" data-act="day-prev" aria-label="Poprzedni dzień">${I.left}</button><button class="iconbtn" data-act="day-next" aria-label="Następny dzień" ${isToday?"disabled":""}>${I.right}</button></div></div>
  ${isToday?attention():""}
  ${!S.diet?dietCard():""}
  ${L.length?`<label class="switchrow card"><span class="grow"><span class="pname">Tylko to, co zostało na dziś</span><span class="pmeta" style="display:block">Ukrywa odhaczone produkty i składniki, które osiągnęły dziś Twój cel albo zaplanowaną ilość.</span></span>
    <input type="checkbox" id="only-left" class="switch" ${only?"checked":""}></label>`:""}
  ${L.length?`<div class="section-t">Do przyjęcia · ${done.length}/${L.length}</div>
  ${prods.length?`<div class="list">${prods.map(p=>{ const u=taken(k,p.id), dk=dailyOn(p,k), on=u>=dk && u>0; const ro=runOut(p);
    return `<div class="row">${syms(p.content)}
      <div class="grow"><div class="pname">${esc(p.name)}</div><div class="pmeta">${fmt(dk)} ${unitWord(p,dk)} · ${doseText(p,dk)}${ro&&ro.days<=5?` · <b style="color:var(--warn)">zostało ${ro.left}</b>`:""}</div></div>
      ${u && u!==dk?`<span class="count num">${fmt(u)}×</span>`:""}
      <button class="count" data-act="qty" data-id="${p.id}" aria-label="Zmień liczbę: ${esc(p.name)}">±</button>
      <button class="check ${on?"on":""}" data-act="toggle" data-id="${p.id}" aria-pressed="${on}" aria-label="${on?"Odznacz":"Oznacz jako przyjęte"}: ${esc(p.name)}">${I.check}</button></div>`; }).join("")}</div>`
   :`<div class="card done"><span class="check on" aria-hidden="true">${I.check}</span><div><div class="pname">${allDone?"Wszystko na dziś odhaczone":"Nic więcej na dziś"}</div><div class="pmeta">Wyłącz filtr, aby zobaczyć pełną listę i bilans.</div></div></div>`}`
  :`<div class="card empty">Apteczka jest pusta.<br><button class="btn" style="margin-top:12px" data-act="add">Dodaj produkt</button></div>`}
  ${ns.length?`<div class="section-t">Bilans dnia z suplementów i leków</div>`:""}
  ${ns.map(n=>nutrientCard(n,t[n]||0,byType[n]||{})).join("")}
  <p class="src" style="padding:0 4px">Liczymy tylko to, co odhaczysz w aplikacji. Resztę składników dostarcza jedzenie, więc wynik poniżej normy nie oznacza niedoboru. Wassup informuje, nie zaleca dawek.</p>
  </section>`;
}
function gapInfo(n){
  const D=S.diet, N=NUTR[n], norm=norms()[n];
  if(!DIET_NUTR.includes(n) || NOT_FROM_DIET[n] || !norm) return null;
  if(!D) return {none:true};
  const d=D.intake[n]||0, ffq=D.method==="ffq", f=N.normFactor||1;
  const lo=Math.max(0,norm-d*(ffq?1.25:1))/f, hi=Math.max(0,norm-d*(ffq?0.75:1))/f;
  const r=x=>x<10?Math.round(x*10)/10:Math.round(x);
  return {d,norm,ffq,f,lo:r(lo),hi:r(hi),covered:r(hi)===0,unsure:n==="se"};
}
function gapNote(n,g,plan){
  const N=NUTR[n], u=N.unit, src=g.ffq?"z ankiety (przybliżony)":"z jadłospisu";
  if(g.unsure) return `<div class="note">${esc(UNSURE_NOTE.se)} Dlatego nie oceniamy, czy suplement jest potrzebny.</div>`;
  if(g.covered) return `<div class="note ok">Według szacunku ${src} dieta pokrywa Twoją normę (ok. ${fmt(g.d,g.d<10?1:0)} z ${fmt(g.norm,g.norm<10?1:0)} ${n==="fol"?"µg DFE":u}). <b>Z punktu widzenia normy suplement z tym składnikiem nie jest potrzebny.</b> Normy dotyczą osób zdrowych: jeśli suplementację zalecił lekarz, ta informacja jej nie zmienia.</div>`;
  return `<div class="note">Według szacunku ${src} do normy brakuje ${gapText(g,N)}${n==="fol"?" (w przeliczeniu na kwas foliowy)":""}. Twój plan z Apteczki daje ${fmt(plan)} ${u} dziennie. To informacja, nie zalecana dawka.</div>`;
}
function gapText(g,N){ if(g.covered) return "nic"; if(g.lo===g.hi) return `ok. ${fmt(g.hi)} ${N.unit}`; return `${fmt(g.lo)}–${fmt(g.hi)} ${N.unit}`; }
function infoBtn(k){ return `<button class="info" data-act="info" data-k="${k}" aria-label="Co to znaczy?">i</button>`; }
function nutrientCard(n,v,bt){
  const N=NUTR[n], nm=norms(), norm=nm[n], gis=gisFor(n), f=N.normFactor||1, goal=S.goals[n];
  let st=status(n,v);
  if(goal && st.c==="ok") st = v>=goal-1e-9 ? {c:"ok",t:"Cel osiągnięty"} : {c:"none",t:`${fmt(v/goal*100,0)}% celu`};
  if(goal && st.c==="none" && !v) st={c:"none",t:"0% celu"};
  const marks=[["RWS",N.rws,""],["norma",norm?norm/f:null,""],["GIS",gis,""],["cel",goal,"goal"],["UL",N.ul,"ul"]].filter(m=>m[1]);
  const max=Math.max(...marks.map(m=>m[1]*1.15), v*1.08, 1);
  const pct=x=>Math.min(100,x/max*100);
  const groups=[]; marks.slice().sort((a,b)=>a[1]-b[1]).forEach(m=>{ const g=groups.find(g=>Math.abs(g.v-m[1])<1e-9); if(g){ g.names.push(m[0]); if(m[2]) g.cls=m[2]; } else groups.push({v:m[1],names:[m[0]],cls:m[2]}); });
  const rows=[]; const labels=groups.map(g=>{ const x=pct(g.v), txt=g.names.join(" · "), w=Math.max(9,txt.length*1.9); let row=0; while((rows[row]||[]).some(o=>Math.abs(o.x-x)<(o.w+w)/2+1)) row++; (rows[row]=rows[row]||[]).push({x,w}); return {txt,cls:g.cls,x,row}; });
  const onlyLek=bt.lek && !bt.suplement, hasProd=live().some(p=>p.content[n]), gap=gapInfo(n), planN=planned()[n]||0;
  return `<div class="card">
    <div class="ntop"><div><div class="nname">${sym(n)}${N.name}</div>
      <div style="margin-top:8px" class="big num">${fmt(v)}<small>${N.unit}${goal?` / ${fmt(goal)} ${N.unit}`:""}</small></div>
      ${n==="d"?`<div class="alt num">${fmt(v*40,0)} IU</div>`:""}</div>
      <span class="chip ${st.c}">${st.t}</span></div>
    <div class="scale" role="img" aria-label="${esc(N.name)}: ${fmt(v)} ${N.unit}${N.ul?`, granica bezpieczeństwa ${fmt(N.ul)} ${N.unit}`:""}">
      <div class="track"></div>
      ${N.ul?`<div class="danger" style="left:${pct(N.ul)}%"></div>`:""}
      <div class="fillbar ${N.ul&&v>N.ul+1e-9?"over":""}" style="width:${pct(v)}%"></div>
      ${labels.map(l=>`<i class="mark ${l.cls}" style="left:calc(${l.x}% - 1px)"></i><span class="mlabel ${l.cls}" style="left:${l.x}%;top:${26+l.row*12}px">${l.txt}</span>`).join("")}
    </div>
    <div class="cmp" style="margin-top:${Math.max(0,...labels.map(l=>l.row))*12}px">
      ${goal?`<div><span>Twój cel (${fmt(goal)} ${N.unit}) ${infoBtn("goal")}</span><span class="num">${fmt(v/goal*100,0)}%</span></div>`:""}
      ${S.diet&&!NOT_FROM_DIET[n]&&S.diet.intake[n]?`<div><span>Z diety (szacunek${S.diet.method==="ffq"?", ankieta":""}): ok. ${fmt(S.diet.intake[n],0)} ${n==="fol"?"µg DFE":N.unit}</span><span class="num">${norm?fmt(S.diet.intake[n]/norm*100,0)+"% normy":""}</span></div>`:""}
      ${gap&&!gap.none?`<div class="gaprow"><span><b>Do normy brakuje</b> ${infoBtn("gap")}</span><span class="num"><b>${gapText(gap,N)}</b></span></div>`:""}
      ${gap&&gap.none?`<div><span>Do normy brakuje ${infoBtn("gap")}</span><span><button class="link small" data-act="diet">Sprawdź dietę</button></span></div>`:""}
      ${N.rws?`<div><span>Etykieta: RWS ${fmt(N.rws)} ${N.unit} ${infoBtn("rws")}</span><span class="num">${fmt(v/N.rws*100,0)}%</span></div>`:""}
      ${norm?`<div><span>Twoja norma: ${fmt(norm)} ${n==="fol"?"µg DFE":N.unit} ${infoBtn("norm")}</span><span class="num">${fmt(v*f/norm*100,0)}%</span></div>`:""}
      ${gis?`<div><span>Limit GIS: ${fmt(gis)} ${N.unit} ${infoBtn("gis")}</span><span class="num">${v>gis+1e-9?"powyżej":"poniżej"}</span></div>`:""}
      ${N.ul?`<div class="ulrow"><span><b>Granica bezpieczeństwa: ${fmt(N.ul)} ${N.unit}</b> ${infoBtn("ul")}</span><span class="num">${v>N.ul+1e-9?"przekroczona":fmt(v/N.ul*100,0)+"%"}</span></div>`:`<div><span>Granica bezpieczeństwa ${infoBtn("ul")}</span><span>nie ustalono</span></div>`}
    </div>
    ${gap&&!gap.none&&hasProd?gapNote(n,gap,planN):""}
    ${goal&&!hasProd?`<div class="note">Żaden produkt w Apteczce nie zawiera tego składnika. Dodaj produkt, żeby liczyć postęp do celu.</div>`:""}
    ${n==="mg"&&v?`<div class="note">${N.ulNote} Normę ${norm?fmt(norm)+" mg ":""}liczy się z dietą łącznie, więc resztę zwykle daje jedzenie.</div>`:""}
    ${n==="d"&&v>=N.ul-1e-9?`<div class="note warn">${fmt(v)} µg to ${v>N.ul?"więcej niż":"dokładnie"} granica bezpieczeństwa dla diety i suplementów razem. ${onlyLek?"Twój produkt to lek, więc limit GIS dla suplementów go nie dotyczy. ":""}O dawkę i badanie poziomu 25(OH)D zapytaj lekarza lub farmaceutę.</div>`:""}
    ${N.ul&&v>N.ul+1e-9&&n!=="d"?`<div class="note warn">Przekraczasz granicę bezpieczeństwa (UL). Porozmawiaj z lekarzem lub farmaceutą o dawce.</div>`:""}
    ${n!=="mg"&&n!=="d"&&gis&&v>gis+1e-9&&!(N.ul&&v>N.ul)&&!onlyLek?`<div class="note warn">Powyżej limitu, który Zespół ds. Suplementów Diety przy GIS przyjął dla dziennej porcji suplementu.</div>`:""}
    ${N.warn&&v?`<div class="note">${N.warn}</div>`:""}
  </div>`;
}

/* ============ Uwaga (ekran Dziś) ============ */
function stockAlerts(){ const t=today(), sn=S.prefs.snooze||{}; return live().map(p=>({p,ro:runOut(p)})).filter(x=>x.ro && x.ro.days<=3 && sn[x.p.id]!==t); }
function ulAlerts(){
  const out=[], L=live(), D=S.diet;
  const plan={}, planSupp={};
  for(const p of L) for(const n in p.content){ const v=(p.content[n]||0)*p.daily; if(!v||!NUTR[n]) continue; plan[n]=(plan[n]||0)+v; if(p.type!=="lek") planSupp[n]=(planSupp[n]||0)+v; }
  for(const n of ORDER){ if(!plan[n]) continue; const N=NUTR[n], dietV=(D&&n!=="mg"&&n!=="fol")?(D.intake[n]||0):0, tot=plan[n]+dietV, gis=gisFor(n);
    const parts=`Twój plan dzienny ${fmt(plan[n])} ${N.unit}${dietV>=0.05?` + dieta ok. ${fmt(dietV)} ${N.unit} = ok. ${fmt(tot)} ${N.unit}`:""}`;
    const facts={plan:plan[n],dietV,tot,ul:N.ul,gis,planSupp:planSupp[n]||0};
    if(N.ul && tot>N.ul+1e-9 && doctorPlanFor(n)) out.push({c:"warn",n,kind:"ul",...facts,html:`<b>${esc(N.name)}: powyżej granicy bezpieczeństwa.</b> ${parts}, a UL to ${fmt(N.ul)} ${N.unit}. Plan jest oznaczony jako ustalony z lekarzem: taką dawkę stosuj tylko pod jego kontrolą i nie dokładaj innych produktów z tym składnikiem.`});
    else if(N.ul && tot>N.ul+1e-9) out.push({c:"bad",n,kind:"ul",...facts,html:`<b>${esc(N.name)}: powyżej granicy bezpieczeństwa.</b> ${parts}, a UL to ${fmt(N.ul)} ${N.unit}${n==="mg"||n==="fol"?" (liczony tylko z suplementów)":""}. O dawkę zapytaj lekarza lub farmaceutę.`});
    else if(N.ul && tot>=N.ul-1e-9) out.push({c:"warn",n,kind:"atul",...facts,html:`<b>${esc(N.name)}: na granicy bezpieczeństwa.</b> ${parts}, czyli tyle, ile wynosi UL (${fmt(N.ul)} ${N.unit}). Każdy dodatkowy produkt z tym składnikiem ją przekroczy.`});
    else if(gis && (planSupp[n]||0)>gis+1e-9) out.push({c:"warn",n,kind:"gis",...facts,html:`<b>${esc(N.name)}: powyżej limitu GIS dla suplementów.</b> Suplementy w planie dają ${fmt(planSupp[n])} ${N.unit}, a limit dziennej porcji przyjęty przez Zespół ds. Suplementów Diety to ${fmt(gis)} ${N.unit}.`});
  }
  return out;
}
function attention(){
  const items=[];
  labAlerts().filter(x=>x.kind==="high").forEach(x=>items.push(`<div class="att bad"><div>${x.html}</div><div class="btns"><button class="btn sec" data-act="go-labs">Zobacz w Badaniach</button></div></div>`));
  periodAttention().forEach(h=>items.push(h));
  ulAlerts().forEach(x=>items.push(`<div class="att ${x.c}"><div>${x.html}</div></div>`));
  stockAlerts().forEach(({p,ro})=>{ const U=UNITS[p.unit]||UNITS.porcja;
    const head=ro.left<=0?`Skończył się ${esc(p.name)}`:ro.days<1?`${esc(p.name)}: zostało mniej niż na dzień`:`Kończy się ${esc(p.name)}: zostało na ${ro.days} ${plural(ro.days,["dzień","dni","dni"])}`;
    items.push(`<div class="att stock"><div><b>${head}</b> (${ro.left} ${plural(ro.left,U)}).<br>Zanim kupisz kolejne opakowanie, zastanów się, czy nadal potrzebujesz tego ${p.type==="lek"?"leku":"suplementu"}. Jeśli tak, dokup je, żeby nie zrobić przerwy.</div>
      <div class="btns"><button class="btn sec" data-act="refill" data-id="${p.id}">Mam nowe opakowanie</button><button class="btn sec" data-act="end" data-id="${p.id}">Kończę z tym</button><button class="link small" data-act="snooze" data-id="${p.id}">Przypomnij jutro</button></div></div>`); });
  if(backupDue()) items.push(`<div class="att stock"><div><b>Zrób kopię danych.</b> ${S.prefs.lastBackup?`Ostatnia była ${daysSince(S.prefs.lastBackup)} dni temu.`:"Nie masz jeszcze żadnej kopii."} Wszystko jest zapisane tylko na tym telefonie, a kopia chroni historię i wyniki badań, gdy coś się stanie z telefonem albo przeglądarką.</div>
    <div class="btns"><button class="btn sec" data-act="export">Zrób kopię</button><button class="link small" data-act="backup-snooze">Przypomnij za tydzień</button></div></div>`);
  if(!items.length) return "";
  return `<div class="section-t">Uwaga</div><div class="attlist">${items.join("")}</div>`;
}

/* ============ Historia ============ */
function viewHist(){
  const ns=activeNutrients();
  if(!ns.length) return `<section class="screen"><div class="head"><h1>Historia</h1></div><div class="card empty">Dodaj produkty w Apteczce, a tu zobaczysz swoje ostatnie 30 dni.</div></section>`;
  const n=ns.includes(KNOW)?KNOW:ns[0];
  const days=[...Array(30)].map((_,i)=>addDays(today(),i-29)), vals=days.map(k=>totals(k).t[n]||0);
  const st=streak(), adh=adherence(30);
  return `<section class="screen">
  <div class="head"><div><div class="sub">Ostatnie 30 dni</div><h1>Historia</h1></div></div>
  <div class="stat"><div><b class="num">${st}</b><span>${plural(st,["dzień","dni","dni"])} z rzędu wszystko</span></div><div><b class="num">${adh.full}/${adh.n}</b><span>dni z kompletem</span></div><div><b class="num">${adh.pct}%</b><span>przyjętych dawek</span></div></div>
  ${nutrientSelect("hist-n",ns,n)}
  <div class="card chart"><div class="nname">${sym(n)}${NUTR[n].name} dziennie (${NUTR[n].unit})</div>
    ${chartSVG(days,vals,n)}<div class="sel num" id="hsel">Dotknij słupka, aby zobaczyć dzień.</div></div>
  <div class="card"><div class="pname">Kalendarz przyjęć</div>${calendar()}<div class="pmeta">Pełny kolor: wszystkie produkty. Jaśniejszy: część.</div></div>
  ${histLabs(n)}
  </section>`;
}
function histLabs(n){
  const ms=MARKERS.filter(x=>x.n===n); if(!ms.length) return "";
  const groups=labGroups().filter(a=>MK[a[0].m] && MK[a[0].m].n===n);
  return `<div class="card"><div class="pname">Wyniki badań: ${esc(NUTR[n].name)}</div>
    ${groups.length?`<dl class="kv">${groups.map(a=>{ const l=a[0], st=LST[labFlag(l)]; return `<dt>${esc(labName(l))}<br><span class="pmeta">${esc(fullDate(l.date))}</span></dt><dd class="num">${fmt(l.value,2)} ${esc(l.unit)}<br><span class="chip ${st.c}">${st.t}</span></dd>`; }).join("")}</dl>`
      :`<div class="pmeta">Brak zapisanych wyników. Przepisz wynik z wydruku, a Wassup porówna go z zakresem z tego wydruku.</div>`}
    <div class="btns"><button class="btn sec" data-act="lab-add" data-k="${ms[0].m}">Dodaj wynik</button>${groups.length?`<button class="btn sec" data-act="go-labs">Wszystkie badania</button>`:""}</div></div>`;
}
function streak(){ const L=live(); if(!L.length) return 0; let k=today(); const full=x=>L.every(p=>taken(x,p.id)>=dailyOn(p,x)); if(!full(k)) k=addDays(k,-1); let c=0; while(full(k) && c<3650){ c++; k=addDays(k,-1); } return c; }
function adherence(N){ let full=0,need=0,got=0,n=0; const start=S.created||today(); for(let i=0;i<N;i++){ const k=addDays(today(),-i); if(k<start) break; n++; let all=true; for(const p of live()){ const dk=dailyOn(p,k); need+=dk; got+=Math.min(taken(k,p.id),dk); if(taken(k,p.id)<dk) all=false; } if(all && live().length) full++; } return {full,n,pct:need?Math.round(got/need*100):0}; }
function chartSVG(days,vals,n){
  const W=340,H=170,L=38,R=6,T=10,B=22,pw=W-L-R,ph=H-T-B, N=NUTR[n], f=N.normFactor||1, normRaw=norms()[n], norm=normRaw?normRaw/f:null;
  const max=Math.max((N.ul||0)*1.15, (gisFor(n)||0)*1.1, (norm||0)*1.1, ...vals, 1);
  const y=v=>T+ph-(v/max)*ph, bw=pw/days.length;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(N.name)} dziennie przez 30 dni">`;
  niceTicks(max).forEach(t=>{ s+=`<line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)"/><text x="${L-5}" y="${y(t)+3.5}" text-anchor="end" font-size="10" fill="var(--muted)">${fmt(t,1)}</text>`; });
  days.forEach((k,i)=>{ const v=vals[i], x=L+i*bw+1, w=Math.max(2,bw-2), h=Math.max(v?3:1.5,(v/max)*ph);
    s+=`<rect x="${x}" y="${T+ph-h}" width="${w}" height="${h}" rx="${Math.min(3,w/2)}" fill="${v?"var(--bar)":"var(--line)"}"/>`;
    s+=`<rect x="${L+i*bw}" y="${T}" width="${bw}" height="${ph+B}" fill="transparent" data-day="${k}" data-v="${v}"/>`; });
  if(N.ul) s+=`<line x1="${L}" x2="${W-R}" y1="${y(N.ul)}" y2="${y(N.ul)}" stroke="var(--bad)" stroke-dasharray="4 3" stroke-width="1.5"/><text x="${W-R}" y="${y(N.ul)-4}" text-anchor="end" font-size="10" fill="var(--bad)">UL ${fmt(N.ul)}</text>`;
  if(norm && norm<max) s+=`<line x1="${L}" x2="${W-R}" y1="${y(norm)}" y2="${y(norm)}" stroke="var(--muted)" stroke-dasharray="2 3"/><text x="${L+4}" y="${y(norm)-4}" font-size="10" fill="var(--muted)">norma ${fmt(norm)}</text>`;
  [0,14,29].forEach(i=>{ s+=`<text x="${L+i*bw+bw/2}" y="${H-6}" text-anchor="${i===0?"start":i===29?"end":"middle"}" font-size="10" fill="var(--muted)">${esc(i===29?"dziś":shortDate(days[i]))}</text>`; });
  return s+"</svg>";
}
function niceTicks(max){ const raw=max/3, mag=Math.pow(10,Math.floor(Math.log10(raw))); const step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw); const out=[]; for(let v=0; v<=max+1e-9; v+=step) out.push(+v.toFixed(6)); return out; }
function bindChart(){ const svg=document.querySelector(".chart svg"); if(!svg) return; const n=document.getElementById("hist-n").value; svg.addEventListener("click",e=>{ const k=e.target.getAttribute("data-day"); if(!k) return; const v=+e.target.getAttribute("data-v"); document.getElementById("hsel").textContent=`${cap(longDate(k))}: ${fmt(v)} ${NUTR[n].unit}${n==="d"?` (${fmt(v*40,0)} IU)`:""}`; }); }
function calendar(){
  const t=today(), start=addDays(t,-34), offset=(parseKey(start).getDay()+6)%7;
  let cells=["pn","wt","śr","cz","pt","so","nd"].map(d=>`<span style="background:none">${d}</span>`).join("");
  for(let i=0;i<offset;i++) cells+=`<span style="background:none"></span>`;
  for(let i=0;i<35;i++){ const k=addDays(start,i); const L=live(), sum=L.map(p=>Math.min(1,taken(k,p.id)/dailyOn(p,k))).reduce((a,b)=>a+b,0);
    const cls=k>t?"future":sum>=L.length&&L.length?"full":sum>0?"part":""; cells+=`<span class="${cls} ${k===t?"today":""} num">${parseKey(k).getDate()}</span>`; }
  return `<div class="cal">${cells}</div>`;
}

/* ============ Apteczka ============ */
function viewBox(){
  const L=live(), ended=S.products.filter(p=>p.ended);
  return `<section class="screen">
  <div class="head"><div><div class="sub">${L.length} ${plural(L.length,["produkt","produkty","produktów"])} w planie</div><h1>Apteczka</h1></div><button class="btn" data-act="add">Dodaj</button></div>
  ${L.map(p=>{ const ro=runOut(p), over=overProducer(p); return `<div class="card">
    <div class="ntop"><div class="grow"><div class="pname">${esc(p.name)}</div><div class="pmeta">${esc(p.brand||"")}</div></div><span class="pill ${p.type==="lek"?"lek":""}">${p.type==="lek"?"Lek OTC":"Suplement diety"}</span></div>
    <dl class="kv">${Object.keys(p.content).filter(n=>p.content[n]&&NUTR[n]).map(n=>`<dt>${sym(n)} ${NUTR[n].name} w 1 ${UNITS[p.unit][3]}</dt><dd class="num">${fmt(p.content[n])} ${NUTR[n].unit}${n==="d"?` · ${fmt(p.content[n]*40,0)} IU`:""}${NUTR[n].rws?` · ${fmt(p.content[n]/NUTR[n].rws*100,0)}% RWS`:""}</dd>`).join("")}
      ${p.form?`<dt>Forma</dt><dd>${esc(p.form)}</dd>`:""}
      ${p.producerDaily?`<dt>${p.type==="lek"?"Dawka z ulotki":"Zalecenie producenta"}</dt><dd class="num">${fmt(p.producerDaily)} ${unitWord(p,p.producerDaily)} dziennie</dd>`:""}
      ${ro?`<dt>Zapas</dt><dd class="num">${ro.left} ${unitWord(p,ro.left)} · do ok. ${esc(shortDate(ro.date))}</dd>`:`<dt>Zapas</dt><dd><button class="link small" data-act="refill" data-id="${p.id}">Wpisz, ile zostało</button></dd>`}</dl>
    <div class="dose"><div><div class="pname">Twoja porcja</div><div class="pmeta">${doseText(p,p.daily)} dziennie</div></div>
      <div class="stepper sm"><button data-act="dose-" data-id="${p.id}" aria-label="Mniej: ${esc(p.name)}" ${p.daily<=1?"disabled":""}>−</button><b class="num">${fmt(p.daily)}</b><button data-act="dose+" data-id="${p.id}" aria-label="Więcej: ${esc(p.name)}" ${p.daily>=10?"disabled":""}>+</button></div></div>
    ${over?`<div class="note warn">${over}</div>`:""}
    ${p.info?`<div class="note">${esc(p.info)}</div>`:""}
    <div class="btns"><button class="btn sec" data-act="edit" data-id="${p.id}">Edytuj</button><button class="btn sec" data-act="refill" data-id="${p.id}">Nowe opakowanie</button></div>
  </div>`; }).join("") || `<div class="card empty">Nie masz produktów w planie.</div>`}
  ${ended.length?`<div class="section-t">Zakończone</div><div class="list">${ended.map(p=>`<div class="row">${syms(p.content)}<div class="grow"><div class="pname">${esc(p.name)}</div><div class="pmeta">Zakończony ${esc(fullDate(p.ended))}. Historia przyjęć zostaje.</div></div><button class="btn sec" data-act="resume" data-id="${p.id}">Wznów</button></div>`).join("")}</div>`:""}
  </section>`;
}
function overProducer(p){
  if(!p.producerDaily || p.daily<=p.producerDaily+1e-9) return "";
  const a=`${fmt(p.daily)} ${unitWord(p,p.daily)}`, b=`${fmt(p.producerDaily)} ${unitWord(p,p.producerDaily)}`;
  return p.type==="lek"
    ? `Twoja porcja (${a}) jest większa niż dawka z ulotki (${b}). Większą dawkę leku stosuj tylko po ustaleniu z lekarzem.`
    : `Twoja porcja (${a}) jest większa niż zalecana dzienna porcja producenta (${b}). Etykieta suplementu zawiera ostrzeżenie, żeby jej nie przekraczać.`;
}

/* ============ Wiedza ============ */
function viewKnow(){
  const n=KNOW, N=NUTR[n], nm=norms(), gis=gisFor(n), r=rangeFor(n), goal=S.goals[n];
  return `<section class="screen">
  <div class="head"><div><div class="sub">Co mówią przepisy i nauka</div><h1>Wiedza</h1></div></div>
  ${dietCard()}
  <button class="card howto" data-act="info" data-k="">
    <div class="ruler" aria-hidden="true"><i></i><i></i><i></i><i></i><i class="u"></i></div>
    <div><div class="pname">Jak czytać dawki</div><div class="pmeta">Minimum, etykieta, norma, limit GIS i granica bezpieczeństwa. Co znaczy każda liczba.</div></div></button>
  <div class="section-t">Pakiety: sprawdzone działanie</div>
  <div class="list">${PACKS.map(pk=>{ const on=S.packs.includes(pk.id); return `<button class="row" style="width:100%;text-align:left" data-act="pack" data-id="${pk.id}">
    ${syms(Object.fromEntries(pk.nutrients.map(x=>[x,1])))}<div class="grow"><div class="pname">${esc(pk.name)}</div><div class="pmeta">${on?"Włączony · ":""}${pk.nutrients.length} ${plural(pk.nutrients.length,["składnik","składniki","składników"])}</div></div><span class="chev">${I.right}</span></button>`; }).join("")}</div>
  <div class="section-t">Składniki</div>
  ${nutrientSelect("know-n",ORDER,n)}
  <div class="card"><div class="nname">${sym(n)}Progi: ${N.name}</div>
    <dl class="kv">
      ${N.rws?`<dt>Minimum w suplemencie (15% RWS) ${infoBtn("min")}</dt><dd class="num">${fmt(N.rws*0.15,2)} ${N.unit}</dd>`:""}
      <dt>Wartość z etykiety (RWS) ${infoBtn("rws")}</dt><dd class="num">${N.rws?fmt(N.rws)+" "+N.unit:"brak"}</dd>
      <dt>Twoja norma${["d","k","om3","bio","pot"].includes(n)?" (AI)":" (RDA)"} ${infoBtn("norm")}</dt><dd class="num">${nm[n]?fmt(nm[n])+" "+(n==="fol"?"µg DFE":N.unit):"–"}</dd>
      <dt>Limit GIS na dzienną porcję ${infoBtn("gis")}</dt><dd class="num">${gis?fmt(gis)+" "+N.unit:"nie ustalono"}</dd>
      <dt><b>Granica bezpieczeństwa (UL)</b> ${infoBtn("ul")}</dt><dd class="num"><b>${N.ul?fmt(N.ul)+" "+N.unit:"nie ustalono"}</b></dd>
    </dl>
    <div class="note">${N.ulNote}</div>
    ${N.normNote?`<div class="note">${N.normNote}</div>`:""}
    ${N.warn?`<div class="note warn">${N.warn}</div>`:""}
    <div class="src">Źródła: rozp. 1169/2011 zał. XIII (RWS); Normy żywienia dla populacji Polski 2024 (normy, UL); uchwały Zespołu ds. Suplementów Diety GIS (limity); rozp. MZ ws. składu suplementów §4 (15% RWS).</div>
  </div>
  <div class="card"><div class="pname">Twój cel dzienny z suplementów ${infoBtn("goal")}</div>
    <div class="pmeta">${r.lo?`Działanie potwierdzone w UE od ${fmt(r.lo,2)} ${N.unit}. `:""}${r.hi?`Górna granica dla celu: ${fmt(r.hi)} ${N.unit}.`:"Nie ustalono górnego limitu."} Wartość ustal najlepiej z lekarzem lub dietetykiem.</div>
    <div class="f-row"><label class="f">Cel (${N.unit})<input id="g-val" inputmode="decimal" value="${goal!=null?String(goal).replace(".",","):""}" placeholder="${r.lo?fmt(r.lo,2)+"–"+(r.hi?fmt(r.hi):"…"):""}"></label>
      <div class="btns" style="align-self:end"><button class="btn" data-act="goal-save" data-n="${n}">Zapisz</button>${goal!=null?`<button class="btn sec" data-act="goal-del" data-n="${n}">Usuń</button>`:""}</div></div>
    ${planned()[n]?`<button class="link" style="justify-self:start" data-act="goal-plan" data-n="${n}">Wpisz moją obecną ilość z Apteczki (${fmt(planned()[n])} ${N.unit})</button>`:""}
  </div>
  ${n==="mg"?`<div class="card"><div class="pname">Licz magnez, nie sól magnezu</div>
    <p style="margin:0">Na opakowaniu często widnieje masa całego związku, np. „670 mg cytrynianu magnezu”. Samego magnezu jest w nim ok. 15%, czyli 102 mg. Etykieta musi podawać tę drugą liczbę w tabeli składu na dzienną porcję.</p>
    <div class="pmeta">Formy magnezu dopuszczone w suplementach to m.in. cytrynian, diglicynian, mleczan, tlenek, węglan, chlorek i L-treonian (dodany w 2025 r. jako nowa żywność).</div></div>`:""}
  ${n==="d"?`<div class="card"><div class="pname">Przelicznik IU ↔ µg</div>
    <div class="f-row"><label class="f">IU<input id="iu" inputmode="decimal" value="4000"></label><label class="f">µg<input id="ug" inputmode="decimal" value="100"></label></div>
    <div class="pmeta">1 µg witaminy D = 40 IU. Limit GIS dla suplementu: 2000 IU (50 µg), dla osób powyżej 75 lat 4000 IU. Leki z witaminą D (np. 4000 IU) mają własne wskazania z ulotki.</div></div>`:""}
  <div class="card"><div class="pname">Sprawdzone działanie</div>
    <div class="pmeta">Tylko te działania sprawdził Europejski Urząd ds. Bezpieczeństwa Żywności (EFSA) i zatwierdziła UE.${N.rws?` Dotyczą ilości co najmniej ${fmt(N.rws*0.15,2)} ${N.unit} dziennie (15% RWS).`:""} Jeśli produkt obiecuje coś więcej, podchodź do tego z dystansem.</div>
    <ul class="claims">${(CLAIMS[n]||[]).map(c=>`<li>${esc(c)}</li>`).join("")}</ul></div>
  <div class="card"><div class="pname">Czerwone flagi w reklamach</div>
    <div class="pmeta">Żaden suplement nie może obiecywać, że:</div>
    <ul class="claims">
      <li>leczy chorobę albo jej zapobiega,</li>
      <li>zastąpi lek albo wizytę u lekarza,</li>
      <li>bez niego zwykła dieta nie wystarczy,</li>
      <li>schudniesz w określonym tempie, np. „5 kg w tydzień”,</li>
      <li>poleca go lekarz lub farmaceuta (w reklamie suplementu nie wolno używać ich wizerunku),</li>
      <li>uchroni Cię przed objawami, którymi reklama straszy.</li>
    </ul>
    <div class="src">Na podstawie rozp. 1924/2006, 1169/2011, dyrektywy 2002/46/WE i Kodeksu Dobrych Praktyk Reklamy Suplementów Diety.</div></div>
  </section>`;
}
function infoSheet(k){
  sheet("Jak czytać dawki",`<div class="pmeta">Liczby w Wassup, od najniższej do najwyższej. Twój wynik z suplementów najlepiej mieści się między minimum a granicą bezpieczeństwa.</div>
  <ol class="steps">${STEPS.map(s=>`<li class="${s.k===k?"on":""} ${s.k==="ul"?"ul":""}"><div class="pname">${s.t}</div><div class="pmeta">${s.d}</div></li>`).join("")}</ol>
  <button class="btn full" data-act="close">Rozumiem</button>`);
  const on=document.querySelector(".steps li.on"); if(on) on.scrollIntoView({block:"center"});
}
function packSheet(id){
  const pk=PACKS.find(p=>p.id===id), plan=planned(), on=S.packs.includes(pk.id);
  sheet(pk.name,`<div class="pmeta">Składniki, dla których UE zatwierdziła działanie: <i>${esc(pk.claim)}</i>. Pakiet nie poleca produktów ani dawek. Wpisz własne cele w bezpiecznym zakresie, najlepiej po rozmowie z lekarzem lub dietetykiem.</div>
  ${pk.nutrients.map(n=>{ const N=NUTR[n], r=rangeFor(n), g=S.goals[n]; return `<div class="fieldset">
    <div class="ntop"><div class="nname">${sym(n)}${N.name}</div>${plan[n]?`<span class="chip ok">Masz: ${fmt(plan[n])} ${N.unit}</span>`:`<span class="chip none">Brak w Apteczce</span>`}</div>
    <ul class="claims small">${packClaims(pk,n).map(c=>`<li>${esc(c)}</li>`).join("")}</ul>
    <div class="pmeta">Zakres: ${r.lo?fmt(r.lo,2):"–"} – ${r.hi?fmt(r.hi)+" "+N.unit:"brak ustalonego limitu"}${r.hi&&N.ul&&r.hi<N.ul?` · granica bezpieczeństwa ${fmt(N.ul)} ${N.unit}`:""}</div>
    ${pk.flags[n]?`<div class="note warn">${pk.flags[n]}</div>`:""}
    <label class="f">Twój cel (${N.unit}, opcjonalnie)<input data-goal="${n}" inputmode="decimal" value="${g!=null?String(g).replace(".",","):""}" placeholder="${r.lo?fmt(r.lo,2)+"–"+(r.hi?fmt(r.hi):"…"):""}"></label>
  </div>`; }).join("")}
  <div class="note warn"><b>Kiedy do lekarza:</b> ${pk.doctor}</div>
  ${pk.fact?`<div class="note"><b>Warto wiedzieć:</b> ${pk.fact}</div>`:""}
  <button class="btn full" data-act="pack-save" data-id="${pk.id}">${on?"Zapisz cele":"Włącz pakiet i zapisz cele"}</button>
  ${on?`<button class="btn sec full" data-act="pack-off" data-id="${pk.id}">Wyłącz pakiet</button>`:""}
  <div class="src">Działania z rozp. 432/2012. Zakres: od 15% RWS do niższej z wartości limit GIS / UL.</div>`);
}
function checkGoal(n,v){
  const N=NUTR[n], gis=gisFor(n);
  if(v==null || v<=0) return {err:"Wpisz liczbę większą od zera."};
  if(N.ul && v>N.ul+1e-9) return {err:`${N.name}: cel nie może przekraczać granicy bezpieczeństwa (${fmt(N.ul)} ${N.unit}).`};
  let warn=null;
  if(gis && v>gis+1e-9) warn=`${N.name}: cel powyżej limitu GIS dla suplementu (${fmt(gis)} ${N.unit}). Ma sens tylko przy leku lub zaleceniu lekarza.`;
  else if(N.rws && v<N.rws*0.15-1e-9) warn=`${N.name}: cel poniżej progu, od którego UE potwierdza działanie (${fmt(N.rws*0.15,2)} ${N.unit}).`;
  return {warn};
}

/* ============ Ty ============ */
function viewMe(){
  const p=S.profile, days=Object.keys(S.log).length;
  return `<section class="screen">
  <div class="head"><div><div class="sub">Profil, przypomnienia, dane</div><h1>Ty</h1></div></div>
  <div class="card"><div class="pname">Profil</div>
    <div class="seg" role="group" aria-label="Płeć">${[["m","Mężczyzna"],["f","Kobieta"]].map(([v,l])=>`<button data-sex="${v}" class="${p.sex===v?"on":""}">${l}</button>`).join("")}</div>
    <label class="f">Wiek<select id="me-age">${ageOptions(p.age)}</select></label>
    ${p.sex==="f"?`<label class="f">Stan<select id="me-state"><option value="none">brak szczególnego</option><option value="preg" ${p.state==="preg"?"selected":""}>ciąża</option><option value="lact" ${p.state==="lact"?"selected":""}>karmienie piersią</option></select></label>`:""}
  </div>
  <label class="switchrow card"><span class="grow"><span class="pname">Tryb „Mam badania”</span><span class="pmeta" style="display:block">Dodaje zakładkę Badania: przepisujesz wyniki z wydruku laboratorium i widzisz je na tle zakresu z tego wydruku.</span></span>
    <input type="checkbox" id="labs-mode" class="switch" ${S.prefs.labsMode?"checked":""}></label>
  <div class="card"><div class="pname">Raport dla lekarza</div>
    <div class="pmeta">Jedna strona: wyniki badań, co bierzesz i jak regularnie, średnie dawki na tle norm i granic bezpieczeństwa, szacunek z diety. Do pokazania na telefonie, wydruku albo zapisania jako PDF.</div>
    <button class="btn sec" data-act="rep-open">Otwórz raport</button></div>
  <div class="card"><div class="pname">Codzienne przypomnienie</div>
    <div class="pmeta">Dodaje powtarzające się wydarzenie do Kalendarza na iPhonie (z alarmem). Wybierz godzinę i stuknij przycisk.</div>
    <label class="f">Godzina<select id="rem-time">${remTimes().map(t=>`<option value="${t}" ${t==="0800"?"selected":""}>${t.slice(0,2)}:${t.slice(2)}</option>`).join("")}</select></label>
    <button class="btn sec" data-act="reminder">Dodaj do Kalendarza</button></div>
  <div class="card"><div class="pname">Twoje dane</div>
    <div class="pmeta">Wszystko jest zapisane tylko na tym telefonie (${days} ${plural(days,["dzień","dni","dni"])} historii). Zrób kopię co jakiś czas, żeby nic nie zginęło.</div>
    <div class="pmeta"><b>Ostatnia kopia:</b> ${S.prefs.lastBackup?`${esc(fullDate(S.prefs.lastBackup))} (${daysSince(S.prefs.lastBackup)===0?"dziś":daysSince(S.prefs.lastBackup)+" "+plural(daysSince(S.prefs.lastBackup),["dzień","dni","dni"])+" temu"})`:"jeszcze nie było"}. Przypomnimy co 7 dni.</div>
    <div class="btns"><button class="btn sec" data-act="export">Eksportuj kopię</button><button class="btn sec" data-act="import">Importuj kopię</button></div>
    <input type="file" id="import-file" accept="application/json,.json" hidden>
    <button class="btn danger" data-act="wipe">Usuń wszystkie dane</button></div>
  <div class="card"><div class="pname">O aplikacji</div>
    <div class="pmeta">Wassup ${APP_VERSION} · wersja testowa. Wassup informuje i liczy, ale nie zaleca dawek ani nie zastępuje porady lekarza lub farmaceuty. Suplementy są dla osób zdrowych i nie zastępują zróżnicowanej diety.</div></div>
  </section>`;
}
function remTimes(){ const o=[]; for(let h=6;h<24;h++) for(const m of ["00","30"]) o.push(String(h).padStart(2,"0")+m); return o; }

/* ============ Arkusze ============ */
function sheet(title,html){
  document.getElementById("overlay").innerHTML=`<div class="sheet-bg" data-act="close-bg"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><button class="link" data-act="close">Anuluj</button><h2>${esc(title)}</h2><button class="iconbtn" data-act="close" aria-label="Zamknij">${I.x}</button></div>
    <div class="sheet-body">${html}</div></div></div>`;
  document.body.classList.add("locked");
}
function closeSheet(){ document.getElementById("overlay").innerHTML=""; document.body.classList.remove("locked"); FORM=null; }
let QTY=null;
function qtySheet(id){ const p=S.products.find(x=>x.id===id); QTY={id,u:taken(DAY,id)};
  sheet(p.name,`<div class="pmeta">${esc(cap(dayLabel(DAY)))}: ile ${UNITS[p.unit][2]} przyjąłeś?</div>
  <div class="stepper"><button data-act="q-" aria-label="Mniej">−</button><b class="num" id="qv">${QTY.u}</b><button data-act="q+" aria-label="Więcej">+</button></div>
  <div class="pmeta" id="qd" style="text-align:center">${doseText(p,QTY.u)||"0"}</div>
  <button class="btn full" data-act="q-save">Zapisz</button>`); }

/* --- formularz produktu z dynamicznym składem --- */
let FORM=null;
function productSheet(id){
  const p=id?S.products.find(x=>x.id===id):null;
  const v=p||{name:"",brand:"",type:"suplement",unit:"kapsulka",content:{},daily:1,producerDaily:"",form:""};
  FORM={ rows:Object.keys(v.content).filter(n=>v.content[n]&&NUTR[n]).map(n=>({n,amt:String(v.content[n]).replace(".",","),u:NUTR[n].unit})) };
  if(!FORM.rows.length) FORM.rows=[{n:"",amt:"",u:""}];
  const catalog=CATALOG.filter(c=>!S.products.some(x=>x.cid===c.cid));
  sheet(p?"Edytuj produkt":"Dodaj produkt",`
  ${!p&&catalog.length?`<div class="pmeta">Z katalogu</div><div class="list">${catalog.map(c=>`<button class="row" style="width:100%;text-align:left" data-act="cat-add" data-cid="${c.cid}">${syms(c.content)}<div class="grow"><div class="pname">${esc(c.name)}</div><div class="pmeta">${esc(c.brand)} · ${compText(c)}</div></div><span class="pmeta">Dodaj</span></button>`).join("")}</div><div class="pmeta">albo wpisz własny z etykiety</div>`:""}
  <label class="f">Nazwa<input id="p-name" value="${esc(v.name)}" placeholder="np. Witamina C 1000" autocomplete="off"></label>
  <div class="f-row"><label class="f">Marka<input id="p-brand" value="${esc(v.brand)}" autocomplete="off"></label>
  <label class="f">Rodzaj<select id="p-type"><option value="suplement">Suplement diety</option><option value="lek" ${v.type==="lek"?"selected":""}>Lek OTC</option></select></label></div>
  <label class="f">Jednostka<select id="p-unit">${Object.keys(UNITS).map(u=>`<option value="${u}" ${v.unit===u?"selected":""}>${UNITS[u][0]}</option>`).join("")}</select></label>
  <div class="fieldset"><div class="pname">Skład w 1 jednostce</div><div class="pmeta">Przepisz z tabeli składu na etykiecie: ilość samego składnika, nie całego związku.</div>
    <div id="rows">${rowsHTML()}</div>
    <button class="btn sec" data-act="row-add">+ Dodaj składnik</button></div>
  <label class="f">Forma (opcjonalnie)<input id="p-form" value="${esc(v.form||"")}" placeholder="np. cytrynian magnezu" autocomplete="off"></label>
  <div class="f-row"><label class="f">Twoja porcja dzienna<input id="p-daily" inputmode="decimal" value="${v.daily}"></label><label class="f">Zalecenie producenta<input id="p-prod" inputmode="decimal" value="${v.producerDaily||""}"></label></div>
  <label class="f">Ile sztuk zostało w opakowaniu (opcjonalnie)<input id="p-stock" inputmode="numeric" value="${p&&stockLeft(p)!=null?stockLeft(p):""}"></label>
  <button class="btn full" data-act="p-save" data-id="${p?p.id:""}">Zapisz</button>
  ${p&&!p.ended?`<button class="btn sec full" data-act="end" data-id="${p.id}">Kończę z tym produktem</button>`:""}
  ${p?`<button class="btn danger full" data-act="p-del" data-id="${p.id}">Usuń z Apteczki i historii</button>`:""}`);
}
function rowsHTML(){
  return FORM.rows.map((r,i)=>{ const used=FORM.rows.filter((x,j)=>j!==i).map(x=>x.n);
    return `<div class="crow">
      <select data-row="${i}" data-k="n" aria-label="Składnik ${i+1}"><option value="">Wybierz składnik</option>${ORDER.map(n=>`<option value="${n}" ${r.n===n?"selected":""} ${used.includes(n)?"disabled":""}>${esc(NUTR[n].name)}</option>`).join("")}</select>
      <input data-row="${i}" data-k="amt" inputmode="decimal" placeholder="ilość" value="${esc(r.amt)}" aria-label="Ilość">
      ${r.n==="d"?`<select data-row="${i}" data-k="u" aria-label="Jednostka"><option ${r.u!=="IU"?"selected":""}>µg</option><option ${r.u==="IU"?"selected":""}>IU</option></select>`:`<span class="unit">${r.n?NUTR[r.n].unit:""}</span>`}
      <button class="iconbtn" data-act="row-del" data-i="${i}" aria-label="Usuń składnik">${I.x}</button></div>`; }).join("");
}
function refillSheet(id){ const p=S.products.find(x=>x.id===id), c=CATALOG.find(x=>x.cid===p.cid), left=stockLeft(p), def=(p.stock&&p.stock.pack)||(c&&c.pack)||30, U=UNITS[p.unit]||UNITS.porcja;
  sheet(p.name,`<div class="pmeta">${left!=null?`Zostało: ${left} ${plural(left,U)}. `:""}Wpisz, ile ${U[2]} ma nowe opakowanie. Dodamy je do zapasu.</div>
  <label class="f">Sztuk w nowym opakowaniu<input id="r-add" inputmode="numeric" value="${def}"></label>
  ${left==null?`<label class="f">Albo wpisz, ile masz teraz łącznie<input id="r-total" inputmode="numeric" placeholder="np. 24"></label>`:""}
  <button class="btn full" data-act="refill-save" data-id="${p.id}">Zapisz</button>
  <p class="src">Wassup liczy zapas z tego, co odhaczasz. Jeśli coś się nie zgadza, popraw liczbę w Edytuj.</p>`); }
function endSheet(id){ const p=S.products.find(x=>x.id===id);
  sheet("Kończysz z tym produktem?",`<div class="pmeta"><b>${esc(p.name)}</b> zniknie z planu na ekranie Dziś i z bilansu. Historia przyjęć zostaje, a produkt wznowisz w Apteczce w sekcji „Zakończone”.</div>
  <div class="note">Dobry moment, żeby sprawdzić, czy suplement jest potrzebny: kreator „Czy potrzebuję suplementów?” na ekranie Dziś albo badanie, jeśli je planujesz.</div>
  <button class="btn full" data-act="end-yes" data-id="${p.id}">Tak, kończę</button>`); }
function wipeSheet(){ sheet("Usunąć wszystkie dane?",`<div class="pmeta">Profil, Apteczka i cała historia znikną z tego telefonu. Tego nie da się cofnąć, chyba że masz kopię.</div><button class="btn danger full" data-act="wipe-yes">Usuń wszystko</button>`); }

/* ============ Akcje ============ */
function num(id){ const el=document.getElementById(id); if(!el) return null; return parseNum(el.value); }
function parseNum(s){ const v=parseFloat(String(s).replace(/\s/g,"").replace(",",".")); return isFinite(v)?v:null; }
function fromCatalog(cid){ const c=CATALOG.find(x=>x.cid===cid); return { id:uid(), cid:c.cid, name:c.name, brand:c.brand, type:c.type, unit:c.unit, content:{...c.content}, form:c.form, daily:1, producerDaily:c.producerDaily, info:c.info, stock:null }; }
let toastT;
function toast(msg){ clearTimeout(toastT); let t=document.querySelector(".toast"); if(!t){ t=document.createElement("div"); t.className="toast"; t.setAttribute("role","status"); document.body.appendChild(t); } t.textContent=msg; toastT=setTimeout(()=>t.remove(),2600); }
function takenToday(p){ return taken(today(),p.id); }

document.addEventListener("click", async e=>{
  const tab=e.target.closest("[data-tab]"); if(tab){ TAB=tab.dataset.tab; if(TAB==="today") DAY=today(); render(); window.scrollTo(0,0); return; }
  const sx=e.target.closest("[data-ob-sex]"); if(sx){ OB.sex=sx.dataset.obSex; render(); return; }
  const pk=e.target.closest("[data-ob-pick]"); if(pk){ OB.pick[pk.dataset.obPick]=!OB.pick[pk.dataset.obPick]; render(); return; }
  const lff=e.target.closest("[data-lf-flag]"); if(lff){ readLF(); LF.flag=lff.dataset.lfFlag; document.getElementById("lf-prev").innerHTML=lfPreview(); return; }
  const ms=e.target.closest("[data-sex]"); if(ms){ S.profile.sex=ms.dataset.sex; if(S.profile.sex==="m") S.profile.state="none"; save(); render(); return; }
  const a=e.target.closest("[data-act]"); if(!a) return;
  const act=a.dataset.act, id=a.dataset.id;
  if(periodAct(act,a)) return;
  if(reportAct(act,a)) return;
  if(act==="close-bg"){ if(e.target===a) closeSheet(); return; }
  if(act==="close"){ closeSheet(); return; }
  if(act==="info"){ infoSheet(a.dataset.k); return; }
  if(act==="diet"||act==="dw-again"){ dietStart(); return; }
  if(act==="diet-show"){ dietResultSheet(); return; }
  if(act==="dw-next"){ DW.goal=document.getElementById("dw-goal").value; DW.step=2; dietSheet(); return; }
  if(act==="dw-ffq"){ DW.step=3; dietSheet(); return; }
  if(act==="dw-import"){ document.getElementById("dw-file").click(); return; }
  if(act==="dw-calc"){ readFFQ(); saveDiet("ffq", ffqIntake(DW.ans)); return; }
  if(act==="dw-remap"){ document.querySelectorAll("[data-map]").forEach(el=>{ if(el.value) S.foodMap[fNorm(el.dataset.map)]=el.value; }); save(); computeImport(); toast("Przeliczono"); return; }
  if(act==="pack"){ packSheet(id); return; }
  if(act==="pack-save"||act==="goal-save"||act==="goal-plan"){
    const items = act==="pack-save" ? [...document.querySelectorAll("[data-goal]")].map(el=>[el.dataset.goal, el.value.trim()]) : [[a.dataset.n, act==="goal-plan"?String(planned()[a.dataset.n]):document.getElementById("g-val").value.trim()]];
    const warns=[];
    for(const [n,raw] of items){ if(raw===""){ continue; } const v=parseNum(raw), c=checkGoal(n,v); if(c.err){ toast(c.err); return; } if(c.warn) warns.push(c.warn); }
    for(const [n,raw] of items){ if(raw===""){ if(act==="pack-save") delete S.goals[n]; continue; } S.goals[n]=Math.round(parseNum(raw)*1000)/1000; }
    if(act==="pack-save" && !S.packs.includes(id)) S.packs.push(id);
    save(); closeSheet(); render(); toast(warns.length?warns[0]:"Zapisano cel"); return; }
  if(act==="goal-del"){ delete S.goals[a.dataset.n]; save(); render(); toast("Usunięto cel"); return; }
  if(act==="pack-off"){ S.packs=S.packs.filter(x=>x!==id); save(); closeSheet(); render(); toast("Pakiet wyłączony. Cele zostały, usuniesz je w Wiedzy."); return; }
  if(act==="ob-done"){ S.profile={sex:OB.sex, age:(document.getElementById("ob-age")||{}).value||OB.age, state:OB.sex==="f"?((document.getElementById("ob-state")||{}).value||"none"):"none"}; S.created=today();
    S.products=CATALOG.filter(c=>OB.pick[c.cid]).map(c=>fromCatalog(c.cid)); save(); TAB="today"; render(); return; }
  if(act==="day-prev"){ DAY=addDays(DAY,-1); render(); return; }
  if(act==="day-next"){ if(DAY<today()) DAY=addDays(DAY,1); render(); return; }
  if(act==="toggle"){ const p=S.products.find(x=>x.id===id); S.log[DAY]=S.log[DAY]||{}; const cur=S.log[DAY][id]||0; const dd=dailyOn(p,DAY); S.log[DAY][id]=cur>=dd?0:dd; if(!S.log[DAY][id]) delete S.log[DAY][id]; if(!Object.keys(S.log[DAY]).length) delete S.log[DAY]; save(); render(); try{ navigator.vibrate&&navigator.vibrate(10); }catch(_){} return; }
  if(act==="qty"){ qtySheet(id); return; }
  if(act==="q-"||act==="q+"){ QTY.u=Math.max(0,Math.min(10,QTY.u+(act==="q+"?1:-1))); const p=S.products.find(x=>x.id===QTY.id); document.getElementById("qv").textContent=QTY.u; document.getElementById("qd").textContent=doseText(p,QTY.u)||"0"; return; }
  if(act==="q-save"){ S.log[DAY]=S.log[DAY]||{}; if(QTY.u) S.log[DAY][QTY.id]=QTY.u; else delete S.log[DAY][QTY.id]; if(!Object.keys(S.log[DAY]).length) delete S.log[DAY]; save(); closeSheet(); render(); return; }
  if(act==="add"){ productSheet(null); return; }
  if(act==="edit"){ productSheet(id); return; }
  if(act==="row-add"){ FORM.rows.push({n:"",amt:"",u:""}); document.getElementById("rows").innerHTML=rowsHTML(); return; }
  if(act==="row-del"){ FORM.rows.splice(+a.dataset.i,1); if(!FORM.rows.length) FORM.rows.push({n:"",amt:"",u:""}); document.getElementById("rows").innerHTML=rowsHTML(); return; }
  if(act==="cat-add"){ S.products.push(fromCatalog(a.dataset.cid)); save(); closeSheet(); render(); toast("Dodano do Apteczki"); return; }
  if(act==="p-save"){
    const name=(document.getElementById("p-name").value||"").trim(); if(!name){ toast("Wpisz nazwę produktu"); return; }
    const content={};
    for(const r of FORM.rows){ if(!r.n) continue; let v=parseNum(r.amt); if(v==null||v<=0) continue; if(r.n==="d" && r.u==="IU") v=v/40; content[r.n]=Math.round(v*1000)/1000; }
    if(!Object.keys(content).length){ toast("Wybierz składnik i wpisz jego ilość"); return; }
    let p=id?S.products.find(x=>x.id===id):null; if(!p){ p={id:uid(),stock:null}; S.products.push(p); }
    Object.assign(p,{ name, brand:document.getElementById("p-brand").value.trim(), type:document.getElementById("p-type").value, unit:document.getElementById("p-unit").value, content, form:document.getElementById("p-form").value.trim(), producerDaily:num("p-prod")||null });
    { const nd=num("p-daily")||1; if(p.daily==null) p.daily=nd; else setDaily(p,nd); }
    const st=num("p-stock"); if(st!=null) p.stock={count:st+takenToday(p), since:today()};
    save(); closeSheet(); render(); toast("Zapisano"); return; }
  if(act==="p-del"){ S.products=S.products.filter(x=>x.id!==id); save(); closeSheet(); render(); toast("Usunięto z Apteczki"); return; }
  if(act==="refill"){ closeSheet(); refillSheet(id); return; }
  if(act==="refill-save"){ const p=S.products.find(x=>x.id===id); const tot=num("r-total"), add=num("r-add"); const left=stockLeft(p);
    if(tot!=null && tot>=0){ p.stock={count:Math.round(tot)+takenToday(p), since:today(), pack:add&&add>0?Math.round(add):(p.stock&&p.stock.pack)}; }
    else { if(add==null||add<=0){ toast("Wpisz liczbę sztuk"); return; } p.stock={count:(left||0)+Math.round(add)+takenToday(p), since:today(), pack:Math.round(add)}; }
    if(S.prefs.snooze) delete S.prefs.snooze[id]; save(); closeSheet(); render(); toast("Zapas zaktualizowany"); return; }
  if(act==="end"){ closeSheet(); endSheet(id); return; }
  if(act==="end-yes"){ const p=S.products.find(x=>x.id===id); p.ended=today(); save(); closeSheet(); render(); toast("Produkt przeniesiony do Zakończonych"); return; }
  if(act==="resume"){ const p=S.products.find(x=>x.id===id); delete p.ended; save(); render(); toast("Produkt wrócił do planu. Sprawdź zapas."); return; }
  if(act==="backup-snooze"){ S.prefs.backupSnooze=today(); save(); render(); toast("Przypomnimy za tydzień"); return; }
  if(act==="snooze"){ S.prefs.snooze=S.prefs.snooze||{}; S.prefs.snooze[id]=today(); save(); render(); toast("Przypomnimy jutro"); return; }
  if(act==="dose-"||act==="dose+"){ const p=S.products.find(x=>x.id===id); setDaily(p,Math.max(1,Math.min(10,(act==="dose+"?Math.floor(p.daily)+1:Math.ceil(p.daily)-1)))); save(); render(); return; }
  if(act==="lab"||act==="lab-add"){ closeSheet(); labForm(null,a.dataset.k); return; }
  if(act==="lab-open"){ labDetail(a.dataset.k); return; }
  if(act==="lab-edit"){ closeSheet(); labForm(id); return; }
  if(act==="lab-save"){ const wasOff=TAB!=="labs"; if(labSave()){ closeSheet(); render(); toast(wasOff?"Zapisano. Wynik znajdziesz w zakładce Badania":"Zapisano wynik"); } return; }
  if(act==="lab-del"){ S.labs=S.labs.filter(x=>x.id!==id); save(); closeSheet(); render(); toast("Usunięto wynik"); return; }
  if(act==="go-labs"){ S.prefs.labsMode=true; save(); TAB="labs"; render(); window.scrollTo(0,0); return; }
  if(act==="reminder"){ const t=document.getElementById("rem-time").value; window.location.href=`reminders/przypomnienie-${t}.ics`; return; }
  if(act==="export"){ await exportData(); return; }
  if(act==="import"){ document.getElementById("import-file").click(); return; }
  if(act==="wipe"){ wipeSheet(); return; }
  if(act==="wipe-yes"){ S=blank(); save(); closeSheet(); TAB="today"; render(); return; }
});
async function exportData(){
  const name=`wassup-kopia-${today()}.json`, blob=new Blob([JSON.stringify(S,null,1)],{type:"application/json"});
  try{ const file=new File([blob],name,{type:"application/json"}); if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:"Kopia Wassup"}); backupDone(); return; } }catch(e){ if(e && e.name==="AbortError") return; }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); backupDone();
}
function backupDone(){ S.prefs.lastBackup=today(); delete S.prefs.backupSnooze; save(); render(); toast("Kopia gotowa. Zachowaj plik w bezpiecznym miejscu."); }
function daysSince(k){ return Math.round((parseKey(today())-parseKey(k))/864e5); }
function backupDue(){ const last=S.prefs.lastBackup, sn=S.prefs.backupSnooze; if(sn && daysSince(sn)<7) return false; if(last) return daysSince(last)>=7; return daysSince(S.created||today())>=7 && Object.keys(S.log).length>0; }
document.addEventListener("change", e=>{
  const el=e.target;
  if(periodChange(el)) return;
  if(el.dataset && el.dataset.row!=null){ const r=FORM.rows[+el.dataset.row]; r[el.dataset.k]=el.value; if(el.dataset.k==="n"){ r.u=el.value?NUTR[el.value].unit:""; document.getElementById("rows").innerHTML=rowsHTML(); } return; }
  if(el.dataset && el.dataset.risk){ DW.risk[el.dataset.risk]=el.checked; return; }
  if(el.id==="dw-file"){ const f=el.files[0]; if(f) importFile(f); return; }
  if(el.id==="lf-m"){ readLF(); LF.m=el.value; LF.unit=""; prefillRange(); labSheet(); return; }
  if(el.id==="lf-unit" && el.tagName==="SELECT"){ readLF(); if(!LF.lo&&!LF.hi) prefillRange(); else LF.prefilled=false; labSheet(); return; }
  if(el.id==="labs-mode"){ S.prefs.labsMode=el.checked; save(); render(); toast(el.checked?"Dodano zakładkę Badania":"Ukryto zakładkę Badania. Wyniki zostały zapisane."); return; }
  if(el.id==="only-left"){ S.prefs.onlyLeft=el.checked; save(); render(); return; }
  if(el.id==="hist-n"||el.id==="know-n"){ KNOW=el.value; render(); return; }
  if(el.id==="me-age"){ S.profile.age=el.value; save(); render(); }
  if(el.id==="me-state"){ S.profile.state=el.value; save(); render(); }
  if(el.id==="ob-age"){ OB.age=el.value; }
  if(el.id==="ob-state"){ OB.state=el.value; }
  if(el.id==="import-file"){ const f=el.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(r.result); if(!d||d.v!==1||!Array.isArray(d.products)) throw 0; S=fill(d); save(); render(); toast("Wczytano kopię"); }catch(_){ toast("To nie jest plik kopii Wassup"); } }; r.readAsText(f); }
});
document.addEventListener("input", e=>{
  const el=e.target;
  if(el.dataset && el.dataset.row!=null && el.dataset.k==="amt"){ FORM.rows[+el.dataset.row].amt=el.value; return; }
  if(el.id==="lf-val"||el.id==="lf-lo"||el.id==="lf-hi"){ readLF(); document.getElementById("lf-prev").innerHTML=lfPreview(); return; }
  if(el.id==="iu"){ const v=parseNum(el.value); document.getElementById("ug").value=v!=null?fmt(v/40,2):""; }
  if(el.id==="ug"){ const v=parseNum(el.value); document.getElementById("iu").value=v!=null?String(Math.round(v*40)):""; }
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && document.querySelector(".sheet")) closeSheet(); });
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible" && TAB==="today" && DAY!==today()){ DAY=today(); render(); } });

render();
if("serviceWorker" in navigator && location.protocol==="https:" && /github\.io$/.test(location.hostname)){ try{ navigator.serviceWorker.register("sw.js"); }catch(e){} }
