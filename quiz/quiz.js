/* Quiz de setas · Cistella Segura
   Usa los mismos datos y fotos que la web: ../datos/db.js (en catalán, i18n.js ya lo ha traducido),
   ../datos/breve.js (las del cuaderno) y ../fotos/.
   Modos: ¿Qué seta es? (foto → nombre), ¿Se come? (foto → comestible, no se come, tóxica o mortal),
   No las confundas (dos fotos que se parecen: ¿cuál es cuál?), Árboles (hoja, tronco o forma → cuál) y Mezcla.
   Guarda en el navegador los aciertos y fallos de cada seta: las que más se fallan salen más. */
(function () {
  "use strict";
  const CA = window.IDIOMA === "ca";
  const DB = window.DB, V = DB.vocabulario;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
  const R = (p) => "../" + p;                       // las rutas de los datos van desde la raíz de la web
  // la web: en la copia del ZIP (file://) hay que nombrar index.html, porque una carpeta no se abre sola
  const WEB = location.protocol === "file:" ? "../index.html" : "../";
  if (location.protocol === "file:") $$('a[href^="../#"]').forEach((a) => a.setAttribute("href", WEB + a.getAttribute("href").slice(3)));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const baraja = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const app = $("#quiz");
  const MOV = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const N = 10;                                     // preguntas por ronda

  // ---------------- Textos (castellano / catalán) ----------------
  const TX = {
    es: {
      titulo: "Quiz de setas", kicker: "Ponte a prueba",
      intro: "Con fotos reales de Cataluña: qué seta es, si se come y con qué se confunde. Diez preguntas por ronda; las que falles volverán a salir.",
      dominas: "Dominas {n} de {t} setas", eligeModo: "Elige un modo",
      m_id: "¿Qué seta es?", m_id_d: "Mira la foto y elige el nombre.",
      m_come: "¿Se come?", m_come_d: "Comestible, tóxica o mortal: lo más importante.",
      m_conf: "No las confundas", m_conf_d: "Dos setas que se parecen: ¿cuál es cuál?",
      m_arbol: "Árboles", m_arbol_d: "Por la hoja, el tronco o la forma.",
      m_mix: "Mezcla", m_mix_d: "Un poco de todo.",
      m_repaso: "Repaso", setas: "Setas", s41: "Las {n} del cuaderno", s79: "Las 79 esenciales", todas: "Todas ({n})",
      nivel: "Nivel", facil: "Fácil", medio: "Medio", experto: "Experto",
      facil_d: "Fotos claras y opciones muy distintas.", medio_d: "Fotos de joven y de detalle; opciones parecidas.",
      experto_d: "Fotos difíciles; en «¿Qué seta es?» escribes el nombre.",
      repasar: "🔁 Repasar las que fallo ({n})", sonOn: "🔊 Sonido", sonOff: "🔇 Sin sonido", mejor: "Récord: {n}",
      aviso: "Un quiz no basta para comer setas. Ante la duda, no la recolecte.",
      atajos: "Atajos: 1–4 para responder, Intro para seguir.",
      de: "{i} de {n}", salir: "Salir", puntos: "{n} pts", racha: "racha",
      q_id: "¿Qué seta es?", q_come: "¿Se come esta seta?", q_arbol: "¿Qué árbol es?",
      q_conf: "Una es <b>{a}</b> ({ca}) y la otra <b>{b}</b> ({cb}). ¿Cuál es <b>{a}</b>?",
      esta: "Es esta", escribe: "Escribe el nombre (catalán, castellano o científico)", comprobar: "Comprobar", nolose: "No lo sé",
      c_comestible: "Comestible", c_no: "No se come", c_toxica: "Tóxica", c_mortal: "Mortal",
      bien: ["¡Bien!", "¡Exacto!", "¡Eso es!", "¡Perfecto!"], mal: "No, era esta:", malCome: "No: es {c}", malConf: "No, era la otra",
      verFicha: "Ver ficha →", verArbol: "Ver árbol →", verX: "Ficha: {n} →", sig: "Siguiente →", verRes: "Ver resultado →",
      distinguir: "Cómo distinguirlas:", mirelo: "Mírelo:", condic: "Condicionada: solo con precauciones (bien cocinada, joven…).",
      r90: "¡Ojo de experto!", r70: "¡Muy bien!", r50: "Vas por buen camino", r0: "A seguir practicando",
      aciertos: "{ok} de {n} aciertos · {p} puntos", record: "¡Nuevo récord!", paraRepasar: "Para repasar",
      otra: "Otra ronda", repasarRonda: "Repasar las falladas", inicio: "Volver al inicio",
      sinPares: "Con estas setas no hay parejas que se confundan: elige más setas.",
      sinRepaso: "No tienes setas para repasar: ¡todo bien de momento!",
      foto: { hoja: "Hoja", tronco: "Tronco", porte: "Árbol", fruto: "Fruto", flor: "Flor" },
      zoom: "Toca para cerrar",
    },
    ca: {
      titulo: "Quiz de bolets", kicker: "Posa't a prova",
      intro: "Amb fotos reals de Catalunya: quin bolet és, si es menja i amb què es confon. Deu preguntes per ronda; els que fallis tornaran a sortir.",
      dominas: "Domines {n} de {t} bolets", eligeModo: "Tria un mode",
      m_id: "Quin bolet és?", m_id_d: "Mira la foto i tria el nom.",
      m_come: "Es menja?", m_come_d: "Comestible, tòxic o mortal: el més important.",
      m_conf: "No els confonguis", m_conf_d: "Dos bolets que s'assemblen: quin és quin?",
      m_arbol: "Arbres", m_arbol_d: "Per la fulla, el tronc o la forma.",
      m_mix: "Barreja", m_mix_d: "Una mica de tot.",
      m_repaso: "Repàs", setas: "Bolets", s41: "Els {n} del quadern", s79: "Els 79 essencials", todas: "Tots ({n})",
      nivel: "Nivell", facil: "Fàcil", medio: "Mitjà", experto: "Expert",
      facil_d: "Fotos clares i opcions molt diferents.", medio_d: "Fotos de jove i de detall; opcions semblants.",
      experto_d: "Fotos difícils; a «Quin bolet és?» escrius el nom.",
      repasar: "🔁 Repassar els que fallo ({n})", sonOn: "🔊 So", sonOff: "🔇 Sense so", mejor: "Rècord: {n}",
      aviso: "Un quiz no basta per menjar bolets. En cas de dubte, no el culli.",
      atajos: "Dreceres: 1–4 per respondre, Retorn per continuar.",
      de: "{i} de {n}", salir: "Sortir", puntos: "{n} punts", racha: "ratxa",
      q_id: "Quin bolet és?", q_come: "Es menja aquest bolet?", q_arbol: "Quin arbre és?",
      q_conf: "Un és <b>{a}</b> ({ca}) i l'altre <b>{b}</b> ({cb}). Quin és <b>{a}</b>?",
      esta: "És aquest", escribe: "Escriu el nom (català, castellà o científic)", comprobar: "Comprovar", nolose: "No ho sé",
      c_comestible: "Comestible", c_no: "No es menja", c_toxica: "Tòxic", c_mortal: "Mortal",
      bien: ["Molt bé!", "Exacte!", "Això mateix!", "Perfecte!"], mal: "No, era aquest:", malCome: "No: és {c}", malConf: "No, era l'altre",
      verFicha: "Veure la fitxa →", verArbol: "Veure l'arbre →", verX: "Fitxa: {n} →", sig: "Següent →", verRes: "Veure el resultat →",
      distinguir: "Com distingir-los:", mirelo: "Miri-ho:", condic: "Condicionat: només amb precaucions (ben cuinat, jove…).",
      r90: "Ull d'expert!", r70: "Molt bé!", r50: "Vas per bon camí", r0: "Cal seguir practicant",
      aciertos: "{ok} de {n} encerts · {p} punts", record: "Nou rècord!", paraRepasar: "Per repassar",
      otra: "Una altra ronda", repasarRonda: "Repassar els fallats", inicio: "Tornar a l'inici",
      sinPares: "Amb aquests bolets no hi ha parelles que es confonguin: tria'n més.",
      sinRepaso: "No tens bolets per repassar: de moment, tot bé!",
      foto: { hoja: "Fulla", tronco: "Tronc", porte: "Arbre", fruto: "Fruit", flor: "Flor" },
      zoom: "Toca per tancar",
    },
  };
  const L = TX[CA ? "ca" : "es"];
  const t = (k, v = {}) => String(L[k] ?? TX.es[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => (v[x] ?? ""));

  // ---------------- Memoria (en el navegador) ----------------
  const CLAVE = "setas:quiz";
  const lee = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
  const S = Object.assign({ best: {}, sp: {}, pref: {} }, lee());
  const guarda = () => { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } };
  const P = Object.assign({ scope: "s41", nivel: "facil", sonido: false }, S.pref);
  const marca = (id, ok) => { const x = (S.sp[id] ||= { ok: 0, ko: 0 }); ok ? x.ok++ : x.ko++; };
  const flojo = (id) => { const x = S.sp[id]; return x ? Math.min(3, Math.max(0, x.ko - x.ok)) : 0; };
  const dominada = (id) => { const x = S.sp[id]; return !!x && x.ok >= 2 && x.ok >= 2 * x.ko; };

  // ---------------- Datos ----------------
  const ESP = DB.especies.filter((e) => (e.fotos || []).length);
  const BY = Object.fromEntries(DB.especies.map((e) => [e.id, e]));
  const ARB_TODOS = DB.arboles.filter((a) => (a.fotos || []).length);
  const BREVE = window.BREVE || { especies: [], arboles: [] };
  const POOL = {
    s41: ESP.filter((e) => BREVE.especies.includes(e.id)),
    s79: ESP.filter((e) => (e.guias || []).includes("esencial")),
    todas: ESP,
  };
  const ARBS = { s41: ARB_TODOS.filter((a) => BREVE.arboles.includes(a.id)), s79: ARB_TODOS, todas: ARB_TODOS };
  // como en la web: en castellano, el nombre castellano primero; en catalán, el catalán
  const comun = (n) => (CA ? (n.ca || [])[0] || (n.es || [])[0] : (n.es || [])[0] || (n.ca || [])[0]) || "";
  const nombre = (e) => cap(comun(e.nombres) || e.nombre);
  const segundo = (e) => e.nombre;
  const nomArbol = (a) => cap(comun(a.nombres) || a.nombre);
  const GRUPO = { comestible: "comestible", condicionada: "comestible", toxica: "toxica", mortal: "mortal" };
  const grupo = (e) => GRUPO[e.comestibilidad.cat] || "no";
  const catTxt = (e) => (V.comestibilidad[e.comestibilidad.cat] || {}).etiqueta || e.comestibilidad.cat;
  const badge = (e) => `<span class="badge b-${esc(e.comestibilidad.cat)}">${esc(catTxt(e))}</span>`;
  // primera frase de un texto (sin cortar en abreviaturas como «C.» ni dentro de un paréntesis)
  const primera = (s, max = 220) => {
    s = String(s || "").trim();
    const re = /[.!?](\s|$)/g;
    let m;
    while ((m = re.exec(s))) {
      const antes = s.slice(0, m.index);
      if (/(^|[\s(])[A-Z]$/.test(antes) || (antes.split("(").length > antes.split(")").length)) continue;
      if (antes.length < 40) continue;              // «Mortal.»: mejor dos frases
      s = s.slice(0, m.index + 1);
      break;
    }
    return s.length > max ? s.slice(0, s.lastIndexOf(" ", max)) + "…" : s;
  };
  // parejas que se confunden (con foto de las dos), para «No las confundas» y para opciones parecidas
  const PAREJA = new Set();
  ESP.forEach((e) => (e.confusiones || []).forEach((c) => { if (c.id && BY[c.id] && c.id !== e.id) { PAREJA.add(e.id + ">" + c.id); PAREJA.add(c.id + ">" + e.id); } }));
  const genero = (e) => e.nombre.split(" ")[0];

  // ---------------- Elegir setas, fotos y opciones ----------------
  function muestra(items, peso, n) {           // muestreo con pesos, sin repetir
    const pool = items.slice(), out = [];
    while (out.length < n && pool.length) {
      const ws = pool.map(peso), tot = ws.reduce((a, b) => a + b, 0);
      let r = Math.random() * tot, i = 0;
      while (i < pool.length - 1 && (r -= ws[i]) > 0) i++;
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }
  let usadas = new Set();
  const PAPELES = { facil: [null, "adulto"], medio: [null, "adulto", "joven", "detalle", "habitat", "variacion"], experto: null };
  function fotoSeta(e) {
    const fs = (e.fotos || []).filter((f) => f.papel !== "recolectado" || P.nivel === "experto");
    let cand = PAPELES[P.nivel] ? fs.filter((f) => PAPELES[P.nivel].includes(f.papel ?? null)) : fs;
    if (P.nivel === "facil" && fs[0]) cand = [fs[0], fs[0], ...cand];          // la foto principal, más a menudo
    const libres = cand.filter((f) => !usadas.has(f.g));
    const f = pick(libres.length ? libres : cand.length ? cand : fs.length ? fs : e.fotos);
    usadas.add(f.g);
    return f;
  }
  const PAPEL_ARB = { facil: ["porte", "hoja"], medio: ["hoja", "tronco"], experto: ["tronco", "fruto", "flor", "hoja"] };
  function fotoArbol(a) {
    const quiere = PAPEL_ARB[P.nivel];
    const cand = a.fotos.filter((f) => quiere.includes(f.papel) && !usadas.has(f.g));
    const f = pick(cand.length ? cand : a.fotos);
    usadas.add(f.g);
    return f;
  }
  // opciones falsas: en fácil, casi al azar; en experto, las que más se parecen
  function falsas(e, pool, n) {
    const k = { facil: 0.15, medio: 0.9, experto: 1.8 }[P.nivel];
    const cands = (pool.length > n + 3 ? pool : ESP).filter((o) => o.id !== e.id && nombre(o) !== nombre(e));
    return muestra(cands, (o) => 1 + k * ((PAREJA.has(e.id + ">" + o.id) ? 8 : 0) + (genero(o) === genero(e) ? 3 : 0)
      + ((o.caracteres || {}).himenoforo === (e.caracteres || {}).himenoforo ? 2 : 0) + (grupo(o) === grupo(e) ? 0.5 : 0)), n);
  }

  // ---------------- Preguntas ----------------
  function pregId(e, pool) {
    const escribir = P.nivel === "experto";
    return { tipo: "id", e, foto: fotoSeta(e), escribir, opciones: escribir ? null : baraja([e, ...falsas(e, pool, 3)]) };
  }
  const pregCome = (e) => ({ tipo: "come", e, foto: fotoSeta(e) });
  function pregConf(par) {
    const [a, b, c] = par;
    return { tipo: "conf", a, b, c, fotos: baraja([[a, fotoSeta(a)], [b, fotoSeta(b)]]) };
  }
  function pregArbol(a, arbs) {
    const otros = muestra(arbs.filter((x) => x.id !== a.id), (x) => (x.grupo === a.grupo ? 3 : 1), Math.min(3, arbs.length - 1));
    return { tipo: "arbol", a, foto: fotoArbol(a), opciones: baraja([a, ...otros]) };
  }
  // parejas «comestible ↔ peligrosa» primero: es lo que más importa no confundir
  function parejas(pool) {
    const ids = new Set(pool.map((e) => e.id)), out = [];
    pool.forEach((e) => (e.confusiones || []).forEach((c) => {
      const b = c.id && BY[c.id];
      if (!b || b.id === e.id || !(b.fotos || []).length || !c.diferencia) return;
      if (!ids.has(b.id) && pool.length < 60) return;                       // en selecciones pequeñas, solo entre ellas
      out.push([e, b, c]);
    }));
    return out;
  }
  function ronda(modo, pool, arbs) {
    usadas = new Set();
    const pesoSeta = (e) => 1 + flojo(e.id) + (modo === "come" && grupo(e) !== "comestible" ? 0.6 : 0);
    let tipos;
    if (modo === "mix" || modo === "repaso") {
      tipos = ["id", "id", "id", "come", "come", "come", "conf", "conf", "conf", modo === "mix" && arbs.length >= 4 ? "arbol" : "id"];
      tipos = baraja(tipos);
    } else tipos = Array(N).fill(modo);
    const setas = muestra(pool, pesoSeta, N);
    while (setas.length < N) setas.push(...muestra(pool, pesoSeta, N - setas.length));
    const pares = parejas(pool);
    // cada pareja, una sola vez por ronda (aunque esté escrita desde las dos setas)
    const vistas = new Set();
    const paresUsados = muestra(pares, ([a, b]) => (grupo(a) !== grupo(b) ? 3 : 1) + flojo(a.id) + flojo(b.id), pares.length)
      .filter(([a, b]) => { const k = [a.id, b.id].sort().join("|"); if (vistas.has(k)) return false; vistas.add(k); return true; });
    const arboles = muestra(arbs, (a) => 1 + flojo("arbol:" + a.id), N);
    while (arboles.length && arboles.length < N) arboles.push(...muestra(arbs, () => 1, N - arboles.length));
    let iS = 0, iP = 0, iA = 0;
    return tipos.map((tp) => {
      if (tp === "conf" && paresUsados[iP]) return pregConf(paresUsados[iP++]);
      if (tp === "arbol" && arboles[iA]) return pregArbol(arboles[iA++], arbs);
      if (tp === "come") return pregCome(setas[iS++ % setas.length]);
      return pregId(setas[iS++ % setas.length], pool);
    });
  }

  // ---------------- Escribir el nombre (nivel experto) ----------------
  const nrm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const clave = (s) => nrm(s).replace(/^(el|la|els|les|l|los|las|un|una) /, "").replace(/ /g, "");
  const generos = {};
  ESP.forEach((e) => (generos[genero(e)] = (generos[genero(e)] || 0) + 1));
  const alias = (e) => [...(e.nombres.ca || []), ...(e.nombres.es || []), e.nombre, generos[genero(e)] === 1 ? genero(e) : ""].filter(Boolean).map(clave);
  function lev(a, b) {
    if (!a.length) return b.length; if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  const acierta = (txt, e) => { const k = clave(txt); return !!k && alias(e).some((a) => lev(k, a) <= (a.length <= 4 ? 0 : a.length <= 8 ? 1 : 2)); };

  // ---------------- Sonido (opcional) y confeti ----------------
  let ac = null;
  function tono(f, d = 0.12, cuando = 0, tipo = "sine") {
    if (!P.sonido) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + cuando;
      o.type = tipo; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + d + 0.02);
    } catch (e) { /* sin audio */ }
  }
  const suenaBien = () => { tono(660, 0.1); tono(880, 0.16, 0.09); };
  const suenaMal = () => tono(196, 0.28, 0, "triangle");
  function confeti() {
    if (!MOV) return;
    const c = $("#confeti"), colores = ["#2f5d3a", "#b5501a", "#d9a441", "#7fb069", "#e07a5f", "#f2cc8f"];
    c.innerHTML = Array.from({ length: 70 }, () => `<i style="left:${Math.random() * 100}%;background:${pick(colores)};--d:${(1.4 + Math.random() * 1.4).toFixed(2)}s;--r:${Math.round(Math.random() * 720 - 360)}deg;--x:${Math.round(Math.random() * 120 - 60)}px;animation-delay:${(Math.random() * 0.4).toFixed(2)}s"></i>`).join("");
    setTimeout(() => (c.innerHTML = ""), 3200);
  }

  // ---------------- Pantalla de inicio ----------------
  const MODOS = [["id", "📸"], ["come", "⚠️"], ["conf", "🔍"], ["arbol", "🌲"], ["mix", "🎲"]];
  const claveRecord = (modo) => `${modo}|${P.scope}|${P.nivel}`;
  function inicio() {
    const pool = POOL[P.scope], dom = pool.filter((e) => dominada(e.id)).length;
    const flojas = ESP.filter((e) => flojo(e.id) > 0);
    const seg = (nombreGrupo, valor, opciones) => `<div class="q-seg" role="group" aria-label="${esc(nombreGrupo)}">${opciones.map(([v, txt]) => `<button type="button" data-${nombreGrupo === t("nivel") ? "nivel" : "scope"}="${v}" aria-pressed="${v === valor}">${esc(txt)}</button>`).join("")}</div>`;
    app.innerHTML = `<section class="q-inicio">
      <div class="q-hero">
        <p class="q-kicker">${esc(t("kicker"))}</p>
        <h1>${esc(t("titulo"))}</h1>
        <p class="q-intro">${esc(t("intro"))}</p>
        <div class="q-dom"><span>${esc(t("dominas", { n: dom, t: pool.length }))}</span><span class="q-barra"><i style="width:${pool.length ? Math.round((100 * dom) / pool.length) : 0}%"></i></span></div>
      </div>
      <div class="q-opciones">
        <div class="q-op"><span class="q-op-t">${esc(t("setas"))}</span>${seg(t("setas"), P.scope, [["s41", t("s41", { n: POOL.s41.length })], ["s79", t("s79")], ["todas", t("todas", { n: ESP.length })]])}</div>
        <div class="q-op"><span class="q-op-t">${esc(t("nivel"))}</span>${seg(t("nivel"), P.nivel, [["facil", t("facil")], ["medio", t("medio")], ["experto", t("experto")]])}<small class="q-op-d">${esc(t(P.nivel + "_d"))}</small></div>
      </div>
      <h2 class="q-h">${esc(t("eligeModo"))}</h2>
      <div class="q-modos">${MODOS.map(([m, ico]) => {
        const r = S.best[claveRecord(m)];
        return `<button type="button" class="q-modo q-modo-${m}" data-modo="${m}"><span class="q-modo-ico" aria-hidden="true">${ico}</span><b>${esc(t("m_" + m))}</b><small>${esc(t("m_" + m + "_d"))}</small>${r ? `<span class="q-modo-rec">🏆 ${esc(t("mejor", { n: r }))}</span>` : ""}</button>`;
      }).join("")}</div>
      <div class="q-acc">
        ${flojas.length ? `<button type="button" class="btn prim" data-modo="repaso">${esc(t("repasar", { n: flojas.length }))}</button>` : ""}
        <button type="button" class="btn" id="q-sonido" aria-pressed="${P.sonido}">${esc(P.sonido ? t("sonOn") : t("sonOff"))}</button>
      </div>
      <p class="q-aviso">⚠ ${esc(t("aviso"))}</p>
    </section>`;
    $$("[data-scope]").forEach((b) => (b.onclick = () => { P.scope = b.dataset.scope; S.pref = P; guarda(); inicio(); }));
    $$("[data-nivel]").forEach((b) => (b.onclick = () => { P.nivel = b.dataset.nivel; S.pref = P; guarda(); inicio(); }));
    $$("[data-modo]").forEach((b) => (b.onclick = () => empieza(b.dataset.modo)));
    $("#q-sonido").onclick = () => { P.sonido = !P.sonido; S.pref = P; guarda(); if (P.sonido) suenaBien(); inicio(); };
    window.scrollTo(0, 0);
  }

  // ---------------- Ronda ----------------
  let R0 = null;   // estado de la ronda
  function empieza(modo, soloEstas) {
    let pool = POOL[P.scope], arbs = ARBS[P.scope];
    if (modo === "repaso") pool = soloEstas || ESP.filter((e) => flojo(e.id) > 0);
    if (soloEstas && modo !== "repaso") pool = soloEstas;
    if (!pool.length) { aviso(t("sinRepaso")); return; }
    if (modo === "conf" && !parejas(pool).length) { aviso(t("sinPares")); return; }
    const preguntas = ronda(modo, pool, arbs);
    R0 = { modo, preguntas, i: 0, ok: 0, pts: 0, racha: 0, fallos: [] };
    pregunta();
  }
  function aviso(txt) {
    const p = $(".q-aviso");
    if (p) { p.textContent = txt; p.classList.add("q-aviso-on"); }
  }
  const cabecera = () => `<div class="q-cab">
      <button type="button" class="q-salir" id="q-salir" aria-label="${esc(t("salir"))}">✕</button>
      <span class="q-num">${esc(t("de", { i: R0.i + 1, n: R0.preguntas.length }))}</span>
      <span class="q-barra"><i style="width:${Math.round((100 * R0.i) / R0.preguntas.length)}%"></i></span>
      <span class="q-pts" id="q-pts">${esc(t("puntos", { n: R0.pts }))}</span>
      ${R0.racha >= 2 ? `<span class="q-racha" title="${esc(t("racha"))}">🔥 ${R0.racha}</span>` : ""}
    </div>`;
  const fotoHTML = (f, extra = "") => `<button type="button" class="q-foto${extra}" data-zoom="${esc(R(f.g))}" aria-label="${esc(t("zoom"))}"><img src="${esc(R(f.g))}" alt=""></button>`;
  const opcion = (i, html, attrs) => `<button type="button" class="q-opc" data-i="${i}" ${attrs || ""}><span class="q-key">${i + 1}</span><span class="q-opc-t">${html}</span></button>`;

  function pregunta() {
    const q = R0.preguntas[R0.i];
    let cuerpo = "";
    if (q.tipo === "id") {
      cuerpo = `<h1 class="q-preg">${esc(t("q_id"))}</h1>${fotoHTML(q.foto)}
        ${q.escribir ? `<form class="q-escribe" id="q-form" autocomplete="off"><input id="q-txt" type="text" placeholder="${esc(t("escribe"))}" aria-label="${esc(t("escribe"))}" autocapitalize="off" spellcheck="false">
          <button class="btn prim" type="submit">${esc(t("comprobar"))}</button><button class="btn" type="button" id="q-nose">${esc(t("nolose"))}</button></form>`
        : `<div class="q-opcs">${q.opciones.map((o, i) => opcion(i, `<b>${esc(nombre(o))}</b><small>${esc(segundo(o))}</small>`)).join("")}</div>`}`;
    } else if (q.tipo === "come") {
      const ops = [["comestible", t("c_comestible")], ["no", t("c_no")], ["toxica", t("c_toxica")], ["mortal", t("c_mortal")]];
      cuerpo = `<h1 class="q-preg">${esc(t("q_come"))}</h1>${fotoHTML(q.foto)}
        <p class="q-sub"><b>${esc(nombre(q.e))}</b> · <i>${esc(q.e.nombre)}</i></p>
        <div class="q-opcs q-opcs-come">${ops.map(([g, txt], i) => opcion(i, `<b>${esc(txt)}</b>`, `data-g="${g}"`)).join("")}</div>`;
    } else if (q.tipo === "conf") {
      const g = (e) => t({ comestible: "c_comestible", no: "c_no", toxica: "c_toxica", mortal: "c_mortal" }[grupo(e)]).toLowerCase();
      cuerpo = `<h1 class="q-preg q-preg-conf">${t("q_conf", { a: esc(nombre(q.a)), b: esc(nombre(q.b)), ca: esc(g(q.a)), cb: esc(g(q.b)) })}</h1>
        <div class="q-dos">${q.fotos.map(([e, f], i) => `<div class="q-una">${fotoHTML(f)}${opcion(i, `<b>${esc(t("esta"))}</b>`, `data-id="${esc(e.id)}"`)}</div>`).join("")}</div>`;
    } else {
      cuerpo = `<h1 class="q-preg">${esc(t("q_arbol"))}</h1><div class="q-foto-arb">${fotoHTML(q.foto)}<span class="q-etq">${esc(L.foto[q.foto.papel] || "")}</span></div>
        <div class="q-opcs">${q.opciones.map((o, i) => opcion(i, `<b>${esc(nomArbol(o))}</b><small>${esc(o.nombre)}</small>`)).join("")}</div>`;
    }
    app.innerHTML = `<section class="q-ronda">${cabecera()}<div class="q-cuerpo">${cuerpo}</div><div id="q-fb" class="q-fb" hidden></div>
      <p class="q-atajos">${esc(t("atajos"))}</p></section>`;
    $("#q-salir").onclick = inicio;
    $$("[data-zoom]").forEach((b) => (b.onclick = () => zoom(b.dataset.zoom)));
    $$(".q-opc").forEach((b) => (b.onclick = () => responde(+b.dataset.i)));
    const form = $("#q-form");
    if (form) {
      form.onsubmit = (ev) => { ev.preventDefault(); responde(null, $("#q-txt").value); };
      $("#q-nose").onclick = () => responde(null, "");
      setTimeout(() => { const x = $("#q-txt"); if (x && !x.disabled) x.focus({ preventScroll: true }); }, 50);
    }
    window.scrollTo({ top: 0, behavior: MOV ? "smooth" : "auto" });
  }

  function responde(i, texto) {
    const q = R0.preguntas[R0.i];
    if (q.respondida) return;
    q.respondida = true;
    let bien, id;
    if (q.tipo === "id") {
      bien = q.escribir ? acierta(texto || "", q.e) : q.opciones[i] === q.e;
      id = q.e.id;
      if (!q.escribir) marcaOpciones((j) => q.opciones[j] === q.e, i);
    } else if (q.tipo === "come") {
      const g = grupo(q.e), botones = $$(".q-opc");
      bien = botones[i].dataset.g === g;
      id = q.e.id;
      marcaOpciones((j) => botones[j].dataset.g === g, i);
    } else if (q.tipo === "conf") {
      bien = q.fotos[i][0] === q.a;
      id = q.a.id;
      marcaOpciones((j) => q.fotos[j][0] === q.a, i);
      $$(".q-una").forEach((u, j) => u.classList.add(q.fotos[j][0] === q.a ? "q-es" : "q-no-es"));
    } else {
      bien = q.opciones[i] === q.a;
      id = "arbol:" + q.a.id;
      marcaOpciones((j) => q.opciones[j] === q.a, i);
    }
    marca(id, bien);
    if (q.tipo === "conf") marca(q.b.id, bien);
    guarda();
    if (bien) {
      R0.ok++; R0.racha++;
      const extra = Math.min(R0.racha - 1, 5) * 2 + (q.tipo === "id" && q.escribir ? 5 : 0);
      R0.pts += 10 + extra;
      suenaBien();
    } else {
      R0.racha = 0;
      R0.fallos.push(q);
      suenaMal();
    }
    const pts = $("#q-pts");
    if (pts) { pts.textContent = t("puntos", { n: R0.pts }); if (bien) { pts.classList.remove("q-sube"); void pts.offsetWidth; pts.classList.add("q-sube"); } }
    feedback(q, bien, texto);
  }
  function marcaOpciones(esBuena, elegida) {
    $$(".q-opc").forEach((b, j) => { b.disabled = true; if (esBuena(j)) b.classList.add("q-ok"); else if (j === elegida) b.classList.add("q-ko"); });
  }

  function feedback(q, bien, texto) {
    const fb = $("#q-fb");
    const titulo = bien ? pick(L.bien) : q.tipo === "come" ? t("malCome", { c: catTxt(q.e).toLowerCase() }) : q.tipo === "conf" ? t("malConf") : t("mal");
    let html = "";
    const ficha = (e) => `<a class="q-ficha" href="${WEB}#/especie/${esc(e.id)}" target="_blank" rel="noopener">${esc(t("verFicha"))}</a>`;
    const tarjeta = (e, f) => `<div class="q-sp">${f ? `<img src="${esc(R(f.t || f.g))}" alt="">` : ""}<div><b>${esc(nombre(e))}</b> <i>${esc(e.nombre)}</i><br>${badge(e)}</div></div>`;
    if (q.tipo === "id" || q.tipo === "come") {
      const e = q.e, claves = ((e.identificacion || {}).claves || []).slice(0, 2);
      html = `${tarjeta(e, q.foto)}
        ${q.tipo === "come" ? `<p class="q-txt">${esc(primera(e.comestibilidad.texto))}</p>${e.comestibilidad.cat === "condicionada" ? `<p class="q-txt q-mini">${esc(t("condic"))}</p>` : ""}` : ""}
        ${q.tipo === "id" && q.escribir && !bien && texto ? `<p class="q-txt q-mini">«${esc(texto)}» ≠ ${esc(nombre(e))}</p>` : ""}
        ${claves.length ? `<ul class="q-claves">${claves.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
        ${ficha(e)}`;
    } else if (q.tipo === "conf") {
      html = `<div class="q-par">${tarjeta(q.a)}${tarjeta(q.b)}</div>
        <p class="q-txt"><b>${esc(t("distinguir"))}</b> <span class="q-de">${esc(nombre(q.b))}:</span> ${esc(q.c.diferencia)}${q.c.donde ? ` <b>${esc(t("mirelo"))}</b> ${esc(q.c.donde)}` : ""}</p>
        <span class="q-fichas">${[q.a, q.b].map((e) => `<a class="q-ficha" href="${WEB}#/especie/${esc(e.id)}" target="_blank" rel="noopener">${esc(t("verX", { n: nombre(e) }))}</a>`).join(" ")}</span>`;
    } else {
      const a = q.a, r = a.reconocer || {};
      html = `<div class="q-sp"><img src="${esc(R(q.foto.t || q.foto.g))}" alt=""><div><b>${esc(nomArbol(a))}</b> <i>${esc(a.nombre)}</i></div></div>
        <p class="q-txt">${esc(primera(r.distancia))}${r.hojas ? ` ${esc(primera(r.hojas))}` : ""}</p>
        <a class="q-ficha" href="${WEB}#/arbol/${esc(a.id)}" target="_blank" rel="noopener">${esc(t("verArbol"))}</a>`;
    }
    const ultima = R0.i === R0.preguntas.length - 1;
    fb.className = "q-fb " + (bien ? "q-fb-ok" : "q-fb-ko");
    fb.innerHTML = `<p class="q-fb-t">${bien ? "✔" : "✘"} ${esc(titulo)}</p>${html}
      <button type="button" class="btn prim q-sig" id="q-sig">${esc(ultima ? t("verRes") : t("sig"))}</button>`;
    fb.hidden = false;
    const form = $("#q-form");
    if (form) $$("input, button", form).forEach((x) => (x.disabled = true));
    $("#q-sig").onclick = siguiente;
    setTimeout(() => {
      const sig = $("#q-sig");
      if (!sig || fb.hidden) return;                // ya ha pasado a la siguiente
      fb.scrollIntoView({ behavior: MOV ? "smooth" : "auto", block: "nearest" });
      sig.focus({ preventScroll: true });
    }, 60);
  }
  function siguiente() {
    R0.i++;
    if (R0.i < R0.preguntas.length) pregunta(); else resultado();
  }

  // ---------------- Resultado ----------------
  function resultado() {
    const n = R0.preguntas.length, pct = Math.round((100 * R0.ok) / n);
    const k = claveRecord(R0.modo), antes = S.best[k] || 0, record = R0.modo !== "repaso" && R0.pts > antes;
    if (record) { S.best[k] = R0.pts; guarda(); }
    const titulo = pct >= 90 ? t("r90") : pct >= 70 ? t("r70") : pct >= 50 ? t("r50") : t("r0");
    const estrellas = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
    // lo fallado, sin repetir: setas y árboles
    const vistos = new Set(), fallos = [];
    R0.fallos.forEach((q) => {
      const e = q.tipo === "arbol" ? q.a : q.tipo === "conf" ? q.a : q.e, id = (q.tipo === "arbol" ? "a:" : "") + e.id;
      if (vistos.has(id)) return; vistos.add(id);
      fallos.push({ q, e, arbol: q.tipo === "arbol" });
    });
    const setasFalladas = fallos.filter((x) => !x.arbol).map((x) => x.e);
    app.innerHTML = `<section class="q-res">
      <div class="q-estrellas" aria-hidden="true">${[1, 2, 3].map((i) => `<span class="${i <= estrellas ? "on" : ""}">★</span>`).join("")}</div>
      <h1>${esc(titulo)}</h1>
      <p class="q-res-n">${esc(t("aciertos", { ok: R0.ok, n, p: R0.pts }))}</p>
      ${record ? `<p class="q-record">🏆 ${esc(t("record"))}</p>` : ""}
      ${fallos.length ? `<h2 class="q-h">${esc(t("paraRepasar"))}</h2><div class="q-fallos">${fallos.map(({ e, arbol }) => {
        const f = (e.fotos || [])[0];
        return `<a class="q-fallo" href="${WEB}#/${arbol ? "arbol" : "especie"}/${esc(e.id)}" target="_blank" rel="noopener">${f ? `<img src="${esc(R(f.t || f.g))}" alt="" loading="lazy">` : ""}<span><b>${esc(arbol ? nomArbol(e) : nombre(e))}</b><i>${esc(e.nombre)}</i>${arbol ? "" : badge(e)}</span></a>`;
      }).join("")}</div>` : ""}
      <div class="q-acc">
        <button type="button" class="btn prim" id="q-otra">${esc(t("otra"))}</button>
        ${setasFalladas.length ? `<button type="button" class="btn" id="q-rep">${esc(t("repasarRonda"))}</button>` : ""}
        <button type="button" class="btn" id="q-ini">${esc(t("inicio"))}</button>
      </div>
      <p class="q-aviso">⚠ ${esc(t("aviso"))}</p>
    </section>`;
    $("#q-otra").onclick = () => empieza(R0.modo === "repaso" ? "mix" : R0.modo);
    const rep = $("#q-rep");
    if (rep) rep.onclick = () => empieza("repaso", setasFalladas);
    $("#q-ini").onclick = inicio;
    if (pct >= 70) confeti();
    window.scrollTo(0, 0);
  }

  // ---------------- Ampliar foto y teclado ----------------
  function zoom(src) {
    const z = $("#zoom");
    z.innerHTML = `<img src="${esc(src)}" alt=""><span>${esc(t("zoom"))}</span>`;
    z.hidden = false;
    z.onclick = () => (z.hidden = true);
  }
  document.addEventListener("keydown", (ev) => {
    if (ev.target.tagName === "INPUT") return;
    if (ev.key === "Escape") { $("#zoom").hidden = true; return; }
    const sig = $("#q-sig");
    if (ev.key === "Enter" && sig && !$("#q-fb").hidden) { ev.preventDefault(); sig.click(); return; }
    const n = parseInt(ev.key, 10);
    if (n >= 1 && n <= 4) { const b = $$(".q-opc")[n - 1]; if (b && !b.disabled) b.click(); }
  });

  document.title = t("titulo") + " · Cistella Segura";
  inicio();
})();
