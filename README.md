# 🍄 Cistella Segura · [caorjavier.github.io/cistella-segura](https://caorjavier.github.io/cistella-segura/)

Web para **identificar** las setas de Cataluña: 163 fichas en castellano (con los nombres en catalán y científicos), búsqueda por rasgos, seguridad, un quiz con fotos, dos libros en PDF (uno de bolsillo para el bosque y una guía para estudiar) y modo sin internet.

## Idiomas

En **castellano y catalán**: botón **ES · CA** en el menú (se recuerda la elección; si no se elige, se usa el idioma del navegador). Las traducciones están en `datos/ca.js` y las aplica `i18n.js`: los textos de las fichas se cambian antes de pintar la web y los de la interfaz al mostrarse. El quiz también está en los dos idiomas.

## Qué hay en la web

- **Especies:** buscador con filtros y las 163 fichas: rasgos decisivos, confusiones peligrosas, morfología, hábitat, árboles, calendario, registros en Cataluña y fuentes.
- **Por rasgos:** se marcan los rasgos observados (debajo del sombrero, sustrato, árbol, color, anillo, volva, látex, mes) y quedan las candidatas.
- **Aprende**: seguridad, qué hacer ante una intoxicación, anatomía, cómo buscar y glosario.
- **Quiz** con las fotos de la web, en cinco modos: *¿Qué seta es?*, *¿Se come?* (comestible, no se come, tóxica o mortal), *No las confundas* (dos setas que se parecen: cuál es cuál y cómo distinguirlas), *Árboles* (por la hoja, el tronco o la forma) y *Mezcla*. Se elige con qué setas (las 54 del cuaderno de bolsillo, las 79 esenciales o las 163) y el nivel (en *Experto* se escribe el nombre). Rondas de 10, con puntos, rachas y récords; las setas que se fallan vuelven a salir más y se pueden repasar. Funciona sin internet.
- **Libros** en PDF, también en la portada. Se pueden **leer enteros en la web** antes de descargarlos (ver *Libros*).
- Botón **⬇ Usar sin internet** arriba: guarda la web en el móvil. La web avisa cuando no hay conexión.
- En **Más**: calendario, cuándo salir tras la lluvia, árboles, galería, inventario de ≈ 4.000 especies y fuentes.

## Sin internet

En la web, botón **⬇ Usar sin internet** (arriba):

