// Textos fixos del quadern de butxaca. Resumits dels capitols de seguretat de la web.

const NORMES = [
  ["Només et menges el que coneixes al 100 %.", "«S'hi assembla» no val. Les apps de fotos s'equivoquen sovint."],
  ["Arrenca sencer el primer de cada tipus.", "La volva sovint queda enterrada: si el talles, no la veuràs."],
  ["Cistella i ganivet, mai bossa ni rastell.", "El plàstic els fa malbé i el rastell mata el miceli."],
  ["Els dubtosos, a part i en paper.", "Un tros de bolet mortal dins la cistella ja és un problema."],
  ["Cap bolet petit marró o blanc amb làmines.", "Aquí hi ha els que maten. Les excepcions, només amb un expert."],
  ["Ni vells, ni aigualits, ni cucats, ni ous tancats.", "Passat, fins i tot un comestible intoxica."],
  ["Fes fotos al lloc: a dalt, a sota i la base.", "Serveixen per consultar-ho i, si cal, per al metge."],
  ["Sempre ben cuinats, i el primer cop poca quantitat.", "Guarda'n un de cru a la nevera fins l'endemà."],
  ["Respecta cartells, finques i parcs.", "Cull només el que menjaràs i deixa els petits i els vells."],
  ["Si en tens el mínim dubte, no te'l mengis.", "Ensenya'l a una societat micològica abans de cuinar-lo."]
];

const MOTXILLA = "cistella · ganivet · raspall · paper de diari · aigua · mòbil carregat · mapa fora de línia · roba de colors vius (batudes) · aquest quadern";

const DESCARTS = [
  ["Té volva: un sac a la base", "Amanites: la farinera borda i la farinera pudent.", "phalloides"],
  ["Làmines blanques i anell", "La combinació típica de les amanites mortals.", "virosa"],
  ["Bolet blanc amb làmines", "Clitocibes, farinera pudent, lepiotes. Massa risc.", "clitocybe"],
  ["«Apagallums» de menys de 15 cm", "Pot ser una lepiota mortal.", "lepiota"],
  ["Porus vermells o carn que blaveja", "Matagent i parents.", "satanas"],
  ["Lactari amb llet blanca", "Només el grup del rovelló té llet taronja o vermella.", "lactllet"],
  ["Bolet marró petit sobre fusta", "Pot ser una galerina, mortal.", "galerina"],
  ["Cortina o làmines color rovell", "Cortinaris: alguns destrueixen els ronyons.", "orellanus"],
  ["Bola que per dins no és blanca", "Escleroderma, o un ou d'amanita.", "escleroderma"],
  ["Ram taronja sobre olivera o alzina", "Gírgola d'olivera.", "omphalotus"],
  ["Vell, aigualit, cucat o florit", "Fins i tot un comestible intoxica quan està passat.", null],
  ["Ou tancat", "Per fora, un ou de reig i una farinera borda són iguals.", "reig"]
];

const MIRAR = [
  ["Barret", "Color, textura (llisa, escatosa, llefiscosa) i vora."],
  ["A sota", "Làmines, porus, plecs o agullons. Color, i si baixen pel peu."],
  ["Anell", "En té? És fix o llisca amunt i avall?"],
  ["Peu", "Ple o buit, fibrós o fràgil. Té dibuixos?"],
  ["Base", "Arrenca'l sencer i grata la terra: té volva?"],
  ["Carn", "Talla'l: fa llet? Canvia de color? Quina olor fa?"]
];

const ABANS = [
  ["Sé com es diu", "i l'he comparat amb la seva pàgina."],
  ["He mirat a sota del barret", "làmines, porus, plecs o agullons, i el color."],
  ["He vist la base sencera", "i sé si té volva o no."],
  ["He descartat el seu bessó", "amb la clau del cara a cara."],
  ["Està jove i sa", "ferm, sense cucs, sense floridura ni aigua."],
  ["No en tinc cap dubte", "Cap bolet val una nit a urgències."]
];

const CUINA = [
  ["Neteja'ls al bosc", "Terra fora amb ganivet i raspall. A casa, un drap humit; mai en remull."],
  ["A la nevera, poc temps", "En capsa o en paper, mai en plàstic. Menja'ls en 1 o 2 dies."],
  ["Per congelar", "Millor saltats o escaldats uns minuts abans."],
  ["Per assecar", "Ceps a làmines, trompetes, camagrocs i cama-secs."],
  ["Sempre ben cuinats", "Cap bolet silvestre cru: la pimpinella, per exemple, és tòxica crua."],
  ["Primer tast", "Poca quantitat, i guarda'n un exemplar cru a la nevera."],
  ["Sense alcohol", "El bolet de femer amb alcohol dona palpitacions i vòmits, fins i tot dies després."]
];

