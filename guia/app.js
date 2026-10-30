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
  const arbolNombre = (id) => (ARB[id] ? cap(ARB[id].nombres.es[0]) : id);
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
    { k: "guia", t: "Guía", g: "Selección", get: (e) => [...(e.guias || []), e.alerta ? "alerta" : null], lab: (v) => ({ esencial: "Guía esencial", catalogo: "Catálogo", alerta: "Fichas de alerta" }[v] || v) },
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
  const state = { q: "", f: {}, orden: "familia", alt: [0, 3000], comp: store.get("comp", []), excep: false };
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
    const enc = state.comp.includes(e.id);
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
        <label class="comp"><input type="checkbox" data-comp="${e.id}" ${enc ? "checked" : ""}> Comparar</label>
      </div></article>`;
  }
  function enlazarComparar(root) {
    $$("input[data-comp]", root).forEach((c) => c.addEventListener("change", () => {
      const id = c.dataset.comp;
      state.comp = c.checked ? [...new Set([...state.comp, id])].slice(-4) : state.comp.filter((x) => x !== id);
      store.set("comp", state.comp); pintarBarraComp();
    }));
  }
  function pintarBarraComp() {
    const b = $("#barra-comp"); if (!b) return;
    b.innerHTML = state.comp.length ? `Para comparar: ${state.comp.map((id) => esc(titulo(BYID[id]))).join(", ")} · <a href="#/comparar/${state.comp.join(",")}">Abrir comparador</a> · <button class="btn" id="limpiar-comp">Vaciar</button>` : "Marque «Comparar» en hasta cuatro fichas para verlas lado a lado.";
    const l = $("#limpiar-comp"); if (l) l.onclick = () => { state.comp = []; store.set("comp", []); render(); };
  }

  // ---------------- Vista: buscador ----------------
  function vistaBuscador() {
    const grupos = [...new Set(FAC.map((f) => f.g))];
    app.innerHTML = `
      <h1>Setas de Cataluña</h1>
      <p class="muted">${ESP.length} especies con ficha (guía esencial y catálogo) y ${DB.registro.length.toLocaleString("es")} especies más en el <a href="#/inventario">inventario de registros</a>. Busque por cualquier nombre o combine filtros.${(DB.libros || []).length ? ` <a href="#/libros">Descargue los libros en PDF</a>.` : ""}</p>
      ${DB.cuaderno ? `<a class="aviso-cuaderno" href="#/cuaderno"><img src="cuaderno/t01.jpg" alt=""><span><b>Cuaderno de campo para imprimir</b>${DB.cuaderno.paginas} páginas A5 en color con las comestibles, las peligrosas y sus árboles, para doblar y llevar en la mochila.</span><span aria-hidden="true">›</span></a>` : ""}
      <input class="q" type="search" placeholder="Nombre catalán, castellano o científico, sinónimo, familia…" value="${esc(state.q)}" aria-label="Buscar">
      <div class="barra"><span id="cuenta"></span>
        <span><button class="btn no-print" id="ver-filtros">Filtros</button>
        <label>Ordenar por <select id="ordenar">
          ${[["familia", "Familia"], ["cientifico", "Nombre científico"], ["catalan", "Nombre catalán"], ["castellano", "Nombre castellano"], ["genero", "Género"], ["mes", "Primer mes de aparición"], ["habitat", "Hábitat"], ["registros", "Nº de registros en Cataluña"]].map(([k, t]) => `<option value="${k}" ${state.orden === k ? "selected" : ""}>${t}</option>`).join("")}
        </select></label> <button class="btn" id="limpiar">Quitar filtros</button></span></div>
      <div class="buscador">
        <aside class="filtros" id="filtros" aria-label="Filtros">
          ${grupos.map((g) => `<details class="grupo" ${["Seguridad", "Selección"].includes(g) ? "open" : ""}><summary>${g}</summary>${FAC.filter((f) => f.g === g).map((f) => `<div data-fac="${f.k}"></div>`).join("")}
          ${g === "Cuándo y dónde" ? `<label><input type="checkbox" id="excep" ${state.excep ? "checked" : ""}> Incluir meses excepcionales</label>
            <div class="small">Altitud: <input id="altmin" type="number" min="0" max="3000" step="100" value="${state.alt[0]}" style="width:5em"> – <input id="altmax" type="number" min="0" max="3000" step="100" value="${state.alt[1]}" style="width:5em"> m</div>` : ""}</details>`).join("")}
        </aside>
        <section>
          <div id="nota-filtro"></div>
          <div id="barra-comp" class="small muted no-print"></div>
          <div class="tarjetas" id="res"></div>
        </section>
      </div>`;
    const q = $(".q"); q.addEventListener("input", () => { state.q = q.value; pintarResultados(); });
    $("#ordenar").onchange = (ev) => { state.orden = ev.target.value; pintarResultados(); };
    $("#limpiar").onclick = () => { state.f = {}; state.q = ""; state.alt = [0, 3000]; state.excep = false; vistaBuscador(); };
    $("#ver-filtros").onclick = () => $("#filtros").classList.toggle("abiertos");
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
    enlazarComparar($("#res")); pintarBarraComp(); pintarFacetas();
  }

  // ---------------- Vista: ficha ----------------
  function seccion(t, html) { return html ? `<section class="caja"><h2>${t}</h2>${html}</section>` : ""; }
  function dl(pares) { const x = pares.filter(([, v]) => v); return x.length ? `<dl class="morf">${x.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>` : ""; }
  function confusionesHTML(e) {
    const cs = e.confusiones || []; if (!cs.length) return "";
    return `<table class="conf"><tr><th>Especie</th><th>Cómo separarlas</th></tr>${cs.map((c) => {
      const o = c.id && BYID[c.id];
      const nom = o ? (titulo(o) === o.nombre ? `<a href="#/especie/${o.id}"><b><i>${esc(o.nombre)}</i></b></a>` : `<a href="#/especie/${o.id}"><b>${esc(titulo(o))}</b></a><br><i>${esc(o.nombre)}</i>`) : `<i>${esc(c.nombre || c.id)}</i>`;
      return `<tr class="p-${c.peligro || "desconocida"}"><td>${nom}<br>${badge(c.peligro)}</td><td><b>${esc(c.diferencia || "")}</b>
        ${c.comparten ? `<div class="small"><b>Se parecen en:</b> ${esc(c.comparten)}</div>` : ""}
        ${c.donde ? `<div class="small"><b>Dónde mirarlo:</b> ${esc(c.donde)}</div>` : ""}
        ${c.dificultad ? `<div class="small"><b>Límites:</b> ${esc(c.dificultad)}</div>` : ""}
        ${o ? `<div class="small no-print"><a href="#/comparar/${e.id},${o.id}">Comparar lado a lado</a></div>` : ""}</td></tr>`;
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
    document.title = titulo(e) + " · Setas de Cataluña";
    const com = e.comestibilidad || {}, idf = e.identificacion || {}, mo = e.morfologia || {}, ec = eco(e), r = e.registros, b = e.busqueda || {};
    galeriaActual = e.fotos || [];
    const zonas = r ? Object.entries(r.zonas || {}).filter(([z]) => V.region[z]).map(([z, n]) => `${esc(V.region[z].nombre)} (${n})`).join(", ") : "";
    const comarcas = r ? Object.entries(r.comarcas || {}).map(([c, n]) => `${esc(c)} (${n})`).join(", ") : "";
    app.innerHTML = `
      <div class="aviso-impresion">Ficha impresa de «Setas de Cataluña» (${esc(DB.meta.generado)}). Ninguna ficha certifica que un ejemplar sea comestible.</div>
      <div class="ficha-cab">
        <div><div class="tax">${esc(e.orden)} · <a href="#/taxonomia">${esc(e.familia)}</a> · ${esc(e.genero)}</div>
          <h1>${esc(titulo(e))}</h1>
          <div class="nombres">${nombres(e, "ca").length ? "<b>ca:</b> " + esc(nombres(e, "ca").join(", ")) : ""}${nombres(e, "es").length ? " · <b>es:</b> " + esc(nombres(e, "es").join(", ")) : ""}</div>
          <div class="sci"><i>${esc(e.nombre)}</i> <span class="muted small">${esc(e.autor || "")}</span></div></div>
        <div style="text-align:right">${badge(catOf(e))}<br>${idf.dificultad ? `<span class="chip">Identificación ${esc(idf.dificultad)}</span>` : ""}${e.controversia ? `<span class="chip">Comestibilidad o taxonomía discutida</span>` : ""}
          <div class="no-print" style="margin-top:.5rem"><button class="btn" onclick="window.print()">Imprimir ficha</button> <label class="small"><input type="checkbox" data-comp="${e.id}" ${state.comp.includes(e.id) ? "checked" : ""}> Comparar</label></div></div>
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
    enlazarComparar(app);
  }
  function abrirVisor(i) {
    const v = $("#visor"); const n = galeriaActual.length; if (!n) return;
    const p = galeriaActual[(i + n) % n];
    v.innerHTML = `<button aria-label="Cerrar">Cerrar ✕</button><button class="nav-v ant" aria-label="Anterior">‹</button><button class="nav-v sig" aria-label="Siguiente">›</button>
      <img src="${p.g}" alt=""><div class="txt">${esc(p.pie || "")} ${p.taxon ? `<i>(${esc(p.taxon)})</i>` : ""}${p.autor || p.licencia ? `<br>© ${esc(p.autor || "")} · ${esc(p.licencia || "")}` : ""} ${p.url ? `· <a href="${esc(p.url)}" target="_blank" rel="noopener" style="color:#fff">origen</a>` : ""}</div>`;
    v.hidden = false;
    $("button", v).onclick = () => (v.hidden = true);
    $(".ant", v).onclick = () => abrirVisor(i - 1);
    $(".sig", v).onclick = () => abrirVisor(i + 1);
  }
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") $("#visor").hidden = true; });

  // ---------------- Vista: comparador ----------------
  function vistaComparar(ids) {
    const lista = (ids ? ids.split(",") : state.comp).filter((id) => BYID[id]).slice(0, 4);
    const opciones = ESP.slice().sort(ORDENES.catalan).map((e) => `<option value="${e.id}">${esc(titulo(e))} — ${esc(e.nombre)}</option>`).join("");
    const filas = [
      ["Foto", (e) => (e.fotos[0] ? `<img src="${e.fotos[0].t}" alt="">` : "")],
      ["Nombres", (e) => `<b><a href="#/especie/${e.id}">${esc(titulo(e))}</a></b><br><i>${esc(e.nombre)}</i><br>${esc(nombres(e, "es").join(", "))}`],
      ["Comestibilidad", (e) => badge(catOf(e)) + (e.toxicidad ? `<br><span class="small">${esc(e.toxicidad.sindrome)}; síntomas ${esc(e.toxicidad.latencia || "")}</span>` : "")],
      ["Rasgos decisivos", (e) => `<ul class="small">${((e.identificacion || {}).claves || []).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`],
      ["Bajo el sombrero", (e) => esc(lab("himenoforo", car(e).himenoforo)) + "<br><span class='small'>" + esc((e.morfologia || {}).himenoforo || "") + "</span>"],
      ["Pie", (e) => esc((e.morfologia || {}).pie || "")],
      ["Anillo / volva", (e) => `${car(e).anillo ? "Anillo" : "Sin anillo"} · ${car(e).volva ? "Volva" : "Sin volva"}`],
      ["Carne y látex", (e) => esc([(e.morfologia || {}).carne, (e.morfologia || {}).latex].filter(Boolean).join(" Látex: "))],
      ["Olor", (e) => esc((e.morfologia || {}).olor || "")],
      ["Hábitat", (e) => esc((eco(e).habitats || []).map((h) => lab("habitat", h)).join(", ")) + "<br><span class='small'>" + esc((eco(e).arboles || []).map((a) => arbolNombre(a.id)).join(", ")) + "</span>"],
      ["Meses", (e) => mesesHTML(e)],
    ];
    app.innerHTML = `<h1>Comparador</h1>
      <p class="muted">Compare hasta cuatro especies. Las diferencias que importan están en «Rasgos decisivos» y en la tabla de confusiones de cada ficha.</p>
      <p class="no-print"><select id="add"><option value="">Añadir especie…</option>${opciones}</select> <button class="btn" id="vaciar">Vaciar</button></p>
      ${lista.length ? `<div class="comparador"><table>${filas.map(([t, f]) => `<tr><th>${t}</th>${lista.map((id) => `<td>${f(BYID[id])}</td>`).join("")}</tr>`).join("")}</table></div>` : "<p>Añada especies con el selector o marcando «Comparar» en las fichas.</p>"}`;
    $("#add").onchange = (ev) => { if (!ev.target.value) return; const l = [...new Set([...lista, ev.target.value])].slice(-4); state.comp = l; store.set("comp", l); location.hash = "#/comparar/" + l.join(","); };
    $("#vaciar").onclick = () => { state.comp = []; store.set("comp", []); location.hash = "#/comparar"; };
  }

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
      enlazarComparar($("#res"));
    };
    $("#limpiar").onclick = () => { state.f = {}; state.q = ""; pintar(); };
    pintar();
  }

  // ---------------- Vistas: árboles, calendario, hábitats, taxonomía ----------------
  function vistaArboles() {
    app.innerHTML = `<h1>Árboles y vegetación</h1><div class="texto">${DB.textos.arboles || ""}</div>
      <h2>Árboles</h2><div class="arbol-lista">${DB.arboles.map((a) => `<article class="tarjeta"><a class="cubre" href="#/arbol/${a.id}" aria-label="${esc(a.nombres.es[0])}"></a><div class="img" ${a.fotos && a.fotos[0] ? `style="background-image:url('${a.fotos[0].t}')"` : ""}></div><div class="cuerpo"><h3>${esc(cap(a.nombres.es[0]))}</h3><div class="es">ca: ${esc(a.nombres.ca[0])} · <i>${esc(a.nombre)}</i></div><div class="small muted">${(a.setas || []).length} setas con ficha asociadas</div></div></article>`).join("")}</div>
      <h2>Plantas indicadoras</h2><p class="muted">Informan del suelo, la humedad o el hábitat; no predicen la aparición de ninguna seta.</p>
      <div class="tabla-scroll"><table class="tabla"><tr><th>Planta</th><th>Indica</th><th>Reconocerla y relación con las setas</th></tr>${DB.plantas.map((p) => `<tr><td><b>${esc(cap(p.nombres.es[0]))}</b> · ${esc(p.nombres.ca[0])}<br><i>${esc(p.nombre)}</i></td><td>${esc((p.indica || []).join(", ").replace(/_/g, " "))}</td><td>${esc(p.reconocer)} ${esc(p.setas)}</td></tr>`).join("")}</table></div>`;
  }
  function vistaArbol(id) {
    const a = ARB[id]; if (!a) return vistaNoEncontrada();
    const r = a.reconocer || {}, ec = a.ecologia || {};
    galeriaActual = a.fotos || [];
    const setas = (a.setas || []).map((x) => BYID[x.id]).filter(Boolean);
    app.innerHTML = `<p class="no-print"><a href="#/arboles">← Árboles</a></p>
      <div class="ficha-cab"><div><div class="tax">${esc(a.familia)}</div><h1>${esc(cap(a.nombres.es[0]))}</h1><div class="nombres">ca: ${esc(a.nombres.ca.join(", "))} · es: ${esc(a.nombres.es.join(", "))}</div><div class="sci"><i>${esc(a.nombre)}</i> <span class="small muted">${esc(a.autor || "")}</span></div></div>${a.autoctono === false ? `<span class="chip">No autóctono</span>` : ""}</div>
      <div class="ficha-grid"><div>${galeriaActual.length ? `<div class="galeria-f">${galeriaActual.map((p, i) => `<button data-foto="${i}" style="background-image:url('${i ? p.t : p.g}')"></button>`).join("")}</div><div class="creditos">Fotos: ${galeriaActual.map((p) => `${esc(p.autor)} (${esc(p.licencia)})`).join("; ")}</div>` : ""}</div>
      <div>${seccion("Cómo reconocerlo", dl([["De lejos", esc(r.distancia)], ["Corteza", esc(r.corteza)], ["Hojas", esc(r.hojas)], ["Frutos", esc(r.frutos)], ["Parecidos", esc(r.parecidos)], ["Cuándo", esc(r.epoca)], ["En otoño", esc(r.otono)]]))}
      ${seccion("Dónde crece", dl([["Clima", esc(ec.clima)], ["Suelo", esc(ec.suelo)], ["Altitud", esc(ec.altitud)], ["En Cataluña", esc(ec.distribucion)], ["Bosques", esc(ec.bosques)]]))}</div></div>
      ${seccion("Setas asociadas", `<p>${esc(a.setas_nota || "")}</p><p class="small muted">«Micorriza»: asociación establecida; «habitual/ocasional»: aparece con frecuencia sin relación demostrada de forma específica.</p><div class="tarjetas">${setas.map(tarjeta).join("")}</div>`)}`;
    $$("[data-foto]").forEach((b) => (b.onclick = () => abrirVisor(+b.dataset.foto)));
    enlazarComparar(app);
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
    enlazarComparar(app);
  }
  function vistaHabitats() {
    const cuenta = {}; ESP.forEach((e) => (eco(e).habitats || []).forEach((h) => (cuenta[h] = (cuenta[h] || 0) + 1)));
    app.innerHTML = `<h1>Consulta por hábitat</h1><p class="muted">Elija un hábitat para ver las especies con ficha que viven en él.</p>
      <div class="arbol-lista">${Object.keys(V.habitat).filter((h) => cuenta[h]).map((h) => `<button class="caja" style="text-align:left" data-h="${h}"><b>${esc(V.habitat[h].nombre)}</b><br><span class="muted small">${cuenta[h]} especies${V.habitat[h].arbol && ARB[V.habitat[h].arbol] ? " · árbol: " + esc(arbolNombre(V.habitat[h].arbol)) : ""}</span></button>`).join("")}</div>`;
    $$("[data-h]").forEach((b) => (b.onclick = () => { state.f = { habitat: [b.dataset.h] }; state.q = ""; location.hash = "#/"; }));
  }
  function vistaTaxonomia() {
    const reg = DB.registro, ord = {};
    const add = (o, f, g, item, ficha) => { o = o || "Sin orden"; f = f || "Sin familia"; ((((ord[o] = ord[o] || {})[f] = ord[o][f] || {})[g] = ord[o][f][g] || [])).push({ item, ficha }); };
    ESP.forEach((e) => add(e.orden, e.familia, e.genero, e, true));
    reg.forEach((r) => add(r.o, r.f, r.g, r, false));
    const tx = Object.fromEntries((DB.taxonomia.ordenes || []).map((o) => [o.id, o]));
    const nOrd = (o) => Object.values(ord[o]).reduce((a, f) => a + Object.values(f).reduce((b, g) => b + g.length, 0), 0);
    app.innerHTML = `<h1>Órdenes, familias y géneros</h1><p class="muted">Todas las especies con registros en Cataluña. En negrita, las que tienen ficha.</p>
      ${Object.keys(ord).sort((a, b) => nOrd(b) - nOrd(a)).map((o) => `<details class="caja"><summary><b>${esc(o)}</b> ${tx[o] ? "· " + esc(tx[o].es) : ""} <span class="muted">(${nOrd(o)} especies)</span></summary>
        ${tx[o] ? `<p class="small">${esc(tx[o].texto)}</p>` : ""}
        ${Object.keys(ord[o]).sort().map((f) => `<details style="margin-left:1rem"><summary>${esc(f)} <span class="muted small">(${Object.values(ord[o][f]).reduce((a, g) => a + g.length, 0)})</span></summary>
          ${Object.keys(ord[o][f]).sort().map((g) => `<div style="margin-left:1rem" class="small"><i><b>${esc(g)}</b></i>: ${ord[o][f][g].sort((a, b) => (a.ficha ? a.item.nombre : a.item.n).localeCompare(b.ficha ? b.item.nombre : b.item.n)).map((x) => x.ficha ? `<a href="#/especie/${x.item.id}"><b><i>${esc(x.item.nombre)}</i></b></a>` : `<i>${esc(x.item.n)}</i>`).join(", ")}</div>`).join("")}
        </details>`).join("")}</details>`).join("")}`;
  }
  function vistaGaleria(id) {
    const lista = id && BYID[id] ? [BYID[id]] : ESP;
    galeriaActual = lista.flatMap((e) => (e.fotos || []).map((p) => Object.assign({ _e: e }, p)));
    app.innerHTML = `<h1>Galería de fotografías revisadas${id && BYID[id] ? ": " + esc(titulo(BYID[id])) : ""}</h1>
      <p class="muted">${galeriaActual.length} fotografías. Todas de observaciones con identificación verificada (iNaturalist, grado investigación) o de la guía anterior, revisadas visualmente para esta edición; se han descartado las dudosas.</p>
      <div class="tarjetas">${galeriaActual.map((p, i) => `<article class="tarjeta"><button data-foto="${i}" style="border:0;padding:0;background:none" aria-label="Ampliar"><img class="img" loading="lazy" src="${p.t}" alt=""></button><div class="cuerpo small"><a href="#/especie/${p._e.id}"><b>${esc(titulo(p._e))}</b></a> <i>${esc(p._e.nombre)}</i><br>${esc(p.pie || "")}<br><span class="muted">© ${esc(p.autor || "")} · ${esc(p.licencia || "")}</span></div></article>`).join("")}</div>`;
    $$("[data-foto]").forEach((b) => (b.onclick = () => abrirVisor(+b.dataset.foto)));
  }
  function vistaInventario() {
    let q = "", ev = "", lim = 300;
    const todas = DB.registro.map((r) => ({ n: r.n, a: r.a, o: r.o, f: r.f, t: r.t, p: r.p, i: r.i, e: r.e, s: r.s, ficha: null }))
      .concat(ESP.map((e) => ({ n: e.nombre, a: e.autor, o: e.orden, f: e.familia, t: (e.registros || {}).n || 0, p: (e.registros || {}).pliegos || 0, i: null, e: (e.registros || {}).evidencia, s: e.sinonimos || [], ficha: e.id })))
      .sort((a, b) => a.n.localeCompare(b.n));
    todas.forEach((x) => (x._q = norm([x.n, x.f, x.o, ...(x.s || [])].join(" "))));
    app.innerHTML = `<h1>Inventario de especies con registros en Cataluña</h1>
      <p class="muted">${todas.length.toLocaleString("es")} especies (GBIF + iNaturalist, nombres según Catalogue of Life, consulta ${esc(DB.meta.inventario.fecha_consulta || "")}). Las que no tienen ficha no se evalúan: <b>no las consuma</b>.</p>
      <p><input class="q" type="search" placeholder="Buscar especie, familia u orden…" id="iq"></p>
      <p>Evidencia: <select id="iev"><option value="">Todas</option><option value="pliego">Con pliego de herbario</option><option value="confirmada">Con ficha y pliego</option><option value="observaciones">Solo observaciones</option><option value="escasa">Escasa (1–2 registros)</option></select> <span id="icuenta" class="muted"></span></p>
      <div class="tabla-scroll"><table class="tabla"><thead><tr><th>Especie</th><th>Orden · familia</th><th>GBIF</th><th>Pliegos</th><th>iNat</th><th>Evidencia</th></tr></thead><tbody id="itb"></tbody></table></div>
      <p><button class="btn" id="imas">Mostrar más</button></p>`;
    const pintar = () => {
      const t = norm(q).split(/\s+/).filter(Boolean);
      const r = todas.filter((x) => (!ev || x.e === ev) && t.every((w) => x._q.includes(w)));
      $("#icuenta").textContent = `${r.length.toLocaleString("es")} resultados`;
      $("#itb").innerHTML = r.slice(0, lim).map((x) => `<tr><td>${x.ficha ? `<a href="#/especie/${x.ficha}"><b><i>${esc(x.n)}</i></b></a>` : `<i>${esc(x.n)}</i>`} <span class="muted small">${esc(x.a || "")}</span>${x.s && x.s.length && !x.ficha ? `<div class="small muted">Registrada también como: <i>${esc(x.s.join("; "))}</i></div>` : ""}</td><td class="small">${esc(x.o)} · ${esc(x.f)}</td><td>${x.t}</td><td>${x.p}</td><td>${x.i ?? "—"}</td><td class="small">${esc(x.e || "")}</td></tr>`).join("");
      $("#imas").hidden = r.length <= lim;
    };
    $("#iq").oninput = (e) => { q = e.target.value; lim = 300; pintar(); };
    $("#iev").onchange = (e) => { ev = e.target.value; lim = 300; pintar(); };
    $("#imas").onclick = () => { lim += 500; pintar(); };
    pintar();
  }
  function vistaGuia(k) {
    const caps = [["seguridad", "Seguridad y normativa"], ["intoxicacion", "Intoxicaciones"], ["anatomia", "Partes de una seta"], ["buscar", "Cómo buscar"], ["metodo", "Método del catálogo"], ["glosario", "Glosario"]];
    app.innerHTML = `<div class="subnav">${caps.map(([c, t]) => `<a class="tog" href="#/guia/${c}" aria-pressed="${c === k}">${t}</a>`).join("")}</div>
      <article class="texto"><h1>${esc((caps.find(([c]) => c === k) || [k, k])[1])}</h1>${DB.textos[k] || "<p>Capítulo no disponible.</p>"}</article>`;
    // números del método
    app.innerHTML = app.innerHTML.replace("{{n_fichas}}", ESP.length).replace("{{n_registro}}", DB.registro.length.toLocaleString("es")).replace("{{fecha}}", DB.meta.inventario.fecha_consulta || "")
      .replace("{{n_inventario}}", (DB.registro.length + ESP.length).toLocaleString("es"))
      .replace("{{n_pliego}}", (DB.registro.filter((r) => r.e === "pliego").length + ESP.filter((e) => (e.registros || {}).evidencia === "confirmada").length).toLocaleString("es"))
      .replace("{{n_obs}}", (DB.registro.filter((r) => r.e === "observaciones").length + ESP.filter((e) => (e.registros || {}).evidencia === "observaciones").length).toLocaleString("es"))
      .replace("{{n_escasa}}", (DB.registro.filter((r) => r.e === "escasa").length + ESP.filter((e) => ["escasa", "bibliografia"].includes((e.registros || {}).evidencia)).length).toLocaleString("es"));
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
  function vistaCuaderno() {
    const C = DB.cuaderno;
    if (!C) { app.innerHTML = `<h1>Cuaderno de campo</h1><p class="muted">El cuaderno no está incluido en esta copia de la web.</p>`; return; }
    const pad = (n) => String(n).padStart(2, "0");
    galeriaActual = Array.from({ length: C.paginas }, (_, i) => ({ g: `cuaderno/p${pad(i + 1)}.jpg`, t: `cuaderno/t${pad(i + 1)}.jpg`, pie: `Página ${i + 1} de ${C.paginas}` }));
    const pag = (i) => `<button class="pag-c" data-foto="${i}" aria-label="Ver la página ${i + 1}"><img loading="lazy" src="${galeriaActual[i].t}" alt="Página ${i + 1}"><span>${i + 1}</span></button>`;
    const pliegos = [[0]];
    for (let i = 1; i < C.paginas - 1; i += 2) pliegos.push([i, i + 1]);
    pliegos.push([C.paginas - 1]);
    const mb = (x) => String(x).replace(".", ",");
    app.innerHTML = `<h1>Cuaderno de campo</h1>
      <p>Un librillo de <b>${C.paginas} páginas A5 en color</b> para llevar en la mochila: ${C.comestibles || 26} comestibles en fichas de una página con cuatro fotos y las especies con que se confunden, ${C.peligrosas || 20} peligrosas, las confusiones más peligrosas lado a lado, ${C.arboles || 8} árboles con foto del tronco, la hoja y el fruto, calendario y qué hacer ante una intoxicación. Se imprime en <b>${C.hojas} hojas A4</b>, se dobla por la mitad y se grapa.</p>
      <div class="descargas">
        <a class="btn prim" href="${esc(C.pdf_a4)}" target="_blank" rel="noopener">Descargar para imprimir en casa · A4 · ${mb(C.a4_mb)} MB</a>
        <a class="btn" href="${esc(C.pdf_a5)}" target="_blank" rel="noopener">PDF en páginas A5 · ${mb(C.a5_mb)} MB</a>
      </div>
      <details class="caja como-imprimir"><summary><b>Cómo imprimirlo y doblarlo</b></summary>
        <svg viewBox="0 0 640 150" role="img" aria-label="Imprimir a doble cara, doblar por la mitad y grapar">
          <g font-family="inherit" font-size="15" fill="currentColor">
            <rect x="20" y="30" width="150" height="100" rx="6" fill="#fff" stroke="#3f6136" stroke-width="3"/><line x1="95" y1="30" x2="95" y2="130" stroke="#bbb" stroke-dasharray="5 4"/>
            <text x="40" y="86" font-size="26" fill="#3f6136">48</text><text x="118" y="86" font-size="26" fill="#3f6136">1</text>
            <text x="20" y="20">1 · A4 a doble cara</text>
            <path d="M200 80h40m-10-8 10 8-10 8" stroke="#3f6136" stroke-width="3" fill="none"/>
            <path d="M270 40 L360 40 L360 130 L270 130 Z" fill="#fff" stroke="#3f6136" stroke-width="3"/><path d="M360 40 L400 55 L400 140 L360 130" fill="#e5f1e1" stroke="#3f6136" stroke-width="3"/>
            <text x="262" y="20">2 · Dobla todas juntas</text>
            <path d="M430 80h40m-10-8 10 8-10 8" stroke="#3f6136" stroke-width="3" fill="none"/>
            <rect x="500" y="35" width="90" height="100" rx="6" fill="#fff" stroke="#3f6136" stroke-width="3"/>
            <rect x="494" y="58" width="12" height="4" fill="#555"/><rect x="494" y="108" width="12" height="4" fill="#555"/>
            <text x="492" y="20">3 · Grapa el lomo</text>
          </g>
        </svg>
        <ol>
          <li>Descarga el PDF <b>para imprimir en casa</b> (A4). Imprime a <b>doble cara</b>, opción <b>«voltear por el borde corto»</b>, a <b>tamaño real (100 %)</b>, sin «ajustar a la página».</li>
          <li>Si tu impresora no imprime a doble cara: imprime primero las páginas impares del PDF, vuelve a meter las hojas por la otra cara (prueba antes con una) e imprime las pares.</li>
          <li>Pon las ${C.hojas} hojas en orden, dóblalas juntas por la mitad y grapa por el lomo con 2 grapas (una grapadora de brazo largo ayuda).</li>
          <li>Mejor en papel de 90–120 g. En una copistería puedes pedir un <b>librillo A5 grapado</b> con el PDF de páginas A5.</li>
        </ol>
      </details>
      <h2>Hojéalo</h2>
      <p class="muted small">Toca una página para verla en grande; con las flechas pasas a la siguiente.</p>
      <div class="pliegos">${pliegos.map((pl) => `<div class="pliego${pl.length === 1 ? " solo" : ""}">${pl.map(pag).join("")}</div>`).join("")}</div>`;
    $$("[data-foto]").forEach((b) => (b.onclick = () => abrirVisor(+b.dataset.foto)));
  }
  function vistaLibros() {
    const L = DB.libros || [], tit = { cuaderno: "Cuaderno de campo (48 páginas, para imprimir y doblar)", esencial: "Setas comestibles esenciales de Cataluña", catalogo: "Catálogo micológico de Cataluña · volumen 1" };
    const fila = (l) => `<li class="libro"><a class="btn prim" href="${esc(l.url)}" target="_blank" rel="noopener">Descargar</a><div><b>${esc(l.ed)}</b> <span class="muted">· ${l.pag ? l.pag + " págs. · " : ""}${String(l.mb).replace(".", ",")} MB</span>${l.uso ? `<br><span class="small">${esc(l.uso)}</span>` : ""}</div></li>`;
    app.innerHTML = `<h1>Libros en PDF</h1>
      <p>Los dos libros salen de la misma base de datos que esta web. Formato A5; para leer en el móvil, elija la edición <b>ligera</b>.</p>
      <p class="small">Para imprimir: A5 a doble cara sin cambiar el orden de las páginas (cada ficha de la guía esencial empieza en página par), papel mate de 100–115 g y encuadernación en espiral o cosida para que el libro se abra plano en el campo.</p>
      ${L.length ? ["cuaderno", "esencial", "catalogo"].filter((g) => L.some((l) => l.guia === g)).map((g) => `<h2>${tit[g]}</h2><ul class="libros">${L.filter((l) => l.guia === g).map(fila).join("")}</ul>`).join("") : `<p class="muted">Los PDF no están disponibles en esta copia de la web.</p>`}
      <p class="small muted">Muchas fotografías tienen licencia CC BY-NC: los PDF son para uso personal o sin ánimo de lucro.</p>`;
  }
  function vistaNoEncontrada() { app.innerHTML = `<h1>No encontrado</h1><p><a href="#/">Volver al buscador</a></p>`; }

  // ---------------- Router ----------------
  function render() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [v, a] = [h.split("/")[0], h.split("/").slice(1).join("/")];
    document.title = "Setas de Cataluña";
    $$(".nav a").forEach((x) => x.classList.toggle("activo", x.getAttribute("href") === "#/" + (v ? v + (v === "guia" ? "/seguridad" : "") : "")));
    $(".nav").classList.remove("abierta");
    ({ "": vistaBuscador, especie: () => vistaFicha(a), comparar: () => vistaComparar(a), rasgos: vistaRasgos, arboles: vistaArboles, arbol: () => vistaArbol(a), calendario: vistaCalendario, habitats: vistaHabitats, taxonomia: vistaTaxonomia, galeria: () => vistaGaleria(a), inventario: vistaInventario, guia: () => vistaGuia(a || "seguridad"), fuentes: vistaFuentes, calidad: vistaCalidad, libros: vistaLibros, cuaderno: vistaCuaderno }[v] || vistaNoEncontrada)();
    window.scrollTo(0, 0);
  }
  if (DB.enlaces && DB.enlaces.quiz) $(".nav").insertAdjacentHTML("beforeend", `<a href="${esc(DB.enlaces.quiz)}">Quiz 🍄</a>`);
  $(".menu-btn").onclick = (ev) => { const n = $(".nav"); n.classList.toggle("abierta"); ev.currentTarget.setAttribute("aria-expanded", n.classList.contains("abierta")); };
  $("#pie-meta").textContent = `Edición ${DB.meta.version} · datos generados el ${DB.meta.generado} · ${ESP.length} fichas · ${DB.registro.length.toLocaleString("es")} especies más en el inventario.`;
  window.addEventListener("hashchange", render);
  render();
})();