- **En el móvil o la tableta:** botón «Guardar en este dispositivo», con fotos pequeñas (≈ 35 MB, con el cuaderno de bolsillo entero para leerlo en el bosque) o con todas las fotos y todas las páginas de los libros (≈ 220 MB). Después se puede añadir a la pantalla de inicio y se abre como una app, sin cobertura.
- **En el ordenador:** [descarga la web en ZIP](https://github.com/CaOrJavier/cistella-segura/releases/download/web-local/cistella-segura-web.zip), descomprímela y abre `index.html`. El ZIP se rehace solo con cada cambio de la web (`.github/workflows/web-zip.yml`).

## Libros

Dos libros, cada uno para una cosa, hechos con los mismos datos que la web (`butxaca/setas.js`). Se leen y se descargan en la web (**Libros**).

**Leer en la web** (`#/leer/<libro>/<página>`, `extra/lector.js`): el libro entero como un libro de verdad, antes de descargarlo. En pantallas anchas se ven dos páginas y la hoja gira en 3D (se arrastra con el dedo o el ratón, o con las flechas del teclado); en el móvil, una. Índice, búsqueda en todo el texto (lo encontrado se marca en amarillo en la página), miniaturas de todas las páginas, ampliar y pantalla completa. Los «→ p. 29» y los números de los índices del libro llevan a su página, y en cada página de una seta hay un enlace a su ficha de la web. Recuerda por qué página ibas. El cuaderno de bolsillo se abre en el idioma de la web (con botón ES · CA; al cambiar, se queda en la misma seta).

- **Para llevar al bosque · Setas esenciales, cuaderno de bolsillo A6** (56 páginas, fondo blanco para gastar poca tinta): las 54 setas imprescindibles (25 comestibles, 20 tóxicas o no comestibles, con las más comunes, y 9 mortales; en ese orden, con los árboles al final), una por página; las que se parecen mucho, de dos en dos con una tabla de diferencias (rovelló y pinetell, trompeta de la mort y camagroc, llenega negra y carlet, los dos enganyapastors y los falsos rossinyols), con dónde salen (en palabras: árboles, prados, madera) y a qué altitud, su olor o sabor si es peculiar y, con una foto pequeña, las setas con que se confunden; en las tóxicas, la gravedad y por qué lo son; 10 árboles con foto de la hoja y del tronco e índice de todos los nombres (los teléfonos de urgencias van en la portada). En A4 son 7 hojas (14 caras), un solo cuadernillo. También en A5, con letra más grande: [A5](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-A5.pdf) o [A4 apaisado para doblar en casa](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-A5-imprimir-A4.pdf) (14 hojas). En [A6](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-bolsillo.pdf) o [A4 para imprimir en casa](https://caorjavier.github.io/cistella-segura/offline/setas-esenciales-bolsillo-imprimir-A4.pdf) ([cómo imprimirlo](butxaca/COMO-IMPRIMIR.md)). También en catalán (50 setas): [A6](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca.pdf) o [A4](https://caorjavier.github.io/cistella-segura/offline/cistella-segura-butxaca-imprimir-A4.pdf).
- **Para estudiar en casa · *Setas comestibles esenciales de Cataluña*** (A5, 84 páginas, `butxaca/guia.html`): 80 setas, cada una en una página como mucho: las 54 del cuaderno de bolsillo en página entera (con cómo es y cuándo sale) y otras 26 en media página (comestibles, tóxicas y mortales, en ese orden); al final, árboles (5 por página), calendario, síndromes, glosario, índice de todos los nombres y créditos de las fotos. [A5](https://caorjavier.github.io/cistella-segura/offline/setas-guia-esencial-A5.pdf) o [A4 para imprimir en casa](https://caorjavier.github.io/cistella-segura/offline/setas-guia-esencial-imprimir-A4.pdf) (21 hojas, dos cuadernillos). La edición anterior, de 336 páginas, sigue en [Releases](https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1).

El *Cuaderno de campo A5* y el *Catálogo micológico de Cataluña* ya no se ofrecen en la web porque repetían contenido (el cuaderno A5 está entero en el de bolsillo; el catálogo, en las 163 fichas de la web). Sus PDF siguen en [Releases](https://github.com/CaOrJavier/cistella-segura/releases/tag/guia-2026.1).

## Estructura del repositorio

```
index.html, app.js, app.css   la web
i18n.js, datos/ca.js          castellano / catalán (botón ES · CA)
sw.js, manifest.webmanifest   modo sin internet y app instalable (icono-*.png)
libros/            todas las páginas de los libros (pNNN.jpg 800 px, tNNN.jpg miniatura) y texto.js
                   (texto, enlaces, fichas e índice de cada página, sacados del PDF) para leerlos en la web
extra/lector.js    el lector de libros (extra/lector.css)
datos/db.js        las 163 especies, árboles, textos y vocabulario
datos/cistella.js  datos de «Cuándo salir» y «Mis hallazgos»
extra/             esas dos secciones y el lector de libros
fotos/             fotos de las fichas (g/, t/) y de los hallazgos (montnegre/)
quiz/              quiz de setas (usa datos/db.js, datos/breve.js y las fotos de la web)
datos/breve.js     las 54 setas y 10 árboles del cuaderno de bolsillo (los usan el cuaderno y el quiz)
offline/           cuadernos de bolsillo en PDF
butxaca/           generadores de los libros: setas.js hace el cuaderno de bolsillo y, con guia.html, la guía esencial
tools/             generar-pdf.ps1 hace los PDF de bolsillo con Edge
guia/              solo redirige a la web (dirección antigua)
```

> **Aviso:** es una herramienta para aprender y no sustituye la revisión de un micólogo. Ninguna web, guía, foto ni aplicación certifica que una seta sea comestible. Ante la duda, no la recolecte para comer. Intoxicación: **112** · Información Toxicológica 24 h: **91 562 04 20**.

Fotos de [iNaturalist](https://www.inaturalist.org) y [Wikimedia Commons](https://commons.wikimedia.org) con licencia Creative Commons (CC BY, CC BY-NC, CC BY-SA, CC0…) o de dominio público, con el autor y la licencia en cada foto, y fotos propias sin datos de ubicación. Muchas son CC BY-NC: la web y los PDF son para uso personal o sin ánimo de lucro. Nombres según Catalogue of Life (Species Fungorum); registros de GBIF e iNaturalist.
