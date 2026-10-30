# 🍄 [Abrir la web: caorjavier.github.io/cistella-segura](https://caorjavier.github.io/cistella-segura/)

**Cistella Segura** es una sola web para aprender a reconocer las setas de Cataluña: 163 fichas en castellano (con los nombres en catalán y científicos), búsqueda por rasgos, el tiempo de hoy en cada zona boletera, mapa, calendario, seguridad, un quiz con fotos y libros en PDF para imprimir o llevar en el móvil.

## Qué hay en la web

Menú principal:
- **Especies:** buscador con filtros y las 163 fichas: rasgos decisivos, confusiones peligrosas, morfología, hábitat, árboles, calendario, registros en Cataluña y fuentes.
- **Por rasgos:** se marcan los rasgos observados (debajo del sombrero, sustrato, árbol, color, anillo, volva, látex, mes) y quedan las candidatas.
- **Hoy en el bosque:** semáforo de 26 zonas boleteras con la lluvia y la temperatura de los últimos días (Open-Meteo, en directo) y qué buscar en cada zona.
- **Mapa:** qué sale en una zona (o «¿Dónde estoy?») y dónde sale cada seta, con las observaciones confirmadas de iNaturalist.
- **Calendario** y **Aprende** (seguridad, qué hacer ante una intoxicación, anatomía, cómo buscar, glosario).

En **Más:** cuándo salir tras la lluvia (calculadora), mis hallazgos (salida al Montnegre-Corredor del 18/10/2026), árboles, galería, cuaderno de campo, libros PDF, quiz, inventario de ≈ 4.000 especies y fuentes.

## Libros y cuadernos

**Para llevar al bosque**
- **Setas esenciales · cuaderno de bolsillo A6** (104 páginas, castellano): las 79 especies esenciales: [setas-esenciales-bolsillo.pdf](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-bolsillo.pdf) · para imprimir en casa en A4 (dos cuadernillos): [setas-esenciales-bolsillo-imprimir-A4.pdf](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-bolsillo-imprimir-A4.pdf) ([cómo imprimirlo](butxaca/COMO-IMPRIMIR.md)).
- **Quadern de butxaca A6** (76 páginas, catalán, 50 setas): [cistella-segura-butxaca.pdf](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca.pdf) · en A4: [cistella-segura-butxaca-imprimir-A4.pdf](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca-imprimir-A4.pdf).
- **Cuaderno de campo A5** (48 páginas): 26 comestibles, 22 peligrosas y 8 árboles, en [Releases](https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1).

**Para leer y consultar** (en [Releases](https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1))
- ***Setas comestibles esenciales de Cataluña*** (336 páginas): 47 comestibles y 32 fichas de alerta.
- ***Catálogo micológico de Cataluña, vol. 1*** (565 páginas): 163 fichas e inventario completo.
- Libro de la antigua web catalana: [cistella-segura-llibre.pdf](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-llibre.pdf).

## Estructura del repositorio

```
index.html     portada: lleva a guia/ (y traduce los enlaces de la antigua web catalana)
guia/          LA WEB: index.html, app.js, app.css, datos/db.js (163 especies), fotos/, cuaderno/
guia/extra/    hoy en el bosque, mapa, cuándo salir y hallazgos (vienen de la antigua web catalana)
guia/datos/cistella.js   datos de esas secciones: zonas, mapa, lluvia, hallazgos
quiz/          quiz de setas (en catalán): index.html, fotos/
fotos/         fotos de la antigua web catalana (hallazgos del Montnegre y cuaderno catalán)
offline/       libros PDF
butxaca/       generadores de los cuadernos de bolsillo: setas.html (castellano) e index.html (catalán)
tools/         generar-pdf.ps1 hace todos los PDF de bolsillo con Edge
```

> **Aviso:** es una herramienta para aprender y no sustituye la revisión de un micólogo. Ninguna web, guía, foto ni aplicación certifica que una seta sea comestible. Ante la duda, no la recolecte para comer. Intoxicación: **112** · Información Toxicológica 24 h: **91 562 04 20**.

Fotos de [iNaturalist](https://www.inaturalist.org) y [Wikimedia Commons](https://commons.wikimedia.org) con licencia Creative Commons (CC BY, CC BY-NC, CC BY-SA, CC0…) o de dominio público, con el autor y la licencia en cada foto, y fotos propias sin datos de ubicación. Muchas son CC BY-NC: la web y los PDF son para uso personal o sin ánimo de lucro. Nombres según Catalogue of Life (Species Fungorum); registros de GBIF e iNaturalist. Meteo: [Open-Meteo](https://open-meteo.com). Idea del semáforo de zonas inspirada en [vadebolets.cat](https://www.vadebolets.cat).
