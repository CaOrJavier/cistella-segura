// Cuaderno completo A6: 5 propuestas de maquetación de la página de ficha, junto a la de ahora,
// en láminas A4 apaisadas para compararlas (butxaca/maquetas-a6.html).
// El contenido es el del cuaderno: setas.js, en modo «maquetas», deja sus datos y textos en window.SETAS.
"use strict";
const maquetas = () => {
  const S = window.SETAS, esc = S.esc, cap = S.cap;
  const raiz = document.getElementById("laminas");

  // las tres setas de muestra (una de cada grupo) y su página en el cuaderno de ahora
  const MUESTRAS = ["cantharellus-cibarius", "rubroboletus-satanas", "amanita-phalloides"];
  const PAG = {};
  Object.entries((window.LIBROS_TXT || {}).bolsillo?.f || {}).forEach(([n, ids]) => ids.forEach(id => (PAG[id] = +n)));
  const img = n => `../libros/bolsillo/p${String(n).padStart(3, "0")}.jpg`;

  // ---------- el contenido de una ficha, en datos ----------
  const SEC = { comestibles: "Comestibles", toxicas: "Tóxicas", mortales: "Mortales" };
  const MES_N = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function datos(e) {
    const est = S.EST[e.comestibilidad.cat], ok = S.comestible(e);
    const [dn, dt] = S.DIF[e.identificacion?.dificultad] || [2, "Media"];
    const arbs = e.ecologia?.arboles || [];
    const hab = S.habitatIcons(e).map(x => x[1]);
    const a = e.distribucion?.altitud;
    const frec = S.FREC(e.id);
    const donde = [];
    const con = S.arbolesDe(arbs, "conifera"), fro = S.arbolesDe(arbs, "frondosa");
    if (con) donde.push(["pineda", con]);
    if (fro) donde.push(["fulla", fro]);
    if (hab.includes("prados")) donde.push(["prat", "En prados"]);
    if (hab.includes("madera")) donde.push(["fusta", "Sobre madera"]);
    const alt = a && a.max != null ? S.altitudTexto([a.min ?? 0], [a.max], frec) : "";
    const confs = [...(e.confusiones || [])].sort((x, y) => (ok ? S.SEV[x.peligro] - S.SEV[y.peligro] : S.SEV[y.peligro] - S.SEV[x.peligro])).slice(0, 3)
      .map(c => ({ c, id: c.id, nombre: S.nombreConf(c), dos: S.segundosConf(c), peligro: c.peligro, tag: S.PEL[c.peligro] || c.peligro,
        pag: c.id && c.id !== e.id ? PAG[c.id] : 0, par: S.primera(c.comparten, 140).replace(/\.$/, ""), dif: S.primera(c.diferencia, 170), foto: S.fotoConfG(c) }));
    const t = e.toxicidad;
    const m = e.fenologia?.meses || [];
    return {
      e, id: e.id, ok, est, st: est.st, sec: est.sec, dn, dt,
      nombre: S.tituloHTML(e), nombreTxt: S.titulo(e), segunda: S.segundaLinea(e),
      // (si al quitar la normativa queda un trozo de frase, como «subpruinosus).», no se pone)
      lede: (l => (/^[A-ZÁÉÍÓÚÑ]/.test(l) ? l : ""))(S.hasta(S.sinNormativa(e.comestibilidad.texto), 150)),
      fotos: (S.PICK[e.id] || []).map(f => ({ src: S.G(f.g || f.t), pie: S.pieEs(f.pie || ""), pos: f.pos || "" })),
      rasgos: S.rasgosLista(e), esporada: String(e.morfologia?.esporada || "").trim().replace(/\.$/, ""),
      claves: (e.identificacion?.claves || []).filter(c => !/^\s*sin anillo( ni volva)?\.?\s*$|^\s*sin volva( ni anillo)?\.?\s*$/i.test(c)),
      os: S.olorSabor(e, ok), donde, alt, detalle: S.primera(e.ecologia?.donde_mirar || e.ecologia?.vegetacion, 110),
      meses: m, ex: e.fenologia?.excepcional || [],
      mesesTxt: m.length ? `De ${MES_N[Math.min(...m) - 1]} a ${MES_N[Math.max(...m) - 1]}` : "",
      tox: ok ? null : { grav: S.gravedad(e), causa: S.causa(e), sindrome: t ? t.sindrome.replace(/\s*\([^)]*\)/, "") : "", latencia: t?.latencia || "", sintomas: t ? S.hastaComa(t.sintomas, 95) : "" },
      confs, compruebe: confs.find(c => c.c.donde)?.c.donde || "", pag: PAG[e.id] || 0,
      morf: e.morfologia || {}, car: e.caracteres || {}
    };
  }

  // ---------- piezas comunes ----------
  const pill = d => `<span class="pill">${d.est.pill}</span>`;
  const dif = d => `<span class="dif">${S.dots(d.dn)}<b>${d.dt}</b></span>`;
  const mesesTira = d => S.meses(d.meses, d.ex);
  const rasgosUL = (d, cls = "") => `<ul class="ras ${cls}">${d.rasgos.map(([t, l, x]) => `<li class="r-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><i class="mk">${S.MARCA[t]}</i><span><b>${l}</b>${x ? " " + esc(x) : ""}</span></li>`).join("")}${d.esporada ? `<li class="r-dato" data-q="6"><i class="mk"></i><span><b>Esporada</b> ${esc(d.esporada.charAt(0).toLowerCase() + d.esporada.slice(1))}</span></li>` : ""}</ul>`;
  const dondeL = (d, conDetalle = true) => `${d.donde.map(([ic, t]) => `<p class="dl">${S.ICON[ic]}<span>${esc(t)}</span></p>`).join("")}${d.alt ? `<p class="dl">${S.ICON.monte}<span>${esc(d.alt)}</span></p>` : ""}${conDetalle && d.detalle ? `<p class="dl-mas" data-q="8">${esc(d.detalle)}</p>` : ""}`;
  const clavesUL = (d, q = 0) => `<ul class="claves${d.ok ? "" : " alarm"}">${d.claves.map((c, i) => `<li${i >= 2 ? ` data-q="${q || 5}"` : ""}>${esc(c)}</li>`).join("")}</ul>`;
  const toxHTML = d => d.tox ? `<div class="tox"><p><span class="lab">Gravedad</span>${S.dots(d.tox.grav[0])}<b>${d.tox.grav[1]}.</b> ${esc(d.tox.causa)}</p>${d.tox.sindrome ? `<p data-q="4"><span class="lab">${esc(d.tox.sindrome)}</span>Síntomas ${esc(d.tox.latencia)}. ${esc(d.tox.sintomas)}</p>` : ""}</div>` : "";
  const tag = c => `<span class="tag t-${c.peligro}">${c.tag}</span>`;
  const pagRef = c => (c.pag ? `<span class="ref">→ p. ${c.pag}</span>` : "");
  const compruebe = (d, q = 3) => (d.compruebe ? `<p class="comp" data-q="${q}"><span class="lab">Compruebe</span>${esc(S.primera(d.compruebe, 160))}</p>` : "");
  const pie = d => `<footer class="pf"><span>${SEC[d.sec]}</span><span class="pn">${d.pag}</span></footer>`;
  const foto = (f, cls = "", extra = "") => (f ? `<figure class="${cls}"><img src="${f.src}" alt=""${f.pos ? ` style="object-position:${f.pos}"` : ""}>${extra}</figure>` : "");
  const pieCorto = (t, max) => esc(S.capCorta(t, max));

  // calendario en rueda: 12 sectores, los meses en que sale, rellenos
  function rueda(d, mm = 15) {
    const R = 10, r = 5.6, L = "EFMAMJJASOND";
    const pt = (rad, ang) => [12 + rad * Math.cos(ang), 12 + rad * Math.sin(ang)].map(v => v.toFixed(2));
    const seg = i => {
      const a0 = (-90 + i * 30 + 1.5) * Math.PI / 180, a1 = (-90 + (i + 1) * 30 - 1.5) * Math.PI / 180;
      const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, a0);
      const am = (a0 + a1) / 2, [lx, ly] = pt((R + r) / 2, am);
      const on = d.meses.includes(i + 1), ex = d.ex.includes(i + 1);
      return `<path d="M${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 0 0 ${x3} ${y3}Z" class="${on ? "on" : ex ? "ex" : "off"}"/><text x="${lx}" y="${ly}" class="${on ? "on" : ""}">${L[i]}</text>`;
    };
    return `<svg class="rueda" viewBox="0 0 24 24" style="width:${mm}mm;height:${mm}mm" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => seg(i)).join("")}</svg>`;
  }

  // dibujo esquemático de la seta (para la infografía): forma del sombrero, lo de debajo, anillo, volva
  function dibujo(d) {
    const c = d.car, him = c.himenoforo;
    const embudo = him === "pliegues" || (c.forma || []).some(f => /embudo|trompeta/.test(f));
    const boleto = him === "poros";
    const sombrero = embudo
      ? `<path class="sb" d="M5 13 Q30 20 55 13 Q54 20 40 27 L20 27 Q6 20 5 13Z"/>`
      : boleto ? `<path class="sb" d="M5 26 Q5 5 30 5 Q55 5 55 26 Q30 29 5 26Z"/>`
        : `<path class="sb" d="M4 25 Q8 6 30 6 Q52 6 56 25 Q30 28 4 25Z"/>`;
    let debajo = "";
    if (embudo) debajo = `<g class="hl">${[22, 26, 30, 34, 38].map(x => `<path d="M${x} ${x < 30 ? 16 : 16} Q${30 + (x - 30) * .5} 26 ${30 + (x - 30) * .25} 33"/>`).join("")}</g>`;
    else if (boleto) debajo = `<path class="hm" d="M8 26.5 Q30 30 52 26.5 Q50 31 30 31.5 Q10 31 8 26.5Z"/><g class="pd">${[12, 17, 22, 27, 32, 37, 42, 47].map(x => `<circle cx="${x + .5}" cy="${28.6 + (Math.abs(x - 30) < 12 ? .8 : 0)}" r=".9"/>`).join("")}</g>`;
    else debajo = `<g class="hl">${[8, 12, 16, 20, 24, 36, 40, 44, 48, 52].map(x => `<path d="M${x} ${25 + (Math.abs(x - 30) < 14 ? 1.6 : .6)} L${30 + (x - 30) * .82} ${28.5}"/>`).join("")}</g>`;
    const pie = embudo ? `<path class="pi" d="M24 27 L36 27 L34 58 Q30 60 26 58Z"/>`
      : boleto ? `<path class="pi" d="M23 31 L37 31 Q44 48 40 58 Q30 62 20 58 Q16 48 23 31Z"/><path class="ret" d="M25 34 L35 34 M24 38 L36 38 M23 42 L37 42"/>`
        : `<path class="pi" d="M26.5 27 L33.5 27 L34 ${c.volva ? 56 : 59} Q30 ${c.volva ? 57.5 : 61} 26 ${c.volva ? 56 : 59}Z"/>`;
    const anillo = c.anillo ? `<path class="an" d="M26 34 L34 34 L37.5 39.5 Q30 41.5 22.5 39.5Z"/>` : "";
    const volva = c.volva ? `<path class="vo" d="M23 52 Q21 63 30 63 Q39 63 37 52 L35 55 L33 51.5 L30 55 L27 51.5 L25 55Z"/>` : "";
    const suelo = `<path class="su" d="M2 ${c.volva ? 60 : 59.5} Q30 ${c.volva ? 57 : 57.5} 58 ${c.volva ? 60 : 59.5}"/>`;
    const COL = { naranja: "#f0ad3c", amarillo: "#f1c84b", verde: "#b4bd78", oliva: "#a9a86a", pardo: "#b07c4f", marron: "#a8754a", rojo: "#cf5a44", rosa: "#e3a99a", blanco: "#f4f1ea", gris: "#bdb8ad", violeta: "#a585bd", lila: "#b79ac8", negro: "#5a524c", crema: "#efe1c2", ocre: "#d4a65a" };
    const col = (c.color || []).map(x => COL[x]).find(Boolean);
    return `<svg class="dibujo" viewBox="0 0 60 66" aria-hidden="true"${col ? ` style="--sb:${col}"` : ""}>${pie}${anillo}${sombrero}${debajo}${volva}${suelo}</svg>`;
  }

  // ---------- ajuste: si no cabe, letra más apretada y fuera lo menos importante (data-q, de 9 a 1) ----------
  function ajusta(pg) {
    const cajas = () => [pg, ...pg.querySelectorAll(".fit")];
    const sobra = () => cajas().some(el => el.scrollHeight > el.clientHeight + 1);
    const pasos = ["d1", 9, 8, "d2", 7, 6, 5, "d3", 4, 3, 2, 1];
    const quitados = [];
    for (const s of pasos) {
      if (!sobra()) break;
      if (typeof s === "string") { pg.classList.add(s); continue; }
      let l;
      while (sobra() && (l = pg.querySelectorAll(`[data-q="${s}"]`)).length) {
        const el = l[l.length - 1];
        quitados.push([el, el.parentNode, el.nextSibling]);
        el.remove();
      }
    }
    if (sobra()) { pg.classList.add("desborda"); console.warn("No cabe:", pg.dataset.id, pg.className); return; }
    // si ha sobrado sitio, vuelve lo quitado (lo más importante primero) y luego la letra más grande
    for (const [el, padre, sig] of quitados.reverse()) {
      padre.insertBefore(el, sig && sig.parentNode === padre ? sig : null);
      if (sobra()) el.remove();
    }
    for (const d of ["d3", "d2", "d1"]) {
      if (!pg.classList.contains(d)) continue;
      pg.classList.remove(d);
      if (sobra()) { pg.classList.add(d); break; }
    }
    // y la foto (.crece) se alarga hasta llenar la página
    const cr = pg.querySelector(".crece"), pf = pg.querySelector(".pf"), antes = pf?.previousElementSibling;
    if (cr && antes) {
      const libre = pf.offsetTop - (antes.offsetTop + antes.offsetHeight) - 8;
      if (libre > 4) {
        const h = cr.offsetHeight;
        cr.style.height = Math.min(h + libre, h * 1.6) + "px";
        if (sobra()) cr.style.height = "";
      }
    }
  }

  // =========================================================
  // 0 · LA DE AHORA (imagen de la página del cuaderno)
  // =========================================================
  const actual = d => `<section class="pg img"><img src="${img(d.pag)}" alt="Página ${d.pag} del cuaderno de ahora"></section>`;

  // =========================================================
  // A · FOTO PROTAGONISTA
  // =========================================================
  function mA(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg mA st-${d.st}" data-id="${d.id}">
      <div class="a-hero crece">${foto(f1, "a-main")}
        <div class="a-mini">${foto(f2)}${foto(f3)}</div>
        <div class="a-nom">${pill(d)}<h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div>
      </div>
      <div class="a-bar">${dif(d)}${mesesTira(d)}</div>
      <div class="a-body">
        <div class="a-cols"><div><h3>Cómo es</h3>${rasgosUL(d)}</div><div><h3>Dónde</h3>${dondeL(d)}</div></div>
        <div class="blk"><h3>${d.ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3>${clavesUL(d)}</div>
        ${d.os ? `<div data-q="7">${d.os}</div>` : ""}
        ${toxHTML(d)}
        <div class="a-conf"><h3>${d.ok ? "Cuidado: se confunde con" : "Se confunde con"}</h3>
          ${d.confs.map((c, i) => `<p class="a-cf"${i === 2 ? ' data-q="5"' : ""}><b>${c.nombre}</b> ${tag(c)} ${pagRef(c)}<br><span class="a-dif">${esc(S.cortaFrase(c.dif, 95))}</span></p>`).join("")}
        </div>
        ${compruebe(d)}
      </div>${pie(d)}</section>`;
  }

  // =========================================================
  // B · GUÍA DE CAMPO: COLUMNA DE FOTOS A LA IZQUIERDA
  // =========================================================
  function mB(d) {
    return `<section class="pg mB st-${d.st}" data-id="${d.id}">
      <header class="b-head"><div class="b-t"><h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div><div class="b-k">${pill(d)}${dif(d)}</div></header>
      <div class="b-meses">${mesesTira(d)}<span>${esc(d.mesesTxt)}</span></div>
      <div class="b-grid">
        <aside class="b-izq fit">
          ${d.fotos.map((f, i) => foto(f, "b-f", f.pie ? `<figcaption${i ? ' data-q="9"' : ""}>${pieCorto(f.pie, 40)}</figcaption>` : "")).join("")}
        </aside>
        <div class="b-der fit">
          ${d.lede ? `<p class="b-lede" data-q="9">${esc(d.lede)}</p>` : ""}
          <h3>Cómo es</h3>${rasgosUL(d, "compacta")}
          <h3>Dónde</h3>${dondeL(d)}
          <h3>${d.ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3>${clavesUL(d)}
          ${d.os ? `<div data-q="7">${d.os}</div>` : ""}
          ${toxHTML(d)}
          <div class="b-conf"><h3>${d.ok ? "Cuidado con" : "Se confunde con"}</h3>
            ${d.confs.map((c, i) => `<div class="b-cf"${i === 2 ? ' data-q="5"' : ""}><p><b>${c.nombre}</b> ${tag(c)} ${pagRef(c)}</p><p>${esc(S.cortaFrase(c.dif, 90))}</p></div>`).join("")}
          </div>
          ${compruebe(d)}
        </div>
      </div>${pie(d)}</section>`;
  }

  // =========================================================
  // C · TARJETAS
  // =========================================================
  function mC(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg mC st-${d.st}" data-id="${d.id}">
      <header class="c-head"><div><h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div><div class="c-k">${pill(d)}${dif(d)}</div></header>
      <div class="c-fotos crece">${foto(f1, "c-big")}<div class="c-pq">${foto(f2)}${foto(f3)}</div></div>
      <div class="c-fila">
        <div class="card c-como"><h3>Cómo es</h3>${rasgosUL(d, "compacta")}</div>
        <div class="card c-cuando"><h3>Cuándo</h3>${rueda(d, 15.5)}<p>${esc(d.mesesTxt)}</p></div>
      </div>
      <div class="card"><h3>Dónde</h3><div class="c-donde">${dondeL(d, false)}</div></div>
      <div class="card"><h3>${d.ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3>${clavesUL(d)}${d.os ? `<div data-q="7">${d.os}</div>` : ""}</div>
      ${d.tox ? `<div class="card c-tox">${toxHTML(d)}</div>` : ""}
      <div class="card c-conf"><h3>${d.ok ? "Cuidado: se confunde con" : "Se confunde con"}</h3>
        ${d.confs.map((c, i) => `<div class="c-cf"${i === 2 ? ' data-q="5"' : ""}>${c.foto ? `<img src="${c.foto}" alt="">` : `<span class="c-nof"></span>`}<p><b>${c.nombre}</b> ${tag(c)} ${pagRef(c)}<br><span>${esc(S.cortaFrase(c.dif, 80))}</span></p></div>`).join("")}
      </div>
      ${pie(d)}</section>`;
  }

  // =========================================================
  // D · SÍ O NO: LISTA PARA COMPROBAR EN EL MONTE
  // =========================================================
  function mD(d) {
    const [f1, f2, f3] = d.fotos;
    const box = `<i class="bx"></i>`;
    const si = d.claves.map((c, i) => `<li${i >= 3 ? ' data-q="5"' : ""}>${box}${esc(c)}</li>`).join("");
    // comestibles: «descártela si…», con lo que tienen las que se le parecen; las demás: qué pasa si se come
    const no = d.ok
      ? `<div class="d-col d-no"><h3>Descártela si…</h3><ul>${d.confs.map((c, i) => `<li${i === 2 ? ' data-q="6"' : ""}>${box}<span>${esc(S.cortaFrase(c.dif, 70))} <em>→ ${c.nombre}</em></span></li>`).join("")}</ul></div>`
      : `<div class="d-col d-no"><h3>Si se come…</h3><p class="d-grav">${S.dots(d.tox.grav[0])}<b>${d.tox.grav[1]}</b></p><p>${esc(d.tox.causa)}</p>${d.tox.sindrome ? `<p data-q="6"><b>${esc(d.tox.sindrome)}.</b> Síntomas ${esc(d.tox.latencia)}.</p>` : ""}</div>`;
    const vs = d.confs.filter(c => c.foto).slice(0, 2);
    return `<section class="pg mD st-${d.st}" data-id="${d.id}">
      <header class="d-head"><div><h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div><div class="d-k">${pill(d)}${dif(d)}</div></header>
      <div class="d-fotos crece">${foto(f1, "d-big")}<div class="d-pq">${foto(f2)}${foto(f3)}</div></div>
      <div class="d-meses">${mesesTira(d)}<span class="d-dn">${d.donde.slice(0, 2).map(([ic, t]) => `<span>${S.ICON[ic]}${esc(t)}</span>`).join("")}</span></div>
      <div class="d-yn fit">
        <div class="d-col d-si"><h3>${d.ok ? "Es ella si…" : "Señales de alarma"}</h3><ul>${si}</ul></div>
        ${no}
      </div>
      ${vs.length ? `<div class="d-vs" data-q="2"><h3>No la confunda</h3><div class="d-vsr">${vs.map(c => `<div class="d-par"><div class="d-par-im"><img src="${f1.src}" alt=""><b>≠</b><img src="${c.foto}" alt=""></div><p><b>${c.nombre}</b> ${tag(c)} ${pagRef(c)}</p></div>`).join("")}</div></div>` : ""}
      ${d.compruebe ? `<p class="d-comp">${box}<span><b>Antes de cogerla, compruebe:</b> ${esc(S.primera(d.compruebe, 120))}</span></p>` : ""}
      ${pie(d)}</section>`;
  }

  // =========================================================
  // E · INFOGRAFÍA: DIBUJO CON FLECHAS
  // =========================================================
  function mE(d) {
    const c = d.car, m = d.morf, him = c.himenoforo;
    const corto = (t, n) => esc(S.cortaFrase(String(t || "").replace(/^\d[–\-\d\s,.×x]*cm,?\s*/i, ""), n));
    // [lado, altura en el dibujo (0–66), título, texto, aviso]
    const et = [
      ["i", 12, "Sombrero", cap(corto(m.sombrero, 52))],
      ["d", 27, S.LAB_HIM[him] || "Debajo", cap(esc(S.DEBAJO[d.id] || ""))],
      ["i", 37, "Anillo", c.anillo ? cap(esc(S.ANILLO[d.id] || "sí")) : S.ANILLO_PARCIAL[d.id] ? cap(esc(S.ANILLO_PARCIAL[d.id])) : "No tiene", !c.anillo && !S.ANILLO_PARCIAL[d.id]],
      ["d", 45, "Pie", cap(corto(m.pie, 46))],
      ["i", 58, "Volva", c.volva ? cap(esc(S.VOLVA[d.id] || "sí")) : "No tiene", !c.volva, c.volva]
    ];
    const etq = et.map(([lado, y, t, x, no, alarma]) => `<div class="e-et e-${lado}${no ? " no" : ""}${alarma ? " alarma" : ""}" style="top:calc(var(--h) * ${(y / 66).toFixed(3)})"><b>${t}</b><span>${x}</span></div>`).join("");
    // hasta dónde llega cada flecha (la parte en el dibujo)
    const fin = [13, him === "poros" ? 49 : 46, 23.5, c.volva ? 33.5 : 34, c.volva ? 23 : 27];
    const lineas = et.map(([lado, y], i) => `<line x1="${lado === "i" ? 0 : 60}" y1="${y}" x2="${fin[i]}" y2="${y}"/><circle cx="${fin[i]}" cy="${y}" r=".7"/>`).join("");
    return `<section class="pg mE st-${d.st}" data-id="${d.id}">
      <header class="e-head"><div class="e-t">${pill(d)}${dif(d)}<h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div>${rueda(d, 15)}</header>
      <div class="e-tira crece">${d.fotos.map(f => foto(f)).join("")}</div>
      <div class="e-ana">${dibujo(d).replace("</svg>", `<g class="ln">${lineas}</g></svg>`)}${etq}</div>
      <div class="e-info">
        <div><h3>Dónde</h3>${dondeL(d, false)}</div>
        <div class="e-esp">${d.esporada ? `<h3>Esporada</h3><p><i class="e-sw" style="background:${colorEsp(d.esporada)}"></i>${esc(cap(d.esporada))}</p>` : ""}${c.latex ? `<h3>Látex</h3><p>${esc(S.LATEX[c.latex] || "")}</p>` : ""}</div>
      </div>
      <div class="e-txt fit">
        ${d.ok ? `<h3>Cómo reconocerla</h3>${clavesUL(d, 6)}` : `${toxHTML(d)}<div data-q="3"><h3>Rasgos de alarma</h3>${clavesUL(d, 6)}</div>`}
        <div class="e-conf"><h3>${d.ok ? "Cuidado: se confunde con" : "Se confunde con"}</h3><div class="e-cfs">
          ${d.confs.map(c => `<div class="e-cf">${c.foto ? `<img src="${c.foto}" alt="">` : `<span class="e-nof"></span>`}<p><b>${c.nombre}</b><br>${tag(c)} ${pagRef(c)}</p><p class="e-dif" data-q="4">${esc(S.cortaFrase(c.dif, 58))}</p></div>`).join("")}
        </div></div>
      </div>${pie(d)}</section>`;
  }
  const colorEsp = t => /blanc/i.test(t) && !/crema|rosad|ocre/i.test(t) ? "#fff" : /crema|rosad/i.test(t) ? "#f3e2cf" : /ocre|amarill/i.test(t) ? "#d9b46a" : /herrumbr|parda|pardo|marr/i.test(t) ? "#8a5a2e" : /negr|púrp|viol/i.test(t) ? "#3b2b3a" : /oliv/i.test(t) ? "#7d6f3a" : "#ddd";

  // =========================================================
  // LÁMINAS
  // =========================================================
  const PROP = [
    { k: "0", f: actual, t: "Ficha completa", s: "La que hay ahora, sin cambios",
      idea: "Cabecera con nombre y meses, tres fotos iguales en fila, «Cómo es / Dónde» en dos columnas y debajo, en texto seguido, cómo reconocerla y las confusiones.",
      gana: ["Lo dice todo: es la más completa.", "Muy ordenada y regular: todas las fichas se parecen."],
      pierde: ["Mucho texto pequeño; cuesta encontrar algo de un vistazo.", "Las fotos son pequeñas para A6."] },
    { k: "A", f: mA, t: "Foto protagonista", s: "Como una revista",
      idea: "Una foto grande a sangre arriba, con el nombre encima; dos fotos pequeñas en la esquina. Una banda de color con la dificultad y los meses, y el texto debajo, más corto.",
      gana: ["Se reconoce la seta al pasar las páginas.", "Muy atractiva; el color del grupo se ve enseguida."],
      pierde: ["Cabe menos texto: se quitan detalles si no caben.", "Gasta más tinta (foto a sangre)."] },
    { k: "B", f: mB, t: "Guía de campo", s: "Columna de fotos",
      idea: "Como las guías de campo clásicas: las tres fotos en una columna a la izquierda, con su pie y dónde sale; a la derecha, todo el texto en una columna estrecha, fácil de leer.",
      gana: ["Líneas cortas: se lee más rápido.", "Las fotos van con su explicación al lado del texto."],
      pierde: ["Fotos más pequeñas que en A.", "La columna de texto se llena antes en las fichas largas."] },
    { k: "C", f: mC, t: "Tarjetas", s: "Cada cosa en su caja",
      idea: "Cabecera de color y cada bloque en una tarjeta: cómo es, cuándo (rueda de meses), dónde, cómo reconocerla y las confusiones con su foto redonda.",
      gana: ["Se encuentra cada dato enseguida, siempre en el mismo sitio.", "Las confusiones llevan foto."],
      pierde: ["Las cajas ocupan sitio: menos texto.", "Más «de app» que de libro."] },
    { k: "D", f: mD, t: "Sí o no", s: "Lista para el monte",
      idea: "Pensada para usarla con la seta en la mano: casillas para marcar lo que se ve (es ella si… / descártela si…), las parecidas foto contra foto y lo que hay que comprobar antes de cogerla.",
      gana: ["Obliga a mirar cada rasgo: la más segura.", "Las confusiones, foto contra foto."],
      pierde: ["Menos descripción (sombrero, pie…).", "En las tóxicas cambia la columna de la derecha: «Si se come…»."] },
    { k: "E", f: mE, t: "Infografía", s: "Dibujo con flechas",
      idea: "Un dibujo de la seta con flechas a sus partes (sombrero, debajo, anillo, pie, volva), una tira de fotos, la rueda de meses y las confusiones en tres columnas con foto.",
      gana: ["Enseña a mirar las partes: muy didáctica.", "Anillo y volva saltan a la vista (o que no los tiene)."],
      pierde: ["El dibujo es esquemático: no sirve para las setas con formas raras (bolas, corales, colmenillas).", "Menos texto de reconocimiento."] }
  ];
  const D = MUESTRAS.map(id => datos(S.BY[id]));
  const lamina = (cls, html) => { raiz.insertAdjacentHTML("beforeend", `<section class="lam ${cls}">${html}</section>`); return raiz.lastElementChild; };
  const marca = `<p class="lam-pie">Setas esenciales · cuaderno completo A6 · propuestas de maquetación de la ficha · ${new Date().toLocaleDateString("es-ES")}</p>`;

  // portada: las 6 con la misma seta, para verlas de un vistazo
  const comparativa = (d, n) => lamina("cmp", `
    <header class="lam-h"><span class="lam-n">${n}</span><div><h2>${esc(d.nombreTxt)}: las seis maquetas</h2><p>La misma ficha (${SEC[d.sec].toLowerCase()}) en cada propuesta, al 60 %. Las láminas siguientes las muestran a tamaño real.</p></div></header>
    <div class="cmp-grid">${PROP.map(p => `<div class="cmp-c"><p class="cmp-t"><b>${p.k === "0" ? "Ahora" : p.k}</b> ${esc(p.t)}</p><div class="esc">${p.f(d)}</div></div>`).join("")}</div>${marca}`);

  let n = 1;
  comparativa(D[0], n++);
  PROP.forEach(p => {
    lamina("prop", `
      <aside class="lam-txt">
        <span class="lam-k">${p.k === "0" ? "Ahora" : p.k}</span>
        <h2>${esc(p.t)}</h2><p class="lam-s">${esc(p.s)}</p>
        <p>${esc(p.idea)}</p>
        <h4 class="g">A favor</h4><ul>${p.gana.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <h4 class="p">En contra</h4><ul>${p.pierde.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <p class="lam-nota">Lámina ${n} · tamaño real (A6, 105 × 148 mm). Comestible a la izquierda, mortal a la derecha; la tóxica, en la lámina ${PROP.length + 2}.</p>
      </aside>
      <div class="lam-pgs">${p.f(D[0])}${p.f(D[2])}</div>${marca}`);
    n++;
  });
  comparativa(D[1], n++);
  comparativa(D[2], n++);

  // ajuste de cada página (después de cargar las fotos, que no cambian el alto: todas tienen su caja fija)
  const pgs = [...document.querySelectorAll(".pg:not(.img)")];
  pgs.forEach(ajusta);
  document.querySelectorAll(".fit").forEach(f => (f.scrollTop = 0));
  window.MAQUETAS_INFORME = pgs.filter(p => p.classList.contains("desborda")).map(p => p.dataset.id + " " + p.className);

  // en pantalla, las láminas al ancho de la ventana
  const zoom = () => { const w = raiz.firstElementChild.getBoundingClientRect().width / (parseFloat(document.body.style.zoom) || 1); document.body.style.zoom = Math.min(1, (innerWidth - 16) / w); };
  if (!matchMedia("print").matches) { zoom(); addEventListener("resize", zoom); }
  Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => { document.body.dataset.ready = "1"; });
};
// setas.js puede haber terminado antes de que se cargue este archivo
if (window.SETAS) maquetas(); else document.addEventListener("setas-listo", maquetas);
