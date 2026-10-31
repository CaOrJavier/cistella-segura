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
  // el cuaderno de bolsillo lleva su propia letra para texto pequeño (setas.css, .libro-bolsillo)
  document.documentElement.classList.add(GUIA ? "libro-guia" : "libro-bolsillo");
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
  // libros en castellano: el nombre principal es el castellano y el catalán va de segundo, junto al científico
  // (si no tiene nombre popular en castellano, el principal es el catalán)
  const titulo = e => cap(e.nombres.es[0] || e.nombres.ca[0]) || e.nombre;
  const sinNombre = e => !e.nombres.ca[0] && !e.nombres.es[0];
  const tituloHTML = e => (sinNombre(e) ? `<i>${esc(e.nombre)}</i>` : esc(titulo(e)));
  // la línea de debajo del nombre: científico y nombres en catalán (los que no son ya el principal)
  const segundaLinea = (e, nCa = 2) => [sinNombre(e) ? "" : `<i>${esc(e.nombre)}</i>`, ...(e.nombres.es[0] ? e.nombres.ca.slice(0, nCa) : e.nombres.ca.slice(1, nCa)).map(esc)].filter(Boolean).join(" · ");
  // otros nombres en castellano (arriba a la derecha)
  const otrosEs = e => (e.nombres.es[0] ? e.nombres.es.slice(1, 2) : []);
  const nombreConf = c => { const x = c.id && TODAS[c.id]; if (x) return tituloHTML(x); return c.es || c.ca ? esc(cap(c.es || c.ca)) : `<i>${esc(c.nombre)}</i>`; };
  // lo que va debajo de un nombre que hace de título: «catalán · científico» (lo que no sea ya el principal)
  const dosMas = (es, ca, sci) => [es && ca ? esc(ca) : "", (es || ca) && sci ? `<i>${esc(sci)}</i>` : ""].filter(Boolean).join(" · ");
  const segundosDe = x => dosMas(x.nombres.es[0], x.nombres.ca[0], x.nombre);
  const segundosConf = c => { const x = c.id && TODAS[c.id]; return x ? segundosDe(x) : dosMas(c.es, c.ca, c.nombre); };

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
  const sinNormativa = t => (String(t || "").match(/[^.!?]+[.!?]+(\s|$)/g) || [String(t || "")]).filter(f => !/RD\s?30\/2009|anexo del RD|venta/i.test(f) && /[a-záéíóúñü]{2}/i.test(f)).join("").trim() || String(t || "");
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
  // solo en el cuaderno de bolsillo (parasol: el sombrero visto desde arriba en vez de la foto hecha desde abajo; pie y láminas)
  const FOTOS_BOLSILLO = { "macrolepiota-procera": ["fotos/g/4928e51e29bc.jpg", "fotos/g/dd2fdf885cb9.jpg", "fotos/g/698b7943422d.jpg"] };
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
  // Portada del cuaderno: título, nueve fotos en tres filas (comestibles, tóxicas, mortales) con su página
  // y el aviso de urgencias. [especie, foto, encuadre (object-position)]
  const PORTADA_FILAS = [
    ["comestibles", "comestible", "Comestibles", [["cantharellus-cibarius", "fotos/g/4c81aed9b18d.jpg", "50% 45%"], ["boletus-edulis", "fotos/g/daa8b786e6b5.jpg", "45% 40%"], ["lactarius-deliciosus", "fotos/g/87b9e09821d1.jpg", "50% 45%"]]],
    ["toxicas", "toxic", "Tóxicas", [["amanita-muscaria", "fotos/g/6fe8c495e42f.jpg", "50% 32%"], ["rubroboletus-satanas", "fotos/g/a151042e0160.jpg", "50% 42%"], ["omphalotus-olearius", "fotos/g/fb8831e7a529.jpg", "50% 50%"]]],
    ["mortales", "mortal", "Mortales", [["amanita-phalloides", "fotos/g/47b20ff9a6ff.jpg", "50% 30%"], ["amanita-verna", "fotos/g/366ea7c73945.jpg", "50% 8%"], ["cortinarius-orellanus", "fotos/g/3a864a604452.jpg", "50% 50%"]]]
  ];
  function portadaBolsillo() {
    const p = newPage(null, "cover cover-m");
    const filas = PORTADA_FILAS.map(([sec, st, t, fotos]) => {
      const figs = fotos.map(([id, g, pos]) => {
        const e = BY[id], f = (e?.fotos || []).find(x => x.g === g);
        if (!e || !f) return "";
        EXTRA.push(["Portada", f]);
        return `<figure class="cvm-f"><img src="${G(f.g)}" alt="" style="object-position:${pos}"><figcaption><span class="cvm-n">${esc(titulo(e))} ${ref(id, true)}</span><span class="cvm-2">${segundosDe(e)}</span></figcaption></figure>`;
      }).join("");
      return `<div class="cvm-fila st-${st}" data-ir="${sec}"><div class="cvm-lab"><b>${GROUPS[sec].length}</b> ${t}</div><div class="cvm-fotos">${figs}</div></div>`;
    }).join("");
    p.innerHTML = `
      <div class="cvm-ed"><span>Cistella Segura · cuaderno de bolsillo</span><span>${EDICION}</span></div>
      <h1 class="cvm-t">Setas <em>esenciales</em></h1>
      <p class="cvm-sub">de Cataluña</p>
      <p class="cvm-s">Las ${ESENCIAL.length} que hay que conocer: cómo reconocerlas, dónde y cuándo salen, y con qué no confundirlas.</p>
      <div class="cvm-filas">${filas}</div>
      <div class="cvm-sos"><b>Ante la duda,<br>no la recolecte.</b><span>Emergencias <strong>112</strong><br>Toxicología 24 h <strong>91 562 04 20</strong></span></div>`;
    if (overflows(p)) REPORT.overflow.push("portada: no cabe");
  }
  function portada() {
    if (!GUIA) return portadaBolsillo();
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
  // Cuaderno: las 12 reglas en media hoja (una línea cada una) y, debajo, cómo leer las fichas
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
    const p = newPage("guia", "reglas-page");
    const gd = n => `<span class="gd">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;
    const sec = (k, t) => `<span class="${EST[k].st === "precaucio" ? "" : "st-" + EST[k].st}"><i></i>${t} <span class="ref" data-ref="sec:${EST[k].sec}" data-fmt="n">00</span></span>`;
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Antes de salir</div>
      <h2 class="pt">Las ${REGLAS_CORTAS.length} reglas</h2>
      <p class="ps">No admiten excepciones. Ante la duda, no la recolecte para comer.</p>
      <ol class="normes reglas cortas spread">${REGLAS_CORTAS.map((r, i) => `<li><span class="nn">${i + 1}</span><p>${esc(r)}</p></li>`).join("")}</ol>
      <div class="leyenda">
        <div class="kicker">Cómo leer las fichas</div>
        <ul class="ley">
          <li><span class="v"><span class="pill st-comestible">Comestible</span><span class="pill st-toxic">Tóxica</span><span class="pill st-mortal">Mortal</span></span><span>Qué es. El mismo color va en la pestaña del margen.</span></li>
          <li><span class="v st-comestible"><span class="lvl"><i class="on"></i><i class="on"></i><i></i></span><b>Media</b></span><span>Dificultad para reconocerla: fácil, media o difícil.</span></li>
          <li><span class="v st-comestible">${meses([9, 10, 11], [8, 12])}</span><span>Meses en que sale; en claro, solo algunos años.</span></li>
          <li><span class="v"><span class="rasgos en-linea"><span class="r-si"><i class="mk">${MARCA.si}</i></span><span class="r-no"><i class="mk">${MARCA.no}</i></span><span class="r-medio"><i class="mk">${MARCA.medio}</i></span></span></span><span>Cómo es: lo tiene, no lo tiene, solo en parte.</span></li>
          <li><span class="v ley-ic">${ICON.pineda}${ICON.fulla}${ICON.prat}${ICON.fusta}${ICON.monte}</span><span>Dónde: pinos y abetos, árboles de hoja ancha, prados, madera, altitud.</span></li>
          <li><span class="v st-toxic grav">${gd(2)}<b>Grave</b></span><span>En las tóxicas: leve, moderada, grave o mortal.</span></li>
          <li><span class="v"><span class="refx">→ p. 12</span></span><span>Página de la seta con la que se confunde.</span></li>
        </ul>
        <p class="secs"><b>Empiezan en la página</b>${sec("comestible", "Comestibles")}${sec("toxica", "Tóxicas")}${sec("mortal", "Mortales")}<span class="st-arb"><i></i>Árboles <span class="ref" data-ref="sec:anexo" data-fmt="n">00</span></span></p>
      </div>
      ${CREDITO}
      ${foot("Antes de salir")}`);
    fit(p, [".ps"], "reglas");
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
        <div class="bosc-txt"><h3>${esc(cap(a.nombres.es[0]))} <small>${esc(a.nombres.ca[0] || "")}${a.nombre ? ` · <i>${esc(a.nombre)}</i>` : ""}</small></h3>
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
    const ns = [...new Set(lista_.filter(a => a.rel !== "ocasional" && ARB[a.id]?.grupo === grupo).map(a => ARB[a.id].nombres.es[0]).filter(Boolean))];
    const out = [];
    let prev = "";
    for (const n of ns.slice(0, max)) { const [w, ...r] = n.split(" "); out.push(w === prev && r.length ? r.join(" ") : n); prev = w; }
    return out.length ? cap(lista(out)) + (ns.length > max ? " y otros" : "") : "";
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
  function fichaCaja(items, esporada, especies, conMeses = false) {
    const dc = dondeCuandoHTML(especies);
    return `<div class="ficha2"><div class="f2-col"><h3>${conMeses ? "Cómo es y cuándo sale" : "Cómo es"}</h3>${rasgosHTML(items, esporada)}${conMeses ? dc.cuando : ""}</div>
      <div class="f2-col dc"><h3>Dónde</h3>${dc.donde}</div></div>`;
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
  // cuando la página no cabe se recorta por este orden; después, lo recortado vuelve si ha quedado sitio,
  // por orden de importancia: «Compruebe», los rasgos, los textos enteros, el detalle de «Dónde» y la frase de arriba
  function ajustaB(p, nombre, ...extra) {
    const pasos = ["tight", ".lede", "dense", acortaCaps(40), "fotos-bajas", ".d-mas", acortaDif(80), ".cc-par", quitaUltimo(".conf li"), "denser", acortaDif(62), ".r-dato", acortaCaps(24), ".os", ".pc-t", ".truc", quitaUltimo(".checks li"), ...extra];
    const lede = p.querySelector(".lede")?.outerHTML, mas = p.querySelector(".d-mas")?.outerHTML, truc = p.querySelector(".truc")?.outerHTML;
    const pars = parecidos(p);
    const pies = [...p.querySelectorAll(".ph3 figure")].map(f => f.querySelector(".pc-t")?.outerHTML || "");
    const os = p.querySelector(".os"), osHTML = os?.outerHTML, osAntes = os?.nextElementSibling;
    const claves = [...p.querySelectorAll(".checks li")].map(li => li.outerHTML);
    fit(p, pasos, nombre);
    const vuelve = (padre, html) => { if (!padre || !html) return false; padre.insertAdjacentHTML("beforeend", html); if (overflows(p)) { padre.lastElementChild.remove(); return false; } return true; };
    if (truc && !p.querySelector(".truc")) vuelve(p.querySelector(".txt"), truc);
    const ul = p.querySelector(".checks ul");
    if (ul) for (const li of claves.slice(ul.children.length)) if (!vuelve(ul, li)) break;
    devuelveParecidos(p, pars);
    // el olor o sabor, en su sitio (detrás de los rasgos)
    if (osHTML && !p.querySelector(".os") && osAntes && osAntes.isConnected) { osAntes.insertAdjacentHTML("beforebegin", osHTML); if (overflows(p)) osAntes.previousElementSibling.remove(); }
    // los textos de las fotos, debajo de cada una (todos o ninguno)
    if (!p.querySelector(".pc-t") && pies.some(Boolean)) {
      const figs = [...p.querySelectorAll(".ph3 figure")];
      figs.forEach((f, i) => pies[i] && f.insertAdjacentHTML("beforeend", pies[i]));
      if (overflows(p)) p.querySelectorAll(".ph3 .pc-t").forEach(x => x.remove());
    }
    for (const s of p.querySelectorAll(".cc-d, .pc-t")) { const corto = s.textContent; s.textContent = s.classList.contains("pc-t") ? capCorta(s.dataset.full, 60) : s.dataset.full; if (overflows(p)) s.textContent = corto; }
    // las fotos, más altas (casi cuadradas) si caben
    if (p.classList.contains("fotos-bajas")) { p.classList.remove("fotos-bajas"); if (overflows(p)) p.classList.add("fotos-bajas"); }
    if (mas && !p.querySelector(".d-mas")) vuelve(p.querySelector(".dc"), mas);
    if (lede && !p.querySelector(".lede")) vuelve(p.querySelector(".sp-head"), lede);
  }
  function fichaBolsillo(e) {
    const est = EST[e.comestibilidad.cat], ok = comestible(e);
    const p = newPage(est.sec, `sp st-${est.st}${ok ? " edible" : ""} fb`);
    PAGE_OF[e.id] = p;
    const [dn, dt] = DIF[e.identificacion?.dificultad] || [2, "Media"];
    const otros = otrosEs(e);
    // fuera los rasgos que solo dicen «sin anillo ni volva»: ya van en «Cómo es» con su ✗
    const claves = (e.identificacion?.claves || []).filter(c => !/^\s*sin anillo( ni volva)?\.?\s*$|^\s*sin volva( ni anillo)?\.?\s*$/i.test(c));
    const clavesHTML = claves.length ? `<div class="checks${ok ? "" : " alarm"}"><h3>${ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3><ul>${claves.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>` : "";
    const t = e.toxicidad;
    const tox = ok ? "" : `<div class="perill">${gravedadHTML(e)}${t ? `<p><span class="lab">${esc(t.sindrome)}</span>Síntomas ${esc(t.latencia)}. ${esc(hastaComa(t.sintomas, 95))}</p>` : ""}</div>`.replace(/(<span class="lab">[^<(]+?)\s*\([^)]*\)(<\/span>)/, "$1$2");
    const confs = [...(e.confusiones || [])].sort((a, b) => (ok ? SEV[a.peligro] - SEV[b.peligro] : SEV[b.peligro] - SEV[a.peligro])).slice(0, 3);
    const clave = confs.find(c => c.donde)?.donde;
    const truc = clave ? `<p class="truc"><span class="lab">Compruebe</span>${esc(primera(clave, 160))}</p>` : "";
    const label = ok ? "Comestibles" : est.sec === "mortales" ? "Mortales" : "Tóxicas";
    p.insertAdjacentHTML("beforeend", `
      ${cabeceraB(tituloHTML(e), est.pill, dn, dt, segundaLinea(e), meses(e.fenologia?.meses, e.fenologia?.excepcional), hasta(sinNormativa(e.comestibilidad.texto), 150))}
      ${fotosB(PICK[e.id])}
      ${fichaCaja(rasgosLista(e), e.morfologia?.esporada, [e])}
      <div class="txt">${clavesHTML}${olorSabor(e, ok)}${tox}${confsCards(confs, ok, [e.id])}${truc}</div>
      ${foot(label)}`);
    ajustaB(p, e.id);
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
      // (y las otras parejas de PAREJAS, también en tóxicas: dos setas por hoja)
      ORDEN.forEach(e => { const pj = EN_PAREJA.get(e.id); if (!pj) fichaPage(e); else if (pj[1] === 0) parejaPage(pj[0]); });
      arbolesPages();
      // sin síndromes, «Llame ahora» ni índice (los teléfonos van en la portada; las secciones y los créditos
      // de las fotos, en la página de las reglas): los árboles cierran el cuaderno
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
      // filas de la portada: la etiqueta lleva al principio de su sección
      p.querySelectorAll("[data-ir] .cvm-lab").forEach(el => pon(el, inicio[el.parentElement.dataset.ir]));
      p.querySelectorAll(".nm, .ixg, .secs > span, .cvm-f").forEach(nm => { const ref = nm.querySelector(".ref[data-ref]"); if (ref) { hechos.add(ref); pon(nm, destDe(ref)); } });
      p.querySelectorAll(".ref[data-ref]").forEach(ref => { if (!hechos.has(ref)) pon(ref, destDe(ref)); });
      // la pestaña del margen lleva al principio de su sección; en la portada, «comestibles», «mortales», «tóxicas»
      const tab = p.querySelector(".tab");
      if (tab && p.dataset.sec) pon(tab, inicio[p.dataset.sec]);
      p.querySelectorAll(".cv-stats span").forEach(sp => pon(sp, inicio[sp.classList.contains("st-comestible") ? "comestibles" : sp.classList.contains("st-mortal") ? "mortales" : "toxicas"]));
      if (L.length) out.l[n] = L;
    });
    Object.entries(PAGE_OF).forEach(([id, p]) => { if (id.startsWith("sec:")) return; const n = num(p); (out.f[n] = out.f[n] || []).push(id); });
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
    '700 10pt "Caveat"',
    // cuaderno: letra de texto con más ojo, para que se lea bien impresa en pequeño
    ...(GUIA ? [] : ['400 7pt "Fira Sans Condensed"', '500 7pt "Fira Sans Condensed"', '600 7pt "Fira Sans Condensed"', '700 7pt "Fira Sans Condensed"', 'italic 400 7pt "Fira Sans Condensed"', 'italic 500 7pt "Fira Sans Condensed"'])
  ];
  Promise.all(fonts.map(f => document.fonts.load(f).catch(() => null)))
    .then(() => document.fonts.ready)
    .then(build);
})();
