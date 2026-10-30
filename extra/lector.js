/* Lector de libros: hojear los libros en PDF como un libro de verdad, antes de descargarlos (#/leer/<libro>/<página>).
   - Páginas: libros/<libro>/pNNN.jpg (800 px) y tNNN.jpg (miniatura, se ve mientras carga la grande y sin internet).
   - libros/<libro>/texto.js: el texto de cada página (para buscar), los enlaces dentro de la página («→ p. 29» y los
     números de los índices), qué ficha de la web corresponde a cada página y el índice. Todo sale de los PDF.
   - En pantallas anchas se ven dos páginas y la hoja gira en 3D (se puede arrastrar con el dedo o el ratón); en el móvil, una.
   - El cuaderno de bolsillo tiene dos ediciones: en castellano (bolsillo) y en catalán (butxaca). */
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
    pista: "Llisca o toca la vora de la pàgina per passar-la. Els «→ p.» i els números dels índexs porten a la seva pàgina.",
    pistaPC: "Fes clic a la pàgina o fes servir ← → per passar-la. Els «→ p.» i els números dels índexs porten a la seva pàgina.",
    entendido: "Entesos", sinFoto: "Aquesta pàgina no està desada per veure-la sense internet.", zoomAyuda: "Toca fora de la pàgina o prem Esc per tornar.",
  } : {
    volver: "Libros", indice: "Índice", buscar: "Buscar", paginas: "Páginas", ampliar: "Ampliar", pantalla: "Pantalla completa",
    pdf: "Descargar el PDF", ant: "Página anterior", sig: "Página siguiente", pag: "Página", irA: "Ir a la página {n}", ficha: "Ficha en la web",
    buscarPH: "Una seta, una palabra…", buscarAyuda: "Busca en todo el texto del libro. Al abrir la página, lo encontrado se marca en amarillo.",
    res1: "1 página", resN: "{n} páginas", resMas: "{n} páginas (se muestran {m})", nada: "No aparece en este libro.", corto: "Escribe al menos 2 letras.",
    cargando: "Abriendo el libro…", noTexto: "No se ha podido cargar el texto del libro: se puede hojear, pero no buscar.",
    cerrar: "Cerrar", edicion: "Edición", edES: "En castellano", edCA: "En catalán", de: "de",
    pista: "Desliza o toca el borde de la página para pasarla. Los «→ p.» y los números de los índices llevan a su página.",
    pistaPC: "Haz clic en la página o usa ← → para pasarla. Los «→ p.» y los números de los índices llevan a su página.",
    entendido: "Entendido", sinFoto: "Esta página no está guardada para verla sin internet.", zoomAyuda: "Toca fuera de la página o pulsa Esc para volver.",
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const n3 = (n) => String(n).padStart(3, "0");
  const MOV = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const TACTIL = window.matchMedia && matchMedia("(hover: none)").matches;

  const pdfDe = (f, otro) => (((window.DB && DB.libros) || []).find((l) => l.f === f) || {}).url || otro;
  const LIBROS = {
    bolsillo: { tit: "Setas esenciales · cuaderno de bolsillo", sub: CA ? "48 pàgines · 41 bolets" : "48 páginas · 41 setas", n: 48,
      pdf: "offline/setas-esenciales-bolsillo.pdf", ed: "es", otra: "butxaca" },
    butxaca: { tit: "Cistella Segura · quadern de butxaca", sub: CA ? "76 pàgines · 50 bolets" : "76 páginas · 50 setas · en catalán", n: 76,
      pdf: "offline/cistella-segura-butxaca.pdf", ed: "ca", otra: "bolsillo" },
    esencial: { tit: "Setas comestibles esenciales de Cataluña", sub: CA ? "336 pàgines · 79 bolets" : "336 páginas · 79 setas", n: 336,
      pdf: pdfDe("guia-esencial-color-movil.pdf", "#/libros") },
  };
  Object.keys(LIBROS).forEach((g) => (LIBROS[g].dir = "libros/" + g));
  // dónde se quedó cada libro (setas:leer = {bolsillo: 12, …})
  const pos = {
    todo() { try { return JSON.parse(localStorage.getItem("setas:leer")) || {}; } catch (e) { return {}; } },
    get(g) { return +this.todo()[g] || 0; },
    set(g, n) { try { const o = this.todo(); o[g] = n; localStorage.setItem("setas:leer", JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } },
  };
  // el cuaderno de bolsillo se abre en el idioma de la web
  const porIdioma = (g) => (g === "bolsillo" && CA ? "butxaca" : g);

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
  let S = null;   // { g, L, D, N, n, doble, pw, ph, giro, arr, panel, marca, q, … }
  let G = null;   // utilidades de la web (window.GUIA)
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

  // páginas que se ven: en doble, la par a la izquierda y la impar a la derecha (la portada sola, a la derecha)
  function vis(n) {
    n = n ?? S.n;
    if (!S.doble) return { L: 0, R: n, todas: [n] };
    const L = n - (n % 2), R = L + 1;
    return { L, R: R <= S.N ? R : 0, todas: [L, R].filter((x) => x >= 1 && x <= S.N) };
  }
  function destino(dir) {
    const v = vis();
    if (!S.doble) { const d = S.n + dir; return d >= 1 && d <= S.N ? d : null; }
    if (dir > 0) { const ult = v.R || v.L; return ult < S.N ? ult + 1 : null; }
    return v.L > 1 ? v.L - 1 : null;
  }

  // ---------- montar y desmontar ----------
  window.addEventListener("hashchange", () => { if (S && !/^#\/leer\//.test(location.hash)) desmontar(); });
  function desmontar() {
    if (!S) return;
    if (S.giro && S.giro.forzar) S.giro.forzar();
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
    if (S && S.g === g0) { irA(n, { animar: false }); return; }
    desmontar();
    S = { g: g0, L, N: L.n, n, D: null, doble: false, ratio: 800 / 1131, panel: null, marca: null, q: "" };
    construir();
    cargarTexto(g0).then((D) => {
      if (!S || S.g !== g0) return;
      S.D = D;
      if (D && D.n) S.N = D.n;
      if (!D) aviso(T.noTexto);
      pintar();
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
        ${otra ? `<div class="lec-ed" role="group" aria-label="${esc(T.edicion)}">${["bolsillo", "butxaca"].map((g) => `<button type="button" data-ed="${g}" aria-pressed="${g === S.g}" title="${esc(LIBROS[g].ed === "ca" ? T.edCA : T.edES)}">${LIBROS[g].ed.toUpperCase()}</button>`).join("")}</div>` : ""}
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
          <div class="lec-libro">
            <i class="lec-canto lec-canto-izq"></i><i class="lec-canto lec-canto-der"></i>
            <div class="lec-hoja lec-izq"></div><div class="lec-hoja lec-der"></div>
          </div>
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
    S.el = { escena: $(".lec-escena", root), libro: $(".lec-libro", root), izq: $(".lec-izq", root), der: $(".lec-der", root),
      num: $(".lec-num", root), rango: $(".lec-rango input", root), previa: $(".lec-previa", root), fichas: $(".lec-fichas", root),
      panel: $(".lec-panel", root), zoom: $(".lec-zoom", root), aviso: $(".lec-aviso", root) };
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
    r.addEventListener("change", () => { S.el.previa.hidden = true; irA(+r.value, { animar: false }); });
    r.addEventListener("blur", () => (S.el.previa.hidden = true));
    // enlaces dentro de las páginas, del índice, de la búsqueda y de las miniaturas
    root.addEventListener("click", (e) => {
      const a = e.target.closest("[data-ir]");
      if (!a) return;
      e.preventDefault();
      const n = +a.dataset.ir;
      const q = a.dataset.q ? S.q : "";
      if (!esAncho() && S.panel) panel(null);
      irA(n, { animar: false, marca: q });
    });
    // fotos que no cargan (sin internet): se queda la miniatura; si tampoco hay, un aviso en la página
    root.addEventListener("error", (e) => {
      const im = e.target;
      if (im.tagName !== "IMG") return;
      im.classList.add("mal");
      const p = im.closest(".lec-pag");
      if (p && $$("img", p).every((x) => x.classList.contains("mal"))) p.classList.add("sin-foto");
    }, true);
    gestos();
    S.el.zoom.addEventListener("click", (e) => { if (!e.target.closest("img")) zoom(false); });
    new ResizeObserver(() => { clearTimeout(S && S.rz); if (S) S.rz = setTimeout(() => { if (S) { medidas(); pintar(); } }, 80); }).observe(S.el.escena);
    medidas();
    pintar();
    pista();
  }

  // ---------- tamaño: una o dos páginas según la pantalla ----------
  const esAncho = () => window.innerWidth >= 1000;
  function medidas() {
    // sitio para las flechas de los lados (si se ven)
    const flechas = getComputedStyle($(".lec-sig", S.root)).display !== "none";
    const e = S.el.escena, W = e.clientWidth - (flechas ? 136 : 16), H = e.clientHeight - (window.innerWidth < 600 ? 12 : 36);
    const r = S.ratio;
    S.doble = W / H > 1.12 && W >= 620;
    const ph = Math.max(120, Math.floor(S.doble ? Math.min(H, W / (2 * r)) : Math.min(H, W / r)));
    S.ph = ph; S.pw = Math.floor(ph * r);
    const lb = S.el.libro;
    lb.style.width = (S.doble ? 2 * S.pw : S.pw) + "px";
    lb.style.height = ph + "px";
    lb.style.setProperty("--pw", S.pw + "px");
    lb.classList.toggle("doble", S.doble);
    lb.classList.toggle("simple", !S.doble);
  }

  // ---------- pintar ----------
  function pagHTML(n, conEnlaces = true) {
    if (!n || n < 1 || n > S.N) return "";
    const d = S.L.dir, D = S.D || {};
    const enl = conEnlaces ? ((D.l || {})[n] || []).map(([x, y, w, h, p]) => {
      const t = fmt(T.irA, { n: p });
      return `<a class="lec-enl" href="#/leer/${S.g}/${p}" data-ir="${p}" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;width:${(w * 100).toFixed(2)}%;height:${(h * 100).toFixed(2)}%" aria-label="${esc(t)}" title="${esc(t)}"></a>`;
    }).join("") : "";
    const mar = S.marca && S.marca.n === n ? S.marca.cajas.map(([x0, y, x1, h]) =>
      `<span class="lec-marca" style="left:${((x0 - 0.006) * 100).toFixed(2)}%;top:${((y - 0.004) * 100).toFixed(2)}%;width:${((x1 - x0 + 0.012) * 100).toFixed(2)}%;height:${((h + 0.008) * 100).toFixed(2)}%"></span>`).join("") : "";
    return `<div class="lec-pag" data-n="${n}"><img class="lec-mini" src="${d}/t${n3(n)}.jpg" alt="" aria-hidden="true" draggable="false"><img class="lec-img" src="${d}/p${n3(n)}.jpg" alt="${esc(T.pag)} ${n}" draggable="false" decoding="async"><span class="lec-sinfoto">${esc(T.sinFoto)}</span>${mar}${enl}</div>`;
  }
  function pintar() {
    if (!S) return;
    const v = vis(), lb = S.el.libro;
    if (S.doble) { S.el.izq.innerHTML = pagHTML(v.L); S.el.der.innerHTML = pagHTML(v.R); }
    else { S.el.izq.innerHTML = ""; S.el.der.innerHTML = pagHTML(v.R); }
    estadoLibro(v);
    // pie: número, barra, flechas y fichas
    const txt = v.todas.length === 2 ? `${v.todas[0]}–${v.todas[1]}` : String(v.todas[0]);
    S.el.num.textContent = `${txt} ${T.de} ${S.N}`;
    S.el.rango.max = S.N; S.el.rango.value = S.n;
    S.el.rango.style.setProperty("--avance", ((S.n - 1) / Math.max(1, S.N - 1) * 100).toFixed(1) + "%");
    const ant = destino(-1) === null, sig = destino(1) === null;
    $$(".lec-ant, .lec-p-ant", S.root).forEach((b) => (b.disabled = ant));
    $$(".lec-sig, .lec-p-sig", S.root).forEach((b) => (b.disabled = sig));
    fichas(v);
    if (S.marca && !v.todas.includes(S.marca.n)) S.marca = null;
    // la dirección lleva la página (para volver aquí con «atrás» o compartir el enlace)
    const h = `#/leer/${S.g}/${S.n}`;
    if (location.hash !== h) history.replaceState(history.state, "", h);
    pos.set(S.g, S.n);
    if (S.panel === "indice" || S.panel === "paginas") marcarActual();
    if (!S.el.zoom.hidden) zoom(true);
    precargar(v);
  }
  // portada sola: el libro se centra; los cantos (grosor) según lo leído
  function estadoLibro(v) {
    const lb = S.el.libro;
    lb.classList.toggle("cerrado-izq", S.doble && !v.L);
    lb.classList.toggle("cerrado-der", S.doble && !v.R);
    const leido = (v.L || v.R) / S.N, k = Math.min(10, Math.max(3, Math.round(S.N / 30)));
    lb.style.setProperty("--ci", (S.doble && v.L ? Math.max(1, Math.round(k * leido)) : 0) + "px");
    lb.style.setProperty("--cd", ((v.R || v.L) < S.N ? Math.max(1, Math.round(k * (1 - leido))) : 0) + "px");
  }
  const guardadas = [];
  function precargar(v) {
    const a = Math.min(...v.todas), b = Math.max(...v.todas), d = S.doble ? 2 : 1;
    guardadas.length = 0;
    for (let n = a - d; n <= b + 2 * d; n++) if (n >= 1 && n <= S.N && !v.todas.includes(n)) { const im = new Image(); im.src = `${S.L.dir}/p${n3(n)}.jpg`; guardadas.push(im); }
  }
  function fichas(v) {
    const D = S.D || {}, by = (G && G.BYID) || {}, vistos = new Set();
    S.el.fichas.innerHTML = v.todas.map((n) => (D.f || {})[n]).filter((id) => id && by[id] && !vistos.has(id) && vistos.add(id)).map((id) => {
      const e = by[id], cat = G.catOf ? G.catOf(e) : "";
      return `<a class="lec-ficha" href="#/especie/${esc(id)}"><i class="lec-punto c-${esc(cat)}"></i>${esc(T.ficha)}: <b>${esc(G.titulo ? G.titulo(e) : e.nombre)}</b> <span aria-hidden="true">→</span></a>`;
    }).join("");
  }
  function previa(n) {
    const p = S.el.previa, r = S.el.rango;
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

  // ---------- ir a una página ----------
  function irA(n, { animar = true, marca = "" } = {}) {
    if (!S) return;
    n = Math.min(Math.max(1, n | 0), S.N);
    if (S.giro && S.giro.forzar) S.giro.forzar();
    S.marca = marca ? marcas(n, marca) : null;
    const v = vis(), w = vis(n);
    if (animar && MOV && w.todas.join() !== v.todas.join()) {
      // salto: la página nueva entra con un fundido corto
      S.n = n; pintar();
      S.el.libro.classList.remove("salto"); void S.el.libro.offsetWidth; S.el.libro.classList.add("salto");
      return;
    }
    S.n = n; pintar();
    if (marca) { S.el.libro.classList.remove("salto"); void S.el.libro.offsetWidth; S.el.libro.classList.add("salto"); }
  }
  function cambiarEdicion(g) {
    if (!S || g === S.g) return;
    // si se está viendo una seta, se abre la misma en la otra edición (si está en las dos)
    const F = (S.D || {}).f || {}, ids = vis().todas.map((n) => F[n]).filter(Boolean);
    cargarTexto(g).then((D) => {
      let n = pos.get(g) || 1;
      const f2 = (D && D.f) || {};
      for (const id of ids) { const p = Object.keys(f2).find((k) => f2[k] === id); if (p) { n = +p; break; } }
      location.hash = `#/leer/${g}/${n}`;
    });
  }

  // ---------- pasar página con la hoja girando ----------
  function pasar(dir) {
    if (!S) return;
    if (S.giro && S.giro.forzar) S.giro.forzar();
    const d = destino(dir);
    if (d === null) { rebote(dir); return; }
    if (!MOV || document.hidden) { S.n = d; S.marca = null; pintar(); return; }
    const g = crearGiro(dir, d);
    animar(g, 0, 1, S.doble ? 650 : 480, () => terminarGiro(g, true));
  }
  function rebote(dir) {
    const lb = S.el.libro;
    lb.classList.remove("rebote-izq", "rebote-der"); void lb.offsetWidth;
    lb.classList.add(dir > 0 ? "rebote-der" : "rebote-izq");
  }
  // Prepara la hoja que gira: por delante la página que se va, por detrás la que llega.
  // set(p) la mueve de 0 (sin girar) a 1 (girada del todo).
  function crearGiro(dir, d) {
    const v = vis(), w = vis(d), lb = S.el.libro;
    const hoja = document.createElement("div");
    hoja.className = "lec-giro";
    let cara, dorso, angulo;
    if (S.doble) {
      if (dir > 0) {
        S.el.der.innerHTML = pagHTML(w.R, false);
        cara = v.R; dorso = w.L;
        hoja.classList.add("a-der");
        angulo = (p) => -180 * p;
      } else {
        S.el.izq.innerHTML = pagHTML(w.L, false);
        cara = v.L; dorso = w.R;
        hoja.classList.add("a-izq");
        angulo = (p) => 180 * p;
      }
      estadoLibro(w);
    } else if (dir > 0) {
      cara = v.R; dorso = 0;
      S.el.der.innerHTML = pagHTML(d, false);
      hoja.classList.add("a-der", "suelta");
      angulo = (p) => -180 * p;
    } else {
      cara = d; dorso = 0;
      hoja.classList.add("a-der", "suelta");
      angulo = (p) => -180 * (1 - p);
    }
    hoja.innerHTML = `<div class="lec-cara">${pagHTML(cara, false)}<i class="lec-sombra"></i></div><div class="lec-dorso">${dorso ? pagHTML(dorso, false) : '<div class="lec-blanco"></div>'}<i class="lec-sombra"></i></div>`;
    lb.appendChild(hoja);
    const sc = $(".lec-cara .lec-sombra", hoja), sd = $(".lec-dorso .lec-sombra", hoja);
    const g = { dir, d, hoja, p: 0 };
    g.set = (p) => {
      g.p = p;
      const a = angulo(p), abs = Math.abs(a);
      hoja.style.transform = `rotateY(${a.toFixed(2)}deg)`;
      sc.style.opacity = (abs < 90 ? (abs / 90) * 0.5 : 0).toFixed(3);
      sd.style.opacity = (abs > 90 ? ((180 - abs) / 90) * 0.4 : 0).toFixed(3);
      hoja.style.setProperty("--lift", Math.sin((abs / 180) * Math.PI).toFixed(3));
    };
    g.set(0);
    S.giro = g;
    return g;
  }
  function animar(g, p0, p1, ms, fin) {
    const t0 = performance.now(), dur = Math.max(140, ms * Math.abs(p1 - p0));
    let hecho = false;
    const acabar = () => { if (hecho) return; hecho = true; g.set(p1); g.forzar = null; fin(); };
    g.forzar = acabar;
    const paso = (t) => {
      if (hecho) return;
      const k = Math.min(1, (t - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      g.set(p0 + (p1 - p0) * e);
      if (k < 1) requestAnimationFrame(paso); else acabar();
    };
    requestAnimationFrame(paso);
    setTimeout(acabar, dur + 400);   // si la pestaña está oculta no hay fotogramas: se termina igual
  }
  function terminarGiro(g, completo) {
    if (!S || S.giro !== g) { g.hoja.remove(); return; }
    S.giro = null;
    if (completo) { S.n = g.d; S.marca = null; }
    pintar();
    g.hoja.remove();
  }

  // ---------- gestos: arrastrar la hoja, tocar los bordes ----------
  function gestos() {
    const lb = S.el.libro;
    lb.addEventListener("pointerdown", (e) => {
      if (e.button > 0 || e.target.closest("a, button")) return;
      if (S.giro && S.giro.forzar) S.giro.forzar();
      const r = lb.getBoundingClientRect();
      S.arr = { x0: e.clientX, y0: e.clientY, t0: performance.now(), lado: (e.clientX - r.left) / r.width, giro: null, nada: false, id: e.pointerId };
      try { lb.setPointerCapture(e.pointerId); } catch (er) { /* nada */ }
    });
    lb.addEventListener("pointermove", (e) => {
      const a = S && S.arr;
      if (!a || a.nada || e.pointerId !== a.id) return;
      const dx = e.clientX - a.x0, dy = e.clientY - a.y0;
      if (!a.giro) {
        if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        const dir = S.doble ? (a.lado > 0.5 ? 1 : -1) : (dx < 0 ? 1 : -1);
        const d = (dir > 0) === (dx < 0) ? destino(dir) : null;
        if (d === null || !MOV) { a.nada = true; return; }
        a.giro = crearGiro(dir, d);
      }
      const dist = S.doble ? 1.7 * S.pw : 1.1 * S.pw;
      a.giro.set(Math.min(1, Math.max(0, (a.giro.dir > 0 ? -dx : dx) / dist)));
    });
    const soltar = (e, cancelado) => {
      const a = S && S.arr;
      if (!a || e.pointerId !== a.id) return;
      S.arr = null;
      const dx = e.clientX - a.x0, dy = e.clientY - a.y0, dt = performance.now() - a.t0;
      if (a.giro) {
        const g = a.giro, v = Math.abs(dx) / Math.max(1, dt);
        const sigue = !cancelado && (g.p > 0.33 || (v > 0.5 && (g.dir > 0) === (dx < 0)));
        animar(g, g.p, sigue ? 1 : 0, S.doble ? 650 : 480, () => terminarGiro(g, sigue));
        return;
      }
      if (cancelado || a.nada || Math.abs(dx) > 8 || Math.abs(dy) > 8) return;
      // toque: en doble, la página derecha avanza y la izquierda retrocede; en una, el tercio izquierdo retrocede
      if (S.doble) pasar(a.lado > 0.5 ? 1 : -1);
      else pasar(a.lado < 0.3 ? -1 : 1);
    };
    lb.addEventListener("pointerup", (e) => soltar(e, false));
    lb.addEventListener("pointercancel", (e) => soltar(e, true));
    // rueda o panel táctil hacia los lados
    let rueda = 0;
    S.el.escena.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5 || Math.abs(e.deltaX) < 4) return;
      e.preventDefault();
      const ahora = Date.now();
      if (ahora - rueda < 450) return;
      rueda = ahora;
      pasar(e.deltaX > 0 ? 1 : -1);
    }, { passive: false });
  }
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
    if (k === "ArrowRight" || k === "PageDown" || (k === " " && !boton && !e.shiftKey)) { e.preventDefault(); pasar(1); }
    else if (k === "ArrowLeft" || k === "PageUp" || (k === " " && !boton && e.shiftKey)) { e.preventDefault(); pasar(-1); }
    else if (k === "Home") { e.preventDefault(); irA(1); }
    else if (k === "End") { e.preventDefault(); irA(S.N); }
    else if (k === "/") { e.preventDefault(); panel("buscar"); }
    else if (k === "z" || k === "+") zoom(S.el.zoom.hidden);
  });
  document.addEventListener("fullscreenchange", () => { if (S) { medidas(); pintar(); } });

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
    // en pantallas anchas el panel va al lado y el libro se encoge (lo recoloca el ResizeObserver)
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
    try { if (localStorage.getItem("setas:leer-pista")) return; localStorage.setItem("setas:leer-pista", "1"); } catch (e) { return; }
    const cerrar = aviso(TACTIL ? T.pista : T.pistaPC, T.entendido);
    setTimeout(cerrar, 9000);
  }

  window.VISTAS_EXTRA = window.VISTAS_EXTRA || {};
  window.VISTAS_EXTRA.leer = (arg, GU) => abrir(arg, GU);
  // para la página de libros (app.js): qué edición abrir y dónde se quedó cada libro
  window.LECTOR = { LIBROS, porIdioma, guardada: (g) => pos.get(g) };
})();
