
/* ============ Czy potrzebuję suplementów? (ankieta + import jadłospisu) ============
   Skład żywności: USDA National Nutrient Database SR28 (domena publiczna); produkty wzbogacane w USA
   zastąpione wersjami niewzbogacanymi, bo polskiej żywności zwykle się nie wzbogaca. */
const FOODS = __FOODS__;
const FOOD_BY = Object.fromEntries(FOODS.map(f=>[f.name,f]));
const DIET_NUTR = ["mg","ca","fe","zn","pot","se","c","b6","b12","fol","k","om3","d","i","bio"];
const NOT_FROM_DIET = { d:"Witaminy D nie ocenimy z diety: głównym źródłem jest synteza w skórze pod wpływem słońca. Polskie zalecenia przewidują suplementację u większości osób jesienią i zimą. Dawkę ustal z lekarzem, a poziom pokaże badanie 25(OH)D.",
  i:"Jodu nie liczymy z jadłospisu: głównym źródłem w Polsce jest sól jodowana, a zawartość jodu w produktach bardzo się różni.",
  bio:"Brak wiarygodnych danych o biotynie w tabelach składu żywności." };
const LAB_NOTE = { fe:"Pewną odpowiedź da badanie krwi (morfologia, ferrytyna). Żelazo z suplementu bierz tylko, gdy badanie to potwierdzi.", b12:"Pewną odpowiedź da badanie poziomu witaminy B12 we krwi." };
const UNSURE_NOTE = { se:"Wartości selenu pochodzą z tabel amerykańskich. W Europie zboża zawierają go zwykle mniej, więc wynik może być zawyżony." };
const SOURCES = {
  mg:"kasza gryczana, płatki owsiane, pestki dyni, migdały, strączki, pieczywo pełnoziarniste, gorzka czekolada",
  ca:"mleko, jogurt, kefir, sery, tofu z wapniem, sezam, jarmuż",
  fe:"czerwone mięso, wątróbka, strączki, kasza jaglana i gryczana, pestki dyni (z warzywami bogatymi w witaminę C)",
  zn:"wołowina, sery żółte, pestki dyni, kasza gryczana, płatki owsiane, strączki",
  pot:"ziemniaki, pomidory, strączki, banany, warzywa liściaste",
  se:"ryby, jaja, mięso, pieczywo pełnoziarniste",
  c:"papryka, natka pietruszki, kiwi, cytrusy, truskawki, brokuł, kapusta kiszona",
  b6:"drób, ryby, ziemniaki, banany, strączki, orzechy",
  b12:"ryby, mięso, jaja, nabiał (w diecie roślinnej potrzebne jest źródło spoza roślin)",
  fol:"zielone warzywa liściaste, brokuł, strączki, pieczywo pełnoziarniste, wątróbka",
  k:"jarmuż, szpinak, brokuł, sałata, kapusta",
  om3:"tłuste ryby morskie (łosoś, makrela, śledź, sardynki) 1–2 razy w tygodniu"
};
function fNorm(s){ return String(s||"").replace(/ł/g,"l").replace(/Ł/g,"L").normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9%= ]/g," ").replace(/\s+/g," ").trim(); }
function matchFood(name){
  const key=fNorm(name); if(S.foodMap && S.foodMap[key]) return FOOD_BY[S.foodMap[key]]||null;
  const s=" "+key+" ";
  for(const f of FOODS) for(const p of f.p){ if(p.split(" ").every(t=> t.endsWith("=") ? s.includes(" "+t.slice(0,-1)+" ") : s.includes(" "+t))) return f; }
  return null;
}
function vecAvg(names){ const v={}; names.forEach(nm=>{ const f=FOOD_BY[nm]; for(const k in f.n) v[k]=(v[k]||0)+f.n[k]/names.length; }); return v; }
const GROUPS = {
  breadWhite:vecAvg(["Bułka / chleb pszenny"]), breadWhole:vecAvg(["Chleb graham / pełnoziarnisty","Chleb żytni"]),
  grains:vecAvg(["Płatki owsiane","Kasza gryczana (sucha)","Ryż biały (suchy)","Makaron (suchy)","Kasza jaglana (sucha)"]),
  potato:vecAvg(["Ziemniaki"]), veg:vecAvg(["Pomidor","Ogórek","Marchew","Papryka","Cebula","Kapusta","Kalafior","Cukinia"]),
  leafy:vecAvg(["Szpinak","Jarmuż","Brokuł","Sałata / mix sałat","Rukola"]), fruit:vecAvg(["Jabłko","Banan","Pomarańcza","Gruszka","Truskawki","Śliwka"]),
  legumes:vecAvg(["Ciecierzyca (konserwa)","Fasola czerwona (konserwa)","Fasola biała (konserwa)","Tofu"]),
  nuts:vecAvg(["Orzechy włoskie","Migdały","Orzechy laskowe","Pestki dyni","Słonecznik"]),
  milk:vecAvg(["Mleko 2%","Jogurt naturalny","Kefir"]), cheese:vecAvg(["Ser żółty (gouda)","Twaróg"]), egg:vecAvg(["Jajko"]),
  meat:vecAvg(["Pierś z kurczaka","Schab","Wołowina","Szynka wieprzowa","Pierś z indyka"]),
  fatfish:vecAvg(["Łosoś","Makrela","Śledź"]), leanfish:vecAvg(["Dorsz","Mintaj","Tuńczyk (w wodzie)"])
};
const W=x=>x/7;
const FFQ = [
  { id:"bread", q:"Ile kromek pieczywa (lub bułek) jesz dziennie?", g:35, opts:[["nie jem",0],["1–2",1.5],["3–4",3.5],["5 i więcej",5.5]] },
  { id:"breadType", q:"Jakie pieczywo przeważa?", opts:[["głównie białe, pszenne","white"],["pół na pół","mix"],["głównie pełnoziarniste lub żytnie","whole"]] },
  { id:"grains", q:"Kasze, ryż, makaron, płatki: ile porcji dziennie?", hint:"porcja ≈ 60 g suchego produktu", g:60, group:"grains", opts:[["rzadko",0.15],["1",1],["2",2],["3 i więcej",3]] },
  { id:"potato", q:"Ziemniaki: ile razy w tygodniu?", hint:"porcja ≈ 2–3 ziemniaki", g:200, group:"potato", opts:[["wcale",0],["1–2",W(1.5)],["3–4",W(3.5)],["5 i więcej",W(6)]] },
  { id:"veg", q:"Warzywa (bez ziemniaków): ile porcji dziennie?", hint:"porcja ≈ garść, 100 g", g:100, group:"veg", opts:[["0–1",0.5],["2",2],["3",3],["4 i więcej",4.5]] },
  { id:"leafy", q:"Zielone liściaste (szpinak, jarmuż, brokuł, sałata): ile razy w tygodniu?", g:80, group:"leafy", opts:[["wcale",0],["1–2",W(1.5)],["3–5",W(4)],["codziennie",1]] },
  { id:"fruit", q:"Owoce: ile porcji dziennie?", hint:"porcja ≈ jabłko, banan, garść jagód", g:120, group:"fruit", opts:[["0",0],["1",1],["2",2],["3 i więcej",3.2]] },
  { id:"legumes", q:"Strączki lub tofu: ile razy w tygodniu?", hint:"porcja ≈ pół szklanki ugotowanych", g:100, group:"legumes", opts:[["wcale",0],["1",W(1)],["2–3",W(2.5)],["4 i więcej",W(5)]] },
  { id:"nuts", q:"Orzechy lub pestki: ile garści w tygodniu?", hint:"garść ≈ 30 g", g:30, group:"nuts", opts:[["wcale",0],["1–2",W(1.5)],["3–5",W(4)],["codziennie",1]] },
  { id:"milk", q:"Mleko, jogurt, kefir: ile szklanek lub kubków dziennie?", g:250, group:"milk", opts:[["wcale",0],["mniej niż 1",0.5],["1",1],["2 i więcej",2.2]] },
  { id:"cheese", q:"Sery (żółty, twaróg): ile porcji dziennie?", hint:"porcja ≈ 2 plastry albo 3 łyżki twarogu", g:40, group:"cheese", opts:[["wcale",0],["co drugi dzień",0.5],["1",1],["2 i więcej",2]] },
  { id:"egg", q:"Jajka: ile sztuk w tygodniu?", g:55, group:"egg", opts:[["wcale",0],["1–2",W(1.5)],["3–5",W(4)],["6 i więcej",W(8)]] },
  { id:"meat", q:"Mięso i wędliny: ile porcji w tygodniu?", hint:"porcja ≈ 120 g", g:120, group:"meat", opts:[["wcale",0],["1–3",W(2)],["4–6",W(5)],["codziennie",1.1]] },
  { id:"fatfish", q:"Tłuste ryby morskie (łosoś, makrela, śledź, sardynki): ile porcji w tygodniu?", g:100, group:"fatfish", opts:[["wcale",0],["rzadziej niż raz",W(0.4)],["1",W(1)],["2 i więcej",W(2.2)]] },
  { id:"leanfish", q:"Chude ryby lub owoce morza (dorsz, mintaj, tuńczyk): ile porcji w tygodniu?", g:100, group:"leanfish", opts:[["wcale",0],["rzadziej niż raz",W(0.4)],["1",W(1)],["2 i więcej",W(2.2)]] },
  { id:"salt", q:"Czy w domu używasz soli jodowanej?", opts:[["tak","yes"],["nie","no"],["nie wiem","dk"]] },
  { id:"sun", q:"Od maja do września: czy spędzasz na słońcu min. 15 minut dziennie z odsłoniętymi rękami?", opts:[["prawie codziennie","often"],["czasem","some"],["rzadko","rare"]] }
];
let DW=null; // stan kreatora
function ffqIntake(ans){
  const t={}; const add=(vec,grams)=>{ for(const k in vec) t[k]=(t[k]||0)+vec[k]*grams/100; };
  const bq=FFQ[0], bt=ans.breadType||"mix", per=bq.opts[ans.bread??1][1]*bq.g;
  if(bt==="white") add(GROUPS.breadWhite,per); else if(bt==="whole") add(GROUPS.breadWhole,per); else { add(GROUPS.breadWhite,per/2); add(GROUPS.breadWhole,per/2); }
  FFQ.filter(q=>q.group).forEach(q=>{ const o=q.opts[ans[q.id]??0]; add(GROUPS[q.group], o[1]*q.g); });
  return t;
}
function verdict(n,v,method){
  const nm=norms(), norm=nm[n];
  if(NOT_FROM_DIET[n]) return {c:"na",t:"Nie oceniamy z diety",note:NOT_FROM_DIET[n]};
  if(!norm) return {c:"na",t:"Brak normy"};
  const r=v/norm, hi=method==="ffq"?1.1:1.0, lo=method==="ffq"?0.7:0.75;
  let out = r>=hi?{c:"ok",t:"Dieta prawdopodobnie pokrywa normę"} : r>=lo?{c:"warn",t:"Blisko normy, niepewne"} : {c:"bad",t:"Prawdopodobnie poniżej normy"};
  if(n==="se" && out.c==="ok") out={c:"warn",t:"Niepewne"};
  out.note=[UNSURE_NOTE[n],LAB_NOTE[n]].filter(Boolean).join(" ");
  return out;
}

