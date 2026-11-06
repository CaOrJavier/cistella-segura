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
    const pasos = ["d1", 9, 8, "d2", 7, 6, 5, "d3", "d4", 4, 3, 2, 1];
    const quitados = [];
    for (const s of pasos) {
      if (!sobra()) break;
      if (typeof s === "string") { pg.classList.add(s); continue; }
      let l;
      while (sobra() && (l = pg.querySelectorAll(`[data-q="${s}"]`)).length) {
        // con data-g, se quitan (y vuelven) todos los del grupo a la vez: las diferencias de las parecidas, todas o ninguna
        const el = l[l.length - 1], grupo = el.dataset.g ? [...pg.querySelectorAll(`[data-g="${el.dataset.g}"]`)] : [el];
        quitados.push(grupo.map(x => [x, x.parentNode, x.nextSibling]));
        grupo.forEach(x => x.remove());
      }
    }
    if (sobra()) { pg.classList.add("desborda"); console.warn("No cabe:", pg.dataset.id, pg.className); return; }
    // si ha sobrado sitio, vuelve lo quitado (lo más importante primero) y luego la letra más grande
    for (const grupo of quitados.reverse()) {
      grupo.forEach(([el, padre, sig]) => padre.insertBefore(el, sig && sig.parentNode === padre ? sig : null));
      if (sobra()) grupo.forEach(([el]) => el.remove());
    }
    for (const d of ["d4", "d3", "d2", "d1"]) {
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
  // SEGUNDA RONDA (F–K): FOTO GRANDE, TEXTO APRETADO Y, EN ALGUNAS, ADORNOS
  // =========================================================
  // texto compacto: cada bloque en un párrafo seguido, con su título delante (sin listas)
  const minus = t => t.charAt(0).toLowerCase() + t.slice(1);
  function compacto(d) {
    const ras = d.rasgos.map(([t, l, x]) => `<span class="ri r-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><i class="mk">${S.MARCA[t]}</i><b>${l}</b>${x ? " " + esc(x) : ""}</span>`).join(" ")
      + (d.esporada ? ` <span class="ri" data-q="6"><b>Esporada</b> ${esc(minus(d.esporada))}</span>` : "");
    const donde = [...d.donde.map(x => x[1]), d.alt].filter(Boolean).map(esc).join("; ");
    const t = d.tox;
    return `
      <p class="k"><span class="lab">Cómo es</span>${ras}</p>
      <p class="k"><span class="lab">Dónde</span>${donde}.${d.detalle ? ` <span class="kmas" data-q="8">${esc(d.detalle)}</span>` : ""}</p>
      <p class="k kcl${d.ok ? "" : " alarm"}"><span class="lab">${d.ok ? "Cómo reconocerla" : "Rasgos de alarma"}</span>${d.claves.map((c, i) => `<span class="kc"${i >= 3 ? ' data-q="5"' : ""}>${esc(c)}</span>`).join(" ")}</p>
      ${d.os ? `<div data-q="7">${d.os.replace('class="os"', 'class="os k"')}</div>` : ""}
      ${t ? `<p class="k ktox"><span class="lab">Gravedad</span>${S.dots(t.grav[0])} <b>${t.grav[1]}.</b> ${esc(t.causa)}${t.sindrome ? ` <span data-q="4"><span class="lab">${esc(t.sindrome)}</span>Síntomas ${esc(t.latencia)}. ${esc(t.sintomas)}</span>` : ""}</p>` : ""}
      <div class="kconf"><p class="k"><span class="lab">${d.ok ? "Cuidado: se confunde con" : "Se confunde con"}</span></p>${d.confs.map((c, i) => `<p class="kcf"${i === 2 ? ' data-q="5"' : ""}><b>${c.nombre}</b> ${tag(c)} ${pagRef(c)} <span class="kd">${esc(S.cortaFrase(c.dif, 110))}</span></p>`).join("")}</div>
      ${compruebe(d)}`;
  }
  const mesesCorto = d => d.mesesTxt.replace(/^De /, "").replace(" a ", "–");

  // adornos (SVG; las medidas en mm, del tamaño de la página A6)
  // marco clásico: doble filete con las esquinas hacia dentro y un rizo en cada una
  const esquinaClasica = `<g class="orn"><path d="M6 15.5C10 15.5 11.4 11.6 9.4 10.2 8 9.2 6.8 10.6 7.8 11.6"/><path d="M15.5 6C15.5 10 11.6 11.4 10.2 9.4 9.2 8 10.6 6.8 11.6 7.8"/><path class="rl" d="M9.6 9.6l1.3-2.4 1.1 1.1-2.4 1.3 1.3-2.4M9.6 9.6l2.4-1.3"/><circle cx="7.4" cy="7.4" r=".9"/></g>`;
  const marcoClasico = () => {
    const L = 6, T = 6, R = 99, B = 142, r = 5;
    const dentro = `M${L + r} ${T}H${R - r}A${r} ${r} 0 0 0 ${R} ${T + r}V${B - r}A${r} ${r} 0 0 0 ${R - r} ${B}H${L + r}A${r} ${r} 0 0 0 ${L} ${B - r}V${T + r}A${r} ${r} 0 0 0 ${L + r} ${T}Z`;
    const rombo = (x, y) => `<path class="rb" d="M${x} ${y - 1.4}l1.4 1.4-1.4 1.4-1.4-1.4z"/>`;
    return `<svg class="marco" viewBox="0 0 105 148" aria-hidden="true"><rect class="fl" x="3.6" y="3.6" width="97.8" height="140.8"/><path class="fl2" d="${dentro}"/>
      ${esquinaClasica}<g transform="translate(105 0) scale(-1 1)">${esquinaClasica}</g><g transform="translate(0 148) scale(1 -1)">${esquinaClasica}</g><g transform="translate(105 148) scale(-1 -1)">${esquinaClasica}</g>
      ${rombo(52.5, 3.6)}${rombo(3.6, 74)}${rombo(101.4, 74)}</svg>`;
  };
  // orla: filete con un rombo y dos rizos en el centro
  const orla = (w = 46) => `<svg class="orla" viewBox="0 0 60 8" style="width:${w}mm" aria-hidden="true"><path class="o-l" d="M1 4H23M37 4H59"/><path class="o-c" d="M23 4c1.6-2.6 4.2-2.6 4.6-.6M37 4c-1.6-2.6-4.2-2.6-4.6-.6M23 4c1.6 2.6 4.2 2.6 4.6.6M37 4c-1.6 2.6-4.2 2.6-4.6.6"/><path class="o-r" d="M30 1.3l2.7 2.7L30 6.7 27.3 4z"/></svg>`;
  // esquinas modernistas: un latigazo que se enrosca, hojas y bayas, del color del grupo
  const esquinaModernista = `<g class="mod" transform="translate(3 3) scale(.75)"><path class="m1" d="M3.5 46C3.5 22 7 9 18 5.6 25 3.6 32 4.4 46 4"/><path class="m2" d="M7 34C8.5 21 14.5 13.5 23.5 12.6c5.2-.5 7.2 3.6 4.2 5.6-2.6 1.7-5.4-.6-3.4-2.4"/><path class="m2" d="M12 7.6c4.4 3.2 5.6 8 4.4 12"/><path class="hj" d="M8.6 25.5c.6-5 4.4-8 8.2-7.2-1.2 4.2-4.6 6.6-8.2 7.2z"/><path class="hj" d="M16.4 8.8c3.8-2.4 8.2-2 10 .4-3.6 2-7.2 1.8-10-.4z"/><circle class="by" cx="31.5" cy="8.6" r="1.15"/><circle class="by" cx="34.4" cy="10.6" r=".8"/><circle class="by lado" cx="7.6" cy="38.6" r="1"/><circle class="by lado" cx="10" cy="41.6" r=".7"/></g>`;
  const marcoModernista = () => `<svg class="marco mod-m" viewBox="0 0 105 148" aria-hidden="true">
    ${esquinaModernista}<g transform="translate(105 0) scale(-1 1)">${esquinaModernista}</g><g class="abajo" transform="translate(0 148) scale(1 -1)">${esquinaModernista}</g><g class="abajo" transform="translate(105 148) scale(-1 -1)">${esquinaModernista}</g>
    <path class="m1" d="M37.5 6H67.5M5.6 37.5V110.5M99.4 37.5V110.5M37.5 142H67.5"/><path class="by" d="M52.5 3.8l2.2 2.2-2.2 2.2-2.2-2.2z"/><path class="by" d="M52.5 139.8l2.2 2.2-2.2 2.2-2.2-2.2z"/><path class="by" d="M3.4 74l2.2-2.2 2.2 2.2-2.2 2.2z"/><path class="by" d="M97.2 74l2.2-2.2 2.2 2.2-2.2 2.2z"/></svg>`;

  // ---------- F · foto alta y texto en dos columnas ----------
  function mF(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg mF st-${d.st}" data-id="${d.id}">
      <div class="f-hero crece">${foto(f1, "f-main")}<div class="f-nom">${pill(d)}<h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div>
        <div class="f-pq">${foto(f2)}${foto(f3)}</div></div>
      <div class="f-meta">${dif(d)}${mesesTira(d)}</div>
      <div class="kk k2">${compacto(d)}</div>${pie(d)}</section>`;
  }

  // ---------- G · marco clásico con esquinas ----------
  function mG(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg mG st-${d.st}" data-id="${d.id}">${marcoClasico()}
      <header class="g-head"><p class="g-k"><span>${d.est.pill}</span> · ${S.dots(d.dn)} ${d.dt}</p><h1>${d.nombre}</h1><p class="lat">${d.segunda}</p>${orla(40)}</header>
      <div class="g-fotos crece">${foto(f1, "g-big")}<div class="g-pq">${foto(f2)}${foto(f3)}</div></div>
      <div class="g-meta">${mesesTira(d)}</div>
      <div class="kk k2">${compacto(d)}</div>
      <footer class="pf g-pf"><span class="pn">${d.pag}</span></footer></section>`;
  }

  // ---------- H · arco y medallones ----------
  function mH(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg mH st-${d.st}" data-id="${d.id}">
      <div class="h-arco crece">${foto(f1, "h-main")}${foto(f2, "h-med h-m1")}${foto(f3, "h-med h-m2")}</div>
      <header class="h-head"><h1>${d.nombre}</h1><p class="lat">${d.segunda}</p>${orla(52)}<p class="h-k">${pill(d)}${dif(d)}${mesesTira(d)}</p></header>
      <div class="kk">${compacto(d)}</div>${pie(d)}</section>`;
  }

  // ---------- I · álbum de campo: esquineros, cinta y notas a mano ----------
  function mI(d) {
    const [f1, f2, f3] = d.fotos;
    const esq = `<i class="esq e1"></i><i class="esq e2"></i><i class="esq e3"></i><i class="esq e4"></i>`;
    const nota = f1?.pie ? S.capCorta(f1.pie, 34).replace(/[.…]$/, "") : "";
    return `<section class="pg mI st-${d.st}" data-id="${d.id}">
      <header class="i-head"><div><h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div><div class="i-k">${pill(d)}<span class="mano">${esc(d.dt.toLowerCase())} · ${esc(mesesCorto(d))}</span></div></header>
      <div class="i-fotos crece">
        <div class="i-f i-1"><img src="${f1.src}" alt="">${esq}</div>
        ${f2 ? `<div class="i-f i-2"><img src="${f2.src}" alt=""><i class="cinta"></i></div>` : ""}
        ${f3 ? `<div class="i-f i-3"><img src="${f3.src}" alt=""><i class="cinta"></i></div>` : ""}
        ${nota ? `<p class="mano i-nota">↑ ${esc(minus(nota))}</p>` : ""}
      </div>
      <div class="kk k2">${compacto(d)}</div>${pie(d)}</section>`;
  }

  // ---------- J · modernista: esquinas con hojas y el nombre en una cinta ----------
  function mJ(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg mJ st-${d.st}" data-id="${d.id}">${marcoModernista()}
      <div class="j-fotos crece">${foto(f1, "j-main")}<div class="j-pq">${foto(f2)}${foto(f3)}</div></div>
      <div class="j-cinta"><h1>${d.nombre}</h1></div>
      <p class="lat j-lat">${d.segunda}</p>
      <p class="j-meta">${pill(d)}${dif(d)}${mesesTira(d)}</p>
      <div class="kk k2">${compacto(d)}</div>
      <footer class="pf j-pf"><span class="pn">${d.pag}</span></footer></section>`;
  }

  // ---------- K · la foto de fondo, a toda página, y el texto en un panel ----------
  function mK(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg mK st-${d.st}" data-id="${d.id}">${foto(f1, "k-fondo")}
      <div class="k-top">${pill(d)}<h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div>
      <div class="k-hueco"></div>
      <div class="k-panel"><div class="k-pq">${foto(f2)}${foto(f3)}</div>
        <p class="k-meta">${dif(d)}${mesesTira(d)}</p>
        <div class="kk k2">${compacto(d)}</div>${pie(d)}</div></section>`;
  }

  // =========================================================
  // TERCERA RONDA (F1–F3): LA F CON FOTOS PEQUEÑAS MÁS GRANDES Y MENOS TEXTO (ICONOS)
  // =========================================================
  const pic = x => `<svg viewBox="0 0 12 12" aria-hidden="true">${x}</svg>`;
  const PIC = {
    // una seta entera: con el anillo colgando del pie, o con la base metida en un saco (volva)
    anillo: pic('<path d="M.7 4.9C1.6 2.2 3.6.9 6 .9s4.4 1.3 5.3 4z"/><path d="M5.1 4.9h1.8v6.6H5.1z"/><path d="M3.3 6.2h5.4l1.1 2H2.2z"/>'),
    volva: pic('<path d="M.7 4.9C1.6 2.2 3.6.9 6 .9s4.4 1.3 5.3 4z"/><path d="M5.1 4.9h1.8v5H5.1z"/><path d="M2.8 8.4c0 2.3 1.2 3.2 3.2 3.2s3.2-.9 3.2-3.2l-1 .9-.9-1.1-.7 1-.6-1-.6 1-.7-1-.9 1.1z"/>'),
    olor: pic('<path d="M6.5 1.1C5.9 4 3.3 6.4 3.3 8.5c0 1.1.9 2 2 2h1.9a1.9 1.9 0 0 0 .4-3.7" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>'),
    reloj: pic('<circle cx="6" cy="6" r="4.8" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M6 3.1V6l2.1 1.4" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>'),
    alerta: pic('<path d="M6 .9 11.5 10.8H.5z"/><path d="M5.35 4.1h1.3l-.2 3.7h-.9zM5.35 8.5h1.3v1.3h-1.3z" fill="#fff"/>'),
    lupa: pic('<circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7.6 7.6 11 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>')
  };
  const LATEX_C = { rojo: "#8e1b2a", naranja: "#e0791e", blanco: "#ffffff", blanco_a_amarillo: "#f2df8a" };
  const gota = c => pic(`<path d="M6 .8S2.4 5.4 2.4 8a3.6 3.6 0 0 0 7.2 0C9.6 5.4 6 .8 6 .8z" fill="${c}" stroke="#39423b" stroke-width=".6"/>`);
  const disco = c => pic(`<circle cx="6" cy="6" r="4.6" fill="${c}" stroke="#39423b" stroke-width=".7"/><circle cx="6" cy="6" r="1.4" fill="#39423b" fill-opacity=".18"/>`);
  const HIM_PIC = { laminas: "lamines", poros: "porus", pliegues: "plecs", aguijones: "agullons" };

  // los rasgos, en iconos: [tipo (si/no/medio/dato), icono, título, detalle]
  function rasgosIco(d) {
    const c = d.car, him = c.himenoforo, out = [];
    if (S.LAB_HIM[him]) out.push(["si", S.ICON[HIM_PIC[him]], S.LAB_HIM[him], S.DEBAJO[d.id]]);
    else if (him) out.push(["no", S.ICON.lamines, "Sin láminas", S.DEBAJO[d.id]]);
    if (S.LAB_HIM[him]) {
      if (c.anillo) out.push(["si", PIC.anillo, "Anillo", S.ANILLO[d.id]]);
      else if (S.ANILLO_PARCIAL[d.id]) out.push(["medio", PIC.anillo, "Anillo", S.ANILLO_PARCIAL[d.id]]);
      else out.push(["no", PIC.anillo, "Sin anillo", ""]);
      out.push(c.volva ? ["si", PIC.volva, "Volva", S.VOLVA[d.id]] : ["no", PIC.volva, "Sin volva", ""]);
    }
    if (c.latex) out.push(["dato", gota(LATEX_C[c.latex] || "#fff"), "Látex", S.LATEX[c.latex]]);
    if (d.esporada) out.push(["dato", disco(colorEsp(d.esporada)), "Esporada", minus(d.esporada)]);
    return out;
  }
  const chip = ([t, ic, l, x]) => `<div class="chip c-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><span class="ci">${ic}${t === "dato" ? "" : `<i class="bd">${S.MARCA[t]}</i>`}</span><span class="ct"><b>${l}</b>${x ? `<small data-q="6">${esc(x)}</small>` : ""}</span></div>`;
  const chips = (d, cls = "") => { const r = rasgosIco(d); return `<div class="chips ${cls}" style="--n:${r.length}">${r.map(chip).join("")}</div>`; };
  // dónde y cuándo, cada dato con su icono
  const dondeIco = (d, conMeses = false) => [...d.donde, ...(d.alt ? [["monte", d.alt]] : []), ...(conMeses && d.mesesTxt ? [["calendari", d.mesesTxt]] : [])]
    .map(([ic, t]) => `<p class="ir">${S.ICON[ic]}<span>${esc(t)}</span></p>`).join("");
  const olorIco = d => (d.os ? `<p class="ir" data-q="7">${PIC.olor}<span>${d.os.replace(/^<p class="os">|<\/p>$/g, "")}</span></p>` : "");
  // los rasgos para reconocerla, cortos y cada uno en su línea, con su marca
  const clavesIco = d => `<ul class="cl${d.ok ? "" : " alarm"}">${d.claves.map((c, i) => `<li${i >= 3 ? ' data-q="5"' : ""}>${d.ok ? `<i class="mk">${S.MARCA.si}</i>` : PIC.alerta}<span>${esc(S.cortaFrase(c, 100))}</span></li>`).join("")}</ul>`;
  // latencia corta: «de 6 a 24 horas (típicamente 8–12)» → «6–24 h»
  const UN = { minuto: "min", minutos: "min", hora: "h", horas: "h", días: "días", dias: "días", semanas: "semanas" };
  const latCorta = t => {
    t = String(t || "").replace(/\s*\([^)]*\)/g, "");
    const m = t.match(/(\d+)\s*(minutos?|horas?|días|semanas)?\s*(?:a|y|–|-)\s*(\d+)\s*(minutos?|horas?|días|semanas)/i);
    if (!m) return t;
    const u2 = UN[m[4].toLowerCase()], u1 = m[2] ? UN[m[2].toLowerCase()] : u2;
    return u1 === u2 ? `${m[1]}–${m[3]} ${u2}` : `${m[1]} ${u1} – ${m[3]} ${u2}`;
  };
  const toxIco = d => (d.tox ? `<div class="tx"><span class="tx-g">${PIC.alerta}${S.dots(d.tox.grav[0])}<b>${d.tox.grav[1]}</b></span>${d.tox.latencia ? `<span>${PIC.reloj}síntomas a las ${esc(latCorta(d.tox.latencia))}</span>` : ""}${d.tox.sindrome ? `<span class="tx-s" data-q="4">${esc(d.tox.sindrome)}</span>` : ""}<p class="tx-c" data-q="5">${esc(d.tox.causa)}</p></div>` : "");
  // las que se le parecen: foto redonda, nombre, etiqueta y página; la diferencia, corta
  const confsIco = (d, cols = 3, cls = "") => `<div class="cfx ${cls}"><h3>${d.ok ? "Cuidado: se confunde con" : "Se confunde con"}</h3><div class="cfs" style="--c:${cols}">${d.confs.map((c, i) => `<div class="cf3"${i === 2 ? ' data-q="4"' : ""}>${c.foto ? `<img src="${c.foto}" alt="">` : `<span class="nof"></span>`}<p><b>${c.nombre}</b><br>${tag(c)} ${pagRef(c)}</p><p class="cfd" data-q="3" data-g="cfd">${esc(S.cortaFrase(c.dif, 62))}</p></div>`).join("")}</div></div>`;
  const comprIco = d => (d.compruebe ? `<p class="cmp2" data-q="2">${PIC.lupa}<span><b>Compruebe:</b> ${esc(S.primera(d.compruebe, 120))}</span></p>` : "");
  const nombreFoto = d => `<div class="f-nom">${pill(d)}<h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div>`;

  // ---------- F1 · F con fotos pequeñas grandes y fila de iconos ----------
  function mF1(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg ic mF1 st-${d.st}" data-id="${d.id}">
      <div class="f-hero crece">${foto(f1, "f-main")}${nombreFoto(d)}<div class="f1-pq">${foto(f2)}${foto(f3)}</div></div>
      <div class="f1-meta">${dif(d)}${mesesTira(d)}</div>
      ${chips(d)}
      <div class="irs">${dondeIco(d)}${olorIco(d)}</div>
      ${toxIco(d)}${clavesIco(d)}
      ${confsIco(d)}${comprIco(d)}${pie(d)}</section>`;
  }

  // ---------- F2 · F con tira de fotos y ficha técnica ----------
  function mF2(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg ic mF2 st-${d.st}" data-id="${d.id}">
      <div class="f-hero crece">${foto(f1, "f-main")}${nombreFoto(d)}</div>
      <div class="f2-fotos">${foto(f2)}${foto(f3)}</div>
      <div class="f2-meta">${dif(d)}${mesesTira(d)}</div>
      <div class="f2-tec"><div>${chips(d, "fila")}</div><div class="irs col">${dondeIco(d)}${olorIco(d)}</div></div>
      ${toxIco(d)}${clavesIco(d)}
      ${confsIco(d)}${comprIco(d)}${pie(d)}</section>`;
  }

  // ---------- F3 · F con las tres fotos arriba y columna de iconos ----------
  function mF3(d) {
    const [f1, f2, f3] = d.fotos;
    return `<section class="pg ic mF3 st-${d.st}" data-id="${d.id}">
      <div class="f3-top crece">${foto(f1, "f3-main")}<div class="f3-pq">${foto(f2)}${foto(f3)}</div>${nombreFoto(d)}</div>
      <div class="f2-meta">${dif(d)}${mesesTira(d)}</div>
      <div class="f3-body">
        <aside class="f3-side">${chips(d, "fila")}</aside>
        <div class="f3-main-t"><div class="irs">${dondeIco(d)}${olorIco(d)}</div>${toxIco(d)}${clavesIco(d)}${confsIco(d, 1)}${comprIco(d)}</div>
      </div>${pie(d)}</section>`;
  }

  // =========================================================
  // CUARTA RONDA (F3a–F3d): LA F3 SIN LA COLUMNA DE ICONOS DE LOS RASGOS
  // (los rasgos, en una línea con su ✓ / ✗; el sitio, para las fotos y las parecidas)
  // =========================================================
  const rasLinea = d => `<p class="rl"><span class="lab">Cómo es</span>${d.rasgos.map(([t, l, x]) => `<span class="ri r-${t}${t === "si" && l === "Volva" ? " alarma" : ""}"><span class="nw"><i class="mk">${S.MARCA[t]}</i><b>${l}</b></span>${x ? " " + esc(x) : ""}</span>`).join(" ")}${d.esporada ? ` <span class="ri" data-q="6"><b>Esporada</b> ${esc(minus(d.esporada))}</span>` : ""}</p>`;
  const tresFotos = (d, conNombre = true) => {
    const [f1, f2, f3] = d.fotos;
    return `<div class="f3-top crece">${foto(f1, "f3-main")}<div class="f3-pq">${foto(f2)}${foto(f3)}</div>${conNombre ? nombreFoto(d) : ""}</div>`;
  };
  const metaF3 = d => `<div class="f2-meta">${dif(d)}${mesesTira(d)}</div>`;

  // ---------- F3a · todo a lo ancho ----------
  const mF3a = d => `<section class="pg ic mF3 mF3a st-${d.st}" data-id="${d.id}">${tresFotos(d)}${metaF3(d)}
      ${rasLinea(d)}<div class="irs">${dondeIco(d)}${olorIco(d)}</div>${toxIco(d)}${clavesIco(d)}${confsIco(d, 3)}${comprIco(d)}${pie(d)}</section>`;

  // ---------- F3b · dos columnas que se reparten solas ----------
  const mF3b = d => `<section class="pg ic mF3 mF3b st-${d.st}" data-id="${d.id}">${tresFotos(d)}${metaF3(d)}
      ${rasLinea(d)}
      <div class="f3b-cols"><div class="irs col">${dondeIco(d)}${olorIco(d)}</div>${toxIco(d)}<div class="blq"><h3>${d.ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3>${clavesIco(d)}</div>${confsIco(d, 1)}${comprIco(d)}</div>${pie(d)}</section>`;

  // ---------- F3c · las parecidas en la columna de la izquierda ----------
  const mF3c = d => `<section class="pg ic mF3 mF3c st-${d.st}" data-id="${d.id}">${tresFotos(d)}${metaF3(d)}
      <div class="f3c-body"><aside class="f3c-izq">${confsIco(d, 1, "grande")}</aside>
        <div class="f3c-der">${rasLinea(d)}<div class="irs col">${dondeIco(d)}${olorIco(d)}</div>${toxIco(d)}${clavesIco(d)}${comprIco(d)}</div></div>${pie(d)}</section>`;

  // ---------- F3d · el nombre en una banda de color, debajo de las fotos ----------
  const mF3d = d => `<section class="pg ic mF3 mF3d st-${d.st}" data-id="${d.id}">${tresFotos(d, false)}
      <div class="f3d-banda"><div><h1>${d.nombre}</h1><p class="lat">${d.segunda}</p></div><div class="f3d-k">${pill(d)}${dif(d)}${mesesTira(d)}</div></div>
      ${rasLinea(d)}<div class="irs">${dondeIco(d)}${olorIco(d)}</div>${toxIco(d)}${clavesIco(d)}${confsIco(d, 3)}${comprIco(d)}${pie(d)}</section>`;

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
  const PROP2 = [
    { k: "F", f: mF, t: "Foto alta", s: "Foto grande y texto en dos columnas",
      idea: "Media página de foto a sangre, con el nombre encima y las otras dos fotos montadas sobre el borde. Debajo, todo el texto seguido y apretado, en dos columnas.",
      gana: ["La foto más grande con casi todo el texto.", "Sencilla: sirve igual para todas las setas."],
      pierde: ["Texto pequeño y seguido, sin listas.", "Gasta tinta (foto a sangre)."] },
    { k: "G", f: mG, t: "Marco clásico", s: "Doble filete con esquinas",
      idea: "Como una lámina de libro antiguo: un marco de doble filete con las esquinas hacia dentro y un rizo en cada una, el nombre centrado con una orla y las fotos con paspartú.",
      gana: ["Elegante, de libro de verdad.", "El marco no gasta casi tinta."],
      pierde: ["El marco quita unos milímetros a cada lado.", "Algo menos de texto que F."] },
    { k: "H", f: mH, t: "Arco y medallones", s: "Lámina de botánica",
      idea: "La foto principal dentro de un arco con doble filo de color y las otras dos en medallones redondos sobre las esquinas. Nombre centrado con orla y el texto en una columna.",
      gana: ["Muy decorativa sin recargar.", "La foto grande se ve entera."],
      pierde: ["El arco recorta las esquinas de la foto.", "Una sola columna: líneas largas."] },
    { k: "I", f: mI, t: "Álbum de campo", s: "Esquineros, cinta y notas a mano",
      idea: "Como un álbum de fotos o un diario de campo: la foto grande un poco torcida con esquineros, las otras dos pegadas con cinta y notas escritas a mano.",
      gana: ["Cercana y divertida; parece hecha a mano.", "Fotos grandes."],
      pierde: ["Las fotos torcidas tapan un poco las otras.", "Menos seria para un libro de seguridad."] },
    { k: "J", f: mJ, t: "Modernista", s: "Esquinas con hojas y cinta",
      idea: "Esquinas con latigazos, hojas y bayas del color del grupo (verde, naranja o rojo), la foto con las esquinas de arriba redondeadas y el nombre en una cinta con picos.",
      gana: ["La más adornada: muy vistosa.", "El color del grupo en el marco avisa sin leer."],
      pierde: ["Mucho adorno en una página pequeña.", "El texto queda más estrecho."] },
    { k: "K", f: mK, t: "Foto de fondo", s: "Toda la página es la foto",
      idea: "La foto ocupa la página entera; el nombre va arriba, sobre la foto, y el texto en un panel blanco abajo, con las otras dos fotos asomando por encima.",
      gana: ["La foto más grande posible.", "Muy llamativa al hojear."],
      pierde: ["Gasta mucha tinta.", "Según la foto, el panel tapa parte de la seta."] }
  ];
  const PROP3 = [
    { k: "F1", f: mF1, t: "Foto alta con iconos", s: "Fotos pequeñas grandes y fila de iconos",
      idea: "La F con las dos fotos pequeñas mucho más grandes. Los rasgos pasan a iconos (láminas, anillo, volva, látex, esporada) con una marca verde o roja; dónde, altitud y olor, cada uno con su icono; las parecidas, con foto.",
      gana: ["Se ve de un vistazo si tiene anillo o volva.", "Casi nada de texto seguido: frases cortas, una por línea."],
      pierde: ["Hay que aprender los iconos (van en la página de «Antes de salir»).", "Algo menos de detalle que la F."] },
    { k: "F2", f: mF2, t: "Tira de fotos", s: "Las tres fotos grandes y ficha técnica",
      idea: "La foto grande arriba y, debajo, las otras dos a todo el ancho, igual de grandes entre sí. Luego una ficha técnica en dos columnas: los rasgos en iconos a la izquierda y dónde y cuándo a la derecha.",
      gana: ["Las fotos pequeñas, las más grandes de todas las propuestas.", "Ficha ordenada como una tabla."],
      pierde: ["Las fotos ocupan media página larga: menos sitio para las parecidas.", "En las fichas largas se quita el detalle de las diferencias."] },
    { k: "F3", f: mF3, t: "Columna de iconos", s: "Tres fotos arriba y los rasgos al lado",
      idea: "Las tres fotos juntas arriba, a sangre (la grande y dos a su lado). Debajo, una columna estrecha con los rasgos en iconos, uno debajo de otro, y al lado el resto: dónde, cómo reconocerla, peligro y parecidas.",
      gana: ["Los rasgos siempre en el mismo sitio, como una tabla para repasar.", "Las tres fotos se ven a la vez."],
      pierde: ["La columna de texto es más estrecha.", "Foto principal algo más estrecha que en F1."] }
  ];
  const PROP4 = [
    { k: "F3a", f: mF3a, t: "Todo a lo ancho", s: "Las tres fotos y el texto a todo el ancho",
      idea: "La F3 sin la columna de iconos: los rasgos en una sola línea con su ✓ o ✗, y debajo dónde, peligro, cómo reconocerla y las parecidas en tres columnas con foto. Si sobra sitio, las fotos crecen.",
      gana: ["Sin huecos: el texto ocupa todo el ancho.", "Las fotos se llevan el sitio que sobra."],
      pierde: ["Las líneas son largas.", "Los rasgos, en texto (más pequeños que los iconos)."] },
    { k: "F3b", f: mF3b, t: "Dos columnas", s: "Bloques que se reparten solos",
      idea: "Los rasgos en una línea y, debajo, los bloques (dónde, peligro, cómo reconocerla, parecidas y compruebe) en dos columnas que se reparten solas para que acaben a la misma altura.",
      gana: ["Líneas cortas y sin huecos.", "Cada bloque entero en una columna."],
      pierde: ["El orden de lectura baja por una columna y sigue en la otra.", "Las parecidas pueden quedar partidas de su título si no caben."] },
    { k: "F3c", f: mF3c, t: "Parecidas al lado", s: "La columna izquierda, para las que se le parecen",
      idea: "La columna de la izquierda ya no lleva iconos: lleva las setas con que se confunde, con foto redonda grande, una debajo de otra. A la derecha, los rasgos en una línea, dónde, peligro, cómo reconocerla y compruebe.",
      gana: ["Las parecidas se ven mucho: fotos grandes.", "La columna se reparte en toda la altura: sin hueco abajo."],
      pierde: ["La columna de la derecha es más estrecha.", "Si solo hay una o dos parecidas, quedan muy separadas."] },
    { k: "F3d", f: mF3d, t: "Banda de color", s: "Fotos limpias y el nombre debajo",
      idea: "Las tres fotos sin nada encima y, justo debajo, una banda del color del grupo con el nombre, la etiqueta, la dificultad y los meses. Luego todo a lo ancho, como la F3a.",
      gana: ["Las fotos se ven enteras, sin el nombre encima.", "La banda de color dice el grupo de un vistazo."],
      pierde: ["La banda ocupa algo de alto.", "Gasta más tinta."] }
  ];
  const D = MUESTRAS.map(id => datos(S.BY[id]));
  const lamina = (cls, html) => { raiz.insertAdjacentHTML("beforeend", `<section class="lam ${cls}">${html}</section>`); return raiz.lastElementChild; };
  const marca = `<p class="lam-pie">Setas esenciales · cuaderno completo A6 · propuestas de maquetación de la ficha · ${new Date().toLocaleDateString("es-ES")}</p>`;
  const letra = p => (p.k === "0" ? "Ahora" : p.k);

  // cada ronda: la comestible con las seis maquetas juntas, cada maqueta a tamaño real y las otras dos setas juntas
  let n = 1;
  // ref: maquetas de antes que salen en las comparativas para tenerlas al lado (sin lámina propia)
  function ronda(nombre, props, ref = []) {
    const todas = [...ref, ...props], cuantas = ["", "una", "dos", "tres", "cuatro", "cinco", "seis"][todas.length] || todas.length;
    const comparativa = d => lamina("cmp", `
      <header class="lam-h"><span class="lam-n">${n++}</span><p class="lam-r">${esc(nombre)}</p><div><h2>${esc(d.nombreTxt)}: las ${cuantas} maquetas</h2><p>La misma ficha (${SEC[d.sec].toLowerCase()}) en cada propuesta, al 60 %. Las láminas siguientes las muestran a tamaño real.</p></div></header>
      <div class="cmp-grid${todas.length <= 4 ? " c2" : ""}">${todas.map(p => `<div class="cmp-c"><p class="cmp-t"><b>${letra(p)}</b> ${esc(p.t)}</p><div class="esc">${p.f(d)}</div></div>`).join("")}</div>${marca}`);
    const tox = n + props.length + 1;
    comparativa(D[0]);
    props.forEach(p => {
      lamina("prop", `
        <aside class="lam-txt">
          <p class="lam-r">${esc(nombre)}</p>
          <span class="lam-k">${letra(p)}</span>
          <h2>${esc(p.t)}</h2><p class="lam-s">${esc(p.s)}</p>
          <p>${esc(p.idea)}</p>
          <h4 class="g">A favor</h4><ul>${p.gana.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <h4 class="p">En contra</h4><ul>${p.pierde.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <p class="lam-nota">Lámina ${n} · tamaño real (A6, 105 × 148 mm). Comestible a la izquierda, mortal a la derecha; la tóxica, en la lámina ${tox}.</p>
        </aside>
        <div class="lam-pgs">${p.f(D[0])}${p.f(D[2])}</div>${marca}`);
      n++;
    });
    comparativa(D[1]);
    comparativa(D[2]);
  }
  // la ronda más nueva primero
  ronda("Cuarta ronda · la F3 sin iconos de rasgos", PROP4, [PROP3[2]]);
  ronda("Tercera ronda · la F con iconos", PROP3, [PROP2[0]]);
  ronda("Segunda ronda · foto grande", PROP2);
  ronda("Primera ronda", PROP);

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
