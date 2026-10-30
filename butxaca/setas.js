// Setas esenciales de Cataluña · Cuaderno de bolsillo (A6, castellano)
// Monta el librito a partir de los datos de la web (../datos/db.js): las 79 especies «esenciales».
"use strict";
(() => {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
  const G = s => "../" + s;
  const book = document.getElementById("book");
  const V = DB.vocabulario;
  const ARB = Object.fromEntries(DB.arboles.map(a => [a.id, a]));
  const PAGE_OF = {};
  const REPORT = { overflow: [] };
  const EXTRA = [];

  // ---------- configuración ----------
  // Dos libros con el mismo código: el cuaderno de bolsillo (A6) y, con window.CUADERNO_MODO = "guia",
  // la guía esencial (A5, butxaca/guia.html): todas las setas de la guía, cada una en una página como mucho
  // (las del cuaderno, página entera; las demás, media página) y los árboles en poco espacio.
  const GUIA = window.CUADERNO_MODO === "guia";
  const EDICION = "Otoño 2026";
  // portada: rossinyols en el cuaderno; ceps en la guía (para distinguirlos a primera vista)
  const PORTADA = GUIA ? { id: "boletus-edulis", papel: "recolectado" } : { id: "cantharellus-cibarius", papel: "recolectado" };

  // Cuaderno breve: solo las setas y árboles imprescindibles (lista en ../datos/breve.js, la misma que usa el quiz).
  // Las que se confunden con cada una salen dentro de su ficha, con foto pequeña.
  const BREVE = window.BREVE;
  // Setas casi iguales que van juntas en una sola página, con sus pequeñas diferencias
  // (fotos: [especie, foto (ruta g), pie corto]; filas: [qué, la primera, la segunda])
  const PAREJAS = [{
    ids: ["lactarius-sanguifluus", "lactarius-deliciosus"],
    nombre: "Rovelló y pinetell",
    lat: "<i>Lactarius sanguifluus</i> y <i>L. deliciosus</i> · níscalos, rebollones",
    lede: "Casi iguales y los dos comestibles excelentes. Lo que los separa es el color del látex al cortarlos.",
    fotos: [["lactarius-sanguifluus", "fotos/g/db970a74779d.jpg", "Rovelló: naranja vinoso, con pocas zonas."],
      ["lactarius-deliciosus", "fotos/g/87b9e09821d1.jpg", "Pinetell: zonas bien marcadas."],
      ["lactarius-deliciosus", "fotos/g/8bd69c6b0fd3.jpg", "Pinetell: láminas naranja vivo."]],
    filas: [["Látex", "Rojo vino desde el primer momento", "Naranja zanahoria; no pasa a vino"],
      ["Láminas", "Rosa vinoso o lila", "Naranja vivo"],
      ["Dónde", "Pino carrasco y piñonero, a menudo en suelo calizo; de la costa a la montaña media", "Pino silvestre y laricio: pinares más frescos y de montaña, umbrías"]],
    claves: ["Láminas que se manchan de verde al tocarlas.", "Pie corto y hueco, con hoyuelos más oscuros.",
      "Látex de color al cortar: si es blanco, descártelo.", "Siempre bajo pinos."],
    compruebe: "Corte el pie y mire el color del látex en el primer momento."
  }];
  const EN_PAREJA = new Map(PAREJAS.flatMap(c => c.ids.map((id, i) => [id, [c, i]])));
  const ESENCIAL = DB.especies.filter(e => BREVE.especies.includes(e.id) || (GUIA && (e.guias || []).includes("esencial")));
  // en la guía, las que no están en el cuaderno de bolsillo van en media página (dos por página)
  const MEDIA = e => GUIA && !BREVE.especies.includes(e.id);
  const BY = Object.fromEntries(ESENCIAL.map(e => [e.id, e]));
  const TODAS = Object.fromEntries(DB.especies.map(e => [e.id, e]));   // para la foto de las que se confunden

  const SEC = {
    guia: { t: "Guía", c: "var(--guide)", y: 9 },
    comestibles: { t: "Comestibles", c: "var(--ok)", y: 29 },
    // pestañas del margen en el orden del libro: comestibles, tóxicas, mortales
    toxicas: { t: "Tóxicas", c: "var(--warn)", y: 49 },
    mortales: { t: "Mortales", c: "var(--deadly)", y: 69 },
    anexo: { t: "Anexo", c: "var(--annex)", y: 109 },
    sos: { t: "SOS", c: "var(--ink)", y: 126 }
  };
  const EST = {
    comestible: { pill: "Comestible", st: "comestible", sec: "comestibles" },
    condicionada: { pill: "Condicionada", st: "precaucio", sec: "comestibles" },
    mortal: { pill: "Mortal", st: "mortal", sec: "mortales" },
    toxica: { pill: "Tóxica", st: "toxic", sec: "toxicas" },
    no_comestible: { pill: "No comestible", st: "precaucio", sec: "toxicas" }
  };
  const PEL = { mortal: "mortal", toxica: "tóxica", no_comestible: "no comestible", condicionada: "condicionada", comestible: "comestible" };
  const SEV = { mortal: 0, toxica: 1, no_comestible: 2, condicionada: 3, comestible: 4 };
  const DIF = { baja: [1, "Fácil"], media: [2, "Media"], alta: [3, "Difícil"] };
  const MESL = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const HIM_ICON = { laminas: "lamines", poros: "porus", pliegues: "plecs", aguijones: "agullons", liso: "plecs" };

  const comestible = e => ["comestible", "condicionada"].includes(e.comestibilidad.cat);
  const GROUPS = {
    comestibles: ESENCIAL.filter(comestible),
    mortales: ESENCIAL.filter(e => e.comestibilidad.cat === "mortal"),
    toxicas: ESENCIAL.filter(e => ["toxica", "no_comestible"].includes(e.comestibilidad.cat))
  };
  const ORDEN = [...GROUPS.comestibles, ...GROUPS.toxicas, ...GROUPS.mortales];

  // ---------- nombres ----------
  const titulo = e => cap(e.nombres.ca[0] || e.nombres.es[0]) || e.nombre;
  const sinNombre = e => !e.nombres.ca[0] && !e.nombres.es[0];
  const tituloHTML = e => (sinNombre(e) ? `<i>${esc(e.nombre)}</i>` : esc(titulo(e)));
  const nombreConf = c => (c.ca || c.es ? esc(cap(c.ca || c.es)) : `<i>${esc(c.nombre)}</i>`);

  // ---------- iconos ----------
  const svg = d => `<svg viewBox="0 0 12 12" aria-hidden="true">${d}</svg>`;
  const ICON = {
    pineda: svg('<path d="M6 .6 9.3 5.1H7.7l2.7 3.7H6.9V11.4H5.1V8.8H1.6l2.7-3.7H2.7z"/>'),
    fulla: svg('<path d="M6 .7c2.6 0 4.5 1.9 4.5 4.3 0 2.1-1.6 3.7-3.6 3.9v2.5H5.1V8.9C3.1 8.7 1.5 7.1 1.5 5 1.5 2.6 3.4.7 6 .7z"/>'),
    prat: svg('<path d="M1.2 11.3c.2-2.8 1-5 2.3-6.7-.5 2.2.1 4.4.6 6.7zm3.1 0c.1-3.3.9-6.2 2.6-8.9-.6 3.2-.2 6 .4 8.9zm3.5 0c.2-2.5 1-4.6 2.4-6.2-.4 2-.1 4.1.3 6.2zM.6 11.1h10.8v.8H.6z"/>'),
    fusta: svg('<path d="M2.6 3.8h6.8a2.6 2.6 0 0 1 0 5.2H2.6a2.6 2.6 0 0 1 0-5.2z"/><ellipse cx="9.4" cy="6.4" rx="1.5" ry="1.9" fill="#fff" fill-opacity=".6"/>'),
    lamines: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><path d="M1.9 5.6v2.1M3.2 5.6v2.8M4.6 5.6v3.2M6 5.6v3.4M7.4 5.6v3.2M8.8 5.6v2.8M10.1 5.6v2.1" stroke="currentColor" stroke-width=".7" fill="none"/>'),
    porus: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><rect x="1.4" y="5.8" width="9.2" height="3.6" rx=".8"/><g fill="#fff"><circle cx="3" cy="7.6" r=".55"/><circle cx="4.7" cy="7.6" r=".55"/><circle cx="6.4" cy="7.6" r=".55"/><circle cx="8.1" cy="7.6" r=".55"/><circle cx="9.5" cy="7.6" r=".45"/></g>'),
    plecs: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><path d="M2.6 5.6c.4 1.2-.2 2.4.3 3.8M4.6 5.6c.4 1.4-.3 2.8.2 4.4M6.6 5.6c.4 1.4-.3 2.8.2 4.4M8.6 5.6c.4 1.2-.2 2.4.3 3.8" stroke="currentColor" stroke-width=".75" fill="none"/>'),
    agullons: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><path d="M1.8 5.6l.5 2.4.5-2.4zM3.6 5.6l.5 3 .5-3zM5.5 5.6l.5 3.3.5-3.3zM7.4 5.6l.5 3 .5-3zM9.2 5.6l.5 2.4.5-2.4z"/>'),
    altres: svg('<circle cx="6" cy="6.3" r="4.6"/><circle cx="4.4" cy="4.6" r=".7" fill="#fff" fill-opacity=".6"/><circle cx="7" cy="5.2" r=".5" fill="#fff" fill-opacity=".6"/>'),
    monte: svg('<path d="M.4 10.9 4.3 3.6l2.1 3.6 1.5-2.3 3.7 6z"/><path d="m3.3 5.5 1-1.9 1 1.7-.6-.4-.4.5z" fill="#fff" fill-opacity=".7"/>')
  };

  // ---------- utilidades ----------
  const overflows = p => p.scrollHeight > p.clientHeight + 1;
  const primera = (t, max = 999) => {
    t = String(t || "").trim();
    const m = t.match(/^.*?[.!?](\s|$)/);
    const s = m ? m[0].trim() : t;
    return s.length <= max ? s : s.slice(0, s.lastIndexOf(" ", max)) + "…";
  };
  const hasta = (t, max) => {
    // frases completas mientras quepan en max caracteres
    const fr = String(t || "").match(/[^.!?]+[.!?]+(\s|$)/g) || [String(t || "")];
    let out = "";
    for (const f of fr) { if ((out + f).length > max && out) break; out += f; }
    return out.trim();
  };
  // quita las frases sobre la normativa de venta (RD 30/2009): no sirven en el monte
  // (y los trozos sin letras que quedan al cortar, como el «).» de «Inocybe sp.).»)
  const sinNormativa = t => (String(t || "").match(/[^.!?]+[.!?]+(\s|$)/g) || [String(t || "")]).filter(f => !/RD\s?30\/2009|anexo del RD|venta/i.test(f) && /[a-záéíóúñü]{2}/i.test(f)).join("").trim() || String(t || "");
  const lista = arr =>(arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1]);

  // ---------- tóxicas: qué gravedad tiene y por qué ----------
  function gravedad(e) {
    const cat = e.comestibilidad.cat, t = e.toxicidad || {};
    if (cat === "mortal") return [3, "Mortal"];
    if (cat === "toxica") return /intens|grave|muerte|rabdomi|muscar|neurot/i.test([e.comestibilidad.texto, t.sindrome, t.sintomas].join(" ")) ? [2, "Grave"] : [1, "Moderada"];
    return [1, "Leve"];
  }
  // la causa, según el síndrome (toxicología clínica estándar)
  const CAUSA = [
    [/faloid/i, "Amatoxinas: destruyen el hígado. No se van al cocinarla, congelarla ni secarla."],
    [/orell/i, "Orellanina: destruye los riñones, días o semanas después de comerla."],
    [/giromitr/i, "Giromitrina: daña el hígado y el sistema nervioso; cocinarla o secarla no la hace segura."],
    [/paxíl|hemol/i, "Tras comerla varias veces, el cuerpo ataca su propia sangre y pueden fallar los riñones."],
    [/rabdomi/i, "Destruye los músculos, también el del corazón, si se come varios días seguidos."],
    [/muscar/i, "Muscarina: sudor, saliva y lágrimas a chorro y el pulso se vuelve lento."],
    [/panter|micoatrop/i, "Ácido iboténico y muscimol: actúan sobre el cerebro."],
    [/gastro/i, "Irrita el estómago y el intestino."]
  ];
  function causa(e) {
    const s = e.toxicidad?.sindrome || "";
    const c = CAUSA.find(([re]) => re.test(s));
    if (c) return c[1];
    const fr = String(e.comestibilidad.texto || "").match(/[^.!?]+[.!?]+(\s|$)/g) || [e.comestibilidad.texto || ""];
    return (fr.find(f => /gastro|digest|molest|trastorn/i.test(f)) || fr[0]).trim();
  }
  const gravedadHTML = e => {
    const [n, t] = gravedad(e);
    return `<p class="grav"><span class="lab">Gravedad</span><span class="gd">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span><b>${t}.</b> ${esc(causa(e))}</p>`;
  };
  // olor y sabor, solo si son peculiares (harina, anís, picante, amargo…); fuera los avisos entre paréntesis
  const AVISO = /\s*\((?:[^)]*(?:dato|subjetiv|diagnóstic|pruebe)[^)]*)\)/gi;
  const PECULIAR = /harin|anís|almendra|albaricoque|rábano|carroña|tinta|fenol|picante|amarg|avellana|ajo|dulzón|perfumad|yodo/i;
  function olorSabor(e, ok) {
    const m = e.morfologia || {};
    const lim = s => String(s || "").replace(AVISO, "").trim().replace(/\.$/, "");
    const o = lim(m.olor), s = lim(m.sabor) || (/amarg/i.test(m.carne || "") ? "Algo amargo" : "");
    const partes = [];
    if (PECULIAR.test(o) && !/poco diagnóstico/i.test(m.olor || "")) partes.push(`<span class="lab">Olor</span>${esc(o)}.`);
    if (PECULIAR.test(s)) partes.push(`<span class="lab">Sabor</span>${esc(s)}${ok ? "" : " (no la pruebe)"}.`);
    return partes.length ? `<p class="os">${partes.join(" ")}</p>` : "";
  }

  function newPage(sec, cls = "") {
    const p = document.createElement("section");
    p.className = "page " + cls;
    if (sec) {
      p.dataset.sec = sec;
      const s = SEC[sec];
      p.innerHTML = `<div class="tab" style="--tab-y:${s.y}mm;--tab-c:${s.c}"><span>${s.t}</span></div>`;
    }
    book.appendChild(p);
    return p;
  }
  const foot = label => `<footer class="pf"><span>${esc(label)}</span><span class="pn"></span></footer>`;
  const ref = (id, corto = false) => (BY[id] ? `<span class="ref" data-ref="${id}"${corto ? ' data-fmt="n"' : ""}>${corto ? "00" : "→ p. 00"}</span>` : "");

  function fit(p, steps, name) {
    for (const s of steps) {
      if (!overflows(p)) return;
      if (typeof s === "function") s(p);
      else if (s.startsWith(".")) p.querySelectorAll(s).forEach(n => n.remove());
      else p.classList.add(s);
    }
    if (overflows(p)) REPORT.overflow.push(`${name}: +${p.scrollHeight - p.clientHeight}px`);
  }
  const quitaUltimo = sel => p => { const l = p.querySelectorAll(sel); if (l.length > 2) l[l.length - 1].remove(); };

  function flow(items, mkPage, name) {
    let p = mkPage(false);
    let box = p.querySelector(".flow");
    for (const html of items) {
      box.insertAdjacentHTML("beforeend", html);
      if (overflows(p) && box.children.length > 1) {
        box.lastElementChild.remove();
        p = mkPage(true);
        box = p.querySelector(".flow");
        box.insertAdjacentHTML("beforeend", html);
      }
      if (overflows(p)) REPORT.overflow.push(`${name}: bloque demasiado largo`);
    }
  }

  // Lee listas y tablas de los textos HTML de la guía
  const html = h => { const d = document.createElement("div"); d.innerHTML = h || ""; return d; };
  const listaTras = (d, re) => {
    const h = [...d.querySelectorAll("h2")].find(x => re.test(x.textContent));
    let n = h && h.nextElementSibling;
    while (n && !/^(OL|UL)$/.test(n.tagName)) n = n.nextElementSibling;
    return n ? [...n.children] : [];
  };
  const partes = li => {
    const st = li.querySelector("strong");
    const t = st ? st.textContent.trim() : "";
    const rest = li.textContent.replace(t, "").replace(/^\s*[:.]\s*/, "").trim();
    return [t.replace(/[.:]$/, ""), rest];
  };

  // ---------- fotos ----------
  function pickPhotos(e) {
    const fs = e.fotos || [];
    if (!fs.length) return [];
    const main = fs.find(f => f.papel === "adulto") || fs.find(f => !f.papel) || fs[0];
    const out = [main];
    for (const papel of ["detalle", "joven", "variacion", "habitat", null, "recolectado", "viejo"]) {
      for (const f of fs) { if (out.length >= 3) break; if (f.papel === papel && !out.includes(f)) out.push(f); }
    }
    return out.slice(0, 3);
  }
  // fotos elegidas a mano cuando las automáticas no sirven (ou de reig: entero, láminas amarillas y saliendo del huevo)
  const FOTOS_CUADERNO = { "amanita-caesarea": ["fotos/g/8205426474fa.jpg", "fotos/g/6e4d41ce5c8f.jpg", "fotos/g/0fe1b13bc174.jpg"] };
  const PICK = Object.fromEntries(ESENCIAL.map(e => {
    const fijas = (FOTOS_CUADERNO[e.id] || []).map(g => (e.fotos || []).find(f => f.g === g)).filter(Boolean);
    return [e.id, fijas.length ? fijas : pickPhotos(e)];
  }));
  const thumb = id => { const f = PICK[id]?.[0]; return f ? G(f.t || f.g) : ""; };
  const shortCap = (c, max) => {
    c = String(c || "").trim();
    if (c.length <= max) return c;
    const i = c.indexOf(":");
    if (i > 3 && i <= max) return c.slice(0, i);
    const cut = c.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "") + "…";
  };
  const figure = (f, cls, max) => `<figure class="${cls}"><img src="${G(f.g || f.t)}" alt="">${f.pie ? `<figcaption>${esc(shortCap(f.pie, max))}</figcaption>` : ""}</figure>`;
  function photosHTML(ph) {
    if (!ph.length) return "";
    if (ph.length === 1) return `<div class="ph one">${figure(ph[0], "ph-main", 120)}</div>`;
    if (ph.length === 2) return `<div class="ph two">${figure(ph[0], "ph-main", 90)}${figure(ph[1], "ph-a", 60)}</div>`;
    return `<div class="ph">${figure(ph[0], "ph-main", 96)}${figure(ph[1], "ph-a", 52)}${figure(ph[2], "ph-b", 52)}</div>`;
  }

  const meses = (on, ex = []) => `<span class="mes">${MESL.map((l, i) => `<span class="${(on || []).includes(i + 1) ? "on" : (ex || []).includes(i + 1) ? "ex" : ""}">${l}</span>`).join("")}</span>`;
  const dots = n => `<span class="lvl">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;

  // árboles de una especie, con el nombre repetido agrupado: «pino carrasco, laricio y silvestre»
  function arboles(e, max = 5) {
    const ns = (e.ecologia?.arboles || []).filter(a => a.rel !== "ocasional").map(a => ARB[a.id]?.nombres.es[0]).filter(Boolean);
    const out = [];
    let prev = "";
    for (const n of ns.slice(0, max)) {
      const [w, ...r] = n.split(" ");
      out.push(w === prev && r.length ? r.join(" ") : n);
      prev = w;
    }
    return out.length ? lista(out) + (ns.length > max ? " y otros" : "") : "";
  }
  function habitatIcons(e) {
    const eco = e.ecologia || {};
    const g = new Set((eco.arboles || []).map(a => ARB[a.id]?.grupo));
    const out = [];
    if (g.has("conifera")) out.push(["pineda", "coníferas"]);
    if (g.has("frondosa")) out.push(["fulla", "frondosas"]);
    if ((eco.habitats || []).some(h => /prado|pasto|parques|huertos|dunas/.test(h))) out.push(["prat", "prados"]);
    if ((eco.sustrato || []).some(s => /madera/.test(s))) out.push(["fusta", "madera"]);
    return out;
  }
  // Dónde sale, en palabras (antes eran iconos que no se entendían):
  // «Con pino silvestre, laricio y rodeno. Sobre madera. Al pie de pinos grandes…»
  function dondeHTML(e, maxArb, maxTxt) {
    const eco = e.ecologia || {};
    const arb = arboles(e, maxArb);
    const h = habitatIcons(e).map(x => x[1]);
    const otros = [h.includes("prados") && "en prados", h.includes("madera") && "sobre madera"].filter(Boolean);
    const donde = primera(eco.donde_mirar || eco.vegetacion, maxTxt);
    if (!arb && !otros.length && !donde) return "";
    // si la página no cabe, lo primero que se quita es el detalle (.d-mas), antes que la frase de arriba o «Compruebe»
    return `<p class="donde"><span class="lab">Dónde</span>${arb ? `Con ${esc(arb)}. ` : ""}${otros.length ? `<b>${cap(lista(otros))}.</b> ` : ""}${donde ? `<span class="d-mas">${esc(donde)}</span>` : ""}</p>`;
  }

  // =========================================================
  // PORTADA
  // =========================================================
  function portada() {
    const p = newPage(null, "cover");
    const e = DB.especies.find(x => x.id === PORTADA.id);
    const f = (e?.fotos || []).find(x => x.papel === PORTADA.papel) || e?.fotos?.[0];
    if (f) EXTRA.push(["Portada", f]);
    const n = k => GROUPS[k].length;
    p.innerHTML = `
      <div class="cv-img">${f ? `<img src="${G(f.g)}" alt="">` : ""}
        <div class="cv-ed"><span>${GUIA ? "Guía para estudiar en casa" : "Cuaderno de bolsillo"}</span><span>${EDICION}</span></div></div>
      <div class="cv-body">
        <div class="kicker">Cistella Segura · Cataluña</div>
        <h1 class="cv-t">Setas ${GUIA ? "comestibles <em>esenciales</em> de Cataluña" : "<em>esenciales</em>"}</h1>
        <p class="cv-s">${GUIA ? `Las ${ESENCIAL.length} setas que hay que conocer en Cataluña, a fondo: cómo reconocerlas, cómo son, dónde y cuándo salen, y con qué no confundirlas.`
          : `Las ${ESENCIAL.length} setas que hay que conocer en Cataluña: cómo reconocerlas, dónde y cuándo salen, y con qué no confundirlas.`}</p>
        <div class="cv-stats">
          <span class="st-comestible"><i class="d"></i>${n("comestibles")} comestibles</span>
          <span class="st-toxic"><i class="d"></i>${n("toxicas")} tóxicas</span>
          <span class="st-mortal"><i class="d"></i>${n("mortales")} mortales</span>
        </div>
        <div class="cv-sos"><b>Ante la duda, no la recolecte.</b><span>Emergencias <strong>112</strong><br>Toxicología 24 h <strong>91 562 04 20</strong></span></div>
      </div>`;
  }

  // =========================================================
  // GUÍA
  // =========================================================
  function reglasPage() {
    const seg = html(DB.textos.seguridad);
    // La negrita de la guía a veces es solo el principio de la frase («No mezcle especies en la cesta» y lleve…):
    // entonces el resto se une a la misma frase; si no, se añade la primera frase de la explicación.
    const reglas = listaTras(seg, /reglas/i).map(li => {
      const st = li.querySelector("strong");
      const b = st ? st.textContent.trim() : "";
      const all = li.textContent.trim();
      const rest = all.slice(all.indexOf(b) + b.length).trim();
      const cont = /^[a-záéíóúñü,;:(]/.test(rest);
      return { b: cont ? b : b.replace(/[.:]$/, "") + ".", r: primera(rest), cont };
    });
    const p = newPage("guia");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Antes de salir</div>
      <h2 class="pt">Las ${reglas.length} reglas</h2>
      <p class="ps">No admiten excepciones. Ante la duda, no la recolecte para comer.</p>
      <ol class="normes reglas spread">${reglas.map((x, i) => `<li data-cont="${x.cont ? 1 : 0}"><span class="nn">${i + 1}</span><p><b>${esc(x.b)}</b>${/^[,;:]/.test(x.r) ? "" : " "}<span>${esc(x.r)}</span></p></li>`).join("")}</ol>
      ${foot("Guía · Reglas")}`);
    // si no cabe: fuera las explicaciones que son frases aparte (las continuaciones se quedan)
    fit(p, [".ps", "dense", p2 => p2.querySelectorAll('.reglas li[data-cont="0"] p span').forEach(s => s.remove())], "reglas");
  }

  // Dibujos sencillos de lo que hay bajo el sombrero, vistos de lado (24 × 24): sombrero claro, lo de debajo
  // grande y en trazo oscuro, pie blanco. Van en un círculo blanco al pie de cada foto.
  const DIBUJO_BAJO = (() => {
    const T = "#5a4330", CAP = "#e8c79c", PIE = "#fbf6ec";
    const pie = `<path d="M10.4 13.6 10.1 21.8h3.8l-.3-8.2z" fill="${PIE}" stroke="${T}" stroke-width=".85" stroke-linejoin="round"/>`;
    const som = `<path d="M2.4 9.2C2.4 4.9 6.6 2.4 12 2.4s9.6 2.5 9.6 6.8z" fill="${CAP}" stroke="${T}" stroke-width=".9" stroke-linejoin="round"/>`;
    const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");
    const svg = c => `<svg viewBox="0 0 24 24" aria-hidden="true">${c}</svg>`;
    return {
      // láminas: hojas finas y apretadas
      laminas: svg(`${pie}<path d="M3 9.2h18l-2.6 4.4H5.6z" fill="#fff" stroke="${T}" stroke-width=".75" stroke-linejoin="round"/>${rep(9, i => { const x = 5.2 + i * 1.7; return `<path d="M${x.toFixed(2)} 9.4V${(Math.abs(i - 4) === 4 ? 12 : 13.4).toFixed(1)}" stroke="${T}" stroke-width=".6"/>`; })}${som}`),
      // tubos: una esponja gruesa y amarilla, con agujeritos
      poros: svg(`${pie}<path d="M3 9.2h18l-2 4.6H5z" fill="#f2d36b" stroke="${T}" stroke-width=".75" stroke-linejoin="round"/>${rep(7, i => `<circle cx="${(6.3 + i * 1.9).toFixed(2)}" cy="11.6" r=".75" fill="#fff" stroke="${T}" stroke-width=".45"/>`)}${rep(6, i => `<circle cx="${(7.25 + i * 1.9).toFixed(2)}" cy="13.1" r=".55" fill="#fff" stroke="${T}" stroke-width=".4"/>`)}${som}`),
      // pliegues: forma de embudo y venas gruesas que bajan por el pie
      pliegues: svg(`<path d="M2.6 5.2Q7 3.6 12 4.4T21.4 5.2Q18.6 9 14.1 12.6V21.6H9.9V12.6Q5.4 9 2.6 5.2z" fill="${CAP}" stroke="${T}" stroke-width=".8" stroke-linejoin="round"/><path d="M4.8 6.4Q8 9.4 10.4 12.8M7.8 6.9Q9.6 9.6 11 13.4M12 7.1V14M16.2 6.9Q14.4 9.6 13 13.4M19.2 6.4Q16 9.4 13.6 12.8M9.6 9.6 8.2 7.4M14.4 9.6 15.8 7.4" fill="none" stroke="${T}" stroke-width=".7" stroke-linecap="round"/>`),
      // aguijones: púas que cuelgan
      aguijones: svg(`${pie}${rep(8, i => { const x = 4.4 + i * 2.17, l = (i === 0 || i === 7) ? 2.4 : 4.2; return `<path d="M${(x - .85).toFixed(2)} 9 ${x.toFixed(2)} ${(9 + l).toFixed(2)} ${(x + .85).toFixed(2)} 9z" fill="#fff" stroke="${T}" stroke-width=".6" stroke-linejoin="round"/>`; })}${som}`),
      // interior: una bola sin sombrero, cortada: blanca y lisa por dentro
      gleba: svg(`<path d="M11.3 4.6a8 8 0 0 0 0 16z" fill="${CAP}" stroke="${T}" stroke-width=".8" stroke-linejoin="round"/>${[[7.4, 8.4], [5.6, 11.6], [8.4, 12.4], [6.2, 15.2], [8.8, 16.6], [9.6, 7]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".55" fill="${T}" opacity=".55"/>`).join("")}<path d="M12.9 4.6a8 8 0 0 1 0 16z" fill="#fff" stroke="${T}" stroke-width=".8" stroke-linejoin="round"/><path d="M12.9 4.6v16" stroke="${T}" stroke-width=".8"/>`)
    };
  })();
  function mirarPage() {
    const p = newPage("guia");
    // qué hay bajo el sombrero: una foto real de cada tipo (se ve mucho mejor que un dibujo pequeño)
    const BAJO = [
      ["laminas", "lepista-nuda", "fotos/g/adf851a161e6.jpg", "Hojas finas, como un libro"],
      ["poros", "suillus-granulatus", "fotos/g/a7bf89ca63ac.jpg", "Una esponja de agujeritos"],
      ["pliegues", "cantharellus-cibarius", "fotos/g/871c64b88bab.jpg", "Venas gruesas, no hojas"],
      ["aguijones", "hydnum-repandum", "fotos/g/101f803f5c15.jpg", "Púas blandas"],
      ["gleba", "bovistella-utriformis", "fotos/g/48a31c066840.jpg", "Una bola: córtela"]
    ];
    const formas = BAJO.map(([k, id, g, d]) => {
      const f = ((TODAS[id] || {}).fotos || []).find(x => x.g === g);
      if (f) EXTRA.push(["Cómo mirar · bajo el sombrero", f]);
      return `<figure><div class="im">${f ? `<img src="${G(f.t || f.g)}" alt="">` : ""}</div><span class="ico">${DIBUJO_BAJO[k]}</span><figcaption><b>${esc((V.himenoforo[k] || k).split(/[ (]/)[0])}</b><span>${d}</span></figcaption></figure>`;
    }).join("");
    const ETAPAS = [["joven", "Joven", true], ["adulto", "En su punto", true], ["viejo", "Viejo", false], ["descompuesto", "Pasado", false]];
    // una comestible con foto de las cuatro edades (si no hay, la que tenga más)
    const cuenta = e => ETAPAS.filter(([papel]) => (e.fotos || []).some(f => f.papel === papel)).length;
    const serie = [...GROUPS.comestibles].sort((a, b) => cuenta(b) - cuenta(a))[0];
    const edad = ETAPAS.map(([papel, t, ok]) => {
      const f = (serie?.fotos || []).find(x => x.papel === papel);
      if (!f) return "";
      EXTRA.push(["Cómo mirar · la edad", f]);
      return `<figure><img src="${G(f.t || f.g)}" alt=""><figcaption><b class="${ok ? "" : "no"}">${ok ? "✓" : "✕"}</b> ${t}</figcaption></figure>`;
    }).join("");
    const MIRAR = [
      ["Sombrero", "Color, textura (lisa, escamosa, viscosa) y margen."],
      ["Debajo", "Láminas, poros, pliegues o aguijones. Color, y si bajan por el pie."],
      ["Anillo", "¿Tiene? ¿Fijo o se desliza?"],
      ["Pie", "Lleno o hueco, fibroso o quebradizo. ¿Dibujos?"],
      ["Base", "Extráigala entera y escarbe: ¿hay volva?"],
      ["Carne", "Córtela: ¿látex? ¿Cambia de color? ¿Olor?"]
    ];
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Antes del nombre</div>
      <h2 class="pt">Cómo mirar una seta</h2>
      <p class="ps">Seis cosas, siempre en este orden. Si falta una, no la puede identificar.</p>
      <svg class="anat" viewBox="0 0 200 112" aria-hidden="true">
        <defs><pattern id="gl" width="2.2" height="12" patternUnits="userSpaceOnUse"><path d="M1.1 0V12" stroke="#9a7650" stroke-width=".45"/></pattern></defs>
        <path d="M24 99H138" stroke="#8b6b4a" stroke-width=".7" stroke-dasharray="2.4 1.8"/>
        <text x="26" y="96" class="hint">tierra</text>
        <path d="M84 47C83 66 82 81 80 96H104C102 81 101 66 100 47Z" fill="#f4ecdc" stroke="#3a2f25" stroke-width=".8"/>
        <path d="M74 88C73 97 80 104 92 104S111 97 110 88C106 93 100 95 92 95S78 93 74 88Z" fill="#fff" stroke="#a3201a" stroke-width=".9"/>
        <path d="M82 56C87 59 97 59 102 56L106 65C98 69 86 69 78 65Z" fill="#fff" stroke="#3a2f25" stroke-width=".7"/>
        <path d="M42 44C47 20 67 8 92 8S137 20 142 44C122 49 62 49 42 44Z" fill="#c98d55" stroke="#3a2f25" stroke-width=".8"/>
        <path d="M42 44C62 49 122 49 142 44C130 52 108 54 92 54S54 52 42 44Z" fill="url(#gl)" stroke="#3a2f25" stroke-width=".6"/>
        <path d="M62 20c6-5 14-7 22-7" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <g stroke="#3a2f25" stroke-width=".4" fill="none">
          <path d="M126 22L150 14"/><path d="M128 50L150 38"/><path d="M104 62L150 61"/><path d="M101 80L150 81"/><path d="M109 95L150 99" stroke="#a3201a"/>
          <path d="M83 74L50 74" stroke-dasharray="1.2 1"/>
        </g>
        <text x="152" y="16"><tspan class="n">1</tspan> Sombrero</text>
        <text x="152" y="40"><tspan class="n">2</tspan> Debajo</text>
        <text x="152" y="47" class="hint">láminas, poros…</text>
        <text x="152" y="63"><tspan class="n">3</tspan> Anillo</text>
        <text x="152" y="83"><tspan class="n">4</tspan> Pie</text>
        <text x="152" y="101" class="r"><tspan class="n r">5</tspan> Volva</text>
        <text x="152" y="108" class="hint">saco, a menudo enterrado</text>
        <text x="20" y="72"><tspan class="n">6</tspan> Carne</text>
        <text x="20" y="79" class="hint">córtela y mire</text>
      </svg>
      <ol class="mirar">${MIRAR.map(([t, d], i) => `<li><span class="nn">${i + 1}</span><span><b>${esc(t)}.</b> ${esc(d)}</span></li>`).join("")}</ol>
      <div class="h3">Qué hay bajo el sombrero</div>
      <div class="bajo">${formas}</div>
      <div class="edat-box"><div class="h3">La edad cuenta</div>
        <p class="edat-t">Una comestible vieja o pasada también intoxica. Cójala joven y firme.${serie ? ` (${esc(titulo(serie))})` : ""}</p>
        <div class="edat">${edad}</div></div>
      <p class="redbar" style="margin-top:auto">Láminas blancas + anillo + volva = DESCARTE</p>
      ${foot("Guía · Cómo mirar")}`);
    fit(p, [".edat-t", "dense", ".edat-box"], "mirar");
  }


  // (Sumario, índices, calendario, «Tres comprobaciones», «En casa», «Mis hallazgos», glosario, confusiones
  //  lado a lado y páginas de créditos se quitaron para que el cuaderno sea corto y barato de imprimir;
  //  están en el historial de git si hicieran falta.)

  // En el orden de BREVE.arboles: así se reparten justo en dos páginas (las fichas largas no van todas juntas)
  function arbolesPages() {
    // en la guía, todos los árboles (primero los del cuaderno), en poco espacio: varios por página
    const ids = GUIA ? [...BREVE.arboles, ...DB.arboles.map(a => a.id).filter(id => !BREVE.arboles.includes(id))] : BREVE.arboles;
    const items = ids.map(id => ARB[id]).filter(Boolean).map(a => {
      // las parejas (rovelló y pinetell) salen una sola vez, con el nombre de su página
      const vistas = new Set();
      const setas = (a.setas || []).filter(s => BY[s.id] && s.rel !== "ocasional").map(s => BY[s.id])
        .filter(e => { const k = EN_PAREJA.has(e.id) ? EN_PAREJA.get(e.id)[0].nombre : e.id; return !vistas.has(k) && vistas.add(k); });
      if (!setas.length) return null;
      const nm = e => `<span class="nm">${EN_PAREJA.has(e.id) ? esc(EN_PAREJA.get(e.id)[0].nombre) : tituloHTML(e)}${ref(e.id, true)}</span>`;
      // como mucho 6 de cada lista (para que los 10 árboles quepan en dos páginas); en «Cuidado», primero las mortales
      const ok = setas.filter(comestible).slice(0, 6);
      const ko = setas.filter(e => !comestible(e)).sort((x, y) => SEV[x.comestibilidad.cat] - SEV[y.comestibilidad.cat]).slice(0, 6);
      // la hoja y el tronco, para reconocer el árbol (las fotos llevan «papel» en la base de datos)
      const fotos = [["hoja", "Hoja"], ["tronco", "Tronco"]].map(([p, t]) => [(a.fotos || []).find(f => f.papel === p), t]).filter(([f]) => f);
      fotos.forEach(([f]) => EXTRA.push(["Árboles", f]));
      return `<article class="bosc${fotos.length ? " cf" : ""}">
        ${fotos.length ? `<div class="bosc-fotos">${fotos.map(([f, t]) => `<figure><img src="${G(f.t)}" alt=""><figcaption>${t}</figcaption></figure>`).join("")}</div>` : ""}
        <div class="bosc-txt"><h3>${esc(cap(a.nombres.es[0]))} <small>${esc(a.nombres.ca[0] || "")}</small></h3>
        <p class="curt">${esc(primera(a.reconocer?.distancia, 120))}</p>
        ${ok.length ? `<p class="ll ok"><span class="lab">Busque</span>${ok.map(nm).join(", ")}</p>` : ""}
        ${ko.length ? `<p class="ll ko"><span class="lab">Cuidado</span>${ko.map(nm).join(", ")}</p>` : ""}</div>
      </article>`;
    }).filter(Boolean);
    // los árboles van al final, en el anexo
    const mk = more => {
      const p = newPage("anexo");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">Dónde buscar${more ? " · continuación" : ""}</div>
        <h2 class="pt">Árboles y sus setas</h2>
        ${more ? "" : `<p class="ps">Muchas setas viven unidas a las raíces de un árbol: reconocerlo por la hoja y el tronco ayuda a saber qué buscar.</p>`}
        <div class="flow reparte"></div>${foot("Anexo · Árboles")}`);
      return p;
    };
    // en la guía, 5 árboles por página; los de listas largas y cortas se mezclan para que todas las páginas
    // queden igual de llenas (dentro de cada página, en el orden de siempre)
    if (GUIA) {
      const k = Math.ceil(items.length / 5), cap = Math.ceil(items.length / k);
      const peso = h => (h.match(/class="nm"/g) || []).length + 4;
      const grupos = Array.from({ length: k }, () => ({ w: 0, its: [] }));
      items.map((h, i) => ({ h, i, w: peso(h) })).sort((a, b) => b.w - a.w).forEach(it => {
        const g = grupos.filter(x => x.its.length < cap).sort((a, b) => a.w - b.w)[0];
        g.its.push(it); g.w += it.w;
      });
      const orden = grupos.sort((a, b) => Math.min(...a.its.map(x => x.i)) - Math.min(...b.its.map(x => x.i)))
        .flatMap(g => g.its.sort((a, b) => a.i - b.i).map(x => x.h));
      paginasIguales(orden, k, mk, "árboles");
    } else flow(items, mk, "árboles");
  }
  // Reparte los elementos en k páginas lo más igualadas posible; alFinal(p, n) ajusta cada página
  function paginasIguales(items, k, mkPage, name, alFinal) {
    let i = 0;
    for (let j = 0; j < k; j++) {
      const n = Math.ceil((items.length - i) / (k - j));
      const p = mkPage(j > 0), box = p.querySelector(".flow");
      box.insertAdjacentHTML("beforeend", items.slice(i, i + n).join(""));
      i += n;
      if (alFinal) alFinal(p, n);
      if (overflows(p) || box.scrollWidth > box.clientWidth + 1) REPORT.overflow.push(`${name}: página ${j + 1} no cabe`);
    }
  }


  // =========================================================
  // FICHA
  // =========================================================
  // Altitud a la que sale en Cataluña (orientativa): «⛰ 0–1400 m»
  function altitud(e) {
    const a = e.distribucion?.altitud;
    if (!a || a.max == null) return "";
    return `<span class="fct alt">${a.min ?? 0}–${a.max} m de altitud</span>`;
  }
  // Foto pequeña de una seta con la que se confunde (si está en la base de datos con foto)
  function fotoConf(c) {
    const x = c.id && TODAS[c.id];
    if (!x) return "";
    const f = (PICK[x.id] || [])[0] || (x.fotos || []).find(f => f.papel === "adulto") || (x.fotos || [])[0];
    return f ? G(f.t || f.g) : "";
  }
  function fichaPage(e) {
    const est = EST[e.comestibilidad.cat];
    const ok = comestible(e);
    const p = newPage(est.sec, `sp st-${est.st}${ok ? " edible" : ""}`);
    PAGE_OF[e.id] = p;
    const [dn, dt] = DIF[e.identificacion?.dificultad] || [2, "Media"];
    const subt = [sinNombre(e) ? "" : `<i>${esc(e.nombre)}</i>`, ...(e.nombres.ca[0] ? e.nombres.es.slice(0, 2) : e.nombres.es.slice(1, 3))].filter(Boolean);
    const otrosCa = e.nombres.ca.slice(1, 2);
    const car = e.caracteres || {};
    const him = car.himenoforo;
    const facts = `<div class="facts">${meses(e.fenologia?.meses, e.fenologia?.excepcional)}
      ${him ? `<span class="fct">${ICON[HIM_ICON[him] || "altres"]}${esc((V.himenoforo[him] || him).split(/[ (]/)[0])}</span>` : ""}
      <span class="fct${car.anillo ? "" : " no"}">${car.anillo ? "Con anillo" : "Sin anillo"}</span>
      <span class="fct${car.volva ? " alarm" : " no"}">${car.volva ? "Con volva" : "Sin volva"}</span>
      ${altitud(e)}</div>`;
    const claves = (e.identificacion?.claves || []);
    const clavesHTML = claves.length ? `<div class="checks${ok ? "" : " alarm"}"><h3>${ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3><ul>${claves.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>` : "";
    const t = e.toxicidad;
    // las que no se comen: gravedad y por qué, y el síndrome con sus síntomas
    const tox = ok ? "" : `<div class="perill">${gravedadHTML(e)}${t ? `<p><span class="lab">${esc(t.sindrome)}</span>Síntomas ${esc(t.latencia)}. ${esc(primera(t.sintomas, 170))}</p>` : ""}</div>`;
    const confs = [...(e.confusiones || [])]
      .sort((a, b) => (ok ? SEV[a.peligro] - SEV[b.peligro] : SEV[b.peligro] - SEV[a.peligro]))
      .slice(0, 3);
    const clave = confs.find(c => c.donde)?.donde;
    const truc = clave ? `<p class="truc"><span class="lab">Compruebe</span>${esc(primera(clave, 160))}</p>` : "";
    const label = ok ? "Comestibles" : est.sec === "mortales" ? "Mortales" : "Tóxicas";
    p.insertAdjacentHTML("beforeend", `
      <header class="sp-head">
        <div class="kick"><span class="pill">${est.pill}</span>${dots(dn)}<b class="dif">${dt}</b>${otrosCa.length ? `<span class="q">${esc(otrosCa.join(", "))}</span>` : ""}</div>
        <h1 class="name">${tituloHTML(e)}</h1>
        <p class="lat">${subt.map((s, i) => (i === 0 && s.startsWith("<i>") ? s : esc(s))).join(" · ")}</p>
        <p class="lede">${esc(hasta(sinNormativa(e.comestibilidad.texto), 150))}</p>
      </header>
      ${photosHTML(PICK[e.id])}
      ${facts}
      <div class="txt">${clavesHTML}${GUIA ? descripcionHTML(e) : ""}${olorSabor(e, ok)}${tox}${dondeHTML(e, 5, 150)}${GUIA ? cuandoHTML(e) : ""}${confsHTML(GUIA ? [...(e.confusiones || [])].sort((a, b) => (ok ? SEV[a.peligro] - SEV[b.peligro] : SEV[b.peligro] - SEV[a.peligro])).slice(0, 4) : confs, ok, [e.id])}${truc}</div>
      ${foot(label)}`);
    // en la guía, si no cabe, primero se acorta la descripción
    const antes = GUIA ? [".cuando", quitaUno(".desc p"), quitaUno(".conf li"), quitaUno(".desc p"), quitaUno(".desc p"), ".desc"] : [];
    const mas = p.querySelector(".d-mas")?.textContent;
    fit(p, [...antes, "tight", ".lede", "dense", acortaMas, ".d-mas", quitaUltimo(".conf li"), ".truc", "denser", quitaUltimo(".checks li"), ".donde"], e.id);
    devuelveMas(p, mas);
  }
  // si al quitar algo más abajo ha quedado sitio, vuelve el detalle de «Dónde» (entero o acortado)
  function devuelveMas(el, mas) {
    const d = el.querySelector(".donde");
    if (!mas || !d) return;
    const sobra = () => el.scrollHeight > el.clientHeight + 1;
    let m = d.querySelector(".d-mas");
    if (m && m.textContent === mas) return;
    const previo = m ? m.textContent : null;
    if (!m) { d.insertAdjacentHTML("beforeend", `<span class="d-mas"></span>`); m = d.querySelector(".d-mas"); }
    m.textContent = mas;
    if (sobra()) acortaMas(el);
    if (sobra()) { if (previo) m.textContent = previo; else m.remove(); }
  }
  // el detalle de «Dónde», solo hasta el primer «;» («Bordes de bosque, claros y taludes; en hayedos…» → «Bordes de bosque, claros y taludes.»)
  const acortaMas = p => p.querySelectorAll(".d-mas").forEach(m => {
    const t = m.textContent.split(/;|: /)[0].trim().replace(/[.,]$/, "");
    if (t.length > 12 && t.length < m.textContent.trim().length - 2) m.textContent = t + ".";
  });
  const quitaUno = sel => p => { const l = p.querySelectorAll(sel); if (l.length) l[l.length - 1].remove(); };
  // guía: cómo es (sombrero, debajo, pie, carne, esporada) y cuándo sale
  function descripcionHTML(e) {
    const m = e.morfologia || {};
    const filas = [["Sombrero", m.sombrero], ["Debajo", m.himenoforo], ["Pie", m.pie], ["Carne", m.carne], ["Esporada", m.esporada]].filter(([, v]) => v);
    return filas.length ? `<div class="desc"><h3>Cómo es</h3>${filas.map(([k, v]) => `<p><span class="lab">${k}</span>${esc(primera(v, 170))}</p>`).join("")}</div>` : "";
  }
  function cuandoHTML(e) {
    const t = e.fenologia?.texto;
    return t ? `<p class="cuando"><span class="lab">Cuándo</span>${esc(hasta(t, 190))}</p>` : "";
  }

  // =========================================================
  // GUÍA: media página (dos setas por página), calendario, glosario, índice y créditos
  // =========================================================
  function fitEl(el, steps) {
    const sobra = () => el.scrollHeight > el.clientHeight + 1;
    for (const s of steps) {
      if (!sobra()) return;
      if (typeof s === "function") s(el);
      else if (s.startsWith(".")) el.querySelectorAll(s).forEach(n => n.remove());
      else el.classList.add(s);
    }
    if (sobra()) REPORT.overflow.push(`media ${el.dataset.id}: +${el.scrollHeight - el.clientHeight}px`);
  }
  function mediaFicha(e) {
    const est = EST[e.comestibilidad.cat], ok = comestible(e);
    const [dn, dt] = DIF[e.identificacion?.dificultad] || [2, "Media"];
    const car = e.caracteres || {}, him = car.himenoforo;
    const subt = [sinNombre(e) ? "" : `<i>${esc(e.nombre)}</i>`, ...(e.nombres.ca[0] ? e.nombres.es.slice(0, 1) : e.nombres.es.slice(1, 2)).map(esc)].filter(Boolean);
    const facts = `<div class="facts">${meses(e.fenologia?.meses, e.fenologia?.excepcional)}
      ${him ? `<span class="fct">${ICON[HIM_ICON[him] || "altres"]}${esc((V.himenoforo[him] || him).split(/[ (]/)[0])}</span>` : ""}
      <span class="fct${car.anillo ? "" : " no"}">${car.anillo ? "Con anillo" : "Sin anillo"}</span>
      <span class="fct${car.volva ? " alarm" : " no"}">${car.volva ? "Con volva" : "Sin volva"}</span>${altitud(e)}</div>`;
    const claves = (e.identificacion?.claves || []).slice(0, 3);
    const t = e.toxicidad;
    const tox = ok ? "" : `<div class="perill">${gravedadHTML(e)}${t ? `<p><span class="lab">${esc(t.sindrome)}</span>Síntomas ${esc(t.latencia)}.</p>` : ""}</div>`;
    const confs = [...(e.confusiones || [])].sort((a, b) => (ok ? SEV[a.peligro] - SEV[b.peligro] : SEV[b.peligro] - SEV[a.peligro])).slice(0, 2);
    // la principal y, de segunda, mejor una de detalle o joven que una de vieja
    const fs = PICK[e.id] || [], resto = (e.fotos || []).filter(f => f !== fs[0]);
    const segunda = ["detalle", "joven", "variacion", "recolectado", "habitat", null, "viejo", "descompuesto"].map(pp => resto.find(f => (f.papel || null) === pp)).find(Boolean);
    const fotos = [fs[0], segunda].filter(Boolean);
    return `<article class="media sp st-${est.st}${ok ? " edible" : ""}" data-id="${e.id}">
      <div class="m-fotos">${fotos.map(f => `<figure><img src="${G(f.g || f.t)}" alt="">${f.pie ? `<figcaption>${esc(shortCap(f.pie, 46))}</figcaption>` : ""}</figure>`).join("")}</div>
      <div class="m-txt">
        <header class="sp-head"><div class="kick"><span class="pill">${est.pill}</span>${dots(dn)}<b class="dif">${dt}</b></div>
          <h1 class="name">${tituloHTML(e)}</h1><p class="lat">${subt.join(" · ")}</p></header>
        ${facts}
        <div class="txt">${claves.length ? `<div class="checks${ok ? "" : " alarm"}"><h3>${ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3><ul>${claves.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}
          ${olorSabor(e, ok)}${tox}${dondeHTML(e, 3, 110)}
          ${confsHTML(confs, ok, [e.id])}</div>
      </div></article>`;
  }
  function mediasPage(lista, sec) {
    const p = newPage(sec, "mitades");
    const label = sec === "comestibles" ? "Comestibles" : sec === "mortales" ? "Mortales" : "Tóxicas";
    p.insertAdjacentHTML("beforeend", `<div class="mitades-in">${lista.map(mediaFicha).join("")}</div>${foot(label)}`);
    lista.forEach(e => (PAGE_OF[e.id] = p));
    p.querySelectorAll(".media").forEach(m => { const mas = m.querySelector(".d-mas")?.textContent; fitEl(m, ["dense", acortaMas, ".d-mas", quitaUno(".conf li"), ".donde", quitaUno(".checks li"), "denser", ".os", quitaUno(".conf li"), quitaUno(".checks li")]); devuelveMas(m, mas); });
  }
  // una sección de la guía: cada seta del cuaderno en su página; las demás, de dos en dos (si queda una sola, página entera)
  function seccionGuia(lista, sec) {
    let buf = [];
    lista.forEach(e => {
      const pj = EN_PAREJA.get(e.id);
      if (pj) { if (pj[1] === 0) parejaPage(pj[0]); return; }
      if (!MEDIA(e)) { fichaPage(e); return; }
      buf.push(e);
      if (buf.length === 2) { mediasPage(buf, sec); buf = []; }
    });
    if (buf.length) fichaPage(buf[0]);
  }
  // listas que pasan de página: en dos columnas (cols) o en una
  function flowCols(items, mkPage, name) {
    let p = mkPage(false), box = p.querySelector(".flow");
    const sobra = () => box.scrollWidth > box.clientWidth + 1 || overflows(p);
    for (const html of items) {
      box.insertAdjacentHTML("beforeend", html);
      if (sobra() && box.children.length > 1) {
        box.lastElementChild.remove();
        p = mkPage(true); box = p.querySelector(".flow");
        box.insertAdjacentHTML("beforeend", html);
      }
    }
    if (sobra()) REPORT.overflow.push(`${name}: no cabe`);
  }
  const anexoPage = (kicker, titulo_, intro, pie, clase) => more => {
    const p = newPage("anexo");
    p.insertAdjacentHTML("beforeend", `<div class="kicker">${kicker}${more ? " · continuación" : ""}</div><h2 class="pt">${titulo_}</h2>
      ${more || !intro ? "" : `<p class="ps">${intro}</p>`}<div class="flow ${clase}"></div>${foot(pie)}`);
    return p;
  };
  function calendarioPages() {
    const primerMes = e => Math.min(...(e.fenologia?.meses || [13]));
    const filas = [...GROUPS.comestibles].sort((a, b) => primerMes(a) - primerMes(b) || titulo(a).localeCompare(titulo(b), "es"))
      .map(e => `<div class="calg"><span class="calg-n">${tituloHTML(e)}${ref(e.id, true)}</span>${meses(e.fenologia?.meses, e.fenologia?.excepcional)}</div>`);
    // filas repartidas por igual en las páginas que hagan falta (25 por página como mucho), estiradas hasta abajo
    paginasIguales(filas, Math.ceil(filas.length / 25), anexoPage("Cuándo salen", "Calendario", "Meses en que sale cada comestible en Cataluña: oscuro, lo habitual; claro, solo algunos años. El número es su página.", "Anexo · Calendario", "calg-lista"), "calendario");
  }
  function glosarioPages() {
    const d = html(DB.textos.glosario);
    const items = [...d.querySelectorAll("li")].map(li => `<p class="glo">${li.innerHTML}</p>`);
    flowCols(items, anexoPage("Palabras de setero", "Glosario", "", "Anexo · Glosario", "cols glo-lista"), "glosario");
  }
  // cuaderno: en las páginas que se le den (para cerrar el libro sin hojas en blanco), con los créditos de las fotos al final
  function indicePages(paginas) {
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const ent = [];
    ESENCIAL.forEach(e => {
      const vistos = new Set();
      const pon = (t, cls) => { const k = norm(t); if (!t || vistos.has(k)) return; vistos.add(k); ent.push([k, `<p class="ixg${cls ? " " + cls : ""}"><span>${cls ? `<i>${esc(t)}</i>` : esc(cap(t))}</span>${ref(e.id, true)}</p>`]); };
      // en el cuaderno, el nombre principal en cada idioma (y el científico)
      const n = paginas ? 1 : 99;
      [...e.nombres.ca.slice(0, n), ...e.nombres.es.slice(0, n)].forEach(x => pon(x, ""));
      pon(e.nombre, "cient");
    });
    ent.sort((a, b) => a[0].localeCompare(b[0], "es"));
    // en dos columnas, repartido por igual (84 nombres por página como mucho); las filas llenan la altura
    const k = paginas || Math.ceil(ent.length / 84);
    paginasIguales(ent.map(x => x[1]), k, anexoPage("Todos los nombres", "Índice", "Nombres en catalán, castellano y científicos (en cursiva), con su página.", "Índice", "ixg-lista"), "índice",
      (p, n) => {
        p.querySelector(".flow").style.gridTemplateRows = `repeat(${Math.ceil(n / 2)}, 1fr)`;
        if (paginas && p === book.lastElementChild && book.querySelectorAll(".ixg-lista").length === k) p.querySelector(".pf").insertAdjacentHTML("beforebegin", CREDITO);
      });
  }
  const CREDITO = `<p class="cred-linea">Fotos de iNaturalist y Wikimedia Commons con licencia Creative Commons o de dominio público; el autor y la licencia de cada una, en su ficha de <b>caorjavier.github.io/cistella-segura</b>. Uso personal o sin ánimo de lucro.</p>`;
  function creditosPages() {
    // cada seta con los autores y licencias de sus fotos (el detalle de cada foto, con enlace, en su ficha de la web)
    const porSeta = ESENCIAL.map(e => {
      const fs = (EN_PAREJA.has(e.id) ? [] : (PICK[e.id] || []));
      const aut = [...new Map(fs.map(f => [f.autor + "|" + f.licencia, f])).values()].map(f => `${esc(f.autor || "?")} (${esc(f.licencia || "")})`);
      return aut.length ? `<p class="cr"><b>${tituloHTML(e)}</b> ${aut.join(", ")}</p>` : "";
    }).filter(Boolean);
    const otras = [...new Map(EXTRA.map(([, f]) => [f.autor + "|" + f.licencia, f])).values()].map(f => `${esc(f.autor || "?")} (${esc(f.licencia || "")})`);
    if (otras.length) porSeta.push(`<p class="cr"><b>Árboles, parejas y otras</b> ${otras.join(", ")}</p>`);
    const mk = anexoPage("Créditos", "Fotografías", "Fotos de iNaturalist y Wikimedia Commons con licencia Creative Commons o de dominio público. Cada una, con su autor, su licencia y el enlace al original, en la ficha de la web.", "Créditos", "cols cr-lista");
    // primero se ve cuántas páginas hacen falta y luego se reparte por igual
    const antes = book.children.length;
    flowCols(porSeta, mk, "créditos");
    const k = book.children.length - antes;
    while (book.children.length > antes) book.lastElementChild.remove();
    paginasIguales(porSeta, k, mk, "créditos");
  }
  // cada seta con la que se confunde: foto pequeña + en qué se diferencia (y su página, si tiene ficha)
  function confsHTML(confs, ok, propios) {
    if (!confs.length) return "";
    return `<div class="conf"><h3>${ok ? "Cuidado: se confunde con" : "Se confunde con"}</h3><ul>${confs.map(c => {
      const im = fotoConf(c);
      return `<li class="cf${im ? " cf-foto" : ""}">${im ? `<img class="cf-im" src="${im}" alt="">` : ""}<span><b>${nombreConf(c)}</b> <span class="cf-tag cf-${c.peligro}">${PEL[c.peligro] || c.peligro}</span> ${esc(primera(c.diferencia, 170))} ${c.id && !propios.includes(c.id) ? ref(c.id) : ""}</span></li>`;
    }).join("")}</ul></div>`;
  }

  // Dos setas casi iguales en una página: lo común, una tabla con lo que las separa y sus confusiones juntas
  function parejaPage(cfg) {
    const [a, b] = cfg.ids.map(id => BY[id]);
    const p = newPage("comestibles", "sp st-comestible edible pareja");
    cfg.ids.forEach(id => (PAGE_OF[id] = p));
    const fotos = cfg.fotos.map(([id, g, pie]) => ({ ...((BY[id].fotos || []).find(f => f.g === g) || BY[id].fotos[0]), pie }));
    fotos.forEach(f => EXTRA.push([cfg.nombre, f]));
    const mesesU = [...new Set([...(a.fenologia?.meses || []), ...(b.fenologia?.meses || [])])];
    const alts = [a, b].map(e => e.distribucion?.altitud).filter(x => x && x.max != null);
    const alt = alts.length ? `<span class="fct alt">${Math.min(...alts.map(x => x.min ?? 0))}–${Math.max(...alts.map(x => x.max))} m de altitud</span>` : "";
    const him = a.caracteres?.himenoforo;
    const facts = `<div class="facts">${meses(mesesU)}
      ${him ? `<span class="fct">${ICON[HIM_ICON[him] || "altres"]}${esc((V.himenoforo[him] || him).split(/[ (]/)[0])}</span>` : ""}
      <span class="fct no">Sin anillo</span><span class="fct no">Sin volva</span><span class="fct hab">Bajo pinos</span>${alt}</div>`;
    const tabla = `<table class="cmp"><tr><th></th><th>${esc(titulo(a))}</th><th>${esc(titulo(b))}</th></tr>${cfg.filas.map(([k, x, y]) => `<tr><th>${esc(k)}</th><td>${esc(x)}</td><td>${esc(y)}</td></tr>`).join("")}</table>`;
    const vistos = new Set();
    const confs = [...(a.confusiones || []), ...(b.confusiones || [])]
      .filter(c => !cfg.ids.includes(c.id) && !vistos.has(c.id || c.nombre) && vistos.add(c.id || c.nombre))
      .sort((x, y) => SEV[x.peligro] - SEV[y.peligro]).slice(0, 3);
    p.insertAdjacentHTML("beforeend", `
      <header class="sp-head">
        <div class="kick"><span class="pill">Comestibles</span>${dots(2)}<b class="dif">Media</b><span class="q">esclatasang · rovelló d'obaga</span></div>
        <h1 class="name">${esc(cfg.nombre)}</h1>
        <p class="lat">${cfg.lat}</p>
        <p class="lede">${esc(cfg.lede)}</p>
      </header>
      ${photosHTML(fotos)}
      ${facts}
      <div class="txt">${tabla}
        <div class="checks"><h3>Los dos</h3><ul>${cfg.claves.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>
        ${confsHTML(confs, true, cfg.ids)}
        <p class="truc"><span class="lab">Compruebe</span>${esc(cfg.compruebe)}</p></div>
      ${foot("Comestibles")}`);
    fit(p, ["tight", ".lede", "dense", quitaUltimo(".conf li"), ".truc", "denser", quitaUltimo(".checks li")], "pareja");
  }

  // =========================================================
  // ANEXO
  // =========================================================
  function sindromesPages() {
    const d = html(DB.textos.intoxicacion);
    const rows = [...d.querySelectorAll("table tr")].filter(r => r.querySelector("td"));
    let fase = "";
    const items = [];
    for (const r of rows) {
      const c = [...r.querySelectorAll("td,th")].map(x => x.textContent.trim());
      if (c.length >= 4) fase = c.shift();
      const [sind, quien, que] = c;
      if (!sind) continue;
      items.push({ fase, sind, quien, que });
    }
    const bloques = [];
    let ultima = "";
    for (const it of items) {
      if (it.fase !== ultima) { bloques.push(`<p class="fase">${esc(it.fase)}</p>`); ultima = it.fase; }
      const grave = /tardía|más de|24/i.test(it.fase);
      bloques.push(`<article class="sind${grave ? " grave" : ""}"><b>${esc(it.sind)}</b><span>${esc(it.que)}</span><i>${esc(it.quien)}</i></article>`);
    }
    flow(bloques, more => {
      const p = newPage("anexo");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">Si alguien se encuentra mal${more ? " · continuación" : ""}</div>
        <h2 class="pt">Síndromes</h2>
        ${more ? "" : `<p class="ps">Según cuánto tardan los síntomas. Más de 6 horas es señal de alarma.</p>`}
        <div class="flow"></div>${foot("Anexo · Síndromes")}`);
      return p;
    }, "síndromes");
  }

  // Solo si el total no da múltiplo de 4: página en blanco para notas
  function notasPage() {
    const p = newPage("anexo");
    p.insertAdjacentHTML("beforeend", `<div class="kicker">Notas</div><div class="notas"></div>${foot("Notas")}`);
    return p;
  }


  function sosPage() {
    const d = html(DB.textos.intoxicacion);
    // como en las reglas: si la negrita es solo el principio de la frase, el resto la continúa
    const hacer = listaTras(d, /qué hacer/i).map(li => {
      const st = li.querySelector("strong");
      const b = st ? st.textContent.trim() : "";
      const all = li.textContent.trim();
      const rest = all.slice(all.indexOf(b) + b.length).trim();
      const cont = /^[a-záéíóúñü,;:(]/.test(rest);
      return [cont ? b : b.replace(/[.:]$/, "") + ".", (cont && !/^[,;:]/.test(rest) ? " " : cont ? "" : " ") + primera(rest, 120)];
    });
    const alarma = [...d.querySelectorAll("p")].map(x => x.textContent.trim()).find(t => /^Señal de alarma/i.test(t));
    const p = newPage("sos", "sos-page");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Si alguien se encuentra mal</div>
      <h2 class="pt">Llame ahora</h2>
      <div class="sos-nums">
        <div class="sos-num"><strong>112</strong><span><b>Emergencias</b>Diga que han comido setas silvestres y cuándo.</span></div>
        <div class="sos-num"><strong style="font-size:15pt">91 562 04 20</strong><span><b>Toxicología · 24 h</b>Información de intoxicaciones.</span></div>
      </div>
      <div class="h3">Qué hacer</div>
      <ul class="sos-f">${hacer.map(([b, r]) => `<li><b>${esc(b)}</b>${esc(r)}</li>`).join("")}</ul>
      ${alarma ? `<p class="sos-alarma">${esc(hasta(alarma, 230))}</p>` : ""}
      <div class="h3" style="margin-top:auto">Anótelo antes de salir</div>
      ${["Alojamiento", "Centro de salud", "Sociedad micológica", "Dónde aparqué"].map(t => `<div class="wi"><span>${t}</span><i></i></div>`).join("")}
      ${CREDITO}
      ${foot("SOS")}`);
    fit(p, ["dense", ".sos-alarma", p2 => p2.querySelectorAll(".sos-f li").forEach(li => { const b = li.querySelector("b"); li.innerHTML = b ? b.outerHTML : li.innerHTML; })], "sos");
  }

  function gradPNG(from, to, h = 128) {
    const c = document.createElement("canvas");
    c.width = 2; c.height = h;
    const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, from);
    gr.addColorStop(1, to);
    g.fillStyle = gr;
    g.fillRect(0, 0, 2, h);
    return `url(${c.toDataURL("image/png")})`;
  }

  // =========================================================
  // MONTAJE
  // =========================================================
  function build() {
    const root = document.documentElement.style;
    root.setProperty("--grad-cap", gradPNG("rgba(0,0,0,0)", "rgba(0,0,0,0.74)"));
    root.setProperty("--grad-paper", gradPNG("rgba(255,255,255,0)", "rgba(255,255,255,1)"));   // papel blanco (ahorro de tinta)

    // Cuaderno breve: sin sumario, sin «tres comprobaciones», sin confusiones aparte (van en cada ficha)
    // y con los créditos de las fotos en una línea de la contraportada (cada foto, con su autor, en la web)
    // Orden: comestibles, tóxicas y mortales; los árboles, al final (en el anexo), porque son lo menos importante
    portada();
    reglasPage();
    mirarPage();
    if (GUIA) {
      // guía: cada sección con sus setas (las del cuaderno, página entera; las demás, media página)
      seccionGuia(GROUPS.comestibles, "comestibles");
      seccionGuia(GROUPS.toxicas, "toxicas");
      seccionGuia(GROUPS.mortales, "mortales");
      arbolesPages();
      calendarioPages();
      sindromesPages();
      glosarioPages();
      indicePages();
      creditosPages();
    } else {
      // las parejas casi iguales (rovelló y pinetell) van juntas en la página de la primera
      GROUPS.comestibles.forEach(e => { const pj = EN_PAREJA.get(e.id); if (!pj) fichaPage(e); else if (pj[1] === 0) parejaPage(pj[0]); });
      [...GROUPS.toxicas, ...GROUPS.mortales].forEach(fichaPage);
      arbolesPages();
      // sin síndromes ni «Llame ahora» (los teléfonos van en la portada): el índice cierra el cuaderno
      // y ocupa lo que falte para llegar a un múltiplo de 4 (al menos una página)
      indicePages(((4 - ((book.children.length + 1) % 4)) % 4) + 1);
    }
    const antesDeSOS = book.lastElementChild;
    if (GUIA) sosPage();

    // si hace falta, páginas de notas para que el total sea múltiplo de 4 (antes de la contraportada)
    const extra = (4 - (book.children.length % 4)) % 4;
    REPORT.notas = extra;
    for (let i = 0; i < extra; i++) book.insertBefore(notasPage(), antesDeSOS.nextElementSibling);

    const pages = [...book.children];
    pages.forEach((p, i) => {
      const n = i + 1;
      p.dataset.n = n;
      p.classList.add(n % 2 ? "recto" : "verso");
      const pn = p.querySelector(".pn");
      if (pn) pn.textContent = n;
    });

    document.querySelectorAll(".ref[data-ref]").forEach(r => {
      const t = PAGE_OF[r.dataset.ref];
      if (!t) { r.remove(); return; }
      r.textContent = r.dataset.fmt === "n" ? t.dataset.n : `→ p. ${t.dataset.n}`;
    });

    REPORT.pages = pages.length;
    window.BUILD_REPORT = REPORT;
    window.libroInfo = () => libroInfo(pages);
    document.dispatchEvent(new CustomEvent("llibre-llest"));
    document.body.dataset.ready = "1";
  }

  // Para leer el libro en la web (extra/lector.js): dónde se puede tocar en cada página y adónde lleva,
  // qué fichas hay en cada página y el índice. Las posiciones van en fracciones de la página (0–1).
  // Se saca con el cuaderno abierto en pantalla (setas.html): window.libroInfo()
  function libroInfo(pages) {
    const num = p => +p.dataset.n;
    const r3 = x => Math.round(x * 1000) / 1000;
    const inicio = {};
    pages.forEach(p => { const s = p.dataset.sec; if (s && !inicio[s]) inicio[s] = num(p); });
    const destDe = ref => (ref && PAGE_OF[ref.dataset.ref] ? num(PAGE_OF[ref.dataset.ref]) : 0);
    const out = { n: pages.length, l: {}, f: {}, i: [] };
    pages.forEach(p => {
      const n = num(p), pr = p.getBoundingClientRect(), L = [], hechos = new Set();
      const pon = (el, dest) => {
        if (!dest || dest === n) return;
        const r = el.getBoundingClientRect();
        if (r.width && r.height) L.push([r3((r.left - pr.left) / pr.width), r3((r.top - pr.top) / pr.height), r3(r.width / pr.width), r3(r.height / pr.height), dest]);
      };
      // cada seta con la que se confunde (foto, nombre y texto) lleva a su página
      p.querySelectorAll(".conf li").forEach(li => { const ref = li.querySelector(".ref[data-ref]"); if (ref) { hechos.add(ref); pon(li, destDe(ref)); } });
      // en «Árboles y sus setas»: el nombre con su número
      p.querySelectorAll(".nm, .ixg").forEach(nm => { const ref = nm.querySelector(".ref[data-ref]"); if (ref) { hechos.add(ref); pon(nm, destDe(ref)); } });
      p.querySelectorAll(".ref[data-ref]").forEach(ref => { if (!hechos.has(ref)) pon(ref, destDe(ref)); });
      // la pestaña del margen lleva al principio de su sección; en la portada, «comestibles», «mortales», «tóxicas»
      const tab = p.querySelector(".tab");
      if (tab && p.dataset.sec) pon(tab, inicio[p.dataset.sec]);
      p.querySelectorAll(".cv-stats span").forEach(sp => pon(sp, inicio[sp.classList.contains("st-comestible") ? "comestibles" : sp.classList.contains("st-mortal") ? "mortales" : "toxicas"]));
      if (L.length) out.l[n] = L;
    });
    Object.entries(PAGE_OF).forEach(([id, p]) => { const n = num(p); (out.f[n] = out.f[n] || []).push(id); });
    const SECN = { comestibles: "Comestibles", mortales: "Mortales", toxicas: "Tóxicas" };
    let sec = "";
    pages.forEach(p => {
      const n = num(p);
      if (p.classList.contains("cover")) { out.i.push([n, "Portada", 0]); return; }
      // una seta o, en las páginas de media, dos
      const hs = [...p.querySelectorAll(".sp-head .name")];
      if (hs.length) {
        if (p.dataset.sec !== sec) { sec = p.dataset.sec; out.i.push([n, SECN[sec] || sec, 0]); }
        hs.forEach(h => { const m = h.closest(".media"); out.i.push([n, h.textContent.trim(), 1, "", m ? m.dataset.id : (out.f[n] || [])[0] || ""]); });
        return;
      }
      const pt = p.querySelector(".pt"), kick = p.querySelector(".kicker");
      if (pt && !/continuaci/i.test(kick ? kick.textContent : "")) { sec = p.dataset.sec; out.i.push([n, pt.textContent.trim(), 0]); }
    });
    return out;
  }

  const fonts = [
    '800 19pt "Alegreya"', '700 9pt "Alegreya"', 'italic 500 7pt "Alegreya"', 'italic 700 7pt "Alegreya"', '500 7pt "Alegreya"',
    '400 7pt "Alegreya Sans"', '500 7pt "Alegreya Sans"', '700 7pt "Alegreya Sans"', '800 7pt "Alegreya Sans"', 'italic 400 7pt "Alegreya Sans"',
    '700 10pt "Caveat"'
  ];
  Promise.all(fonts.map(f => document.fonts.load(f).catch(() => null)))
    .then(() => document.fonts.ready)
    .then(build);
})();