/* --- UI kreatora --- */
function dietStart(){ DW={step:1, risk:{}, goal:"none", ans:{}}; dietSheet(); }
function dietSheet(){
  const st=DW.step;
  if(st===1){ sheet("Czy potrzebuję suplementów?",`
    <div class="pmeta">Suplementy są dla osób zdrowych i tylko uzupełniają dietę. Zanim coś kupisz, odpowiedz na trzy pytania.</div>
    <div class="fieldset"><div class="pname">1. Czy należysz do grupy, która częściej potrzebuje suplementacji?</div>
      ${[["preg","ciąża, karmienie albo planowanie ciąży"],["vegan","dieta roślinna (wegańska)"],["senior","wiek 65+"],["sport","intensywny trening"],["ill","choroba przewlekła albo stałe leki"]].map(([k,l])=>`<label class="checkrow"><input type="checkbox" data-risk="${k}" ${DW.risk[k]?"checked":""}> ${l}</label>`).join("")}
    </div>
    <div class="fieldset"><div class="pname">2. Czy Twoja dieta jest zróżnicowana?</div><div class="pmeta">Sprawdzimy to w następnym kroku: ankietą albo plikiem z jadłospisem.</div></div>
    <div class="fieldset"><div class="pname">3. Czy masz konkretny cel?</div>
      <select class="fsel" id="dw-goal">${[["none","nie, biorę „na wszelki wypadek”"],["fatigue","mniej zmęczenia"],["muscles","prawidłowa praca mięśni"],["hair","włosy, skóra, paznokcie"],["other","inny, konkretny cel"]].map(([v,l])=>`<option value="${v}" ${DW.goal===v?"selected":""}>${l}</option>`).join("")}</select></div>
    <div class="src">Pytania na podstawie artykułu dr. Pawła Szewczyka „Jak sprawdzić, czy potrzebuję tego suplementu?” (Fundacja Badamy Suplementy).</div>
    <button class="btn full" data-act="dw-next">Dalej</button>`); return; }
  if(st===2){ const notes=[];
    if(DW.risk.ill) notes.push(`<div class="note warn"><b>Choroba albo stałe leki:</b> suplementację omów z lekarzem lub farmaceutą. Składniki suplementów mogą wpływać na działanie leków, a Wassup jest pomyślany dla osób zdrowych.</div>`);
    if(DW.risk.preg) notes.push(`<div class="note warn"><b>Ciąża i jej planowanie</b> to okres, w którym zalecenia obejmują m.in. kwas foliowy, jod, witaminę D i DHA. Ustal je z lekarzem prowadzącym.</div>`);
    if(DW.risk.vegan) notes.push(`<div class="note warn"><b>Dieta roślinna:</b> witamina B12 praktycznie nie występuje w roślinach, więc jej uzupełnianie jest standardem. Warto okresowo badać B12 i ferrytynę.</div>`);
    if(DW.goal==="none") notes.push(`<div class="note">Branie suplementów „na wszelki wypadek” nie jest dobrym powodem. Jeśli dieta pokrywa normy, suplement niczego nie doda, a nadmiar niektórych składników może szkodzić.</div>`);
    sheet("Sprawdźmy Twoją dietę",`${notes.join("")}
    <div class="pmeta">Wybierz sposób. Wynik to przybliżenie, nie diagnoza.</div>
    <button class="card choice" data-act="dw-ffq"><div class="pname">Krótka ankieta</div><div class="pmeta">17 pytań o to, jak zwykle jesz. Ok. 2–3 minuty.</div></button>
    <button class="card choice" data-act="dw-import"><div class="pname">Plik z jadłospisem (np. Fitatu)</div><div class="pmeta">Eksport XLSX lub CSV z produktami i gramaturą, najlepiej z 3–30 dni. Dokładniejszy wynik.</div></button>
    <input type="file" id="dw-file" accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>`); return; }
  if(st===3){ sheet("Jak zwykle jesz?",`<div class="pmeta">Myśl o typowym tygodniu, nie o idealnym.</div>
    ${FFQ.map(q=>`<label class="f">${esc(q.q)}${q.hint?`<span class="src">${esc(q.hint)}</span>`:""}<select data-ffq="${q.id}">${q.opts.map((o,i)=>`<option value="${i}" ${(DW.ans[q.id]??defaultOpt(q))===i?"selected":""}>${esc(o[0])}</option>`).join("")}</select></label>`).join("")}
    <button class="btn full" data-act="dw-calc">Pokaż wynik</button>`); return; }
}
function defaultOpt(q){ return q.id==="breadType"?1:(q.id==="salt"||q.id==="sun")?0:1; }
function readFFQ(){ document.querySelectorAll("[data-ffq]").forEach(el=>{ DW.ans[el.dataset.ffq]=+el.value; }); FFQ.forEach(q=>{ if(DW.ans[q.id]==null) DW.ans[q.id]=defaultOpt(q); }); }
function saveDiet(method, intake, extra){
  const ans=DW?DW.ans:{}; S.diet=Object.assign({ method, date:today(), intake, risk:DW?DW.risk:{}, goal:DW?DW.goal:"none",
    salt:FFQ[15].opts[ans.salt??0]?.[1], sun:FFQ[16].opts[ans.sun??0]?.[1] }, extra||{});
  save(); dietResultSheet();
}
/* --- import pliku --- */
/* Minimalny czytnik XLSX (zip + XML), bez zewnętrznych bibliotek: działa offline. */
async function unzipEntries(buf){
  const dv=new DataView(buf), u8=new Uint8Array(buf); let eocd=-1;
  for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-66000);i--){ if(dv.getUint32(i,true)===0x06054b50){ eocd=i; break; } }
  if(eocd<0) throw new Error("To nie jest plik XLSX.");
  const n=dv.getUint16(eocd+10,true); let p=dv.getUint32(eocd+16,true); const out={}; const td=new TextDecoder();
  for(let k=0;k<n;k++){
    const method=dv.getUint16(p+10,true), csize=dv.getUint32(p+20,true), nlen=dv.getUint16(p+28,true), xlen=dv.getUint16(p+30,true), clen=dv.getUint16(p+32,true), lho=dv.getUint32(p+42,true);
    const name=td.decode(u8.subarray(p+46,p+46+nlen)); p+=46+nlen+xlen+clen;
    out[name]={method,csize,lho};
  }
  return { names:Object.keys(out), async text(name){ const e=out[name]; if(!e) return null;
      const lnl=dv.getUint16(e.lho+26,true), lxl=dv.getUint16(e.lho+28,true), start=e.lho+30+lnl+lxl, data=u8.slice(start,start+e.csize);
      if(e.method===0) return td.decode(data);
      const ds=new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return await new Response(ds).text(); } };
}
async function readXLSX(buf){
  const z=await unzipEntries(buf), P=new DOMParser(), xml=async n=>{ const t=await z.text(n); return t?P.parseFromString(t,"application/xml"):null; };
  const ss=[]; const sst=await xml("xl/sharedStrings.xml"); if(sst) [...sst.getElementsByTagName("si")].forEach(si=>ss.push([...si.getElementsByTagName("t")].map(t=>t.textContent).join("")));
  const wb=await xml("xl/workbook.xml"), rels=await xml("xl/_rels/workbook.xml.rels"); const relMap={};
  if(rels) [...rels.getElementsByTagName("Relationship")].forEach(r=>{ relMap[r.getAttribute("Id")]=r.getAttribute("Target"); });
  const sheets=[...(wb?wb.getElementsByTagName("sheet"):[])].map(s=>{ const rid=s.getAttribute("r:id")||s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id"); let t=relMap[rid]||""; t=t.replace(/^\//,""); if(!t.startsWith("xl/")) t="xl/"+t; return {name:s.getAttribute("name"), path:t}; });
  const col=ref=>{ const m=/^([A-Z]+)/.exec(ref||""); let c=0; if(m) for(const ch of m[1]) c=c*26+ch.charCodeAt(0)-64; return c-1; };
  const result=[];
  for(const sh of sheets){ const doc=await xml(sh.path); if(!doc) continue; const rows=[];
    [...doc.getElementsByTagName("row")].forEach(r=>{ const row=[]; [...r.getElementsByTagName("c")].forEach(c=>{ const t=c.getAttribute("t"), v=c.getElementsByTagName("v")[0]; let val="";
        if(t==="s"&&v) val=ss[+v.textContent]||""; else if(t==="inlineStr") val=[...c.getElementsByTagName("t")].map(x=>x.textContent).join(""); else if(v) val=t==="str"||t==="b"?v.textContent:(isFinite(+v.textContent)?+v.textContent:v.textContent);
        row[col(c.getAttribute("r"))]=val; }); rows.push(Array.from(row,x=>x??"")); });
    result.push({name:sh.name, rows}); }
  return result;
}

function parseCSV(text){ const sep=(text.split("\n")[0].match(/;/g)||[]).length>(text.split("\n")[0].match(/,/g)||[]).length?";":","; return text.split(/\r?\n/).map(line=>{ const out=[]; let cur="",q=false; for(const ch of line){ if(ch==='"'){ q=!q; } else if(ch===sep && !q){ out.push(cur); cur=""; } else cur+=ch; } out.push(cur); return out.map(x=>x.trim()); }); }
function tableToItems(rows){
  for(let h=0; h<Math.min(rows.length,15); h++){
    const r=rows[h].map(x=>fNorm(x));
    const pi=r.findIndex(x=>/^(produkt|nazwa|skladnik|produkt nazwa)/.test(x)), gi=r.findIndex(x=>/ilosc|gram|\(g\)|^g$|waga|masa/.test(x)||x==="ilosc g");
    if(pi<0||gi<0) continue;
    const di=r.findIndex(x=>/^(dzien|data|date)/.test(x));
    const items=[]; for(const row of rows.slice(h+1)){ const name=String(row[pi]??"").trim(); const g=parseNum(row[gi]); if(!name||g==null||g<=0||/^suma|^razem|^total/i.test(fNorm(name))) continue; items.push({name, g, day:di>=0?String(row[di]??""):""}); }
    if(items.length) return items;
  }
  return null;
}
async function importFile(file){
  let rows=null;
  try{
    if(/\.csv$/i.test(file.name)||file.type==="text/csv"){ rows=parseCSV(await file.text()); }
    else if(/\.xls$/i.test(file.name)){ throw new Error("Starszy format XLS nie jest obsługiwany. Wyeksportuj plik jako XLSX albo CSV."); }
    else { const sheets=await readXLSX(await file.arrayBuffer()); for(const sh of sheets){ if(tableToItems(sh.rows)){ rows=sh.rows; break; } } }
  }catch(e){ toast(e.message||"Nie udało się odczytać pliku"); return; }
  const items=rows?tableToItems(rows):null;
  if(!items){ toast("Nie znalazłem w pliku kolumn z nazwą produktu i ilością w gramach."); return; }
  const days=new Set(items.map(i=>i.day).filter(Boolean)).size||1;
  DW=DW||{risk:{},goal:"none",ans:{}}; DW.items=items; DW.days=days;
  computeImport();
}
function computeImport(){
  const t={}, unmatched={}; let gAll=0,gOk=0;
  for(const it of DW.items){ gAll+=it.g; const f=matchFood(it.name); if(!f){ unmatched[it.name]=(unmatched[it.name]||0)+it.g; continue; } gOk+=it.g; for(const k in f.n) t[k]=(t[k]||0)+f.n[k]*it.g/100; }
  for(const k in t) t[k]/=DW.days;
  saveDiet("import", t, { days:DW.days, coverage:gAll?gOk/gAll:0, unmatched:Object.entries(unmatched).sort((a,b)=>b[1]-a[1]).map(([name,g])=>({name,g})), items:DW.items.length });
}
/* --- wynik --- */
function dietResultSheet(){
  const D=S.diet; if(!D){ dietStart(); return; }
  const nm=norms(), ffq=D.method==="ffq";
  const rows=DIET_NUTR.map(n=>{ const v=D.intake[n]||0, vd=verdict(n,v,D.method); return {n,v,vd}; });
  const okN=rows.filter(r=>r.vd.c==="ok").map(r=>NUTR[r.n].sym), lowN=rows.filter(r=>r.vd.c==="bad"), na=rows.filter(r=>r.vd.c==="na");
  const prodNotes=[]; live().forEach(p=>{ Object.keys(p.content).filter(n=>p.content[n]).forEach(n=>{ const r=rows.find(x=>x.n===n); if(!r) return;
      const supp=p.content[n]*p.daily, N=NUTR[n];
      if(r.vd.c==="ok") prodNotes.push(`<li><b>${esc(p.name)}</b> → ${esc(N.name)}: dieta prawdopodobnie już pokrywa normę. Ten składnik z suplementu może być niepotrzebny. Omów to z dietetykiem lub lekarzem.</li>`);
      const sum=(n==="mg"||n==="fol")?supp:r.v+supp;
      if(N.ul && sum>N.ul) prodNotes.push(`<li class="warnli"><b>${esc(p.name)}</b> → ${esc(N.name)}: ${n==="mg"||n==="fol"?"suplementy":"dieta i suplement razem"} dają ok. ${fmt(sum)} ${N.unit}, czyli więcej niż granica bezpieczeństwa (${fmt(N.ul)} ${N.unit}).</li>`);
  }); });
  sheet("Twoja dieta a suplementy",`
    <div class="pmeta">${ffq?"Wynik z ankiety, przybliżony (±25%).":`Wynik z pliku: ${D.items} pozycji, średnio na dzień z ${D.days} ${plural(D.days,["dnia","dni","dni"])}. Rozpoznano ${fmt((D.coverage||0)*100,0)}% masy produktów.`} Stan na ${esc(shortDate(D.date))}.</div>
    <div class="stat"><div><b class="num">${okN.length}</b><span>składników pokrywa dieta</span></div><div><b class="num">${lowN.length}</b><span>prawdopodobnie poniżej normy</span></div><div><b class="num">${na.length}</b><span>do oceny inaczej</span></div></div>
    ${prodNotes.length?`<div class="fieldset"><div class="pname">Twoje suplementy</div><ul class="claims small">${prodNotes.join("")}</ul></div>`:""}
    <div class="list">${rows.map(({n,v,vd})=>{ const N=NUTR[n], norm=nm[n]; return `<div class="row dietrow"><span class="sym">${N.sym}</span>
      <div class="grow"><div class="pname">${esc(N.name)}</div>
        <div class="pmeta num">${vd.c==="na"?(v?`z diety ok. ${fmt(v)} ${N.unit}`:""):`${ffq?`${fmt(v*0.75,0)}–${fmt(v*1.25,0)}`:`ok. ${fmt(v)}`} ${N.unit}${norm?` · ${fmt(v/norm*100,0)}% normy (${fmt(norm)} ${n==="fol"?"µg DFE":N.unit})`:""}`}</div>
        ${vd.note?`<div class="pmeta">${esc(vd.note)}</div>`:""}
        ${(vd.c==="bad"||vd.c==="warn")&&SOURCES[n]?`<div class="pmeta"><b>Najpierw dieta:</b> ${esc(SOURCES[n])}.</div>`:""}
      </div><span class="chip ${vd.c==="na"?"none":vd.c}">${vd.c==="ok"?"pokrywa":vd.c==="warn"?"niepewne":vd.c==="bad"?"poniżej":"inaczej"}</span></div>`; }).join("")}</div>
    ${D.method==="import"&&D.unmatched&&D.unmatched.length?`<div class="fieldset"><div class="pname">Nierozpoznane produkty (${D.unmatched.length})</div><div class="pmeta">Nie liczą się do wyniku. Przypisz je do najbliższego produktu z bazy, a Wassup zapamięta to na przyszłość.</div>
      ${D.unmatched.slice(0,15).map((u,i)=>`<label class="f">${esc(u.name)} <span class="src">${fmt(u.g,0)} g</span><select data-map="${esc(u.name)}"><option value="">wybierz…</option>${FOODS.map(f=>f.name).filter((x,j,a)=>a.indexOf(x)===j).sort((a,b)=>a.localeCompare(b,"pl")).map(f=>`<option>${esc(f)}</option>`).join("")}</select></label>`).join("")}
      ${DW&&DW.items?`<button class="btn sec" data-act="dw-remap">Przelicz z przypisaniami</button>`:`<div class="src">Aby przypisać produkty, wczytaj plik ponownie.</div>`}</div>`:""}
    ${S.diet.salt==="no"?`<div class="note">Bez soli jodowanej łatwo o za mało jodu. Warto porozmawiać o tym z lekarzem lub dietetykiem.</div>`:""}
    ${S.diet.sun==="rare"?`<div class="note">Mało słońca latem zwiększa szansę na niski poziom witaminy D. Badanie 25(OH)D pokaże, jak jest naprawdę.</div>`:""}
    <div class="note"><b>Co dalej:</b> to przybliżenie, nie diagnoza. Wynik „poniżej normy” to sygnał, żeby najpierw zmienić dietę albo porozmawiać z dietetykiem, a nie od razu kupować suplement.</div>
    <div class="src">Skład żywności: USDA National Nutrient Database SR28, z poprawką na brak wzbogacania żywności w Polsce. Normy: NIZP PZH 2024.</div>
    <div class="btns"><button class="btn" data-act="dw-again">Sprawdź ponownie</button><button class="btn sec" data-act="close">Zamknij</button></div>`);
}
function dietCard(){
  const D=S.diet;
  if(!D) return `<button class="card howto diethero" data-act="diet"><div class="ruler" aria-hidden="true"><i></i><i></i><i></i><i></i><i class="u"></i></div><div><div class="pname">Czy w ogóle potrzebuję suplementów?</div><div class="pmeta">Sprawdź swoją dietę: krótka ankieta albo plik z Fitatu. Wynik zostaje na telefonie.</div></div></button>`;
  const ok=DIET_NUTR.filter(n=>verdict(n,D.intake[n]||0,D.method).c==="ok").length, low=DIET_NUTR.filter(n=>verdict(n,D.intake[n]||0,D.method).c==="bad").length;
  return `<button class="card howto" data-act="diet-show"><div class="ruler" aria-hidden="true"><i></i><i></i><i></i><i></i><i class="u"></i></div><div><div class="pname">Twoja dieta: ${ok} składników pokrytych${low?`, ${low} poniżej normy`:""}</div><div class="pmeta">${D.method==="ffq"?"Ankieta":"Plik z jadłospisem"} z ${esc(shortDate(D.date))}. Zobacz szczegóły i wpływ na Twoje suplementy.</div></div></button>`;
}
