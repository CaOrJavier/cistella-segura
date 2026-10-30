# 🍄 [Obre la web: caorjavier.github.io/cistella-segura](https://caorjavier.github.io/cistella-segura/)

**Cistella Segura** reuneix en un sol lloc tot el material per aprendre a reconèixer els bolets de Catalunya: una web-quadern de camp en català, una guia completa en castellà, un quiz amb fotos i llibres en PDF per imprimir o portar al mòbil.

| Part | On és | Què és |
|---|---|---|
| **Cistella Segura** | [/](https://caorjavier.github.io/cistella-segura/) | Quadern de camp en català: 50 bolets, mapa, avui al bosc, cara a cara, seguretat. |
| **Guia «Setas de Cataluña»** | [/guia/](https://caorjavier.github.io/cistella-segura/guia/) | 163 fitxes en castellà, buscador, comparador, calendari, arbres, hàbitats, inventari d'≈ 4.000 espècies. |
| **Quiz de bolets** | [/quiz/](https://caorjavier.github.io/cistella-segura/quiz/) | 66 bolets i 1.077 fotos per entrenar l'ull. Cada resposta enllaça amb la fitxa de la guia. |
| **Llibres PDF** | [Releases](https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1) i [/offline/](https://caorjavier.github.io/cistella-segura/offline/) | Vegeu a sota. |

## Llibres i quaderns

**Per portar al bosc**
- **Quadern de butxaca A6** (76 pàgines, català): [cistella-segura-butxaca.pdf](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca.pdf) · per imprimir a casa en A4: [cistella-segura-butxaca-imprimir-A4.pdf](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca-imprimir-A4.pdf) ([com imprimir-lo](butxaca/COMO-IMPRIMIR.md)). Es genera des de `butxaca/` amb les dades de la web.
- **Cuaderno de campo A5** (48 páginas, castellano): 26 comestibles, 22 peligrosas y 8 árboles. Versión A5 y versión A4 para doblar, a [Releases](https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1). Vista prèvia a [/guia/#/cuaderno](https://caorjavier.github.io/cistella-segura/guia/#/cuaderno).

**Per llegir i consultar**
- **Llibre de la web** (català): [cistella-segura-llibre.pdf](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-llibre.pdf) i la web sencera en un sol fitxer: [cistella-segura.html](https://caorjavier.github.io/cistella-segura/offline/cistella-segura.html).
- ***Setas comestibles esenciales de Cataluña*** (336 pàgines): 47 comestibles i 32 fitxes d'alerta. Edicions mòbil, color, blanc i negre i impremta.
- ***Catálogo micológico de Cataluña, vol. 1*** (565 pàgines): 163 fitxes i inventari complet. Edicions mòbil, color, blanc i negre i en dos toms.

## La web Cistella Segura

- **Avui al bosc:** semàfor de 26 zones boletaires amb la pluja i la temperatura dels últims dies (Open-Meteo, en directe) i què toca buscar a cada zona.
- **Els bolets:** una fitxa per bolet (50), amb fotos de cada edat, el mapa d'on surt i els bessons perillosos.
- **Mapa interactiu**, **Tipus de bosc**, **Quan sortir** (dies després de la pluja), **Cara a cara**, **Aprèn a mirar**, **Seguretat**, **Les meves troballes** (Montnegre-Corredor, 18/10/2026), **Entrena l'ull** i **SOS**.

## Estructura del repositori

```
index.html     web Cistella Segura (català)
fotos/         fotos de la web
offline/       llibres PDF i la web en un sol fitxer
butxaca/       generador del quadern de butxaca (tools/generar-pdf.ps1 fa els PDF)
guia/          guia «Setas de Cataluña» (castellano): app.js, datos/db.js, fotos/, cuaderno/
quiz/          quiz de bolets: index.html, fotos/, icones
```

> **Avís:** és una eina d'aprenentatge i no substitueix la revisió d'un micòleg. Cap web, guia, foto ni aplicació certifica que un bolet sigui comestible. Si dubtes, no te'l mengis. Intoxicació: **112** · Informació Toxicològica 24 h: **91 562 04 20**.

Fotos: observacions d'[iNaturalist](https://www.inaturalist.org) i fotos de [Wikimedia Commons](https://commons.wikimedia.org) amb llicència Creative Commons (CC BY, CC BY-NC, CC BY-SA, CC0…) o de domini públic, amb l'autor i la llicència a cada foto; i fotos pròpies sense dades d'ubicació. Moltes són CC BY-NC: la web i els PDF són per a ús personal o sense ànim de lucre. Noms segons Catalogue of Life (Species Fungorum); registres de GBIF i iNaturalist. Mapes: observacions confirmades d'iNaturalist a Catalunya. Meteo: [Open-Meteo](https://open-meteo.com). Idea del semàfor de zones inspirada en [vadebolets.cat](https://www.vadebolets.cat).
