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
  // Cuadernos mini (butxaca/setas-mini-32.html y setas-mini-20.html, y sus versiones -a5): las mismas 54 setas,
  // pero 2 o 3 por página y con lo justo (foto, nombres, meses, cómo es, rasgos, dónde y con qué se confunde)
  const MINI = window.CUADERNO_MODO === "mini" ? (+window.MINI_POR_PAGINA === 3 ? 3 : 2) : 0;
  // Cuaderno en catalán (butxaca/bolets*.html): los datos llegan ya traducidos (datos/ca.js con i18n.js; el original
  // en castellano queda en window.DB_ES, para lo que se decide leyendo el texto, como la gravedad o si el olor es
  // peculiar) y lo que escribe este archivo se traduce al meterlo en la página, con el diccionario de
  // butxaca/setas-ca.js y el de la web (CA.ui): así se mide y se ajusta cada página ya en catalán
  const CAT = window.LLIBRE_IDIOMA === "ca";
  if (CAT) {
    document.documentElement.lang = "ca";
    const DIC = Object.assign({}, window.CA_UI || {}, window.SETAS_CA || {});
    const NUM = /\d+(?:[.,]\d+)*/g;
    // entradas con {x}: cualquier texto en medio (que también se traduce, si se puede)
    const PATS = Object.keys(DIC).filter(k => k.includes("{x}"))
      .map(k => [new RegExp("^" + k.split("{x}").map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.+?)") + "$"), DIC[k]]);
    const busca = t => {
      if (DIC[t] !== undefined) return DIC[t];
      const nums = t.match(NUM);
      if (nums) { const v = DIC[t.replace(NUM, "{n}")]; if (v !== undefined) { let i = 0; return v.replace(/\{n\}/g, () => nums[i++] ?? ""); } }
      for (const [re, v] of PATS) {
        const m = t.match(re);
        if (m) { let i = 1; return v.replace(/\{x\}/g, () => { const x = m[i++]; return busca(x) ?? x; }); }
      }
      return undefined;
    };
    // lo que no está en el diccionario (para repasarlo: window.CA_FALTA)
    const FALTA = window.CA_FALTA = new Set();
    const tr = s => {
      const t = s.trim().replace(/\s+/g, " ");
      if (!/[a-záéíóúñü]/i.test(t)) return s;
      const r = busca(t);
      if (r === undefined) { FALTA.add(t); return s; }
      return s.match(/^\s*/)[0] + r + s.match(/\s*$/)[0];
    };
    const ih = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML"), tpl = document.createElement("template");
    // los nombres científicos (en cursiva) no se tocan
    const trHTML = h => {
      ih.set.call(tpl, h);
      const w = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) if (!n.parentElement?.closest("i, [translate=no]")) n.nodeValue = tr(n.nodeValue);
      return ih.get.call(tpl);
    };
    const ins = Element.prototype.insertAdjacentHTML;
    Element.prototype.insertAdjacentHTML = function (pos, h) { return ins.call(this, pos, trHTML(h)); };
    Object.defineProperty(Element.prototype, "innerHTML", { configurable: true, get: ih.get, set(h) { ih.set.call(this, trHTML(h)); } });
  }
  // el texto original en castellano de una especie (en catalán, para decidir; en castellano, la misma)
  const ES_DE = CAT && window.DB_ES ? Object.fromEntries(window.DB_ES.especies.map(e => [e.id, e])) : {};
  const enES = e => ES_DE[e.id] || e;
  // el cuaderno de bolsillo lleva su propia letra para texto pequeño (setas.css, .libro-bolsillo)
  document.documentElement.classList.add(GUIA ? "libro-guia" : "libro-bolsillo");
  if (MINI) document.documentElement.classList.add("libro-mini", "mini-" + MINI);
  // en la portada: qué cuaderno es (los mini, por sus páginas: las hojas dependen de si se imprime en A5 o en A6)
  const EDLAB = MINI ? "cuaderno mini" : "cuaderno completo";   // en los mini se añaden las páginas al final (build)
  const EDICION = "Otoño 2026";
  // portada: rossinyols en el cuaderno; ceps en la guía (para distinguirlos a primera vista)
  const PORTADA = GUIA ? { id: "boletus-edulis", papel: "recolectado" } : { id: "cantharellus-cibarius", papel: "recolectado" };

  // Cuaderno breve: solo las setas y árboles imprescindibles (lista en ../datos/breve.js, la misma que usa el quiz).
  // Las que se confunden con cada una salen dentro de su ficha, con foto pequeña.
  const BREVE = window.BREVE;
  // Setas casi iguales que van juntas en una sola página, con sus pequeñas diferencias
  // (fotos: [especie, foto (ruta g), pie corto]; filas: [qué, la primera, la segunda])
  // (bolsillo: solo en el cuaderno de bolsillo, para que quepan dos setas por hoja; en la guía siguen por separado)
  // (las trompetas negra y amarilla, trompeta de la mort y camagroc, ya no van juntas: cada una en su página)
  const PAREJAS = [{
    ids: ["lactarius-sanguifluus", "lactarius-deliciosus"],
    nombre: "Níscalos", cols: ["Níscalo de sangre", "Níscalo"],
    q: "rebollón · mízcalo",
    lat: "<i>Lactarius sanguifluus</i> y <i>L. deliciosus</i> · rovelló, pinetell",
    lede: "Casi iguales y los dos comestibles excelentes. Lo que los separa es el color del látex al cortarlos.",
    fotos: [["lactarius-sanguifluus", "fotos/g/db970a74779d.jpg", "De sangre: naranja vinoso, con pocas zonas."],
      ["lactarius-deliciosus", "fotos/g/87b9e09821d1.jpg", "Níscalo: zonas bien marcadas."],
      ["lactarius-deliciosus", "fotos/g/8bd69c6b0fd3.jpg", "Níscalo: láminas naranja vivo."]],
    // en el cuaderno de bolsillo, una foto de cada uno: la del níscalo, de lado, con las láminas y el pie
    // hasta la base (la de arriba solo enseñaba sombreros); el 4.º dato es el encuadre (object-position)
    fotosBolsillo: [["lactarius-sanguifluus", "fotos/g/db970a74779d.jpg", "De sangre: naranja vinoso, con pocas zonas."],
      ["lactarius-deliciosus", "fotos/g/8bd69c6b0fd3.jpg", "Níscalo: láminas naranja vivo y pie hasta la base.", "50% 92%"]],
    filas: [["Látex", "Rojo vino desde el primer momento", "Naranja zanahoria; no pasa a vino"],
      ["Láminas", "Rosa vinoso o lila", "Naranja vivo"],
      ["Dónde", "Pino carrasco y piñonero, a menudo en suelo calizo; de la costa a la montaña media", "Pino silvestre y laricio: pinares más frescos y de montaña, umbrías"]],
    claves: ["Láminas que se manchan de verde al tocarlas.", "Pie corto y hueco, con hoyuelos más oscuros.",
      "Látex de color al cortar: si es blanco, descártelo.", "Siempre bajo pinos."],
    compruebe: "Corte el pie y mire el color del látex en el primer momento."
  }, {
    bolsillo: true,
    ids: ["hygrophorus-latitabundus", "hygrophorus-russula"],
    nombre: "Babosa negra y carlet", cols: ["Babosa negra", "Carlet"],
    lat: "<i>Hygrophorus latitabundus</i> y <i>H. russula</i> · llenega negra",
    lede: "Del mismo grupo y las dos muy buenas: láminas blancas, como de cera.",
    fotos: [["hygrophorus-latitabundus", "fotos/g/f446747575f3.jpg", "Babosa negra: oscura, brillante y viscosa."],
      ["hygrophorus-russula", "fotos/g/49979ba7f94f.jpg", "Carlet: rosa con manchas vinosas."],
      ["hygrophorus-latitabundus", "fotos/g/2438fe643abf.jpg", "Láminas blancas, espaciadas, como de cera."]],
    filas: [["Sombrero", "Pardo oscuro a casi negro, con mucha baba", "Rosa vinoso con manchas, poco viscoso"],
      ["Láminas", "Blancas, espaciadas", "Blancas, se manchan de vinoso"],
      ["Pie", "Abajo, con una funda de baba gris", "Robusto, con manchas vinosas"],
      ["Dónde", "Bajo pinos, en suelo calizo", "Bajo encinas y robles"]],
    claves: ["Láminas blancas, gruesas y céreas: como de cera al tocarlas.", "Esporada blanca.", "Salen tarde: de octubre a diciembre."],
    compruebe: "Láminas blancas: si con la edad se vuelven rosa salmón o pardo herrumbre, no es ninguna de las dos."
  }, {
    bolsillo: true,
    ids: ["lactarius-zonarius", "lactarius-chrysorrheus"],
    nombre: "Enganyapastors", cols: ["Enganyapastors", "De llet groga"],
    lat: "<i>Lactarius zonarius</i> y <i>L. chrysorrheus</i> · pinetell bord, rovelló bord",
    lede: "Parecen níscalos, pero su látex es blanco. Los dos son tóxicos.",
    fotos: [["lactarius-zonarius", "fotos/g/d09e00f9142d.jpg", "Enganyapastors: zonas como el níscalo."],
      ["lactarius-chrysorrheus", "fotos/g/ae48bcffefe9.jpg", "De llet groga: látex blanco que amarillea."],
      ["lactarius-zonarius", "fotos/g/ee3188e47a50.jpg", "Láminas crema, nunca verdes."]],
    filas: [["Látex", "Blanco, no cambia; muy picante", "Blanco que amarillea en segundos"],
      ["Sombrero", "Crema a naranja pálido, con zonas", "Ocre salmón pálido, con zonas"]],
    claves: ["Látex BLANCO al cortar (en los níscalos es rojo vino o naranja).", "Láminas crema que no se manchan de verde.",
      "Bajo encinas, alcornoques y robles; no bajo pinos."],
    compruebe: "Corte el pie: si el látex es blanco, descártela."
  }, {
    bolsillo: true,
    ids: ["hygrophoropsis-aurantiaca", "omphalotus-olearius"],
    nombre: "Falsos rebozuelos", cols: ["Falso rebozuelo", "Seta de olivo"],
    lat: "<i>Hygrophoropsis aurantiaca</i> y <i>Omphalotus olearius</i> · fals rossinyol, gírgola d'olivera",
    lede: "Naranjas como el rebozuelo, pero con láminas finas de verdad.",
    causa: { "hygrophoropsis-aurantiaca": "No comestible: puede sentar mal." },
    fotos: [["omphalotus-olearius", "fotos/g/fb8831e7a529.jpg", "Seta de olivo: en ramillete sobre un tocón."],
      ["hygrophoropsis-aurantiaca", "fotos/g/e013bbbc7601.jpg", "Falso rebozuelo: pequeño y todo naranja."],
      ["hygrophoropsis-aurantiaca", "fotos/g/5b1ccc687ace.jpg", "Láminas finas, apretadas y ramificadas."]],
    filas: [["Tamaño", "Pequeño (2–8 cm), carne delgada y blanda", "Grande (5–15 cm) y carnoso"],
      ["Cómo sale", "Suelto, en la pinaza o sobre madera podrida de pino", "En ramilletes de pies unidos, sobre tocones y raíces de olivo, encina o castaño"]],
    claves: ["Láminas verdaderas: finas, apretadas y que bajan por el pie.", "Todo naranja: sombrero, láminas y pie.",
      "Pase el dedo por debajo: las láminas se separan; los pliegues del rebozuelo, no."],
    compruebe: "Debajo del sombrero: láminas finas, falso; pliegues gruesos y romos, rebozuelo."
  }, {
    bolsillo: true,
    ids: ["amanita-pantherina", "amanita-muscaria"],
    nombre: "Amanita pantera y matamoscas", cols: ["Amanita pantera", "Matamoscas"],
    lat: "<i>Amanita pantherina</i> y <i>A. muscaria</i> · pixacà, reig bord",
    lede: "Dos amanitas con verrugas blancas y el mismo veneno.",
    sintomas: "Confusión, agitación, alucinaciones y somnolencia; vómitos.",
    fotos: [["amanita-muscaria", "fotos/g/6fe8c495e42f.jpg", "Matamoscas: rojo con verrugas blancas."],
      ["amanita-pantherina", "fotos/g/9d81561ed5de.jpg", "Amanita pantera: parda con verrugas blancas."],
      ["amanita-pantherina", "fotos/g/7c1387667a07.jpg", "Amanita pantera: bulbo con reborde, como un calcetín."]],
    filas: [["Sombrero", "Pardo; verrugas blanco puro, en círculos", "Rojo o naranja, más grande"],
      ["Base", "Bulbo con reborde, como un calcetín", "Bulbo con anillos de volva"],
      ["Dónde", "Pinares, robledales, hayedos, encinares", "Pinares y abedulares de montaña"]],
    claves: ["Verrugas blancas en el sombrero (la lluvia puede borrarlas).", "Láminas y pie blancos; bulbo en la base."],
    compruebe: "Láminas blancas, anillo y volva: descártela (la oronja las tiene amarillas)."
  }, {
    bolsillo: true,
    ids: ["inocybe-geophylla", "mycena-pura"],
    nombre: "Pequeñas con muscarina", cols: ["Barret de bruixa", "Mycena pura"],
    lat: "<i>Inocybe geophylla</i> y <i>Mycena pura</i>",
    lede: "Pequeñas, blancas o lilas; las lilas se confunden con el pie azul.",
    fotos: [["inocybe-geophylla", "fotos/g/101f0b4da93a.jpg", "Barret de bruixa: blanco, con un pico en el centro."],
      ["mycena-pura", "fotos/g/a6689cbc9203.jpg", "Mycena pura: lila, borde con rayas."],
      ["mycena-pura", "fotos/g/60cf092643de.jpg", "Mycena pura, entre la pinaza."]],
    filas: [["Color", "Blanco sedoso, a veces lila", "Lila o rosado; borde con rayas"],
      ["Forma", "Cónico, con pico; fibras que se agrietan", "Acampanado; pie hueco y frágil"],
      ["Olor", "A tierra", "A rábano"]],
    claves: ["Pequeñas: de 1 a 5 cm.", "En la hojarasca de pinares, hayedos y bosques mixtos."],
    compruebe: "Tamaño: el pie azul es grande, carnoso y huele a fruta."
  }].filter(c => !(GUIA && c.bolsillo));
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
  const PEL = { mortal: "mortal", toxica: "tóxica", no_comestible: "no comestible", condicionada: "condicionada", comestible: "comestible", sin_interes: "sin interés" };
  const SEV = { mortal: 0, toxica: 1, no_comestible: 2, sin_interes: 2.5, condicionada: 3, comestible: 4 };
  const DIF = { baja: [1, "Fácil"], media: [2, "Media"], alta: [3, "Difícil"] };
  const MESL = [CAT ? "G" : "E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const HIM_ICON = { laminas: "lamines", poros: "porus", pliegues: "plecs", aguijones: "agullons", liso: "plecs" };

  const comestible = e => ["comestible", "condicionada"].includes(e.comestibilidad.cat);
  const GROUPS = {
    comestibles: ESENCIAL.filter(comestible),
    mortales: ESENCIAL.filter(e => e.comestibilidad.cat === "mortal"),
    toxicas: ESENCIAL.filter(e => ["toxica", "no_comestible"].includes(e.comestibilidad.cat))
  };
  const ORDEN = [...GROUPS.comestibles, ...GROUPS.toxicas, ...GROUPS.mortales];

  // ---------- nombres ----------
  // libros en castellano: el nombre principal es el castellano y el catalán va de segundo, junto al científico
  // (si no tiene nombre popular en castellano, el principal es el catalán)
  // (en catalán, al revés: el catalán primero y el castellano de segundo)
  const PRI = n => (CAT ? n.ca : n.es) || [], SEG = n => (CAT ? n.es : n.ca) || [];
  const titulo = e => cap(PRI(e.nombres)[0] || SEG(e.nombres)[0]) || e.nombre;
  const sinNombre = e => !e.nombres.ca[0] && !e.nombres.es[0];
  const tituloHTML = e => (sinNombre(e) ? `<i>${esc(e.nombre)}</i>` : esc(titulo(e)));
  // la línea de debajo del nombre: científico y nombres en catalán (los que no son ya el principal)
  const segundaLinea = (e, nCa = 2) => [sinNombre(e) ? "" : `<i>${esc(e.nombre)}</i>`, ...(PRI(e.nombres)[0] ? SEG(e.nombres).slice(0, nCa) : SEG(e.nombres).slice(1, nCa)).map(esc)].filter(Boolean).join(" · ");
  // otros nombres en castellano (arriba a la derecha)
  const otrosEs = e => (PRI(e.nombres)[0] ? PRI(e.nombres).slice(1, 2) : []);
  const nombreConf = c => { const x = c.id && TODAS[c.id]; if (x) return tituloHTML(x); const n = CAT ? c.ca || c.es : c.es || c.ca; return n ? esc(cap(n)) : `<i>${esc(c.nombre)}</i>`; };
  // lo que va debajo de un nombre que hace de título: «catalán · científico» (lo que no sea ya el principal)
  const dosMas = (es, ca, sci) => [es && ca ? esc(ca) : "", (es || ca) && sci ? `<i>${esc(sci)}</i>` : ""].filter(Boolean).join(" · ");
  const segundosDe = x => dosMas(PRI(x.nombres)[0], SEG(x.nombres)[0], x.nombre);
  const segundosConf = c => { const x = c.id && TODAS[c.id]; return x ? segundosDe(x) : CAT ? dosMas(c.ca, c.es, c.nombre) : dosMas(c.es, c.ca, c.nombre); };

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
    monte: svg('<path d="M.4 10.9 4.3 3.6l2.1 3.6 1.5-2.3 3.7 6z"/><path d="m3.3 5.5 1-1.9 1 1.7-.6-.4-.4.5z" fill="#fff" fill-opacity=".7"/>'),
    calendari: svg('<path d="M1.4 2.6h9.2a.6.6 0 0 1 .6.6v7.6a.6.6 0 0 1-.6.6H1.4a.6.6 0 0 1-.6-.6V3.2a.6.6 0 0 1 .6-.6zm.4 3v4.6h8.4V5.6z"/><path d="M3.3 1.2h1v2.3h-1zm4.4 0h1v2.3h-1z"/>')
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
  const sinNormativa = t => (String(t || "").match(/[^.!?]+[.!?]+(\s|$)/g) || [String(t || "")]).filter(f => !/RD\s?30\/2009|anexo del RD|annex del RD|venta|venda/i.test(f) && /[a-záéíóúñü]{2}/i.test(f)).join("").trim() || String(t || "");
  // la primera frase, solo hasta el primer «;» si así cabe («Copa irregular y alta; la parte…» → «Copa irregular y alta.»)
  const cortaClausula = (t, max) => {
    const s = primera(t, 999), c = s.split(/;\s/)[0].replace(/[.,:]$/, "");
    return c.length <= max ? c + "." : primera(s, max);
  };
  // la primera frase; si es larga, hasta el último «;» que quepa («…y somnolencia; vómitos; en casos graves…» → «…y somnolencia; vómitos.»)
  const hastaComa = (t, max) => {
    const s = primera(t, 999);
    if (s.length <= max) return s;
    const partes = s.replace(/[.]$/, "").split(/;\s/);
    let out = partes[0];
    for (const x of partes.slice(1)) { if ((out + "; " + x).length > max) break; out += "; " + x; }
    return out.length <= max ? out + "." : primera(s, max);
  };
  const lista = arr =>(arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + (CAT ? " i " : " y ") + arr[arr.length - 1]);
  const Y_OTROS = CAT ? " i altres" : " y otros";
  const nomArb = a => (CAT ? a.nombres.ca[0] || a.nombres.es[0] : a.nombres.es[0]);

  // ---------- tóxicas: qué gravedad tiene y por qué ----------
  function gravedad(e) {
    e = enES(e);
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
    const s = enES(e).toxicidad?.sindrome || "";
    const c = CAUSA.find(([re]) => re.test(s));
    if (c) return c[1];
    const fr = String(e.comestibilidad.texto || "").match(/[^.!?]+[.!?]+(\s|$)/g) || [e.comestibilidad.texto || ""];
    return (fr.find(f => /gastro|digest|molest|molèst|trastorn/i.test(f)) || fr[0]).trim();
  }
  const gravedadHTML = e => {
    const [n, t] = gravedad(e);
    return `<p class="grav"><span class="lab">Gravedad</span><span class="gd">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span><b>${t}.</b> ${esc(causa(e))}</p>`;
  };
  // olor y sabor, solo si son peculiares (harina, anís, picante, amargo…); fuera los avisos entre paréntesis
  const AVISO = /\s*\((?:[^)]*(?:dato|dada|subjetiv|subjectiu|subjectiv|diagnóstic|diagnòstic|pruebe|tasti|provi)[^)]*)\)/gi;
  const PECULIAR = /harin|anís|almendra|albaricoque|rábano|carroña|tinta|fenol|picante|amarg|avellana|ajo|dulzón|perfumad|yodo/i;
  function olorSabor(e, ok) {
    // se decide con el texto en castellano (mE) y se escribe en el idioma del libro (m)
    const m = e.morfologia || {}, mE = enES(e).morfologia || {};
    const lim = s => String(s || "").replace(AVISO, "").trim().replace(/\.$/, "");
    const amargo = !lim(mE.sabor) && /amarg/i.test(mE.carne || "");
    const o = lim(m.olor), s = lim(m.sabor) || (amargo ? (CAT ? "Una mica amarg" : "Algo amargo") : "");
    const sE = lim(mE.sabor) || (amargo ? "Algo amargo" : "");
    const partes = [];
    if (PECULIAR.test(lim(mE.olor)) && !/poco diagnóstico/i.test(mE.olor || "")) partes.push(`<span class="lab">Olor</span>${esc(o)}.`);
    if (PECULIAR.test(sE)) partes.push(`<span class="lab">Sabor</span>${esc(s)}${ok ? "" : CAT ? " (no la tasti)" : " (no la pruebe)"}.`);
    return partes.length ? `<p class="os">${partes.join(" ")}</p>` : "";
  }

  function newPage(sec, cls = "") {
    const p = document.createElement("section");
    p.className = "page " + cls;
    // primera página de cada sección (para «Empiezan en la página…»)
    if (sec && !PAGE_OF["sec:" + sec]) PAGE_OF["sec:" + sec] = p;
    if (sec) {
      p.dataset.sec = sec;
      const s = SEC[sec];
      p.innerHTML = `<div class="tab" style="--tab-y:${s.y}mm;--tab-c:${s.c}"><span>${s.t}</span></div>`;
    }
    book.appendChild(p);
    return p;
  }
  // cuaderno: «00» guarda el sitio del número de página (se pone al final), así el pie mide lo mismo al ajustar
  // la página (en la guía el número entra en el margen de abajo sin que se note, y así no cambia nada)
  const foot = label => `<footer class="pf"><span>${esc(label)}</span><span class="pn">${GUIA ? "" : "00"}</span></footer>`;
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
  // solo en el cuaderno de bolsillo: tres fotos que se vean distintas (parasol: el sombrero visto desde arriba en vez de la
  // foto hecha desde abajo; en las demás, en lugar de una foto repetida o casi igual a otra de la misma página)
  const FOTOS_BOLSILLO = {
    "macrolepiota-procera": ["fotos/g/4928e51e29bc.jpg", "fotos/g/dd2fdf885cb9.jpg", "fotos/g/698b7943422d.jpg"],
    "sparassis-crispa": ["fotos/g/909c6ea8841b.jpg", "fotos/g/3c81b070a22b.jpg", "fotos/g/61be86c85746.jpg"], // al pie del pino
    "lycoperdon-perlatum": ["fotos/g/152f50ecb24d.jpg", "fotos/g/0c69c19b62ad.jpg", "fotos/g/305eb20d442b.jpg"], // viejo
    "lepista-nuda": ["fotos/g/83ae72f34586.jpg", "fotos/g/adf851a161e6.jpg", "fotos/g/a2aaafec3863.jpg"], // ya parda
    "marasmius-oreades": ["fotos/g/4927c8caed3f.jpg", "fotos/g/77a02bc14996.jpg", "fotos/g/13abc7fc3584.jpg"], // el pie
    "cyclocybe-cylindracea": ["fotos/g/65b5c31f2a4c.jpg", "fotos/g/faf4152b67a7.jpg", "fotos/g/a4db3a92d4d3.jpg"],
    "russula-torulosa": ["fotos/g/e75f0838fa01.jpg", "fotos/g/8357f30ec219.jpg", "fotos/g/70e8fb7b3bb0.jpg"],
    "rubroboletus-satanas": ["fotos/g/a151042e0160.jpg", "fotos/g/0cafaa1bc3ed.jpg", "fotos/g/3abc6e4d2d3a.jpg"], // azulea
    "lepiota-cristata": ["fotos/g/7a06abb49c17.jpg", "fotos/g/1cf83c2a18b9.jpg", "fotos/g/8df0d8bf9042.jpg"],
    "entoloma-sinuatum": ["fotos/g/a798ac899201.jpg", "fotos/g/049f9a91ae33.jpg", "fotos/g/6f6419be6c01.jpg"],
    "inosperma-erubescens": ["fotos/g/e591ec1c693d.jpg", "fotos/g/ce9715d17d4c.jpg", "fotos/g/e50624f3a1c1.jpg"],
    "cortinarius-orellanus": ["fotos/g/3a864a604452.jpg", "fotos/g/d8e9e136d99b.jpg", "fotos/g/79b9a464dca2.jpg"]
  };
  const PICK = Object.fromEntries(ESENCIAL.map(e => {
    const fijas = ((!GUIA && FOTOS_BOLSILLO[e.id]) || FOTOS_CUADERNO[e.id] || []).map(g => (e.fotos || []).find(f => f.g === g)).filter(Boolean);
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
    const ns = (e.ecologia?.arboles || []).filter(a => a.rel !== "ocasional").map(a => ARB[a.id] && nomArb(ARB[a.id])).filter(Boolean);
    const out = [];
    let prev = "";
    for (const n of ns.slice(0, max)) {
      const [w, ...r] = n.split(" ");
      out.push(w === prev && r.length ? r.join(" ") : n);
      prev = w;
    }
    return out.length ? lista(out) + (ns.length > max ? Y_OTROS : "") : "";
  }
  function habitatIcons(e) {
    const eco = e.ecologia || {};
    const g = new Set((eco.arboles || []).map(a => ARB[a.id]?.grupo));
    const out = [];
    if (g.has("conifera")) out.push(["pineda", "coníferas"]);
    if (g.has("frondosa")) out.push(["fulla", "frondosas"]);
    if ((eco.habitats || []).some(h => /prado|pasto|parques|huertos|dunas/.test(h))) out.push(["prat", "prados"]);
    if ((enES(e).ecologia?.sustrato || []).some(s => /madera/.test(s))) out.push(["fusta", "madera"]);
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
  // Portada de los cuadernos (bolsillo y mini): fondo verde bosque, el título grande y un racimo de fotos
  // redondas, cada una con un aro del color de su grupo (verde comestible, naranja tóxica, rojo mortal):
  // de un vistazo se ve para qué sirve el cuaderno, distinguirlas. Abajo, los grupos y urgencias.
  // Huecos del racimo: [centro x, centro y, diámetro] en mm; la primera, la grande.
  const CIRCULOS = [[54, 75, 44], [19, 58, 26], [88, 54, 24], [90, 87, 28], [17, 92, 28], [40, 106, 14], [68, 107, 16], [40, 43, 13]];
  // las fotos de cada cuaderno, en el orden de los huecos: [especie, foto, encuadre]; otras en cada uno para distinguirlos
  const PORTADA_FOTOS = {
    bolsillo: [["boletus-edulis", "fotos/g/daa8b786e6b5.jpg", "50% 45%"], ["cantharellus-cibarius", "fotos/g/4c81aed9b18d.jpg", "40% 50%"],
      ["lactarius-deliciosus", "fotos/g/87b9e09821d1.jpg", "50% 50%"], ["amanita-muscaria", "fotos/g/6fe8c495e42f.jpg", "50% 35%"],
      ["amanita-phalloides", "fotos/g/47b20ff9a6ff.jpg", "50% 40%"], ["craterellus-cornucopioides", "fotos/g/fed8d2eb141c.jpg", "50% 50%"],
      ["cortinarius-orellanus", "fotos/g/3a864a604452.jpg", "45% 45%"], ["omphalotus-olearius", "fotos/g/fb8831e7a529.jpg", "50% 50%"]],
    mini2: [["amanita-caesarea", "fotos/g/8205426474fa.jpg", "40% 50%"], ["macrolepiota-procera", "fotos/g/dd2fdf885cb9.jpg", "50% 30%"],
      ["lepista-nuda", "fotos/g/83ae72f34586.jpg", "50% 45%"], ["rubroboletus-satanas", "fotos/g/a151042e0160.jpg", "50% 45%"],
      ["amanita-verna", "fotos/g/366ea7c73945.jpg", "50% 25%"], ["lycoperdon-perlatum", "fotos/g/152f50ecb24d.jpg", "50% 50%"],
      ["galerina-marginata", "fotos/g/62c60c539d4a.jpg", "50% 50%"], ["amanita-pantherina", "fotos/g/9d81561ed5de.jpg", "50% 40%"]],
    mini3: [["cantharellus-cibarius", "fotos/g/1229e0d17140.jpg", "50% 50%"], ["morchella-esculenta", "fotos/g/bcc923ad70aa.jpg", "50% 40%"],
      ["lactarius-sanguifluus", "fotos/g/db970a74779d.jpg", "45% 50%"], ["tricholoma-equestre", "fotos/g/cc4d0abd4b86.jpg", "50% 50%"],
      ["amanita-virosa", "fotos/g/e240bdd5104e.jpg", "50% 40%"], ["hydnum-repandum", "fotos/g/3340f88ce6bd.jpg", "50% 50%"],
      ["lepiota-brunneoincarnata", "fotos/g/2c853bcda179.jpg", "50% 50%"], ["amanita-muscaria", "fotos/g/9242ccdca2ab.jpg", "50% 45%"]]
  };
  function portadaCirculos() {
    const fotos = PORTADA_FOTOS[MINI ? "mini" + MINI : "bolsillo"];
    const p = newPage(null, "cover cover-c");
    const circ = fotos.map(([id, g, pos], k) => {
      const e = BY[id], f = (e?.fotos || []).find(x => x.g === g), c = CIRCULOS[k];
      if (!e || !f || !c) return "";
      EXTRA.push(["Portada", f]);
      const [x, y, d] = c;
      // el aro, del color de la sección del cuaderno (las «condicionadas», con las comestibles)
      const st = { comestibles: "comestible", toxicas: "toxic", mortales: "mortal" }[EST[e.comestibilidad.cat].sec];
      return `<figure class="cvc-f st-${st}" style="left:${x - d / 2}mm;top:${y - d / 2}mm;width:${d}mm;height:${d}mm"><img src="${G(f.g)}" alt="" style="object-position:${pos}"></figure>`;
    }).join("");
    const grupo = (sec, st, t) => `<span class="cvc-gr st-${st}" data-ir="${sec}"><i></i><b>${GROUPS[sec].length}</b> ${t}</span>`;
    p.innerHTML = `
      <div class="cvc-ed"><span>Cistella Segura · <span class="cvc-edlab">${esc(EDLAB)}</span></span><span>${EDICION}</span></div>
      <h1 class="cvc-t">Setas<em>esenciales</em></h1>
      <p class="cvc-sub">de Cataluña</p>
      ${circ}
      <div class="cvc-pie">
        <p class="cvc-s">Las <b>${ESENCIAL.length}</b> que hay que conocer: cómo reconocerlas, dónde y cuándo salen, y con qué no confundirlas.</p>
        <p class="cvc-grs">${grupo("comestibles", "comestible", "comestibles")}${grupo("toxicas", "toxic", "tóxicas")}${grupo("mortales", "mortal", "mortales")}</p>
        <p class="cvc-sos"><b>Ante la duda, no la recolecte.</b><span>Emergencias <strong>112</strong><br>Toxicología 24 h <strong>91 562 04 20</strong></span></p>
      </div>`;
    if (overflows(p)) REPORT.overflow.push("portada: no cabe");
  }
  function portada() {
    if (!GUIA) return portadaCirculos();
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
  // Cuadernos (completo y mini): todo lo de antes de salir en una sola página, en pequeño (no hace falta más):
  // las 12 reglas, una línea cada una; cómo mirar una seta (el dibujo y los seis pasos); «láminas blancas +
  // anillo + volva = descarte»; cómo leer las fichas y en qué página empieza cada sección
  const REGLAS_CORTAS = [
    "Recolecte solo lo que conoce a fondo.",
    "Saque la seta entera, con la base del pie.",
    "Revise cada ejemplar, uno a uno.",
    "No mezcle especies; las dudosas, aparte y en papel.",
    "Deseche las viejas, agusanadas, empapadas o heladas.",
    "Cesta rígida y ventilada; nunca bolsas de plástico.",
    "No crea en pruebas caseras (ajo, cuchara de plata…).",
    "Las apps de fotos orientan, pero no deciden.",
    "Ante la duda, consulte a un micólogo con la seta entera.",
    "Cocínelas siempre: muchas son tóxicas en crudo.",
    "Guarde una cruda de cada especie hasta el día siguiente.",
    "Evite cunetas, zonas industriales y campos tratados."
  ];
  function reglasCortasPage() {
    const p = newPage("guia", "reglas-page antes-page");
    const gd = n => `<span class="gd">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
    const sec = (k, t) => `<span class="${EST[k].st === "precaucio" ? "" : "st-" + EST[k].st}"><i></i>${t} <span class="ref" data-ref="sec:${EST[k].sec}" data-fmt="n">00</span></span>`;
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Antes de salir</div>
      <h2 class="pt">Las ${REGLAS_CORTAS.length} reglas</h2>
      <ol class="normes reglas cortas compactas">${REGLAS_CORTAS.map((r, i) => `<li><span class="nn">${i + 1}</span><p>${esc(r)}</p></li>`).join("")}</ol>
      <div class="mirar-c"><div class="h3">Cómo mirar una seta</div>
        <div class="mirar-c-in">${ANATOMIA}<ol class="mirar">${MIRAR.map(([t, d], i) => `<li><span class="nn">${i + 1}</span><span><b>${esc(t)}.</b> ${esc(d)}</span></li>`).join("")}</ol></div>
        <p class="redbar">Láminas blancas + anillo + volva = DESCARTE</p></div>
      <div class="leyenda">
        <div class="kicker">Cómo leer las fichas</div>
        <ul class="ley">
          <li><span class="v"><span class="pill st-comestible">Comestible</span><span class="pill st-toxic">Tóxica</span><span class="pill st-mortal">Mortal</span></span><span>Qué es. El mismo color va en la pestaña del margen.</span></li>
          <li><span class="v st-comestible"><span class="lvl"><i class="on"></i><i class="on"></i><i></i></span><b>Media</b></span><span>Dificultad para reconocerla: fácil, media o difícil.</span></li>
          <li><span class="v st-comestible">${meses([9, 10, 11], [8, 12])}</span><span>Meses en que sale; en claro, solo algunos años.</span></li>
          <li><span class="v"><span class="rasgos en-linea"><span class="r-si"><i class="mk">${MARCA.si}</i></span><span class="r-no"><i class="mk">${MARCA.no}</i></span><span class="r-medio"><i class="mk">${MARCA.medio}</i></span></span></span><span>Cómo es: lo tiene, no lo tiene, solo en parte.</span></li>
          ${MINI ? "" : `<li><span class="v ley-ic">${ICON.pineda}${ICON.fulla}${ICON.prat}${ICON.fusta}${ICON.monte}</span><span>Dónde: pinos y abetos, árboles de hoja ancha, prados, madera, altitud.</span></li>`}
          ${MINI ? "" : `<li><span class="v ley-ic ley-f3">${PIC.olor}${PIC.reloj}${PIC.lupa}</span><span>Olor, cuándo salen los síntomas y qué comprobar antes de cogerla.</span></li>`}
          <li><span class="v st-toxic grav">${gd(2)}<b>Grave</b></span><span>En las tóxicas: leve, moderada, grave o mortal.</span></li>
          <li><span class="v"><span class="refx">→ p. 12</span></span><span>Página de la seta con la que se confunde.</span></li>
        </ul>
        <p class="secs"><b>Empiezan en la página</b>${sec("comestible", "Comestibles")}${sec("toxica", "Tóxicas")}${sec("mortal", "Mortales")}${MINI ? "" : `<span class="st-arb"><i></i>Árboles <span class="ref" data-ref="sec:anexo" data-fmt="n">00</span></span>`}</p>
      </div>
      ${CREDITO}
      ${foot("Antes de salir")}`);
    fit(p, ["denso", "denso2", ".anat"], "antes de salir");
  }
  function reglasPage() {
    if (!GUIA) return reglasCortasPage();
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
  // «Cómo mirar una seta»: el dibujo con sus partes y los seis pasos (en la guía, en su página; en los cuadernos,
  // en pequeño en la página «Antes de salir»)
  const MIRAR = [
    ["Sombrero", "Color, textura (lisa, escamosa, viscosa) y margen."],
    ["Debajo", "Láminas, poros, pliegues o aguijones. Color, y si bajan por el pie."],
    ["Anillo", "¿Tiene? ¿Fijo o se desliza?"],
    ["Pie", "Lleno o hueco, fibroso o quebradizo. ¿Dibujos?"],
    ["Base", "Extráigala entera y escarbe: ¿hay volva?"],
    ["Carne", "Córtela: ¿látex? ¿Cambia de color? ¿Olor?"]
  ];
  const ANATOMIA = `<svg class="anat" viewBox="0 0 200 112" aria-hidden="true">
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
      </svg>`;
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
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Antes del nombre</div>
      <h2 class="pt">Cómo mirar una seta</h2>
      <p class="ps">Seis cosas, siempre en este orden. Si falta una, no la puede identificar.</p>
      ${ANATOMIA}
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
        <div class="bosc-txt"><h3>${esc(cap(nomArb(a)))} <small>${esc((CAT ? a.nombres.es[0] : a.nombres.ca[0]) || "")}${a.nombre ? ` · <i>${esc(a.nombre)}</i>` : ""}</small></h3>
        <p class="curt">${esc(GUIA ? primera(a.reconocer?.distancia, 120) : cortaClausula(a.reconocer?.distancia, 85))}</p>
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
        ${more ? "" : `<p class="ps">${GUIA ? "Muchas setas viven unidas a las raíces de un árbol: reconocerlo por la hoja y el tronco ayuda a saber qué buscar." : "Reconocer el árbol por la hoja y el tronco ayuda a saber qué buscar."}</p>`}
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
    if (!x || !(x.fotos || []).length) { const f = conFoto(c); return f ? G(f.t || f.g) : ""; }
    const f = (PICK[x.id] || [])[0] || (x.fotos || []).find(f => f.papel === "adulto") || (x.fotos || [])[0];
    return f ? G(f.t || f.g) : "";
  }
  // setas con que se confunde que no tienen ficha (ni foto): su foto de iNaturalist (../datos/fotos-confusiones.js)
  const conFoto = c => (window.FOTOS_CONF || {})[c.nombre] || null;
  // =========================================================
  // CUADERNO: FICHA PENSADA PARA LEERSE BIEN IMPRESA (sobre todo en A5)
  // - fotos numeradas y sus textos debajo, en oscuro sobre blanco
  // - un recuadro: «Cómo es» (✓ lo tiene, ✗ no lo tiene, ◐ solo en parte) y «Dónde y cuándo»
  //   (árboles con su icono, prados, madera, altitud y meses, todo junto)
  // - las setas con que se confunde, en tarjetas con foto grande
  // =========================================================
  // lo que hay debajo del sombrero, en pocas palabras (resumen de la descripción de cada especie)
  const DEBAJO = {
    "lactarius-sanguifluus": "rosa vinoso, que verdean", "lactarius-deliciosus": "naranja vivo, que verdean",
    "boletus-edulis": "blancos, luego amarillo verdosos", "suillus-granulatus": "amarillos, con gotitas de jóvenes",
    "chroogomphus-rutilus": "gruesas, ocre → púrpura negruzco", "cantharellus-cibarius": "gruesos, del color del sombrero",
    "craterellus-cornucopioides": "por fuera lisa, gris ceniza", "craterellus-lutescens": "casi liso, rosado anaranjado",
    "hydnum-repandum": "blandos, crema anaranjados", "russula-cyanoxantha": "blancas, flexibles y grasas",
    "amanita-caesarea": "amarillo dorado", "macrolepiota-procera": "blancas a crema", "coprinus-comatus": "blancas → rosadas → negras",
    "agaricus-campestris": "rosa vivo → pardo chocolate", "tricholoma-terreum": "blancas a gris pálido", "lepista-nuda": "violeta lila",
    "calocybe-gambosa": "blancas a crema, muy juntas", "hygrophorus-latitabundus": "blancas, gruesas, como de cera",
    "hygrophorus-russula": "blancas, se manchan de vinoso", "marasmius-oreades": "crema, muy separadas",
    "pleurotus-eryngii": "blanquecinas, bajan por el pie", "cyclocybe-cylindracea": "crema → pardo tabaco",
    "morchella-esculenta": "sombrero con alvéolos, como un panal", "lycoperdon-perlatum": "una bola: por dentro, blanca y firme",
    "sparassis-crispa": "lóbulos rizados, como una coliflor", "paxillus-involutus": "ocre, se manchan de pardo",
    "amanita-phalloides": "blancas", "amanita-verna": "blancas", "amanita-virosa": "blancas", "lepiota-brunneoincarnata": "blancas a crema",
    "galerina-marginata": "amarillentas → pardo herrumbre", "inosperma-erubescens": "blanquecinas → pardas, manchas rojas",
    "cortinarius-orellanus": "amarillo anaranjadas → herrumbre", "gyromitra-esculenta": "sombrero arrugado, como un cerebro",
    "lactarius-chrysorrheus": "crema a rosado pálido", "rubroboletus-satanas": "poros rojos, azulean al tocarlos",
    "amanita-muscaria": "blancas", "amanita-pantherina": "blancas", "tricholoma-equestre": "amarillo azufre",
    "tricholoma-pardinum": "blanquecinas, reflejo verdoso", "clitocybe-rivulosa": "blancas a crema, bajan por el pie",
    "omphalotus-olearius": "naranja, finas, bajan por el pie", "entoloma-sinuatum": "amarillentas → rosa salmón",
    "ramaria-formosa": "ramas, como un coral", "russula-torulosa": "crema pálido, frágiles",
    "hygrophoropsis-aurantiaca": "naranja, finas y ramificadas", "mycena-pura": "blanquecinas a lila pálido",
    "hypholoma-fasciculare": "amarillas → verdosas", "inocybe-geophylla": "grisáceas → pardas", "lactarius-torminosus": "crema rosado",
    "lepiota-cristata": "blancas", "agaricus-xanthodermus": "rosadas → pardas", "lactarius-zonarius": "crema",
    "scleroderma-citrinum": "una bola: por dentro, negra violácea"
  };
  const LAB_HIM = { laminas: "Láminas", poros: "Tubos", pliegues: "Pliegues", aguijones: "Aguijones" };
  const ANILLO = {
    "amanita-caesarea": "amarillo, colgante", "macrolepiota-procera": "doble, se desliza", "coprinus-comatus": "fino, se desliza",
    "agaricus-campestris": "fino, se pierde pronto", "cyclocybe-cylindracea": "membranoso", "amanita-phalloides": "blanco, colgante",
    "amanita-verna": "blanco", "amanita-virosa": "blanco, frágil", "galerina-marginata": "fino", "amanita-muscaria": "blanco",
    "amanita-pantherina": "blanco, liso", "lepiota-cristata": "fino, frágil", "agaricus-xanthodermus": "grueso"
  };
  const ANILLO_PARCIAL = {
    "lepiota-brunneoincarnata": "solo una zona algodonosa", "hygrophorus-latitabundus": "solo una zona con baba",
    "tricholoma-terreum": "solo una cortina en los jóvenes", "chroogomphus-rutilus": "solo una cortina en los jóvenes",
    "cortinarius-orellanus": "solo una cortina en los jóvenes"
  };
  const VOLVA = {
    "amanita-caesarea": "blanca, grande, en saco", "amanita-phalloides": "blanca, en saco", "amanita-verna": "blanca, en saco",
    "amanita-virosa": "en saco", "amanita-muscaria": "anillos de escamas en el bulbo", "amanita-pantherina": "un reborde sobre el bulbo"
  };
  const LATEX = { rojo: "rojo vino", naranja: "naranja", blanco: "blanco", blanco_a_amarillo: "blanco → amarillo" };
  const MARCA = {
    si: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.4 4.9 9.2 10 3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    no: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3 3 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    medio: '<svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 1.8a4.2 4.2 0 0 1 0 8.4z" fill="currentColor"/></svg>'
  };
  // «Cómo es»: lo que tiene (✓), lo que no (✗) y cómo es; las que no tienen láminas lo dicen así
  function rasgosLista(e, conDesc = true) {
    const c = e.caracteres || {}, him = c.himenoforo, it = [];
    const desc = x => (conDesc ? x : "");
    if (LAB_HIM[him]) it.push(["si", LAB_HIM[him], desc(DEBAJO[e.id])]);
    else if (him) it.push(["no", "Láminas", desc(DEBAJO[e.id])]);
    if (LAB_HIM[him]) {
      if (c.anillo) it.push(["si", "Anillo", desc(ANILLO[e.id])]);
      else if (ANILLO_PARCIAL[e.id]) it.push(["medio", "Anillo", desc(ANILLO_PARCIAL[e.id])]);
      else it.push(["no", "Anillo", ""]);
      it.push(c.volva ? ["si", "Volva", desc(VOLVA[e.id])] : ["no", "Volva", ""]);
    }
    if (c.latex) it.push(["si", "Látex", desc(LATEX[c.latex] || "")]);
    return it;
  }
  function rasgosHTML(items, esporada) {
    const esp = String(esporada || "").trim().replace(/\.$/, "");
    // la volva, cuando está, en rojo: en las amanitas es la señal de peligro
    return `<ul class="rasgos">${items.map(([t, l, d]) => `<li class="r-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><i class="mk">${MARCA[t]}</i><span><b>${l}</b>${d ? " " + esc(d) : ""}</span></li>`).join("")}${esp ? `<li class="r-dato"><i class="mk"></i><span><b>Esporada</b> ${esc(esp.charAt(0).toLowerCase() + esp.slice(1))}</span></li>` : ""}</ul>`;
  }
  // árboles de un grupo, con el nombre repetido agrupado: «Pino carrasco, laricio y silvestre»
  function arbolesDe(lista_, grupo, max = 4) {
    const ns = [...new Set(lista_.filter(a => a.rel !== "ocasional" && ARB[a.id]?.grupo === grupo).map(a => nomArb(ARB[a.id])).filter(Boolean))];
    const out = [];
    let prev = "";
    for (const n of ns.slice(0, max)) { const [w, ...r] = n.split(" "); out.push(w === prev && r.length ? r.join(" ") : n); prev = w; }
    return out.length ? cap(lista(out)) + (ns.length > max ? Y_OTROS : "") : "";
  }
  // altitud: de dónde a dónde y, si hay bastantes registros, la franja donde más se encuentra
  // (window.ALTITUD, de ../datos/altitud.js: registros de GBIF en Cataluña y la altura del terreno en cada punto)
  function altitudTexto(mins, maxs, frec) {
    if (!maxs.length) return "";
    const lo = Math.min(...mins), hi = Math.max(...maxs);
    let t = `${lo}–${hi} m de altitud`;
    if (frec) {
      const a = Math.max(lo, frec[0]), b = Math.min(hi, frec[1]);
      if (b - a >= 200 && (a > lo || b < hi)) t = `${lo}–${hi} m; sobre todo ${a <= lo ? `por debajo de ${b}` : b >= hi ? `por encima de ${a}` : `${a}–${b}`} m`;
    }
    return t;
  }
  const FREC = id => { const x = (window.ALTITUD || {})[id]; return x && x[2] >= 25 ? x : null; };
  function dondeCuandoHTML(especies, maxTxt = 110) {
    const arbs = especies.flatMap(e => e.ecologia?.arboles || []);
    const h = new Set(especies.flatMap(e => habitatIcons(e).map(x => x[1])));
    const filas = [];
    const con = arbolesDe(arbs, "conifera"), fro = arbolesDe(arbs, "frondosa");
    if (con) filas.push(["pineda", con]);
    if (fro) filas.push(["fulla", fro]);
    if (h.has("prados")) filas.push(["prat", "En prados"]);
    if (h.has("madera")) filas.push(["fusta", "Sobre madera"]);
    const alts = especies.map(e => e.distribucion?.altitud).filter(a => a && a.max != null);
    const frec = especies.length === 1 ? FREC(especies[0].id) : null;
    const alt = altitudTexto(alts.map(a => a.min ?? 0), alts.map(a => a.max), frec);
    if (alt) filas.push(["monte", alt]);
    const mesesU = [...new Set(especies.flatMap(e => e.fenologia?.meses || []))];
    const ex = especies.length === 1 ? especies[0].fenologia?.excepcional : [];
    const det = especies.length === 1 ? primera(especies[0].ecologia?.donde_mirar || especies[0].ecologia?.vegetacion, maxTxt) : "";
    return { donde: `${filas.map(([ic, t]) => `<p class="dc-f">${ICON[ic]}<span>${esc(t)}</span></p>`).join("")}${det ? `<p class="d-mas">${esc(det)}</p>` : ""}`,
      cuando: `<p class="dc-f dc-mes">${ICON.calendari}${meses(mesesU, ex)}</p>` };
  }
  // dos columnas: «Cómo es» (lo que tiene y lo que no) y «Dónde» (árboles, prados, madera y altitud);
  // los meses van en la cabecera
  // parejas: lo que tienen las dos y su altitud en una sola fila (dónde sale cada una ya va en su tabla)
  function filaPareja(items, especies, mesesHTML = "") {
    const alts = especies.map(e => e.distribucion?.altitud).filter(a => a && a.max != null);
    const alt = altitudTexto(alts.map(a => a.min ?? 0), alts.map(a => a.max), null);
    return `<div class="fila2"><ul class="rasgos en-linea">${items.map(([t, l]) => `<li class="r-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><i class="mk">${MARCA[t]}</i><span><b>${l}</b></span></li>`).join("")}</ul>${alt ? `<span class="dc-f">${ICON.monte}<span>${esc(alt)}</span></span>` : ""}${mesesHTML}</div>`;
  }

  // fotos: las tres en fila, iguales y casi cuadradas (la seta se ve entera; las alargadas la cortaban),
  // cada una con su texto debajo, en oscuro sobre blanco (dentro de la foto no se leía al imprimir).
  // etiquetas: en las parejas, el nombre de cada seta encima de su texto
  function fotosB(ph, etiquetas = []) {
    if (!ph.length) return "";
    return `<div class="ph3 n${ph.length}">${ph.map((f, i) => { const pie = pieEs(f.pie); return `<figure><span class="ph3-im"><img src="${G(f.g || f.t)}" alt=""${f.pos ? ` style="object-position:${f.pos}"` : ""}></span>${etiquetas[i] ? `<b class="ph3-et">${esc(etiquetas[i].nombre)}</b>${etiquetas[i].dos ? `<span class="ph3-2">${etiquetas[i].dos}</span>` : ""}` : ""}${pie ? `<figcaption class="pc-t" data-full="${esc(pie)}">${esc(capCorta(pie, 46))}</figcaption>` : ""}</figure>`; }).join("")}</div>`;
  }
  // los pies de foto de la base de datos que nombran la seta en catalán, con el nombre castellano del libro
  const PIES_ES = [[/\bCeps recolectados\b/g, "Boletos recolectados"], [/\bdel molleric\b/g, "del boleto granulado"],
    [/\b(del|un) apagallums\b/g, (m, a) => `${a} parasol`], [/\bel camperol\b/g, "el champiñón silvestre"],
    [/\bel fredolic delgado\b/g, "la negrilla, más delgada"]];
  const pieEs = t => PIES_ES.reduce((s, [re, r]) => s.replace(re, r), String(t || ""));
  // pie de foto más corto: hasta los dos puntos o una coma si es posible (sin «…»)
  const capCorta = (c, max) => {
    c = String(c || "").trim();
    if (c.length <= max) return c;
    const i = c.indexOf(":");
    if (i > 3 && i <= max) return c.slice(0, i);
    const cut = c.slice(0, max), j = cut.lastIndexOf(",");
    if (j > max * .45) return cut.slice(0, j);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "") + "…";
  };
  const acortaCaps = max => p => p.querySelectorAll(".pc-t").forEach(s => (s.textContent = capCorta(s.dataset.full, max)));
  // una frase más corta, cortando en la última coma o punto y coma que quepa
  const cortaFrase = (t, max) => {
    t = String(t || "").trim();
    if (t.length <= max) return t;
    const c = t.slice(0, max), i = Math.max(c.lastIndexOf(";"), c.lastIndexOf(","));
    return i > max * .5 ? c.slice(0, i).trim() + "." : c.slice(0, c.lastIndexOf(" ")).replace(/[,;:]$/, "") + "…";
  };
  // la foto grande de una seta con la que se confunde
  function fotoConfG(c) {
    const x = c.id && TODAS[c.id];
    if (!x || !(x.fotos || []).length) { const f = conFoto(c); return f ? G(f.g || f.t) : ""; }
    const f = (PICK[x.id] || [])[0] || (x.fotos || []).find(f => f.papel === "adulto") || (x.fotos || [])[0];
    return f ? G(f.g || f.t) : "";
  }
  // se confunde con:
  // - las que tienen su propia página en el cuaderno: sin foto (ya está en su página), a todo el ancho:
  //   el nombre, el peligro y la página, en qué se parecen (por qué se confunden) y en qué se distinguen
  // - las que no están en el cuaderno: en dos columnas, cada una con su foto cuadrada al lado del texto
  function confsCards(confs, ok, propios) {
    if (!confs.length) return "";
    const enLibro = c => c.id && BY[c.id] && !propios.includes(c.id);
    const conFotoN = confs.filter(c => !enLibro(c)).length;
    return `<div class="conf mini k${confs.length}${conFotoN === 1 ? " f1" : ""}"><h3>${ok ? "Cuidado: se confunde con" : "Se confunde con"}</h3><ul>${confs.map(c => {
      const d = primera(c.diferencia, 170);
      // con su nombre en catalán al lado: muchos textos de diferencias lo nombran así
      const dos = segundosConf(c);   // catalán y científico, debajo del castellano
      const tag = `<span class="cf-tag cf-${c.peligro}">${PEL[c.peligro] || c.peligro}</span>`;
      if (enLibro(c)) {
        const par = primera(c.comparten, 140).replace(/\.$/, "");
        return `<li class="cft"><p class="cft-n"><b>${nombreConf(c)}</b>${dos ? ` <span class="cc-2-in">${dos}</span>` : ""} ${tag} ${ref(c.id)}</p>`
          + `<p class="cft-t">${par ? `<span class="cc-par"><span class="lab">Se parece</span>${esc(par)}. </span>` : ""}<span class="lab">Se distingue</span><span class="cc-d" data-full="${esc(d)}">${esc(cortaFrase(d, 72))}</span></p></li>`;
      }
      const im = fotoConfG(c);
      return `<li class="cfc${im ? "" : " sin-foto"}">${im ? `<img class="cc-im" src="${im}" alt="">` : `<span class="cc-im cc-vacio">${DIBUJO_BAJO.laminas}</span>`}<p><b>${nombreConf(c)}</b>${dos ? `<span class="cc-2">${dos}</span>` : " "}${tag} <span class="cc-d" data-full="${esc(d)}">${esc(cortaFrase(d, 72))}</span>${c.id && !propios.includes(c.id) ? " " + ref(c.id) : ""}</p></li>`;
    }).join("")}</ul></div>`;
  }
  const acortaDif = max => p => p.querySelectorAll(".cc-d").forEach(s => (s.textContent = cortaFrase(s.dataset.full, max)));
  // «Se parece» es lo primero que se quita de las confusiones si la página no cabe; luego vuelve si queda sitio
  const parecidos = p => [...p.querySelectorAll(".cc-par")].map(s => [s.parentElement, s.outerHTML]);
  const devuelveParecidos = (p, lista) => lista.forEach(([t, h]) => {
    if (!t.isConnected || t.querySelector(".cc-par")) return;
    t.insertAdjacentHTML("afterbegin", h);
    if (overflows(p)) t.firstElementChild.remove();
  });
  // cabecera en poco alto: el nombre y, a su derecha, la etiqueta y la dificultad; debajo, científico y catalán
  // (si el nombre es largo, la etiqueta va encima y el nombre ocupa todo el ancho)
  // la tira de meses va a la derecha del nombre científico (como en muchas guías de campo)
  const cabeceraB = (nombre, pill, dn, dt, segunda, mesesHTML, lede) => {
    const largo = nombre.replace(/<[^>]+>/g, "").length > 18;
    const k = `<span class="hb-k"><span class="pill">${pill}</span>${dots(dn)}<b class="dif">${dt}</b></span>`;
    return `
      <header class="sp-head hb${largo ? " hb-largo" : ""}">
        ${largo ? `<div class="hb-k-arriba">${k}</div>` : ""}
        <div class="hb-top"><h1 class="name">${nombre}</h1>${largo ? "" : k}</div>
        <p class="lat"><span>${segunda}</span>${mesesHTML}</p>
        ${lede ? `<p class="lede">${esc(lede)}</p>` : ""}
      </header>`;
  };

  // =========================================================
  // CUADERNO COMPLETO: FICHA «F3a» (elegida el 6-11-2026 entre las maquetas de butxaca/maquetas-a6.html)
  // - arriba, a sangre, las tres fotos: la grande con el nombre encima y dos a su lado (si sobra sitio, crecen)
  // - debajo, todo a lo ancho: dificultad y meses; «Cómo es» en una línea (✓ lo tiene, ✗ no); dónde y olor con
  //   su icono; el peligro (gravedad y cuándo salen los síntomas); cómo reconocerla, una frase por línea;
  //   las parecidas en tres columnas con su foto; y «Compruebe»
  // =========================================================
  const pic = x => `<svg viewBox="0 0 12 12" aria-hidden="true">${x}</svg>`;
  const PIC = {
    olor: pic('<path d="M6.5 1.1C5.9 4 3.3 6.4 3.3 8.5c0 1.1.9 2 2 2h1.9a1.9 1.9 0 0 0 .4-3.7" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>'),
    reloj: pic('<circle cx="6" cy="6" r="4.8" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M6 3.1V6l2.1 1.4" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>'),
    alerta: pic('<path d="M6 .9 11.5 10.8H.5z"/><path d="M5.35 4.1h1.3l-.2 3.7h-.9zM5.35 8.5h1.3v1.3h-1.3z" fill="#fff"/>'),
    lupa: pic('<circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7.6 7.6 11 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>')
  };
  const minus = t => String(t || "").charAt(0).toLowerCase() + String(t || "").slice(1);
  const SECL = { comestibles: "Comestibles", toxicas: "Tóxicas", mortales: "Mortales" };
  // latencia corta: «de 6 a 24 horas (típicamente 8–12)» → «6–24 h»; «entre 30 minutos y 6 horas» → «30 min – 6 h»
  const UNID = { minuto: "min", minutos: "min", minut: "min", minuts: "min", hora: "h", horas: "h", hores: "h", días: CAT ? "dies" : "días", dias: CAT ? "dies" : "días", dies: "dies", semanas: CAT ? "setmanes" : "semanas", setmanes: "setmanes" };
  const latCorta = t => {
    t = String(t || "").replace(/\s*\([^)]*\)/g, "");
    const m = t.match(/(\d+)\s*(minutos?|minuts?|horas?|hores|días|dies|semanas|setmanes)?\s*(?:a|y|i|–|-)\s*(\d+)\s*(minutos?|minuts?|horas?|hores|días|dies|semanas|setmanes)/i);
    if (!m) return CAT ? t.replace(/^de\s+/i, "") : t;
    const u2 = UNID[m[4].toLowerCase()], u1 = m[2] ? UNID[m[2].toLowerCase()] : u2;
    return u1 === u2 ? `${m[1]}–${m[3]} ${u2}` : `${m[1]} ${u1} – ${m[3]} ${u2}`;
  };
  // las tres fotos; la grande lleva el nombre encima (etiquetas: en las parejas, de qué seta es cada foto)
  function fotosF3(ph, nombre, pillTxt, segunda, etiquetas = []) {
    const fig = (f, cls, et) => (f ? `<figure class="${cls}"><img src="${G(f.g || f.t)}" alt=""${f.pos ? ` style="object-position:${f.pos}"` : ""}>${et ? `<span class="f3-et">${esc(et)}</span>` : ""}</figure>` : "");
    return `<div class="f3-top crece">${fig(ph[0], "f3-main", etiquetas[0])}<div class="f3-pq">${fig(ph[1], "", etiquetas[1])}${fig(ph[2], "", etiquetas[2])}</div>
      <header class="f3-nom"><span class="pill">${pillTxt}</span><h1 class="name">${nombre}</h1><p class="lat">${segunda}</p></header></div>`;
  }
  const metaF3 = (dn, dt, mesesHTML) => `<div class="f3-meta"><span class="dif">${dots(dn)}<b>${dt}</b></span>${mesesHTML}</div>`;
  // «Cómo es» en una línea: ✓ lo tiene, ✗ no lo tiene, ◐ en parte (la volva, en rojo)
  const rasLinea = (items, esporada) => {
    const esp = String(esporada || "").trim().replace(/\.$/, "");
    return `<p class="rl"><span class="lab">Cómo es</span>${items.map(([t, l, x]) => `<span class="ri r-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><span class="nw"><i class="mk">${MARCA[t]}</i><b>${l}</b></span>${x ? " " + esc(x) : ""}</span>`).join(" ")}${esp ? ` <span class="ri" data-q="6"><b>Esporada</b> ${esc(minus(esp))}</span>` : ""}</p>`;
  };
  // dónde: árboles (coníferas y frondosas), prados, madera y altitud, cada dato con su icono
  function dondeF3(especies, conAltFrec = true) {
    const arbs = especies.flatMap(e => e.ecologia?.arboles || []);
    const h = new Set(especies.flatMap(e => habitatIcons(e).map(x => x[1])));
    const out = [];
    const con = arbolesDe(arbs, "conifera"), fro = arbolesDe(arbs, "frondosa");
    if (con) out.push(["pineda", con]);
    if (fro) out.push(["fulla", fro]);
    if (h.has("prados")) out.push(["prat", "En prados"]);
    if (h.has("madera")) out.push(["fusta", "Sobre madera"]);
    const alts = especies.map(e => e.distribucion?.altitud).filter(a => a && a.max != null);
    const alt = altitudTexto(alts.map(a => a.min ?? 0), alts.map(a => a.max), conAltFrec && especies.length === 1 ? FREC(especies[0].id) : null);
    if (alt) out.push(["monte", alt]);
    return out;
  }
  const irsF3 = (lista, os = "") => `<div class="irs">${lista.map(([ic, t]) => `<p class="ir">${ICON[ic]}<span>${esc(t)}</span></p>`).join("")}${os ? `<p class="ir" data-q="7">${PIC.olor}<span>${os.replace(/^<p class="os">|<\/p>$/g, "")}</span></p>` : ""}</div>`;
  // peligro: gravedad, cuándo salen los síntomas, el síndrome y la causa
  const toxF3 = (g, causaTxt, t) => `<div class="tx"><span class="tx-g">${PIC.alerta}${dots(g[0])}<b>${g[1]}</b></span>${t?.latencia ? `<span>${PIC.reloj}síntomas a las ${esc(latCorta(t.latencia))}</span>` : ""}${t?.sindrome ? `<span class="tx-s" data-q="4">${esc(t.sindrome.replace(/\s*\([^)]*\)/, ""))}</span>` : ""}<p class="tx-c" data-q="5">${esc(causaTxt)}</p></div>`;
  // cómo reconocerla: una frase por línea, con su marca (en las que no se comen, el aviso)
  const clavesF3 = (claves, ok, tituloTxt = "") => (claves.length ? `<div class="clw">${tituloTxt ? `<h3>${esc(tituloTxt)}</h3>` : ""}<ul class="cl${ok ? "" : " alarm"}">${claves.map((c, i) => `<li${i >= 3 ? ' data-q="5"' : ""}>${ok ? `<i class="mk">${MARCA.si}</i>` : PIC.alerta}<span>${esc(cortaFrase(c, 100))}</span></li>`).join("")}</ul></div>` : "");
  // las que se le parecen: foto redonda, nombre, peligro y página; debajo, en qué se distingue (todas o ninguna)
  function confsF3(confs, ok, propios) {
    if (!confs.length) return "";
    return `<div class="f3-conf"><h3>${ok ? "Cuidado: se confunde con" : "Se confunde con"}</h3><ul class="cfs">${confs.map((c, i) => {
      const im = fotoConfG(c), d = primera(c.diferencia, 170);
      return `<li class="cf3"${i === 2 ? ' data-q="4"' : ""}>${im ? `<img src="${im}" alt="">` : `<span class="nof"></span>`}<p><b>${nombreConf(c)}</b><br><span class="cf-tag cf-${c.peligro}">${PEL[c.peligro] || c.peligro}</span>${c.id && !propios.includes(c.id) ? " " + ref(c.id) : ""}</p><p class="cfd" data-q="3" data-g="cfd">${esc(cortaFrase(d, 62))}</p></li>`;
    }).join("")}</ul></div>`;
  }
  const compruebeF3 = t => (t ? `<p class="cmp2" data-q="2">${PIC.lupa}<span><b>Compruebe:</b> ${esc(primera(t, 120))}</span></p>` : "");
  // ajuste: si no cabe, letra un poco más pequeña y fuera lo menos importante (data-q, de 9 a 1; con data-g, todo el grupo);
  // luego vuelve lo quitado que quepa y, si aún sobra sitio, las fotos de arriba crecen hasta llenar la página
  function ajustaF3(p, nombre) {
    const pasos = ["d1", 9, 8, "d2", 7, 6, 5, "d3", "d4", 4, 3, 2, 1];
    const quitados = [];
    for (const s of pasos) {
      if (!overflows(p)) break;
      if (typeof s === "string") { p.classList.add(s); continue; }
      let l;
      while (overflows(p) && (l = p.querySelectorAll(`[data-q="${s}"]`)).length) {
        const el = l[l.length - 1], grupo = el.dataset.g ? [...p.querySelectorAll(`[data-g="${el.dataset.g}"]`)] : [el];
        quitados.push(grupo.map(x => [x, x.parentNode, x.nextSibling]));
        grupo.forEach(x => x.remove());
      }
    }
    if (overflows(p)) { REPORT.overflow.push(`${nombre}: +${p.scrollHeight - p.clientHeight}px`); return; }
    for (const grupo of quitados.reverse()) {
      grupo.forEach(([el, padre, sig]) => padre.insertBefore(el, sig && sig.parentNode === padre ? sig : null));
      if (overflows(p)) grupo.forEach(([el]) => el.remove());
    }
    for (const d of ["d4", "d3", "d2", "d1"]) {
      if (!p.classList.contains(d)) continue;
      p.classList.remove(d);
      if (overflows(p)) { p.classList.add(d); break; }
    }
    const cr = p.querySelector(".crece"), pf = p.querySelector(".pf"), antes = pf?.previousElementSibling;
    if (cr && antes) {
      const libre = pf.offsetTop - (antes.offsetTop + antes.offsetHeight) - 8;
      if (libre > 4) {
        const h = cr.offsetHeight;
        cr.style.height = Math.min(h + libre, h * 1.6) + "px";
        if (overflows(p)) cr.style.height = "";
      }
    }
  }
  function fichaBolsillo(e) {
    const est = EST[e.comestibilidad.cat], ok = comestible(e);
    const p = newPage(est.sec, `sp st-${est.st}${ok ? " edible" : ""} f3a`);
    PAGE_OF[e.id] = p;
    const [dn, dt] = DIF[e.identificacion?.dificultad] || [2, "Media"];
    // fuera los rasgos que solo dicen «sin anillo ni volva»: ya van en «Cómo es» con su ✗
    const claves = (e.identificacion?.claves || []).filter(c => !/^\s*(sin|sense) (anillo|anell)( ni volva)?\.?\s*$|^\s*(sin|sense) volva( ni (anillo|anell))?\.?\s*$/i.test(c));
    const confs = [...(e.confusiones || [])].sort((a, b) => (ok ? SEV[a.peligro] - SEV[b.peligro] : SEV[b.peligro] - SEV[a.peligro])).slice(0, 3);
    const t = e.toxicidad;
    p.insertAdjacentHTML("beforeend", `
      ${fotosF3(PICK[e.id] || [], tituloHTML(e), est.pill, segundaLinea(e))}
      ${metaF3(dn, dt, meses(e.fenologia?.meses, e.fenologia?.excepcional))}
      ${rasLinea(rasgosLista(e), e.morfologia?.esporada)}
      ${irsF3(dondeF3([e]), olorSabor(e, ok))}
      ${ok ? "" : toxF3(gravedad(e), causa(e), t)}
      ${clavesF3(claves, ok)}
      ${confsF3(confs, ok, [e.id])}
      ${compruebeF3(confs.find(c => c.donde)?.donde)}
      ${foot(SECL[est.sec])}`);
    ajustaF3(p, e.id);
  }
  // parejas casi iguales, con la misma ficha: cada foto dice de qué seta es; las diferencias, en la tabla
  function parejaF3(cfg) {
    const [a, b] = cfg.ids.map(id => BY[id]);
    const ok = comestible(a) && comestible(b);
    const est = EST[[a, b].map(e => e.comestibilidad.cat).sort((x, y) => SEV[x] - SEV[y])[0]];
    const p = newPage(est.sec, `sp st-${est.st}${ok ? " edible" : ""} pareja f3a`);
    cfg.ids.forEach(id => (PAGE_OF[id] = p));
    const cols = cfg.cols || [titulo(a), titulo(b)];
    const fotos = cfg.fotos.map(([id, g, pie, pos]) => ({ ...((BY[id].fotos || []).find(f => f.g === g) || BY[id].fotos[0]), pie, pos, de: cols[cfg.ids.indexOf(id)] }));
    fotos.forEach(f => EXTRA.push([cfg.nombre, f]));
    const mesesU = [...new Set([...(a.fenologia?.meses || []), ...(b.fenologia?.meses || [])])];
    const [dn, dt] = [a, b].map(e => DIF[e.identificacion?.dificultad] || [2, "Media"]).sort((x, y) => y[0] - x[0])[0];
    const tabla = `<table class="cmp"><tr><th></th><th>${esc(cols[0])}</th><th>${esc(cols[1])}</th></tr>${cfg.filas.map(([k, x, y]) => `<tr><th>${esc(k)}</th><td>${esc(x)}</td><td>${esc(y)}</td></tr>`).join("")}</table>`;
    const vistos = new Set();
    const confs = [...(a.confusiones || []), ...(b.confusiones || [])]
      .filter(c => !cfg.ids.includes(c.id) && !vistos.has(c.id || c.nombre) && vistos.add(c.id || c.nombre))
      .sort((x, y) => (ok ? SEV[x.peligro] - SEV[y.peligro] : SEV[y.peligro] - SEV[x.peligro])).slice(0, 3);
    // tóxicas: la peor de las dos (si las dos son igual de graves y por lo mismo, una sola)
    let tox = "";
    if (!ok) {
      const g = [a, b].map(e => ({ e, g: gravedad(e), c: (cfg.causa || {})[e.id] || causa(e) })).sort((x, y) => y.g[0] - x.g[0]);
      const t = g.map(x => x.e.toxicidad).find(Boolean);
      tox = toxF3(g[0].g, g[0].c, t);
    }
    const esporada = a.morfologia?.esporada === b.morfologia?.esporada ? a.morfologia?.esporada : "";
    const alt = dondeF3([a, b], false).filter(([ic]) => ic === "monte");
    p.insertAdjacentHTML("beforeend", `
      ${fotosF3(fotos, esc(cfg.nombre), SECL[est.sec], cfg.lat, fotos.map(f => f.de))}
      ${metaF3(dn, dt, meses(mesesU))}
      ${rasLinea(rasgosLista(a, false), esporada)}
      ${tabla}
      ${alt.length || cfg.hab ? irsF3([...(cfg.hab ? [["fulla", cfg.hab]] : []), ...alt]) : ""}
      ${tox}
      ${clavesF3(cfg.claves, ok, ok ? "Los dos" : "Rasgos de alarma de los dos")}
      ${confsF3(confs, ok, cfg.ids)}
      ${compruebeF3(cfg.compruebe)}
      ${foot(SECL[est.sec])}`);
    ajustaF3(p, "pareja " + cfg.nombre);
  }

  function fichaPage(e) {
    if (!GUIA) return fichaBolsillo(e);
    const est = EST[e.comestibilidad.cat];
    const ok = comestible(e);
    const p = newPage(est.sec, `sp st-${est.st}${ok ? " edible" : ""}`);
    PAGE_OF[e.id] = p;
    const [dn, dt] = DIF[e.identificacion?.dificultad] || [2, "Media"];
    const subt = [segundaLinea(e)];
    const otrosCa = otrosEs(e);
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
        <p class="lat">${subt.join(" · ")}</p>
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
  // CUADERNOS MINI: 2 o 3 setas por página, con lo justo para reconocerla en el monte
  // fotos y meses a la izquierda; a la derecha: grupo, dificultad, nombres, cómo es (✓ ✗), 2–3 rasgos,
  // en las tóxicas la gravedad, dónde sale y con qué se confunde (con su página)
  // =========================================================
  // un rasgo, corto: sin paréntesis y, si es largo, hasta el primer «;» o «:»
  const claveCorta = (t, max) => {
    let s = String(t || "").replace(/\s*\([^)]*\)/g, "").replace(/\s+([.,;:])/g, "$1").trim();
    if (s.length > max) { const c = s.split(/;\s|:\s/)[0].replace(/[.,]$/, ""); if (c.length >= 14) s = c + "."; }
    return s.length <= max ? s : cortaFrase(s, max);
  };
  const SIN_ANILLO = /^\s*sin anillo( ni volva)?\.?\s*$|^\s*sin volva( ni anillo)?\.?\s*$/i;
  function miniFicha(e) {
    const est = EST[e.comestibilidad.cat], ok = comestible(e);
    const [dn, dt] = DIF[e.identificacion?.dificultad] || [2, "Media"];
    // fotos: en el de 4 hojas, la principal cuadrada y otra debajo; en el de 3, solo la principal
    const fs = (PICK[e.id] || []).slice(0, MINI === 2 ? 2 : 1);
    const nCl = MINI === 2 ? 3 : 2, maxCl = MINI === 2 ? 90 : 70;
    const claves = (e.identificacion?.claves || []).filter(c => !SIN_ANILLO.test(c)).slice(0, nCl);
    const confs = [...(e.confusiones || [])].sort((a, b) => (ok ? SEV[a.peligro] - SEV[b.peligro] : SEV[b.peligro] - SEV[a.peligro])).slice(0, 2);
    const cf = confs.map(c => {
      const d = cortaFrase(primera(c.diferencia, 170).replace(/\.$/, ""), MINI === 2 ? 64 : 48);
      return `<span class="cfi"><b>${nombreConf(c)}</b> <span class="cf-tag cf-${c.peligro}">${PEL[c.peligro] || c.peligro}</span>${c.id && BY[c.id] && c.id !== e.id ? " " + ref(c.id) : ""}<span class="cfd">: ${esc(d.charAt(0).toLowerCase() + d.slice(1))}</span></span>`;
    }).join(" ");
    const arb = arboles(e, 3), h = habitatIcons(e).map(x => x[1]);
    const otros = [h.includes("prados") && "en prados", h.includes("madera") && "sobre madera"].filter(Boolean);
    const donde = [arb ? `Con ${arb}.` : "", otros.length ? cap(lista(otros)) + "." : ""].filter(Boolean).join(" ");
    const [gn, gt] = gravedad(e);
    const tox = ok ? "" : `<p class="mf-grav"><span class="gd">${[1, 2, 3].map(i => `<i class="${i <= gn ? "on" : ""}"></i>`).join("")}</span><b>${gt}.</b> <span class="mf-causa">${esc(causa(e))}</span></p>`;
    return `<article class="mf st-${est.st}${ok ? " edible" : ""}" data-id="${e.id}">
      <div class="mf-fotos">${fs.map((f, i) => `<div class="mf-im${i ? " mf-im2" : ""}"><img src="${G(f.g || f.t)}" alt=""></div>`).join("")}${meses(e.fenologia?.meses, e.fenologia?.excepcional)}</div>
      <div class="mf-t">
        <div class="mf-k"><span class="pill">${est.pill}</span>${dots(dn)}<b class="dif">${dt}</b></div>
        <h2 class="mf-n">${tituloHTML(e)}</h2>
        <p class="mf-2">${segundosDe(e)}</p>
        <ul class="rasgos en-linea">${rasgosLista(e, false).map(([t, l]) => `<li class="r-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><i class="mk">${MARCA[t]}</i><span><b>${l}</b></span></li>`).join("")}</ul>
        ${claves.length ? `<ul class="mf-cl${ok ? "" : " alarm"}">${claves.map(c => `<li>${esc(claveCorta(c, maxCl))}</li>`).join("")}</ul>` : ""}
        ${tox}
        ${donde ? `<p class="mf-do"><span class="lab">Dónde</span>${esc(donde)}</p>` : ""}
        ${cf ? `<p class="mf-cf"><span class="lab">${ok ? "Cuidado" : "Se confunde"}</span>${cf}</p>` : ""}
      </div></article>`;
  }
  // las casi iguales (níscalos, carlet y babosa…) seguidas, para que caigan juntas o una detrás de otra
  function ordenMini(lista_) {
    const out = [];
    lista_.forEach(e => {
      if (out.includes(e)) return;
      out.push(e);
      const pj = EN_PAREJA.get(e.id);
      if (pj) pj[0].ids.forEach(id => { const x = lista_.find(y => y.id === id); if (x && !out.includes(x)) out.push(x); });
    });
    return out;
  }
  const LABEL = { comestibles: "Comestibles", toxicas: "Tóxicas", mortales: "Mortales" };
  const secDe = e => EST[e.comestibilidad.cat].sec;
  // una página de fichas mini (y, si sobra sitio, los huecos que se le den)
  function miniPagina(grupo, sec, huecos = []) {
    const p = newPage(sec, "mini-pg");
    p.insertAdjacentHTML("beforeend", `<div class="mini-in">${grupo.map(miniFicha).join("")}${huecos.join("")}</div>${foot(LABEL[sec])}`);
    grupo.forEach(e => (PAGE_OF[e.id] = p));
    // si no cabe: fuera, por este orden, en qué se distinguen, el último rasgo, la causa, letra algo menor…
    p.querySelectorAll(".mf").forEach(m => fitEl(m, ["dense", quitaUno(".mf-cf .cfd"), quitaUno(".mf-cl li"), ".mf-causa", quitaUno(".mf-cf .cfd"),
      "denser", quitaUno(".mf-cl li"), ".mf-do", quitaUno(".mf-cf .cfi")]));
    p.querySelectorAll(".mf-extra").forEach(m => fitEl(m, ["dense", ".sos-f .sr", ".mf-x-t"]));
  }
  // una sección: MINI setas por página; el hueco que sobre en la última, con lo que se le dé (nunca notas)
  function miniPages(lista_, sec, rellenos) {
    const orden = ordenMini(lista_);
    for (let i = 0; i < orden.length; i += MINI) {
      const grupo = orden.slice(i, i + MINI);
      const huecos = Array.from({ length: MINI - grupo.length }, () => (rellenos.length ? rellenos.shift()() : ""));
      miniPagina(grupo, sec, huecos);
    }
  }
  // todas seguidas, MINI por página (cada página, en la sección de su primera seta)
  function miniSeguidas(orden) {
    for (let i = 0; i < orden.length; i += MINI) { const grupo = orden.slice(i, i + MINI); miniPagina(grupo, secDe(grupo[0])); }
  }
  // hueco «La edad cuenta»: una comestible vieja o pasada también intoxica (fotos de la misma seta a cuatro edades)
  function edadHueco() {
    const ETAPAS = [["joven", "Joven", true], ["adulto", "En su punto", true], ["viejo", "Viejo", false], ["descompuesto", "Pasado", false]];
    const cuenta = e => ETAPAS.filter(([papel]) => (e.fotos || []).some(f => f.papel === papel)).length;
    const serie = [...GROUPS.comestibles].sort((a, b) => cuenta(b) - cuenta(a))[0];
    const edad = ETAPAS.map(([papel, t, ok]) => {
      const f = (serie?.fotos || []).find(x => x.papel === papel);
      if (!f) return "";
      EXTRA.push(["La edad cuenta", f]);
      return `<figure><img src="${G(f.t || f.g)}" alt=""><figcaption><b class="${ok ? "" : "no"}">${ok ? "✓" : "✕"}</b> ${t}</figcaption></figure>`;
    }).join("");
    return `<div class="mf-extra mf-edad"><div class="kicker">Antes de cogerla</div><h2 class="mf-n">La edad cuenta</h2>
      <p class="mf-x-t">Una comestible vieja, agusanada o pasada también intoxica: cójala joven y firme.${serie ? ` (${esc(titulo(serie))})` : ""}</p>
      <div class="edat">${edad}</div></div>`;
  }
  // hueco «Si alguien se encuentra mal»: los teléfonos, qué hacer y la señal de alarma, en pequeño
  function sosHueco() {
    const { hacer, alarma } = sosDatos();
    return `<div class="mf-extra mf-sos"><div class="kicker">Si alguien se encuentra mal</div><h2 class="mf-n">Llame ahora</h2>
      <div class="mf-sos-n"><span><strong>112</strong> Emergencias</span><span><strong>91 562 04 20</strong> Toxicología 24 h</span></div>
      <ul class="sos-f">${hacer.map(([b, r]) => `<li><b>${esc(b)}</b><span class="sr">${esc(r)}</span></li>`).join("")}</ul>
      ${alarma ? `<p class="mf-x-t sos-alarma">${esc(hasta(alarma, 230))}</p>` : ""}</div>`;
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
    const subt = [segundaLinea(e, 1)];
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
  const CREDITO = `<p class="cred-linea">Fotos de iNaturalist y Wikimedia Commons con licencia Creative Commons o de dominio público; el autor y la licencia de cada una, en su ficha de <b>caorjavier.github.io/cistella-segura</b> (las de las setas sin ficha, en los créditos de la guía esencial). Uso personal o sin ánimo de lucro.</p>`;
  function creditosPages() {
    // cada seta con los autores y licencias de sus fotos (el detalle de cada foto, con enlace, en su ficha de la web)
    const porSeta = ESENCIAL.map(e => {
      const fs = (EN_PAREJA.has(e.id) ? [] : (PICK[e.id] || []));
      const aut = [...new Map(fs.map(f => [f.autor + "|" + f.licencia, f])).values()].map(f => `${esc(f.autor || "?")} (${esc(f.licencia || "")})`);
      return aut.length ? `<p class="cr"><b>${tituloHTML(e)}</b> ${aut.join(", ")}</p>` : "";
    }).filter(Boolean);
    const otras = [...new Map(EXTRA.map(([, f]) => [f.autor + "|" + f.licencia, f])).values()].map(f => `${esc(f.autor || "?")} (${esc(f.licencia || "")})`);
    if (otras.length) porSeta.push(`<p class="cr"><b>Árboles, parejas y otras</b> ${otras.join(", ")}</p>`);
    // las setas con que se confunde que no tienen ficha: su foto de iNaturalist, en un solo párrafo
    const conf = Object.entries(window.FOTOS_CONF || {}).map(([, f]) => `<i>${esc(f.taxon)}</i>, ${esc(f.autor || "?")} (${esc(f.licencia || "")})`);
    if (conf.length) porSeta.push(`<p class="cr"><b>Setas con que se confunden, sin ficha</b> ${conf.join("; ")}</p>`);
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
      return `<li class="cf${im ? " cf-foto" : ""}">${im ? `<img class="cf-im" src="${im}" alt="">` : ""}<span><b>${nombreConf(c)}</b>${segundosConf(c) ? ` <span class="cc-2-in">(${segundosConf(c)})</span>` : ""} <span class="cf-tag cf-${c.peligro}">${PEL[c.peligro] || c.peligro}</span> ${esc(primera(c.diferencia, 170))} ${c.id && !propios.includes(c.id) ? ref(c.id) : ""}</span></li>`;
    }).join("")}</ul></div>`;
  }

  // Dos setas casi iguales en una página: lo común, una tabla con lo que las separa y sus confusiones juntas
  // (sirve para comestibles y para tóxicas: va en la sección de la más peligrosa de las dos)
  function parejaPage(cfg) {
    if (!GUIA) return parejaF3(cfg);   // cuaderno completo: la ficha F3a
    const [a, b] = cfg.ids.map(id => BY[id]);
    const ok = comestible(a) && comestible(b);
    const est = EST[[a, b].map(e => e.comestibilidad.cat).sort((x, y) => SEV[x] - SEV[y])[0]];
    const SECL = { comestibles: "Comestibles", toxicas: "Tóxicas", mortales: "Mortales" };
    const p = newPage(est.sec, `sp st-${est.st}${ok ? " edible" : ""} pareja`);
    cfg.ids.forEach(id => (PAGE_OF[id] = p));
    const fotosDe = lista => lista.map(([id, g, pie, pos]) => ({ ...((BY[id].fotos || []).find(f => f.g === g) || BY[id].fotos[0]), pie, pos }));
    // cuaderno: si la pareja trae sus propias fotos de bolsillo, se usan esas
    const listaF = !GUIA && cfg.fotosBolsillo ? cfg.fotosBolsillo : cfg.fotos;
    const fotos = fotosDe(listaF);
    fotos.forEach(f => EXTRA.push([cfg.nombre, f]));
    const mesesU = [...new Set([...(a.fenologia?.meses || []), ...(b.fenologia?.meses || [])])];
    const alts = [a, b].map(e => e.distribucion?.altitud).filter(x => x && x.max != null);
    const alt = alts.length ? `<span class="fct alt">${Math.min(...alts.map(x => x.min ?? 0))}–${Math.max(...alts.map(x => x.max))} m de altitud</span>` : "";
    const him = a.caracteres?.himenoforo;
    const anillo = a.caracteres?.anillo || b.caracteres?.anillo, volva = a.caracteres?.volva || b.caracteres?.volva;
    const facts = `<div class="facts">${meses(mesesU)}
      ${him ? `<span class="fct">${ICON[HIM_ICON[him] || "altres"]}${esc((V.himenoforo[him] || him).split(/[ (]/)[0])}</span>` : ""}
      <span class="fct${anillo ? "" : " no"}">${anillo ? "Con anillo" : "Sin anillo"}</span><span class="fct${volva ? " alarm" : " no"}">${volva ? "Con volva" : "Sin volva"}</span>${cfg.hab ? `<span class="fct hab">${esc(cfg.hab)}</span>` : ""}${alt}</div>`;
    const cols = cfg.cols || [titulo(a), titulo(b)];
    const tabla = `<table class="cmp"><tr><th></th><th>${esc(cols[0])}</th><th>${esc(cols[1])}</th></tr>${cfg.filas.map(([k, x, y]) => `<tr><th>${esc(k)}</th><td>${esc(x)}</td><td>${esc(y)}</td></tr>`).join("")}</table>`;
    const vistos = new Set();
    const confs = [...(a.confusiones || []), ...(b.confusiones || [])]
      .filter(c => !cfg.ids.includes(c.id) && !vistos.has(c.id || c.nombre) && vistos.add(c.id || c.nombre))
      .sort((x, y) => (ok ? SEV[x.peligro] - SEV[y.peligro] : SEV[y.peligro] - SEV[x.peligro])).slice(0, GUIA ? 3 : 2);
    // la más difícil de las dos
    const [dn, dt] = [a, b].map(e => DIF[e.identificacion?.dificultad] || [2, "Media"]).sort((x, y) => y[0] - x[0])[0];
    // tóxicas: la gravedad (una línea si es la misma; si no, una por seta, la peor primero) y el síndrome de la peor
    let tox = "";
    if (!ok) {
      const g = [a, b].map((e, i) => ({ e, lab: cols[i], g: gravedad(e), c: (cfg.causa || {})[e.id] || causa(e) })).sort((x, y) => y.g[0] - x.g[0]);
      const linea = (lab, x) => `<p class="grav"><span class="lab">${esc(lab)}</span><span class="gd">${[1, 2, 3].map(i => `<i class="${i <= x.g[0] ? "on" : ""}"></i>`).join("")}</span><b>${x.g[1]}.</b> ${esc(x.c)}</p>`;
      const igual = g[0].g[1] === g[1].g[1] && g[0].c === g[1].c;
      const t = g.map(x => x.e.toxicidad).find(Boolean);
      tox = `<div class="perill">${igual ? linea("Gravedad", g[0]) : g.map(x => linea(x.lab, x)).join("")}${t ? `<p><span class="lab">${esc(t.sindrome)}</span>Síntomas ${esc(t.latencia)}. ${esc(cfg.sintomas || hastaComa(t.sintomas, 95))}</p>` : ""}</div>`;
    }
    const largo = cfg.nombre.length > 20 ? " largo" : "";
    // cuaderno: lo que tienen los dos (sin detalles: las diferencias van en la tabla), dónde y cuándo juntos
    const esporada = a.morfologia?.esporada === b.morfologia?.esporada ? a.morfologia?.esporada : "";
    // cuaderno: una foto de cada seta, una al lado de la otra y con su nombre (son distintas: no se mezclan)
    const unaPorSeta = cfg.ids.map(id => {
      const i = listaF.findIndex(([x]) => x === id);
      if (i < 0) return null;
      const pie = fotos[i].pie || "", d = pie.indexOf(":");
      return { ...fotos[i], pie: d > 0 ? cap(pie.slice(d + 1).trim()) : pie };
    }).filter(Boolean);
    // si los nombres de debajo del título son largos, los meses no caben a su lado: van en el recuadro
    const latLarga = cfg.lat.replace(/<[^>]+>/g, "").length > 46;
    p.insertAdjacentHTML("beforeend", `
      ${GUIA ? `<header class="sp-head">
        <div class="kick"><span class="pill">${SECL[est.sec]}</span>${dots(dn)}<b class="dif">${dt}</b>${cfg.q ? `<span class="q">${esc(cfg.q)}</span>` : ""}</div>
        <h1 class="name${largo}">${esc(cfg.nombre)}</h1>
        <p class="lat">${cfg.lat}</p>
        <p class="lede">${esc(cfg.lede)}</p>
      </header>` : cabeceraB(esc(cfg.nombre), SECL[est.sec], dn, dt, cfg.lat, latLarga ? "" : meses(mesesU), cfg.lede)}
      ${GUIA ? photosHTML(fotos) : fotosB(unaPorSeta, cfg.ids.map((id, i) => ({ nombre: cols[i], dos: segundosDe(BY[id]) })))}
      ${GUIA ? facts : filaPareja(rasgosLista(a, false), [a, b], latLarga ? meses(mesesU) : "")}
      <div class="txt">${tabla}
        <div class="checks${ok ? "" : " alarm"}"><h3>${ok ? "Los dos" : "Rasgos de alarma de los dos"}</h3><ul>${cfg.claves.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>
        ${tox}
        ${GUIA ? confsHTML(confs, ok, cfg.ids) : confsCards(confs, ok, cfg.ids)}
        <p class="truc"><span class="lab">Compruebe</span>${esc(cfg.compruebe)}</p></div>
      ${foot(SECL[est.sec])}`);
    // la frase de arriba explica por qué van juntas y «Compruebe» es lo práctico: se quitan lo último
    const pars = parecidos(p);
    fit(p, GUIA ? ["tight", "dense", quitaUltimo(".conf li"), "denser", ".lede", quitaUltimo(".checks li"), ".truc"]
      : ["tight", "dense", acortaCaps(46), "fotos-bajas", acortaDif(110), ".cc-par", quitaUltimo(".conf li"), "denser", acortaDif(80), ".r-dato", ".lede", quitaUltimo(".checks li"), ".truc", acortaCaps(28)], "pareja " + cfg.nombre);
    // si al quitar algo ha quedado sitio, vuelve lo quitado por orden de importancia:
    // primero «Compruebe», luego los rasgos, los textos enteros (cuaderno) y, al final, la frase de arriba
    const vuelve = (donde, html, pos = "beforeend") => { donde.insertAdjacentHTML(pos, html); const n = pos === "beforeend" ? donde.lastElementChild : donde.firstElementChild; if (overflows(p)) { n.remove(); return false; } return true; };
    const txt = p.querySelector(".txt"), ul = p.querySelector(".checks ul"), h = p.querySelector(".sp-head");
    if (!p.querySelector(".truc")) vuelve(txt, `<p class="truc"><span class="lab">Compruebe</span>${esc(cfg.compruebe)}</p>`);
    if (ul) for (const c of cfg.claves.slice(ul.children.length)) if (!vuelve(ul, `<li>${esc(c)}</li>`)) break;
    devuelveParecidos(p, pars);
    if (!GUIA) for (const s of p.querySelectorAll(".cc-d, .pc-t")) { const corto = s.textContent; s.textContent = s.classList.contains("pc-t") ? capCorta(s.dataset.full, 72) : s.dataset.full; if (overflows(p)) s.textContent = corto; }
    if (p.classList.contains("fotos-bajas")) { p.classList.remove("fotos-bajas"); if (overflows(p)) p.classList.add("fotos-bajas"); }
    if (!h.querySelector(".lede")) vuelve(h, `<p class="lede">${esc(cfg.lede)}</p>`);
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

  // qué hacer si alguien se encuentra mal y la señal de alarma (de los textos de la web)
  function sosDatos() {
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
    return { hacer, alarma };
  }
  function sosPage() {
    const { hacer, alarma } = sosDatos();
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
      <div style="margin-top:auto">${CREDITO}</div>
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
    if (GUIA) mirarPage();
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
    } else if (MINI === 2) {
      // mini de dos por página: cada sección empieza en página nueva; el hueco que queda al final de las
      // comestibles, «La edad cuenta», y al final de las mortales, qué hacer si alguien se encuentra mal;
      // los árboles cierran el cuaderno (así salen 32 páginas justas, sin notas)
      miniPages(GROUPS.comestibles, "comestibles", [edadHueco]);
      miniPages(GROUPS.toxicas, "toxicas", []);
      miniPages(GROUPS.mortales, "mortales", [sosHueco]);
      arbolesPages();
    } else if (MINI) {
      // mini de tres por página: todas seguidas (54 setas = 18 páginas justas, sin huecos)
      miniSeguidas([...ordenMini(GROUPS.comestibles), ...ordenMini(GROUPS.toxicas), ...ordenMini(GROUPS.mortales)]);
    } else {
      // las parejas casi iguales (rovelló y pinetell) van juntas en la página de la primera
      // (y las otras parejas de PAREJAS, también en tóxicas: dos setas por hoja)
      ORDEN.forEach(e => { const pj = EN_PAREJA.get(e.id); if (!pj) fichaPage(e); else if (pj[1] === 0) parejaPage(pj[0]); });
      arbolesPages();
      // sin síndromes, «Llame ahora» ni índice (los teléfonos van en la portada; las secciones y los créditos
      // de las fotos, en la página de las reglas): los árboles cierran el cuaderno
    }
    if (GUIA) sosPage();

    // para imprimir en cuadernillo, el total tiene que ser múltiplo de 4. No se rellena con páginas de notas
    // (no hacen falta): si no cuadra, se avisa y hay que ajustar el contenido
    const falta = (4 - (book.children.length % 4)) % 4;
    if (falta) REPORT.overflow.push(`faltan ${falta} páginas para que el total sea múltiplo de 4`);

    const pages = [...book.children];
    if (MINI) document.querySelectorAll(".cvc-edlab").forEach(x => (x.textContent = `cuaderno mini · ${pages.length} páginas`));
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
    // con «?lector» en la dirección: el texto y los enlaces de cada página, para el lector de la web
    // (tools/libro-lector.py los saca de aquí con Edge y escribe libros/<libro>/texto.js)
    if (/[?&]lector\b/.test(location.search)) {
      const j = document.createElement("script");
      j.type = "application/json"; j.id = "lector-json";
      j.textContent = JSON.stringify({ ...libroInfo(pages), p: pages.map(textoPagina) }).replace(/</g, "\\u003c");
      document.body.appendChild(j);
    }
    document.dispatchEvent(new CustomEvent("llibre-llest"));
    document.body.dataset.ready = "1";
  }

  // El texto de una página, en líneas con su caja: [texto, izquierda, arriba, derecha, alto] en fracciones de la página
  // (el lector lo usa para buscar y marcar en amarillo lo encontrado)
  function textoPagina(pg) {
    const r3 = x => Math.round(x * 1000) / 1000;
    const pr = pg.getBoundingClientRect(), words = [];
    const tw = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT);
    let nd;
    while ((nd = tw.nextNode())) {
      const cs = getComputedStyle(nd.parentElement);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const up = cs.textTransform === "uppercase", fs = parseFloat(cs.fontSize), re = /\S+/g;
      // la columna en la que está: dos fotos o dos celdas vecinas no forman una sola línea
      const col = nd.parentElement.closest("figure, td, th, .f2-col, .mf-fotos, .mf-t, .cvx-gr, .tab, .cf3");
      let m;
      while ((m = re.exec(nd.data))) {
        const rg = document.createRange(); rg.setStart(nd, m.index); rg.setEnd(nd, m.index + m[0].length);
        const r = [...rg.getClientRects()].find(x => x.width > 0);
        if (r && r.bottom > pr.top && r.top < pr.bottom) words.push({ t: up ? m[0].toUpperCase() : m[0], l: r.left, r: r.right, t0: r.top, b: r.bottom, fs, col });
      }
    }
    // palabras de la misma columna en la misma línea (centro a la misma altura) y sin un hueco grande entre ellas
    const lines = [];
    for (const w of words) {
      const cy = (w.t0 + w.b) / 2;
      const L = lines.find(L => L.col === w.col && Math.abs(L.cy - cy) < Math.min(L.h, w.b - w.t0) * .5 && w.l - L.r < w.fs * 1.6 && w.l >= L.l);
      if (L) { L.t += " " + w.t; L.r = Math.max(L.r, w.r); L.t0 = Math.min(L.t0, w.t0); L.b = Math.max(L.b, w.b); }
      else lines.push({ t: w.t, l: w.l, r: w.r, t0: w.t0, b: w.b, cy, h: w.b - w.t0, col: w.col });
    }
    return lines.map(L => [L.t, r3((L.l - pr.left) / pr.width), r3((L.t0 - pr.top) / pr.height), r3((L.r - pr.left) / pr.width), r3((L.b - L.t0) / pr.height)]);
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
      p.querySelectorAll(".conf li, .f3-conf li").forEach(li => { const ref = li.querySelector(".ref[data-ref]"); if (ref) { hechos.add(ref); pon(li, destDe(ref)); } });
      // en «Árboles y sus setas»: el nombre con su número
      // portada: «25 comestibles», «20 tóxicas», «9 mortales» llevan al principio de su sección
      p.querySelectorAll(".cover [data-ir]").forEach(el => pon(el, inicio[el.dataset.ir]));
      p.querySelectorAll(".nm, .ixg, .secs > span, .mf-cf .cfi").forEach(nm => { const ref = nm.querySelector(".ref[data-ref]"); if (ref) { hechos.add(ref); pon(nm, destDe(ref)); } });
      p.querySelectorAll(".ref[data-ref]").forEach(ref => { if (!hechos.has(ref)) pon(ref, destDe(ref)); });
      // la pestaña del margen lleva al principio de su sección; en la portada, «comestibles», «mortales», «tóxicas»
      const tab = p.querySelector(".tab");
      if (tab && p.dataset.sec) pon(tab, inicio[p.dataset.sec]);
      p.querySelectorAll(".cv-stats span").forEach(sp => pon(sp, inicio[sp.classList.contains("st-comestible") ? "comestibles" : sp.classList.contains("st-mortal") ? "mortales" : "toxicas"]));
      if (L.length) out.l[n] = L;
    });
    Object.entries(PAGE_OF).forEach(([id, p]) => { if (id.startsWith("sec:")) return; const n = num(p); (out.f[n] = out.f[n] || []).push(id); });
    const SECN = CAT ? { comestibles: "Comestibles", mortales: "Mortals", toxicas: "Tòxics" } : { comestibles: "Comestibles", mortales: "Mortales", toxicas: "Tóxicas" };
    let sec = "";
    pages.forEach(p => {
      const n = num(p);
      if (p.classList.contains("cover")) { out.i.push([n, "Portada", 0]); return; }
      // una seta o, en las páginas de media, dos
      const hs = [...p.querySelectorAll(".sp-head .name, .f3-nom .name, .mf-n")];
      if (hs.length) {
        if (p.dataset.sec !== sec) { sec = p.dataset.sec; out.i.push([n, SECN[sec] || sec, 0]); }
        hs.forEach(h => { const m = h.closest(".media, .mf"); out.i.push([n, h.textContent.trim(), 1, "", m ? m.dataset.id : (out.f[n] || [])[0] || ""]); });
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
    '700 10pt "Caveat"',
    // cuaderno: letra de texto con más ojo, para que se lea bien impresa en pequeño
    ...(GUIA ? [] : ['400 7pt "Fira Sans Condensed"', '500 7pt "Fira Sans Condensed"', '600 7pt "Fira Sans Condensed"', '700 7pt "Fira Sans Condensed"', 'italic 400 7pt "Fira Sans Condensed"', 'italic 500 7pt "Fira Sans Condensed"'])
  ];
  // con window.CUADERNO_MODO = "maquetas" (butxaca/maquetas-a6.html) no se monta el libro: solo se dejan a mano
  // los datos y textos de cada ficha para probar otras maquetaciones de página con el mismo contenido
  const expone = () => {
    window.SETAS = { esc, cap, G, BY, TODAS, PICK, EST, PEL, SEV, DIF, ICON, MARCA, DEBAJO, LAB_HIM, ANILLO, ANILLO_PARCIAL, VOLVA, LATEX,
      comestible, titulo, tituloHTML, segundaLinea, segundosConf, nombreConf, rasgosLista, rasgosHTML, dondeCuandoHTML, arbolesDe,
      altitudTexto, FREC, habitatIcons, gravedad, causa, olorSabor, primera, hasta, hastaComa, cortaFrase, sinNormativa, pieEs,
      capCorta, fotoConfG, meses, dots, overflows };
    document.dispatchEvent(new CustomEvent("setas-listo"));
  };
  Promise.all(fonts.map(f => document.fonts.load(f).catch(() => null)))
    .then(() => document.fonts.ready)
    .then(window.CUADERNO_MODO === "maquetas" ? expone : build);
})();