const MITES = [
  ["Si una moneda de plata o un all s'enfosqueixen, és tòxic.", "La farinera borda no enfosqueix ni la plata ni l'all."],
  ["Si se'l mengen cargols o conills, és bo.", "Els animals mengen farinera borda sense problemes."],
  ["Els que es pelen fàcilment són comestibles.", "La farinera borda es pela molt bé."],
  ["Si fa bona olor i té bon gust, no fa mal.", "Els intoxicats per farinera borda expliquen que era bona."],
  ["Bullir-los o assecar-los treu el verí.", "Les toxines mortals resisteixen la cocció i l'assecat."],
  ["Si al cap d'una hora estic bé, ja està.", "Els mortals triguen de 6 a 24 h; els cortinaris, fins a dues setmanes."]
];

const BOSC_BE = [
  ["Mira les normes de la zona", "Canvien segons el municipi, el parc i l'any."],
  ["Molts boscos són privats", "Respecta cartells i tanques. Alguns demanen permís o tiquet."],
  ["Reserves naturals", "A les reserves integrals no es pot collir res."],
  ["Deixa el bosc com l'has trobat", "Tapa els forats, no trenquis branques ni deixis deixalles."],
  ["Temporada de caça", "Batudes de senglar: roba de colors vius i respecta els cartells."],
  ["Cotxe i pistes", "No tapis camins ni entris a pistes amb barrera."]
];

const GLOSSARI = [
  ["Agullons", "Punxetes toves sota el barret, en lloc de làmines (llengua de bou)."],
  ["Anell", "Faldilla o collaret al peu: el que queda del vel que tapava les làmines."],
  ["Adnades", "Làmines que s'enganxen al peu."],
  ["Berrugues", "Trossets blancs sobre el barret, restes del vel (reig bord, pixacà)."],
  ["Blavejar", "Tornar-se blau en tallar-lo o tocar-lo (alguns boletus)."],
  ["Cortina", "Tel com de teranyina entre la vora del barret i el peu (cortinaris)."],
  ["Decurrents", "Làmines o plecs que baixen pel peu."],
  ["Espora", "La «llavor» del bolet. L'esporada és la pols d'espores que deixa en un paper: el color ajuda a identificar-lo."],
  ["Fullaraca", "Capa de fulles seques a terra. La de pi es diu pinassa."],
  ["Higròfan", "Que canvia de color quan s'asseca o es mulla."],
  ["Làmines", "Fulles primes sota el barret."],
  ["Lliures", "Làmines que no toquen el peu (amanites, apagallums)."],
  ["Llet o làtex", "Líquid que surt en tallar els lactaris. El color és la clau del rovelló."],
  ["Micorrízic", "Que viu lligat a les arrels d'un arbre: el rovelló amb el pi, el cep amb el faig."],
  ["Miceli", "La xarxa de fils sota terra. El bolet només n'és el fruit."],
  ["Mugró", "Bony al centre del barret."],
  ["Obaga i solana", "Vessant que mira al nord (ombrívol, humit) i al sud (assolellat)."],
  ["Plecs", "Venes gruixudes i baixes sota el barret, no làmines (rossinyol)."],
  ["Porus o tubs", "Esponja sota el barret en lloc de làmines (ceps, mollerics)."],
  ["Sapròfit", "Que s'alimenta de restes mortes: fullaraca, fusta, fems."],
  ["Volva", "Sac a la base del peu, sovint enterrat. Senyal d'amanita."]
];

const SOS = {
  temps: [
    ["< 6 h", "Normalment digestiva o nerviosa. Cal anar a urgències igualment."],
    ["6–24 h", "Alerta màxima: farinera borda, lepiotes o galerina. Encara que et trobis millor, el fetge s'està danyant."],
    ["2–17 dies", "Set intensa i poca orina: cortinari metzinós."]
  ],
  fer: [
    "Ves a urgències encara que sembli lleu.",
    "Porta els bolets que sobrin, crus o cuinats, i les peles.",
    "Avisa tothom que n'hagi menjat.",
    "No prenguis remeis casolans ni provoquis el vòmit sense indicació mèdica."
  ]
};
