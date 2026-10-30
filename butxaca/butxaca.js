// Cistella Segura · Quadern de butxaca (A6)
// Munta el llibre a partir de dades.js (les dades de la web) i textos.js.
"use strict";
(() => {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const BY = Object.fromEntries(BOLETS.map(b => [b.id, b]));
  const SRC = s => "../" + s;
  const book = document.getElementById("book");
  const PAGE_OF = {};
  const REPORT = { overflow: [] };

  // ---------- configuracio ----------
  const EDICIO = "Tardor 2026";
  const COVER = { id: "cep", i: 8 };
  // Fotos que surten fora de les fitxes (per als credits)
  const EXTRA = [];
  // Fotos escollides a ma per a alguns bolets (index dins FOTOS[id]); la resta s'escullen soles.
  const PHOTO_PICK = {};

  const SEC = {
    guia: { t: "Guia", c: "var(--guide)", y: 9 },
    comestibles: { t: "Comestibles", c: "var(--ok)", y: 29 },
    mortals: { t: "Mortals", c: "var(--deadly)", y: 49 },
    toxics: { t: "Tòxics", c: "var(--warn)", y: 69 },
    cara: { t: "Cara a cara", c: "var(--accent)", y: 89 },
    annex: { t: "A casa", c: "var(--annex)", y: 109 },
    sos: { t: "SOS", c: "var(--ink)", y: 126 }
  };
  const EST = {
    comestible: { pill: "Comestible", sec: "comestibles" },
    mortal: { pill: "Mortal", sec: "mortals" },
    toxic: { pill: "Tòxic", sec: "toxics" },
    precaucio: { pill: "Precaució", sec: "toxics" }
  };
  const NIV = { 1: "Fàcil", 2: "Compte", 3: "Expert" };
  const MESL = ["G", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const FORMA = { lamines: "Làmines", porus: "Porus", plecs: "Plecs o llis", agullons: "Agullons", altres: "Bola o corall" };

  // ---------- icones ----------
  const svg = (d, vb = "0 0 12 12") => `<svg viewBox="${vb}" aria-hidden="true">${d}</svg>`;
  const ICON = {
    pineda: svg('<path d="M6 .6 9.3 5.1H7.7l2.7 3.7H6.9V11.4H5.1V8.8H1.6l2.7-3.7H2.7z"/>'),
    fulla: svg('<path d="M6 .7c2.6 0 4.5 1.9 4.5 4.3 0 2.1-1.6 3.7-3.6 3.9v2.5H5.1V8.9C3.1 8.7 1.5 7.1 1.5 5 1.5 2.6 3.4.7 6 .7z"/>'),
    prat: svg('<path d="M1.2 11.3c.2-2.8 1-5 2.3-6.7-.5 2.2.1 4.4.6 6.7zm3.1 0c.1-3.3.9-6.2 2.6-8.9-.6 3.2-.2 6 .4 8.9zm3.5 0c.2-2.5 1-4.6 2.4-6.2-.4 2-.1 4.1.3 6.2zM.6 11.1h10.8v.8H.6z"/>'),
    fusta: svg('<path d="M2.6 3.8h6.8a2.6 2.6 0 0 1 0 5.2H2.6a2.6 2.6 0 0 1 0-5.2z"/><ellipse cx="9.4" cy="6.4" rx="1.5" ry="1.9" fill="#fff" fill-opacity=".6"/>'),
    pluja: svg('<path d="M6 .6S2.2 5.2 2.2 7.6a3.8 3.8 0 0 0 7.6 0C9.8 5.2 6 .6 6 .6z"/>'),
    lamines: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><path d="M1.9 5.6v2.1M3.2 5.6v2.8M4.6 5.6v3.2M6 5.6v3.4M7.4 5.6v3.2M8.8 5.6v2.8M10.1 5.6v2.1" stroke="currentColor" stroke-width=".7" fill="none"/>'),
    porus: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><rect x="1.4" y="5.8" width="9.2" height="3.6" rx=".8"/><g fill="#fff"><circle cx="3" cy="7.6" r=".55"/><circle cx="4.7" cy="7.6" r=".55"/><circle cx="6.4" cy="7.6" r=".55"/><circle cx="8.1" cy="7.6" r=".55"/><circle cx="9.5" cy="7.6" r=".45"/></g>'),
    plecs: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><path d="M2.6 5.6c.4 1.2-.2 2.4.3 3.8M4.6 5.6c.4 1.4-.3 2.8.2 4.4M6.6 5.6c.4 1.4-.3 2.8.2 4.4M8.6 5.6c.4 1.2-.2 2.4.3 3.8" stroke="currentColor" stroke-width=".75" fill="none"/>'),
    agullons: svg('<path d="M.6 5.2C1.5 2.3 3.6.9 6 .9s4.5 1.4 5.4 4.3z"/><path d="M1.8 5.6l.5 2.4.5-2.4zM3.6 5.6l.5 3 .5-3zM5.5 5.6l.5 3.3.5-3.3zM7.4 5.6l.5 3 .5-3zM9.2 5.6l.5 2.4.5-2.4z"/>'),
    altres: svg('<circle cx="6" cy="6.3" r="4.6"/><circle cx="4.4" cy="4.6" r=".7" fill="#fff" fill-opacity=".6"/><circle cx="7" cy="5.2" r=".5" fill="#fff" fill-opacity=".6"/>')
  };
  const HAB = { pineda: "Pineda", fulla: "Bosc de fulla", prat: "Prat", fusta: "Sobre fusta" };

  // ---------- utilitats ----------
  const overflows = p => p.scrollHeight > p.clientHeight + 1;

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
  // Referencia a la pagina d'un bolet. El text provisional te la mateixa amplada que el definitiu.
  const ref = (id, short = false) => BY[id] ? `<span class="ref" data-ref="${id}"${short ? ' data-fmt="n"' : ""}>${short ? "00" : "→ p. 00"}</span>` : "";

  function fit(p, steps, name) {
    for (const s of steps) {
      if (!overflows(p)) return;
      if (s.startsWith(".")) p.querySelectorAll(s).forEach(n => n.remove());
      else p.classList.add(s);
    }
    if (overflows(p)) REPORT.overflow.push(`${name}: +${p.scrollHeight - p.clientHeight}px`);
  }

  // Com flow(), pero a cada pagina hi posa el primer bloc que encara hi capi (manté l'ordre tant com pot).
  function pack(items, mkPage, name) {
    const rest = [...items];
    let more = false;
    while (rest.length) {
      const p = mkPage(more);
      more = true;
      const box = p.querySelector(".flow");
      for (let i = 0; i < rest.length;) {
        box.insertAdjacentHTML("beforeend", rest[i]);
        if (overflows(p) && box.children.length > 1) { box.lastElementChild.remove(); i++; }
        else rest.splice(i, 1);
      }
      if (overflows(p)) REPORT.overflow.push(`${name}: bloc massa llarg`);
    }
  }

  // Omple pagines amb blocs; quan un no hi cap, obre una pagina nova.
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
      if (overflows(p)) REPORT.overflow.push(`${name}: bloc massa llarg`);
    }
  }

  function shortCap(c, max) {
    c = String(c || "").trim();
    if (c.length <= max) return c;
    const i = c.indexOf(":");
    if (i > 3 && i <= max) return c.slice(0, i);
    const cut = c.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]$/, "") + "…";
  }

  function pickPhotos(id) {
    const fs = FOTOS[id] || [];
    if (PHOTO_PICK[id]) return PHOTO_PICK[id].map(i => fs[i]).filter(Boolean);
    if (!fs.length) return [];
    const main = fs.find(f => f.t === "bo") || fs[0];
    const out = [main];
    const take = t => { const f = fs.find(x => x.t === t && !out.includes(x)); if (f) out.push(f); };
    take("detall");
    if (out.length < 3) take("jove");
    for (const t of ["detall", "habitat", "color", "cistella", "vell", "meva", "podrit"]) { if (out.length >= 3) break; take(t); }
    return out.slice(0, 3);
  }
  const PICK = Object.fromEntries(BOLETS.map(b => [b.id, pickPhotos(b.id)]));
  const thumb = id => { const f = PICK[id]?.[0]; return f ? SRC(f.th || f.src) : ""; };
  const months = m => `<span class="mes">${MESL.map((l, i) => `<span class="${(m || []).includes(i + 1) ? "on" : ""}">${l}</span>`).join("")}</span>`;
  const dots = (n, cls = "lvl") => `<span class="${cls}">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`;

  const GROUPS = {
    comestible: BOLETS.filter(b => b.estat === "comestible"),
    mortal: BOLETS.filter(b => b.estat === "mortal"),
    toxic: BOLETS.filter(b => b.estat === "toxic"),
    precaucio: BOLETS.filter(b => b.estat === "precaucio")
  };

  // =========================================================
  // PORTADA
  // =========================================================
  function cover() {
    const p = newPage(null, "cover");
    const f = (FOTOS[COVER.id] || [])[COVER.i];
    REPORT.cover = f;
    p.innerHTML = `
      <div class="cv-img">${f ? `<img src="${SRC(f.src)}" alt="">` : ""}
        <div class="cv-ed"><span>Quadern de butxaca</span><span>${EDICIO}</span></div></div>
      <div class="cv-body">
        <div class="kicker">Bolets de Catalunya</div>
        <h1 class="cv-t">Cistella <em>Segura</em></h1>
        <p class="cv-s">Els ${BOLETS.length} bolets dels boscos catalans: com es reconeixen, on i quan surten, i amb quin bessó perillós no els has de confondre.</p>
        <div class="cv-stats">
          <span class="st-comestible"><i class="d"></i>${GROUPS.comestible.length} comestibles</span>
          <span class="st-mortal"><i class="d"></i>${GROUPS.mortal.length} mortals</span>
          <span class="st-toxic"><i class="d"></i>${GROUPS.toxic.length + GROUPS.precaucio.length} tòxics o de precaució</span>
        </div>
        <div class="cv-sos"><b>Si dubtes, no te'l mengis.</b><span>Emergències <strong>112</strong><br>Toxicologia 24 h <strong>91 562 04 20</strong></span></div>
      </div>`;
  }

  // =========================================================
  // SUMARI (s'omple al final, quan ja hi ha numeros de pagina)
  // =========================================================
  let tocPage;
  function tocShell() {
    tocPage = newPage("guia", "toc-page");
  }
  function fillToc(entries) {
    const st = (cls, extra = "") => `<span class="${cls}" style="${extra}"></span>`;
    tocPage.insertAdjacentHTML("beforeend", `
      <div class="kicker">Com fer servir aquest quadern</div>
      <h2 class="pt">Sumari</h2>
      <ul class="toc" style="margin-top:2mm">${entries.map(e => `
        <li>${st("sw", `background:${e.c}`)}<span class="tn">${esc(e.t)}</span><span class="td">${esc(e.d)}</span><span class="tp">${e.n}</span></li>`).join("")}
      </ul>
      <div class="h3">Com llegir una fitxa</div>
      <div class="legend">
        <span class="k"><span class="st-comestible pill">Comestible</span></span><span>i com de bo és: <i>Excel·lent, Molt bo, Bo…</i></span>
        <span class="k st-comestible">${dots(1)}<b style="font-size:5.4pt">FÀCIL</b></span><span>Nivell: ●○○ per començar, ●●○ amb compte, ●●● només amb expert.</span>
        <span class="k st-comestible">${months([9, 10, 11])}</span><span>Mesos en què surt.</span>
        <span class="k st-comestible"><span class="fct">${ICON.pluja}<b>10–25 d</b></span></span><span>Dies després d'una bona pluja.</span>
        <span class="k"><span class="ref">→ p. 23</span></span><span>Pàgina del bolet amb què es confon.</span>
        <span class="k"><span class="pill st-mortal">Mortal</span><span class="pill st-toxic">Tòxic</span></span><span>Pestanyes de color al marge: cada secció.</span>
      </div>
      <p class="disclaimer" style="margin-top:auto"><b>Avís.</b> Aquest quadern és per aprendre i no substitueix la revisió d'un micòleg. Si dubtes, no te'l mengis.</p>
      ${foot("Sumari")}`);
  }

  // =========================================================
  // GUIA
  // =========================================================
  function normesPage() {
    const p = newPage("guia");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Abans de sortir</div>
      <h2 class="pt">Les 10 normes d'or</h2>
      <p class="ps">Cada tardor hi ha intoxicacions greus a Catalunya, gairebé sempre per confondre un bolet conegut amb un bessó.</p>
      <ol class="normes spread">${NORMES.map(([b, s], i) => `<li><span class="nn">${i + 1}</span><div><b>${esc(b)}</b><span>${esc(s)}</span></div></li>`).join("")}</ol>
      <p class="motxilla" style="margin-top:2mm"><span class="hand">A la motxilla:</span>${esc(MOTXILLA)}</p>
      ${foot("Guia · Normes")}`);
    fit(p, ["dense"], "normes");
  }

  function mirarPage() {
    const p = newPage("guia");
    const formes = ["lamines", "porus", "plecs", "agullons", "altres"].map(k => {
      const f = FORMES.find(x => x.k === k) || { t: FORMA[k], d: "" };
      return `<div>${ICON[k].replace("<svg", '<svg style="color:var(--paper)"')}<b>${esc(f.t)}</b><span>${esc(f.d)}</span></div>`;
    }).join("");
    // L'edat: la serie del cep (jove, al punt, vell, passat)
    const serie = (EDAT.find(x => /^Cep/.test(x.t)) || EDAT[0]).s;
    const STAGE = [["Jove", true], ["Al seu punt", true], ["Vell", false], ["Passat", false]];
    const edat = `<div class="edat-box"><div class="h3">L'edat compta</div>
      <p class="edat-t">Un comestible vell o passat també intoxica. Cull-lo jove i ferm.</p>
      <div class="edat">${serie.slice(0, 4).map(([id, ix], i) => {
        const f = (FOTOS[id] || [])[ix];
        if (!f) return "";
        EXTRA.push(["Com mirar · l'edat", f]);
        const [t, ok] = STAGE[i];
        return `<figure><img src="${SRC(f.th || f.src)}" alt=""><figcaption><b class="${ok ? "" : "no"}">${ok ? "✓" : "✕"}</b> ${t}</figcaption></figure>`;
      }).join("")}</div></div>`;
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Abans del nom</div>
      <h2 class="pt">Com mirar un bolet</h2>
      <p class="ps">Sis coses, sempre en aquest ordre. Si en falta una, no el pots identificar.</p>
      <svg class="anat" viewBox="0 0 200 112" aria-hidden="true">
        <defs><pattern id="gl" width="2.2" height="12" patternUnits="userSpaceOnUse"><path d="M1.1 0V12" stroke="#9a7650" stroke-width=".45"/></pattern></defs>
        <path d="M24 99H138" stroke="#8b6b4a" stroke-width=".7" stroke-dasharray="2.4 1.8"/>
        <text x="26" y="96" class="hint">terra</text>
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
        <text x="152" y="16"><tspan class="n">1</tspan> Barret</text>
        <text x="152" y="40"><tspan class="n">2</tspan> A sota</text>
        <text x="152" y="47" class="hint">làmines, porus…</text>
        <text x="152" y="63"><tspan class="n">3</tspan> Anell</text>
        <text x="152" y="83"><tspan class="n">4</tspan> Peu</text>
        <text x="152" y="101" class="r"><tspan class="n r">5</tspan> Volva</text>
        <text x="152" y="108" class="hint">sac, sovint enterrat</text>
        <text x="20" y="72"><tspan class="n">6</tspan> Carn</text>
        <text x="20" y="79" class="hint">talla'l i mira</text>
      </svg>
      <ol class="mirar">${MIRAR.map(([t, d], i) => `<li><span class="nn">${i + 1}</span><span><b>${esc(t)}.</b> ${esc(d)}</span></li>`).join("")}</ol>
      <div class="h3">Què hi ha sota el barret</div>
      <div class="formes">${formes}</div>
      ${edat}
      <p class="redbar" style="margin-top:auto">Làmines blanques + anell + volva = FORA</p>
      ${foot("Guia · Com mirar")}`);
    fit(p, [".edat-t", "dense", ".edat-box"], "mirar");
  }

  function descartsPage() {
    const p = newPage("guia");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Descarts ràpids</div>
      <h2 class="pt">Si en veus un, fora</h2>
      <p class="ps">No hi ha cap regla per saber si un bolet és bo, però sí per saber quan deixar-lo.</p>
      <ul class="desc-list">${DESCARTS.map(([t, d, id]) => `
        <li>${id ? `<span class="th"><img src="${thumb(id)}" alt=""></span>` : `<span class="th x">✕</span>`}
          <div><b>${esc(t)}</b><span>${esc(d)}</span></div>${id ? ref(id) : "<span></span>"}</li>`).join("")}
      </ul>
      <p class="note" style="margin-top:1.6mm">Superar els descarts no vol dir que sigui comestible: continua amb la seva pàgina.</p>
      ${foot("Guia · Descarts")}`);
    fit(p, [".note", "dense"], "descarts");
  }

  function indexPage(list, title, sub, legend) {
    const p = newPage("guia");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Índex visual</div>
      <h2 class="pt">${esc(title)}</h2>
      <p class="ps">${esc(sub)}</p>
      ${legend || ""}
      <div class="ix-grid">${list.map(b => `
        <div class="ix st-${b.estat}"><div class="ix-im"><img src="${thumb(b.id)}" alt=""></div>
          <div class="ix-n"><span>${esc(b.nom)}</span>${ref(b.id, true)}</div></div>`).join("")}
      </div>
      ${foot("Índex visual")}`);
    fit(p, [".ps"], "index " + title);
  }

  function calendarPage() {
    const p = newPage("guia");
    const MAXD = 25;
    const pct = d => (Math.min(d, MAXD) / MAXD * 100).toFixed(1) + "%";
    const bar = id => {
      const r = PLUJA[id];
      if (!r) return `<span class="pl"></span>`;
      return `<span class="pl"><span class="axis"></span><i style="left:${pct(r[0])};width:calc(${pct(r[1])} - ${pct(r[0])})"></i><b style="left:${pct(r[2])}"></b></span>`;
    };
    let rows = "";
    for (const n of [1, 2, 3]) {
      rows += `<div class="grp">${NIV[n]}</div>`;
      rows += GROUPS.comestible.filter(b => b.nivell === n).map(b => `
        <div class="row st-comestible"><span class="cn"><span>${esc(b.nom)}</span>${ref(b.id, true)}</span>${months(b.mesos)}${bar(b.id)}</div>`).join("");
    }
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Quan sortir</div>
      <h2 class="pt">Calendari i pluja</h2>
      <p class="ps">Els comestibles: mesos en què surten i quants dies després d'una bona pluja.</p>
      <div class="cal">
        <span class="hd">Bolet</span>
        <span class="hd mes" style="padding-bottom:.6mm">${MESL.map(l => `<span style="background:none;color:var(--muted);height:auto">${l}</span>`).join("")}</span>
        <span class="hd"><span class="pl-scale"><span style="left:0;transform:none">0</span><span style="left:40%">10</span><span style="left:80%">20 d</span></span></span>
        ${rows}
      </div>
      <p class="cal-note"><span><span class="pl"><span class="axis"></span><i style="left:15%;width:50%"></i><b style="left:40%"></b></span> de quan a quan surt · ● el més habitual</span></p>
      ${foot("Guia · Calendari")}`);
    fit(p, [".ps", "dense"], "calendari");
  }

  function boscosPages() {
    const nm = id => BY[id] ? `<span class="nm">${esc(BY[id].nom)}${ref(id, true)}</span>` : "";
    const items = BOSCOS.map(b => `
      <article class="bosc"><h3>${esc(b.nom)} <small>${esc(b.alt || "")}</small></h3>
        <p class="curt">${esc(b.curt)}</p>
        <p class="ll ok"><span class="lab">Busca</span>${(b.bons || []).map(nm).join(", ")}</p>
        <p class="ll ko"><span class="lab">Compte</span>${(b.compte || []).map(nm).join(", ")}</p>
      </article>`);
    flow(items, more => {
      const p = newPage("guia");
      p.insertAdjacentHTML("beforeend", `
        <div class="kicker">On buscar${more ? " · continuació" : ""}</div>
        <h2 class="pt">${more ? "Tipus de bosc" : "Tipus de bosc"}</h2>
        ${more ? "" : `<p class="ps">Què hi surt i què hi has de vigilar. El número és la pàgina del bolet.</p>`}
        <div class="flow"></div>${foot("Guia · On buscar")}`);
      return p;
    }, "boscos");
  }

  // =========================================================
  // FITXA DE BOLET
  // =========================================================
  function figure(f, cls, max) {
    return `<figure class="${cls}"><img src="${SRC(f.src)}" alt="">${f.cap ? `<figcaption>${esc(shortCap(f.cap, max))}</figcaption>` : ""}</figure>`;
  }
  function photosHTML(ph) {
    if (!ph.length) return "";
    if (ph.length === 1) return `<div class="ph one">${figure(ph[0], "ph-main", 120)}</div>`;
    if (ph.length === 2) return `<div class="ph two">${figure(ph[0], "ph-main", 90)}${figure(ph[1], "ph-a", 60)}</div>`;
    return `<div class="ph">${figure(ph[0], "ph-main", 96)}${figure(ph[1], "ph-a", 52)}${figure(ph[2], "ph-b", 52)}</div>`;
  }
  function confItem(c, own) {
    const t = String(c.t || "");
    let html;
    const i = t.indexOf(":");
    if (i > 0 && i < 70) html = `<b>${esc(t.slice(0, i))}</b>${esc(t.slice(i))}`;
    else {
      const nom = BY[c.id]?.nom;
      const j = t.indexOf("(");
      if (nom && t.startsWith(nom)) html = `<b>${esc(nom)}</b>${esc(t.slice(nom.length))}`;
      else if (j > 0 && j < 45) html = `<b>${esc(t.slice(0, j).trim())}</b> ${esc(t.slice(j))}`;
      else html = esc(t);
    }
    return `<li>${html} ${c.id !== own ? ref(c.id) : ""}</li>`;
  }

  function speciesPage(b) {
    const e = EST[b.estat];
    const p = newPage(e.sec, `sp st-${b.estat}`);
    PAGE_OF[b.id] = p;
    const lvl = b.nivell ? `${dots(b.nivell)}<b>${NIV[b.nivell]}</b>` : "";
    const aka = (b.aka || "").replace(/^També:\s*/i, "");
    const r = PLUJA[b.id];
    const facts = `<div class="facts">${months(b.mesos)}
      ${(b.on || []).map(h => `<span class="fct">${ICON[h] || ""}${HAB[h] || h}</span>`).join("")}
      <span class="fct">${ICON[b.forma] || ""}${FORMA[b.forma] || ""}</span>
      ${r ? `<span class="fct">${ICON.pluja}${r[0]}–${r[1]} d</span>` : ""}</div>`;
    const desc = [["Barret", b.desc?.barret], ["A sota", b.desc?.sota], ["Peu", b.desc?.peu], ["Carn", b.desc?.carn], ["On", b.habitat]]
      .filter(x => x[1]).map(([l, t]) => `<p><span class="lab">${l}</span>${esc(t)}</p>`).join("");
    const checks = b.checks?.length ? `<div class="checks"><h3>Comprova-ho</h3><ul>${b.checks.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>` : "";
    const perillLab = { mortal: "Per què mata", toxic: "Què fa", precaucio: "Compte" }[b.estat];
    const perill = b.perill ? `<p class="perill"><span class="lab">${perillLab}</span>${esc(b.perill)}</p>` : "";
    const conf = b.conf?.length ? `<div class="conf"><h3>${b.estat === "comestible" ? "No el confonguis amb" : "Es confon amb"}</h3><ul>${b.conf.map(c => confItem(c, b.id)).join("")}</ul></div>` : "";
    const truc = b.truc ? `<p class="truc"><span class="lab">${b.estat === "mortal" ? "Recorda" : "Truc"}</span>${esc(b.truc)}</p>` : "";
    const nota = b.nota ? `<p class="nota">${esc(b.nota)}</p>` : "";
    const label = b.estat === "comestible" ? `Comestibles · Nivell ${b.nivell}` : e.pill === "Precaució" ? "Precaució" : SEC[e.sec].t;
    p.insertAdjacentHTML("beforeend", `
      <header class="sp-head">
        <div class="kick"><span class="pill">${e.pill}</span>${lvl}${b.qualitat ? `<span class="q">${esc(b.qualitat)}</span>` : ""}</div>
        <h1 class="name">${esc(b.nom)}</h1>
        <p class="lat"><i>${esc(b.lat)}</i>${typeof NOMS_ES !== "undefined" && NOMS_ES[b.id] ? `<span class="es"> · ${esc(NOMS_ES[b.id])}</span>` : ""}${aka ? `<span class="aka"> · també ${esc(aka.charAt(0).toLowerCase() + aka.slice(1))}</span>` : ""}</p>
        ${b.conte ? `<p class="lede">${esc(b.conte)}</p>` : ""}
      </header>
      ${photosHTML(PICK[b.id])}
      ${facts}
      <div class="txt"><div class="desc">${desc}</div>${checks}${perill}${conf}${truc}${nota}</div>
      ${foot(label)}`);
    fit(p, [".nota", "tight", ".lede", "dense", ".aka", "denser"], b.id);
  }

  // =========================================================
  // CARA A CARA
  // =========================================================
  function caraPages() {
    const DIF = { 1: "Fàcil", 2: "Cal fixar-s'hi", 3: "Difícil" };
    const items = COMPARA.map(c => {
      const head = c.cols.map(id => {
        const b = BY[id] || {};
        return `<th class="st-${b.estat}"><div class="cc-h"><div class="im"><img src="${thumb(id)}" alt=""></div><b>${esc(b.nom || id)}</b>${ref(id)}</div></th>`;
      }).join("");
      const rows = c.rows.map(r => `<tr><th>${esc(r[0])}</th>${r.slice(1).map(v => `<td>${esc(v)}</td>`).join("")}</tr>`).join("");
      return `<article class="cc"><h3>${esc(c.t)}<span class="dif">${dots(c.d, "dd").replace('class="dd"', 'style="display:inline-flex;gap:.4mm"')}${DIF[c.d] || ""}</span></h3>
        <p class="clau"><b>Clau:</b> ${esc(c.clau)}</p>
        <table><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></article>`;
    });
    pack(items, more => {
      const p = newPage("cara");
      p.insertAdjacentHTML("beforeend", `
        ${more ? "" : `<div class="kicker">Les confusions de cada tardor</div><h2 class="pt">Cara a cara</h2>
        <p class="ps">Aprèn-te la clau de cada parella. De la més fàcil a la més difícil.</p>`}
        <div class="flow"></div>${foot("Cara a cara")}`);
      return p;
    }, "cara a cara");
  }

  // =========================================================
  // ANNEX
  // =========================================================
  function casaPage() {
    const p = newPage("annex");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">A casa</div>
      <h2 class="pt">Abans de menjar-te'l</h2>
      <p class="ps">Repassa-ho amb cada bolet. Si n'hi ha un que no pots marcar, no te'l mengis.</p>
      <ul class="chk spread" style="flex-grow:${ABANS.length}">${ABANS.map(([b, s]) => `<li><span class="bx"></span><span><b>${esc(b)}</b> <span>${esc(s)}</span></span></li>`).join("")}</ul>
      <div class="h3">A la cuina</div>
      <ul class="list2 spread" style="flex-grow:${CUINA.length * 1.3}">${CUINA.map(([b, s]) => `<li><b>${esc(b)}.</b> <span>${esc(s)}</span></li>`).join("")}</ul>
      ${foot("A casa")}`);
    fit(p, [".ps", "dense"], "casa");
  }

  function mitesPage() {
    const p = newPage("annex");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">El que no és veritat</div>
      <h2 class="pt">Mites que maten</h2>
      <ul class="mites spread" style="margin-top:2mm;flex-grow:${MITES.length * 1.4}">${MITES.map(([b, s]) => `<li><span class="fals">FALS</span><span><b>${esc(b)}</b><span>${esc(s)}</span></span></li>`).join("")}</ul>
      <div class="h3">Al bosc</div>
      <ul class="list2 spread" style="flex-grow:${BOSC_BE.length}">${BOSC_BE.map(([b, s]) => `<li><b>${esc(b)}.</b> <span>${esc(s)}</span></li>`).join("")}</ul>
      ${foot("A casa · Mites")}`);
    fit(p, ["dense"], "mites");
  }

  function troballesPage(first) {
    const p = newPage("annex");
    const N = 13;
    let cells = `<span class="lh">Data</span><span class="lh">Lloc i bosc</span><span class="lh">Bolet i notes</span>`;
    for (let i = 0; i < N; i++) cells += `<span class="lc"></span><span class="lc"></span><span class="lc"></span>`;
    p.insertAdjacentHTML("beforeend", `
      ${first ? `<div class="kicker">Quadern de camp</div><h2 class="pt">Les meves troballes</h2>
      <p class="log-hint">Apunta-ho al bosc: on, quan i amb qui ho vas confirmar.</p>` : `<div class="kicker">Les meves troballes</div>`}
      <div class="log" style="grid-template-rows:auto repeat(${N}, 1fr)">${cells}</div>
      ${foot("Les meves troballes")}`);
    return p;
  }

  function creditsPages() {
    const lines = [];
    const cf = REPORT.cover;
    if (cf) lines.push(`<p><b>Portada</b> ${esc(cf.autor)} (${esc(cf.llic)})</p>`);
    const ex = {};
    for (const [where, f] of EXTRA) (ex[where] ||= []).push(`${esc(f.autor || "Pròpia")}${f.llic ? ` (${esc(f.llic)})` : ""}`);
    for (const [where, who] of Object.entries(ex)) lines.push(`<p><b>${esc(where)}</b> ${[...new Set(who)].join(" · ")}</p>`);
    for (const b of BOLETS) {
      const fs = PICK[b.id];
      if (!fs.length) continue;
      const seen = new Set();
      const who = fs.filter(f => { const k = f.autor + f.llic; if (seen.has(k)) return false; seen.add(k); return true; })
        .map(f => `${esc(f.autor || "Pròpia")}${f.llic ? ` (${esc(f.llic)})` : ""}`).join(" · ");
      lines.push(`<p><b>${esc(b.nom)}</b> ${who}</p>`);
    }
    const intro = `<p class="note" style="margin-bottom:2mm">Fotos d'observacions d'<b>iNaturalist</b> i de <b>Wikimedia Commons</b> amb llicència Creative Commons o de domini públic, i fotos pròpies. Els enllaços a cada foto són a la web. Text i dades: <b>Cistella Segura</b> · caorjavier.github.io/cistella-segura</p>`;
    let first = true;
    const pages = [];
    const mk = () => {
      const p = newPage("annex");
      p.insertAdjacentHTML("beforeend", `${first ? `<div class="kicker">Crèdits</div><h2 class="pt" style="font-size:13pt">Fotos i fonts</h2>${intro}` : ""}
        <div class="cred"></div>${foot("Crèdits")}`);
      first = false;
      pages.push(p);
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
    const p = newPage("sos", "sos-page");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Si algú es troba malament</div>
      <h2 class="pt">Truca ara</h2>
      <div class="sos-nums">
        <div class="sos-num"><strong>112</strong><span><b>Emergències</b>Digues que heu menjat bolets silvestres i quan.</span></div>
        <div class="sos-num"><strong style="font-size:15pt">91 562 04 20</strong><span><b>Toxicologia · 24 h</b>Informació d'intoxicacions.</span></div>
      </div>
      <div class="h3">Quan han començat els símptomes?</div>
      <ul class="sos-t">${SOS.temps.map(([t, d]) => `<li><strong>${esc(t)}</strong><span>${esc(d)}</span></li>`).join("")}</ul>
      <div class="h3">Què fer</div>
      <ul class="sos-f">${SOS.fer.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="h3" style="margin-top:auto">Apunta-ho abans de sortir</div>
      ${["Allotjament", "Centre de salut", "Societat micològica", "On he aparcat"].map(t => `<div class="wi"><span>${t}</span><i></i></div>`).join("")}
      ${foot("SOS")}`);
    fit(p, ["dense"], "sos");
  }

  function glossariPage() {
    const p = newPage("annex");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Paraules de boletaire</div>
      <h2 class="pt">Glossari</h2>
      <p class="ps">Les paraules que surten a les fitxes, explicades en una línia.</p>
      <div class="glossa">${GLOSSARI.map(([t, d]) => `<p><b>${esc(t)}</b>${esc(d)}</p>`).join("")}</div>
      ${foot("Glossari")}`);
    fit(p, ["g-small", ".ps", "g-smaller"], "glossari");
  }

  // Index alfabetic: noms principals i altres noms (aka) que remeten a la fitxa
  function alfaPages() {
    const main = new Set(BOLETS.map(b => b.nom.toLowerCase()));
    const rows = BOLETS.map(b => ({ n: b.nom, id: b.id, st: b.estat, alt: false }));
    for (const b of BOLETS) {
      const names = (b.aka || "").replace(/^També:\s*/i, "").split(/\.\s/)[0].replace(/\([^)]*\)/g, "")
        .split(/,|\s+i\s+|\s+o\s+/).map(s => s.trim().replace(/\.$/, "")).filter(Boolean);
      for (const n of names) {
        if (main.has(n.toLowerCase()) || n.length < 3) continue;
        rows.push({ n: n.charAt(0).toUpperCase() + n.slice(1), id: b.id, st: b.estat, alt: true });
      }
    }
    rows.sort((a, b) => a.n.localeCompare(b.n, "ca", { sensitivity: "base" }));
    let letter = "";
    const items = [];
    for (const r of rows) {
      const L = r.n.normalize("NFD").charAt(0).toUpperCase();
      if (L !== letter) { letter = L; items.push(`<p class="lt">${L}</p>`); }
      items.push(`<p class="st-${r.st}${r.alt ? " alt" : ""}"><i class="d"></i><span>${esc(r.n)}</span>${ref(r.id, true)}</p>`);
    }
    const p = newPage("annex");
    p.insertAdjacentHTML("beforeend", `
      <div class="kicker">Tots els noms</div>
      <h2 class="pt">Índex alfabètic</h2>
      <p class="ps">En negreta, el nom de la fitxa. En cursiva, altres noms amb què també es coneix.</p>
      <div class="alfa">${items.join("")}</div>
      ${foot("Índex")}`);
    fit(p, [".ps", "dense"], "index alfabetic");
    if (overflows(p)) p.querySelector(".alfa").style.fontSize = "5.2pt";
  }

  // Degradats verticals com a PNG. Els degradats CSS amb transparencia surten rosa en alguns visors de PDF.
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
  // MUNTATGE
  // =========================================================
  function build() {
    const root = document.documentElement.style;
    root.setProperty("--grad-cap", gradPNG("rgba(0,0,0,0)", "rgba(0,0,0,0.74)"));
    root.setProperty("--grad-paper", gradPNG("rgba(251,248,241,0)", "rgba(251,248,241,1)"));

    cover();
    tocShell();
    normesPage();
    mirarPage();
    descartsPage();
    indexPage(GROUPS.comestible, "Els comestibles", "Ordenats de més fàcil a més difícil. El número és la pàgina.");
    const nc = [...GROUPS.mortal, ...GROUPS.toxic, ...GROUPS.precaucio];
    indexPage(nc, "Els que no", "Mortals, tòxics i de precaució: coneix-los per no collir-los.",
      `<div class="ix-legend"><span class="st-mortal"><i class="d"></i>Mortal</span><span class="st-toxic"><i class="d"></i>Tòxic</span><span class="st-precaucio"><i class="d"></i>Precaució</span></div>`);
    calendarPage();
    boscosPages();
    BOLETS.forEach(speciesPage);
    caraPages();
    casaPage();
    mitesPage();
    const firstLog = troballesPage(true);
    troballesPage(false);
    glossariPage();
    alfaPages();
    creditsPages();
    sosPage();

    // Paginas de notes extra perque el total sigui multiple de 4 (per imprimir en quadernet)
    const extra = (4 - (book.children.length % 4)) % 4;
    let after = firstLog.nextElementSibling;
    for (let i = 0; i < extra; i++) {
      const p = troballesPage(false);
      book.insertBefore(p, after.nextElementSibling);
      after = p;
    }

    // Numeracio
    const pages = [...book.children];
    pages.forEach((p, i) => {
      const n = i + 1;
      p.dataset.n = n;
      p.classList.add(n % 2 ? "recto" : "verso");
      const pn = p.querySelector(".pn");
      if (pn) pn.textContent = n;
    });

    // Sumari
    const first = sel => { const p = pages.find(sel); return p ? p.dataset.n : ""; };
    const secFirst = s => first(p => p.dataset.sec === s && !p.classList.contains("toc-page"));
    fillToc([
      { t: "Guia", d: "normes, com mirar, descarts, índex, calendari, boscos", c: SEC.guia.c, n: secFirst("guia") },
      { t: "Comestibles", d: `${GROUPS.comestible.length} bolets, de fàcil a expert`, c: SEC.comestibles.c, n: secFirst("comestibles") },
      { t: "Mortals", d: `${GROUPS.mortal.length} bolets`, c: SEC.mortals.c, n: secFirst("mortals") },
      { t: "Tòxics i precaució", d: `${GROUPS.toxic.length + GROUPS.precaucio.length} bolets`, c: SEC.toxics.c, n: secFirst("toxics") },
      { t: "Cara a cara", d: `${COMPARA.length} confusions perilloses`, c: SEC.cara.c, n: secFirst("cara") },
      { t: "A casa", d: "abans de menjar, cuina, mites", c: SEC.annex.c, n: secFirst("annex") },
      { t: "Les meves troballes", d: "per apuntar", c: SEC.annex.c, n: first(p => p.querySelector(".log")) },
      { t: "Glossari i índex", d: "paraules i tots els noms", c: SEC.annex.c, n: first(p => p.querySelector(".glossa")) },
      { t: "SOS", d: "si algú es troba malament", c: "var(--deadly)", n: secFirst("sos") }
    ]);
    const tpn = tocPage.querySelector(".pn");
    if (tpn) tpn.textContent = tocPage.dataset.n;
    fit(tocPage, ["dense"], "sumari");

    // Referencies a pagines
    document.querySelectorAll(".ref[data-ref]").forEach(r => {
      const t = PAGE_OF[r.dataset.ref];
      if (!t) { r.remove(); return; }
      r.textContent = r.dataset.fmt === "n" ? t.dataset.n : `→ p. ${t.dataset.n}`;
    });

    REPORT.pages = pages.length;
    window.BUILD_REPORT = REPORT;
    // Avisa la versio per imprimir (imposicio.js), que reordena les pagines en fulls A4
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
