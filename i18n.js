/* Cistella Segura · castellano / catalán
   - El idioma se elige con el botón ES · CA (se guarda en el navegador). Sin elección: el del navegador.
   - Los DATOS (fichas, árboles, Aprende, vocabulario) se traducen con un diccionario exacto
     «texto en castellano → texto en catalán» (datos/ca.js → window.CA.datos), aplicado a window.DB
     antes de que arranque la web.
   - La INTERFAZ (menús, botones, avisos) se traduce en la página: cada texto que aparece se busca en
     window.CA.ui. Los números se cambian por {n} («163 especies» → «{n} especies»), así una sola
     entrada vale para cualquier número.
   index.html carga datos/ca.js solo si el idioma es catalán (el castellano no descarga nada más). */
(function () {
  "use strict";
  const IDIOMA = window.IDIOMA === "ca" ? "ca" : "es";

  // ---------- Qué textos de los datos se traducen ----------
  // Solo prosa: nada de códigos (comestible, pinar_carrasco), nombres de especies, citas, enlaces ni rutas.
  const NO = new Set(["id", "nombre", "autor", "url", "g", "t", "licencia", "taxon", "sinonimos", "_q", "consulta", "fuentes",
    "familia", "orden", "genero", "clase", "filo", "reino", "papel", "rel", "cat", "grupo", "guias", "habitats", "nivel",
    "evidencia", "tipo", "fuente", "clave", "ref", "doi", "isbn", "enlace", "enlaces", "generado", "version", "es", "ca", "cita"]);
  const FUERA = new Set(["registro", "meta", "libros", "cuaderno", "control"]);
  // En el vocabulario, «nombre» es la etiqueta que se ve (Pinar de pino carrasco, Hayedo…): sí se traduce
  let enVocabulario = false;
  const traducible = (k, s) => {
    if (NO.has(k) && !(enVocabulario && k === "nombre")) return false;
    const t = s.trim();
    if (!/[a-záéíóúñü]/i.test(t)) return false;
    if (!/\s/.test(t) && !/^[A-ZÁÉÍÓÚÑ¿¡«]/.test(t)) return false;   // una palabra en minúscula: es un código
    return !/^(https?:|fotos\/|offline\/|libros\/)/.test(t);
  };
  // Recorre los datos y llama a f(texto, clave) con cada texto traducible; si f devuelve algo, lo cambia
  function recorre(o, k, enNombres, f) {
    if (Array.isArray(o)) { o.forEach((x, i) => { if (typeof x === "string") { if (!enNombres && traducible(k, x)) { const r = f(x, k); if (r !== undefined) o[i] = r; } } else recorre(x, k, enNombres, f); }); return; }
    if (!o || typeof o !== "object") return;
    for (const kk in o) {
      const v = o[kk];
      if (typeof v === "string") { if (!enNombres && traducible(kk, v)) { const r = f(v, kk); if (r !== undefined) o[kk] = r; } }
      // dentro de «nombres» no se traducen los nombres (ca, es), pero sí las notas sobre ellos
      else recorre(v, kk, (enNombres || kk === "nombres") && kk !== "notas", f);
    }
  }
  const porDatos = (db, f) => { for (const k in db) if (!FUERA.has(k)) { enVocabulario = k === "vocabulario"; recorre(db[k], k, false, f); } enVocabulario = false; };
  function textosDatos(db) {
    const out = new Set();
    porDatos(db, (s) => { out.add(s.trim()); });
    return [...out];
  }

  // ---------- Interfaz: diccionario con números como {n} ----------
  const NUM = /\d+(?:[.,]\d+)*/g;
  const claveUI = (s) => s.trim().replace(/\s+/g, " ");

  window.I18N = { IDIOMA, textosDatos, claveUI, NUM };

  // ---------- Botón ES · CA (en el menú): guarda la elección y recarga en el otro idioma ----------
  function botonIdioma() {
    document.querySelectorAll("[data-idioma]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.idioma === IDIOMA));
      b.onclick = () => {
        if (b.dataset.idioma === IDIOMA) return;
        try { localStorage.setItem("setas:idioma", JSON.stringify(b.dataset.idioma)); } catch (e) { /* sin almacenamiento: solo esta vez */ }
        location.reload();
      };
    });
  }
  if (document.body) botonIdioma(); else document.addEventListener("DOMContentLoaded", botonIdioma);
  if (IDIOMA !== "ca" || !window.CA) return;

  // 1) Datos: se cambian antes de que la web los use
  const D = window.CA.datos || {};
  if (window.DB) porDatos(window.DB, (s) => D[s.trim()]);

  // 2) Interfaz: se traduce todo lo que se pinta, también lo que cambia después
  const U = window.CA.ui || {};
  // busca un texto tal cual o con los números como {n}
  function busca(t) {
    const r = U[t];
    if (r !== undefined) return r;
    const nums = t.match(NUM);
    if (!nums) return undefined;
    const v = U[t.replace(NUM, "{n}")];
    if (v === undefined) return undefined;
    let i = 0;
    return v.replace(/\{n\}/g, () => (nums[i++] ?? ""));
  }
  function tr(s) {
    const t = claveUI(s);
    if (!t || t.length < 2) return null;
    let r = busca(t);
    // textos hechos de trozos con « · » (pies de foto, listas): se traduce cada trozo
    if (r === undefined && t.includes(" · ")) {
      const partes = t.split(" · ").map((p) => { const x = busca(p.trim()); return x === undefined ? p : x; });
      r = partes.join(" · ");
    }
    if (r === undefined || r === t) return null;
    const ini = s.match(/^\s*/)[0], fin = s.match(/\s*$/)[0];
    return ini + r + fin;
  }
  const ATRS = ["placeholder", "title", "aria-label", "alt"];
  const SALTA = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);
  function traduce(raiz) {
    if (!raiz) return;
    if (raiz.nodeType === 3) { const r = tr(raiz.nodeValue); if (r !== null) raiz.nodeValue = r; return; }
    if (raiz.nodeType !== 1 || SALTA.has(raiz.tagName)) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: (n) => (n.nodeType === 1 && SALTA.has(n.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const els = [raiz];
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { const r = tr(n.nodeValue); if (r !== null) n.nodeValue = r; } else els.push(n);
    }
    for (const el of els) for (const a of ATRS) { const v = el.getAttribute && el.getAttribute(a); if (v) { const r = tr(v); if (r !== null) el.setAttribute(a, r); } }
  }
  const titulo = () => { const r = tr(document.title); if (r !== null) document.title = r; };
  function arranca() {
    traduce(document.body);
    titulo();
    new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === "characterData") traduce(m.target);
        else if (m.type === "attributes") { const v = m.target.getAttribute(m.attributeName); const r = v && tr(v); if (r) m.target.setAttribute(m.attributeName, r); }
        else m.addedNodes.forEach(traduce);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRS });
    const tt = document.querySelector("title");
    if (tt) new MutationObserver(titulo).observe(tt, { childList: true, characterData: true, subtree: true });
  }
  if (document.body) arranca(); else document.addEventListener("DOMContentLoaded", arranca);
})();
