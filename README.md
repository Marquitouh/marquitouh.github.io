# Marquitouh

Sitio personal de [Marquitouh](https://marquitouh.github.io/) — desarrollador de software
y game designer, creador de PixelFox Studios.

**En vivo:** https://marquitouh.github.io/

## Estructura

```
index.html          Portada: sobre mí, logros, portafolio, juegos en C, habilidades, FAQ, canales
sobre-mi.html       Hobbies: countdown, Steam, animes, mangas, personajes, playlists, setup
comunidad.html      El Culto del Zorro: servidor, rangos, niveles, normativa
404.html            Página de error (GitHub Pages la sirve automáticamente)

assets/
  css/
    base.css        Tokens, tema claro/oscuro, retícula, reglas, panel de fichas, reproductor,
                    header, footer, reveal, loader. Un h1 por página, h2 de sección, h3 de tarjeta.
    components.css  Filtros, tarjetas, stats, chips, FAQ, socials, roles, normas, fichas de juego
    pages.css       Hero con cotas de medición, servidor, 404
    ui.css          Índice lateral, transiciones, escaneo, modo blueprint, atajos, paleta Ctrl+K
  js/
    core.js         Arranque, tema, reproductor (Web Audio + ecualizador), navegación, scroll,
                    retícula, registro de secciones, Konami. Expone window.MQ
    ui.js           Índice de secciones, rótulo, escaneo, fantasma, retícula, atajos, paleta
    data.js         Animes, personajes, mangas, juegos, playlists, hardware
    data-juegos.js  Los 3 juegos escritos en C, con la URL de su repositorio
    data-comunidad.js  Rangos, niveles y normas
    home.js         Lanyard (Discord), fichas de juegos en C, filtros de proyecto, FAQ
    hobbies.js      Render y filtros de la página de hobbies
    comunidad.js    Render, estado del servidor de Discord, copiado de IP
  icono-marquitouh.svg   Favicon en SVG (trazo, sin fuente) con variante de tema oscuro
  favicon-32.png · favicon-32-dark.png · apple-touch-icon.png
  icon-192.png · icon-512.png
  logo-marquitouh-strip.png  Wordmark recortado; se usa como máscara CSS
  og-marquitouh.png · og-culto.png · og-hobbies.png   Imágenes Open Graph (1200×630)

audio/background-theme.mp3
manifest.json        Instalable como app
robots.txt · sitemap.xml · .nojekyll
servir.py            Servidor local con cabeceras sin caché (no se usa en producción)
simular_github.py    Emula el comportamiento de GitHub Pages (rutas, 404, mayúsculas)
```

## Verlo en local

Con doble clic sobre `index.html` funciona casi todo, pero para el estado de Discord
y el servidor de la comunidad hace falta un servidor (CORS):

```powershell
python servir.py
# http://127.0.0.1:8899
```

`simular_github.py` arranca igual pero se comporta como GitHub Pages: `/` sirve
`index.html`, las rutasinexistentes dan el 404 real y los nombres de archivo se
respetan en mayúsculas. **Conviene probar con este antes de publicar.**

`python -m http.server` también sirve. Para publicar, ninguno de los dos se usa.

## Atajos de teclado

| Tecla | Qué hace |
|---|---|
| `Ctrl K` / `Cmd K` | Paleta de comandos (páginas, secciones, acciones, enlaces) |
| `?` | Lista de atajos |
| `T` | Tema claro / oscuro |
| `P` | Reproducir o pausar la música |
| `M` | Silenciar |
| `↑` `↓` | Volumen |
| `R` | Modo retícula (plano técnico) |
| `↑↑↓↓←→←→ B A` | Código Konami |
| `Esc` | Cerrar |

## Detalles técnicos

- **Sin build, sin dependencias.** HTML, CSS y JS planos. Lo único externo son las
  fuentes de Google Fonts.
- **Audio:** Web Audio API con `GainNode`, volumen propio (slider custom), posición
  y estado guardados en `localStorage`, así que la música continúa entre páginas.
  Los navegadores bloquean el autoplay con sonido: arranca con el primer gesto.
- **Ecualizador real:** un `AnalyserNode` cuelga entre la fuente y el `GainNode` (no
  altera el volumen) y las 4 barras leen el espectro de verdad. La ventana dB está
  ajustada a −88/−12 porque la de por defecto (−100/−30) satura cualquier pista
  masterizada y deja las cuatro barras clavadas. Si no hay Web Audio, o el visitante
  pidió menos movimiento, la animación CSS de `@keyframes eq` queda de respaldo.
  El brillo de la grilla late por *exceso* de graves sobre su media reciente, no por
  nivel absoluto: con el nivel absoluto la pista entera está masterizada y la grilla
  quedaría siempre encendida.
- **Tema:** claro por defecto, alternable, persistido. El script inline del `<head>`
  lo aplica antes del primer pintado para que no haya parpadeo.
- **Transiciones entre páginas:** View Transitions API
  (`@view-transition { navigation: auto }`). Donde no hay soporte, navegación normal.
- **Modo retícula:** código Konami → plano técnico. Persistido con `R`.
- **Revelado al hacer scroll:** un `Visor` propio en vez de `IntersectionObserver`,
  porque los elementos con `clip-path` a área cero no los detecta el observer.
- **Rejillas fluidas:** todo `repeat(auto-fit, minmax(Npx, 1fr))` usa
  `minmax(min(Npx, 100%), 1fr)`. Con el piso fijo, un contenedor más angosto que
  `Npx` desborda la página.
- **Contraste:** Lighthouse da 100/100/100 en las cuatro páginas. `--ink-3` es el
  tono mínimo permitido para texto; `--ink-4` es solo decoración (reglas, ticks) y
  los numerales de esas reglas van como contenido generado, porque no son texto que
  deba poder leerse.

## Editar contenido

Casi todo se cambia en tres archivos, sin tocar el resto:

- `assets/js/data.js` — animes, personajes, mangas, juegos, playlists, hardware
- `assets/js/data-comunidad.js` — rangos, niveles, normas
- `assets/js/data-juegos.js` — los 3 juegos en C. El campo `REPO` es la única URL
  que hay que completar; si queda vacío, la ficha se ve pero no es clickeable, para
  no mandar a nadie a un 404.

Para cambiar el icono del sitio hay que regenerar los PNG desde
`assets/icono-marquitouh.svg` (los navegadores no rasterizan SVG a PNG por sí
mismos). Para las imágenes OG, se edita el generador y se vuelve a producir el PNG.

## Desplegar

1. Subir todo a la rama `main` de `marquitouh.github.io`
2. **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**
3. HTTPS lo da GitHub automáticamente

El repositorio tiene que llamarse **exactamente** `marquitouh.github.io` para que
sirva desde la raíz y las rutas relativas funcionen.

`.nojekyll` está incluido para que GitHub Pages no pase el sitio por Jekyll.
`README.md`, `servir.py` y `simular_github.py` no hacen falta en producción: se
pueden excluir al subir.

## Créditos

Diseño propio. Personajes e imágenes son material de sus respectivas obras.
