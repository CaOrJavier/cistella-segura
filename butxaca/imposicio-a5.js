// Setas esenciales en A5 para imprimir en casa: coloca las páginas en hojas A4 apaisadas, 2 por cara,
// en orden de cuadernillo (se doblan juntas por la mitad y se grapan). Con muchas páginas, varios
// cuadernillos (A, B…) para que no sean demasiado gruesos.
"use strict";
(() => {
  const ESCALA = 1.40952 * 0.94;   // A6 → A5, con margen blanco: las impresoras de casa no llegan al borde
  const MAX = 48;                  // páginas por cuadernillo: 12 hojas A4 dobladas aún se grapan bien

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  };

  document.addEventListener("llibre-llest", () => {
    const book = document.getElementById("book");
    const pages = [...book.children].filter(p => p.classList.contains("page"));
    const N = pages.length;                    // múltiplo de 4
    const parts = Math.ceil(N / MAX);
    const mida = Math.ceil(N / parts / 4) * 4;

    // instrucciones resumidas en la página 2 (sumario), si caben
    const p2 = pages[1];
    if (p2) {
      p2.querySelector(".pf")?.insertAdjacentHTML("beforebegin", `<div class="howto-mini"><b>Para montarlo:</b> imprime a doble cara volteando por el <b>borde corto</b>, a tamaño real; ordena las hojas por su número pequeño${parts > 1 ? " (un montón con las A y otro con las B)" : ""}, dobla ${parts > 1 ? "cada montón" : "el montón"} por la mitad y grapa por el pliegue.</div>`);
      if (p2.scrollHeight > p2.clientHeight + 1) p2.querySelector(".howto-mini").remove();
    }

    const out = el("main");
    out.id = "hojas";
    out.style.setProperty("--s", ESCALA);
    let hojas = 0;
    for (let s = 0, i = 0; s < N; s += mida, i++) {
      const parte = pages.slice(s, s + mida), n = parte.length, H = n / 4;   // H hojas A4 en este cuadernillo
      const letra = parts > 1 ? String.fromCharCode(65 + i) + " " : "";
      for (let k = 0; k < H; k++) {
        // hoja k (0 = la de fuera): cara A [izquierda, derecha] y cara B
        const caras = { A: [n - 2 * k, 1 + 2 * k], B: [2 + 2 * k, n - 1 - 2 * k] };
        for (const cara of ["A", "B"]) {
          const hoja = el("section", "a4h");
          caras[cara].forEach((num, j) => {
            const c = el("div", "celda " + (j ? "r" : "l"));
            c.appendChild(parte[num - 1]);
            hoja.appendChild(c);
          });
          hoja.appendChild(el("div", "pliegue"));
          if (cara === "A") hoja.appendChild(el("div", "num", `${letra}${k + 1}/${H}`));
          out.appendChild(hoja);
        }
        hojas++;
      }
    }
    book.replaceWith(out);
    window.BUILD_REPORT.sheets = hojas;
    window.BUILD_REPORT.parts = parts;
  });
})();
