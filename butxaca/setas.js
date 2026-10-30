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
  const EDICION = "Otoño 2026";
  const PORTADA = { id: "cantharellus-cibarius", papel: "recolectado" };

  const ESENCIAL = DB.especies.filter(e => (e.guias || []).includes("esencial"));
  const BY = Object.fromEntries(ESENCIAL.map(e => [e.id, e]));

  const SEC = {
    guia: { t: "Guía", c: "var(--guide)", y: 9 },
    comestibles: { t: "Comestibles", c: "var(--ok)", y: 29 },
    mortales: { t: "Mortales", c: "var(--deadly)", y: 49 },
    toxicas: { t: "Tóxicas", c: "var(--warn)", y: 69 },
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
  const ORDEN = [...GROUPS.comestibles, ...GROUPS.mortales, ...GROUPS.toxicas];

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
    altres: svg('<circle cx="6" cy="6.3" r="4.6"/><circle cx="4.4" cy="4.6" r=".7" fill="#fff" fill-opacity=".6"/><circle cx="7" cy="5.2" r=".5" fill="#fff" fill-opacity=".6"/>')
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
  const sinNormativa = t => (String(t || "").match(/[^.!?]+[.!?]+(\s|$)/g) || [String(t || "")]).filter(f => !/RD\s?30\/2009|anexo del RD|venta/i.test(f)).join("").trim() || String(t || "");
  const lista = arr =>(arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1]);

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
  const PICK = Object.fromEntries(ESENCIAL.map(e => [e.id, pickPhotos(e)]));
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
        <div class="cv-ed"><span>Cuaderno de bolsillo</span><span>${EDICION}</span></div></div>
      <div class="cv-body">
        <div class="kicker">Cistella Segura · Cataluña</div>
        <h1 class="cv-t">Setas <em>esenciales</em></h1>
        <p class="cv-s">Las ${ESENCIAL.length} setas que hay que conocer en Cataluña: cómo reconocerlas, dónde y cuándo salen, y con qué no confundirlas.</p>
        <div class="cv-stats">
          <span class="st-comestible"><i class="d"></i>${n("comestibles")} comestibles</span>
          <span class="st-mortal"><i class="d"></i>${n("mortales")} mortales</span>
          <span class="st-toxic"><i class="d"></i>${n("toxicas")} tóxicas</span>
        </div>
        <div class="cv-sos"><b>Ante la duda, no la recolecte.</b><span>Emergencias <strong>112</strong><br>Toxicología 24 h <strong>91 562 04 20</strong></span></div>
      </div>`;
  }

  // =========================================================
  // SUMARIO
  // =========================================================
  let tocPage;
  function fillToc(entries) {
    tocPage.insertAdjacentHTML("beforeend", `
      <div class="kicker">Cómo usar este cuaderno</div>
      <h2 class="pt">Sumario</h2>
      <ul class="toc" style="margin-top:2mm">${entries.map(e => `
        <li><span class="sw" style="background:${e.c}"></span><span class="tn">${esc(e.t)}</span><span class="td">${esc(e.d)}</span><span class="tp">${e.n}</span></li>`).join("")}
      </ul>
      <div class="h3">Cómo leer una ficha</div>
      <div class="legend">
        <span class="k"><span class="st-comestible pill">Comestible</span><span class="st-precaucio pill">Condicionada</span></span><span>Condicionada: solo bien cocinada o con reservas.</span>
        <span class="k st-comestible">${dots(1)}<b style="font-size:5.4pt">FÁCIL</b></span><span>Dificultad de identificación: fácil, media o difícil.</span>
        <span class="k st-comestible">${meses([9, 10, 11], [12])}</span><span>Meses en que sale; en claro, solo algunos años.</span>
        <span class="k st-comestible"><span class="fct">${ICON.pineda}${ICON.fulla}${ICON.prat}${ICON.fusta}</span></span><span>Coníferas, frondosas, prados o madera.</span>
        <span class="k"><span class="ref">→ p. 23</span></span><span>Página de la especie con que se confunde.</span>
      </div>
      <p class="disclaimer" style="margin-top:auto"><b>Aviso.</b> Ninguna guía, foto ni aplicación certifica que una seta sea comestible. Ante la duda, consulte a un micólogo con el ejemplar entero.</p>
      ${foot("Sumario")}`);
    fit(tocPage, ["dense"], "sumario");
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

  function mirarPage() {
    const p = newPage("guia");
    const HIM = [["laminas", "lamines"], ["poros", "porus"], ["pliegues", "plecs"], ["aguijones", "agullons"], ["gleba", "altres"]];
    const DESC = { laminas: "Hojas finas", poros: "Una esponja", pliegues: "Venas gruesas", aguijones: "Púas blandas", gleba: "Bola sin sombrero" };
    const formas = HIM.map(([k, ic]) => `<div>${ICON[ic].replace("<svg", '<svg style="color:var(--paper)"')}<b>${esc((V.himenoforo[k] || k).split(/[ (]/)[0])}</b><span>${DESC[k]}</span></div>`).join("");
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
      <div class="formes">${formas}</div>
      <div class="edat-box"><div class="h3">La edad cuenta</div>
        <p class="edat-t">Una comestible vieja o pasada también intoxica. Cójala joven y firme.${serie ? ` (${esc(titulo(serie))})` : ""}</p>
        <div class="edat">${edad}</div></div>
      <p class="redbar" style="margin-top:auto">Láminas blancas + anillo + volva = DESCARTE</p>
      ${foot("Guía · Cómo mirar")}`);
    fit(p, [".edat-t", "dense", ".edat-box"], "mirar");
  }

  function tresPage() {
    const d = html(DB.textos["alertas-intro"]);
    const items = [...d.querySelectorAll("li")].map(li => li.textContent.trim());
    const tres = items.length ? items : [
      "Base del pie: desentierre siempre la base. Una volva en saco o un bulbo con reborde indica una amanita.",
      "Láminas blancas + anillo + volva = descarte inmediato, sea cual sea el color del sombrero.",
      "Setas pequeñas de láminas pardas o de color herrumbre, lepiotas pequeñas y setas pequeñas sobre madera: no se recolectan para comer."
    ];
    const seg = html(DB.textos.seguridad);
    const pruebas = listaTras(seg, /reglas/i).map(partes).filter(([t]) => /prueba|aplicaci/i.test(t));
    const p = newPage("guia");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Lo que evita las intoxicaciones graves</div>
      <h2 class="pt">Tres comprobaciones</h2>
      <p class="ps">Hágalas con cada ejemplar, también con las setas que cree conocer.</p>
      <ol class="tres spread">${tres.map((t, i) => {
        // la idea principal en negrita: hasta los dos puntos, o hasta la primera coma
        let j = t.indexOf(":");
        if (j < 0 || j > 150) j = t.indexOf(",");
        const [b, r] = j > 0 && j < 150 ? [t.slice(0, j), t.slice(j + 1).trim()] : [t, ""];
        return `<li><span class="tn">${i + 1}</span><div><b>${esc(b)}</b>${r ? `<span>${esc(cap(r))}</span>` : ""}</div></li>`;
      }).join("")}</ol>
      ${pruebas.length ? `<div class="h3">No se fíe de</div><ul class="list2">${pruebas.map(([b, r]) => `<li><b>${esc(b)}.</b> <span>${esc(hasta(r, 260))}</span></li>`).join("")}</ul>` : ""}
      ${foot("Guía · Comprobaciones")}`);
    fit(p, [".ps", "dense", p2 => p2.querySelectorAll(".list2 span").forEach(s => (s.textContent = primera(s.textContent, 150)))], "tres");
  }

  function indicePages(list, titulo, sub, leyenda, porPagina = 35) {
    for (let i = 0; i < list.length; i += porPagina) {
      const trozo = list.slice(i, i + porPagina);
      const filas = Math.ceil(porPagina / 5);
      const p = newPage("guia");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">Índice visual${i ? " · continuación" : ""}</div>
        <h2 class="pt">${esc(titulo)}</h2>
        ${i ? "" : `<p class="ps">${esc(sub)}</p>`}
        ${leyenda || ""}
        <div class="ix-grid" style="grid-template-rows:repeat(${filas},1fr)">${trozo.map(e => `
          <div class="ix st-${EST[e.comestibilidad.cat].st}"><div class="ix-im"><img src="${thumb(e.id)}" alt=""></div>
            <div class="ix-n"><span>${tituloHTML(e)}</span>${ref(e.id, true)}</div></div>`).join("")}
          ${"<div></div>".repeat(Math.max(0, filas * 5 - trozo.length))}
        </div>
        ${foot("Índice visual")}`);
      fit(p, [".ps"], "indice " + titulo);
    }
  }

  function calendarioPages() {
    const list = GROUPS.comestibles;
    const mitad = Math.ceil(list.length / 2);
    [list.slice(0, mitad), list.slice(mitad)].forEach((trozo, k) => {
      const p = newPage("guia");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">Cuándo salir${k ? " · continuación" : ""}</div>
        <h2 class="pt">Calendario</h2>
        ${k ? "" : `<p class="ps">Meses en que sale cada comestible y lo difícil que es identificarla.</p>`}
        <div class="cal cal-es" style="grid-template-rows:auto repeat(${trozo.length},1fr)">
          <span class="hd">Seta</span>
          <span class="hd mes" style="padding-bottom:.6mm">${MESL.map(l => `<span style="background:none;color:var(--muted);height:auto">${l}</span>`).join("")}</span>
          <span class="hd" style="text-align:right">Dific.</span>
          ${trozo.map(e => `<div class="row st-${EST[e.comestibilidad.cat].st}"><span class="cn"><span>${tituloHTML(e)}</span>${ref(e.id, true)}</span>${meses(e.fenologia?.meses, e.fenologia?.excepcional)}<span class="pl cal-dif">${dots((DIF[e.identificacion?.dificultad] || [2])[0])}</span></div>`).join("")}
        </div>
        <p class="cal-note"><span class="st-comestible">${meses([10], [11])}</span> oscuro: temporada · claro: solo algunos años</p>
        ${foot("Guía · Calendario")}`);
      fit(p, [".ps", "dense"], "calendario");
    });
  }

  function arbolesPages() {
    const items = DB.arboles.map(a => {
      const setas = (a.setas || []).filter(s => BY[s.id] && s.rel !== "ocasional").map(s => BY[s.id]);
      if (!setas.length) return null;
      const nm = e => `<span class="nm">${tituloHTML(e)}${ref(e.id, true)}</span>`;
      const ok = setas.filter(comestible), ko = setas.filter(e => !comestible(e));
      return `<article class="bosc"><h3>${esc(cap(a.nombres.es[0]))} <small>${esc(a.nombres.ca[0] || "")}</small></h3>
        <p class="curt">${esc(primera(a.reconocer?.distancia, 120))}</p>
        ${ok.length ? `<p class="ll ok"><span class="lab">Busque</span>${ok.map(nm).join(", ")}</p>` : ""}
        ${ko.length ? `<p class="ll ko"><span class="lab">Cuidado</span>${ko.map(nm).join(", ")}</p>` : ""}
      </article>`;
    }).filter(Boolean);
    flow(items, more => {
      const p = newPage("guia");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">Dónde buscar${more ? " · continuación" : ""}</div>
        <h2 class="pt">Árboles y sus setas</h2>
        ${more ? "" : `<p class="ps">Muchas setas viven unidas a las raíces de un árbol: reconocerlo es el primer paso.</p>`}
        <div class="flow"></div>${foot("Guía · Árboles")}`);
      return p;
    }, "árboles");
  }

  // =========================================================
  // FICHA
  // =========================================================
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
      <span class="fct hab">${habitatIcons(e).map(([ic]) => ICON[ic]).join("")}</span></div>`;
    const claves = (e.identificacion?.claves || []);
    const clavesHTML = claves.length ? `<div class="checks${ok ? "" : " alarm"}"><h3>${ok ? "Cómo reconocerla" : "Rasgos de alarma"}</h3><ul>${claves.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>` : "";
    const arb = arboles(e);
    const donde = primera(e.ecologia?.donde_mirar || e.ecologia?.vegetacion, 150);
    const dondeHTML = (arb || donde) ? `<p class="donde"><span class="lab">Dónde</span>${arb ? `Con ${esc(arb)}. ` : ""}${esc(donde)}</p>` : "";
    const t = e.toxicidad;
    const tox = t ? `<p class="perill"><span class="lab">${esc(t.sindrome)}</span>Síntomas ${esc(t.latencia)}. ${esc(primera(t.sintomas, 170))}</p>` : "";
    const confs = [...(e.confusiones || [])]
      .sort((a, b) => (ok ? SEV[a.peligro] - SEV[b.peligro] : SEV[b.peligro] - SEV[a.peligro]))
      .slice(0, 3);
    const confHTML = confs.length ? `<div class="conf"><h3>${ok ? "No la confunda con" : "Se confunde con"}</h3><ul>${confs.map(c =>
      `<li class="cf"><b>${nombreConf(c)}</b> <span class="cf-tag cf-${c.peligro}">${PEL[c.peligro] || c.peligro}</span> ${esc(primera(c.diferencia, 170))} ${c.id && c.id !== e.id ? ref(c.id) : ""}</li>`).join("")}</ul></div>` : "";
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
      <div class="txt">${clavesHTML}${tox}${dondeHTML}${confHTML}${truc}</div>
      ${foot(label)}`);
    fit(p, ["tight", ".lede", "dense", quitaUltimo(".conf li"), ".truc", "denser", quitaUltimo(".checks li"), ".donde"], e.id);
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

  function casaPage() {
    const seg = html(DB.textos.seguridad);
    const cocina = listaTras(seg, /conservaci|cocina/i).map(li => li.textContent.trim());
    const bosque = listaTras(seg, /bosque/i).map(li => li.textContent.trim());
    const p = newPage("anexo");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">En casa y en el monte</div>
      <h2 class="pt">Conservar y cocinar</h2>
      <ul class="list2 spread" style="flex-grow:${cocina.length}">${cocina.map(t => `<li>${esc(hasta(t, 210))}</li>`).join("")}</ul>
      <div class="h3">Seguridad en el bosque</div>
      <ul class="list2 spread" style="flex-grow:${bosque.length}">${bosque.map(t => `<li>${esc(hasta(t, 170))}</li>`).join("")}</ul>
      ${foot("Anexo · En casa")}`);
    fit(p, ["dense", p2 => p2.querySelectorAll(".list2 li").forEach(li => (li.textContent = primera(li.textContent, 140)))], "casa");
  }

  function hallazgosPage(first) {
    const p = newPage("anexo");
    const N = 13;
    let cells = `<span class="lh">Fecha</span><span class="lh">Lugar y bosque</span><span class="lh">Seta y notas</span>`;
    for (let i = 0; i < N; i++) cells += `<span class="lc"></span><span class="lc"></span><span class="lc"></span>`;
    p.insertAdjacentHTML("beforeend", `
      ${first ? `<div class="kicker">Cuaderno de campo</div><h2 class="pt">Mis hallazgos</h2>
      <p class="log-hint">Anótelo en el bosque: dónde, cuándo y quién lo confirmó.</p>` : `<div class="kicker">Mis hallazgos</div>`}
      <div class="log" style="grid-template-rows:auto repeat(${N}, 1fr)">${cells}</div>
      ${foot("Mis hallazgos")}`);
    return p;
  }

  function glosarioPages() {
    const d = html(DB.textos.glosario);
    const items = [...d.querySelectorAll("li")].map(partes).map(([t, r]) => `<p><b>${esc(t)}</b>${esc(r)}</p>`);
    flow(items, more => {
      const p = newPage("anexo");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">Palabras de setero${more ? " · continuación" : ""}</div>
        <h2 class="pt">Glosario</h2>
        <div class="flow glossa"></div>${foot("Glosario")}`);
      return p;
    }, "glosario");
  }

  function alfaPages() {
    const rows = [];
    const seen = new Set();
    const add = (n, e, tipo) => { const k = n.toLowerCase() + "|" + e.id; if (!n || seen.has(k)) return; seen.add(k); rows.push({ n: cap(n), e, tipo }); };
    for (const e of ORDEN) {
      add(sinNombre(e) ? e.nombre : titulo(e), e, sinNombre(e) ? "sci" : "main");
      e.nombres.ca.slice(1).forEach(n => add(n, e, "alt"));
      e.nombres.es.forEach(n => add(n, e, "alt"));
      if (!sinNombre(e)) add(e.nombre, e, "sci");
    }
    rows.sort((a, b) => a.n.localeCompare(b.n, "es", { sensitivity: "base" }));
    const items = [];
    let letra = "";
    for (const r of rows) {
      const L = r.n.normalize("NFD").charAt(0).toUpperCase();
      if (L !== letra) { letra = L; items.push(`<p class="lt">${L}</p>`); }
      const st = EST[r.e.comestibilidad.cat].st;
      const nombre = r.tipo === "sci" ? `<i>${esc(r.n)}</i>` : esc(r.n);
      items.push(`<p class="st-${st}${r.tipo === "main" ? "" : " alt"}"><i class="d"></i><span>${nombre}</span>${ref(r.e.id, true)}</p>`);
    }
    flow(items, more => {
      const p = newPage("anexo");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">Todos los nombres${more ? " · continuación" : ""}</div>
        <h2 class="pt">Índice alfabético</h2>
        ${more ? "" : `<p class="ps">En negrita, el nombre de la ficha. En gris, nombres en castellano o catalán y el científico.</p>`}
        <div class="flow alfa" style="font-size:5.6pt"></div>${foot("Índice")}`);
      return p;
    }, "índice alfabético");
  }

  function creditosPages() {
    const lines = [];
    const quien = fs => [...new Set(fs.map(f => `${esc(f.autor || "Propia")}${f.licencia ? ` (${esc(f.licencia)})` : ""}`))].join(" · ");
    const ex = {};
    for (const [donde, f] of EXTRA) (ex[donde] ||= []).push(f);
    for (const [donde, fs] of Object.entries(ex)) lines.push(`<p><b>${esc(donde)}</b> ${quien(fs)}</p>`);
    for (const e of ORDEN) if (PICK[e.id].length) lines.push(`<p><b>${tituloHTML(e)}</b> ${quien(PICK[e.id])}</p>`);
    const intro = `<p class="note" style="margin-bottom:2mm">Fotos de observaciones de <b>iNaturalist</b> con licencia Creative Commons; el enlace a cada original está en la guía. Muchas son CC BY-NC: este cuaderno es para uso personal o sin ánimo de lucro. Textos y datos: guía <b>Setas de Cataluña</b> (Cistella Segura) · nombres según Catalogue of Life; registros de GBIF e iNaturalist.</p>`;
    let first = true;
    const mk = () => {
      const p = newPage("anexo");
      p.insertAdjacentHTML("beforeend", `${first ? `<div class="kicker">Créditos</div><h2 class="pt" style="font-size:13pt">Fotos y fuentes</h2>${intro}` : ""}<div class="cred"></div>${foot("Créditos")}`);
      first = false;
      return p;
    };
    let p = mk();
    let box = p.querySelector(".cred");
    for (const l of lines) {
      box.insertAdjacentHTML("beforeend", l);
      if (overflows(p)) { box.lastElementChild.remove(); p = mk(); box = p.querySelector(".cred"); box.insertAdjacentHTML("beforeend", l); }
    }
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
    root.setProperty("--grad-paper", gradPNG("rgba(251,248,241,0)", "rgba(251,248,241,1)"));

    portada();
    tocPage = newPage("guia", "toc-page");
    reglasPage();
    mirarPage();
    tresPage();
    indicePages(GROUPS.comestibles, "Las comestibles", "En el orden del cuaderno: las parecidas, juntas. El número es la página.", "", 25);
    indicePages([...GROUPS.mortales, ...GROUPS.toxicas], "Las de alerta", "Mortales y tóxicas: conózcalas para no recolectarlas.",
      `<div class="ix-legend"><span class="st-mortal"><i class="d"></i>Mortal</span><span class="st-toxic"><i class="d"></i>Tóxica</span><span class="st-precaucio"><i class="d"></i>No comestible</span></div>`, 35);
    calendarioPages();
    arbolesPages();
    ORDEN.forEach(fichaPage);
    sindromesPages();
    casaPage();
    const primeraNota = hallazgosPage(true);
    hallazgosPage(false);
    glosarioPages();
    alfaPages();
    creditosPages();
    sosPage();

    // páginas de notas extra para que el total sea múltiplo de 4
    const extra = (4 - (book.children.length % 4)) % 4;
    let tras = primeraNota.nextElementSibling;
    for (let i = 0; i < extra; i++) {
      const p = hallazgosPage(false);
      book.insertBefore(p, tras.nextElementSibling);
      tras = p;
    }

    const pages = [...book.children];
    pages.forEach((p, i) => {
      const n = i + 1;
      p.dataset.n = n;
      p.classList.add(n % 2 ? "recto" : "verso");
      const pn = p.querySelector(".pn");
      if (pn) pn.textContent = n;
    });

    const first = sel => { const p = pages.find(sel); return p ? p.dataset.n : ""; };
    const secFirst = s => first(p => p.dataset.sec === s && !p.classList.contains("toc-page"));
    fillToc([
      { t: "Guía", d: "reglas, cómo mirar, índice, calendario, árboles", c: SEC.guia.c, n: secFirst("guia") },
      { t: "Comestibles", d: `${GROUPS.comestibles.length} especies`, c: SEC.comestibles.c, n: secFirst("comestibles") },
      { t: "Mortales", d: `${GROUPS.mortales.length} especies`, c: SEC.mortales.c, n: secFirst("mortales") },
      { t: "Tóxicas", d: `${GROUPS.toxicas.length} especies`, c: SEC.toxicas.c, n: secFirst("toxicas") },
      { t: "Síndromes", d: "según cuándo aparecen los síntomas", c: SEC.anexo.c, n: secFirst("anexo") },
      { t: "Mis hallazgos", d: "para anotar", c: SEC.anexo.c, n: first(p => p.querySelector(".log")) },
      { t: "Glosario e índice", d: "palabras y todos los nombres", c: SEC.anexo.c, n: first(p => p.querySelector(".glossa")) },
      { t: "SOS", d: "si alguien se encuentra mal", c: "var(--deadly)", n: secFirst("sos") }
    ]);
    const tpn = tocPage.querySelector(".pn");
    if (tpn) tpn.textContent = tocPage.dataset.n;

    document.querySelectorAll(".ref[data-ref]").forEach(r => {
      const t = PAGE_OF[r.dataset.ref];
      if (!t) { r.remove(); return; }
      r.textContent = r.dataset.fmt === "n" ? t.dataset.n : `→ p. ${t.dataset.n}`;
    });

    REPORT.pages = pages.length;
    window.BUILD_REPORT = REPORT;
    document.dispatchEvent(new CustomEvent("llibre-llest"));
    document.body.dataset.ready = "1";
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
