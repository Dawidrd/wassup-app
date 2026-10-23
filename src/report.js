/* ============ Raport dla lekarza (v0.9) ============ */
let REP={range:null, back:"labs"};
function repRange(){
  const P=activePeriod(), lastClosed=(S.periods||[]).filter(p=>p.closed).sort((a,b)=>b.start.localeCompare(a.start))[0];
  const per=P?{start:P.start,end:today(),P}:lastClosed?{start:lastClosed.start,end:lastClosed.closed.date,P:lastClosed}:null;
  if(!REP.range) REP.range=per?"period":"90";
  if(REP.range==="period" && per) return {...per,label:"okres do badania kontrolnego"};
  const n=REP.range==="30"?30:90; return {start:addDays(today(),-(n-1)),end:today(),P:P||null,label:`ostatnie ${n} dni`};
}
function repDays(start,end){ const s=start<(S.created||start)?(S.created||start):start, out=[]; let k=s; while(k<=end && out.length<1000){ out.push(k); k=addDays(k,1); } return out; }
function firstLog(pid){ let f=null; for(const k in S.log){ if(S.log[k][pid] && (!f||k<f)) f=k; } return f; }
function repData(){
  const R=repRange(), days=repDays(R.start,R.end);
  const prods=S.products.map(p=>{ const fl=firstLog(p.id); if(!fl) return null; const from=fl>R.start?fl:R.start, to=p.ended&&p.ended<R.end?p.ended:R.end; if(from>to) return null;
    let n=0,took=0,full=0,units=0; let k=from; while(k<=to){ const u=taken(k,p.id), dk=dailyOn(p,k); n++; if(u>0){ took++; units+=u; } if(u>=dk) full++; k=addDays(k,1); }
    const changes=(p.doses||[]).filter(e=>e.since>from && e.since<=to);
    return {p,from,to,days:n,took,full,avgU:took?units/took:0,changes,startDaily:dailyOn(p,from)}; }).filter(Boolean);
  const first=prods.map(x=>x.from).sort()[0]||R.start, ndays=days.filter(k=>k>=first).length;
  const nut={}; days.filter(k=>k>=first).forEach(k=>{ const t=totals(k).t; for(const n in t) nut[n]=(nut[n]||0)+t[n]; });
  const plan=planned(), nm=norms();
  const ns=ORDER.filter(n=>nut[n]||plan[n]).map(n=>{ const N=NUTR[n]; return {n,N,avg:ndays?(nut[n]||0)/ndays:0,plan:plan[n]||0,norm:nm[n]?nm[n]/(N.normFactor||1):null,gis:gisFor(n),ul:N.ul||null}; });
  return {R,days:days.length,ndays,prods,ns};
}
function plainHTML(h){ const d=document.createElement("div"); d.innerHTML=h; return d.textContent.replace(/\s+/g," ").trim(); }
function viewReport(){
  const D=repData(), R=D.R, p=S.profile||{}, P=R.P, groups=labGroups();
  const prof=`${p.sex==="f"?"Kobieta":"Mężczyzna"}, ${p.age==="75+"?"powyżej 75 lat":(p.age||"").replace("-","–")+" lat"}${p.state==="preg"?", ciąża":p.state==="lact"?", karmienie piersią":""}`;
  const alerts=[...labAlerts().filter(x=>x.kind==="high").map(x=>{ const prods=activeWith((MK[x.l.m]||{}).n); return `${labName(x.l)}: wynik ${fmt(x.l.value,2)} ${x.l.unit} (${fullDate(x.l.date)}) powyżej zakresu z wydruku; w planie produkt z tym składnikiem: ${prods.map(p=>p.name).join(", ")}.`; }),
    ...ulAlerts().map(x=>{ const N=NUTR[x.n], u=N.unit, sum=`plan ${fmt(x.plan)} ${u}/dzień${x.dietV>=0.05?` + dieta ok. ${fmt(x.dietV)} ${u} = ok. ${fmt(x.tot)} ${u}`:""}`;
      if(x.kind==="gis") return `${N.name}: suplementy w planie ${fmt(x.planSupp)} ${u}/dzień, powyżej limitu GIS (${fmt(x.gis)} ${u}).`;
      return `${N.name}: ${sum}, ${x.kind==="atul"?"równe":"powyżej"} UL (${fmt(x.ul)} ${u}${x.n==="mg"||x.n==="fol"?", liczony tylko z suplementów":""})${doctorPlanFor(x.n)?"; plan oznaczony jako ustalony z lekarzem":""}.`; })];
  const hasPer=!!(activePeriod()||(S.periods||[]).some(x=>x.closed));
  return `<section class="screen report">
  <div class="noprint repbar"><button class="link" data-act="rep-back">‹ Wróć</button>
    <div class="seg" role="group" aria-label="Zakres raportu">${[...(hasPer?[["period","Okres"]]:[]),["30","30 dni"],["90","90 dni"]].map(([v,t])=>`<button data-act="rep-range" data-v="${v}" class="${REP.range===v?"on":""}">${t}</button>`).join("")}</div></div>
  <div class="doc">
    <div class="dochead"><div><div class="sub">Wassup · podsumowanie dla lekarza</div><h1>Suplementy i badania</h1></div></div>
    <dl class="kv"><dt>Osoba</dt><dd>${esc(prof)}</dd><dt>Zakres</dt><dd>${esc(fullDate(R.start))} – ${esc(fullDate(R.end))} (${esc(R.label)}; średnie z ${D.ndays} ${plural(D.ndays,["dnia","dni","dni"])} od pierwszego zapisanego przyjęcia)</dd><dt>Wygenerowano</dt><dd>${esc(fullDate(today()))}</dd></dl>
    <p class="docnote">Dane wpisane przez użytkownika w aplikacji Wassup. Aplikacja nie interpretuje wyników badań i nie zaleca dawek. Przyjęcia liczone z tego, co użytkownik odhaczył.</p>

    <h2>Wyniki badań</h2>
    ${groups.length?`<div class="tw"><table class="rt"><thead><tr><th>Badanie</th><th>Data</th><th>Wynik</th><th>Zakres z wydruku</th><th>Status</th></tr></thead><tbody>
      ${groups.map(arr=>arr.slice(0,4).map((l,i)=>`<tr${i?' class="older"':""}><td>${i?"":esc(labName(l))}</td><td>${esc(fullDate(l.date))}</td><td class="num">${fmt(l.value,2)} ${esc(l.unit)}</td><td>${esc(rangeText(l)||(l.flag&&l.flag!=="none"?"oznaczenie z wydruku":"–"))}</td><td>${LST[labFlag(l)].t}</td></tr>`).join("")).join("")}
    </tbody></table></div>`:`<p class="docnote">Brak wpisanych wyników.</p>`}

    ${P?`<h2>Okres do badania kontrolnego</h2>
      <p>${esc(fullDate(P.start))} → badanie ${esc(fullDate(P.testDate))}${P.closed?` (zakończony ${esc(fullDate(P.closed.date))})`:""} · plan ${P.doctor?"ustalony z lekarzem":"własny"}${P.note?` · ${esc(P.note)}`:""}</p>
      <div class="tw"><table class="rt"><thead><tr><th>Badanie</th><th>Cel</th><th>Na starcie</th><th>Kontrolny</th></tr></thead><tbody>
      ${P.items.map(it=>{ const b=baselineOf(it,P), a=resultsFor(it.k).filter(l=>l.date>P.start&&(!P.closed||l.date<=P.closed.date)).pop(), gf=a?goalFlag(a,it):null;
        return `<tr><td>${esc(it.name)}</td><td>${esc(goalText(it))} (${it.src==="doctor"?"od lekarza":"zakres z wydruku"})</td><td class="num">${b?`${fmt(b.value,2)} ${esc(b.unit)}`:"–"}</td><td class="num">${a?`${fmt(a.value,2)} ${esc(a.unit)}${gf?` · ${GST[gf].t.toLowerCase()}`:""}`:"–"}</td></tr>`; }).join("")}
      </tbody></table></div>`:""}

    <h2>Przyjmowane produkty</h2>
    ${D.prods.length?`<div class="tw"><table class="rt"><thead><tr><th>Produkt</th><th>Skład 1 szt.</th><th>Porcja dzienna</th><th>Przyjmowanie</th></tr></thead><tbody>
      ${D.prods.map(x=>`<tr><td>${esc(x.p.name)}${x.p.brand?`<br><span class="docnote">${esc(x.p.brand)} · ${x.p.type==="lek"?"lek OTC":"suplement diety"}</span>`:""}</td><td>${esc(compText(x.p).replace(/^1 [^:]+: /,""))}</td><td>${x.changes.length?`${fmt(x.startDaily)} ${unitWord(x.p,x.startDaily)}, ${x.changes.map(e=>`od ${esc(fullDate(e.since))}: ${fmt(e.daily)} ${unitWord(x.p,e.daily)}`).join(", ")}`:`${fmt(x.startDaily)} ${unitWord(x.p,x.startDaily)}`}${x.p.producerDaily?`<br><span class="docnote">zalecenie producenta: ${fmt(x.p.producerDaily)}</span>`:""}${x.p.ended?`<br><span class="docnote">zakończony ${esc(fullDate(x.p.ended))}</span>`:""}</td><td class="num">${x.took}/${x.days} dni${x.took?`<br><span class="docnote">śr. ${fmt(x.avgU)} ${unitWord(x.p,x.avgU)} w dniu przyjęcia</span>`:""}${x.full<x.took?`<br><span class="docnote">pełna porcja: ${x.full} dni</span>`:""}</td></tr>`).join("")}
    </tbody></table></div>`:`<p class="docnote">Brak odhaczonych przyjęć w tym zakresie.</p>`}

    ${D.ns.length?`<h2>Składniki z suplementów i leków</h2>
    <div class="tw"><table class="rt"><thead><tr><th>Składnik</th><th>Średnio/dzień</th><th>Plan/dzień (obecnie)</th><th>Norma</th><th>Limit GIS</th><th>UL</th></tr></thead><tbody>
      ${D.ns.map(r=>{ const u=r.N.unit, over=r.ul&&(r.plan>r.ul+1e-9||r.avg>r.ul+1e-9); return `<tr${over?' class="flag"':""}><td>${esc(r.N.name)}</td><td class="num">${fmt(r.avg)} ${u}${r.n==="d"?`<br><span class="docnote">${fmt(r.avg*40,0)} IU</span>`:""}</td><td class="num">${fmt(r.plan)} ${u}</td><td class="num">${r.norm?fmt(r.norm)+" "+u:"–"}</td><td class="num">${r.gis?fmt(r.gis)+" "+u:"–"}</td><td class="num">${r.ul?fmt(r.ul)+" "+u:"–"}${r.n==="mg"?`<br><span class="docnote">tylko z suplementów</span>`:""}</td></tr>`; }).join("")}
    </tbody></table></div>`:""}

    ${S.diet?`<h2>Dieta (szacunek)</h2>
      <p class="docnote">${S.diet.method==="ffq"?"Ankieta częstości spożycia, przybliżenie ±25%":"Import jadłospisu"} z ${esc(fullDate(S.diet.date))}. Tabele składu USDA (bez wzbogacania); wit. D, jod i biotyna nie są oceniane z diety.</p>
      <div class="tw"><table class="rt"><thead><tr><th>Składnik</th><th>Z diety</th><th>Norma</th><th>Pokrycie</th></tr></thead><tbody>
      ${DIET_NUTR.filter(n=>!NOT_FROM_DIET[n]&&S.diet.intake[n]&&norms()[n]).map(n=>{ const v=S.diet.intake[n], nm=norms()[n]; return `<tr><td>${esc(NUTR[n].name)}</td><td class="num">${fmt(v,v<10?1:0)} ${n==="fol"?"µg DFE":NUTR[n].unit}</td><td class="num">${fmt(nm)} ${n==="fol"?"µg DFE":NUTR[n].unit}</td><td class="num">${fmt(v/nm*100,0)}%</td></tr>`; }).join("")}
      </tbody></table></div>`:""}

    ${alerts.length?`<h2>Uwagi bezpieczeństwa</h2><ul class="docul">${alerts.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:""}

    <p class="docnote src2">Źródła progów: normy żywienia dla populacji Polski (NIZP PZH-PIB, 2024), górne tolerowane poziomy spożycia (UL) wg tych norm, maksymalne dawki w suplementach wg Zespołu ds. Suplementów Diety przy GIS, RWS wg rozporządzenia (UE) 1169/2011. Zakresy referencyjne pochodzą z wydruków laboratorium przepisanych przez użytkownika.</p>
  </div>
  <div class="noprint btns repbtns"><button class="btn" data-act="rep-print">Drukuj / zapisz PDF</button><button class="btn sec" data-act="rep-share">Udostępnij jako tekst</button></div>
  <p class="noprint src" style="padding:0 4px">Raport powstaje na telefonie i nigdzie nie jest wysyłany, dopóki sam go nie udostępnisz. Zawiera dane o zdrowiu: udostępniaj go tylko lekarzowi.</p>
  </section>`;
}
function reportText(){
  const el=document.querySelector(".report .doc"); if(!el) return "";
  const lines=[];
  el.querySelectorAll(".dochead h1, .kv, p, h2, table, ul").forEach(n=>{
    if(n.tagName==="H1") lines.push("WASSUP: "+n.textContent.toUpperCase());
    else if(n.tagName==="H2") lines.push("\n"+n.textContent.toUpperCase());
    else if(n.tagName==="TABLE"){ n.querySelectorAll("tbody tr").forEach(tr=>{ lines.push("- "+[...tr.children].map(td=>td.innerText.replace(/\s*\n\s*/g," ").trim()).filter(Boolean).join(" | ")); }); }
    else if(n.tagName==="UL"){ n.querySelectorAll("li").forEach(li=>lines.push("- "+li.textContent)); }
    else if(n.classList.contains("kv")){ const dt=n.querySelectorAll("dt"), dd=n.querySelectorAll("dd"); dt.forEach((d,i)=>lines.push(d.textContent+": "+dd[i].textContent)); }
    else lines.push(n.textContent.replace(/\s+/g," ").trim());
  });
  return lines.join("\n");
}
async function reportShare(){
  const text=reportText();
  try{ if(navigator.share){ await navigator.share({title:"Wassup: podsumowanie dla lekarza",text}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  try{ await navigator.clipboard.writeText(text); toast("Skopiowano raport do schowka"); }catch(_){ toast("Nie udało się udostępnić raportu"); }
}
function reportAct(act,a){
  if(act==="rep-open"){ REP.back=TAB==="report"?REP.back:TAB; REP.range=null; closeSheet(); TAB="report"; render(); window.scrollTo(0,0); return true; }
  if(act==="rep-back"){ TAB=REP.back||"labs"; render(); window.scrollTo(0,0); return true; }
  if(act==="rep-range"){ REP.range=a.dataset.v; render(); return true; }
  if(act==="rep-print"){ window.print(); return true; }
  if(act==="rep-share"){ reportShare(); return true; }
  return false;
}
