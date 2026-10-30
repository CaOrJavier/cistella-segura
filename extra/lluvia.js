/* «Cuándo salir tras la lluvia» (#/lluvia). Viene del capítulo «Quan sortir» de la antigua web Cistella Segura.
   Cuántos días tarda cada comestible en salir después de una lluvia fuerte y una calculadora: con la fecha de la última
   lluvia (a mano o tomada de una zona con datos de Open-Meteo) marca qué toca buscar hoy.
   Datos: PLUJA, PL_GRUPS, ZONES y REGIONS (datos/cistella.js); utilidades en window.CS (extra/comun.js). */
(function () {
  "use strict";
  const DAY = 864e5;
  const K_FECHA = "lluvia", K_ZONA = "lluvia-zona", K_METEO = "lluvia-meteo";   // claves de G.store (prefijo «setas:»)
  const CACHE_MS = 3 * 3600e3;

  // Textos de PLUJA, en castellano
  const TXT = {
    tinta: "Sale deprisa en prados y bordes de caminos, con humedad. Recójala cerrada y cocínela el mismo día.",
    camasec: "Lluvias suaves de primavera y otoño. Cuando se seca, revive con la lluvia siguiente.",
    camperol: "Prados y claros con lluvia y temperatura suave.",
    petdellop: "Suele salir en grupos después de lluvias templadas.",
    apagallums: "Claros y márgenes. Crece deprisa: en dos días pasa de cerrada a abierta.",
    pgegant: "Prados ricos después de las tormentas de verano y las lluvias de septiembre. Crece mucho en pocos días.",
    putriformis: "Prados de montaña después de las tormentas de verano y las primeras lluvias de otoño.",
    molleric: "Pinares. Sale pronto y en cantidad, pero también envejece deprisa.",
    bolaneu: "Prados y sombra de las arboledas, con las lluvias de otoño.",
    llora: "Bosques caducifolios. Quiere calor: sale a finales de verano y principios de otoño.",
    girgola: "La de olmo y la de cardo salen después de las lluvias, en primavera y otoño, con frío suave.",
    ovoidea: "Quiere calor húmedo: sale después de las tormentas de verano y de septiembre.",
    reig: "Necesita calor y lluvia: de agosto a octubre. Con frío no sale.",
    cep: "Los de otoño, 10–14 días; los de verano, con calor, 7–10. Si hace frío, tardan más.",
    carlet: "Encinares y robledales húmedos, a mediados de otoño.",
    rovello: "Pinares de pino carrasco y pino piñonero. Las buenas son las lluvias de octubre; si hace frío, tarda más.",
    pinetell: "Pinares de pino silvestre y pino piñonero, en la media montaña. Con frío tarda unos días más.",
    rossinyol: "Verano y otoño, con humedad sostenida. Cuando empieza a salir, sigue saliendo durante semanas.",
    llengua: "Bosques de hoja caduca y pinares. Aguanta bien los primeros fríos.",
    camadeperdiu: "Pinares, bien entrado el otoño.",
    fredolic: "Con los primeros fríos de noviembre. Aguanta incluso con tramontana.",
    trompeta: "Bosques húmedos y umbríos. Necesita semanas de humedad, no solo un chaparrón.",
    camagroc: "Noviembre y diciembre, con mucha humedad. Aguanta bien el frío suave.",
    llenega: "Final del otoño, con frío y humedad.",
    pimpinella: "La última seta del año: sale con frío y hojarasca húmeda, incluso en invierno.",
  };
  // Títulos de PL_GRUPS, en castellano (mismo orden)
  const GRUPOS_ES = [["Rápidas", "3–10 días"], ["Una o dos semanas", "7–16 días"], ["Las que se hacen esperar", "10–25 días"]];
  const REGION_ES = { pirineu: "Pirineo", prepirineu: "Prepirineo", centre: "Centro y costa", sud: "Sur" };

  const ZONAS = ZONES.map(([id, nom, area, lat, lon]) => ({ id, nom, area, lat, lon }));
  const ZONA = Object.fromEntries(ZONAS.map((z) => [z.id, z]));

  const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const isoHace = (n) => new Date(Date.parse(todayISO()) - n * DAY).toISOString().slice(0, 10);
  const diasDesde = (iso) => Math.round((Date.parse(todayISO()) - Date.parse(iso)) / DAY);
  const dias = (n) => n + (n === 1 ? " día" : " días");
  const cuando = (n) => (n === 0 ? "hoy" : n === 1 ? "ayer" : "hace " + dias(n));
  const esISO = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
  const fechaLarga = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} de ${CS.MES_LARGO[m - 1]} de ${y}`; };

  // Meses de temporada: los habituales de la ficha de la guía (los mismos que muestra la ficha); si faltan, los de la web antigua
  function meses(id) {
    const e = CS.especie(id), m = e && (e.fenologia || {}).meses;
    return m && m.length ? m : (CS.BYCAT[id] || {}).mesos || [];
  }
  function mesesTexto(m) {
    const s = new Set(m); if (!s.size) return "sin datos";
    if (s.size === 12) return "todo el año";
    let ini = 1; while (!(s.has(ini) && !s.has(ini === 1 ? 12 : ini - 1))) ini++;   // primer mes de un tramo (el año da la vuelta)
    const out = []; let a = null, b = null;
    const cierra = () => { if (a !== null) out.push(a === b ? CS.MES_CORTO[a - 1] : CS.MES_CORTO[a - 1] + "–" + CS.MES_CORTO[b - 1]); a = null; };
    for (let k = 0; k < 12; k++) { const x = ((ini - 1 + k) % 12) + 1; if (s.has(x)) { if (a === null) a = x; b = x; } else cierra(); }
    cierra();
    return out.length > 1 ? out.slice(0, -1).join(", ") + " y " + out[out.length - 1] : out[0];
  }
  // Fecha guardada de la última lluvia fuerte ("" si no hay)
  function fecha(G) { const v = G.store.get(K_FECHA, ""); return esISO(v) ? v : ""; }
  // Días desde esa lluvia (null si no hay fecha o es futura)
  function diasLluvia(G) { const v = fecha(G); if (!v) return null; const n = diasDesde(v); return n >= 0 ? n : null; }
  function estado(id, n) {
    const [a, z] = PLUJA[id], mes = new Date().getMonth() + 1;
    if (!meses(id).includes(mes)) return ["fuera", "Fuera de temporada"];
    if (n < a) return ["pronto", "Dentro de " + dias(a - n)];
    if (n <= z) return ["ahora", "Ahora es el momento"];
    return ["tarde", "Ya es tarde"];
  }

  function tarjeta(G, id, n) {
    const esc = G.esc, [a, z, m] = PLUJA[id], e = CS.especie(id), href = CS.href(id) || "#/", nom = CS.nombre(id), sci = CS.cientifico(id);
    const st = n === null ? null : estado(id, n);
    const pc = (x) => (Math.min(Math.max(x, 0), 30) / 30 * 100).toFixed(1) + "%";
    const es = e ? (e.nombres.es || []).slice(0, 2).join(", ") : "";
    const foto = CS.foto(id);
    return `<article class="ll-card${st && st[0] === "ahora" ? " ll-ya" : ""}">
      <button type="button" class="ll-foto" data-foto="${esc(id)}" aria-label="Ampliar fotos: ${esc(nom)}">${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : ""}</button>
      <div class="ll-cuerpo">
        <h3><a href="${esc(href)}">${nom === sci ? `<i>${esc(nom)}</i>` : esc(nom)}</a></h3>
        <div class="ll-sci">${es ? esc(es) + " · " : ""}${nom === sci ? "" : `<i>${esc(sci)}</i>`}</div>
        <div class="ll-dias"><b>${a}–${z} días</b> <span class="muted">· mejor el día ${m}</span></div>
        <div class="ll-insignias">${G.badge(CS.estado(id))}${st ? `<span class="ll-estado ll-${st[0]}">${esc(st[1])}</span>` : ""}</div>
        <div class="ll-barra" role="img" aria-label="Sale entre ${a} y ${z} días después de la lluvia; el mejor, el día ${m}${n !== null ? `; hoy hace ${dias(n)}` : ""}">
          <i style="left:${pc(a)};width:${pc(z - a)}"></i><em style="left:${pc(m)}"></em>${n !== null ? `<span class="ll-hoy${n > 30 ? " ll-fin" : ""}" style="left:${pc(n)}"></span>` : ""}</div>
        <div class="ll-eje" aria-hidden="true"><span>0</span><span>10</span><span>20</span><span>30 días</span></div>
        <p>${esc(TXT[id] || PLUJA[id][3])}</p>
        <p class="ll-temp">Temporada: ${esc(mesesTexto(meses(id)))} · <a href="${esc(href)}">Ver ficha →</a></p>
      </div></article>`;
  }
  function pintarGrupos(G, root) {
    const n = diasLluvia(G);
    root.querySelector("#ll-grupos").innerHTML = PL_GRUPS.map(([t, d, ids], i) => {
      const [tes, des] = GRUPOS_ES[i] || [t, d];
      return `<section class="ll-grupo"><h2>${G.esc(tes)} <small>${G.esc(des)} después de la lluvia</small></h2>
        <div class="ll-lista">${ids.filter((id) => PLUJA[id] && CS.BYCAT[id]).map((id) => tarjeta(G, id, n)).join("")}</div></section>`;
    }).join("");
  }
  function pintarCalc(G, root) {
    const esc = G.esc, v = fecha(G), n = diasLluvia(G), inp = root.querySelector("#ll-fecha"), res = root.querySelector("#ll-res");
    inp.max = todayISO();
    if (inp.value !== v) inp.value = v;
    root.querySelectorAll(".ll-rapido").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.hace !== "" && v === isoHace(+b.dataset.hace))));
    if (!v) {
      res.innerHTML = `<p class="muted">Ponga la fecha de la última lluvia fuerte (20–30 l/m²) y le marcaremos qué setas toca ir a buscar hoy.</p>`;
    } else if (n === null) {
      res.innerHTML = `<p class="ll-aviso">El ${esc(fechaLarga(v))} todavía no ha llegado. Ponga la fecha de una lluvia que ya haya caído.</p>`;
    } else {
      const ids = Object.keys(PLUJA).filter((id) => CS.BYCAT[id]);
      const ya = ids.filter((id) => estado(id, n)[0] === "ahora");
      const pronto = ids.filter((id) => estado(id, n)[0] === "pronto").sort((x, y) => PLUJA[x][0] - PLUJA[y][0]);
      const enlace = (id) => { const st = CS.estado(id); return `<a class="ll-e-${esc(st)}" href="${esc(CS.href(id) || "#/")}">${esc(CS.nombre(id))}${st === "comestible" ? "" : ` <span class="small">(${esc((DB.vocabulario.comestibilidad[st] || { etiqueta: st }).etiqueta.toLowerCase())})</span>`}</a>`; };
      res.innerHTML = `<p class="ll-grande">${n === 0 ? `La lluvia fuerte ha sido <b>hoy</b>: empiece a contar cuando pare.` : `Hoy hace <b>${dias(n)}</b> de la lluvia <span class="muted small">(${esc(fechaLarga(v))})</span>.`}</p>` +
        (ya.length ? `<div><span class="ll-label">Ahora es buen momento para</span><div class="ll-ya-lista">${ya.map(enlace).join("")}</div></div>`
          : `<p>Ninguna comestible de la lista está ahora en su ventana.</p>`) +
        (pronto.length ? `<p class="muted small">Las próximas: ${pronto.slice(0, 4).map((id) => `${esc(CS.nombre(id))} (${esc(estado(id, n)[1].toLowerCase())})`).join(", ")}.</p>` : "") +
        `<p class="muted small">Cuenta también la temporada: la lista mira el mes actual (${esc(CS.MES_LARGO[new Date().getMonth()])}). Si ha vuelto a llover fuerte después, ponga la fecha nueva.</p>`;
    }
    pintarGrupos(G, root);
  }

  // ---- Lluvia de una zona: Open-Meteo, los mismos parámetros que usaba la web antigua, pero solo para esa zona ----
  async function datosZona(G, z, forzar) {
    const cache = G.store.get(K_METEO, {}) || {}, c = cache[z.id];
    if (!forzar && c && c.d && Date.now() - c.t < CACHE_MS) return { d: c.d, t: c.t };
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${z.lat}&longitude=${z.lon}&daily=precipitation_sum,temperature_2m_mean&past_days=21&forecast_days=1&timezone=Europe%2FMadrid`;
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    const reloj = ctl ? setTimeout(() => ctl.abort(), 15000) : 0;
    try {
      const r = await fetch(url, ctl ? { signal: ctl.signal } : undefined);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json(), dd = j && j.daily;
      if (!dd || !Array.isArray(dd.time) || !Array.isArray(dd.precipitation_sum) || !dd.time.length) throw new Error("respuesta sin datos diarios");
      const d = { time: dd.time, precipitation_sum: dd.precipitation_sum, temperature_2m_mean: dd.temperature_2m_mean || [] };
      const t = Date.now(), todo = G.store.get(K_METEO, {}) || {};
      Object.keys(todo).forEach((k) => { if (!todo[k] || t - todo[k].t > 7 * DAY) delete todo[k]; });   // no guarda datos viejos
      todo[z.id] = { t, d };
      G.store.set(K_METEO, todo);
      return { d, t };
    } catch (err) {
      if (c && c.d) return { d: c.d, t: c.t, viejo: true };
      throw err;
    } finally { clearTimeout(reloj); }
  }
  // Episodios como en la web antigua (meteoAnalisi): días seguidos con 1 mm o más que suman 20 l/m² o más.
  // Cada episodio se fecha en su último día de lluvia: los días se cuentan desde que para.
  function analizar(d) {
    const P = d.time.map((_, i) => +d.precipitation_sum[i] || 0), T = d.temperature_2m_mean || [], last = P.length - 1;
    const sum = (a, b) => P.slice(a, b + 1).reduce((x, y) => x + y, 0);
    const eps = [];
    for (let i = 0; i <= last; i++) {
      if (P[i] < 1) continue;
      let j = i; while (j < last && P[j + 1] >= 1) j++;
      const mm = sum(i, j); if (mm >= 20) eps.push({ mm, fecha: d.time[j], dias: diasDesde(d.time[j]) });
      i = j;
    }
    eps.reverse();   // la más reciente primero
    const t3 = T.slice(-3).filter((x) => typeof x === "number");
    return { eps, total: sum(0, last), t3: t3.length ? t3.reduce((a, b) => a + b, 0) / t3.length : null, ndias: P.length };
  }
  const haceRato = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 2 ? "hace un momento" : m < 60 ? `hace ${m} min` : m < 48 * 60 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} días`; };

  let turno = 0;   // descarta respuestas de una zona elegida antes
  async function elegirZona(G, root, id, forzar) {
    const msg = root.querySelector("#ll-zmsg"), act = root.querySelector("#ll-actualizar"), z = ZONA[id], yo = ++turno;
    G.store.set(K_ZONA, z ? id : "");
    act.hidden = !z;
    msg.classList.remove("ll-error");
    if (!z) { msg.textContent = ""; return; }
    msg.textContent = `Consultando la lluvia de ${z.nom}…`;
    act.disabled = true;
    let r;
    try { r = await datosZona(G, z, forzar); }
    catch (err) {
      if (yo !== turno) return;
      act.disabled = false;
      msg.classList.add("ll-error");
      msg.textContent = `No se ha podido consultar la lluvia de ${z.nom} (sin conexión o el servicio de Open-Meteo no responde). Ponga la fecha a mano o pruebe más tarde con «Actualizar».`;
      return;
    }
    if (yo !== turno) return;
    act.disabled = false;
    const a = analizar(r.d);
    // La lluvia que hace salir setas ahora: la más reciente que ya tiene 3 días o más; si no hay, la última.
    const ep = a.eps.find((v) => v.dias >= 3) || a.eps[0], e0 = a.eps[0];
    let txt;
    if (!ep) {
      txt = `En ${z.nom} no ha habido ninguna lluvia fuerte (20 l/m² o más en días seguidos) en las últimas tres semanas: ${a.total.toFixed(0)} l/m² en total. Sin una lluvia así salen pocas setas; se ha borrado la fecha de la calculadora.`;
      G.store.set(K_FECHA, "");
    } else {
      txt = `En ${z.nom}, ${ep === e0 ? "la última lluvia fuerte" : "la lluvia fuerte que hace salir setas ahora"} dejó ${ep.mm.toFixed(0)} l/m² y ${ep.dias === 0 ? "ha sido hoy" : ep.dias === 1 ? "terminó ayer" : `terminó ${cuando(ep.dias)}`}.`;
      if (e0 !== ep) txt += ` Ha vuelto a llover fuerte ${cuando(e0.dias)} (${e0.mm.toFixed(0)} l/m²): esa hará salir más dentro de unos días.`;
      G.store.set(K_FECHA, ep.fecha);
    }
    if (a.t3 !== null && a.t3 > 18) txt += " Hace calor: suba de cota o busque en las umbrías.";
    else if (a.t3 !== null && a.t3 < 6) txt += " Hace frío: busque en cotas bajas y en los valles.";
    txt += r.viejo ? ` Datos de Open-Meteo guardados ${haceRato(r.t)}: ahora no se han podido actualizar.` : " Datos de Open-Meteo.";
    msg.textContent = txt;
    pintarCalc(G, root);
  }

  function opcionesZonas(esc) {
    const usadas = new Set();
    const op = (z) => { usadas.add(z.id); return `<option value="${esc(z.id)}">${esc(z.nom)} · ${esc(z.area)}</option>`; };
    let html = Object.keys(REGIONS).map((r) => {
      const zs = REGIONS[r][1].split(" ").map((id) => ZONA[id]).filter(Boolean);
      return zs.length ? `<optgroup label="${esc(REGION_ES[r] || REGIONS[r][0])}">${zs.map(op).join("")}</optgroup>` : "";
    }).join("");
    const resto = ZONAS.filter((z) => !usadas.has(z.id));
    if (resto.length) html += `<optgroup label="Otras zonas">${resto.map(op).join("")}</optgroup>`;
    return html;
  }

  window.VISTAS_EXTRA.lluvia = (arg, G) => {
    const esc = G.esc;
    document.title = "Cuándo salir tras la lluvia · Cistella Segura";
    G.app.innerHTML = `<div class="ll">
      <h1>Cuándo salir tras la lluvia</h1>
      <p class="ll-entrada">Las setas no salen el día que llueve, sino días después. Cada especie tarda algo distinto: unas aparecen en una semana y otras se hacen esperar tres. Aquí tiene el mejor momento para ir a buscar cada comestible.</p>
      <div class="ll-reglas">
        <div class="ll-regla"><b>Una lluvia de verdad</b><p>Cuente con 20–30 litros por m² en uno o dos días, o varias lluvias suaves seguidas. Cuatro gotas no hacen salir nada: la tierra tiene que quedar empapada.</p></div>
        <div class="ll-regla"><b>Empiece a contar cuando pare</b><p>Los días de esta página cuentan desde que termina la lluvia fuerte. Si vuelve a llover, la cuenta se alarga.</p></div>
        <div class="ll-regla"><b>Ni mucho calor ni heladas</b><p>Con temperaturas suaves (10–20 °C) salen bien. El viento seco, el sol fuerte o una helada las frenan en seco.</p></div>
        <div class="ll-regla"><b>Una segunda oleada</b><p>Si vuelve a llover 2–3 semanas después, muchas vuelven a salir. Vuelva al mismo sitio.</p></div>
      </div>
      <section class="ll-calc" aria-labelledby="ll-calc-t">
        <div><span class="ll-label">Calculadora</span><h2 id="ll-calc-t">¿Cuándo llovió fuerte por última vez?</h2></div>
        <div class="ll-fila">
          <label for="ll-fecha" class="ll-sr">Fecha de la última lluvia fuerte</label>
          <input type="date" id="ll-fecha">
          <button type="button" class="tog ll-rapido" data-hace="3">Hace 3 días</button>
          <button type="button" class="tog ll-rapido" data-hace="7">Hace una semana</button>
          <button type="button" class="tog ll-rapido" data-hace="14">Hace dos semanas</button>
          <button type="button" class="tog ll-rapido" data-hace="">Borrar</button>
        </div>
        <div class="ll-fila ll-zona">
          <label for="ll-zona">O tome la lluvia de su zona:</label>
          <select id="ll-zona"><option value="">Elija una zona…</option>${opcionesZonas(esc)}</select>
          <button type="button" class="btn" id="ll-actualizar" hidden>Actualizar</button>
        </div>
        <p class="ll-zmsg" id="ll-zmsg" aria-live="polite"></p>
        <div class="ll-res" id="ll-res" aria-live="polite"></div>
      </section>
      <p class="ll-leyenda"><span><i class="ll-l-ventana"></i>días en que suele salir</span><span><i class="ll-l-mejor"></i>mejor día</span><span><i class="ll-l-hoy"></i>hoy, según la fecha de la calculadora</span></p>
      <div id="ll-grupos"></div>
      <div class="nota-filtro ll-nota"><b>Son días orientativos.</b> Cambian según la altitud, el suelo, la orientación y el año: a la sombra y a más altitud tardan más. Pregunte siempre a la gente del lugar. Y recuerde: las setas tóxicas salen los mismos días que las buenas, así que este calendario nunca le dice si una seta se puede comer.</div>
    </div>`;
    const root = G.app.querySelector(".ll");
    root.querySelector("#ll-fecha").addEventListener("change", (ev) => { G.store.set(K_FECHA, esISO(ev.target.value) ? ev.target.value : ""); pintarCalc(G, root); });
    root.querySelector("#ll-zona").addEventListener("change", (ev) => elegirZona(G, root, ev.target.value, false));
    root.querySelector("#ll-actualizar").addEventListener("click", () => elegirZona(G, root, root.querySelector("#ll-zona").value, true));
    root.addEventListener("click", (ev) => {
      const q = ev.target.closest(".ll-rapido");
      if (q) { G.store.set(K_FECHA, q.dataset.hace === "" ? "" : isoHace(+q.dataset.hace)); pintarCalc(G, root); return; }
      const f = ev.target.closest(".ll-foto");
      if (f) {
        const e = CS.especie(f.dataset.foto), fotos = (e && e.fotos) || [];
        if (fotos.length) G.abrirVisor(fotos, 0);
        else { const g = CS.fotoGrande(f.dataset.foto); if (g) G.abrirVisor([{ g, t: CS.foto(f.dataset.foto), pie: CS.nombre(f.dataset.foto) }], 0); }
      }
    });
    // zona elegida la última vez: se recuerda (sin volver a consultar hasta que la cambie o pulse «Actualizar»)
    const z = G.store.get(K_ZONA, "");
    if (ZONA[z]) { root.querySelector("#ll-zona").value = z; root.querySelector("#ll-actualizar").hidden = false; }
    pintarCalc(G, root);
  };
})();
