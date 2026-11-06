/* Lector de libros: leer los libros en PDF en la web antes de descargarlos (#/leer/<libro>/<página>).
   - Páginas: libros/<libro>/pNNN.jpg (800 px) y tNNN.jpg (miniatura, se ve mientras carga la grande y sin internet).
   - libros/<libro>/texto.js: el texto de cada página (para buscar), los enlaces dentro de la página («→ p. 29» y los
     números de los índices), qué ficha de la web corresponde a cada página y el índice. Todo sale de los PDF.
   - Como un lector de libros del móvil: la página entera en la pantalla y se pasa deslizándola a un lado o tocando
     el borde (en pantallas anchas, dos páginas enfrentadas). Doble toque o dos dedos para ampliar.
     Abajo, la página en la que se está, una barra para saltar y las fichas de la web de las setas de esa página.
   - El cuaderno completo tiene dos ediciones: en castellano (bolsillo) y en catalán (bolets, el mismo cuaderno con los
     textos en catalán). El quadern de butxaca antiguo (butxaca, 50 bolets) sigue aquí, sin botón ES · CA. El botón PDF baja el A5. */
(function () {
  "use strict";
  const CA = window.IDIOMA === "ca";
  const T = CA ? {
    volver: "Llibres", indice: "Índex", buscar: "Cercar", paginas: "Pàgines", ampliar: "Ampliar", pantalla: "Pantalla completa",
    pdf: "Baixar el PDF", ant: "Pàgina anterior", sig: "Pàgina següent", pag: "Pàgina", irA: "Anar a la pàgina {n}", ficha: "Fitxa a la web",
    buscarPH: "Un bolet, una paraula…", buscarAyuda: "Cerca a tot el text del llibre. En obrir la pàgina, el que has trobat es marca en groc.",
    res1: "1 pàgina", resN: "{n} pàgines", resMas: "{n} pàgines (en surten {m})", nada: "No surt en aquest llibre.", corto: "Escriu almenys 2 lletres.",
    cargando: "Obrint el llibre…", noTexto: "No s'ha pogut carregar el text del llibre: es pot fullejar, però no cercar.",
    cerrar: "Tanca", edicion: "Edició", edES: "En castellà", edCA: "En català", de: "de",
    pista: "Llisca cap al costat o toca la vora per passar de pàgina; toca dues vegades per ampliar-la. El que brilla en groc un moment es pot tocar: et porta a aquella part del llibre.",
    pistaPC: "Fes servir ← → (o la roda del ratolí) per passar de pàgina; doble clic per ampliar-la. El que brilla en groc un moment es pot tocar: et porta a aquella part del llibre.",
    entendido: "Entesos", sinFoto: "Aquesta pàgina no està desada per veure-la sense internet.", zoomAyuda: "Toca fora de la pàgina o prem Esc per tornar.",
  } : {
    volver: "Libros", indice: "Índice", buscar: "Buscar", paginas: "Páginas", ampliar: "Ampliar", pantalla: "Pantalla completa",
    pdf: "Descargar el PDF", ant: "Página anterior", sig: "Página siguiente", pag: "Página", irA: "Ir a la página {n}", ficha: "Ficha en la web",
    buscarPH: "Una seta, una palabra…", buscarAyuda: "Busca en todo el texto del libro. Al abrir la página, lo encontrado se marca en amarillo.",
    res1: "1 página", resN: "{n} páginas", resMas: "{n} páginas (se muestran {m})", nada: "No aparece en este libro.", corto: "Escribe al menos 2 letras.",
    cargando: "Abriendo el libro…", noTexto: "No se ha podido cargar el texto del libro: se puede hojear, pero no buscar.",
    cerrar: "Cerrar", edicion: "Edición", edES: "En castellano", edCA: "En catalán", de: "de",
    pista: "Desliza a un lado o toca el borde para pasar de página; toca dos veces para ampliarla. Lo que brilla en amarillo un momento se puede tocar: te lleva a esa parte del libro.",
    pistaPC: "Usa ← → (o la rueda del ratón) para pasar de página; doble clic para ampliarla. Lo que brilla en amarillo un momento se puede tocar: te lleva a esa parte del libro.",
    entendido: "Entendido", sinFoto: "Esta página no está guardada para verla sin internet.", zoomAyuda: "Toca fuera de la página o pulsa Esc para volver.",
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const n3 = (n) => String(n).padStart(3, "0");
  const MOV = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const TACTIL = window.matchMedia && matchMedia("(hover: none)").matches;

  const LIBROS = {
    bolsillo: { tit: "Setas esenciales · cuaderno completo", sub: CA ? "52 pàgines · 54 bolets" : "52 páginas · 54 setas", n: 52,
      pdf: "offline/setas-esenciales-A5.pdf", ed: "es", otra: "bolets" },
    bolets: { tit: "Bolets essencials · quadern complet", sub: CA ? "52 pàgines · 54 bolets" : "52 páginas · 54 setas · en catalán", n: 52,
      pdf: "offline/bolets-essencials-A5.pdf", ed: "ca", otra: "bolsillo" },
    butxaca: { tit: "Cistella Segura · quadern de butxaca", sub: CA ? "72 pàgines · 50 bolets" : "72 páginas · 50 setas · en catalán", n: 72,
      pdf: "offline/cistella-segura-butxaca.pdf" },
    mini32: { tit: "Setas esenciales · cuaderno mini (32 páginas)", sub: CA ? "32 pàgines · 54 bolets" : "32 páginas · 54 setas", n: 32,
      pdf: "offline/setas-esenciales-mini-32-A5.pdf" },
    mini20: { tit: "Setas esenciales · cuaderno mini (20 páginas)", sub: CA ? "20 pàgines · 54 bolets" : "20 páginas · 54 setas", n: 20,
      pdf: "offline/setas-esenciales-mini-20-A5.pdf" },
    esencial: { tit: "Setas comestibles esenciales de Cataluña", sub: CA ? "84 pàgines · 80 bolets" : "84 páginas · 80 setas", n: 84,
      pdf: "offline/setas-guia-esencial-A5.pdf", a5: true },
  };
  Object.keys(LIBROS).forEach((g) => (LIBROS[g].dir = "libros/" + g));
  // dónde se quedó cada libro (setas:leer = {bolsillo: 12, …})
  const pos = {
    todo() { try { return JSON.parse(localStorage.getItem("setas:leer")) || {}; } catch (e) { return {}; } },
    get(g) { return +this.todo()[g] || 0; },
    set(g, n) { try { const o = this.todo(); o[g] = n; localStorage.setItem("setas:leer", JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } },
  };
  // el cuaderno completo se abre en el idioma de la web
  const porIdioma = (g) => (g === "bolsillo" && CA ? "bolets" : g);

  // ---------- texto del libro (libros/<libro>/texto.js) ----------
  const textos = {};
  function cargarTexto(g) {
    if (textos[g]) return textos[g];
    return (textos[g] = new Promise((ok) => {
      const ya = () => (window.LIBROS_TXT || {})[g];
      if (ya()) return ok(ya());
      const s = document.createElement("script");
      s.src = LIBROS[g].dir + "/texto.js";
      s.onload = () => ok(ya() || null);
      s.onerror = () => { delete textos[g]; ok(null); };
      document.head.appendChild(s);
    }));
  }
  // búsqueda sin acentos: cada letra se cambia por una sola (así las posiciones coinciden con el texto original)
  const letra = (c) => (c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()[0] || c);
  const plano = (s) => { let o = ""; for (let i = 0; i < s.length; i++) o += letra(s[i]); return o; };

  // ---------- estado ----------
  let S = null;   // { g, L, D, N, n, k, D2, doble, pw, ph, panel, marca, q, … }
  let G = null;   // utilidades de la web (window.GUIA)
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  // Las páginas van en «hojas» que se pasan de lado: en el móvil, una página; en pantallas anchas, dos enfrentadas
  // (la portada, sola). S.k es la hoja que se ve y S.n la página (la primera de la hoja, o a la que se ha saltado).
  function hojas() {
    const out = [];
    if (!S.doble) { for (let n = 1; n <= S.N; n++) out.push([n]); return out; }
    out.push([1]);
    for (let n = 2; n <= S.N; n += 2) out.push(n + 1 <= S.N ? [n, n + 1] : [n]);
    return out;
  }
  const hojaDe = (n) => Math.max(0, S.D2.findIndex((d) => d.includes(n)));
  const vis = () => ({ todas: (S.D2 && S.D2[S.k]) || [S.n] });

  // ---------- montar y desmontar ----------
  window.addEventListener("hashchange", () => { if (S && !/^#\/leer\//.test(location.hash)) desmontar(); });
  function desmontar() {
    if (!S) return;
    if (S.ro) S.ro.disconnect();
    S.root.remove();
    document.documentElement.classList.remove("leyendo");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    S = null;
  }

  function abrir(arg, GU) {
    G = GU;
    const [g0, n0] = String(arg || "").split("/");
    if (!LIBROS[g0]) { location.replace("#/libros"); return; }
    const L = LIBROS[g0];
    G.app.innerHTML = `<p class="muted">${esc(T.cargando)}</p>`;
    document.title = /Cistella Segura/.test(L.tit) ? L.tit : L.tit + " · Cistella Segura";
    const n = Math.min(Math.max(parseInt(n0, 10) || pos.get(g0) || 1, 1), L.n);
    if (S && S.g === g0) { if (!vis().todas.includes(n)) irA(n); return; }
    desmontar();
    // proporción de la página: A6 (bolsillo y mini) o A5 (guía)
    S = { g: g0, L, N: L.n, n, k: 0, D: null, ratio: L.a5 ? 148 / 210 : 105 / 148, panel: null, marca: null, q: "" };
    construir();
    cargarTexto(g0).then((D) => {
      if (!S || S.g !== g0) return;
      S.D = D;
      if (D && D.n && D.n !== S.N) { S.N = D.n; S.n = Math.min(S.n, S.N); montar(); irA(S.n); }
      if (!D) aviso(T.noTexto);
      capas();
      actualizar();
      if (S.panel) panel(S.panel);
    });
  }

  function construir() {
    const L = S.L, otra = L.otra && LIBROS[L.otra];
    const root = document.createElement("div");
    root.id = "lector"; root.className = "lec"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", L.tit);
    root.innerHTML = `
      <div class="lec-barra">
        <a class="lec-volver" href="#/libros" title="${esc(T.volver)}"><span aria-hidden="true">←</span> <span class="lec-txt">${esc(T.volver)}</span></a>
        <div class="lec-tit" translate="no"><b>${esc(L.tit)}</b><small>${esc(L.sub)}</small></div>
        ${otra ? `<div class="lec-ed" role="group" aria-label="${esc(T.edicion)}">${["bolsillo", "bolets"].map((g) => `<button type="button" data-ed="${g}" aria-pressed="${g === S.g}" title="${esc(LIBROS[g].ed === "ca" ? T.edCA : T.edES)}">${LIBROS[g].ed.toUpperCase()}</button>`).join("")}</div>` : ""}
        <div class="lec-herr">
          <button type="button" data-panel="indice" title="${esc(T.indice)}"><span aria-hidden="true">☰</span><span class="lec-txt">${esc(T.indice)}</span></button>
          <button type="button" data-panel="buscar" title="${esc(T.buscar)}"><span aria-hidden="true">⌕</span><span class="lec-txt">${esc(T.buscar)}</span></button>
          <button type="button" data-panel="paginas" title="${esc(T.paginas)}"><span aria-hidden="true">▦</span><span class="lec-txt">${esc(T.paginas)}</span></button>
          <button type="button" class="lec-b-zoom" title="${esc(T.ampliar)}"><span aria-hidden="true">⊕</span><span class="lec-txt">${esc(T.ampliar)}</span></button>
          ${document.fullscreenEnabled ? `<button type="button" class="lec-b-pc" title="${esc(T.pantalla)}" aria-label="${esc(T.pantalla)}"><span aria-hidden="true">⛶</span></button>` : ""}
          <a class="lec-b-pdf" href="${esc(L.pdf)}" target="_blank" rel="noopener" title="${esc(T.pdf)}"><span aria-hidden="true">⬇</span><span class="lec-txt">PDF</span></a>
        </div>
      </div>
      <div class="lec-cuerpo">
        <div class="lec-escena">
          <div class="lec-pista" tabindex="-1"></div>
          <button type="button" class="lec-flecha lec-ant" aria-label="${esc(T.ant)}">‹</button>
          <button type="button" class="lec-flecha lec-sig" aria-label="${esc(T.sig)}">›</button>
          <div class="lec-aviso" role="status" hidden></div>
        </div>
        <aside class="lec-panel" hidden></aside>
      </div>
      <div class="lec-pie">
        <div class="lec-fichas" translate="no"></div>
        <div class="lec-nav">
          <button type="button" class="lec-p-ant" aria-label="${esc(T.ant)}">‹</button>
          <div class="lec-rango"><input type="range" min="1" max="${S.N}" value="${S.n}" aria-label="${esc(T.pag)}"><div class="lec-previa" hidden><img alt=""><span></span></div></div>
          <span class="lec-num" aria-live="polite"></span>
          <button type="button" class="lec-p-sig" aria-label="${esc(T.sig)}">›</button>
        </div>
      </div>
      <div class="lec-zoom" hidden></div>`;
    document.body.appendChild(root);
    document.documentElement.classList.add("leyendo");
    S.root = root;
    S.el = { escena: $(".lec-escena", root), pista: $(".lec-pista", root), num: $(".lec-num", root), rango: $(".lec-rango input", root),
      previa: $(".lec-previa", root), fichas: $(".lec-fichas", root), panel: $(".lec-panel", root), zoom: $(".lec-zoom", root), aviso: $(".lec-aviso", root) };
    // botones
    $(".lec-ant", root).onclick = $(".lec-p-ant", root).onclick = () => pasar(-1);
    $(".lec-sig", root).onclick = $(".lec-p-sig", root).onclick = () => pasar(1);
    $$("[data-panel]", root).forEach((b) => (b.onclick = () => panel(S.panel === b.dataset.panel ? null : b.dataset.panel)));
    $(".lec-b-zoom", root).onclick = () => zoom(true);
    const pc = $(".lec-b-pc", root);
    if (pc) pc.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen()).catch(() => {});
    $$("[data-ed]", root).forEach((b) => (b.onclick = () => cambiarEdicion(b.dataset.ed)));
    // la barra de páginas: mientras se arrastra, una miniatura de la página
    const r = S.el.rango;
    r.addEventListener("input", () => previa(+r.value));
    r.addEventListener("change", () => { S.el.previa.hidden = true; irA(+r.value); });
    r.addEventListener("blur", () => (S.el.previa.hidden = true));
    // enlaces dentro de las páginas, del índice, de la búsqueda y de las miniaturas
    root.addEventListener("click", (e) => {
      const a = e.target.closest("[data-ir]");
      if (!a) return;
      e.preventDefault();
      const n = +a.dataset.ir;
      const q = a.dataset.q ? S.q : "";
      if (!esAncho() && S.panel) panel(null);
      irA(n, { marca: q, suave: !q && Math.abs(hojaDe(n) - S.k) === 1 });
    });
    // fotos que no cargan (sin internet): se queda la miniatura; si tampoco hay, un aviso en la página
    root.addEventListener("error", (e) => {
      const im = e.target;
      if (im.tagName !== "IMG") return;
      im.classList.add("mal");
      const p = im.closest(".lec-pag");
      if (p && $$("img", p).every((x) => x.classList.contains("mal"))) p.classList.add("sin-foto");
    }, true);
    const pt0 = S.el.pista;
    // tocar el borde izquierdo o derecho de la pantalla: página anterior o siguiente (como en un lector de libros)
    pt0.addEventListener("click", (e) => {
      if (e.target.closest("a, button") || e.detail > 1) return;
      const rc = S.el.escena.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width;
      clearTimeout(S.tToque);
      // se espera un poco: si es un doble toque, se amplía en vez de pasar
      S.tToque = setTimeout(() => { if (x < 0.28) pasar(-1); else if (x > 0.72) pasar(1); }, 230);
    });
    // doble toque o doble clic: la página, ampliada
    pt0.addEventListener("dblclick", (e) => {
      if (e.target.closest("a, button")) return;
      clearTimeout(S.tToque);
      const p = e.target.closest(".lec-pag");
      if (p) S.n = +p.dataset.n;
      zoom(true);
    });
    // al deslizar: qué hoja se ve
    pt0.addEventListener("scroll", () => { if (!S.rf) S.rf = requestAnimationFrame(alDeslizar); }, { passive: true });
    // rueda del ratón hacia abajo o a un lado: página siguiente
    let rueda = 0;
    pt0.addEventListener("wheel", (e) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : 0;
      if (Math.abs(d) < 4) return;
      e.preventDefault();
      const ahora = Date.now();
      if (ahora - rueda < 380) return;
      rueda = ahora;
      pasar(d > 0 ? 1 : -1);
    }, { passive: false });
    S.el.zoom.addEventListener("click", (e) => { if (!e.target.closest("img")) zoom(false); });
    // si cambia el tamaño (girar el móvil, abrir un panel): las páginas se recolocan y se sigue en la misma
    S.ro = new ResizeObserver(() => { clearTimeout(S && S.rz); if (S) S.rz = setTimeout(() => { if (S) recolocar(); }, 60); });
    S.ro.observe(S.el.escena);
    medidas();
    montar();
    irA(S.n);
    S.el.pista.focus({ preventScroll: true });
    pista();
  }

  // ---------- tamaño: la página entera en la pantalla; una o dos según el ancho ----------
  const esAncho = () => window.innerWidth >= 1000;
  function medidas() {
    const flechas = getComputedStyle($(".lec-sig", S.root)).display !== "none";
    const e = S.el.escena, movil = window.innerWidth < 600;
    const W = e.clientWidth - (flechas ? 136 : movil ? 8 : 24), H = e.clientHeight - (movil ? 8 : 32), r = S.ratio;
    S.doble = W / H > 1.12 && W >= 620;
    const ph = Math.max(120, Math.floor(S.doble ? Math.min(H, W / (2 * r)) : Math.min(H, W / r)));
    S.ph = ph; S.pw = Math.floor(ph * r);
    S.el.pista.style.setProperty("--pw", S.pw + "px");
    S.el.pista.style.setProperty("--ph", S.ph + "px");
  }
  function recolocar() {
    const antes = S.doble;
    medidas();
    if (S.doble !== antes) montar();
    irA(S.n);
  }

  // ---------- las hojas ----------
  // las imágenes solo se cargan en las hojas cercanas (la miniatura primero: se ve mientras llega la grande)
  function montar() {
    const d = S.L.dir;
    S.D2 = hojas();
    S.el.pista.innerHTML = S.D2.map((h, k) => `<div class="lec-hoja${h.length === 2 ? " doble" : ""}" data-k="${k}"><div class="lec-par">${h.map((n) =>
      `<div class="lec-pag" data-n="${n}"><img class="lec-mini" data-src="${d}/t${n3(n)}.jpg" alt="" aria-hidden="true" draggable="false"><img class="lec-img" data-src="${d}/p${n3(n)}.jpg" alt="${esc(T.pag)} ${n}" decoding="async" draggable="false"><span class="lec-sinfoto">${esc(T.sinFoto)}</span><div class="lec-capa"></div></div>`).join("")}</div></div>`).join("");
    S.hojasEl = $$(".lec-hoja", S.el.pista);
    S.el.rango.max = S.N;
    capas();
  }
  function cargarCerca() {
    // las grandes, en la hoja que se ve y las de al lado; las miniaturas, unas cuantas más (al deslizar rápido no sale nada en blanco)
    for (let k = S.k - 4; k <= S.k + 6; k++) {
      const h = S.hojasEl[k];
      if (!h) continue;
      const cerca = k >= S.k - 1 && k <= S.k + 2;
      $$(cerca ? "img[data-src]" : "img.lec-mini[data-src]", h).forEach((im) => { im.src = im.dataset.src; im.removeAttribute("data-src"); });
    }
  }
  // enlaces y lo encontrado al buscar, encima de cada página
  function capas(solo) {
    if (!S || !S.hojasEl) return;
    const D = S.D || {};
    $$(".lec-pag", S.el.pista).forEach((p) => {
      const n = +p.dataset.n;
      if (solo && !solo.includes(n)) return;
      const enl = ((D.l || {})[n] || []).map(([x, y, w, h, dst]) => {
        const t = fmt(T.irA, { n: dst });
        return `<a class="lec-enl${w * h > 0.004 ? " grande" : ""}" href="#/leer/${S.g}/${dst}" data-ir="${dst}" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;width:${(w * 100).toFixed(2)}%;height:${(h * 100).toFixed(2)}%" aria-label="${esc(t)}" title="${esc(t)}"></a>`;
      }).join("");
      const mar = S.marca && S.marca.n === n ? S.marca.cajas.map(([x0, y, x1, h]) =>
        `<span class="lec-marca" style="left:${((x0 - 0.006) * 100).toFixed(2)}%;top:${((y - 0.004) * 100).toFixed(2)}%;width:${((x1 - x0 + 0.012) * 100).toFixed(2)}%;height:${((h + 0.008) * 100).toFixed(2)}%"></span>`).join("") : "";
      $(".lec-capa", p).innerHTML = mar + enl;
    });
  }

  // ---------- pasar de hoja ----------
  function alDeslizar() {
    if (!S) return;
    S.rf = 0;
    if (S.saltando) return;
    const pt = S.el.pista, k = Math.round(pt.scrollLeft / Math.max(1, pt.clientWidth));
    if (k !== S.k && S.D2[k]) { S.k = k; S.n = S.D2[k][0]; if (S.marca && !S.D2[k].includes(S.marca.n)) { const m = S.marca.n; S.marca = null; capas([m]); } actualizar(); }
  }
  function irA(n, { suave = false, marca = "" } = {}) {
    if (!S || !S.D2) return;
    n = Math.min(Math.max(1, n | 0), S.N);
    const antes = S.marca ? S.marca.n : 0;
    S.marca = marca ? marcas(n, marca) : null;
    if (antes || S.marca) capas([antes, n]);
    S.n = n; S.k = hojaDe(n);
    const pt = S.el.pista;
    S.saltando = true;
    pt.scrollTo({ left: S.k * pt.clientWidth, behavior: suave && MOV ? "smooth" : "auto" });
    clearTimeout(S.tSalto);
    S.tSalto = setTimeout(() => { if (S) S.saltando = false; }, suave && MOV ? 550 : 80);
    actualizar();
  }
  function pasar(dir) {
    if (!S) return;
    const k = S.k + dir;
    if (k < 0 || k >= S.D2.length) return;
    irA(S.D2[k][0], { suave: true });
  }
  function actualizar() {
    if (!S) return;
    const v = vis();
    cargarCerca();
    const txt = v.todas.length === 2 ? `${v.todas[0]}–${v.todas[1]}` : String(v.todas[0]);
    S.el.num.textContent = `${txt} ${T.de} ${S.N}`;
    S.el.rango.value = S.n;
    S.el.rango.style.setProperty("--avance", ((S.n - 1) / Math.max(1, S.N - 1) * 100).toFixed(1) + "%");
    const ant = S.k <= 0, sig = S.k >= S.D2.length - 1;
    $$(".lec-ant, .lec-p-ant", S.root).forEach((b) => (b.disabled = ant));
    $$(".lec-sig, .lec-p-sig", S.root).forEach((b) => (b.disabled = sig));
    fichas(v);
    // lo que se puede tocar brilla un momento al llegar a la hoja
    $$(".lec-hoja.vista", S.el.pista).forEach((h) => h.classList.remove("vista"));
    const h = S.hojasEl[S.k];
    if (h) { void h.offsetWidth; h.classList.add("vista"); }
    // la dirección lleva la página (para volver aquí con «atrás» o compartir el enlace)
    const hs = `#/leer/${S.g}/${S.n}`;
    if (location.hash !== hs) history.replaceState(history.state, "", hs);
    pos.set(S.g, S.n);
    if (S.panel === "indice" || S.panel === "paginas") marcarActual();
    if (!S.el.zoom.hidden) zoom(true);
  }
  function fichas(v) {
    const D = S.D || {}, by = (G && G.BYID) || {}, vistos = new Set();
    // una página puede tener una seta, dos o tres (los cuadernos mini)
    S.el.fichas.innerHTML = v.todas.flatMap((n) => [].concat((D.f || {})[n] || [])).filter((id) => id && by[id] && !vistos.has(id) && vistos.add(id)).map((id) => {
      const e = by[id], cat = G.catOf ? G.catOf(e) : "";
      return `<a class="lec-ficha" href="#/especie/${esc(id)}"><i class="lec-punto c-${esc(cat)}"></i>${esc(T.ficha)}: <b>${esc(G.titulo ? G.titulo(e) : e.nombre)}</b> <span aria-hidden="true">→</span></a>`;
    }).join("");
  }
  function previa(n) {
    const p = S.el.previa;
    p.hidden = false;
    $("img", p).src = `${S.L.dir}/t${n3(n)}.jpg`;
    $("span", p).textContent = `${T.pag} ${n}${seccion(n) ? " · " + seccion(n) : ""}`;
    const k = (n - 1) / Math.max(1, S.N - 1);
    p.style.left = `calc(${(k * 100).toFixed(2)}% + ${(8 - 16 * k).toFixed(1)}px)`;
  }
  // título de la entrada del índice en la que cae la página
  function seccion(n) {
    const I = (S.D || {}).i || [];
    let s = null;
    for (const e of I) if (e[0] <= n) s = e; else break;
    return s ? s[1] : "";
  }
  function cambiarEdicion(g) {
    if (!S || g === S.g) return;
    // si se está viendo una seta, se abre la misma en la otra edición (si está en las dos)
    const F = (S.D || {}).f || {}, ids = vis().todas.flatMap((n) => [].concat(F[n] || []));
    cargarTexto(g).then((D) => {
      let n = pos.get(g) || 1;
      const f2 = (D && D.f) || {};
      for (const id of ids) { const p = Object.keys(f2).find((k) => [].concat(f2[k]).includes(id)); if (p) { n = +p; break; } }
      location.hash = `#/leer/${g}/${n}`;
    });
  }

  // ---------- teclado ----------
  document.addEventListener("keydown", (e) => {
    if (!S || e.altKey) return;
    const t = e.target, escribe = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA") && t.type !== "range";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") { e.preventDefault(); panel("buscar"); return; }
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      if (!S.el.zoom.hidden) zoom(false);
      else if (S.panel) panel(null);
      else location.hash = "#/libros";
      return;
    }
    if (escribe || (t && t.type === "range")) return;
    const k = e.key, boton = t && t.closest && t.closest("button, a");   // la barra espaciadora pulsa el botón que tenga el foco
    if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || (k === " " && !boton && !e.shiftKey)) { e.preventDefault(); pasar(1); }
    else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp" || (k === " " && !boton && e.shiftKey)) { e.preventDefault(); pasar(-1); }
    else if (k === "Home") { e.preventDefault(); irA(1); }
    else if (k === "End") { e.preventDefault(); irA(S.N); }
    else if (k === "/") { e.preventDefault(); panel("buscar"); }
    else if (k === "z" || k === "+") zoom(S.el.zoom.hidden);
  });
  document.addEventListener("fullscreenchange", () => { if (S) recolocar(); });

  // ---------- paneles: índice, buscar, miniaturas ----------
  function panel(tipo) {
    if (!S) return;
    S.panel = tipo;
    const P = S.el.panel;
    $$("[data-panel]", S.root).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.panel === tipo)));
    S.root.classList.toggle("con-panel", !!tipo);
    if (!tipo) { P.hidden = true; P.innerHTML = ""; return; }
    const D = S.D || {};
    const cab = `<div class="lec-panel-cab"><b>${esc(T[tipo])}</b><button type="button" class="lec-cerrar" aria-label="${esc(T.cerrar)}">✕</button></div>`;
    if (tipo === "indice") {
      const I = D.i || [], by = (G && G.BYID) || {};
      P.innerHTML = cab + `<ol class="lec-indice" translate="no">${I.map((e) => {
        const [p, tit, niv, sub, id] = e, sp = id && by[id], cat = sp && G.catOf ? G.catOf(sp) : "";
        return `<li class="n${niv}"><a href="#/leer/${S.g}/${p}" data-ir="${p}">${sp ? `<i class="lec-punto c-${esc(cat)}"></i>` : ""}<span>${esc(tit)}${sub ? ` <small>${esc(sub)}</small>` : ""}</span><b>${p}</b></a></li>`;
      }).join("")}</ol>`;
    } else if (tipo === "paginas") {
      P.innerHTML = cab + `<div class="lec-minis" translate="no">${Array.from({ length: S.N }, (_, i) => i + 1).map((n) =>
        `<a href="#/leer/${S.g}/${n}" data-ir="${n}" aria-label="${esc(T.pag)} ${n}"><img src="${S.L.dir}/t${n3(n)}.jpg" alt="" loading="lazy"><span>${n}</span></a>`).join("")}</div>`;
    } else {
      P.innerHTML = cab + `<form class="lec-busca" role="search"><input type="search" placeholder="${esc(T.buscarPH)}" aria-label="${esc(T.buscar)}" value="${esc(S.q)}" autocomplete="off" spellcheck="false"></form>
        <p class="lec-cuenta">${esc(T.buscarAyuda)}</p><ol class="lec-res" translate="no"></ol>`;
      const inp = $("input", P);
      let rl = 0;
      inp.addEventListener("input", () => { clearTimeout(rl); rl = setTimeout(() => buscar(inp.value), 140); });
      $("form", P).onsubmit = (e) => { e.preventDefault(); buscar(inp.value); const a = $(".lec-res a", P); if (a) a.click(); };
      if (S.q) buscar(S.q);
      setTimeout(() => inp.focus({ preventScroll: true }), 30);
    }
    P.hidden = false;
    $(".lec-cerrar", P).onclick = () => panel(null);
    if (tipo !== "buscar") marcarActual(true);
    // en pantallas anchas el panel va al lado y las páginas se encogen (las recoloca el ResizeObserver)
  }
  function marcarActual(desplazar) {
    const P = S.el.panel, v = vis();
    $$(".actual", P).forEach((x) => x.classList.remove("actual"));
    let el = null;
    if (S.panel === "paginas") { v.todas.forEach((n) => { const a = $(`.lec-minis a[data-ir="${n}"]`, P); if (a) { a.classList.add("actual"); el = el || a; } }); }
    else if (S.panel === "indice") {
      const ult = Math.max(...v.todas);
      $$(".lec-indice a", P).forEach((a) => { if (+a.dataset.ir <= ult) el = a; });
      if (el) el.classList.add("actual");
    }
    if (el && desplazar) el.scrollIntoView({ block: "center" });
  }
  function buscar(q) {
    const P = S.el.panel, out = $(".lec-res", P), cuenta = $(".lec-cuenta", P);
    if (!out) return;
    S.q = q = q.trim();
    const pal = plano(q).split(/[^a-z0-9·]+/).filter((w) => w.length >= 2);
    if (!q) { cuenta.textContent = T.buscarAyuda; out.innerHTML = ""; return; }
    if (!pal.length) { cuenta.textContent = T.corto; out.innerHTML = ""; return; }
    const D = S.D;
    if (!D || !D.p) { cuenta.textContent = T.noTexto; out.innerHTML = ""; return; }
    if (!S.planos) S.planos = D.p.map((segs) => segs.map((s) => plano(s[0])));
    const res = [];
    S.planos.forEach((segs, i) => {
      const todo = segs.join(" ");
      if (!pal.every((w) => todo.includes(w))) return;
      const j = segs.findIndex((s) => s.includes(pal[0]));
      res.push({ n: i + 1, txt: D.p[i][j >= 0 ? j : 0][0], pl: segs[j >= 0 ? j : 0] });
    });
    const MAX = 150;
    cuenta.textContent = !res.length ? T.nada : res.length === 1 ? T.res1 : res.length > MAX ? fmt(T.resMas, { n: res.length, m: MAX }) : fmt(T.resN, { n: res.length });
    out.innerHTML = res.slice(0, MAX).map((r) => `<li><a href="#/leer/${S.g}/${r.n}" data-ir="${r.n}" data-q="1"><b>${r.n}</b><span>${resaltar(r.txt, r.pl, pal)}</span></a></li>`).join("");
  }
  // trozo de texto con lo buscado en <mark> (las posiciones del texto plano valen para el original)
  function resaltar(txt, pl, pal) {
    const r = [];
    pal.forEach((w) => { let i = pl.indexOf(w); while (i >= 0) { r.push([i, i + w.length]); i = pl.indexOf(w, i + w.length); } });
    r.sort((a, b) => a[0] - b[0]);
    let ini = 0, fin = txt.length;
    if (r.length && txt.length > 150) { ini = Math.max(0, r[0][0] - 50); fin = Math.min(txt.length, ini + 150); }
    let o = ini > 0 ? "…" : "", c = ini;
    r.filter(([a, b]) => a >= c && b <= fin).forEach(([a, b]) => { if (a < c) return; o += esc(txt.slice(c, a)) + "<mark>" + esc(txt.slice(a, b)) + "</mark>"; c = b; });
    return o + esc(txt.slice(c, fin)) + (fin < txt.length ? "…" : "");
  }
  function marcas(n, q) {
    const D = S.D; if (!D || !D.p || !D.p[n - 1]) return null;
    const pal = plano(q).split(/[^a-z0-9·]+/).filter((w) => w.length >= 2);
    const cajas = D.p[n - 1].filter((s) => { const p = plano(s[0]); return pal.some((w) => p.includes(w)); }).map((s) => [s[1], s[2], s[3], s[4]]);
    return cajas.length ? { n, cajas } : null;
  }

  // ---------- ampliar ----------
  function zoom(abrir) {
    const Z = S.el.zoom;
    if (!abrir) { Z.hidden = true; Z.innerHTML = ""; return; }
    const v = vis();
    Z.innerHTML = `<button type="button" class="lec-cerrar" aria-label="${esc(T.cerrar)}">✕</button><p class="lec-zoom-ayuda">${esc(T.zoomAyuda)}</p>${v.todas.map((n) =>
      `<img src="${S.L.dir}/p${n3(n)}.jpg" alt="${esc(T.pag)} ${n}" draggable="false">`).join("")}`;
    Z.hidden = false;
    $(".lec-cerrar", Z).onclick = () => zoom(false);
    // con el ratón, arrastrar mueve la página ampliada
    let a = null;
    Z.onpointerdown = (e) => { if (e.pointerType !== "mouse" || !e.target.closest("img")) return; a = { x: e.clientX, y: e.clientY, l: Z.scrollLeft, t: Z.scrollTop }; Z.classList.add("arrastra"); };
    Z.onpointermove = (e) => { if (!a) return; Z.scrollLeft = a.l - (e.clientX - a.x); Z.scrollTop = a.t - (e.clientY - a.y); };
    Z.onpointerup = Z.onpointerleave = () => { a = null; Z.classList.remove("arrastra"); };
  }

  // ---------- avisos ----------
  function aviso(txt, boton) {
    const A = S.el.aviso;
    A.innerHTML = `<span>${esc(txt)}</span>${boton ? `<button type="button" class="btn">${esc(boton)}</button>` : ""}`;
    A.hidden = false;
    const cerrar = () => { if (S && S.el.aviso === A) A.hidden = true; };
    if (boton) $("button", A).onclick = cerrar;
    else setTimeout(cerrar, 6000);
    return cerrar;
  }
  function pista() {
    try { if (localStorage.getItem("setas:leer-pista4")) return; localStorage.setItem("setas:leer-pista4", "1"); } catch (e) { return; }
    const cerrar = aviso(TACTIL ? T.pista : T.pistaPC, T.entendido);
    setTimeout(cerrar, 9000);
  }

  window.VISTAS_EXTRA = window.VISTAS_EXTRA || {};
  window.VISTAS_EXTRA.leer = (arg, GU) => abrir(arg, GU);
  // para la página de libros (app.js): qué edición abrir y dónde se quedó cada libro
  window.LECTOR = { LIBROS, porIdioma, guardada: (g) => pos.get(g) };
})();
