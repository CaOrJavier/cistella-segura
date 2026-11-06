"""Paginas del lector de la web (extra/lector.js) para un cuaderno hecho con butxaca/setas.js:
libros/<libro>/p001.jpg... (800 px de ancho), t001.jpg... (300 px, miniaturas) y texto.js
(el texto de cada pagina en lineas con su caja, los enlaces, las fichas de cada pagina y el indice).

Uso, desde la raiz del repositorio, despues de hacer el PDF (tools/generar-pdf.ps1):
  python tools/libro-lector.py setas.html bolsillo offline/setas-esenciales-bolsillo.pdf
  python tools/libro-lector.py bolets.html bolets offline/bolets-essencials-butxaca.pdf   (el mismo, en catalan)
  python tools/libro-lector.py setas-mini-32.html mini32 offline/setas-esenciales-mini-32.pdf
  python tools/libro-lector.py setas-mini-20.html mini20 offline/setas-esenciales-mini-20.pdf
(con el PDF A6: el A5 es la misma pagina ampliada, y las imagenes salen iguales)
Con --paginas=1,5-7 solo rehace esas imagenes (el texto, siempre entero): asi no cambian las que estan igual.

El texto y los enlaces los da el propio cuaderno abierto con «?lector» (Edge en modo headless);
las imagenes salen del PDF. Necesita Microsoft Edge (o Chrome), PyMuPDF y Pillow.
"""
import io
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import pymupdf
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ANCHO, ANCHO_T = 800, 300


def navegador():
    for p in (r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe", r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe",
              r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"):
        p = os.path.expandvars(p)
        if os.path.exists(p):
            return p
    sys.exit("No encuentro Microsoft Edge ni Google Chrome.")


def texto_del_libro(html):
    url = (RAIZ / "butxaca" / html).as_uri() + "?lector"
    perfil = Path(tempfile.gettempdir()) / "cistella-lector-edge"
    r = subprocess.run([navegador(), "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
                        f"--user-data-dir={perfil}", "--run-all-compositor-stages-before-draw", "--virtual-time-budget=45000",
                        "--dump-dom", url], capture_output=True, timeout=300)
    m = re.search(rb'<script type="application/json" id="lector-json">(.*?)</script>', r.stdout, re.S)
    if not m:
        sys.exit(f"El cuaderno no ha devuelto su texto ({url}).")
    return json.loads(m.group(1).decode("utf-8"))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--paginas=")]
    solo = None
    for a in sys.argv[1:]:
        if a.startswith("--paginas="):
            solo = set()
            for t in a.split("=", 1)[1].split(","):
                x, _, y = t.partition("-")
                solo.update(range(int(x), int(y or x) + 1))
    if len(args) != 3:
        sys.exit(__doc__)
    html, libro, pdf = args
    d = texto_del_libro(html)
    doc = pymupdf.open(RAIZ / pdf)
    if doc.page_count != d["n"]:
        sys.exit(f"El PDF tiene {doc.page_count} paginas y el cuaderno {d['n']}: rehaga el PDF.")
    dest = RAIZ / "libros" / libro
    dest.mkdir(parents=True, exist_ok=True)
    datos = {"n": d["n"], "p": d["p"], "l": d["l"], "f": d["f"], "i": d["i"]}
    (dest / "texto.js").write_text(
        "/* Texto, enlaces e indice de las paginas del libro (lo usa el lector, extra/lector.js). Todo sale del HTML del libro "
        "(butxaca/setas.js): el texto, en lineas con su caja en la pagina; los enlaces, las fichas y el indice, de libroInfo(). "
        "Lo escribe tools/libro-lector.py. */\n"
        f'(window.LIBROS_TXT = window.LIBROS_TXT || {{}})["{libro}"] = '
        + json.dumps(datos, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8", newline="\n")
    for i, pg in enumerate(doc):
        if solo is not None and i + 1 not in solo:
            continue
        z = 2 * ANCHO / pg.rect.width
        pix = pg.get_pixmap(matrix=pymupdf.Matrix(z, z))
        im = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        for nombre, ancho, q in (("p", ANCHO, 85), ("t", ANCHO_T, 82)):
            alto = int(ancho * pg.rect.height / pg.rect.width)
            im.resize((ancho, alto), Image.LANCZOS).save(dest / f"{nombre}{i + 1:03d}.jpg", quality=q, optimize=True, progressive=True)
    # fuera las paginas que sobren de una edicion anterior mas larga
    for f in dest.glob("[pt][0-9][0-9][0-9].jpg"):
        if int(f.stem[1:]) > d["n"]:
            f.unlink()
    print(f"libros/{libro}: {d['n']} paginas, {sum(len(x) for x in d['p'])} lineas de texto, {len(d['i'])} entradas de indice")


if __name__ == "__main__":
    main()
