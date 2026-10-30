# 🍄 Cistella Segura · [caorjavier.github.io/cistella-segura](https://caorjavier.github.io/cistella-segura/)

Web para **identificar** las setas de Cataluña: 163 fichas en castellano (con los nombres en catalán y científicos), búsqueda por rasgos, calendario, seguridad, un quiz con fotos y libros en PDF para imprimir o llevar en el móvil.

## Qué hay en la web

- **Especies:** buscador con filtros y las 163 fichas: rasgos decisivos, confusiones peligrosas, morfología, hábitat, árboles, calendario, registros en Cataluña y fuentes.
- **Por rasgos:** se marcan los rasgos observados (debajo del sombrero, sustrato, árbol, color, anillo, volva, látex, mes) y quedan las candidatas.
- **Calendario** y **Aprende**: seguridad, qué hacer ante una intoxicación, anatomía, cómo buscar y glosario.
- En **Más**: cuándo salir tras la lluvia, mis hallazgos (Montnegre-Corredor, 18/10/2026), árboles, galería, cuaderno de campo, libros PDF, quiz, inventario de ≈ 4.000 especies y fuentes.

## Sin internet

En la web, **Más → Usar sin internet**:

- **En el móvil o la tableta:** botón «Guardar en este dispositivo», con fotos pequeñas (≈ 27 MB) o con todas las fotos (≈ 174 MB). Después se puede añadir a la pantalla de inicio y se abre como una app, sin cobertura.
- **En el ordenador:** [descarga la web en ZIP](https://github.com/CaOrJavier/cistella-segura/releases/download/web-local/cistella-segura-web.zip), descomprímela y abre `index.html`. El ZIP se rehace solo con cada cambio de la web (`.github/workflows/web-zip.yml`).

## Libros y cuadernos

Todos se descargan desde la web (**Más → Libros PDF**) o desde [Releases](https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1).

- **Setas esenciales · cuaderno de bolsillo A6** (108 páginas): las 79 especies esenciales y 20 árboles con foto de la hoja y del tronco, en [A6](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-bolsillo.pdf) o [A4 para imprimir en casa](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-bolsillo-imprimir-A4.pdf) ([cómo imprimirlo](butxaca/COMO-IMPRIMIR.md)).
- **Quadern de butxaca A6** (76 páginas, en catalán, 50 setas): en [A6](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca.pdf) o [A4](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca-imprimir-A4.pdf).
- **Cuaderno de campo A5** (48 páginas), ***Setas comestibles esenciales de Cataluña*** (336 páginas) y ***Catálogo micológico de Cataluña, vol. 1*** (565 páginas): en Releases.

## Estructura del repositorio

```
index.html, app.js, app.css   la web
sw.js, manifest.webmanifest   modo sin internet y app instalable (icono-*.png)
libros/            páginas de muestra de los libros (para hojearlos antes de descargar)
datos/db.js        las 163 especies, árboles, textos y vocabulario
datos/cistella.js  datos de «Cuándo salir» y «Mis hallazgos»
extra/             esas dos secciones
fotos/             fotos de las fichas (g/, t/) y de los hallazgos (montnegre/)
cuaderno/          páginas del cuaderno de campo
quiz/              quiz de setas (en catalán)
offline/           cuadernos de bolsillo en PDF
butxaca/           generadores de los cuadernos de bolsillo
tools/             generar-pdf.ps1 hace los PDF de bolsillo con Edge
guia/              solo redirige a la web (dirección antigua)
```

> **Aviso:** es una herramienta para aprender y no sustituye la revisión de un micólogo. Ninguna web, guía, foto ni aplicación certifica que una seta sea comestible. Ante la duda, no la recolecte para comer. Intoxicación: **112** · Información Toxicológica 24 h: **91 562 04 20**.

Fotos de [iNaturalist](https://www.inaturalist.org) y [Wikimedia Commons](https://commons.wikimedia.org) con licencia Creative Commons (CC BY, CC BY-NC, CC BY-SA, CC0…) o de dominio público, con el autor y la licencia en cada foto, y fotos propias sin datos de ubicación. Muchas son CC BY-NC: la web y los PDF son para uso personal o sin ánimo de lucro. Nombres según Catalogue of Life (Species Fungorum); registros de GBIF e iNaturalist.
