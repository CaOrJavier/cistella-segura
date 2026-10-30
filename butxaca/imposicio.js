// Versio per imprimir a casa: col·loca les pagines A6 en fulls A4 per fer quadernets grapats.
// Cada A4 porta dues meitats A5 (a dalt i a baix); cada meitat porta dues pagines A6.
// Es retalla l'A4 per la meitat, s'apilen les meitats per numero, es doblega el munt i es grapa.
// Si el llibre te mes de MAX pagines, es parteix en quadernets (A, B…) perque no siguin massa gruixuts.
"use strict";
(() => {
  const ESCALA = 0.94; // marge blanc perque les impressores de casa no imprimeixen fins a la vora
  const MAX = 80;      // pagines maximes per quadernet (20 fulls A5 encara es graponen be)

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  };

  const instruccions = parts => `
    <div class="howto">
      <h2>Cómo montar el cuaderno</h2>
      <ol>
        <li><b>Imprime a doble cara</b>, «voltear por el borde largo», a <b>tamaño real (100 %)</b>.</li>
        <li><b>Corta</b> todas las hojas por la mitad, por la línea de puntos ✂.</li>
        <li><b>Ordena las mitades</b> por el número pequeño de abajo: la 1 encima del todo, con los números a la vista.${parts > 1 ? " Hay dos cuadernillos: las mitades que empiezan por <b>A</b> y las que empiezan por <b>B</b>. Haz un montón con cada uno." : ""}</li>
        <li><b>Dobla ${parts > 1 ? "cada montón" : "el montón"}</b> por la mitad, hacia atrás, para que la primera página quede por fuera.</li>
        <li><b>Grapa por el pliegue</b> (2 grapas) o cóselo con hilo por 3 agujeros.${parts > 1 ? " Guarda el B detrás del A." : ""}</li>
      </ol>
      <p>Esta media hoja sobra: puedes tirarla o usarla de punto de libro.</p>
    </div>`;

  // Monta un quadernet (pagines amb nombre multiple de 4) en fulls A4
  function imposa(pages, lletra, parts, out) {
    const N = pages.length;
    const S = N / 4;                      // fulls A5 (meitats)
    const H = Math.ceil(S / 2);           // fulls A4
    const pg = n => pages[n - 1];
    // Full A5 numero k (0 = el de fora): cara A i cara B, [esquerra, dreta]
    const cares = k => ({ A: [N - 2 * k, 1 + 2 * k], B: [2 + 2 * k, N - 1 - 2 * k] });
    for (let j = 0; j < H; j++) {
      for (const cara of ["A", "B"]) {
        const a4 = el("section", "a4");
        for (const [pos, k] of [["top", j], ["bot", j + H]]) {
          const half = el("div", "a5 " + pos);
          if (k < S) {
            const [l, r] = cares(k)[cara];
            for (const [n, side] of [[l, "l"], [r, "r"]]) {
              const cell = el("div", "cell " + side);
              cell.appendChild(pg(n));
              half.appendChild(cell);
            }
            half.appendChild(el("div", "fold"));
            if (cara === "A") half.appendChild(el("div", "num", `${lletra}${k + 1}/${S}`));
          } else if (cara === "A") {
            half.appendChild(el("div", "cell-howto", instruccions(parts)));
          }
          a4.appendChild(half);
        }
        a4.appendChild(el("div", "cut", "<span>✂</span>"));
        out.appendChild(a4);
      }
    }
    return H;
  }

  document.addEventListener("llibre-llest", () => {
    const book = document.getElementById("book");
    const pages = [...book.children].filter(p => p.classList.contains("page"));
    const N = pages.length;               // multiple de 4
    const parts = Math.ceil(N / MAX);
    const mida = Math.ceil(N / parts / 4) * 4;

    const out = el("main");
    out.id = "sheets";
    out.style.setProperty("--s", ESCALA);
    let fulls = 0;
    for (let s = 0, i = 0; s < N; s += mida, i++) {
      const lletra = parts > 1 ? String.fromCharCode(65 + i) + " " : "";
      fulls += imposa(pages.slice(s, s + mida), lletra, parts, out);
    }
    book.replaceWith(out);
    window.BUILD_REPORT.sheets = fulls;
    window.BUILD_REPORT.parts = parts;
  });
})();
