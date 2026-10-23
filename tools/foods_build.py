import pickle,json,unicodedata,re
foods,nut=pickle.load(open('sr.pkl','rb'))
KEYS=['mg','d','b6','c','zn','b12','fe','fol','ca','k','se','pot']
def base(i): return dict(nut[i])
def scale(i,kcal):
    b=base(i); f=kcal/b['kcal']; return {k:(v*f if v is not None else None) for k,v in b.items()}
# (Polish name, patterns (each = space-separated tokens that must all appear), source, overrides)
T=[
 # --- pieczywo i zboża (gotowane przed suchymi) ---
 ("Chleb graham / pełnoziarnisty", ["graham","pelnoziarnist chleb","chleb pelnoziarnist","chleb pszenny razowy","pieczywo pelnoziarnist"], "18075", {}),
 ("Chleb żytni", ["chleb zytni","zytni razowy","pumpernikiel","chleb razowy"], ("scale","20064",259), {}),
 ("Bułka / chleb pszenny", ["bulka","kajzerka","chleb pszenny","chleb bialy","bagietka","chleb tostowy","tost","pieczywo"], ("scale","20481",270), {}),
 ("Tortilla pszenna", ["tortilla","wrap"], ("scale","20481",306), {}),
 ("Wafle ryżowe", ["wafle ryzowe","wafel ryzowy"], "19413", {}),
 ("Płatki owsiane", ["owsian","platki owsiane","owsianka"], "20038", {}),
 ("Ryż (ugotowany)", ["ryz gotowan","ryz ugotowan"], "20445", {}),
 ("Ryż brązowy (suchy)", ["ryz brazowy","ryz pelnoziarnist"], "20036", {}),
 ("Ryż biały (suchy)", ["ryz"], "20444", {}),
 ("Makaron (ugotowany)", ["makaron gotowan","makaron ugotowan"], "20421", {}),
 ("Makaron pełnoziarnisty (suchy)", ["makaron pelnoziarnist","makaron razow","spaghetti pelnoziarnist"], "20124", {}),
 ("Makaron (suchy)", ["makaron","spaghetti","penne","fusilli"], "20420", {}),
 ("Kasza gryczana (ugotowana)", ["gryczana gotowan","gryczana ugotowan"], "20010", {}),
 ("Kasza gryczana (sucha)", ["gryczan"], "20009", {}),
 ("Kasza jaglana (sucha)", ["jaglan","proso"], "20031", {}),
 ("Kasza jęczmienna (sucha)", ["jeczmien","peczak","peczak"], "20005", {}),
 ("Kasza manna (sucha)", ["manna","semolina"], "20466", {}),
 ("Mąka pszenna", ["maka pszenna"], "20481", {}),
 # --- warzywa ---
 ("Ziemniaki", ["ziemniak","kartofl"], "11352", {}),
 ("Frytki", ["frytki"], "21138", {}),
 ("Batat", ["batat","slodki ziemniak"], "11507", {}),
 ("Passata / przecier pomidorowy", ["passata","przecier pomidor","pomidory krojone","koncentrat pomidor"], "11547", {}),
 ("Pomidor", ["pomidor"], "11529", {}),
 ("Ogórek kiszony", ["ogorek kiszon","ogorki kiszon"], "11439", {}),
 ("Ogórek", ["ogorek"], "11205", {}),
 ("Marchew", ["marchew","marchewka"], "11124", {}),
 ("Papryka", ["papryka"], "11821", {}),
 ("Cebula", ["cebul"], "11282", {}),
 ("Czosnek", ["czosnek"], "11215", {}),
 ("Kapusta kiszona", ["kapusta kiszon","kiszona kapusta"], "11439", {}),
 ("Kapusta", ["kapusta"], "11109", {}),
 ("Kalafior", ["kalafior"], "11135", {}),
 ("Brokuł", ["brokul"], "11090", {}),
 ("Szpinak", ["szpinak"], "11457", {}),
 ("Jarmuż", ["jarmuz"], "11233", {}),
 ("Rukola", ["rukola","rukkola"], "11959", {}),
 ("Sałata / mix sałat", ["salat","salata"], "11253", {}),
 ("Cukinia", ["cukini"], "11477", {}),
 ("Bakłażan", ["baklazan"], "11209", {}),
 ("Burak", ["burak","buracz"], "11080", {}),
 ("Por", ["por="], "11246", {}),
 ("Seler", ["seler"], "11141", {}),
 ("Pieczarki", ["pieczark","grzyb"], "11260", {}),
 ("Kukurydza (konserwa)", ["kukurydz"], "11172", {}),
 ("Groszek zielony", ["groszek"], "11312", {}),
 ("Fasolka szparagowa", ["szparagow"], "11052", {}),
 ("Dynia", ["dynia"], "11422", {}),
 ("Awokado", ["awokado"], "09037", {}),
 # --- owoce ---
 ("Banan", ["banan"], "09040", {}),
 ("Jabłko", ["jablk"], "09003", {}),
 ("Gruszka", ["grusz"], "09252", {}),
 ("Pomarańcza", ["pomarancz"], "09200", {}),
 ("Mandarynka", ["mandaryn"], "09218", {}),
 ("Kiwi", ["kiwi"], "09148", {}),
 ("Śliwka", ["sliwk"], "09279", {}),
 ("Winogrona", ["winogron"], "09132", {}),
 ("Truskawki", ["truskaw"], "09318", {}),
 ("Maliny", ["malin"], "09302", {}),
 ("Borówki", ["borowk","jagod"], "09050", {}),
 ("Czereśnie / wiśnie", ["czeresn","wisn"], "09070", {}),
 ("Arbuz", ["arbuz"], "09326", {}),
 ("Cytryna", ["cytryn"], "09150", {}),
 ("Sok pomarańczowy", ["sok pomarancz"], "09206", {}),
 # --- strączki ---
 ("Ciecierzyca (konserwa)", ["ciecierzyc konserw","ciecierzyc puszk"], "16358", {}),
 ("Ciecierzyca (sucha)", ["ciecierzyc"], "16056", {}),
 ("Fasola czerwona (konserwa)", ["fasola czerwona konserw","fasola czerwona puszk","fasola konserw","fasola puszk"], "16145", {}),
 ("Fasola biała (konserwa)", ["fasola biala"], "16051", {}),
 ("Fasola (sucha)", ["fasola","fasoli"], "16032", {}),
 ("Soczewica (sucha)", ["soczewic"], "16144", {}),
 ("Groch (suchy)", ["groch"], "16085", {}),
 ("Tofu", ["tofu"], "16426", {}),
 ("Hummus", ["hummus"], "16158", {}),
 ("Napój sojowy (niewzbogacany)", ["napoj sojow","mleko sojow"], "16120", {}),
 # --- orzechy i nasiona ---
 ("Masło orzechowe", ["maslo orzechow"], "16398", {}),
 ("Orzechy włoskie", ["orzechy wloskie","orzech wloski"], "12155", {}),
 ("Orzechy laskowe", ["laskow"], "12120", {}),
 ("Orzechy nerkowca", ["nerkowc"], "12087", {}),
 ("Pistacje", ["pistacj"], "12151", {}),
 ("Orzeszki ziemne", ["arachid","orzeszki ziemne"], "16087", {}),
 ("Migdały", ["migdal"], "12061", {}),
 ("Pestki dyni", ["pestki dyni","dyni pestk"], "12014", {}),
 ("Słonecznik", ["slonecznik"], "12036", {}),
 ("Siemię lniane", ["siemie","len="], "12220", {}),
 ("Chia", ["chia"], "12006", {}),
 ("Sezam", ["sezam"], "12023", {}),
 # --- nabiał ---
 ("Kefir", ["kefir"], "01289", {"d":0}),
 ("Maślanka", ["maslank"], "01088", {}),
 ("Skyr / jogurt grecki", ["skyr","jogurt grecki"], "01256", {}),
 ("Jogurt naturalny", ["jogurt"], "01117", {}),
 ("Mleko 3,2%", ["mleko 3"], "01211", {}),
 ("Mleko 2%", ["mleko"], "01174", {}),
 ("Twaróg", ["twarog","twarozek"], "01015", {}),
 ("Serek wiejski", ["serek wiejski","cottage"], "01016", {}),
 ("Mozzarella", ["mozzarell"], "01028", {}),
 ("Feta", ["feta","ser sałatkowy","ser salatkowy"], "01019", {}),
 ("Parmezan", ["parmezan","grana padano"], "01033", {}),
 ("Ricotta", ["ricotta"], "01037", {}),
 ("Ser żółty (gouda)", ["ser zolty","gouda","edam","ser="], "01022", {}),
 ("Śmietana", ["smietan"], "01056", {}),
 ("Masło", ["maslo"], "01145", {}),
 ("Jajko", ["jajk","jaja","jajecznic"], "01123", {}),
 # --- mięso i wędliny ---
 ("Wątróbka drobiowa", ["watrob"], "05027", {}),
 ("Szynka / wędlina z indyka", ["szynka z indyka","szynka z piersi indyka","poledwica z indyka","wedlina z indyka"], "07046", {}),
 ("Szynka wieprzowa", ["szynka","wedlina","poledwica sopocka"], "07029", {}),
 ("Kiełbasa", ["kielbas"], "07916", {}),
 ("Parówki", ["parowk"], "07939", {}),
 ("Pierś z indyka", ["indyk"], "05710", {}),
 ("Udo z kurczaka", ["udo","udko","podudzi"], "05096", {}),
 ("Pierś z kurczaka", ["kurczak","kurczaka","drob"], "05314", {}),
 ("Wołowina mielona", ["wolowin mielon","mielona wolow","mielone wolow"], "23562", {}),
 ("Wieprzowina mielona", ["mielon","mielone"], "10219", {}),
 ("Wołowina", ["wolowin","wolowe","stek","rostbef"], "23617", {}),
 ("Schab", ["schab","poledwiczk"], "10024", {}),
 ("Karkówka", ["karkow","lopatka"], "10084", {}),
 ("Wieprzowina", ["wieprzow"], "10228", {}),
 ("Burger (fast food)", ["burger","hamburger"], "21112", {}),
 ("Pizza", ["pizza"], "21224", {}),
 # --- ryby ---
 ("Łosoś", ["losos"], "15236", {}),
 ("Makrela", ["makrel"], "15046", {}),
 ("Śledź", ["sledz"], "15039", {}),
 ("Pstrąg", ["pstrag"], "15240", {}),
 ("Sardynki (w oleju)", ["sardyn"], "15088", {}),
 ("Tuńczyk (w wodzie)", ["tunczyk"], "15121", {}),
 ("Dorsz", ["dorsz"], "15015", {}),
 ("Mintaj", ["mintaj","morszczuk","miruna"], "15066", {}),
 ("Krewetki", ["krewetk"], "15270", {}),
 # --- tłuszcze, słodycze, napoje, inne ---
 ("Oliwa z oliwek", ["oliwa"], "04053", {}),
 ("Olej rzepakowy", ["olej"], "04582", {}),
 ("Majonez", ["majonez"], "04025", {}),
 ("Miód", ["miod"], "19296", {}),
 ("Cukier", ["cukier"], "19335", {}),
 ("Czekolada gorzka", ["czekolada gorzka","gorzka czekolada"], "19904", {}),
 ("Czekolada mleczna", ["czekolad"], "19120", {}),
 ("Kakao", ["kakao"], "19165", {}),
 ("Dżem", ["dzem","konfitur"], "19297", {}),
 ("Ketchup", ["ketchup"], "11935", {}),
 ("Kawa", ["kawa"], "14209", {}),
 ("Herbata", ["herbat"], "14355", {}),
 ("Odżywka białkowa (serwatkowa)", ["odzywka bialkow","bialko serwatkow","whey"], "14066", {}),
]
def norm(s):
    s=unicodedata.normalize('NFKD',s.replace('ł','l').replace('Ł','L')).encode('ascii','ignore').decode().lower()
    return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9%= ]',' ',s)).strip()
