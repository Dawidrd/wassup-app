#!/usr/bin/env python3
"""Buduje index.html z modułów w src/.

index.html jest jednocześnie szablonem (HTML + CSS) i wynikiem: skrypt podmienia
całą zawartość ostatniego bloku <script>...</script>. CSS edytuj bezpośrednio w index.html.

Kolejność sklejania: app.js, a przed znacznikiem „Akcje” wstawiane są diet.js, labs.js,
periods.js i report.js (wszystko w jednym zakresie globalnym, bez modułów ES).
Stałe JSON: __CLAIMS__ (src/data/claims.json), __FOODS__ (src/data/foods.json).

Użycie:  python3 tools/build.py
"""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
P = ROOT / "index.html"

s = P.read_text(encoding="utf-8")
app = (SRC / "app.js").read_text(encoding="utf-8").replace(
    "__CLAIMS__", json.dumps(json.loads((SRC / "data/claims.json").read_text(encoding="utf-8")), ensure_ascii=False))
foods = [{"name": f["name"], "p": f["p"], "n": f["n"]} for f in json.loads((SRC / "data/foods.json").read_text(encoding="utf-8"))]
diet = (SRC / "diet.js").read_text(encoding="utf-8").replace(
    "__FOODS__", json.dumps(foods, ensure_ascii=False, separators=(",", ":")))
marker = "/* ============ Akcje ============ */"
rest = "\n".join((SRC / f).read_text(encoding="utf-8") for f in ("labs.js", "periods.js", "report.js"))
assert marker in app, "brak znacznika Akcje w src/app.js"
app = app.replace(marker, diet + "\n" + rest + "\n" + marker)
a = s.index("<script>") + len("<script>")
b = s.rindex("</script>")
s = s[:a] + "\n" + app + "\n" + s[b:]
P.write_text(s, encoding="utf-8")
print("zbudowano index.html,", len(s), "znaków")
