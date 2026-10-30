/* Utilidades compartidas por las secciones que vienen de la antigua web Cistella Segura
   (extra/hoy.js, extra/mapa.js, extra/lluvia.js, extra/hallazgos.js).
   Necesita datos/db.js (DB) y datos/cistella.js (BOLETS, FOTOS, ZONES, MAPA, MAPA_INT…).
   Las secciones se registran en window.VISTAS_EXTRA[ruta] = (arg, GUIA) => { … } y app.js las abre con #/ruta. */
(function () {
  "use strict";
  window.VISTAS_EXTRA = window.VISTAS_EXTRA || {};

  const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

  // Empareja cada seta catalana (BOLETS, id «rovello») con su ficha de la guía (id «lactarius-sanguifluus»)
  // por el nombre científico o un sinónimo.
  const IDX = {};
  DB.especies.forEach((e) => {
    IDX[norm(e.nombre)] = e.id;
    (e.sinonimos || []).forEach((s) => { const b = norm(s.split(" ").slice(0, 2).join(" ")); if (!IDX[b]) IDX[b] = e.id; });
  });
  const CAT2ES = {};
  BOLETS.forEach((b) => {
    let genero = "";
    for (const c of String(b.lat).split(/·|\(|,| i /).map((x) => norm(x).replace(/\bspp?\.?/, "").trim()).filter(Boolean)) {
      const w = c.split(" ");
      if (w.length < 2) continue;
      const nombre = (w[0].length <= 2 && genero ? genero : w[0]) + " " + w[1];
      if (w[0].length > 2) genero = w[0];
      if (IDX[nombre]) { CAT2ES[b.id] = IDX[nombre]; break; }
    }
  });
  const ESP = Object.fromEntries(DB.especies.map((e) => [e.id, e]));
  const BYCAT = Object.fromEntries(BOLETS.map((b) => [b.id, b]));
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

  window.CS = {
    BYCAT,                       // seta catalana por id
    CAT2ES,                      // id catalán → id de la guía
    // ficha de la guía de una seta catalana (o null)
    especie: (id) => ESP[CAT2ES[id]] || null,
    // enlace a su ficha en la guía
    href: (id) => (CAT2ES[id] ? "#/especie/" + CAT2ES[id] : null),
    // nombre como en la guía (catalán, si no castellano, si no científico)
    nombre: (id) => { const e = ESP[CAT2ES[id]]; return e ? cap((e.nombres.ca || [])[0] || (e.nombres.es || [])[0]) || e.nombre : (BYCAT[id] || {}).nom || id; },
    cientifico: (id) => { const e = ESP[CAT2ES[id]]; return e ? e.nombre : (BYCAT[id] || {}).lat || ""; },
    // miniatura: la de la guía si existe; si no, la de la web catalana
    foto: (id) => { const e = ESP[CAT2ES[id]]; const f = e && (e.fotos || [])[0]; if (f) return f.t || f.g; const c = (FOTOS[id] || [])[0]; return c ? "../" + (c.th || c.src) : ""; },
    fotoGrande: (id) => { const e = ESP[CAT2ES[id]]; const f = e && (e.fotos || [])[0]; if (f) return f.g || f.t; const c = (FOTOS[id] || [])[0]; return c ? "../" + c.src : ""; },
    // estado: comestible · condicionada · toxica · mortal · no_comestible (el de la guía si existe)
    estado: (id) => { const e = ESP[CAT2ES[id]]; if (e) return e.comestibilidad.cat; const s = (BYCAT[id] || {}).estat; return { toxic: "toxica", precaucio: "no_comestible" }[s] || s || "desconocida"; },
    comestible: (id) => ["comestible", "condicionada"].includes(window.CS.estado(id)),
    // rutas de la antigua web (fotos/…) vistas desde guia/
    ruta: (p) => "../" + p,
    MES_CORTO: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    MES_LARGO: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    // colores por estado: las mismas variables CSS que los distintivos de la guía (con modo oscuro)
    COLOR: { comestible: "var(--ok)", condicionada: "var(--cond)", toxica: "var(--tox)", mortal: "var(--mortal)", no_comestible: "var(--nulo)", desconocida: "var(--desc)" },
    FONDO: { comestible: "var(--ok-bg)", condicionada: "var(--cond-bg)", toxica: "var(--tox-bg)", mortal: "var(--mortal-bg)", no_comestible: "var(--nulo-bg)", desconocida: "var(--desc-bg)" },
  };
})();
