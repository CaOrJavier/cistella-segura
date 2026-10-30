/* «Hoy en el bosque» (#/hoy, #/hoy/<zona>): lluvia y temperatura de los últimos días en las zonas de setas de
   Cataluña y qué buscar en cada una. Viene de «Avui al bosc» de la antigua web Cistella Segura.
   Datos diarios de Open-Meteo (sin clave): se guardan 3 h en el navegador y, sin conexión, se muestran los últimos.
   Necesita datos/cistella.js (ZONES, REGIONS, BOSCOS, PLUJA, MAPA, MAPA_INT, NIVELLS) y extra/comun.js (CS).
   Expone VISTAS_EXTRA.hoy y CS.hoyResumen(elemento) (tarjeta resumen para la portada). */
(function () {
  "use strict";
  const VE = (window.VISTAS_EXTRA = window.VISTAS_EXTRA || {});
  const CS = window.CS;
  if (!CS) return;

  // ---------------- datos de la antigua web ----------------
  const MP = typeof MAPA !== "undefined" ? MAPA : null;
  const MI = typeof MAPA_INT !== "undefined" ? MAPA_INT : null;
  const PL = typeof PLUJA !== "undefined" ? PLUJA : {};
  const REGS = typeof REGIONS !== "undefined" ? REGIONS : {};
  const NV = typeof NIVELLS !== "undefined" ? NIVELLS : [];
  const BOSC = Object.fromEntries((typeof BOSCOS !== "undefined" ? BOSCOS : []).map((b) => [b.id, b]));
  const ZS = (typeof ZONES !== "undefined" ? ZONES : []).map((r) => {
    const z = Array.isArray(r) ? { id: r[0], nom: r[1], lloc: r[2], lat: r[3], lon: r[4], boscos: r[5] }
      : { id: r.id, nom: r.nom, lloc: r.lloc, lat: r.lat, lon: r.lon, boscos: r.boscos };
    z.boscos = z.boscos || [];
    z.regio = Object.keys(REGS).find((k) => String(REGS[k][1]).split(" ").includes(z.id)) || null;
    return z;
  }).filter((z) => z.id && isFinite(z.lat) && isFinite(z.lon));
  const ZONA = Object.fromEntries(ZS.map((z) => [z.id, z]));

  const REG_ES = { pirineu: "Pirineo", prepirineu: "Prepirineo", centre: "Centro y costa", sud: "Sur" };
  const REGIONES = [["todas", "Todas"], ...Object.keys(REGS).map((k) => [k, REG_ES[k] || REGS[k][0]])];
  // Niveles 0–3: nombre, color (los de la antigua web) y color del texto encima (para que se lea).
  const NIVEL = [["Seco", "#b5473a", "#fff"], ["Bajo", "#d9822b", "#1c231f"], ["Medio", "#c9a227", "#1c231f"], ["Alto", "#3f8f4f", "#fff"]]
    .map((n, i) => [n[0], (NV[i] && NV[i][1]) || n[1], n[2]]);
  // Tipos de bosque: nombre corto en castellano y árbol de la guía (#/arbol/…).
  const BOSQUE = {
    pinyer: ["Pino piñonero y carrasco", "pinus-pinea"], piroig: ["Pino silvestre y laricio", "pinus-sylvestris"],
    pinegre: ["Pino negro", "pinus-uncinata"], avet: ["Abetales", "abies-alba"], faig: ["Hayedos", "fagus-sylvatica"],
    roure: ["Robledales", "quercus-pubescens"], castanyer: ["Castañares", "castanea-sativa"], alzina: ["Encinares", "quercus-ilex"],
    surera: ["Alcornocales", "quercus-suber"], prat: ["Prados", null],
  };
  const ARB = Object.fromEntries(((window.DB || {}).arboles || []).map((a) => [a.id, ((a.nombres || {}).es || [])[0] || a.id]));

  // ---------------- utilidades ----------------
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
  const num = (v, d = 0) => (d ? v : Math.round(v) || 0).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
  const cuando = (d) => (d === 0 ? "hoy" : d === 1 ? "ayer" : `hace ${d} días`);
  const fecha = (s) => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(s || ""); return m ? `${+m[3]} ${CS.MES_CORTO[+m[2] - 1]}` : String(s || ""); };
  const lugar = (s) => String(s || "").replace(/ i /g, " y ");        // «Osona i la Selva» → «Osona y la Selva»
  // localStorage con el prefijo de la guía (la de app.js si ya existe)
  const ALM = {
    get(k, d) { try { const v = localStorage.getItem("setas:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("setas:" + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };
  const store = () => (window.GUIA && window.GUIA.store) || ALM;

  // Proyección de los mapas de la antigua web (lon/lat → unidades del mapa)
  const PROJ = MI && Array.isArray(MI.proj) && MI.proj.length >= 5 ? MI.proj : null;
  const KM = 111.2 / (PROJ ? PROJ[2] : 92);                              // km por unidad del mapa
  const proj = (lon, lat) => { const [L0, L1, S, PAD, K] = PROJ; return [(lon - L0) * K * S + PAD, (L1 - lat) * S + PAD]; };

  // ---------------- tiempo: Open-Meteo ----------------
  const CLAVE = "hoy-meteo", TTL = 3 * 3600e3;
  const FIRMA = ZS.map((z) => z.lat + "," + z.lon).join(";");
  const MET = { data: null, t: 0, err: null, loading: null };
  const valida = (c) => (c && typeof c.t === "number" && c.k === FIRMA && Array.isArray(c.d) && c.d.length === ZS.length ? c : null);

  function analisis(d) {
    const P = d.daily.precipitation_sum.map((v) => v || 0), T = d.daily.temperature_2m_mean || [], last = P.length - 1;
    if (last < 4) return null;
    const sum = (a, b) => P.slice(a, b + 1).reduce((x, y) => x + y, 0);
    const rain5 = sum(last - 4, last), rain21 = sum(0, last);
    const tt = [T[last], T[last - 1], T[last - 2]].filter((v) => typeof v === "number");
    const t3 = tt.length ? tt.reduce((x, y) => x + y, 0) / tt.length : null;
    // Episodios: días seguidos de lluvia (1 mm o más) que suman 20 l/m² o más. Las setas salen días después de cada uno.
    const eps = [];
    for (let i = 0; i <= last; i++) {
      if (P[i] < 1) continue;
      let j = i; while (j < last && P[j + 1] >= 1) j++;
      const mm = sum(i, j); if (mm >= 20) eps.push({ mm, dies: last - j });
      i = j;
    }
    eps.reverse();                                                       // el más reciente primero
    const sc = (dd) => (dd <= 2 ? 2 : dd <= 20 ? 3 : dd <= 30 ? 1 : 0);
    const s = eps.length ? Math.max(...eps.map((e) => sc(e.dies))) : (rain21 >= 25 ? 1 : 0);
    const adj = t3 === null || (t3 >= 6 && t3 <= 18) ? 0 : (t3 >= 3 && t3 < 6) || (t3 > 18 && t3 <= 22) ? -1 : -2;
    const nivel = Math.max(0, Math.min(3, s + adj));
    const e0 = eps[0], e1 = eps.find((e) => e.dies >= 3);
    let txt = !e0 ? (rain21 >= 25 ? "Ha llovido poco a poco: puede haber algo en las umbrías." : "Hace demasiado que no llueve de verdad.")
      : e0.dies <= 2 && e1 && e1.dies <= 20 ? "Ha vuelto a llover sobre el bosque mojado: ya hay setas y saldrán más."
      : e0.dies <= 2 ? "Acaba de llover fuerte. Dentro de unos días empezarán a salir."
      : e0.dies <= 9 ? "Buen momento para las rápidas; las demás están a punto."
      : e0.dies <= 20 ? "Buen momento para las de otoño que se hacen esperar."
      : "La lluvia ya queda lejos: solo quedan las tardías.";
    if (t3 !== null && t3 > 18) txt += " Hace calor: suba de cota o busque umbrías.";
    else if (t3 !== null && t3 < 6) txt += " Hace frío: busque en cotas bajas y valles.";
    return { P, rain5, rain21, t3, eps, dies: e0 ? e0.dies : null, epMm: e0 ? e0.mm : 0, nivel, txt, dates: d.daily.time || [] };
  }

  function meteoLoad(force) {
    if (MET.loading) return MET.loading;
    if (!force && MET.data && !MET.err && Date.now() - MET.t < TTL) return Promise.resolve();
    const cache = valida(store().get(CLAVE, null));
    if (!force && cache && Date.now() - cache.t < TTL) { MET.data = cache.d; MET.t = cache.t; MET.err = null; return Promise.resolve(); }
    if (!ZS.length) return Promise.resolve();
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + ZS.map((z) => z.lat).join(",") + "&longitude=" + ZS.map((z) => z.lon).join(",")
      + "&daily=precipitation_sum,temperature_2m_mean&past_days=21&forecast_days=1&timezone=Europe%2FMadrid";
    MET.loading = (async () => {
      const ctl = typeof AbortController === "function" ? new AbortController() : null;
      const reloj = ctl ? setTimeout(() => ctl.abort(), 20000) : 0;
      try {
        const r = await fetch(url, ctl ? { signal: ctl.signal } : undefined); if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json(), arr = Array.isArray(j) ? j : [j];
        const d = arr.map((x) => ({ daily: { time: x.daily.time, precipitation_sum: x.daily.precipitation_sum, temperature_2m_mean: x.daily.temperature_2m_mean } }));
        if (d.length !== ZS.length) throw new Error("respuesta incompleta");
        MET.data = d; MET.t = Date.now(); MET.err = null;
        store().set(CLAVE, { t: MET.t, k: FIRMA, d });
      } catch (e) {
        MET.err = e; if (cache) { MET.data = cache.d; MET.t = cache.t; }
      } finally { clearTimeout(reloj); MET.loading = null; }
    })();
    return MET.loading;
  }

  const ZA = () => (MET.data ? ZS.map((z, i) => { let a = null; try { a = MET.data[i] ? analisis(MET.data[i]) : null; } catch (e) { /* datos raros */ } return { z, a }; }).filter((x) => x.a) : []);
  const ordena = (list) => [...list].sort((p, q) => q.a.nivel - p.a.nivel || (p.a.dies ?? 99) - (q.a.dies ?? 99));

  // Qué buscar ahora en una zona: setas de sus bosques, del mes, a punto según los días desde cada episodio de lluvia
  // («Cuándo salir tras la lluvia») y, primero, las que más se han encontrado a menos de 15 km.
  function queBuscar(z, a) {
    if (!a.eps.length) return [];
    const BY = CS.BYCAT || {}, mes = new Date().getMonth() + 1, prop = new Set(z.boscos.flatMap((b) => (BOSC[b] || {}).bons || []));
    let obs = () => 0;
    if (PROJ && MI.pts) {
      const [x0, y0] = proj(z.lon, z.lat), R = 15 / KM;
      obs = (id) => { const p = MI.pts[id] || []; let n = 0; for (let i = 0; i < p.length; i += 2) if (Math.hypot(p[i] - x0, p[i + 1] - y0) <= R) n++; return n; };
    }
    return Object.keys(PL).filter((id) => BY[id] && prop.has(id) && (BY[id].mesos || []).includes(mes) && a.eps.some((e) => e.dies >= PL[id][0] - 1 && e.dies <= PL[id][1] + 2))
      .map((id) => [id, obs(id)]).sort((p, q) => q[1] - p[1]).slice(0, 6);
  }

  function haceCuanto(t) {
    const m = Math.round((Date.now() - t) / 60000);
    return m < 2 ? "ahora mismo" : m < 60 ? `hace ${m} min` : m < 48 * 60 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} días`;
  }

  // ---------------- piezas ----------------
  function chispa(P, dates) {
    const w = 132, h = 28, n = P.length, bw = w / n, mx = Math.max(30, ...P);
    return `<svg class="hoy-chispa" viewBox="0 0 ${w} ${h + 9}" role="img" aria-label="Lluvia diaria de los últimos ${n} días">${P.map((v, i) => {
      const bh = v ? Math.max(1.5, (v / mx) * h) : 0;
      return bh ? `<rect x="${(i * bw + 0.5).toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${(bw - 1).toFixed(1)}" height="${bh.toFixed(1)}" rx="1"><title>${esc(fecha(dates[i]))}: ${num(v, 1)} mm</title></rect>` : "";
    }).join("")}<line x1="0" y1="${h + 0.5}" x2="${w}" y2="${h + 0.5}" stroke="currentColor" stroke-opacity=".3"/><text x="0" y="${h + 8.5}" font-size="7" fill="currentColor" fill-opacity=".65">hace ${n - 1} días</text><text x="${w}" y="${h + 8.5}" font-size="7" text-anchor="end" fill="currentColor" fill-opacity=".65">hoy</text></svg>`;
  }

  function chipSeta([id, n]) {
    const e = CS.especie(id), est = CS.estado(id), href = CS.href(id), foto = CS.foto(id);
    const es = e && ((e.nombres || {}).es || [])[0];
    const tit = [es && cap(es), CS.cientifico(id), n ? `${n} ${n === 1 ? "hallazgo" : "hallazgos"} a menos de 15 km` : ""].filter(Boolean).join(" · ");
    const dentro = `${foto ? `<img src="${esc(foto)}" alt="" loading="lazy" width="22" height="22">` : ""}${esc(CS.nombre(id))}`;
    const st = `--hoy-c:${CS.COLOR[est] || "var(--ok)"};--hoy-f:${CS.FONDO[est] || "var(--ok-bg)"}`;
    return href ? `<a class="hoy-seta" href="${esc(href)}" style="${st}" title="${esc(tit)}">${dentro}</a>` : `<span class="hoy-seta" style="${st}" title="${esc(tit)}">${dentro}</span>`;
  }

  function bosque(b) {
    const x = BOSQUE[b], nom = x ? x[0] : (BOSC[b] || {}).nom || b;
    return x && x[1] && ARB[x[1]] ? `<a href="#/arbol/${x[1]}" title="Ficha del árbol: ${esc(ARB[x[1]])}">${esc(nom)}</a>` : `<span>${esc(nom)}</span>`;
  }

  function tarjetaZona({ z, a }) {
    const [nom, col, tinta] = NIVEL[a.nivel], toca = queBuscar(z, a);
    return `<article class="hoy-zona" id="hoy-z-${esc(z.id)}" style="--hoy-lv:${col};--hoy-lv-tinta:${tinta}" tabindex="-1" aria-labelledby="hoy-zt-${esc(z.id)}">
      <header class="hoy-zona-cab"><div><h3 id="hoy-zt-${esc(z.id)}">${esc(z.nom)}</h3><small>${esc(lugar(z.lloc))}</small></div><span class="hoy-nivel"><span class="hoy-sr">Nivel </span>${nom}</span></header>
      <p class="hoy-zona-txt">${esc(a.txt)}</p>
      <div class="hoy-datos">
        <span><b>${num(a.rain5)} mm</b> en 5 días</span>
        <span>${!a.eps.length ? "Sin lluvia fuerte en 3 semanas" : "Lluvia fuerte: " + a.eps.slice(0, 2).map((e) => `<b>${num(e.mm)} mm</b> ${cuando(e.dies)}`).join(" y ")}</span>
        <span title="Temperatura media de los últimos 3 días"><b>${a.t3 === null ? "—" : num(a.t3)} °C</b> de media</span>
        ${chispa(a.P, a.dates)}
      </div>
      ${toca.length ? `<div class="hoy-toca"><span class="hoy-etq">Qué buscar ahora</span><div>${toca.map(chipSeta).join("")}</div></div>` : ""}
      <div class="hoy-pie"><span>${z.boscos.map(bosque).join("")}</span><a class="hoy-mapa-enl" href="#/mapa/zona:${esc(z.id)}">Qué se ha encontrado →</a></div>
    </article>`;
  }

  function mapa(list) {
    if (!MP || !MP.w || !MP.h || !Array.isArray(MP.prov) || !PROJ) return "";
    const pobles = (MI.pobles || []).filter((p) => p[3] === 0);
    return `<svg class="hoy-mapa" viewBox="0 0 ${MP.w} ${MP.h}" role="group" aria-label="Mapa de las zonas con su nivel">
      ${MP.prov.map((d) => `<path class="hoy-prov" d="${esc(d)}"/>`).join("")}
      ${list.map(({ z, a }) => {
        const [x, y] = proj(z.lon, z.lat), [nv, col] = NIVEL[a.nivel];
        return `<a href="#/hoy/${esc(z.id)}" data-hoy-z="${esc(z.id)}" aria-label="${esc(z.nom)}: ${nv}"><circle class="hoy-punto" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" style="fill:${col}"><title>${esc(z.nom)}: ${nv}</title></circle></a>`;
      }).join("")}
      <g class="hoy-pobles" aria-hidden="true">${pobles.map(([x, y, t]) => `<circle cx="${x}" cy="${y}" r="1.8"/><text x="${x + 3}" y="${y + 3}">${esc(t)}</text>`).join("")}</g>
    </svg>`;
  }

  // ---------------- vista ----------------
  let REGION = "todas";

  function pintarZonas(root) {
    const box = root.querySelector(".hoy-zonas"); if (!box) return;
    const vis = ordena(ZA()).filter((x) => REGION === "todas" || x.z.regio === REGION);
    box.innerHTML = vis.length ? vis.map(tarjetaZona).join("") : `<p class="muted">No hay datos de esta región.</p>`;
    root.querySelectorAll("[data-hoy-reg]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.hoyReg === REGION)));
  }

  function irA(root, id, suave) {
    const z = ZONA[id]; if (!z) return;
    if (REGION !== "todas" && z.regio !== REGION) { REGION = "todas"; pintarZonas(root); }
    const el = root.querySelector("#hoy-z-" + CSS.escape(id)); if (!el) return;
    let quieto = false; try { quieto = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* */ }
    el.scrollIntoView({ block: "start", behavior: suave && !quieto ? "smooth" : "auto" });
    try { el.focus({ preventScroll: true }); } catch (e) { /* */ }
    root.querySelectorAll(".hoy-resalta").forEach((x) => x.classList.remove("hoy-resalta"));
    void el.offsetWidth;                                                  // reinicia la animación
    el.classList.add("hoy-resalta");
    root.querySelectorAll(".hoy-punto.hoy-sel").forEach((c) => c.classList.remove("hoy-sel"));
    const p = root.querySelector(`[data-hoy-z="${CSS.escape(id)}"] .hoy-punto`); if (p) p.classList.add("hoy-sel");
  }

  function pintar(root) {
    const st = root.querySelector(".hoy-estado"), box = root.querySelector(".hoy-cuerpo");
    const list = ZA();
    if (!list.length) {
      st.innerHTML = `No se han podido cargar los datos: hace falta conexión a internet. <button type="button" class="btn" data-hoy-retry>Volver a intentarlo</button>`;
      box.innerHTML = "";
      return false;
    }
    st.innerHTML = `Datos de <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> actualizados ${haceCuanto(MET.t)}${MET.err ? " (sin conexión: son los últimos que se cargaron)" : ""}. <button type="button" class="hoy-enlace" data-hoy-retry>Actualizar</button>`;
    const counts = [3, 2, 1, 0].map((l) => list.filter((x) => x.a.nivel === l).length);
    const m = mapa(list);
    box.innerHTML = `<div class="hoy-arriba${m ? "" : " sin-mapa"}">${m}<div class="hoy-leyenda">
        <ul>${[3, 2, 1, 0].map((l, i) => `<li><i style="background:${NIVEL[l][1]}"></i><b>${NIVEL[l][0]}</b> ${counts[i]} ${counts[i] === 1 ? "zona" : "zonas"}</li>`).join("")}</ul>
        <p>${m ? "Toque un punto para ir a la zona. " : ""}El nivel sale de los días que hace que llovió fuerte (20 l/m² o más en días seguidos de lluvia) y de la temperatura de los últimos 3 días.</p></div></div>
      <div class="hoy-regiones" role="group" aria-label="Región">${REGIONES.map(([k, t]) => `<button type="button" class="tog" data-hoy-reg="${k}" aria-pressed="${REGION === k}">${esc(t)}</button>`).join("")}</div>
      <div class="hoy-zonas"></div>`;
    pintarZonas(root);
    return true;
  }

  VE.hoy = (arg, G) => {
    const app = (G && G.app) || document.getElementById("app");
    if (!app) return;
    document.title = "Hoy en el bosque · Cistella Segura";
    app.innerHTML = `<div class="hoy">
      <h1>Hoy en el bosque</h1>
      <p class="hoy-entrada">¿Dónde puede haber setas? La lluvia y la temperatura de los últimos días en ${ZS.length} zonas de setas de Cataluña, y qué buscar en cada una según los días que hace que llovió fuerte.</p>
      <p class="hoy-estado" aria-live="polite"></p>
      <div class="hoy-cuerpo"></div>
      <p class="hoy-nota">Es una orientación. Las setas dependen también de la altitud, la orientación y el suelo de cada lugar. «Qué buscar ahora» sale del calendario de <a href="#/lluvia">Cuándo salir tras la lluvia</a>, de los bosques de la zona y de las setas que se han encontrado a menos de 15 km.</p>
    </div>`;
    const root = app.querySelector(".hoy"), st = root.querySelector(".hoy-estado");
    const vivo = () => root.isConnected;
    const ir = ZONA[arg] ? arg : null;

    root.addEventListener("click", (ev) => {
      const r = ev.target.closest("[data-hoy-retry]");
      if (r) {
        r.disabled = true; r.textContent = "Actualizando…";
        meteoLoad(true).then(() => { if (vivo()) pintar(root); });
        return;
      }
      const rg = ev.target.closest("[data-hoy-reg]");
      if (rg) { REGION = rg.dataset.hoyReg; pintarZonas(root); return; }
      const zm = ev.target.closest("[data-hoy-z]");
      if (zm && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && ev.button === 0) { ev.preventDefault(); irA(root, zm.dataset.hoyZ, true); }
    });

    if (!ZS.length) { st.textContent = "Faltan los datos de las zonas."; return; }
    if (!MET.data) st.textContent = "Cargando la lluvia y la temperatura de cada zona…";
    meteoLoad().then(() => {
      if (!vivo()) return;
      // el router sube al principio después de abrir la vista: la zona pedida (#/hoy/<zona>) se busca justo después
      if (pintar(root) && ir) setTimeout(() => { if (vivo()) irA(root, ir, false); }, 0);
    });
  };

  // ---------------- resumen para la portada ----------------
  CS.hoyResumen = function (el) {
    if (!el || !ZS.length) return;
    const pinta = () => {
      try {
        const list = ZA();
        if (!list.length) { el.hidden = true; el.innerHTML = ""; return; }
        const top = ordena(list).slice(0, 4), verdes = list.filter((x) => x.a.nivel === 3).length;
        el.hidden = false;
        el.innerHTML = `<a class="hoy-res" href="#/hoy"><span class="hoy-etq">Hoy en el bosque</span>
          <b class="hoy-res-tit">${verdes ? `${verdes} ${verdes === 1 ? "zona" : "zonas"} en verde` : "Ninguna zona en verde"}</b>
          <span class="hoy-res-z">${top.map(({ z, a }) => `<span><i style="background:${NIVEL[a.nivel][1]}"></i>${esc(z.nom)}<span class="hoy-sr"> (nivel ${NIVEL[a.nivel][0].toLowerCase()})</span></span>`).join("")}</span>
          <span class="hoy-res-ir">Ver todas las zonas →</span></a>`;
      } catch (e) { el.hidden = true; }
    };
    try {
      if (MET.data) pinta(); else el.hidden = true;
      meteoLoad().then(pinta, () => {});
    } catch (e) { /* sin resumen */ }
  };
})();