out=[]; seen=set()
for name,pats,src,ov in T:
    b = scale(src[1],src[2]) if isinstance(src,tuple) else base(src)
    n={}
    for k in KEYS:
        v=b.get(k)
        if v is None: continue
        n[k]=round(v,3 if k in('b6','b12','zn','fe','d') else 1)
    n['om3']=round(((b.get('epa') or 0)+(b.get('dha') or 0))*1000,0)
    n.update(ov)
    n={k:v for k,v in n.items() if v}
    sid = src if isinstance(src,str) else src[1]
    out.append({"name":name,"p":[norm(p) for p in pats],"src":sid,"n":n})
json.dump(out,open('foods.json','w'),ensure_ascii=False)
print(len(out))
# test on sample file
import openpyxl
wb=openpyxl.load_workbook('fitatu/j.xlsx',data_only=True)
def match(name):
    s=' '+norm(name)+' '
    for f in out:
        for p in f['p']:
            if all(((' '+t[:-1]+' ') in s) if t.endswith('=') else ((' '+t) in s) for t in p.split()): return f
    return None
for r in wb['Produkty'].iter_rows(min_row=2,values_only=True):
    if r[0] and not r[0].startswith('Źródło'):
        m=match(r[0]); print(f"{r[0]:32} -> {m['name'] if m else '!!! BRAK'}")
