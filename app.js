/* Setas de Cataluña · web interactiva (sin dependencias). Datos en datos/db.js (window.DB). */
(function () {
  "use strict";
  const DB = window.DB, V = DB.vocabulario;
  const app = document.getElementById("app");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
  const MESES = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const MESES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const ESP = DB.especies;
  const BYID = Object.fromEntries(ESP.map((e) => [e.id, e]));
  const ARB = Object.fromEntries(DB.arboles.map((a) => [a.id, a]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem("setas:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("setas:" + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };

  const ICON = {
    ok: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5.5 10.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cond: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 5v6.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="10" cy="15" r="1.5" fill="currentColor"/></svg>',
    nulo: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5.5 10h9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    no: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    tox: '<svg viewBox="0 0 20 20"><path d="M10 1.8L19 18H1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 7.2v5.2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="10" cy="15.2" r="1.3" fill="currentColor"/></svg>',
    mortal: '<svg viewBox="0 0 20 20"><path d="M10 1.5c-4.3 0-7.3 3-7.3 7 0 2.4 1.1 4.1 2.8 5.1V17h2.2v-1.6h1.2V17h2.2v-1.6h1.2V17h2.2v-3.4c1.7-1 2.8-2.7 2.8-5.1 0-4-3-7-7.3-7z" fill="currentColor"/><circle cx="7" cy="8.6" r="2" fill="#fff"/><circle cx="13" cy="8.6" r="2" fill="#fff"/></svg>',
    desc: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.4 7.6c0-1.6 1.2-2.6 2.7-2.6s2.6 1 2.6 2.4c0 2.2-2.7 2.3-2.7 4.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="10" cy="15.2" r="1.3" fill="currentColor"/></svg>',
  };
  const catOf = (e) => (e.comestibilidad && e.comestibilidad.cat) || "desconocida";
  function badge(cat) {
    cat = cat || "desconocida";
    const c = V.comestibilidad[cat] || { etiqueta: cat, icono: "desc" };
    return `<span class="badge b-${cat}" title="${esc(c.larga || "")}">${ICON[c.icono] || ""}${esc(c.etiqueta)}</span>`;
  }
  const nombres = (e, l) => ((e.nombres || {})[l] || []);
  const titulo = (e) => cap(nombres(e, "ca")[0] || nombres(e, "es")[0] || e.nombre);
  const lab = (grupo, k) => { const x = (V[grupo] || {})[k]; return x ? (typeof x === "object" ? x.nombre || x.etiqueta || k : x) : String(k).replace(/_/g, " "); };
  // Idioma (i18n.js): en catalán, árboles y plantas se nombran primero en catalán
  const EN_CA = !!(window.I18N && I18N.IDIOMA === "ca");
  const nomComun = (n) => (EN_CA ? (n.ca && n.ca[0]) || n.es[0] : n.es[0] || (n.ca && n.ca[0])) || "";
  const otroNombre = (n) => (EN_CA ? `es: ${n.es[0] || ""}` : `ca: ${(n.ca && n.ca[0]) || ""}`);
  const arbolNombre = (id) => (ARB[id] ? cap(nomComun(ARB[id].nombres)) : id);
  const peligrosa = (e) => (e.confusiones || []).some((c) => ["mortal", "toxica"].includes(c.peligro));

  // Texto de búsqueda precalculado
  ESP.forEach((e) => {
    const n = e.nombres || {};
    e._q = norm([e.nombre, ...(e.sinonimos || []), ...(n.ca || []), ...(n.es || []), ...(n.notas || []), e.familia, e.genero, e.orden].join(" | "));
    e._meses = (e.fenologia || {}).meses || [];
    e._mx = (e.fenologia || {}).excepcional || [];
  });

  // ---------------- Facetas ----------------
  const car = (e) => e.caracteres || {};
  const eco = (e) => e.ecologia || {};
  const FAC = [
    // «catalogo» lo tienen las 163 fichas (el catálogo ya no se ofrece como libro): no sirve como filtro
    { k: "guia", t: "Guía", g: "Selección", get: (e) => [...(e.guias || []).filter((x) => x !== "catalogo"), e.alerta ? "alerta" : null], lab: (v) => ({ esencial: "Las 79 de los libros", alerta: "Fichas de alerta" }[v] || v) },
    { k: "cat", t: "Comestibilidad y seguridad", g: "Seguridad", get: (e) => [catOf(e)], lab: (v) => V.comestibilidad[v] ? V.comestibilidad[v].etiqueta : v, orden: (v) => (V.comestibilidad[v] || {}).orden || 9 },
    { k: "flag", t: "Avisos", g: "Seguridad", get: (e) => [(e.identificacion || {}).dificultad === "alta" ? "compleja" : null, peligrosa(e) ? "peligrosa" : null, e.controversia ? "controversia" : null], lab: (v) => ({ compleja: "Identificación compleja", peligrosa: "Se confunde con tóxicas o mortales", controversia: "Comestibilidad o taxonomía discutida" }[v]) },
    { k: "orden", t: "Orden", g: "Taxonomía", sel: true, get: (e) => [e.orden] },
    { k: "familia", t: "Familia", g: "Taxonomía", sel: true, get: (e) => [e.familia] },
    { k: "genero", t: "Género", g: "Taxonomía", sel: true, get: (e) => [e.genero] },
    { k: "arbol", t: "Árbol asociado", g: "Ecología", sel: true, get: (e) => (eco(e).arboles || []).map((a) => a.id), lab: arbolNombre },
    { k: "habitat", t: "Hábitat", g: "Ecología", sel: true, get: (e) => eco(e).habitats || [], lab: (v) => lab("habitat", v) },
    { k: "sustrato", t: "Crece sobre", g: "Ecología", get: (e) => eco(e).sustrato || [], lab: (v) => lab("sustrato", v) },
    { k: "suelo", t: "Suelo", g: "Ecología", get: (e) => (eco(e).suelo || {}).tipo || [], lab: (v) => lab("suelo", v).split(" (")[0] },
    { k: "nutricion", t: "Modo de vida", g: "Ecología", get: (e) => [eco(e).nutricion], lab: (v) => lab("nutricion", v).split(" (")[0] },
    { k: "crec", t: "Forma de crecimiento", g: "Ecología", get: (e) => eco(e).crecimiento || [], lab: (v) => lab("crecimiento", v) },
    { k: "mes", t: "Mes", g: "Cuándo y dónde", get: (e) => e._meses.map(String), lab: (v) => MESES_L[+v - 1], orden: (v) => +v },
    { k: "zona", t: "Zona de Cataluña con registros", g: "Cuándo y dónde", get: (e) => Object.keys((e.registros || {}).zonas || {}).filter((z) => V.region[z]), lab: (v) => V.region[v] ? V.region[v].nombre : v },
    { k: "comarca", t: "Comarca con registros", g: "Cuándo y dónde", sel: true, get: (e) => Object.keys((e.registros || {}).comarcas || {}) },
    { k: "evid", t: "Evidencia de presencia", g: "Cuándo y dónde", get: (e) => [(e.registros || {}).evidencia], lab: (v) => ({ confirmada: "Confirmada (herbario)", observaciones: "Observaciones", escasa: "Escasa", bibliografia: "Solo bibliografía", sin_registros: "Sin registros" }[v] || v) },
    { k: "himen", t: "Bajo el sombrero", g: "Rasgos", get: (e) => [car(e).himenoforo], lab: (v) => lab("himenoforo", v) },
    { k: "color", t: "Color", g: "Rasgos", get: (e) => car(e).color || [], lab: (v) => cap(v.replace(/_/g, " ")) },
    { k: "forma", t: "Forma", g: "Rasgos", get: (e) => car(e).forma || [], lab: (v) => cap(v.replace(/_/g, " ")) },
    { k: "pie", t: "Pie", g: "Rasgos", get: (e) => car(e).pie || [], lab: (v) => cap(v.replace(/_/g, " ")) },
    { k: "anillo", t: "Anillo", g: "Rasgos", get: (e) => [car(e).anillo === true ? "si" : car(e).anillo === false ? "no" : null], lab: (v) => (v === "si" ? "Con anillo" : "Sin anillo") },
    { k: "volva", t: "Volva", g: "Rasgos", get: (e) => [car(e).volva === true ? "si" : car(e).volva === false ? "no" : null], lab: (v) => (v === "si" ? "Con volva" : "Sin volva") },
    { k: "latex", t: "Látex", g: "Rasgos", get: (e) => [car(e).latex === false ? "no" : car(e).latex || null], lab: (v) => ({ no: "Sin látex", rojo: "Rojo vino", naranja: "Naranja", naranja_a_rojo: "Naranja → rojo", blanco: "Blanco", blanco_a_amarillo: "Blanco → amarillo" }[v] || v) },
    { k: "cambio", t: "Cambia de color", g: "Rasgos", get: (e) => car(e).cambio_color || [], lab: (v) => cap(v) },
    { k: "olor", t: "Olor", g: "Rasgos", get: (e) => car(e).olor || [], lab: (v) => cap(v.replace(/_/g, " ")) },
    { k: "tam", t: "Tamaño", g: "Rasgos", get: (e) => [car(e).tamano], lab: (v) => ({ pequeno: "Pequeño (< 5 cm)", mediano: "Mediano (5–12 cm)", grande: "Grande (> 12 cm)" }[v] || v) },
    { k: "textura", t: "Textura", g: "Rasgos", get: (e) => car(e).textura || [], lab: (v) => cap(v.replace(/_/g, " ")) },
  ];
  const FK = Object.fromEntries(FAC.map((f) => [f.k, f]));
  const state = { q: "", f: {}, orden: "familia", alt: [0, 3000], excep: false };
  function valsOf(f, e) { return f.get(e).filter((x) => x !== null && x !== undefined && x !== ""); }
  function pasa(e, skip) {
    if (state.q) { const t = norm(state.q).split(/\s+/).filter(Boolean); if (!t.every((w) => e._q.includes(w))) return false; }
    for (const k in state.f) {
      if (k === skip) continue;
      const sel = state.f[k]; if (!sel || !sel.length) continue;
      let vs = valsOf(FK[k], e);
      if (k === "mes" && state.excep) vs = vs.concat(e._mx.map(String));
      if (!sel.some((v) => vs.includes(v))) return false;
    }
    const al = (e.distribucion || {}).altitud;
    if ((state.alt[0] > 0 || state.alt[1] < 3000) && al) { if (al.max < state.alt[0] || al.min > state.alt[1]) return false; }
    return true;
  }
  const ORDENES = {
    familia: (a, b) => (a.orden || "").localeCompare(b.orden || "") || (a.familia || "").localeCompare(b.familia || "") || a.nombre.localeCompare(b.nombre),
    cientifico: (a, b) => a.nombre.localeCompare(b.nombre),
    catalan: (a, b) => titulo(a).localeCompare(titulo(b), "ca"),
    castellano: (a, b) => (nombres(a, "es")[0] || "~" + a.nombre).localeCompare(nombres(b, "es")[0] || "~" + b.nombre, "es"),
    genero: (a, b) => (a.genero || "").localeCompare(b.genero || "") || a.nombre.localeCompare(b.nombre),
    mes: (a, b) => (Math.min(...(a._meses.length ? a._meses : [13])) - Math.min(...(b._meses.length ? b._meses : [13]))) || a.nombre.localeCompare(b.nombre),
    registros: (a, b) => ((b.registros || {}).n || 0) - ((a.registros || {}).n || 0),
    habitat: (a, b) => (eco(a).habitats || ["~"])[0].localeCompare((eco(b).habitats || ["~"])[0]) || a.nombre.localeCompare(b.nombre),
  };

  // ---------------- Componentes ----------------
  function mesesHTML(e) {
    return `<div class="meses" aria-label="Meses">${MESES.map((m, i) => `<span class="${e._meses.includes(i + 1) ? "h" : e._mx.includes(i + 1) ? "x" : ""}" title="${MESES_L[i]}">${m}</span>`).join("")}</div>`;
  }
  function fotoBg(e, cual = "t") { const p = (e.fotos || [])[0]; return p ? `style="background-image:url('${p[cual]}')"` : ""; }
  function tarjeta(e) {
    return `<article class="tarjeta"><a class="cubre" href="#/especie/${e.id}" aria-label="${esc(titulo(e))}"></a>
      <div class="img" ${fotoBg(e)}></div>
      <div class="cuerpo">
        <div class="fam">${esc(e.familia || "")}</div>
        <h3>${esc(titulo(e))}</h3>
        <div class="es">${nombres(e, "es").length ? "es: " + esc(nombres(e, "es").slice(0, 2).join(", ")) + " · " : ""}${titulo(e) === e.nombre ? "" : `<i>${esc(e.nombre)}</i>`}</div>
        <div>${badge(catOf(e))}</div>
        ${mesesHTML(e)}
        <div class="small muted">${esc((eco(e).habitats || []).slice(0, 2).map((h) => lab("habitat", h)).join(" · "))}</div>
        ${peligrosa(e) && ["comestible", "condicionada"].includes(catOf(e)) ? `<div class="alerta-mini">⚠ Se confunde con especies tóxicas o mortales</div>` : ""}
      </div></article>`;
  }

  // ---------------- Vista: buscador ----------------
  // Atajos de la portada: filtros de un toque
  const RAPIDOS = { comestibles: { cat: ["comestible", "condicionada"] }, peligrosas: { cat: ["toxica", "mortal"] } };
  const igual = (a, b) => JSON.stringify((a || []).slice().sort()) === JSON.stringify((b || []).slice().sort());
  const rapidoActivo = (k) => Object.entries(RAPIDOS[k]).every(([f, v]) => igual(state.f[f], v));
  function fotoPortada() {
    const fs = (BYID["boletus-edulis"] || {}).fotos || [];
    return fs.find((f) => f.papel === "recolectado" && /cesta/i.test(f.pie || "")) || fs.find((f) => f.papel === "recolectado") || fs[0];
  }
  function vistaBuscador() {
    const grupos = [...new Set(FAC.map((f) => f.g))];
    const hf = fotoPortada();
    // esporas que flotan en la portada (posiciones fijas, pseudoaleatorias, para que no cambien en cada visita)
    const al = (i, n) => (Math.sin(i * 97.3 + n * 13.1) + 1) / 2;
    const esporas = Array.from({ length: 14 }, (_, i) => `<span class="espora" style="--x:${(al(i, 1) * 100).toFixed(1)}%;--s:${(3 + al(i, 2) * 5).toFixed(1)}px;--t:${(10 + al(i, 3) * 10).toFixed(1)}s;--d:-${(al(i, 4) * 16).toFixed(1)}s;--dx:${((al(i, 5) - 0.5) * 90).toFixed(0)}px"></span>`).join("");
    app.innerHTML = `
      <section class="hero" ${hf ? `style="--hero:url('${hf.g}')"` : ""}>
        <span class="hero-luz" aria-hidden="true"></span><span class="hero-esporas" aria-hidden="true">${esporas}</span>
        <div class="hero-in">
          <p class="hero-kicker">Setas de Cataluña</p>
          <h1>Identifica las setas <span class="grad">con seguridad</span></h1>
          <p class="hero-sub">${ESP.length} fichas con fotos, los rasgos que hay que comprobar y las setas peligrosas con las que se confunden.</p>
          <label class="hero-buscar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
            <input class="q" type="search" placeholder="Busca un nombre: rovelló, níscalo, Boletus…" value="${esc(state.q)}" aria-label="Buscar por nombre"></label>
          <div class="hero-atajos">
            <a class="atajo prim" href="#/rasgos">🔍 Identificar por rasgos</a>
            <button class="atajo" data-rapido="comestibles" aria-pressed="${rapidoActivo("comestibles")}">Comestibles</button>
            <button class="atajo" data-rapido="peligrosas" aria-pressed="${rapidoActivo("peligrosas")}">Tóxicas y mortales</button>
          </div>
        </div>
        ${hf ? `<span class="hero-credito">Foto: ${esc(hf.autor || "")} (${esc(hf.licencia || "")})</span>` : ""}
      </section>
      <div class="destacados no-print">
        <a class="dest dest-quiz" href="quiz/"><span class="dest-ico" aria-hidden="true">🍄</span><span><b>Quiz de setas</b><small>¿Sabrías distinguirlas? Ponte a prueba con fotos reales.</small></span></a>
        <a class="dest dest-libros" href="#/libros"><span class="dest-ico" aria-hidden="true">📚</span><span><b>Libros en PDF</b><small>Un cuaderno de bolsillo para el bosque y una guía para estudiar. Hojéalos antes de descargar.</small></span></a>
        ${(() => { const g = EN_ARCHIVO || store.get("sinInternet", null);
          return `<a class="dest dest-red${g ? " guardada" : ""}" href="#/sin-internet"><span class="dest-ico" aria-hidden="true">${g ? "✓" : "⬇"}</span><span><b>${g ? "Lista para usar sin internet" : "Usar sin internet"}</b><small>${g ? "Está guardada en este dispositivo." : "Guárdala en el móvil antes de ir al bosque."}</small></span></a>`; })()}
      </div>
      <div class="barra" id="resultados"><span id="cuenta"></span>
        <span class="acciones no-print"><button class="btn" id="ver-filtros" aria-expanded="${!!state.verFiltros}" aria-controls="filtros">Filtros</button>
        <label>Ordenar <select id="ordenar">
          ${[["familia", "por familia"], ["catalan", "por nombre catalán"], ["castellano", "por nombre castellano"], ["cientifico", "por nombre científico"], ["mes", "por mes de aparición"], ["registros", "por registros en Cataluña"], ["genero", "por género"], ["habitat", "por hábitat"]].map(([k, t]) => `<option value="${k}" ${state.orden === k ? "selected" : ""}>${t}</option>`).join("")}
        </select></label> <button class="btn" id="limpiar">Quitar filtros</button></span></div>
      <div class="buscador${state.verFiltros ? " con-filtros" : ""}">
        <aside class="filtros" id="filtros" aria-label="Filtros">
          ${grupos.map((g) => `<details class="grupo" ${["Seguridad", "Selección"].includes(g) ? "open" : ""}><summary>${g}</summary>${FAC.filter((f) => f.g === g).map((f) => `<div data-fac="${f.k}"></div>`).join("")}
          ${g === "Cuándo y dónde" ? `<label><input type="checkbox" id="excep" ${state.excep ? "checked" : ""}> Incluir meses excepcionales</label>
            <div class="small">Altitud: <input id="altmin" type="number" min="0" max="3000" step="100" value="${state.alt[0]}" style="width:5em"> – <input id="altmax" type="number" min="0" max="3000" step="100" value="${state.alt[1]}" style="width:5em"> m</div>` : ""}</details>`).join("")}
        </aside>
        <section>
          <div id="nota-filtro"></div>
          <div class="tarjetas" id="res"></div>
        </section>
      </div>`;
    const q = $(".q"); q.addEventListener("input", () => { state.q = q.value; pintarResultados(); });
    $("#ordenar").onchange = (ev) => { state.orden = ev.target.value; pintarResultados(); };
    $("#limpiar").onclick = () => { state.f = {}; state.q = ""; state.alt = [0, 3000]; state.excep = false; vistaBuscador(); };
    $("#ver-filtros").onclick = (ev) => {
      state.verFiltros = !state.verFiltros;
      $(".buscador").classList.toggle("con-filtros", state.verFiltros);
      ev.currentTarget.setAttribute("aria-expanded", state.verFiltros);
    };
    $$("[data-rapido]").forEach((b) => (b.onclick = () => {
      const k = b.dataset.rapido, activo = rapidoActivo(k);
      Object.keys(RAPIDOS[k]).forEach((f) => delete state.f[f]);
      if (!activo) Object.assign(state.f, JSON.parse(JSON.stringify(RAPIDOS[k])));
      pintarResultados();
      $("#resultados").scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    $("#excep").onchange = (ev) => { state.excep = ev.target.checked; pintarResultados(); };
    $("#altmin").onchange = (ev) => { state.alt[0] = +ev.target.value || 0; pintarResultados(); };
    $("#altmax").onchange = (ev) => { state.alt[1] = +ev.target.value || 3000; pintarResultados(); };
    pintarResultados();
  }
  function pintarFacetas() {
    FAC.forEach((f) => {
      const box = $(`[data-fac="${f.k}"]`); if (!box) return;
      const cuenta = {};
      ESP.forEach((e) => { if (pasa(e, f.k)) valsOf(f, e).forEach((v) => (cuenta[v] = (cuenta[v] || 0) + 1)); });
      const todos = {}; ESP.forEach((e) => valsOf(f, e).forEach((v) => (todos[v] = 1)));
      let vals = Object.keys(todos);
      const L = f.lab || ((v) => v);
      vals.sort(f.orden ? (a, b) => f.orden(a) - f.orden(b) : (a, b) => String(L(a)).localeCompare(String(L(b)), "es"));
      const sel = state.f[f.k] || [];
      if (f.sel) {
        box.innerHTML = `<label>${f.t}</label><select data-k="${f.k}"><option value="">Todos</option>${vals.map((v) => `<option value="${esc(v)}" ${sel.includes(v) ? "selected" : ""}>${esc(L(v))} (${cuenta[v] || 0})</option>`).join("")}</select>`;
        $("select", box).onchange = (ev) => { state.f[f.k] = ev.target.value ? [ev.target.value] : []; pintarResultados(); };
      } else {
        box.innerHTML = `<div class="small"><b>${f.t}</b></div><div class="opciones">${vals.map((v) => `<button class="tog" data-v="${esc(v)}" aria-pressed="${sel.includes(v)}">${esc(L(v))} <span class="muted">${cuenta[v] || 0}</span></button>`).join("")}</div>`;
        $$("button", box).forEach((b) => (b.onclick = () => {
          const v = b.dataset.v, s = new Set(state.f[f.k] || []);
          s.has(v) ? s.delete(v) : s.add(v); state.f[f.k] = [...s]; pintarResultados();
        }));
      }
    });
  }
  function pintarResultados() {
    const res = ESP.filter((e) => pasa(e)).sort(ORDENES[state.orden] || ORDENES.familia);
    $("#cuenta").textContent = `${res.length} ${res.length === 1 ? "especie" : "especies"}`;
    const cats = state.f.cat || [];
    $("#nota-filtro").innerHTML = cats.some((c) => ["comestible", "condicionada"].includes(c))
      ? `<div class="nota-filtro"><b>Este filtro no es una autorización para comer.</b> «Comestible» describe a la especie correctamente identificada, no al ejemplar que usted tiene delante. Revise los rasgos decisivos y las confusiones de cada ficha; ante la mínima duda, no la consuma.</div>` : "";
    $("#res").innerHTML = res.length ? res.map(tarjeta).join("") : `<p>No hay especies con esa combinación. Quite algún filtro o busque en el <a href="#/inventario">inventario</a>.</p>`;
    // atajos y botón de filtros reflejan lo que está activo
    $$("[data-rapido]").forEach((b) => b.setAttribute("aria-pressed", rapidoActivo(b.dataset.rapido)));
    const nf = Object.values(state.f).reduce((n, v) => n + (v || []).length, 0);
    const vf = $("#ver-filtros"); if (vf) vf.textContent = nf ? `Filtros (${nf})` : "Filtros";
    const lp = $("#limpiar"); if (lp) lp.hidden = !nf && !state.q;
    pintarFacetas();
  }

  // ---------------- Vista: ficha ----------------
  // Secciones de la ficha. Las de consulta van plegadas para que lo importante (rasgos, confusiones, comestibilidad) quede a la vista.
  const PLEGADAS = new Set(["Cómo encontrarla", "Dónde se ha registrado en Cataluña", "Descripción", "Nombres y taxonomía", "Fuentes y control de calidad", "Hábitat y ecología"]);
  function seccion(t, html) {
    if (!html) return "";
    return PLEGADAS.has(t) ? `<details class="caja plegable"><summary><h2>${t}</h2></summary>${html}</details>` : `<section class="caja"><h2>${t}</h2>${html}</section>`;
  }
  // al imprimir, todo abierto
  window.addEventListener("beforeprint", () => $$("details").forEach((d) => (d.open = true)));
  function dl(pares) { const x = pares.filter(([, v]) => v); return x.length ? `<dl class="morf">${x.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>` : ""; }
  function confusionesHTML(e) {
    const cs = e.confusiones || []; if (!cs.length) return "";
    return `<table class="conf"><tr><th>Especie</th><th>Cómo separarlas</th></tr>${cs.map((c) => {
      const o = c.id && BYID[c.id];
      const nom = o ? (titulo(o) === o.nombre ? `<a href="#/especie/${o.id}"><b><i>${esc(o.nombre)}</i></b></a>` : `<a href="#/especie/${o.id}"><b>${esc(titulo(o))}</b></a><br><i>${esc(o.nombre)}</i>`) : `<i>${esc(c.nombre || c.id)}</i>`;
      return `<tr class="p-${c.peligro || "desconocida"}"><td>${nom}<br>${badge(c.peligro)}</td><td><b>${esc(c.diferencia || "")}</b>
        ${c.comparten ? `<div class="small"><b>Se parecen en:</b> ${esc(c.comparten)}</div>` : ""}
        ${c.donde ? `<div class="small"><b>Dónde mirarlo:</b> ${esc(c.donde)}</div>` : ""}
        ${c.dificultad ? `<div class="small"><b>Límites:</b> ${esc(c.dificultad)}</div>` : ""}</td></tr>`;
    }).join("")}</table>`;
  }
  function histoHTML(e) {
    const m = (e.registros || {}).meses; if (!m) return "";
    const v = MESES.map((_, i) => +(m[i + 1] || m[String(i + 1)] || 0)); const mx = Math.max(...v, 1), tot = v.reduce((a, b) => a + b, 0);
    return tot ? `<div class="histo" aria-label="Registros por mes">${v.map((x, i) => `<span style="height:${Math.round((100 * x) / mx)}%" title="${MESES_L[i]}: ${x}"></span>`).join("")}</div><div class="small muted">${tot} registros datados en Cataluña (GBIF), por mes.</div>` : "";
  }
  function fuentesHTML(e) {
    return (e.fuentes || []).map((k) => { const f = DB.fuentes[k]; return f ? `<li><b>[${esc(k)}]</b> ${esc(f.cita)}${f.url ? ` <a href="${esc(f.url)}" rel="noopener" target="_blank">enlace</a>` : ""} <span class="muted">(${esc(f.tipo)})</span></li>` : `<li>${esc(k)}</li>`; }).join("");
  }
  let galeriaActual = [];
  function vistaFicha(id) {
    const e = BYID[id]; if (!e) return vistaNoEncontrada();
    document.title = titulo(e) + " · Cistella Segura";
    const com = e.comestibilidad || {}, idf = e.identificacion || {}, mo = e.morfologia || {}, ec = eco(e), r = e.registros, b = e.busqueda || {};
    galeriaActual = e.fotos || [];
    const zonas = r ? Object.entries(r.zonas || {}).filter(([z]) => V.region[z]).map(([z, n]) => `${esc(V.region[z].nombre)} (${n})`).join(", ") : "";
    const comarcas = r ? Object.entries(r.comarcas || {}).map(([c, n]) => `${esc(c)} (${n})`).join(", ") : "";
    app.innerHTML = `
      <div class="aviso-impresion">Ficha impresa de «Cistella Segura · Setas de Cataluña» (${esc(DB.meta.generado)}). Ninguna ficha certifica que un ejemplar sea comestible.</div>
      <a class="volver no-print" href="#/">← Todas las especies</a>
      <div class="ficha-cab">
        <div><div class="tax">${esc(e.orden)} · ${esc(e.familia)} · ${esc(e.genero)}</div>
          <h1>${esc(titulo(e))}</h1>
          <div class="nombres">${nombres(e, "ca").length ? "<b>ca:</b> " + esc(nombres(e, "ca").join(", ")) : ""}${nombres(e, "es").length ? " · <b>es:</b> " + esc(nombres(e, "es").join(", ")) : ""}</div>
          <div class="sci"><i>${esc(e.nombre)}</i> <span class="muted small">${esc(e.autor || "")}</span></div></div>
        <div class="lado">${badge(catOf(e))}<div>${idf.dificultad ? `<span class="chip">Identificación ${esc(idf.dificultad)}</span>` : ""}${e.controversia ? `<span class="chip">Comestibilidad o taxonomía discutida</span>` : ""}</div>
          <div class="no-print"><button class="btn" onclick="window.print()">Imprimir ficha</button></div></div>
      </div>
      ${e.toxicidad ? `<div class="caja alerta"><h2>${badge(catOf(e))} ${esc(e.toxicidad.sindrome)}</h2><p>${e.toxicidad.latencia ? `<b>Aparición de síntomas:</b> ${esc(e.toxicidad.latencia)}. ` : ""}${esc(e.toxicidad.sintomas || "")}</p>${e.toxicidad.nota ? `<p class="small">${esc(e.toxicidad.nota)}</p>` : ""}<p class="small"><a href="#/guia/intoxicacion">Qué hacer ante una intoxicación</a></p></div>` : ""}
      <div class="ficha-grid">
        <div>
          ${galeriaActual.length ? `<div class="galeria-f">${galeriaActual.slice(0, 7).map((p, i) => `<button data-foto="${i}" style="background-image:url('${i === 0 ? p.g : p.t}')" aria-label="Ampliar foto ${i + 1}">${p.pie ? `<span class="pie-f">${esc(p.pie)}</span>` : ""}</button>`).join("")}</div>
            <div class="creditos">Fotos: ${galeriaActual.map((p, i) => `${i + 1}) ${esc(p.autor || "")} (${esc(p.licencia || "")})`).join("; ")}. <a href="#/galeria/${e.id}">Ver todas</a></div>` : `<p class="muted">Sin fotografías revisadas en esta edición.</p>`}
          ${idf.claves ? `<section class="caja claves"><h2>${e.alerta || ["toxica", "mortal"].includes(catOf(e)) ? "Rasgos de alarma" : "Rasgos decisivos: compruébelos todos"}</h2><ul>${idf.claves.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
            ${idf.orientativos ? `<p class="small"><b>Orientativos</b> (ayudan, no bastan):</p><ul class="small">${idf.orientativos.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}</section>` : ""}
          ${e.resumen ? `<p>${esc(e.resumen)}</p>` : ""}
          ${seccion("Cuándo", mesesHTML(e) + histoHTML(e) + ((e.fenologia || {}).texto ? `<p>${esc(e.fenologia.texto)}</p>` : "") + ((e.fenologia || {}).condiciones ? `<p><b>Condiciones:</b> ${esc(e.fenologia.condiciones)}</p>` : ""))}
        </div>
        <div>
          ${seccion("Cómo no confundirla", confusionesHTML(e))}
          ${seccion("Comestibilidad y precauciones", `<p>${badge(catOf(e))} ${esc(com.texto || "")}</p>${(e.rd30 || []).map((x) => `<p class="small"><b>RD 30/2009, anexo parte ${x.parte}:</b> ${esc(x.etiqueta)} («${esc(x.texto)}»).</p>`).join("")}${e.recoleccion ? `<p><b>Recolección:</b> ${esc(e.recoleccion)}</p>` : ""}${e.normativa ? `<p><b>Normativa:</b> ${esc(e.normativa)}</p>` : ""}`)}
        </div>
      </div>
      ${seccion("Hábitat y ecología", dl([
        ["Árboles", (ec.arboles || []).map((a) => `<a href="#/arbol/${a.id}">${esc(arbolNombre(a.id))}</a>${a.rel !== "micorriza" ? ` <span class="muted">(${esc(a.rel)})</span>` : " (micorriza)"}`).join(", ")],
        ["Hábitats", (ec.habitats || []).map((h) => esc(lab("habitat", h))).join(", ")],
        ["Modo de vida", ec.nutricion ? esc(lab("nutricion", ec.nutricion)) : ""],
        ["Crece sobre", (ec.sustrato || []).map((s) => esc(lab("sustrato", s))).join(", ")],
        ["Suelo", ((ec.suelo || {}).tipo || []).map((s) => esc(lab("suelo", s))).join(", ") + ((ec.suelo || {}).nota ? `. ${esc(ec.suelo.nota)}` : "") + ((ec.suelo || {}).certeza ? ` <span class="muted">(${esc(ec.suelo.certeza)})</span>` : "")],
        ["Crecimiento", (ec.crecimiento || []).map((s) => esc(lab("crecimiento", s).toLowerCase())).join(", ")],
        ["Vegetación", esc(ec.vegetacion || "")],
        ["Dónde mirar", esc(ec.donde_mirar || "")],
      ]))}
      ${seccion("Cómo encontrarla", dl([["Priorice", esc(b.prioridad)], ["Árbol", esc(b.arbol)], ["Parte del bosque", esc(b.parte)], ["Al emerger", esc(b.emergente)], ["Ejemplares ocultos", esc(b.ocultos)], ["Al encontrar una", esc(b.ampliar)], ["Especies acompañantes", esc(b.acompanantes)], ["Cuándo cambiar de zona", esc(b.cambiar)]]) + (b.local ? `<p class="small muted"><b>Experiencia local (orientativo):</b> ${esc(b.local)}</p>` : ""))}
      ${seccion("Dónde se ha registrado en Cataluña", `${(e.distribucion || {}).texto ? `<p>${esc(e.distribucion.texto)}</p>` : ""}${(e.distribucion || {}).altitud ? `<p><b>Altitud orientativa:</b> ${e.distribucion.altitud.min}–${e.distribucion.altitud.max} m${e.distribucion.altitud.nota ? ` (${esc(e.distribucion.altitud.nota)})` : ""}</p>` : ""}
        ${r ? `<p><b>Registros (${esc(r.consulta)}):</b> ${r.n} en GBIF, ${r.pliegos} pliegos de herbario y ${r.observaciones} observaciones. Evidencia: <b>${esc(FK.evid.lab(r.evidencia))}</b>.</p>${zonas ? `<p><b>Zonas:</b> ${zonas}.</p>` : ""}${comarcas ? `<p class="small"><b>Comarcas:</b> ${comarcas}.</p>` : ""}<p class="small muted">Comarcas asignadas por coordenadas; los registros no son un mapa de distribución y la ausencia de registros no significa ausencia de la especie.</p>` : ""}`)}
      ${seccion("Descripción", dl([["Sombrero", mo.sombrero], ["Himenio", mo.himenoforo], ["Pie", mo.pie], ["Velo", mo.velo], ["Carne", mo.carne], ["Látex", mo.latex], ["Olor", mo.olor], ["Sabor", mo.sabor], ["Esporada", mo.esporada], ["Microscopía", mo.microscopia], ["Tamaño", mo.tamano], ["Edad", mo.edad], ["Cambios", mo.cambios]].map(([k, v]) => [k, v ? esc(v) : ""])))}
      ${seccion("Nombres y taxonomía", `<p><b>Catalán:</b> ${esc(nombres(e, "ca").join(", ") || "—")} · <b>Castellano:</b> ${esc(nombres(e, "es").join(", ") || "—")}</p>${(e.nombres || {}).notas ? (e.nombres.notas.map((n) => `<p class="small">${esc(n)}</p>`).join("")) : ""}${e.taxonomia_nota ? `<p class="small">${esc(e.taxonomia_nota)}</p>` : ""}${e.familia_nota ? `<p class="small muted">${esc(e.familia_nota)}</p>` : ""}${(e.sinonimos || []).length ? `<p class="small"><b>Sinónimos:</b> <i>${esc(e.sinonimos.join("; "))}</i></p>` : ""}
        <p class="small">Nombre según Catalogue of Life (${esc((e.col || {}).consulta || "")}${(e.col || {}).estado && e.col.estado !== "accepted" ? "; estado: " + esc(e.col.estado) : ""}). <a href="https://www.gbif.org/occurrence/search?gadm_gid=ESP.6_1&taxon_key=${(r || {}).gbif_key || ""}" target="_blank" rel="noopener">Registros en GBIF</a> · <a href="https://www.inaturalist.org/observations?place_id=61614&taxon_name=${encodeURIComponent(e.nombre)}" target="_blank" rel="noopener">Observaciones en iNaturalist</a></p>`)}
      ${seccion("Fuentes y control de calidad", `<ul class="small">${fuentesHTML(e)}</ul>${(e.control || {}).morfologia ? `<p class="small">${esc(e.control.morfologia)}</p>` : ""}${((e.control || {}).pendiente || []).map((p) => `<p class="small"><b>Pendiente:</b> ${esc(p)}</p>`).join("")}${(DB.control[e.id] || []).filter((q) => q.nivel !== "pendiente").map((q) => `<p class="small"><b>${esc(q.nivel)}:</b> ${esc(q.msg)}</p>`).join("")}<p class="small muted">Última revisión: ${esc((e.control || {}).revisado || DB.meta.generado)}.</p>`)}
      ${e.datos_faltan ? `<div class="caja"><b>Datos que faltan o son inciertos:</b> ${esc(e.datos_faltan)}</div>` : ""}`;
    $$("[data-foto]").forEach((b) => (b.onclick = () => abrirVisor(+b.dataset.foto)));
  }
  // Visor de fotos y de páginas de los libros: flechas del teclado, deslizar en el móvil y tocar la imagen para ampliarla
  let visorI = 0;
  function abrirVisor(i) {
    const v = $("#visor"); const n = galeriaActual.length; if (!n) return;
    visorI = ((i % n) + n) % n;
    const p = galeriaActual[visorI];
    v.classList.toggle("pagina", !!p.libro);
    v.classList.remove("zoom");
    v.innerHTML = `<button class="cerrar" aria-label="Cerrar">Cerrar ✕</button>${n > 1 ? `<button class="nav-v ant" aria-label="Anterior">‹</button><button class="nav-v sig" aria-label="Siguiente">›</button>` : ""}
      <img src="${p.g}" alt="${esc(p.pie || "")}"><div class="txt">${n > 1 ? `<span class="cuenta-v">${visorI + 1} / ${n}</span> ` : ""}${esc(p.pie || "")} ${p.taxon ? `<i>(${esc(p.taxon)})</i>` : ""}${p.autor || p.licencia ? `<br>© ${esc(p.autor || "")} · ${esc(p.licencia || "")}` : ""} ${p.url ? `· <a href="${esc(p.url)}" target="_blank" rel="noopener" style="color:#fff">origen</a>` : ""}${p.libro ? `<br><span class="pista-v">Toca la página para ampliarla${n > 1 ? " · desliza o usa las flechas para pasar" : ""}</span>` : ""}</div>`;
    v.hidden = false;
    $(".cerrar", v).onclick = cerrarVisor;
    if (n > 1) { $(".ant", v).onclick = () => abrirVisor(visorI - 1); $(".sig", v).onclick = () => abrirVisor(visorI + 1); }
    $("img", v).onclick = () => v.classList.toggle("zoom");
    $(".cerrar", v).focus({ preventScroll: true });
  }
  function cerrarVisor() { const v = $("#visor"); v.hidden = true; v.classList.remove("zoom"); v.innerHTML = ""; }
  document.addEventListener("keydown", (ev) => {
    if ($("#visor").hidden) return;
    if (ev.key === "Escape") cerrarVisor();
    else if (ev.key === "ArrowLeft") abrirVisor(visorI - 1);
    else if (ev.key === "ArrowRight") abrirVisor(visorI + 1);
  });
  (() => {
    const v = $("#visor"); let x0 = null;
    v.addEventListener("touchstart", (e) => { x0 = e.touches.length === 1 && !v.classList.contains("zoom") ? e.touches[0].clientX : null; }, { passive: true });
    v.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50 && galeriaActual.length > 1) abrirVisor(visorI + (dx < 0 ? 1 : -1));
    });
  })();

  // ---------------- Vista: buscador por rasgos ----------------
  function vistaRasgos() {
    const pasos = [
      ["himen", "1. ¿Qué tiene bajo el sombrero (o qué forma tiene)?"],
      ["sustrato", "2. ¿Sobre qué crece?"],
      ["arbol", "3. ¿Qué árbol tiene cerca?"],
      ["color", "4. ¿De qué color es?"],
      ["anillo", "5. ¿Tiene anillo?"],
      ["volva", "6. ¿Tiene volva (saco en la base)? Desentierre la base."],
      ["latex", "7. Al cortarla, ¿sale látex?"],
      ["mes", "8. ¿En qué mes está?"],
    ];
    app.innerHTML = `<h1>Buscar por rasgos observados</h1>
      <div class="nota-filtro"><b>Esto no es una identificación.</b> Sirve para acotar candidatas y leer sus fichas. No hay identificación automática por foto: ninguna herramienta lo hace con la seguridad que exige comer setas. Si la lista incluye especies tóxicas o mortales parecidas, no consuma el ejemplar sin confirmación de un experto.</div>
      ${pasos.map(([k, t]) => `<div class="paso"><h3>${t}</h3><div class="opciones" data-paso="${k}"></div></div>`).join("")}
      <div class="barra"><b id="cuenta"></b> <button class="btn" id="limpiar">Empezar de nuevo</button></div>
      <div class="tarjetas" id="res"></div>`;
    const pintar = () => {
      pasos.forEach(([k]) => {
        const f = FK[k], box = $(`[data-paso="${k}"]`), cuenta = {};
        ESP.forEach((e) => { if (pasa(e, k)) valsOf(f, e).forEach((v) => (cuenta[v] = (cuenta[v] || 0) + 1)); });
        const L = f.lab || ((v) => v); const sel = state.f[k] || [];
        const vals = Object.keys(cuenta).sort(f.orden ? (a, b) => f.orden(a) - f.orden(b) : (a, b) => String(L(a)).localeCompare(String(L(b)), "es"));
        box.innerHTML = vals.map((v) => `<button class="tog" data-v="${esc(v)}" aria-pressed="${sel.includes(v)}">${esc(L(v))} <span class="muted">${cuenta[v]}</span></button>`).join("") || `<span class="muted small">Sin opciones con los rasgos elegidos.</span>`;
        $$("button", box).forEach((b) => (b.onclick = () => { const s = new Set(state.f[k] || []); s.has(b.dataset.v) ? s.delete(b.dataset.v) : s.add(b.dataset.v); state.f[k] = [...s]; pintar(); }));
      });
      const res = ESP.filter((e) => pasa(e)).sort(ORDENES.familia);
      const peligro = res.filter((e) => ["toxica", "mortal"].includes(catOf(e))).length;
      $("#cuenta").textContent = `${res.length} candidatas${peligro ? ` · ${peligro} tóxicas o mortales` : ""}`;
      $("#res").innerHTML = res.slice(0, 60).map(tarjeta).join("");
    };
    $("#limpiar").onclick = () => { state.f = {}; state.q = ""; pintar(); };
    pintar();
  }

  // ---------------- Vistas: árboles y calendario ----------------
  // Fotos de árbol ordenadas por lo que más ayuda a reconocerlo: hoja, tronco, árbol entero, fruto, flor
  const PAPEL_ARBOL = { hoja: "Hoja", tronco: "Tronco", porte: "Árbol", fruto: "Fruto", flor: "Flor" };
  const ORDEN_PAPEL = ["hoja", "tronco", "porte", "fruto", "flor"];
  const fotosArbol = (a) => (a.fotos || []).map((f, i) => [f, i]).sort((x, y) => {
    const r = (f) => { const k = ORDEN_PAPEL.indexOf(f.papel); return k < 0 ? 9 : k; };
    return r(x[0]) - r(y[0]) || x[1] - y[1];
  }).map(([f]) => f);
  // Tres miniaturas para reconocerlo de un vistazo: hoja, tronco y árbol (si falta alguna, otra foto)
  function tresFotosArbol(a) {
    const fs = fotosArbol(a), out = [];
    for (const p of ["hoja", "tronco", "porte"]) { const f = fs.find((x) => x.papel === p); if (f) out.push(f); }
    for (const f of fs) { if (out.length >= 3) break; if (!out.includes(f)) out.push(f); }
    return out.slice(0, 3);
  }
  const tarjetaArbol = (a) => `<article class="tarjeta arbol-t"><a class="cubre" href="#/arbol/${a.id}" aria-label="${esc(cap(nomComun(a.nombres)))}"></a>
    <div class="arbol-fotos">${tresFotosArbol(a).map((f) => `<figure><img loading="lazy" src="${f.t}" alt=""><figcaption>${PAPEL_ARBOL[f.papel] || ""}</figcaption></figure>`).join("")}</div>
    <div class="cuerpo"><h3>${esc(cap(nomComun(a.nombres)))}</h3><div class="es">${esc(otroNombre(a.nombres))} · <i>${esc(a.nombre)}</i></div>
      ${a.reconocer && a.reconocer.distancia ? `<p class="arbol-lejos">${esc((a.reconocer.distancia.match(/^.*?\.(\s|$)/) || [a.reconocer.distancia])[0].trim())}</p>` : ""}
      <div class="small muted arbol-pie">${(a.setas || []).length} setas asociadas <span aria-hidden="true">→</span></div></div></article>`;

  function vistaArboles() {
    app.innerHTML = `<h1>Árboles</h1>
      <p class="ap-intro">Muchas setas solo salen junto a su árbol. Reconócelo por la hoja, el tronco y la forma; toca uno para ver todas sus fotos y las setas que lo acompañan.</p>
      ${[["conifera", "Coníferas", "Hojas en aguja o escama; casi todas, verdes todo el año."], ["frondosa", "Árboles de hoja ancha", "Encinas, robles, hayas, castaños, chopos…"]].map(([g, t, s]) => {
        const lista = DB.arboles.filter((a) => (a.grupo || "frondosa") === g);
        return lista.length ? `<h2>${t}</h2><p class="muted small">${s}</p><div class="arbol-lista">${lista.map(tarjetaArbol).join("")}</div>` : "";
      }).join("")}
      <details class="caja plegable"><summary><b>Los bosques de Cataluña y sus setas</b></summary><div class="texto">${DB.textos.arboles || ""}</div></details>
      <h2>Plantas indicadoras</h2><p class="muted">Informan del suelo, la humedad o el hábitat; no predicen la aparición de ninguna seta.</p>
      <div class="tabla-scroll"><table class="tabla"><tr><th>Planta</th><th>Indica</th><th>Reconocerla y relación con las setas</th></tr>${DB.plantas.map((p) => `<tr><td><b>${esc(cap(nomComun(p.nombres)))}</b> · ${esc(EN_CA ? p.nombres.es[0] : p.nombres.ca[0])}<br><i>${esc(p.nombre)}</i></td><td>${esc((p.indica || []).join(", ").replace(/_/g, " "))}</td><td>${esc(p.reconocer)} ${esc(p.setas)}</td></tr>`).join("")}</table></div>`;
  }
  function vistaArbol(id) {
    const a = ARB[id]; if (!a) return vistaNoEncontrada();
    const r = a.reconocer || {}, ec = a.ecologia || {};
    // cada foto dice qué muestra (campo «papel»): hoja, tronco, árbol entero…
    const PAPEL = { ...PAPEL_ARBOL, porte: "Árbol entero" };
    galeriaActual = fotosArbol(a).map((f) => ({ ...f, pie: f.pie || PAPEL[f.papel] || "" }));
    const setas = (a.setas || []).map((x) => BYID[x.id]).filter(Boolean);
    app.innerHTML = `<p class="no-print"><a href="#/arboles">← Árboles</a></p>
      <div class="ficha-cab"><div><div class="tax">${esc(a.familia)}</div><h1>${esc(cap(nomComun(a.nombres)))}</h1><div class="nombres">ca: ${esc(a.nombres.ca.join(", "))} · es: ${esc(a.nombres.es.join(", "))}</div><div class="sci"><i>${esc(a.nombre)}</i> <span class="small muted">${esc(a.autor || "")}</span></div></div>${a.autoctono === false ? `<span class="chip">No autóctono</span>` : ""}</div>
      <div class="ficha-grid"><div>${galeriaActual.length ? `<div class="galeria-f">${galeriaActual.map((p, i) => `<button data-foto="${i}" style="background-image:url('${i ? p.t : p.g}')" aria-label="Ampliar foto${p.pie ? ": " + esc(p.pie) : ""}">${p.pie ? `<span class="pie-f">${esc(p.pie)}</span>` : ""}</button>`).join("")}</div><div class="creditos">Fotos: ${galeriaActual.map((p) => `${esc(p.autor)} (${esc(p.licencia)})`).join("; ")}</div>` : ""}</div>
      <div>${seccion("Cómo reconocerlo", dl([["De lejos", esc(r.distancia)], ["Corteza", esc(r.corteza)], ["Hojas", esc(r.hojas)], ["Frutos", esc(r.frutos)], ["Parecidos", esc(r.parecidos)], ["Cuándo", esc(r.epoca)], ["En otoño", esc(r.otono)]]))}
      ${seccion("Dónde crece", dl([["Clima", esc(ec.clima)], ["Suelo", esc(ec.suelo)], ["Altitud", esc(ec.altitud)], ["En Cataluña", esc(ec.distribucion)], ["Bosques", esc(ec.bosques)]]))}</div></div>
      ${seccion("Setas asociadas", `<p>${esc(a.setas_nota || "")}</p><p class="small muted">«Micorriza»: asociación establecida; «habitual/ocasional»: aparece con frecuencia sin relación demostrada de forma específica.</p><div class="tarjetas">${setas.map(tarjeta).join("")}</div>`)}`;
    $$("[data-foto]").forEach((b) => (b.onclick = () => abrirVisor(+b.dataset.foto)));
  }
  function vistaCalendario() {
    const filtro = store.get("cal", "comestibles");
    const lista = ESP.filter((e) => filtro === "todas" || (filtro === "comestibles" ? ["comestible", "condicionada"].includes(catOf(e)) : ["toxica", "mortal"].includes(catOf(e)))).sort(ORDENES.catalan);
    const mesAct = new Date().getMonth() + 1;
    app.innerHTML = `<h1>Calendario de fructificación</h1>
      <p class="muted">Casillas oscuras: meses habituales; grises: posibles o excepcionales. Orientativo: depende de la altitud, la vertiente y la lluvia de cada año.</p>
      <p class="no-print">Mostrar: ${["comestibles", "peligrosas", "todas"].map((k) => `<button class="tog" data-cal="${k}" aria-pressed="${filtro === k}">${cap(k)}</button>`).join(" ")}</p>
      <h2>Este mes (${MESES_L[mesAct - 1]})</h2><div class="tarjetas">${lista.filter((e) => e._meses.includes(mesAct)).map(tarjeta).join("") || "<p>Ninguna especie habitual este mes en la selección.</p>"}</div>
      <h2>Todo el año</h2><div class="tabla-scroll"><table class="tabla"><tr><th>Especie</th>${MESES.map((m) => `<th>${m}</th>`).join("")}</tr>
      ${lista.map((e) => `<tr><td><a href="#/especie/${e.id}">${esc(titulo(e))}</a> <i class="small muted">${esc(e.nombre)}</i></td>${MESES.map((_, i) => `<td class="m ${e._meses.includes(i + 1) ? "h" : e._mx.includes(i + 1) ? "x" : ""}"></td>`).join("")}</tr>`).join("")}</table></div>`;
    $$("[data-cal]").forEach((b) => (b.onclick = () => { store.set("cal", b.dataset.cal); vistaCalendario(); }));
  }
  function vistaGaleria(id) {
    const lista = id && BYID[id] ? [BYID[id]] : ESP;
    galeriaActual = lista.flatMap((e) => (e.fotos || []).map((p) => Object.assign({ _e: e }, p)));
    app.innerHTML = `<h1>Galería de fotografías revisadas${id && BYID[id] ? ": " + esc(titulo(BYID[id])) : ""}</h1>
      <p class="muted">${galeriaActual.length} fotografías. Todas de observaciones con identificación verificada (iNaturalist, grado investigación) o de la guía anterior, revisadas visualmente para esta edición; se han descartado las dudosas.</p>
      <div class="tarjetas">${galeriaActual.map((p, i) => `<article class="tarjeta"><button data-foto="${i}" style="border:0;padding:0;background:none" aria-label="Ampliar"><img class="img" loading="lazy" src="${p.t}" alt=""></button><div class="cuerpo small"><a href="#/especie/${p._e.id}"><b>${esc(titulo(p._e))}</b></a> <i>${esc(p._e.nombre)}</i><br>${esc(p.pie || "")}<br><span class="muted">© ${esc(p.autor || "")} · ${esc(p.licencia || "")}</span></div></article>`).join("")}</div>`;
    $$("[data-foto]").forEach((b) => (b.onclick = () => abrirVisor(+b.dataset.foto)));
  }
  // ---------------- Vista: inventario ----------------
  // Todas las especies con registros en Cataluña (DB.registro) más las que tienen ficha (ESP).
  // En pantalla ancha, una tabla con la cabecera fija al bajar; en el móvil, cada especie en una tarjeta.
  // Presencia: [clase, etiqueta, explicación]; «pliego» (inventario) y «confirmada» (fichas) son lo mismo: hay muestras de herbario.
  const PRESENCIA = {
    pliego: ["pliego", "Pliego de herbario", "Hay muestras guardadas en herbarios"],
    confirmada: ["pliego", "Pliego de herbario", "Hay muestras guardadas en herbarios"],
    observaciones: ["obs", "Solo observaciones", "Fotos revisadas por la comunidad, sin muestra de herbario"],
    escasa: ["escasa", "Escasa", "Solo uno o dos registros"],
    bibliografia: ["bib", "Solo bibliografía", "Citada en libros, sin registro digital"],
  };
  function vistaInventario() {
    let q = "", filtro = "", orden = "az", lim = 200, reloj = 0;
    const nf = (n) => (n || 0).toLocaleString("es");
    const todas = DB.registro.map((r) => ({ n: r.n, a: r.a, o: r.o, f: r.f, t: r.t || 0, p: r.p || 0, i: r.i || 0, e: r.e, s: r.s || [], ficha: null }))
      .concat(ESP.map((e) => { const g = e.registros || {}; return { n: e.nombre, a: e.autor, o: e.orden, f: e.familia, t: g.n || 0, p: g.pliegos || 0, i: g.observaciones || 0, e: g.evidencia, s: e.sinonimos || [], ficha: e }; }))
      .sort((a, b) => a.n.localeCompare(b.n));
    // se busca también por los nombres comunes de las que tienen ficha
    todas.forEach((x) => (x._q = norm([x.n, x.f, x.o, ...x.s, ...(x.ficha ? [...nombres(x.ficha, "ca"), ...nombres(x.ficha, "es")] : [])].join(" "))));
    const grupos = (x) => [(PRESENCIA[x.e] || [""])[0], ...(x.ficha ? ["ficha"] : [])];
    const FILTROS = [["", "Todas"], ["ficha", "Con ficha"], ["pliego", "Con pliego de herbario"], ["obs", "Solo observaciones"], ["escasa", "Escasas"]];
    const cuenta = (k) => todas.filter((x) => !k || grupos(x).includes(k)).length;
    app.innerHTML = `<h1>Inventario de especies con registros en Cataluña</h1>
      <p class="ap-intro">Todas las setas y hongos encontrados en Cataluña: <b>${nf(todas.length)} especies</b>, ${ESP.length} de ellas con ficha en esta web. Datos de GBIF (herbarios y observaciones) e iNaturalist; nombres según Catalogue of Life (consulta del ${fechaTxt(DB.meta.inventario.fecha_consulta)}).</p>
      <div class="caja inv-aviso"><b>Las que no tienen ficha no están evaluadas: no las coma.</b> Que una especie esté en la lista solo dice que se ha encontrado en Cataluña.</div>
      <div class="inv-busca">
        <input class="q" type="search" id="iq" placeholder="Buscar por nombre científico o común, familia u orden…" autocomplete="off" spellcheck="false">
        <label class="inv-orden">Ordenar <select id="iord"><option value="az">De la A a la Z</option><option value="mas">Más registros primero</option></select></label>
      </div>
      <div class="inv-filtros" role="group" aria-label="Filtrar por presencia">${FILTROS.map(([k, t]) => `<button class="tog" data-f="${k}" aria-pressed="${k === ""}">${t} <span class="inv-cn">${nf(cuenta(k))}</span></button>`).join("")}</div>
      <p class="small muted inv-ley"><b>GBIF</b>: registros en total · <b>Pliegos</b>: muestras de herbario · <b>iNat</b>: fotos verificadas por la comunidad</p>
      <p id="icuenta" class="small inv-cuenta" aria-live="polite"></p>
      <div class="inv-lista" role="table" aria-label="Especies con registros en Cataluña">
        <div class="inv-fila inv-cab" role="row"><span role="columnheader">Especie</span><span role="columnheader">Orden · familia</span><span class="inv-nums"><span role="columnheader">GBIF</span><span role="columnheader">Pliegos</span><span role="columnheader">iNat</span></span><span role="columnheader">Presencia</span></div>
        <div id="itb" role="rowgroup"></div>
      </div>
      <p class="inv-mas"><button class="btn" id="imas">Mostrar más</button></p>`;
    // la cabecera de la tabla se queda pegada justo debajo de la barra de arriba
    app.style.setProperty("--alto-barra", ($(".top") ? $(".top").offsetHeight : 56) + "px");
    const fila = (x) => {
      const e = x.ficha, pr = PRESENCIA[x.e] || ["bib", x.e || "—", ""];
      return `<div class="inv-fila${e ? " con-ficha" : ""}" role="row">
        <span class="inv-n" role="cell">${e ? `<a href="#/especie/${e.id}"><b>${esc(titulo(e))}</b> <i>${esc(x.n)}</i></a> ${badge(catOf(e))}` : `<i>${esc(x.n)}</i>`} <span class="inv-a">${esc(x.a || "")}</span>${x.s.length && !e ? `<span class="inv-s">También registrada como <i>${esc(x.s.join("; "))}</i></span>` : ""}</span>
        <span class="inv-tax" role="cell">${esc(x.o || "")} · ${esc(x.f || "")}</span>
        <span class="inv-nums"><span role="cell" title="GBIF">${nf(x.t)}</span><span role="cell" title="Pliegos">${nf(x.p)}</span><span role="cell" title="iNat">${nf(x.i)}</span></span>
        <span class="inv-pr" role="cell"><span class="prb pr-${pr[0]}" title="${esc(pr[2])}">${esc(pr[1])}</span></span></div>`;
    };
    const pintar = () => {
      const t = norm(q).split(/\s+/).filter(Boolean);
      let r = todas.filter((x) => (!filtro || grupos(x).includes(filtro)) && t.every((w) => x._q.includes(w)));
      if (orden === "mas") r = [...r].sort((a, b) => b.t - a.t || a.n.localeCompare(b.n));
      $("#icuenta").textContent = !r.length ? "" : r.length > lim ? `Se muestran ${nf(lim)} de ${nf(r.length)} especies` : r.length === 1 ? "1 especie" : `${nf(r.length)} especies`;
      $("#itb").innerHTML = r.length ? r.slice(0, lim).map(fila).join("") : `<p class="muted inv-nada">Ninguna especie coincide con la búsqueda.</p>`;
      $("#imas").hidden = r.length <= lim;
    };
    $("#iq").oninput = (ev) => { q = ev.target.value; lim = 200; clearTimeout(reloj); reloj = setTimeout(pintar, 120); };
    $("#iord").onchange = (ev) => { orden = ev.target.value; lim = 200; pintar(); };
    $$("[data-f]").forEach((b) => (b.onclick = () => {
      filtro = b.dataset.f; lim = 200;
      $$("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      pintar();
    }));
    $("#imas").onclick = () => { lim += 400; pintar(); };
    pintar();
  }
  // ---------------- Vista: Aprende ----------------
  // Los textos de la guía se muestran por puntos: se ve la idea principal y la explicación se abre al tocarla.
  const CAPS = [
    { k: "seguridad", t: "Las 12 reglas de oro", d: "Lo imprescindible antes de recoger una sola seta.", ico: "🛡️", empieza: true },
    { k: "intoxicacion", t: "Si alguien se encuentra mal", d: "Qué hacer, a quién llamar y cuándo es grave.", ico: "🚑", rojo: true },
    { k: "anatomia", t: "Partes de una seta", d: "Qué mirar y en qué orden para describirla bien.", ico: "🍄" },
    { k: "buscar", t: "Cómo buscar setas", d: "Dónde, cuándo y cómo recorrer el bosque.", ico: "🧺" },
    { k: "glosario", t: "Glosario", d: "Las palabras raras de las fichas, explicadas.", ico: "📖" },
    { k: "metodo", t: "Cómo se hizo esta guía", d: "De dónde salen los datos y cuáles son sus límites.", ico: "🔬", extra: true },
  ];
  function textoCap(k) {
    return (DB.textos[k] || "").replace("{{n_fichas}}", ESP.length).replace("{{n_registro}}", DB.registro.length.toLocaleString("es")).replace("{{fecha}}", DB.meta.inventario.fecha_consulta || "")
      .replace("{{n_inventario}}", (DB.registro.length + ESP.length).toLocaleString("es"))
      .replace("{{n_pliego}}", (DB.registro.filter((r) => r.e === "pliego").length + ESP.filter((e) => (e.registros || {}).evidencia === "confirmada").length).toLocaleString("es"))
      .replace("{{n_obs}}", (DB.registro.filter((r) => r.e === "observaciones").length + ESP.filter((e) => (e.registros || {}).evidencia === "observaciones").length).toLocaleString("es"))
      .replace("{{n_escasa}}", (DB.registro.filter((r) => r.e === "escasa").length + ESP.filter((e) => ["escasa", "bibliografia"].includes((e.registros || {}).evidencia)).length).toLocaleString("es"));
  }
  const htmlTexto = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, " ").trim(); };
  const minutos = (h) => Math.max(1, Math.round(htmlTexto(h).length / 1100));
  const primerNodo = (el) => { for (const n of el.childNodes) { if (n.nodeType === 3 && !n.textContent.trim()) continue; return n.nodeType === 1 ? n : null; } return null; };

  // Una lista del texto → puntos: idea principal (la negrita) + «Leer más» con la explicación
  function listaPuntos(lista, numerada) {
    return `<ol class="puntos">${[...lista.children].map((li0, i) => {
      const li = li0.cloneNode(true);
      let etq = "", lead = "", resto = "";
      let p = primerNodo(li);
      if (p && p.tagName === "STRONG" && /^\[.*\]$/.test(p.textContent.trim())) { etq = p.textContent.trim().slice(1, -1); p.remove(); p = primerNodo(li); }
      if (p && p.tagName === "STRONG") { lead = p.textContent.trim(); p.remove(); resto = li.innerHTML.trim(); }
      else { const txt = htmlTexto(li.innerHTML); const m = txt.match(/^.+?[.:](\s|$)/); lead = m ? m[0].trim() : txt; resto = m ? esc(txt.slice(m[0].length).trim()) : ""; }
      // la negrita a veces es solo el principio de la frase: se completa con el resto de esa frase
      const rt = htmlTexto(resto);
      if (/^[a-záéíóúñü,;(]/.test(rt)) {
        const m = rt.match(/^.*?[.!?](\s|$)/), cont = m ? m[0] : rt;
        lead = lead + (/^[,;]/.test(cont) ? "" : " ") + cont.trim(); resto = esc(rt.slice(cont.length).trim());
      }
      lead = lead.replace(/[:]$/, "");
      resto = resto.replace(/^\s*[:.\-–—]\s*/, "");
      const n = numerada ? `<span class="n">${i + 1}</span>` : `<span class="n bala" aria-hidden="true">•</span>`;
      const et = etq ? `<span class="etq">${esc(etq)}</span>` : "";
      const corto = htmlTexto(resto);
      if (!corto) return `<li class="punto solo">${n}<span class="pt">${esc(lead)}${et}</span></li>`;
      if (corto.length <= 70) return `<li class="punto solo">${n}<span class="pt">${esc(lead)}${et} <span class="muted" style="font-weight:400">— ${resto}</span></span></li>`;
      return `<li><details class="punto"><summary>${n}<span class="pt">${esc(lead)}${et}</span></summary><div class="mas">${resto}</div></details></li>`;
    }).join("")}</ol>`;
  }
  function nodoAprende(n) {
    if (n.nodeType === 3) return `<p>${esc(n.textContent.trim())}</p>`;
    const t = n.tagName;
    if (t === "OL" || t === "UL") return listaPuntos(n, t === "OL");
    if (t === "BLOCKQUOTE") return `<div class="aviso-rojo">${n.innerHTML}</div>`;
    if (t === "TABLE") return `<div class="tabla-scroll"><table class="tabla">${n.innerHTML}</table></div>`;
    return n.outerHTML;
  }
  // Un capítulo → introducción corta + bloques plegables (el primero abierto)
  function capituloHTML(h) {
    const d = document.createElement("div"); d.innerHTML = h;
    const secs = []; let cur = { t: null, nodos: [] };
    [...d.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === "H2") { secs.push(cur); cur = { t: n.textContent.trim(), nodos: [] }; }
      else if (n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())) cur.nodos.push(n);
    });
    secs.push(cur);
    const [intro, ...bloques] = secs;
    let primero = true;
    const introH = intro.nodos.map((n) => { if (primero && n.tagName === "P") { primero = false; return `<p class="ap-lead">${n.innerHTML}</p>`; } return nodoAprende(n); }).join("");
    return introH + bloques.map((s, i) => {
      const puntos = s.nodos.reduce((a, n) => a + (/^(OL|UL)$/.test(n.tagName || "") ? n.children.length : 0), 0);
      return `<details class="bloque"${i === 0 ? " open" : ""}><summary><span class="num-b">${i + 1}</span><h2>${esc(s.t.replace(/^\d+\.\s*/, ""))}</h2>${puntos ? `<span class="cuenta">${puntos} puntos</span>` : ""}</summary><div class="bloque-in">${s.nodos.map(nodoAprende).join("")}</div></details>`;
    }).join("");
  }
  // El glosario → tarjetas con buscador
  function glosarioHTML(h) {
    const d = document.createElement("div"); d.innerHTML = h;
    const items = [...d.querySelectorAll("li")].map((li) => { const s = li.querySelector("strong"); const t = s ? s.textContent.trim() : ""; if (s) s.remove(); return { t, def: li.innerHTML.trim().replace(/^\s*:\s*/, "").replace(/^([a-záéíóúñü])/, (m) => m.toUpperCase()) }; });
    return `<input class="q glos-buscar" type="search" placeholder="Busca una palabra: volva, himenóforo, micorriza…" aria-label="Buscar en el glosario">
      <p class="muted small" id="glos-n">${items.length} palabras</p>
      <div class="glos">${items.map((x) => `<div class="term" data-q="${esc(norm(x.t + " " + htmlTexto(x.def)))}"><b>${esc(x.t)}</b>${x.def}</div>`).join("")}</div>`;
  }
  function vistaAprende() {
    const tarjeta = (c) => `<a class="ap-card${c.rojo ? " rojo" : ""}${c.empieza ? " empieza" : ""}" href="#/guia/${c.k}">${c.empieza ? `<span class="marca-emp">Empieza aquí</span>` : ""}<span class="ico" aria-hidden="true">${c.ico}</span><h2>${esc(c.t)}</h2><p>${esc(c.d)}</p><span class="min">${minutos(textoCap(c.k))} min · en puntos cortos</span></a>`;
    app.innerHTML = `<h1>Aprende</h1>
      <p class="ap-intro">Lo básico para recoger setas sin riesgos, explicado en puntos cortos. Toque un punto para leer más.</p>
      <div class="ap-grid">${CAPS.filter((c) => !c.extra).map(tarjeta).join("")}</div>
      <h2 class="ap-sec">Para saber más</h2>
      <div class="ap-grid">${CAPS.filter((c) => c.extra).map(tarjeta).join("")}</div>`;
  }
  function vistaGuia(k) {
    if (!k || k === "inicio") return vistaAprende();
    const i = CAPS.findIndex((c) => c.k === k), c = CAPS[i] || { k, t: k, ico: "" };
    const h = textoCap(k);
    if (!h) return vistaNoEncontrada();
    const sig = CAPS[i + 1];
    document.title = c.t + " · Cistella Segura";
    app.innerHTML = `<a class="volver no-print" href="#/guia">← Aprende</a>
      <nav class="ap-temas no-print" aria-label="Temas">${CAPS.map((x) => `<a class="tog" href="#/guia/${x.k}" aria-pressed="${x.k === k}">${x.ico} ${esc(x.t)}</a>`).join("")}</nav>
      <header class="ap-cab"><h1>${c.ico ? c.ico + " " : ""}${esc(c.t)}</h1>
        <div class="meta"><span>${minutos(h)} min de lectura</span>${k !== "glosario" ? `<button class="btn no-print" id="abrir-todo">Abrir todo</button>` : ""}</div></header>
      <div class="ap-cuerpo">${k === "glosario" ? glosarioHTML(h) : capituloHTML(h)}</div>
      ${sig ? `<a class="ap-sig no-print" href="#/guia/${sig.k}"><span><small>Siguiente</small><b>${sig.ico} ${esc(sig.t)}</b></span><span aria-hidden="true">→</span></a>` : ""}`;
    const at = $("#abrir-todo");
    if (at) at.onclick = () => {
      const todos = $$(".bloque, .punto", app).filter((x) => x.tagName === "DETAILS"), abrir = todos.some((x) => !x.open);
      todos.forEach((x) => (x.open = abrir)); at.textContent = abrir ? "Cerrar todo" : "Abrir todo";
    };
    const gb = $(".glos-buscar");
    if (gb) gb.oninput = () => {
      const q = norm(gb.value.trim()); let n = 0;
      $$(".glos .term").forEach((t) => { const ok = !q || t.dataset.q.includes(q); t.hidden = !ok; if (ok) n++; });
      $("#glos-n").textContent = `${n} ${n === 1 ? "palabra" : "palabras"}`;
    };
  }
  function vistaFuentes() {
    const F = DB.fuentes, tipos = [["consultada", "Fuentes consultadas"], ["datos", "Bases de datos"], ["contraste", "Obras de contraste recomendadas (no consultadas página a página)"]];
    app.innerHTML = `<h1>Fuentes y bibliografía</h1><article class="texto">${tipos.map(([t, tit]) => `<h2>${tit}</h2><ul>${Object.entries(F).filter(([, f]) => f.tipo === t).map(([k, f]) => `<li><b>[${esc(k)}]</b> ${esc(f.cita)} ${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.url)}</a>` : ""} ${f.consulta ? `<span class="muted">(consulta: ${esc(f.consulta)})</span>` : ""}<br><span class="small muted">${esc(f.uso || "")} ${esc(f.nota || "")}</span></li>`).join("")}</ul>`).join("")}
      <h2>Fotografías</h2><p>Observaciones de iNaturalist con licencia Creative Commons (CC0, BY, BY-SA, BY-NC, BY-NC-SA; se excluyen las ND), con autoría y enlace en cada foto. Las licencias NC no permiten uso comercial.</p></article>`;
  }
  function vistaCalidad() {
    const filas = [];
    ESP.forEach((e) => {
      (DB.control[e.id] || []).forEach((q) => filas.push([e, q.nivel, q.msg]));
      ((e.control || {}).pendiente || []).forEach((p) => filas.push([e, "pendiente", p]));
    });
    app.innerHTML = `<h1>Datos inciertos y cuestiones pendientes</h1>
      <p class="muted">Avisos generados al validar la base de datos y cuestiones pendientes señaladas en las fichas. Base de datos generada el ${esc(DB.meta.generado)}.</p>
      <div class="tabla-scroll"><table class="tabla"><tr><th>Especie</th><th>Tipo</th><th>Cuestión</th></tr>${filas.sort((a, b) => a[0].nombre.localeCompare(b[0].nombre)).map(([e, t, m]) => `<tr><td><a href="#/especie/${e.id}"><i>${esc(e.nombre)}</i></a></td><td>${esc(t)}</td><td>${esc(m)}</td></tr>`).join("")}</table></div>`;
  }
  // ---------------- Vista: libros en PDF, con páginas de muestra para hojearlos antes de descargar ----------------
  // Dos libros, cada uno con su uso: el cuaderno de bolsillo (A6) para llevar al bosque y la guía (A5) para estudiar.
  // El cuaderno de campo A5 y el catálogo se retiraron por repetir contenido; sus PDF siguen en las «releases» de GitHub.
  // Las muestras son imágenes sacadas de los PDF: libros/<libro>/pNNN.jpg (grande) y tNNN.jpg (miniatura)
  const MUESTRAS = {
    // orden de los libros: comestibles, tóxicas, mortales y, al final, árboles y anexos
    bolsillo: { total: 56, pags: [[1, "Portada"], [2, "Las 12 reglas y cómo leer las fichas"], [3, "Cómo mirar una seta"], [4, "Níscalos: en qué se diferencian"],
      [7, "Ficha del boleto: cómo es, dónde sale y con qué se confunde"], [11, "Ficha de la trompeta de los muertos"], [14, "Ficha de la oronja"], [31, "Falsos rebozuelos: los que se confunden con el rebozuelo"],
      [34, "Amanita pantera y matamoscas: dos amanitas con el mismo veneno"], [42, "Pequeñas con muscarina: barret de bruixa y Mycena pura"], [44, "Ficha de la oronja verde (mortal)"], [52, "Árboles y sus setas, con la hoja y el tronco"]] },
    esencial: { total: 84, pags: [[1, "Portada"], [2, "Las 12 reglas"], [4, "Níscalos: en qué se diferencian"], [8, "Ficha del boleto: página entera"],
      [9, "Gorro verde y boleto negro: media página cada una"], [19, "Ficha de la oronja"], [48, "Ficha de la amanita pantera (tóxica): gravedad y por qué"], [62, "Ficha de la oronja verde (mortal)"],
      [70, "Árboles y sus setas: cinco por página"], [74, "Calendario"], [76, "Síndromes: según cuándo aparecen los síntomas"], [78, "Índice de todos los nombres"]] },
  };
  const LIBROS = [
    { g: "bolsillo", corto: "Cuaderno de bolsillo", uso: "Para llevar al bosque", tit: "Setas esenciales · cuaderno de bolsillo", formato: "56 páginas · A6 (10,5 × 14,8 cm) o A5 (14,8 × 21 cm) · fondo blanco, gasta poca tinta",
      txt: "Las 54 setas imprescindibles (25 comestibles, 20 tóxicas o no comestibles y 9 mortales), cada una con su nombre en castellano y en catalán: fotos, cómo reconocerla, qué tiene y qué no (✓ ✗), dónde sale (árboles, prados, madera), a qué altura y en qué meses, su olor o sabor si es peculiar y con qué se confunde: si está en el cuaderno, por qué y en qué página; si no, con foto. En las tóxicas, por qué lo son y cuánto. Las que se parecen mucho van de dos en dos en una hoja, con una tabla de diferencias. Al principio, las 12 reglas y cómo leer las fichas; al final, los árboles principales. Los teléfonos de urgencias, en la portada. Pensado para leerse bien impreso, también en A5." },
    { g: "esencial", corto: "Guía esencial", uso: "Para estudiar en casa", tit: "Setas comestibles esenciales de Cataluña", formato: "84 páginas · A5 (14,8 × 21 cm)",
      txt: "80 setas a fondo, cada una en una página como mucho: las 54 del cuaderno de bolsillo en página entera (cómo reconocerla, cómo es, dónde y cuándo sale, con qué se confunde y, en las tóxicas, por qué y cuánto) y otras 26 en media página. Con los árboles, el calendario, los síndromes, un glosario y el índice de todos los nombres." },
  ];
  // Los dos libros están en la propia web (offline/), no en las «releases» de GitHub (allí sigue la guía anterior, de 336 páginas)
  const BOLSILLO = [
    { guia: "bolsillo", ed: "A6", uso: "Para leerlo en el móvil o llevarlo a la copistería: pide «cuadernillo A6 a color, a sangre», con espiral o grapado.", mb: 21.8, pag: 56, url: "offline/setas-esenciales-bolsillo.pdf" },
    { guia: "bolsillo", ed: "Para imprimir en casa (A4)", uso: "Solo 7 hojas A4 a doble cara (14 caras): se cortan por la mitad, se doblan juntas y se grapan.", mb: 22.1, url: "offline/setas-esenciales-bolsillo-imprimir-A4.pdf" },
    { guia: "bolsillo", ed: "A5 · letra más grande", uso: "El mismo cuaderno en tamaño cuartilla (14,8 × 21 cm): letra y fotos un 40 % más grandes. Para leer en la tableta o llevar a la copistería.", mb: 22.1, pag: 56, url: "offline/setas-esenciales-A5.pdf" },
    { guia: "bolsillo", ed: "A5 para imprimir en casa (A4)", uso: "14 hojas A4 apaisadas a doble cara (borde corto). No hay que cortar: se doblan juntas por la mitad y se grapan. Gasta el doble de papel que el A6.", mb: 22.1, url: "offline/setas-esenciales-A5-imprimir-A4.pdf" },
    { guia: "esencial", ed: "A5", uso: "Para leer en el móvil o la tableta, o llevarlo a la copistería: A5 a color, con espiral o grapado.", mb: 29.0, pag: 84, url: "offline/setas-guia-esencial-A5.pdf" },
    { guia: "esencial", ed: "Para imprimir en casa (A4)", uso: "21 hojas A4 apaisadas a doble cara (borde corto), en dos cuadernillos de 11 y 10 hojas: cada uno se dobla por la mitad y se grapa.", mb: 29.0, url: "offline/setas-guia-esencial-imprimir-A4.pdf" },
    { guia: "bolsillo", ed: "En catalán · 50 setas", uso: "Quadern de butxaca, 76 páginas A6 (las muestras de arriba son de la edición en castellano).", mb: 15.4, pag: 76, url: "offline/cistella-segura-butxaca.pdf" },
    { guia: "bolsillo", ed: "En catalán, para imprimir en casa (A4)", uso: "10 hojas A4, un solo cuadernillo.", mb: 15.8, url: "offline/cistella-segura-butxaca-imprimir-A4.pdf" },
  ];
  const IMPRIMIR = {
    bolsillo: `<details class="caja como-imprimir"><summary><b>Cómo imprimirlo en casa</b></summary><ol>
        <li>Descarga el PDF <b>para imprimir en casa (A4)</b>. Imprime a <b>doble cara</b>, volteando por el <b>borde largo</b>, a <b>tamaño real (100 %)</b>.</li>
        <li><b>Corta</b> las hojas por la mitad, por la línea de puntos ✂.</li>
        <li><b>Ordena</b> las mitades por el número pequeño de abajo (1/15, 2/15…), la 1 encima.</li>
        <li><b>Dobla</b> el montón por la mitad y <b>grapa</b> por el pliegue con 2 grapas.</li></ol>
        <p class="small"><b>Versión A5:</b> imprime a doble cara volteando por el <b>borde corto</b>. No se corta nada: ordena las hojas por su número, dóblalas juntas por la mitad y grapa.</p></details>`,
    esencial: `<details class="caja como-imprimir"><summary><b>Cómo imprimirlo en casa</b></summary><ol>
        <li>Descarga el PDF <b>para imprimir en casa (A4)</b>. Imprime a <b>doble cara</b>, volteando por el <b>borde corto</b>, a <b>tamaño real (100 %)</b>.</li>
        <li>Salen <b>dos montones</b>, A y B. Ordena cada uno por el número pequeño de abajo (A 1/11, A 2/11…), la 1 encima.</li>
        <li><b>Dobla</b> cada montón por la mitad y <b>grapa</b> por el pliegue. El B va detrás del A.</li></ol>
        <p class="small">En la copistería: el PDF A5, con espiral o encuadernación cosida para que se abra plano. La edición anterior, de 336 páginas, sigue en <a href="https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1" target="_blank" rel="noopener">GitHub</a>.</p></details>`,
  };
  function paginasLibro(g) {
    const n3 = (n) => String(n).padStart(3, "0");
    return ((MUESTRAS[g] || {}).pags || []).map(([n, et]) => ({ n, et, g: `libros/${g}/p${n3(n)}.jpg`, t: `libros/${g}/t${n3(n)}.jpg` }));
  }
  // Cada libro se lee entero en la web con el lector (extra/lector.js, #/leer/<libro>/<página>): la portada,
  // las páginas de muestra y el botón «Leer el libro» lo abren. El cuaderno de bolsillo se abre en el idioma de la web.
  function vistaLibros() {
    // la guía esencial de las «releases» (336 págs.) se cambia por la nueva, que está en la web
    const L = (DB.libros || []).filter((l) => l.guia !== "esencial").concat(BOLSILLO), mb = (x) => String(x).replace(".", ",");
    const LEC = window.LECTOR, leer = (g, n) => `#/leer/${g}/${n}`;
    const fila = (l) => `<li class="libro"><a class="btn prim" href="${esc(l.url)}" target="_blank" rel="noopener">Descargar</a><div><b>${esc(l.ed)}</b> <span class="muted">· ${l.pag ? l.pag + " págs. · " : ""}${mb(l.mb)} MB</span>${l.uso ? `<br><span class="small">${esc(l.uso)}</span>` : ""}</div></li>`;
    const libro = (b) => {
      const P = paginasLibro(b.g), eds = L.filter((l) => l.guia === b.g);
      if (!eds.length) return "";
      const lg = LEC && LEC.LIBROS[b.g] ? LEC.porIdioma(b.g) : "";
      const va = lg ? LEC.guardada(lg) : 0, otra = lg && LEC.LIBROS[lg].otra;
      return `<section class="libro-c" id="libro-${b.g}">
        ${P.length ? (lg ? `<a class="libro-tapa" href="${leer(b.g, 1)}" aria-label="Leer: ${esc(b.tit)}"><img src="${P[0].t}" alt="Portada de ${esc(b.tit)}" loading="lazy"><span>📖 Leer</span></a>` : `<span class="libro-tapa"><img src="${P[0].t}" alt="Portada de ${esc(b.tit)}" loading="lazy"></span>`) : ""}
        <div class="libro-cab"><p class="libro-uso">${esc(b.uso)}</p><h2>${esc(b.tit)}</h2><p class="libro-formato">${esc(b.formato)}</p><p class="libro-txt">${esc(b.txt)}</p></div>
        <div class="libro-resto">
          ${lg ? `<div class="libro-leer"><a class="btn prim" href="${leer(lg, va || 1)}"><span aria-hidden="true">📖</span> ${va > 1 ? `Seguir leyendo · pág. ${va}` : "Leer el libro"}</a>${va > 1 ? ` <a class="btn" href="${leer(lg, 1)}">Desde el principio</a>` : ""}${otra ? ` <a class="libro-otra" href="${leer(otra, LEC.guardada(otra) || 1)}">${LEC.LIBROS[otra].ed === "ca" ? "o la edición en catalán" : "o la edición en castellano"}</a>` : ""}
            <p class="small muted">Pasa las páginas como en un libro, busca una seta o una palabra y salta a su ficha de la web.</p></div>` : ""}
          ${P.length > 1 ? `<div class="libro-hojas">${P.slice(1, 15).map((p) => lg
            ? `<a href="${leer(b.g, p.n)}" aria-label="Ver la página ${p.n}${p.et ? ": " + esc(p.et) : ""}" title="${esc(p.et || "Página " + p.n)}"><img src="${p.t}" alt="" loading="lazy"><span>${p.n}</span></a>`
            : `<span title="${esc(p.et || "Página " + p.n)}"><img src="${p.t}" alt="" loading="lazy"><span>${p.n}</span></span>`).join("")}</div>` : ""}
          <ul class="libros">${eds.map(fila).join("")}</ul>
          ${IMPRIMIR[b.g] || ""}
        </div></section>`;
    };
    const hay = LIBROS.filter((b) => L.some((l) => l.guia === b.g));
    app.innerHTML = `<h1>Libros en PDF</h1>
      <p class="ap-intro">Dos libros: uno pequeño para llevar al bosque, con las 54 setas imprescindibles, y otro grande para estudiar en casa, con 80. Léelos aquí antes de descargarlos: se pasan las páginas como en un libro y puedes buscar una seta o una palabra.</p>
      ${hay.length > 2 ? `<div class="libro-saltos">${hay.map((b) => `<button class="btn" data-ir="libro-${b.g}">${esc(b.corto)}</button>`).join("")}</div>` : ""}
      ${hay.length ? hay.map(libro).join("") : `<p class="muted">Los PDF no están disponibles en esta copia de la web.</p>`}
      <p class="small muted">Todos salen de la misma base de datos que esta web. Muchas fotografías tienen licencia CC BY-NC: los PDF son para uso personal o sin ánimo de lucro.</p>`;
    $$("[data-ir]").forEach((x) => (x.onclick = () => document.getElementById(x.dataset.ir).scrollIntoView({ behavior: "smooth", block: "start" })));
  }
  function vistaNoEncontrada() { app.innerHTML = `<h1>No encontrado</h1><p><a href="#/">Volver al buscador</a></p>`; }

  // ---------------- Vista: usar la web sin internet ----------------
  // Dos formas: guardarla en el navegador (sw.js + caché; sirve en el móvil) o descargar el ZIP para el ordenador.
  // El ZIP lo rehace .github/workflows/web-zip.yml en cada cambio y lo sube a la release «web-local».
  const REPO = "CaOrJavier/cistella-segura", WEB = "https://caorjavier.github.io/cistella-segura/";
  const ZIP = `https://github.com/${REPO}/releases/download/web-local/cistella-segura-web.zip`;
  const CACHE_SI = "cistella-sin-internet";   // el mismo nombre que en sw.js
  const EN_ARCHIVO = location.protocol === "file:";
  const puedeGuardar = !EN_ARCHIVO && "serviceWorker" in navigator && "caches" in window;
  const mbTxt = (b) => (b / 1048576).toLocaleString("es", { maximumFractionDigits: b < 10485760 ? 1 : 0 }) + " MB";
  const fechaTxt = (f) => String(f || "").split("-").reverse().join("/");
  // Qué se guarda. Siempre: la web, los datos, las fuentes, las miniaturas, el texto de los libros y el cuaderno de bolsillo
  // entero en el idioma de la web (para leerlo en el bosque). Con «todas»: también las fotos y todas las páginas en grande.
  function archivosSinInternet(arbol, todas) {
    const cuaderno = window.IDIOMA === "ca" ? "butxaca" : "bolsillo";
    const muestra = (g, n) => ((MUESTRAS[g] || {}).pags || []).some(([m]) => m === n);
    return arbol.filter((x) => x.type === "blob").filter(({ path: p }) => {
      if (/^(index\.html|app\.js|app\.css|i18n\.js|manifest\.webmanifest|icono-\d+\.png)$/.test(p) || /^(datos|extra|fonts)\//.test(p) ||
        /^quiz\/(index\.html|quiz\.js|quiz\.css)$/.test(p) || /^fotos\/(t|montnegre\/t)\/[^/]+$/.test(p) || /^libros\/[^/]+\/texto\.js$/.test(p)) return true;
      const m = p.match(/^libros\/([^/]+)\/([pt])(\d+)\.jpg$/);
      if (m) return todas || m[1] === cuaderno || (m[2] === "t" && muestra(m[1], +m[3]));
      return todas && /^fotos\/.+\.(jpe?g|png|webp)$/i.test(p);
    });
  }
  // La lista de archivos sale de GitHub: así siempre coincide con lo publicado
  let arbolRepo = null;
  async function listaRepo() {
    if (arbolRepo) return arbolRepo;
    const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`);
    if (!r.ok) throw new Error("GitHub respondió " + r.status);
    const j = await r.json();
    if (j.truncated || !Array.isArray(j.tree)) throw new Error("lista de archivos incompleta");
    return (arbolRepo = j.tree);
  }
  const pesoDe = (lista) => lista.reduce((s, x) => s + (x.size || 0), 0);
  async function guardarSinInternet(todas, avance) {
    const lista = archivosSinInternet(await listaRepo(), todas), total = pesoDe(lista);
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* opcional */ }
    await navigator.serviceWorker.register("sw.js");
    const cache = await caches.open(CACHE_SI), base = new URL(".", location.href);
    const ya = new Set((await cache.keys()).map((r) => new URL(r.url).pathname)), quiere = new Set(), fallos = [];
    // fotos y fuentes ya guardadas no se vuelven a bajar; la página, el código y los datos sí (por si han cambiado)
    const cola = [{ path: "", size: 0 }, { path: "quiz/", size: 0 }, ...lista].map((x) => ({ ...x, url: new URL(x.path, base), fijo: /\.(jpe?g|png|webp|woff2?|ttf)$/i.test(x.path) }));
    let hecho = 0;
    const trabajar = async () => {
      while (cola.length) {
        const x = cola.shift();
        quiere.add(x.url.pathname);
        if (!(x.fijo && ya.has(x.url.pathname))) {
          try {
            const r = await fetch(x.url.href + "?_guardar=" + Date.now());   // «_guardar»: sw.js lo deja pasar directo a la red
            if (!r.ok) throw new Error(r.status);
            await cache.put(x.url, r);
          } catch (e) { fallos.push(x.path); }
        }
        hecho += x.size || 0; avance(hecho, total);
      }
    };
    await Promise.all(Array.from({ length: 6 }, trabajar));
    // fuera lo que ya no hace falta (por ejemplo, las fotos grandes al pasar a «fotos pequeñas»)
    for (const req of await cache.keys()) if (!quiere.has(new URL(req.url).pathname)) await cache.delete(req);
    const info = { fecha: new Date().toISOString().slice(0, 10), todas, bytes: total, n: lista.length - fallos.length, fallos: fallos.length };
    store.set("sinInternet", info);
    pintarSinBtn();
    return info;
  }
  async function borrarSinInternet() {
    await caches.delete(CACHE_SI);
    const aqui = new URL(".", location.href).href;   // solo el de esta web, no otros de github.io
    for (const r of await navigator.serviceWorker.getRegistrations()) if (r.scope === aqui) await r.unregister();
    store.set("sinInternet", null);
    pintarSinBtn();
  }

  // Botón de la cabecera: «⬇ Usar sin internet» o, si ya está guardada, «✓ Guardada»
  function pintarSinBtn() {
    const b = $(".sin-btn"); if (!b) return;
    const ok = EN_ARCHIVO || !!store.get("sinInternet", null);
    b.classList.toggle("guardada", ok);
    b.firstElementChild.textContent = ok ? "✓" : "⬇";
    $(".largo", b).textContent = EN_ARCHIVO ? "Copia sin internet" : ok ? "Guardada sin internet" : "Usar sin internet";
    $(".corto", b).textContent = ok ? "Guardada" : "Guardar";
  }
  // Avisos abajo de la pantalla: invitación a guardarla y cambios de conexión
  let avisoReloj = 0;
  function avisar(html, { botones = [], ms = 0, alCerrar = null } = {}) {
    const a = $("#aviso-red"); if (!a) return;
    clearTimeout(avisoReloj);
    a.innerHTML = `<span class="aviso-txt">${html}</span><span class="aviso-bot">${botones.map((b, i) => `<button class="btn${i ? "" : " prim"}" data-i="${i}">${esc(b.t)}</button>`).join("")}</span><button class="aviso-x" aria-label="Cerrar el aviso">✕</button>`;
    a.hidden = false;
    $$("button[data-i]", a).forEach((x) => (x.onclick = () => { a.hidden = true; botones[+x.dataset.i].f(); }));
    $(".aviso-x", a).onclick = () => { a.hidden = true; if (alCerrar) alCerrar(); };
    if (ms) avisoReloj = setTimeout(() => (a.hidden = true), ms);
  }
  const DIA = 864e5;
  function invitarSinInternet() {
    if (!puedeGuardar || store.get("sinInternet", null)) return;
    if (Date.now() < store.get("invitarDesde", 0)) return;
    setTimeout(() => {
      if (location.hash.startsWith("#/sin-internet") || store.get("sinInternet", null)) return;
      store.set("invitarDesde", Date.now() + 7 * DIA);            // si no contesta, se vuelve a avisar en una semana
      const noAhora = () => store.set("invitarDesde", Date.now() + 30 * DIA);
      avisar("<b>¿Vas al bosque?</b> Guarda la web en este dispositivo y úsala aunque no haya cobertura.",
        { botones: [{ t: "Guardar", f: () => (location.hash = "#/sin-internet") }, { t: "Ahora no", f: noAhora }], alCerrar: noAhora });
    }, 6000);
  }
  const sinRedTxt = () => store.get("sinInternet", null)
    ? "📵 <b>Sin conexión.</b> Sigues usando la copia guardada en este dispositivo."
    : "📵 <b>Sin conexión.</b> Solo verás lo que ya hayas abierto. Cuando tengas internet, guarda la web para el bosque.";
  // Android/Chrome: botón para instalarla como app (se ofrece en «Usar sin internet»)
  let instalar = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); instalar = e; const b = $("#si-instalar"); if (b) b.hidden = false; });
  function vistaSinInternet() {
    const info = store.get("sinInternet", null);
    const estado = info
      ? `<p class="si-ok">✓ Guardada en este dispositivo el ${fechaTxt(info.fecha)}, ${info.todas ? "con todas las fotos en grande" : "con fotos pequeñas"} (${mbTxt(info.bytes)}).</p>
         ${info.fallos ? `<p class="small">Faltaron ${info.fallos} archivos: vuelve a guardarla con buena conexión.</p>` : ""}
         <p class="si-acciones"><button class="btn" data-guardar="${info.todas ? "todas" : "pequenas"}">Actualizar</button> <button class="btn" id="si-borrar">Borrar del dispositivo</button></p>
         <p class="small muted">Para cambiar entre fotos pequeñas y grandes, elige otra opción:</p>`
      : `<p>Guárdala antes de salir, con wifi. Elige cómo:</p>`;
    app.innerHTML = `<h1>Usar la web sin internet</h1>
      <p class="ap-intro">En el bosque muchas veces no hay cobertura. Guarda la web y funcionará igual: fichas, fotos, búsqueda por rasgos, calendario, Aprende y el cuaderno de bolsillo.</p>
      <section class="si-c">
        <h2>📱 En el móvil o la tableta</h2>
        ${EN_ARCHIVO ? `<p>Estás usando la copia descargada: ya funciona sin internet.</p>`
        : !puedeGuardar ? `<p>Este navegador no permite guardar la web. Prueba con Chrome, Safari, Edge o Firefox actualizados, o usa los <a href="#/libros">libros en PDF</a>.</p>`
        : `${estado}
        <div class="si-opciones">
          <button class="si-op" data-guardar="pequenas"><b>Con fotos pequeñas</b><span data-peso="pequenas">unos 35 MB</span><small>Ocupa poco. Las fotos se ven más pequeñas.</small></button>
          <button class="si-op" data-guardar="todas"><b>Con todas las fotos en grande</b><span data-peso="todas">unos 220 MB</span><small>Como en la web. Mejor con wifi.</small></button>
        </div>
        <div id="si-progreso" hidden><div class="si-barra"><span></span></div><p class="small" id="si-txt"></p></div>
        <p><button class="btn prim" id="si-instalar" ${instalar ? "" : "hidden"}>📲 Instalar como app</button></p>
        <details class="caja si-inicio"><summary><b>Después: ponla en la pantalla de inicio</b></summary><ul>
          <li><b>Android (Chrome):</b> menú ⋮ → <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</li>
          <li><b>iPhone (Safari):</b> botón Compartir → <b>Añadir a pantalla de inicio</b>.</li></ul>
          <p class="small">Se abre como una app, también sin internet, y el móvil no borra lo guardado aunque pases semanas sin usarla.</p></details>`}
      </section>
      <section class="si-c">
        <h2>💻 En el ordenador</h2>
        <p>Descarga la web entera en un archivo ZIP. Descomprímelo y abre <b>index.html</b> con doble clic: se abre en el navegador, sin internet.</p>
        <p><a class="btn prim" href="${ZIP}">Descargar la web (ZIP)</a> <span class="muted small" data-peso="zip">unos 220 MB</span></p>
      </section>
      <section class="si-c">
        <h2>📕 En papel</h2>
        <p>Sin depender de la batería: el <a href="#/libros">cuaderno de bolsillo en PDF</a>, para imprimirlo y llevarlo en la mochila.</p>
      </section>
      <p class="small muted">Sin internet no funcionan «Cuándo salir tras la lluvia» (necesita saber cuánto ha llovido) ni la descarga de los PDF.</p>
      <p class="small muted">La guía esencial (336 páginas) solo se puede leer sin internet si guardas la web con todas las fotos en grande; el cuaderno de bolsillo, siempre.</p>`;
    // pesos exactos, sacados de la lista de archivos
    listaRepo().then((arbol) => {
      const p = { pequenas: pesoDe(archivosSinInternet(arbol, false)), todas: pesoDe(archivosSinInternet(arbol, true)) };
      p.zip = p.todas;
      $$("[data-peso]").forEach((el) => (el.textContent = mbTxt(p[el.dataset.peso])));
    }).catch(() => { /* se quedan los pesos aproximados */ });
    $$("[data-guardar]").forEach((b) => (b.onclick = async () => {
      const prog = $("#si-progreso"), barra = $("#si-progreso .si-barra span"), txt = $("#si-txt");
      $$("[data-guardar], #si-borrar").forEach((x) => (x.disabled = true));
      prog.hidden = false; txt.textContent = "Preparando la lista de archivos…";
      try {
        const info = await guardarSinInternet(b.dataset.guardar === "todas", (h, t) => {
          barra.style.width = (t ? (100 * h) / t : 0).toFixed(1) + "%";
          txt.textContent = `Guardando… ${mbTxt(h)} de ${mbTxt(t)}. No cierres esta página.`;
        });
        if (location.hash === "#/sin-internet") vistaSinInternet();
        const ok = $(".si-ok"); if (ok) ok.insertAdjacentHTML("beforeend", info.fallos ? "" : " <b>Ya puedes usarla sin internet.</b>");
      } catch (e) {
        txt.textContent = "No se ha podido guardar (" + e.message + "). Comprueba la conexión y vuelve a intentarlo.";
        $$("[data-guardar], #si-borrar").forEach((x) => (x.disabled = false));
      }
    }));
    const borrar = $("#si-borrar");
    if (borrar) borrar.onclick = async () => { borrar.disabled = true; await borrarSinInternet(); vistaSinInternet(); };
    const inst = $("#si-instalar");
    if (inst) inst.onclick = async () => { if (!instalar) return; instalar.prompt(); await instalar.userChoice.catch(() => {}); instalar = null; inst.hidden = true; };
  }

  // Utilidades para las secciones que vienen de Cistella Segura (extra/*.js): se registran en window.VISTAS_EXTRA
  window.GUIA = { app, esc, cap, norm, titulo, nombres, badge, tarjeta, mesesHTML, catOf, BYID, ESP, store, MESES, MESES_L, abrirVisor: (fotos, i) => { galeriaActual = fotos; abrirVisor(i); } };

  // ---------------- Router ----------------
  // Enlaces antiguos: los de la web catalana (#/bolet/rovello, #/troballes…) y las secciones retiradas (#/hoy, #/mapa)
  const ANTIGUAS = { bolets: "", avui: "", hoy: "", mapa: "", pluja: "lluvia", troballes: "hallazgos", seguretat: "guia/seguridad", sos: "guia/intoxicacion",
    aprendre: "guia/anatomia", explora: "arboles", bosc: "arboles", "cara-a-cara": "rasgos", cuaderno: "libros" };
  function rutaAntigua(v, a) {
    if (v === "bolet") return window.CS && CS.CAT2ES[a] ? "especie/" + CS.CAT2ES[a] : "";
    return ANTIGUAS[v];
  }
  function render() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [v, a] = [h.split("/")[0], h.split("/").slice(1).join("/")];
    if (v === "test") { location.replace(EN_ARCHIVO ? "quiz/index.html" : "quiz/"); return; }
    const nueva = rutaAntigua(v, a);
    if (nueva !== undefined) { location.replace("#/" + nueva); return; }
    document.title = "Cistella Segura · Setas de Cataluña";
    $$(".nav a").forEach((x) => x.classList.toggle("activo", x.getAttribute("href") === "#/" + v));
    $(".nav").classList.remove("abierta");
    $$(".nav details").forEach((d) => (d.open = false));
    const extra = (window.VISTAS_EXTRA || {})[v];
    ({ ...(extra ? { [v]: () => extra(a, window.GUIA) } : {}), "": vistaBuscador, especie: () => vistaFicha(a), rasgos: vistaRasgos, arboles: vistaArboles, arbol: () => vistaArbol(a), calendario: vistaCalendario,
      // secciones retiradas: los enlaces antiguos llevan a «Por rasgos» o al buscador
      comparar: () => location.replace("#/rasgos"), habitats: () => location.replace("#/rasgos"), taxonomia: () => location.replace("#/"), galeria: () => vistaGaleria(a), inventario: vistaInventario, guia: () => vistaGuia(a), fuentes: vistaFuentes, calidad: vistaCalidad, libros: vistaLibros, "sin-internet": vistaSinInternet }[v] || vistaNoEncontrada)();
    window.scrollTo(0, 0);
    // cada página entra con un fundido suave (solo opacidad: no afecta a nada fijo de dentro)
    app.classList.remove("entra"); void app.offsetWidth; app.classList.add("entra");
  }
  // el Quiz ya está en «Más» (index.html); solo se añade si faltara
  if (DB.enlaces && DB.enlaces.quiz && !$(`.nav a[href="${DB.enlaces.quiz}"]`)) $(".nav").insertAdjacentHTML("beforeend", `<a href="${esc(DB.enlaces.quiz)}">Quiz 🍄</a>`);
  // cierra «Más» al hacer clic fuera
  document.addEventListener("click", (ev) => { $$(".nav details[open]").forEach((d) => { if (!d.contains(ev.target)) d.open = false; }); });
  $(".menu-btn").onclick = (ev) => { const n = $(".nav"); n.classList.toggle("abierta"); ev.currentTarget.setAttribute("aria-expanded", n.classList.contains("abierta")); };
  $("#pie-meta").textContent = `Edición ${DB.meta.version} · datos generados el ${DB.meta.generado} · ${ESP.length} fichas · ${DB.registro.length.toLocaleString("es")} especies más en el inventario.`;
  // Sin internet: si se guardó en este dispositivo, se mantiene activo el service worker (y así se actualiza)
  if (puedeGuardar && store.get("sinInternet", null)) navigator.serviceWorker.register("sw.js").catch(() => {});
  pintarSinBtn();
  invitarSinInternet();
  if (!EN_ARCHIVO) {
    window.addEventListener("offline", () => avisar(sinRedTxt(), { ms: 8000 }));
    window.addEventListener("online", () => avisar("📶 Vuelves a tener conexión.", { ms: 3000 }));
    if (navigator.onLine === false) avisar(sinRedTxt(), { ms: 8000 });
  }
  // En la copia descargada (ZIP, file://): el quiz se abre por su index.html (una carpeta no se abre sola)
  // y los PDF de bolsillo, que no van en el ZIP, se abren en la web
  if (EN_ARCHIVO) document.addEventListener("click", (ev) => {
    const q = ev.target.closest && ev.target.closest('a[href="quiz/"]');
    if (q) { ev.preventDefault(); location.href = "quiz/index.html"; return; }
    const a = ev.target.closest && ev.target.closest('a[href^="offline/"]');
    if (a) { ev.preventDefault(); window.open(WEB + a.getAttribute("href"), "_blank", "noopener"); }
  });
  // ---------------- Movimiento: aparición al hacer scroll e inclinación 3D con el ratón ----------------
  // Todo con opacidad y transformaciones (lo barato para el navegador). Nada si se pide «reducir movimiento».
  const MOVIMIENTO = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const CON_REVELA = ".tarjeta, .dest, .libro-c, .si-c, .ap-card, .paso";
  if (MOVIMIENTO && "IntersectionObserver" in window) {
    let ioResponde = false;
    const io = new IntersectionObserver((ents) => { ioResponde = true; ents.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
    }); }, { rootMargin: "0px 0px -5% 0px" });
    const preparar = () => {
      let i = 0;
      app.querySelectorAll(CON_REVELA).forEach((el) => {
        if (el.classList.contains("revela")) return;
        el.classList.add("revela");
        el.style.setProperty("--i", i++ % 8);   // escalonado corto: como mucho 8 pasos
        io.observe(el);
      });
      // seguridad: si el navegador no avisa de lo que se ve (pestaña oculta, visores raros), se muestra todo
      if (i) setTimeout(() => { if (!ioResponde) app.querySelectorAll(".revela:not(.visto)").forEach((el) => el.classList.add("visto")); }, 1500);
    };
    new MutationObserver(preparar).observe(app, { childList: true, subtree: true });   // el navegador ya agrupa los cambios
  }
  if (MOVIMIENTO && window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const INCLINA = ".tarjeta, .dest, .ap-card, .libro-tapa";
    let el = null, ev = null, cuadro = 0;
    const suelta = (x) => { if (!x) return; x.classList.remove("inclina"); ["--rx", "--ry", "--mx", "--my"].forEach((p) => x.style.removeProperty(p)); };
    document.addEventListener("pointermove", (e) => {
      const t = e.target.closest ? e.target.closest(INCLINA) : null;
      if (el && el !== t) suelta(el);
      el = t; ev = e;
      if (!el || cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = 0;
        if (!el) return;
        const r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        el.classList.add("inclina");
        el.style.setProperty("--rx", ((0.5 - y) * 6).toFixed(2) + "deg");
        el.style.setProperty("--ry", ((x - 0.5) * 8).toFixed(2) + "deg");
        el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      });
    }, { passive: true });
    document.addEventListener("pointerleave", () => { suelta(el); el = null; });
  }

  window.addEventListener("hashchange", render);
  render();
})();
