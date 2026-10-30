// Setas esenciales en A5: cuando el cuaderno está montado (evento «llibre-llest»),
// cada página A6 se mete en una página A5 y se amplía (ver a5.css). Misma paginación que el A6.
"use strict";
document.addEventListener("llibre-llest", () => {
  const book = document.getElementById("book");
  const out = document.createElement("main");
  out.id = "a5";
  [...book.children].filter(p => p.classList.contains("page")).forEach(p => {
    const s = document.createElement("section");
    s.className = "a5p";
    s.appendChild(p);
    out.appendChild(s);
  });
  book.replaceWith(out);
});
