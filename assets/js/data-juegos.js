/* ==========================================================================
   MARQUITOUH · PLANO TECNICO
   data-juegos.js — los 3 juegos escritos en C
   Para publicarlos: crea un repo por juego y poné la URL en REPO.
   Cada tarjeta abre el código; no se sirven .exe desde GitHub Pages.
   ========================================================================== */
window.JUEGOS = [
  {
    t: 'Tetris',
    d: 'Tetris clásico en C multiplataforma: funciona en Windows y POSIX ' +
       'con #ifdef, dibujado en consola con caracteres ASCII.',
    tags: ['C', 'Windows', 'POSIX', 'Consola'],
    meta: '8 KB de código',
    controles: 'a · d · s · w',
    REPO: 'https://github.com/Marquitouh/Tetris'
  },
  {
    t: 'Memory Evangelion',
    d: 'Juego de memoria por parejas con los personajes de Evangelion. ' +
       'Ocho pares, tablero 4×4.',
    tags: ['C', 'Consola', 'Memoria'],
    meta: '2,7 KB de código',
    REPO: 'https://github.com/Marquitouh/Memory-Evangelion'
  },
  {
    t: 'Evangelion Loving Project',
    d: 'El más grande: historia de 30 días con 9 personajes, misiones, ' +
       'logros y citas. Guarda la partida.',
    tags: ['C', 'Consola', 'Narrativa'],
    meta: '22,9 KB de código',
    REPO: 'https://github.com/Marquitouh/Evangelion-Loving-Project'
  }
];
