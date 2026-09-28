# Marquitouh

Sitio personal de [Marquitouh](https://marquitouh.github.io/) — desarrollador de software
y game designer, creador de PixelFox Studios.

**En vivo:** https://marquitouh.github.io/

## Estructura

```
index.html          Portada: sobre mí, logros, portafolio, habilidades, FAQ, canales
sobre-mi.html       Hobbies: countdown, Steam, animes, mangas, personajes, playlists, setup
comunidad.html      El Culto del Zorro: servidor, rangos, niveles, proyectos, normativa
404.html            Página de error (GitHub Pages la sirve automáticamente)

assets/
  css/
    base.css        Tokens de diseño, tema claro/oscuro, retícula, reglas, header, footer
    components.css  Tarjetas, filtros, listas, chat (vacío), roles, normas
    pages.css       Hero y layouts específicos de página
    ui.css          Índice lateral, transiciones, escaneo, modo blueprint, atajos
  js/
    core.js         Arranque, tema, reproductor de audio, navegación, scroll, retícula
    ui.js           Índice de secciones, rótulo, escaneo, atajos de teclado
    data.js         Animes, personajes, mangas, juegos, playlists, hardware
    data-comunidad.js  Rangos, niveles y normas
    home.js         Lanyard (estado de Discord), filtros de proyecto, FAQ
    hobbies.js      Render y filtros de la página de hobbies
    comunidad.js    Render, estado del servidor de Discord, copiado de IP
  audio/
    background-theme.mp3
  og-marquitouh.png Imagen para Open Graph (1200×630)

robots.txt · sitemap.xml · .nojekyll
servir.py           Servidor local para previsualizar (no se usa en producción)
```

## Verlo en local

Con doble clic sobre `index.html` funciona casi todo, pero para el estado de Discord
y el servidor de la comunidad hace falta un servidor (CORS):

```powershell
python servir.py
# http://127.0.0.1:8899
```

`python -m http.server` también sirve. Para publicar, `servir.py` no se usa.

## Detalles técnicos

- **Sin build, sin dependencias.** HTML, CSS y JS planos. Lo único externo son las
  fuentes de Google Fonts.
- **Audio:** Web Audio API con `GainNode`, volumen propio (slider custom), posición
  y estado guardados en `localStorage`, así que la música continúa entre páginas.
  Los navegadores bloquean el autoplay con sonido: arranca con el primer gesto.
- **Tema:** claro por defecto, alternable, persistido. El script inline del `<head>`
  lo aplica antes del primer pintado para que no haya parpadeo.
- **Transiciones entre páginas:** View Transitions API
  (`@view-transition { navigation: auto }`). Donde no hay soporte, navegación normal.
- **Modo retícula:** código Konami → plano técnico cian. Persistido con `R`.
- **Atajos de teclado:** `?` muestra la lista.

## Editar contenido

Casi todo se cambia en dos archivos, sin tocar el resto:

- `assets/js/data.js` — animes, personajes, mangas, juegos, playlists, hardware
- `assets/js/data-comunidad.js` — rangos, niveles, normas

## Desplegar

1. Subir todo a la rama `main` de `marquitouh.github.io`
2. **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**
3. HTTPS lo da GitHub automáticamente

`.nojekyll` está incluido para que GitHub Pages no pase el sitio por Jekyll.

## Créditos

Diseño propio. Personajes e imágenes son material de sus respectivas obras.
