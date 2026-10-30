/* Mapa interactivo (#/mapa y #/mapa/<ids>): el «Mapa interactiu» de la antigua web Cistella Segura.
   · «Qué sale en una zona»: toque un punto (o «¿Dónde estoy?») y vea las setas observadas a 5, 10 o 20 km.
   · «Dónde sale cada seta»: hasta cuatro setas a la vez, cada una de un color.
   Rutas: #/mapa (último modo usado) · #/mapa/rovello,cep (modo seta; acepta ids catalanes o de la guía)
          #/mapa/zona:montseny (modo zona centrado en una zona de ZONES).
   Datos (datos/cistella.js): MAPA (contorno, puntos redondeados y recuentos) y MAPA_INT (puntos con un decimal,
   pueblos, parques y proyección). Expone también CS.miniMapa(ids, opciones): un mapa pequeño y estático en SVG. */
(function () {
  "use strict";
  const CS = window.CS;
  if (!CS) return;
  window.VISTAS_EXTRA = window.VISTAS_EXTRA || {};

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = (v) => Math.round(v * 10) / 10;
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

  const HAY_MAPA = typeof MAPA !== "undefined" && !!MAPA && MAPA.w > 0 && MAPA.h > 0 && Array.isArray(MAPA.prov);
  const HAY = HAY_MAPA && typeof MAPA_INT !== "undefined" && !!MAPA_INT && !!MAPA_INT.pts && Array.isArray(MAPA_INT.proj);
  const W = HAY_MAPA ? MAPA.w : 0, H = HAY_MAPA ? MAPA.h : 0;
  const KM = 111.2 / 92;                     // km por unidad del mapa (92 unidades por grado de latitud)
  const COL = ["var(--mapa-c1)", "var(--mapa-c2)", "var(--mapa-c3)", "var(--mapa-c4)"];
  const MAX = 4;                             // setas a la vez en el modo seta
  const RADIOS = [5, 10, 20];
  const BOL = typeof BOLETS !== "undefined" ? BOLETS : [];
  const PTS = HAY ? MAPA_INT.pts : {};

  // ids: los de la antigua web («rovello»); si llega uno de la guía («boletus-edulis») se traduce con CS.CAT2ES.
  const ES2CAT = {};
  Object.keys(CS.CAT2ES || {}).forEach((c) => { const e = CS.CAT2ES[c]; if (!ES2CAT[e]) ES2CAT[e] = c; });
  const aCat = (id) => { id = String(id || "").trim().toLowerCase(); return CS.BYCAT[id] ? id : ES2CAT[id] || null; };
  const listaIds = (x) => [...new Set((Array.isArray(x) ? x : String(x || "").split(",")).map(aCat).filter(Boolean))];

  // estado de la guía (comestible · condicionada · toxica · mortal · no_comestible…) y su color
  const EST = {};
  BOL.forEach((b) => (EST[b.id] = CS.estado(b.id)));
  const color = (id) => CS.COLOR[EST[id]] || "var(--nulo)";
  const grupo = (id) => (CS.comestible(id) ? "ok" : EST[id] === "toxica" || EST[id] === "mortal" ? "ko" : "otra");
  // orden de pintado en el modo zona: las peligrosas encima, para que se vean
  const CAPAS = ["otra", "comestible", "condicionada", "toxica", "mortal"];
  const capa = (id) => (CAPAS.includes(EST[id]) ? EST[id] : "otra");
  const COLOR_CAPA = { otra: "var(--nulo)", comestible: CS.COLOR.comestible, condicionada: CS.COLOR.condicionada, toxica: CS.COLOR.toxica, mortal: CS.COLOR.mortal };

  // dos setas pueden compartir nombre (p. ej. «Apagallums»): entonces se añade el científico
  const REPES = {};
  BOL.forEach((b) => { const n = CS.nombre(b.id); REPES[n] = (REPES[n] || 0) + 1; });
  const nombreUnico = (id) => { const n = CS.nombre(id); return REPES[n] > 1 ? `${n} (${CS.cientifico(id)})` : n; };

  const nObs = (id) => (HAY_MAPA && MAPA.n && MAPA.n[id] != null ? MAPA.n[id] : (PTS[id] || []).length / 2);
  // meses: los de la ficha de la guía; si no tiene, los de la antigua web
  function mesesDe(id) {
    const e = CS.especie(id), m = e && e.fenologia && e.fenologia.meses;
    return m && m.length ? m : (CS.BYCAT[id] || {}).mesos || [];
  }
  function textoMeses(m) {
    const s = [...new Set(m)].filter((x) => x >= 1 && x <= 12).sort((a, b) => a - b), M = CS.MES_CORTO, tramos = [];
    if (!s.length) return "";
    if (s.length === 12) return "todo el año";
    for (const v of s) { const u = tramos[tramos.length - 1]; if (u && v === u[1] + 1) u[1] = v; else tramos.push([v, v]); }
    if (tramos.length > 1 && tramos[0][0] === 1 && tramos[tramos.length - 1][1] === 12) tramos[tramos.length - 1][1] = tramos.shift()[1]; // dic–ene
    const t = tramos.map(([a, b]) => (a === b ? M[a - 1] : `${M[a - 1]}–${M[b - 1]}`));
    return t.length > 1 ? t.slice(0, -1).join(", ") + " y " + t[t.length - 1] : t[0];
  }

  // ---------------- geometría ----------------
  function proj(lon, lat) { const [L0, L1, S, PAD, K] = MAPA_INT.proj; return [(lon - L0) * K * S + PAD, (L1 - lat) * S + PAD]; }
  // contorno de Cataluña como polígonos [x0, y0, x1, y1, …] (para saber si la ubicación cae dentro)
  const POLIS = HAY_MAPA ? MAPA.prov.flatMap((d) => String(d).split(/(?=M)/).map((s) => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number)).filter((p) => p.length >= 6)) : [];
  function enPoligono(p, x, y) {
    let dentro = false;
    for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
    }
    return dentro;
  }
  function distSegmento(x, y, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? clamp(((x - ax) * dx + (y - ay) * dy) / l, 0, 1) : 0;
    return Math.hypot(x - ax - t * dx, y - ay - t * dy);
  }
  function enCatalunya(x, y) {
    if (!POLIS.length) return x >= 0 && y >= 0 && x <= W && y <= H;
    if (POLIS.some((p) => enPoligono(p, x, y))) return true;
    let d = Infinity;   // margen de 3 km: el contorno está simplificado y la costa queda justo en el borde
    for (const p of POLIS) for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) d = Math.min(d, distSegmento(x, y, p[j], p[j + 1], p[i], p[i + 1]));
    return d * KM <= 3;
  }
  function cercano(z, lista, maxKm) {
    let mejor = null, d = Infinity;
    for (const [x, y, t] of lista || []) { const k = Math.hypot(x - z[0], y - z[1]); if (k < d) { d = k; mejor = t; } }
    return d * KM < maxKm ? mejor : null;
  }

  // ---------------- estado (se conserva mientras la página esté abierta) ----------------
  const S = { modo: "zona", sel: ["rovello"], k: 1, x: 0, y: 0, pueblos: true, parques: true, R: 10, zona: null, t: 0 };
  let cargado = false, instancia = 0, G = null, E = {};
  function cargar() {
    const z = G.store.get("mapa-zona", null);
    S.zona = Array.isArray(z) && z.length === 2 && z.every(Number.isFinite) && z[0] >= 0 && z[0] <= W && z[1] >= 0 && z[1] <= H ? z : null;
    const r = G.store.get("mapa-radio", 10);
    S.R = RADIOS.includes(r) ? r : 10;
    S.modo = G.store.get("mapa-modo", "zona") === "seta" ? "seta" : "zona";
    const sel = listaIds(G.store.get("mapa-setas", [])).slice(0, MAX);
    if (sel.length) S.sel = sel;
  }
  const guardarSel = () => G.store.set("mapa-setas", S.sel);
  const hashModo = () => (S.modo === "seta" ? "#/mapa/" + S.sel.join(",") : "#/mapa");
  // cambia la dirección sin que el router vuelva a pintar la vista
  function ponerHash() { const h = hashModo(); if (decodeURIComponent(location.hash) !== h) history.replaceState(null, "", h); }

  function vista() {
    const w = W / S.k, h = H / S.k;
    S.x = clamp(S.x, 0, W - w); S.y = clamp(S.y, 0, H - h);
    return [S.x, S.y, w, h];
  }
  function zoom(f, cx, cy) {
    const [x, y] = vista(), k2 = clamp(S.k * f, 1, 12), s2 = S.k / k2;
    S.x = cx - (cx - x) * s2; S.y = cy - (cy - y) * s2; S.k = k2;
  }
  // centra la zona y se acerca para que el círculo ocupe casi medio mapa
  function enfocar() {
    if (!S.zona) return;
    S.k = clamp((W * 0.45) / ((2 * S.R) / KM), 1, 9);
    S.x = S.zona[0] - W / S.k / 2; S.y = S.zona[1] - H / S.k / 2;
  }
  function punto(ev) {
    const r = E.svg.getBoundingClientRect(), [x, y, w, h] = vista();
    return [x + ((ev.clientX - r.left) / r.width) * w, y + ((ev.clientY - r.top) / r.height) * h];
  }
  const vivo = () => !!(E.svg && E.svg.isConnected);

  // ---------------- pintado del mapa ----------------
  const circulos = (p, r) => { let g = ""; for (let i = 0; i < p.length; i += 2) g += `<circle cx="${p[i]}" cy="${p[i + 1]}" r="${r}"/>`; return g; };
  function capaZona(r, upp) {
    const z = S.zona, R = S.R / KM, fg = {}, rf = r3(r), rb = r3(r * 0.55), out = [];
    let bg = "";
    for (const id in PTS) {
      if (!CS.BYCAT[id]) continue;
      const p = PTS[id], c = capa(id);
      for (let i = 0; i < p.length; i += 2) {
        if (z && Math.hypot(p[i] - z[0], p[i + 1] - z[1]) <= R) fg[c] = (fg[c] || "") + `<circle cx="${p[i]}" cy="${p[i + 1]}" r="${rf}"/>`;
        else bg += `<circle cx="${p[i]}" cy="${p[i + 1]}" r="${rb}"/>`;
      }
    }
    out.push(`<g fill="currentColor" fill-opacity=".1">${bg}</g>`);
    if (z) {
      out.push(`<circle cx="${z[0]}" cy="${z[1]}" r="${r3(R)}" style="fill:var(--accent);stroke:var(--accent)" fill-opacity=".08" stroke-width="${r3(2 * upp)}" stroke-dasharray="${r3(6 * upp)} ${r3(4 * upp)}"/>`);
      for (const c of CAPAS) if (fg[c]) out.push(`<g style="fill:${COLOR_CAPA[c]};stroke:var(--panel)" stroke-width="${r3(0.8 * upp)}">${fg[c]}</g>`);
      out.push(`<circle cx="${z[0]}" cy="${z[1]}" r="${r3(4.5 * upp)}" style="fill:var(--accent);stroke:var(--panel)" stroke-width="${r3(1.6 * upp)}"/>`);
    }
    return out.join("");
  }
  // etiquetas de tamaño fijo en pantalla, colocadas sin pisarse (primero capitales, luego parques y pueblos)
  function etiquetas(w, h, upp) {
    const out = [], x0 = S.x, y0 = S.y;
    const ocupado = [[x0 + w - 56 * upp, y0, x0 + w, y0 + 150 * upp]];   // la zona de los botones + − ⤢
    const cabe = (b) => b[0] >= x0 && b[2] <= x0 + w && b[1] >= y0 && b[3] <= y0 + h && !ocupado.some((o) => !(b[2] < o[0] || b[0] > o[2] || b[3] < o[1] || b[1] > o[3]));
    const items = [];
    (MAPA_INT.pobles || []).forEach(([x, y, t, n]) => {
      if (n === 0 || (S.pueblos && ((n === 1 && S.k >= 1.5) || (n === 2 && S.k >= 2.8)))) items.push({ x, y, t, tipo: n === 0 ? "cap" : "vila", pri: n === 0 ? 0 : n === 1 ? 2 : 3 });
    });
    if (S.parques && S.k >= 1.3) (MAPA_INT.parcs || []).forEach(([x, y, t]) => items.push({ x, y, t, tipo: "parque", pri: 1 }));
    items.sort((a, b) => a.pri - b.pri);
    for (const it of items) {
      const fs = (it.tipo === "cap" ? 13 : 11.5) * upp, wd = it.t.length * fs * 0.54;
      if (it.tipo !== "parque") ocupado.push([it.x - 3 * upp, it.y - 3 * upp, it.x + 3 * upp, it.y + 3 * upp]);
      const sitios = it.tipo === "parque" ? [[0, fs * 0.35, "middle"]] : [[5 * upp, fs * 0.35, "start"], [-5 * upp, fs * 0.35, "end"], [0, -6 * upp, "middle"], [0, fs + 4 * upp, "middle"]];
      for (const [dx, dy, a] of sitios) {
        const tx = it.x + dx, ty = it.y + dy, bx = a === "start" ? tx : a === "end" ? tx - wd : tx - wd / 2, caja = [bx, ty - fs * 0.8, bx + wd, ty + fs * 0.25];
        if (!cabe(caja)) continue;
        ocupado.push(caja);
        const marca = it.tipo === "cap" ? `<circle cx="${it.x}" cy="${it.y}" r="${r3(3.2 * upp)}" fill="currentColor"/>`
          : it.tipo === "vila" ? `<circle cx="${it.x}" cy="${it.y}" r="${r3(2.4 * upp)}" class="mapa-vila" stroke-width="${r3(1.3 * upp)}"/>` : "";
        out.push(marca + `<text x="${r3(tx)}" y="${r3(ty)}" text-anchor="${a}" font-size="${r3(fs)}" class="mapa-et ${it.tipo}" stroke-width="${r3(3 * upp)}">${esc(it.t)}</text>`);
        break;
      }
    }
    return out.join("");
  }
  function pintarMapa() {
    if (!vivo()) return;
    const svg = E.svg, [x, y, w, h] = vista(), upp = w / Math.max(1, svg.clientWidth || 340);   // unidades del mapa por píxel
    svg.setAttribute("viewBox", `${r3(x)} ${r3(y)} ${r3(w)} ${r3(h)}`);
    const r = 3.3 * upp * Math.min(1.3, Math.max(1, Math.sqrt(S.k) * 0.7)), out = [];
    out.push(MAPA.prov.map((d) => `<path d="${d}" class="mapa-tierra" stroke-width="${r3(1.1 * upp)}"/>`).join(""));
    // modo seta: primero las que tienen más puntos, para que las escasas queden encima y se vean
    if (S.modo === "seta") S.sel.map((id, c) => [id, c]).sort((a, b) => (PTS[b[0]] || []).length - (PTS[a[0]] || []).length)
      .forEach(([id, c]) => out.push(`<g style="fill:${COL[c]};stroke:var(--panel)" fill-opacity=".85" stroke-width="${r3(0.8 * upp)}">${circulos(PTS[id] || [], r3(r))}</g>`));
    else out.push(capaZona(r, upp));
    out.push(etiquetas(w, h, upp));
    svg.innerHTML = out.join("");
  }
  // durante el arrastre solo se mueve la vista; el resto se repinta al parar
  function rapido() {
    if (!vivo()) return;
    const [x, y, w, h] = vista();
    E.svg.setAttribute("viewBox", `${r3(x)} ${r3(y)} ${r3(w)} ${r3(h)}`);
    clearTimeout(S.t); S.t = setTimeout(pintarMapa, 140);
  }
  function alRedimensionar() {
    if (!vivo()) { window.removeEventListener("resize", alRedimensionar); return; }   // la vista ya no está en pantalla
    clearTimeout(S.t); S.t = setTimeout(pintarMapa, 150);
  }

  // ---------------- panel: lista de la zona ----------------
  function filasZona() {
    const z = S.zona, R = S.R / KM, filas = [];
    for (const id in PTS) {
      if (!CS.BYCAT[id]) continue;
      const p = PTS[id]; let n = 0;
      for (let i = 0; i < p.length; i += 2) if (Math.hypot(p[i] - z[0], p[i + 1] - z[1]) <= R) n++;
      if (n) filas.push([id, n]);
    }
    return filas.sort((a, b) => b[1] - a[1] || CS.nombre(a[0]).localeCompare(CS.nombre(b[0]), "es"));
  }
  function pintarLista() {
    const caja = E.lista, aviso = E.aviso, z = S.zona;
    if (!z) {
      aviso.hidden = true; E.estado.textContent = "";
      caja.innerHTML = `<p class="mapa-pista">Toque el mapa donde quiera ir a buscar setas, o pulse «¿Dónde estoy?». Verá las que se han encontrado a ${S.R} km a la redonda.</p>`;
      return;
    }
    const filas = filasZona(), cerca = cercano(z, MAPA_INT.pobles, 25), parque = cercano(z, MAPA_INT.parcs, 8), mes = new Date().getMonth() + 1;
    const total = filas.reduce((a, f) => a + f[1], 0);
    const ahora = (id) => mesesDe(id).includes(mes);
    const item = ([id, n]) => {
      const f = CS.foto(id), href = CS.href(id), ara = ahora(id), temp = textoMeses(mesesDe(id));
      const dentro = `${f ? `<img src="${esc(f)}" alt="" loading="lazy" width="56" height="56">` : `<span class="mapa-sinfoto"></span>`}
        <span class="mapa-tx"><b>${esc(CS.nombre(id))}</b><i>${esc(CS.cientifico(id))}</i>${G.badge(EST[id])}<small class="mapa-cuando${ara ? " ara" : ""}">${ara ? "En temporada este mes" : temp ? "Temporada: " + esc(temp) : ""}</small></span>
        <span class="mapa-n" title="Observaciones en la zona">${n}<span class="mapa-sr"> ${n === 1 ? "observación" : "observaciones"} en la zona</span></span>`;
      return `<li style="--c:${color(id)}">${href ? `<a href="${href}">${dentro}</a>` : `<div>${dentro}</div>`}</li>`;
    };
    const bloque = (titulo, cls, lista) => {
      if (!lista.length) return "";
      const nAra = lista.filter(([id]) => ahora(id)).length;
      return `<section class="mapa-grupo ${cls}"><h3>${titulo} <small>${plural(lista.length, "seta", "setas")}${nAra ? ` · ${nAra} en temporada este mes` : ""}</small></h3><ul class="mapa-zl">${lista.map(item).join("")}</ul></section>`;
    };
    const titulo = parque ? esc(parque) : cerca ? `Alrededores de ${esc(cerca)}` : "En esta zona";
    caja.innerHTML = `<div class="mapa-zcab"><b>${titulo}</b><span>${parque && cerca ? `cerca de ${esc(cerca)} · ` : ""}${S.R} km a la redonda · ${plural(filas.length, "seta", "setas")} · ${plural(total, "observación", "observaciones")}</span></div>`
      + (filas.length
        ? bloque("Comestibles", "ok", filas.filter(([id]) => grupo(id) === "ok")) + bloque("Cuidado: tóxicas y mortales", "ko", filas.filter(([id]) => grupo(id) === "ko")) + bloque("Otras: sin interés o no comestibles", "otra", filas.filter(([id]) => grupo(id) === "otra"))
        : `<p class="mapa-pista">No hay ninguna observación confirmada a ${S.R} km. Pruebe con ${S.R < 20 ? "un radio mayor" : "otra zona"}.</p>`)
      + `<p class="mapa-nota">Son observaciones confirmadas en iNaturalist, de más a menos. Que una seta no aparezca no quiere decir que no la haya: quizá nadie la ha fotografiado allí. El número indica cuántas veces se ha encontrado en la zona. Ninguna de estas listas sirve para identificar una seta.</p>`;
    aviso.hidden = false;
    aviso.textContent = filas.length ? `${plural(filas.length, "seta", "setas")} a ${S.R} km · vea la lista ↓` : `Ninguna observación a ${S.R} km`;
    E.estado.textContent = `${parque || cerca || "Zona elegida"}: ${plural(filas.length, "seta", "setas")} a ${S.R} km.`;
  }

  // ---------------- panel: setas elegidas ----------------
  function pintarLeyenda() {
    E.chips.innerHTML = BOL.filter((b) => b.classic).map((b) => {
      const c = S.sel.indexOf(b.id);
      return `<button type="button" class="mapa-chip" data-id="${esc(b.id)}" aria-pressed="${c >= 0}"${c >= 0 ? ` style="--c:${COL[c]}"` : ""}>${esc(nombreUnico(b.id))}</button>`;
    }).join("");
    const libres = BOL.filter((b) => !b.classic && !S.sel.includes(b.id)).sort((a, b) => CS.nombre(a.id).localeCompare(CS.nombre(b.id), "es"));
    const opt = (t, g) => { const l = libres.filter((b) => grupo(b.id) === g); return l.length ? `<optgroup label="${t}">${l.map((b) => `<option value="${esc(b.id)}">${esc(nombreUnico(b.id))}</option>`).join("")}</optgroup>` : ""; };
    E.sel.innerHTML = `<option value="">${S.sel.length >= MAX ? "Ya hay cuatro" : "Elija…"}</option>` + opt("Comestibles", "ok") + opt("Tóxicas y mortales", "ko") + opt("Otras", "otra");
    E.sel.disabled = S.sel.length >= MAX;
    E.leyenda.innerHTML = S.sel.map((id, c) => {
      const n = nObs(id), f = CS.foto(id), href = CS.href(id);
      return `<div class="mapa-clave"><span class="mapa-punto" style="background:${COL[c]}"></span>${f ? `<img src="${esc(f)}" alt="" loading="lazy" width="40" height="40">` : ""}
        <span class="mapa-clave-tx"><b>${esc(nombreUnico(id))}</b><small>${n ? plural(n, "observación", "observaciones") + " en Cataluña" : "Sin observaciones confirmadas en Cataluña: guíese por el hábitat de la ficha"}</small></span>
        ${href ? `<a href="${href}">Ficha</a>` : ""}${S.sel.length > 1 ? `<button type="button" data-quitar="${esc(id)}" aria-label="Quitar ${esc(CS.nombre(id))}" title="Quitar">✕</button>` : ""}</div>`;
    }).join("") + (S.sel.length >= MAX ? `<p class="small muted">Máximo cuatro setas a la vez: quite una para añadir otra.</p>` : "");
    E.svg.setAttribute("aria-label", `Mapa de Cataluña con las observaciones de ${S.sel.map(CS.nombre).join(", ")}. Use las flechas para moverse y + o − para acercarse.`);
  }
  function cambiarSel(lista) {
    S.sel = listaIds(lista).slice(0, MAX);
    if (!S.sel.length) S.sel = ["rovello"];
    guardarSel(); ponerHash(); pintarMapa(); pintarLeyenda();
  }

  // ---------------- modo ----------------
  function aplicarModo() {
    const zona = S.modo === "zona";
    E.modo.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.m === S.modo)));
    E.zonaUi.hidden = E.lista.hidden = E.leyZona.hidden = !zona;
    E.chips.hidden = E.setaUi.hidden = zona;
    E.escena.classList.toggle("es-zona", zona);
    if (zona) E.svg.setAttribute("aria-label", "Mapa de Cataluña. Toque un punto para ver las setas observadas alrededor. Con el teclado: flechas para moverse, + y − para acercarse, Intro para elegir el centro.");
    else E.aviso.hidden = true;
  }
  function ponerModo(m) {
    S.modo = m === "seta" ? "seta" : "zona";
    G.store.set("mapa-modo", S.modo);
    if (S.modo === "zona" && S.zona && S.k === 1) enfocar();
    ponerHash(); aplicarModo(); pintarMapa();
    if (S.modo === "zona") pintarLista(); else pintarLeyenda();
  }
  function ponerZona(x, y) {
    S.zona = [r1(x), r1(y)];
    G.store.set("mapa-zona", S.zona);
    enfocar(); pintarMapa(); pintarLista();
  }

  // ---------------- vista ----------------
  window.VISTAS_EXTRA.mapa = function (arg, guia) {
    G = guia;
    const app = G.app;
    document.title = "Mapa · Cistella Segura";
    if (!HAY) {
      app.innerHTML = `<h1>Dónde salen las setas</h1><div class="caja">El mapa no está disponible en esta copia de la web: faltan los datos del contorno de Cataluña o de las observaciones.</div>`;
      return;
    }
    if (!cargado) { cargar(); cargado = true; }
    const yo = ++instancia;

    // argumento de la ruta
    arg = String(arg || "").trim();
    const mz = arg.match(/^zona[:/](.+)$/i);
    if (mz) {
      const z = (typeof ZONES !== "undefined" ? ZONES : []).find((r) => r[0] === mz[1].trim().toLowerCase());
      if (z) { const [x, y] = proj(z[4], z[3]); S.zona = [r1(x), r1(y)]; G.store.set("mapa-zona", S.zona); S.k = 1; }
      S.modo = "zona";
    } else if (arg) {
      const sel = listaIds(arg).slice(0, MAX);
      // otra selección (p. ej. desde una ficha): mapa entero; la misma (volver atrás): se conserva el zoom
      if (S.modo !== "seta" || (sel.length && sel.join() !== S.sel.join())) { S.k = 1; S.x = S.y = 0; }
      S.modo = "seta";
      if (sel.length) { S.sel = sel; guardarSel(); }
    }
    G.store.set("mapa-modo", S.modo);
    ponerHash();
    if (S.modo === "zona" && S.zona && S.k === 1) enfocar();

    app.innerHTML = `<div class="mapa-vista">
      <h1>Dónde salen las setas</h1>
      <p class="muted mapa-entrada">Toque una zona del mapa para ver qué setas se han encontrado alrededor, o elija una seta para ver dónde sale. Cada punto es una observación confirmada en iNaturalist.</p>
      <div class="mapa-modo" role="group" aria-label="Qué quiere ver">
        <button type="button" data-m="zona" aria-pressed="false">Qué sale en una zona</button>
        <button type="button" data-m="seta" aria-pressed="false">Dónde sale cada seta</button>
      </div>
      <div class="mapa-cuerpo">
        <div class="mapa-izq">
          <div class="mapa-zona-ui">
            <div class="mapa-fila">
              <button type="button" class="btn prim mapa-geo">◎ ¿Dónde estoy?</button>
              <div class="mapa-radios" role="group" aria-label="Distancia alrededor del punto">
                ${RADIOS.map((r) => `<button type="button" class="tog" data-r="${r}" aria-pressed="${S.R === r}">${r} km</button>`).join("")}
              </div>
            </div>
            <p class="mapa-geo-msg small muted" aria-live="polite"></p>
          </div>
          <div class="mapa-chips" role="group" aria-label="Las más buscadas"></div>
          <div class="mapa-escena" style="--mapa-r:${r3(W / H)}">
            <svg class="mapa-svg" viewBox="0 0 ${W} ${H}" tabindex="0" role="img" aria-label="Mapa de Cataluña"></svg>
            <span class="mapa-mira" aria-hidden="true"></span>
            <div class="mapa-ctrl"><button type="button" data-z="in" aria-label="Acercar" title="Acercar">+</button><button type="button" data-z="out" aria-label="Alejar" title="Alejar">−</button><button type="button" data-z="reset" aria-label="Ver todo el mapa" title="Ver todo el mapa">⤢</button></div>
            <button type="button" class="mapa-aviso" hidden></button>
          </div>
          <div class="mapa-ley-zona small">
            <span style="--c:var(--ok)">Comestible</span><span style="--c:var(--cond)">Condicionada</span><span style="--c:var(--tox)">Tóxica</span><span style="--c:var(--mortal)">Mortal</span><span style="--c:var(--nulo)">Otras</span><span class="fuera">Fuera del radio</span>
          </div>
          <div class="mapa-opts small">
            <label><input type="checkbox" data-capa="pueblos"${S.pueblos ? " checked" : ""}> Pueblos</label>
            <label><input type="checkbox" data-capa="parques"${S.parques ? " checked" : ""}> Parques naturales</label>
            <span>Arrastre para moverse · pellizque, use la rueda o + y − para acercarse</span>
          </div>
        </div>
        <div class="mapa-der">
          <p class="mapa-sr" aria-live="polite"></p>
          <div class="mapa-lista"></div>
          <div class="mapa-seta-ui">
            <div class="mapa-leyenda" aria-live="polite"></div>
            <label class="mapa-mas"><span>Añadir otra seta</span><select></select></label>
          </div>
        </div>
      </div>
    </div>`;
    const $ = (s) => app.querySelector(s);
    E = { svg: $(".mapa-svg"), escena: $(".mapa-escena"), modo: $(".mapa-modo"), zonaUi: $(".mapa-zona-ui"), geo: $(".mapa-geo"), geoMsg: $(".mapa-geo-msg"),
      radios: $(".mapa-radios"), chips: $(".mapa-chips"), aviso: $(".mapa-aviso"), lista: $(".mapa-lista"), setaUi: $(".mapa-seta-ui"), leyenda: $(".mapa-leyenda"),
      sel: $(".mapa-mas select"), leyZona: $(".mapa-ley-zona"), estado: $(".mapa-sr"), ctrl: $(".mapa-ctrl"), opts: $(".mapa-opts") };
    const svg = E.svg;

    // arrastrar, pellizcar y tocar
    const ptr = new Map(); let pinza = null, toque = null;
    svg.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { svg.setPointerCapture(e.pointerId); } catch (_) { /* sin captura */ }
      ptr.set(e.pointerId, [e.clientX, e.clientY]); pinza = null;
      toque = ptr.size === 1 ? [e.clientX, e.clientY, Date.now()] : null;
    });
    svg.addEventListener("pointermove", (e) => {
      if (!ptr.has(e.pointerId)) return;
      const antes = ptr.get(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]);
      if (toque && Math.hypot(e.clientX - toque[0], e.clientY - toque[1]) > 7) toque = null;
      if (ptr.size === 1) {
        const upx = vista()[2] / Math.max(1, svg.getBoundingClientRect().width);
        S.x -= (e.clientX - antes[0]) * upx; S.y -= (e.clientY - antes[1]) * upx; rapido();
        return;
      }
      const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinza) { const m = punto({ clientX: (a[0] + b[0]) / 2, clientY: (a[1] + b[1]) / 2 }); zoom(d / pinza, m[0], m[1]); rapido(); }
      pinza = d;
    });
    const soltar = (e) => {
      if (!ptr.has(e.pointerId)) return;
      ptr.delete(e.pointerId); pinza = null;
      if (!ptr.size && toque && S.modo === "zona" && e.type === "pointerup" && Date.now() - toque[2] < 600) {
        const [cx, cy] = punto(e); toque = null; E.geoMsg.textContent = ""; ponerZona(cx, cy); return;
      }
      if (!ptr.size) pintarMapa();
    };
    svg.addEventListener("pointerup", soltar);
    svg.addEventListener("pointercancel", soltar);
    svg.addEventListener("wheel", (e) => {
      if (S.k <= 1 && e.deltaY > 0) return;           // ya está todo el mapa: deja desplazar la página
      e.preventDefault();
      const [cx, cy] = punto(e);
      zoom(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016)), cx, cy); rapido();
    }, { passive: false });
    svg.addEventListener("dblclick", (e) => { if (S.modo === "zona") return; const [cx, cy] = punto(e); zoom(2, cx, cy); pintarMapa(); });
    svg.addEventListener("keydown", (e) => {
      const [x, y, w, h] = vista();
      switch (e.key) {
        case "ArrowLeft": S.x -= w / 8; break;
        case "ArrowRight": S.x += w / 8; break;
        case "ArrowUp": S.y -= h / 8; break;
        case "ArrowDown": S.y += h / 8; break;
        case "+": case "=": zoom(1.5, x + w / 2, y + h / 2); break;
        case "-": case "_": zoom(1 / 1.5, x + w / 2, y + h / 2); break;
        case "0": S.k = 1; S.x = S.y = 0; break;
        case "Enter": case " ":
          if (S.modo !== "zona") return;
          e.preventDefault(); ponerZona(x + w / 2, y + h / 2); return;
        default: return;
      }
      e.preventDefault(); pintarMapa();
    });

    E.ctrl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-z]"); if (!b) return;
      const [x, y, w, h] = vista();
      if (b.dataset.z === "reset") { S.k = 1; S.x = S.y = 0; } else zoom(b.dataset.z === "in" ? 1.7 : 1 / 1.7, x + w / 2, y + h / 2);
      pintarMapa();
    });
    E.modo.addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b && b.dataset.m !== S.modo) ponerModo(b.dataset.m); });
    E.radios.addEventListener("click", (e) => {
      const b = e.target.closest("[data-r]"); if (!b) return;
      S.R = Number(b.dataset.r); G.store.set("mapa-radio", S.R);
      E.radios.querySelectorAll("[data-r]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      enfocar(); pintarMapa(); pintarLista();
    });
    E.aviso.addEventListener("click", () => E.lista.scrollIntoView({ behavior: "smooth", block: "start" }));
    E.geo.addEventListener("click", () => {
      const msg = E.geoMsg;
      if (!navigator.geolocation) { msg.textContent = "Este navegador no puede dar la ubicación. Toque el mapa para elegir una zona."; return; }
      msg.textContent = "Buscando dónde está… La ubicación no sale de su dispositivo.";
      E.geo.disabled = true;
      navigator.geolocation.getCurrentPosition((pos) => {
        if (yo !== instancia || !vivo()) return;         // ya se ha salido del mapa
        E.geo.disabled = false;
        const [x, y] = proj(pos.coords.longitude, pos.coords.latitude);
        if (!enCatalunya(x, y)) { msg.textContent = "Parece que ahora no está en Cataluña. Toque el mapa para elegir una zona."; return; }
        msg.textContent = "";
        if (S.modo !== "zona") ponerModo("zona");
        ponerZona(x, y);
      }, (err) => {
        if (yo !== instancia || !vivo()) return;
        E.geo.disabled = false;
        msg.textContent = err && err.code === 1
          ? "No ha dado permiso para conocer su ubicación. Puede permitirlo en el navegador o tocar el mapa para elegir una zona."
          : "No se ha podido saber dónde está. Toque el mapa para elegir una zona.";
      }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
    });
    E.chips.addEventListener("click", (e) => {
      const c = e.target.closest(".mapa-chip"); if (!c) return;
      const id = c.dataset.id;
      if (S.sel.includes(id)) { if (S.sel.length > 1) cambiarSel(S.sel.filter((x) => x !== id)); }
      else if (S.sel.length < MAX) cambiarSel([...S.sel, id]);
    });
    E.sel.addEventListener("change", () => { if (E.sel.value && S.sel.length < MAX) cambiarSel([...S.sel, E.sel.value]); });
    E.leyenda.addEventListener("click", (e) => { const b = e.target.closest("[data-quitar]"); if (b) cambiarSel(S.sel.filter((x) => x !== b.dataset.quitar)); });
    E.opts.addEventListener("change", (e) => {
      const c = e.target.closest("[data-capa]"); if (!c) return;
      if (c.dataset.capa === "pueblos") S.pueblos = c.checked; else S.parques = c.checked;
      pintarMapa();
    });
    window.addEventListener("resize", alRedimensionar);   // se quita sola al salir del mapa

    aplicarModo();
    pintarMapa();
    if (S.modo === "zona") pintarLista(); else pintarLeyenda();
  };

  // ---------------- CS.miniMapa ----------------
  // Mapa pequeño y estático (sin zoom) con las observaciones de una o varias setas, para la portada o las fichas.
  //   ids: «rovello», «rovello,cep», ["rovello", "cep"] o ids de la guía («boletus-edulis»).
  //   opciones: color "estado" (color de comestibilidad; por defecto con una sola seta) o "seta" (un color por seta, máx. 4)
  //             ciudades: true (capitales y algunas villas) · pie: true (devuelve <figure> con el recuento)
  //             titulo: texto para lectores de pantalla · decorativo: true (aria-hidden) · r: radio de los puntos
  CS.miniMapa = function (ids, op) {
    op = op || {};
    if (!HAY_MAPA) return "";
    const pts = MAPA.pts || PTS, lista = listaIds(ids);
    const porEstado = op.color ? op.color === "estado" : lista.length === 1;
    const sel = porEstado ? lista : lista.slice(0, MAX), r = op.r || 2.4;
    const puntos = sel.map((id, c) => { const g = circulos(pts[id] || [], r); return g ? `<g style="fill:${porEstado ? color(id) : COL[c]};stroke:var(--panel)" fill-opacity=".85" stroke-width=".5">${g}</g>` : ""; }).join("");
    const ciudades = op.ciudades ? (MAPA.ciutats || []).map(([x, y, t, a, tx, ty, sz, k]) => (k === "cap" ? `<circle cx="${x}" cy="${y}" r="2.2" fill="currentColor"/>` : k === "vila" ? `<circle cx="${x}" cy="${y}" r="1.6" class="mapa-vila" stroke-width="1"/>` : "")
      + `<text x="${tx}" y="${ty}" text-anchor="${esc(a)}" font-size="${sz}" class="mapa-et ${k === "cap" ? "cap" : k === "zona" ? "zona" : ""}" stroke-width="2.4">${esc(t)}</text>`).join("") : "";
    const n = sel.reduce((a, id) => a + nObs(id), 0);
    const texto = sel.length === 1
      ? (n === 0 ? "Aún no hay observaciones confirmadas en Cataluña en iNaturalist: guíese por el hábitat." : n < 8 ? `Solo ${plural(n, "observación confirmada", "observaciones confirmadas")} en Cataluña en iNaturalist: hay pocos datos.` : `${n} observaciones confirmadas en Cataluña.`)
      : sel.length ? `Observaciones confirmadas en Cataluña de ${sel.map(CS.nombre).join(", ")}.` : "";
    const etiqueta = op.titulo || (sel.length ? `Mapa de Cataluña. ${texto}` : "Mapa de Cataluña");
    const svg = `<svg class="mapa-mini" viewBox="0 0 ${MAPA.w} ${MAPA.h}" ${op.decorativo ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${esc(etiqueta)}"`}>`
      + MAPA.prov.map((d) => `<path d="${d}" class="mapa-tierra" stroke-width=".9"/>`).join("") + puntos + ciudades + "</svg>";
    return op.pie ? `<figure class="mapa-mini-fig">${svg}<figcaption>${esc(texto)}${n ? " Cada punto es un hallazgo en iNaturalist." : ""}</figcaption></figure>` : svg;
  };
})();
