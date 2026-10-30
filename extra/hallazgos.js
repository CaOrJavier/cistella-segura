/* «Mis hallazgos» (#/hallazgos, #/hallazgos/mn6…). Viene de «Les meves troballes» de la antigua web Cistella Segura:
   una salida por el Montnegre-Corredor el 18/10/2026 con 18 setas fotografiadas, qué es cada una y por qué no es otra.
   Datos: TROBALLES y MN_SRC (datos/cistella.js); los textos en castellano están aquí, por número de hallazgo.
   Fotos propias en fotos/montnegre/ (y miniaturas en fotos/montnegre/t/), en la raíz del proyecto. */
(function () {
  "use strict";
  // Los textos llevan <i> a propósito (nombres científicos): son contenido propio, no se escapan.
  // pies: pies de foto, en el mismo orden que TROBALLES[n].fotos.
  const ES = {
    1: { nom: "Hidnelo", lat: "<i>Hydnellum</i> sp. (tipo <i>H. concrescens</i> / <i>H. scrobiculatum</i>)", hores: "13:53, 14:25 y 15:37",
      pies: ["Ejemplar joven sobre sauló, 13:53", "Adulto en forma de embudo, con el margen blanco, 15:37", "Varios sombreros fusionados, muy joven, 14:25"],
      per: "Duro como el corcho, con un margen blanco y algodonoso que crece y engloba ramitas. Los sombreros se fusionan entre sí y por debajo tiene aguijones en lugar de láminas. Le gusta el sauló.",
      noes: [["Lengua de vaca (<i>Hydnum repandum</i>)", "es carnosa y quebradiza, de un color naranja crema uniforme y sin el margen algodonoso."], ["<i>Thelephora</i>", "es de color marrón chocolate oscuro."], ["<i>Coltricia perennis</i>", "tiene zonas de color marrón óxido y poros en lugar de aguijones."]],
      prova: "Dele la vuelta: si por debajo tiene aguijones y la carne es dura y fibrosa como el corcho, es un hidnelo." },
    2: { nom: "Rúsula amarillo oliva", lat: "<i>Russula</i> cf. <i>ochroleuca</i>", hores: "14:07",
      perill: "recuerda a la oronja verde (<i>Amanita phalloides</i>), que es mortal.",
      pies: ["De lado: láminas blancas y pie corto y grueso", "Sombrero viscoso amarillo oliva bajo pinos"],
      per: "Sombrero viscoso amarillo verdoso, con el margen algo estriado, láminas blancas y pie blanco, corto y grueso, sin anillo a la vista. Bajo pinos.",
      noes: [["Oronja verde (<i>Amanita phalloides</i>)", "tiene el margen liso con fibras radiales, un pie más esbelto con anillo y una volva en forma de saco en la base. En las fotos no se ve la base, así que no se puede descartar del todo."], ["Gorro verde (<i>Russula virescens</i>)", "tiene la cutícula seca y agrietada en placas verdes."]],
      prova: "Arránquela entera y mire la base. Si la carne del pie se rompe como una tiza y no hay ni anillo ni volva, es una rúsula." },
    3: { nom: "Coprino urraca", lat: "<i>Coprinopsis picacea</i>", hores: "14:21 y 15:23", etiqueta: "Tóxica o sospechosa",
      pies: ["Sombreros deshaciéndose en tinta negra, 15:23", "Desde arriba, con restos blancos del velo", "Ejemplar abriéndose, 14:21"],
      per: "Pie blanco, muy alto y hueco. El sombrero se deshace en una tinta negra que gotea. Es oscuro, con placas blancas del velo, como el plumaje de una urraca. A las 14:21 se ve uno abriéndose, con el centro ocre y el margen plisado que ennegrece.",
      noes: [["Barbuda (<i>Coprinus comatus</i>)", "es blanca, lanosa y alargada, y sale en prados y cunetas."], ["Coprino entintado (<i>Coprinopsis atramentaria</i>)", "es gris, sin placas blancas, y crece en grupos apretados junto a los tocones."]],
      prova: "Las placas blancas se despegan con el dedo: son restos del velo que envolvía la seta joven." },
    4: { nom: "Setas color crema de sombrero fibroso", lat: "<i>Inocybe</i> sp. probable (o <i>Hebeloma</i>)", hores: "14:25 y 15:40", etiqueta: "Potencialmente tóxica",
      perill: "se recogen por error pensando que son senderuelas. Muchas <i>Inocybe</i> contienen muscarina.",
      pies: ["Sombrero satinado que se rasga por el margen, 15:40", "Grupito bajo encinas, 14:25", "Pie fibroso con escamitas marrones"],
      per: "Sombrero crema y satinado, de fibras radiales, que se rasga por el margen. Pie fibroso con escamitas marrones. En grupitos bajo encinas. Sin microscopio no se puede llegar a la especie.",
      noes: [["Senderuela (<i>Marasmius oreades</i>)", "crece en corros en los prados, tiene las láminas muy separadas y un pie tan correoso que se retuerce sin romperse."], ["<i>Psathyrella candolleana</i>", "tiene el pie blanco, liso y muy frágil, y las láminas acaban de color marrón violáceo oscuro."]],
      prova: "Haga la esporada (el sombrero boca abajo sobre un papel durante unas horas): marrón tabaco en <i>Inocybe</i> y <i>Hebeloma</i>; blanca en la senderuela." },
    5: { nom: "Rúsulas rojas", lat: "<i>Russula</i> grupo <i>emetica</i> / <i>fragilis</i>", hores: "14:32, 15:36 y 15:48", etiqueta: "Tóxica (picante)",
      pies: ["Sombrero rojo, láminas y pie blancos, 15:36", "Descolorida por la lluvia: blanca con el centro rosa, 14:32", "Forma más anaranjada, 15:48"],
      per: "Sombrero rojo o coral, láminas y pie blancos, y carne que se rompe como una tiza. La lluvia lava el rojo: la de las 14:32 ha quedado blanca con el centro rosa y el margen acanalado. Las de este grupo pican mucho y dan dolor de estómago.",
      noes: [["Falsa oronja (<i>Amanita muscaria</i>)", "tiene verrugas blancas en el sombrero, anillo en el pie y una volva en anillos en la base."], ["Oronja o huevo de rey (<i>Amanita caesarea</i>)", "tiene las láminas y el pie amarillos y una volva blanca en forma de saco."]],
      prova: "Apriete el pie: en las rúsulas se rompe como una tiza y nunca hay anillo ni volva." },
    6: { nom: "Rúsulas hediondas de margen acanalado", lat: "<i>Russula</i> grupo <i>foetens</i> / <i>sororia</i> / <i>amoenolens</i>", hores: "14:34, 14:41, 15:19 y 15:49",
      perill: "la gris de las 14:34 también encaja con la amanita envainada (<i>Amanita vaginata</i>). Hay que ver la base.",
      pies: ["Sombrero ocre anaranjado viscoso y láminas crema, 15:49", "Margen con surcos como un peine", "Ejemplar grisáceo roto: la carne se desmenuza como una tiza, 14:41", "Gris pálida de margen estriado, 14:34"],
      per: "Margen del sombrero con surcos como un peine, sombrero viscoso ocre anaranjado o marrón grisáceo, y pie blanco que se mancha de marrón. Suelen oler mal: a rancio, a queso o a aceite.",
      noes: [["Rovellón (<i>Lactarius</i>)", "suelta leche naranja o roja, tiene el pie naranja con hoyuelos y las láminas naranjas. Esta no suelta leche y tiene el pie blanco."], ["Amanita envainada (<i>Amanita vaginata</i>)", "también tiene el margen estriado, pero el pie es más esbelto y frágil y sale de una volva en forma de saco."]],
      prova: "Huélala: el olor a rancio o a almendra amarga es típico de este grupo. Y rómpala: no suelta leche." },
    7: { nom: "Seta coliflor", lat: "<i>Sparassis crispa</i>", hores: "14:51", etiqueta: "Comestible de joven según la bibliografía",
      pies: ["En la base de un pino"],
      per: "Masa de color crema de lóbulos planos y rizados, como hojas de lasaña, pegada a la base de un pino.",
      noes: [["Pies de rata (<i>Ramaria</i>)", "tienen ramas cilíndricas que acaban en punta, no lóbulos planos. Algunas, como <i>Ramaria formosa</i>, son tóxicas."]],
      prova: "Toque un lóbulo: es una lámina plana y ondulada, no un cilindro." },
    8: { nom: "Boleto parasitado por un moho", lat: "<i>Hypomyces chrysospermus</i>", hores: "15:13", etiqueta: "No se come nunca",
      pies: ["Forma de boleto, todo cubierto de fieltro", "Visto desde arriba"],
      per: "Tiene forma de boleto, pero está deformado y forrado entero de un fieltro blanco que amarillea, sin poros a la vista. Es un moho que se come el boleto. Un boleto con este moho no se come nunca.",
      noes: [["Hidnelo (nº 1)", "no tiene forma de sombrero sobre un pie, y por debajo tiene aguijones."], ["Boleto sano", "tiene los poros a la vista y la superficie lisa o aterciopelada, sin fieltro."]] },
    9: { nom: "Boleto de poros amarillos y pie rojo", lat: "<i>Rheubarbariboletus armeniacus</i> / <i>Xerocomellus</i>", hores: "15:16, 15:55 y 16:01", etiqueta: "Comestible mediocre según la bibliografía",
      perill: "no lo confunda con los boletos tóxicos de pie rojo (<i>Rubroboletus</i>, <i>Suillellus</i>, <i>Imperator</i>).",
      pies: ["Cutícula color albaricoque agrietada y pie rojo, 16:01", "Ejemplar viejo: poros amarillo oliva grandes, 15:16", "Joven: pie amarillo arriba y rojo abajo, 15:55"],
      per: "Tienen poros (como una esponja) en lugar de láminas. La cutícula, de color albaricoque, se agrieta en mosaico y deja ver la carne clara. Los poros son amarillo oliva y el pie, rojo rosado. Salen en suelo arenoso con encinas y pinos.",
      noes: [["Boleto de Satanás y otros boletos de pie rojo", "tienen los poros rojos o naranjas. Aquí son amarillos."], ["Rovellón", "tiene láminas, no poros, y suelta leche naranja."]],
      prova: "Mire los poros: amarillos en este grupo, rojos o naranjas en los tóxicos de pie rojo." },
    10: { nom: "Pedo de lobo", lat: "<i>Lycoperdon perlatum</i>", hores: "15:24", etiqueta: "Comestible solo muy joven",
      perill: "un huevo de <i>Amanita</i> cerrado parece una bolita blanca. Algunas son mortales.",
      pies: ["Grupo con pie corto y pinchitos", "De cerca: pinchitos cónicos"],
      per: "Bolitas blancas con un pie corto, cubiertas de pinchitos cónicos que se caen y dejan un dibujo de red.",
      noes: [["Escleroderma (nº 13)", "no tiene pinchitos, la piel es gruesa y escamosa y por dentro se vuelve negro violáceo."], ["Huevo de <i>Amanita</i>", "si lo corta por la mitad, dentro se ve la silueta de una seta."]],
      prova: "Córtelo de arriba abajo: si por dentro es blanco y uniforme, es un pedo de lobo. Si se ve la silueta de una seta, es un huevo de <i>Amanita</i>." },
    11: { nom: "Repisas blancas", lat: "<i>Trametes</i> sp. (probablemente <i>T. hirsuta</i>)", hores: "15:26",
      pies: ["Sobre un tronco muerto"],
      per: "Repisas pequeñas, blanquecinas y con zonas ocres, con poros blancos por debajo, sobre un tronco muerto. Son correosas.",
      noes: [["Cola de pavo (<i>Trametes versicolor</i>)", "tiene bandas de muchos colores, azuladas o marrones."]] },
    12: { nom: "Repisa de poros en laberinto", lat: "<i>Gloeophyllum</i> sp. (probable)", hores: "15:35",
      pies: ["Cara inferior en laberinto", "Vista desde arriba, sobre un tronco de pino"],
      per: "Repisa marrón oscura sobre un tronco de pino, con la cara inferior en forma de laberinto marrón.",
      noes: [["<i>Daedalea quercina</i>", "tiene un laberinto mucho más grueso, de color corcho claro, y crece en roble."]] },
    13: { nom: "Escleroderma", lat: "<i>Scleroderma citrinum</i> / <i>S. verrucosum</i>", hores: "15:37",
      pies: ["Piel gruesa con escamas poligonales", "Ejemplares pequeños; uno agrietado"],
      per: "Bola de color ocre marrón sin pie verdadero, de piel gruesa y rota en escamas poligonales, como piel de reptil.",
      noes: [["Pedo de lobo (nº 10)", "tiene pinchitos y por dentro es blanco y esponjoso."], ["Trufas", "crecen enterradas y tienen un olor intenso."]],
      prova: "Córtelo: por dentro es negro violáceo jaspeado, incluso de joven." },
    14: { nom: "Rúsula vinosa de pie rosa", lat: "<i>Russula</i> grupo <i>xerampelina</i> u otras", hores: "15:46",
      pies: ["Láminas crema ocre y pie rosa", "Sombrero rojo vino"],
      per: "Sombrero rojo vino oscuro, láminas crema ocre y pie rosado. Para llegar a la especie hacen falta el olor y la esporada.",
      noes: [["Rúsulas rojas picantes (nº 5)", "tienen las láminas y el pie blancos."]],
      prova: "Huélala: las del grupo <i>xerampelina</i> huelen a marisco o a pescado." },
    15: { nom: "Rúsula grande blanco crema", lat: "<i>Russula</i> sp.", hores: "15:47",
      perill: "no la confunda con las amanitas blancas (<i>A. verna</i>, <i>A. virosa</i>), que son mortales.",
      pies: ["Pie blanco robusto sin anillo a la vista", "La carne se agrieta en cuñas"],
      per: "Seta grande de color blanco crema, de cutícula viscosa, con la carne que se agrieta en cuñas y un pie blanco robusto, sin anillo a la vista.",
      noes: [["Amanitas blancas (<i>A. verna</i>, <i>A. virosa</i>, <i>A. ovoidea</i>)", "tienen anillo en el pie y volva en la base."]],
      prova: "Con cualquier seta grande y blanca, arránquela entera y busque la volva." },
    16: { nom: "Rúsula violeta", lat: "<i>Russula</i> cf. <i>cyanoxantha</i> (carbonera)", hores: "15:55", etiqueta: "Sin determinar (la carbonera es comestible)",
      pies: ["Láminas blancas", "Sombrero púrpura viscoso"],
      per: "Sombrero púrpura vinoso y viscoso, láminas blancas y pie blanco rosado, bajo encinas y castaños.",
      noes: [["<i>Russula atropurpurea</i>", "tiene el centro casi negro y las láminas se rompen al frotarlas."]],
      prova: "Pase el dedo por las láminas: si se doblan como si fueran grasientas, sin romperse, es la carbonera. Si se rompen, es otra." },
    17: { nom: "Rúsula blanca en embudo", lat: "<i>Russula</i> grupo <i>delica</i> / <i>chloroides</i>", hores: "16:01", etiqueta: "No recomendable",
      pies: ["Embudo blanco sucio de tierra", "Láminas muy apretadas"],
      per: "Embudo blanco que sale empujando la tierra (por eso está tan sucio), con láminas muy apretadas y pie corto.",
      noes: [["<i>Lactifluus</i> blancos (<i>L. piperatus</i>, <i>L. vellereus</i>)", "al cortar las láminas sueltan leche blanca."]],
      prova: "Haga un corte en las láminas: si sale leche, es un <i>Lactifluus</i>." },
    18: { nom: "Boleto rojo de poros amarillos", lat: "<i>Hortiboletus rubellus</i> (probable)", hores: "16:44", etiqueta: "Comestible mediocre según la bibliografía",
      pies: ["Poros amarillos y pie rosado punteado", "Sombrero rojo aterciopelado"],
      per: "Sombrero rojo sangre y aterciopelado, poros amarillos y pie rosado con puntitos, en la hierba al borde del camino.",
      noes: [["Boletos tóxicos de pie rojo", "tienen los poros rojos o naranjas."], ["Boletos de pie rojo color albaricoque (nº 9)", "tienen la cutícula agrietada en mosaico."]],
      prova: "Presione los poros: deberían volverse azules." },
  };
  // estado de la web antigua → [estado de la guía (colores), etiqueta]
  const ESTADO = { biblio: ["comestible", "Comestible según la bibliografía"], toxica: ["toxica", "Tóxica"], nocome: ["no_comestible", "No comestible"], dudosa: ["desconocida", "Sin determinar"] };
  const CONF = ["", "baja", "media", "alta"];
  // Las cinco comprobaciones del rovelló (BOLETS.rovello.checks), en castellano
  const CHECKS = [
    "Rómpalo o córtelo: tiene que salir leche de color (rojo vino o naranja), nunca blanca.",
    "Espere unos minutos: la zona cortada se vuelve verde.",
    "Mire el pie: hueco por dentro y a menudo con hoyuelos más oscuros.",
    "Mire las láminas: naranjas o de color vino, nunca blancas ni crema.",
    "Mire dónde está: bajo pinos, siempre.",
  ];
  const SALTOS = { comestibles: "hz-comestibles", resto: "hz-resto", rovellon: "hz-rovellon", proxima: "hz-proxima" };

  const sinEtiquetas = (s) => String(s || "").replace(/<[^>]+>/g, "");
  const mn = typeof MN_SRC !== "undefined" && MN_SRC ? MN_SRC : null;   // la web antigua podía llevar las fotos incrustadas
  const foto = (f, grande) => (mn && mn[f]) || CS.ruta(`fotos/montnegre/${grande ? "" : "t/"}${f}.jpg`);

  // Hallazgos con los textos en castellano (si faltara alguno, queda el original). Las altitudes no se traducen.
  const H = TROBALLES.map((t) => {
    const es = ES[t.n] || {};
    return {
      id: "mn" + t.n, n: t.n, conf: t.conf, estat: t.estat, links: t.links || [], fitxers: t.fitxers || "", alt: t.alt || "",
      nom: es.nom || t.nom, lat: es.lat || t.lat, hores: es.hores || t.hores, etiqueta: es.etiqueta || (t.etiqueta && !es.nom ? t.etiqueta : ""),
      perill: es.perill || (es.nom ? "" : t.perill || ""), per: es.per || t.per, noes: es.noes || t.noes || [], prova: es.prova || (es.nom ? "" : t.prova || ""),
      fotos: t.fotos.map(([f, cap], i) => ({ f, pie: (es.pies || [])[i] || cap })),
    };
  });
  const HB = Object.fromEntries(H.map((t) => [t.id, t]));
  const comestible = (t) => t.estat === "biblio";
  const fotosVisor = (t) => t.fotos.map((p, i) => ({ g: foto(p.f, true), t: foto(p.f), pie: `Hallazgo ${t.n} · ${t.nom}: ${p.pie} (foto ${i + 1} de ${t.fotos.length})`, taxon: sinEtiquetas(t.lat) }));

  function botonFoto(G, t, i, grande) {
    const p = t.fotos[i]; if (!p) return "";
    const src = grande ? `src="${G.esc(foto(p.f))}" srcset="${G.esc(foto(p.f))} 480w, ${G.esc(foto(p.f, true))} 1400w" sizes="(min-width: 760px) 560px, 100vw"` : `src="${G.esc(foto(p.f))}"`;
    return `<button type="button" class="hz-ph" data-h="${t.id}" data-i="${i}" aria-label="Ampliar foto: ${G.esc(t.nom)}, ${G.esc(p.pie)}"><img ${src} alt="${G.esc(t.nom + ". " + p.pie)}" loading="lazy"></button>`;
  }
  const salto = (dest, txt, cls) => `<a${cls ? ` class="${cls}"` : ""} href="#/hallazgos/${dest}" data-ir="${dest}">${txt}</a>`;

  function tarjeta(G, t) {
    const esc = G.esc, [cat, lbl] = ESTADO[t.estat] || ESTADO.dudosa;
    const barras = [1, 2, 3].map((k) => `<i class="${k <= t.conf ? "on" : ""}"></i>`).join("");
    const links = t.links.filter((id) => CS.href(id));
    const nomEsp = (id) => { const n = CS.nombre(id); return n === CS.cientifico(id) ? `<i>${esc(n)}</i>` : esc(n); };
    return `<article class="hz-card hz-c-${cat}" id="hz-${t.id}">
      <div class="hz-fotos">${t.fotos.map((p, i) => `<figure>${botonFoto(G, t, i, i === 0)}<figcaption>${esc(p.pie)}</figcaption></figure>`).join("")}</div>
      <div class="hz-cuerpo">
        <div class="hz-cab"><span class="hz-n" aria-hidden="true">${t.n}</span><div><h3><span class="hz-sr">Hallazgo ${t.n}: </span>${esc(t.nom)}</h3><div class="hz-lat">${t.lat}</div></div></div>
        <div class="hz-meta"><span class="hz-estado hz-e-${cat}">${esc(t.etiqueta || lbl)}</span><span class="hz-conf" title="Confianza ${CONF[t.conf]} en la identificación">${barras}<span>Confianza ${CONF[t.conf]}</span></span><span>${esc(t.hores)} · ${esc(t.alt)}</span></div>
        ${t.perill ? `<p class="hz-peligro"><b>Cuidado:</b> ${t.perill}</p>` : ""}
        <h4>Por qué se identifica así</h4><p>${t.per}</p>
        <h4>Por qué no es…</h4><ul>${t.noes.map(([a, b]) => `<li><b>${a}</b>: ${b}</li>`).join("")}</ul>
        ${t.prova ? `<div class="hz-prueba"><b>Prueba de campo</b>${t.prova}</div>` : ""}
        ${links.length ? `<p class="hz-links"><span>En la guía:</span>${links.map((id) => `<a href="${esc(CS.href(id))}"><i class="hz-punto" style="background:${CS.COLOR[CS.estado(id)] || "var(--desc)"}" aria-hidden="true"></i>${nomEsp(id)}</a>`).join("")}</p>` : ""}
        <p class="hz-archivos">Fotos ${esc(t.fitxers)}</p>
      </div>
    </article>`;
  }

  function ir(root, dest, suave) {
    const id = SALTOS[dest] || (HB[dest] ? "hz-" + dest : HB["mn" + dest] ? "hz-mn" + dest : null);
    const el = id && root.querySelector("#" + id);
    const quieto = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el) el.scrollIntoView({ behavior: suave && !quieto ? "smooth" : "auto", block: "start" });
    return !!el;
  }

  window.VISTAS_EXTRA.hallazgos = (arg, G) => {
    const esc = G.esc, ok = H.filter(comestible), no = H.filter((t) => !comestible(t)), R = HB.mn6, B = HB.mn9;
    document.title = "Mis hallazgos · Cistella Segura";
    G.app.innerHTML = `<div class="hz">
      <h1>Mis hallazgos</h1>
      <p class="hz-entrada">Salida por el Montnegre-Corredor, 18 de octubre de 2026. Entre 280 y 620 m, en sauló (arena de granito) con encinas, castaños y pinos. 76 fotos que dan 18 setas distintas: aquí tiene qué es cada una y por qué no es otra.</p>
      <div class="nota-filtro"><b>Identificación orientativa a partir de fotos.</b> No se coma ninguna por esto. Para comer una seta hay que tener el ejemplar entero con la base, olerlo, cortarlo y que lo confirme alguien experto, por ejemplo una asociación micológica.</div>
      <div class="hz-intro">
        <div class="hz-stat"><b>${H.length}</b><span>setas distintas en 76 fotos</span></div>
        <div class="hz-stat hz-s-ok"><b>${ok.length}</b><span>comestibles según la bibliografía, ninguna confirmada</span></div>
        <div class="hz-stat hz-s-ko"><b>${no.length}</b><span>tóxicas, no comestibles o sin determinar</span></div>
        <div class="hz-stat"><b>0</b><span>rovellones: las naranjas eran rúsulas y boletos</span></div>
      </div>
      <nav class="hz-saltos" aria-label="Ir a">${salto("comestibles", "Comestibles según la bibliografía", "hz-a-ok")}${salto("resto", "No comestibles o sin determinar", "hz-a-ko")}${salto("rovellon", "¿Eran rovellones?", "hz-a-ro")}</nav>

      <section class="hz-rov" id="hz-rovellon" aria-labelledby="hz-rov-t">
        <div><span class="hz-label">La pregunta</span><h2 id="hz-rov-t">¿Eran rovellones sin círculos?</h2></div>
        <p><b>No.</b> Las setas naranjas sin círculos de las fotos son de otras especies. Se puede decir con mucha seguridad, pero nunca al 100 % solo con fotos: por eso tiene aquí las cinco comprobaciones del rovellón (rovelló en catalán).</p>
        <div class="hz-cols">
          <div class="hz-col"><div class="hz-mini">${R ? botonFoto(G, R, 0) + botonFoto(G, R, 1) : ""}</div>
            <p><b>Fotos 28–29 y 61–64 · ${salto("mn6", "hallazgo 6")}.</b> Una rúsula: pie blanco y liso, láminas crema, margen del sombrero con rayitas y sin leche. El rovellón tiene el pie naranja con hoyuelos y las láminas naranjas.</p></div>
          <div class="hz-col"><div class="hz-mini">${B ? botonFoto(G, B, 0) + botonFoto(G, B, 2) : ""}</div>
            <p><b>Fotos 70–71 · ${salto("mn9", "hallazgo 9")}.</b> Por debajo tiene poros, como una esponja, no láminas. Es un boleto pequeño, nada que ver con el rovellón.</p></div>
          <div class="hz-col"><span class="hz-label">Cómo saber que es un rovellón</span><ol class="hz-checks">${CHECKS.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>
            <p class="small">Los círculos no sirven para decidir: el rovellón de verdad (<i>Lactarius sanguifluus</i>) a menudo casi no tiene. Si al romperlo sale <b>leche blanca</b>, fuera: puede ser el enganyapastors (<i>Lactarius zonarius</i>), que tiene círculos como el rovellón y es tóxico.${CS.href("rovello") ? ` <a href="${esc(CS.href("rovello"))}">Ver la ficha: ${esc(CS.nombre("rovello"))} →</a>` : ""}</p></div>
        </div>
      </section>

      <section class="hz-sec hz-sec-ok" id="hz-comestibles">
        <h2>Comestibles según la bibliografía <small>${ok.length} hallazgos</small></h2>
        <div class="nota-filtro">Ninguna está confirmada. Antes de comérsela, tiene que verla una persona experta con el ejemplar entero.</div>
        <div class="hz-lista">${ok.map((t) => tarjeta(G, t)).join("")}</div>
      </section>
      <section class="hz-sec hz-sec-ko" id="hz-resto">
        <h2>No comestibles, tóxicas o sin determinar <small>${no.length} hallazgos</small></h2>
        <p class="muted">Las rúsulas que no se pueden identificar por foto (nº 14, 15 y 16) van aquí: si no sabe qué es, no se come.</p>
        <div class="hz-lista">${no.map((t) => tarjeta(G, t)).join("")}</div>
      </section>

      <div class="hz-reglas" id="hz-proxima">
        <div class="hz-regla hz-clave"><b>Para la próxima salida</b><p>Con estas cuatro fotos de cada seta, la identificación sería mucho más segura.</p></div>
        <div class="hz-regla"><b>1 · Entera, con la base</b><p>Arránquela y fotografíe la base para ver si tiene volva.</p></div>
        <div class="hz-regla"><b>2 · Por debajo</b><p>Una foto de las láminas, los poros o los aguijones.</p></div>
        <div class="hz-regla"><b>3 · Cortada</b><p>Mire si cambia de color o si suelta leche, y de qué color.</p></div>
        <div class="hz-regla"><b>4 · Olor y árbol</b><p>Apunte el olor y qué árbol tenía al lado.</p></div>
      </div>
    </div>`;
    const root = G.app.querySelector(".hz");
    root.addEventListener("click", (ev) => {
      const b = ev.target.closest(".hz-ph");
      if (b) { const t = HB[b.dataset.h]; if (t) G.abrirVisor(fotosVisor(t), +b.dataset.i || 0); return; }
      const a = ev.target.closest("a[data-ir]");
      if (a && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && ev.button === 0) {
        // salto dentro de la página sin volver a pintarla (el router lo haría con el cambio de #)
        if (ir(root, a.dataset.ir, true)) { ev.preventDefault(); try { history.replaceState(null, "", a.getAttribute("href")); } catch (e) { /* sin historial */ } }
      }
    });
    // #/hallazgos/mn6, #/hallazgos/comestibles…: el router sube al principio después de pintar; se baja justo después
    if (arg) setTimeout(() => ir(root, arg, false), 0);
  };
})();
