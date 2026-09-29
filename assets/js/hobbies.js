/* ==========================================================================
   MARQUITOUH · PLANO TECNICO
   hobbies.js — render y filtros de la página de hobbies
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const D  = window.HOBBIES;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

  /* Al renderizar de a poco se nota el trabajo */
  const escalonar = (cont, paso) => {
    $$('[data-reveal]', cont).forEach((el, i) =>
      el.style.setProperty('--rv-d', Math.min(i * paso, 700) + 'ms'));
  };

  /* Cada re-render tiene que volver a registrar las tarjetas con el Visor de
     core.js: si no, nacen con opacity:0 y el observer ya se desarmó al boot.
     inmediato = true las muestra al instante (lo usa el buscador, que se
     redibuja en cada tecla y si no parpadea). */
  const pintado = (cont, paso, inmediato) => {
    escalonar(cont, paso || 0);
    if (window.MQ && window.MQ.revelar) window.MQ.revelar(cont, !!inmediato);
  };

  /* Normaliza para buscar: sin acentos y con cualquier separador tratado
     como espacio. Los generos usan "•", asi que tiene que funcionar buscar
     "mecha psicologico", "psicologico" o "mecha,psicologico". */
  const norm = (s) => String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[•·,;:_/\\|()[\]{}"'`~!?¿¡+=<>@#$%^&*–—-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tarjeta = (img, badges, cuerpo, extra) =>
    '<article class="card"' + (extra || '') + ' data-reveal="up">' +
      '<div class="card__img' + (img.tall ? ' card__img--tall' : '') + '">' +
        '<img src="' + esc(img.url) + '" alt="" loading="lazy" decoding="async">' +
        badges +
      '</div>' +
      '<div class="card__b">' + cuerpo + '</div>' +
    '</article>';

  const badge = (txt, cls) => '<span class="badge ' + (cls || '') + '">' + esc(txt) + '</span>';

  /* ======================================================================
     JUEGOS DE STEAM
     ====================================================================== */
  function juegos() {
    const cont = $('#juegos');
    if (!cont) return;
    cont.innerHTML = D.juegos.map((j, i) => tarjeta(
      { url: j.img },
      '<span class="badge badge--dark badge--l">' + String(i + 1).padStart(2, '0') + '</span>',
      '<h3>' + esc(j.t) + '</h3><div class="card__m">' + esc(j.g) + '</div>'
    )).join('');
    pintado(cont, 55);
  }

  /* ======================================================================
     ANIMES — filtro por estado + búsqueda
     ====================================================================== */
  function animes() {
    const cont = $('#grid-animes');
    if (!cont) return;
    let estado = 'all';
    let texto = '';

    /* cache del texto normalizado de cada anime, para no recalcular en cada tecla */
    const heno = D.animes.map((a) => norm(a.titulo + ' ' + a.genero));

    const pintar = () => {
      const tokens = norm(texto).split(' ').filter(Boolean);
      const lista = D.animes.map((a, i) => ({ a, i }))
        .filter(({ a, i }) => {
          if (estado !== 'all' && a.estado !== estado) return false;
          return tokens.every((tk) => heno[i].includes(tk));
        })
        .map(({ a }) => a);

      if (!lista.length) {
        cont.innerHTML = '<p class="vacio" style="grid-column:1/-1">' +
          (tokens.length
            ? 'Sin resultados para «' + esc(texto.trim()) + '»'
            : 'Sin animes en este estado') + '</p>';
        return;
      }

      const CLASE = { visto: 'badge--red', emision: 'badge--dark', pendiente: '' };
      const TXT   = { visto: 'Visto', emision: 'En emisión', pendiente: 'Pendiente' };

      cont.innerHTML = lista.map((a) =>
        '<a class="card" href="' + esc(a.malUrl) + '" target="_blank" rel="noopener" data-reveal="up">' +
          '<div class="card__img card__img--tall">' +
            '<img src="' + esc(a.cover) + '" alt="" loading="lazy" decoding="async">' +
            badge(TXT[a.estado], 'badge--l ' + CLASE[a.estado]) +
            '<span class="badge badge--r">★ ' + esc(a.score) + '</span>' +
          '</div>' +
          '<div class="card__b">' +
            '<h3>' + esc(a.titulo) + '</h3>' +
            '<div class="card__m">' + esc(a.genero) + '</div>' +
          '</div>' +
        '</a>'
      ).join('');
      pintado(cont, 50, true);
    };

    $$('#f-animes button').forEach((b) => b.addEventListener('click', () => {
      $$('#f-animes button').forEach((x) => x.classList.toggle('is-on', x === b));
      estado = b.dataset.st;
      pintar();
    }));

    const input = $('#q-animes');
    if (input) input.addEventListener('input', () => { texto = input.value; pintar(); });

    pintar();
  }

  /* ======================================================================
     MANGAS
     ====================================================================== */
  function mangas() {
    const cont = $('#grid-mangas');
    if (!cont) return;
    cont.innerHTML = D.mangas.map((m) => tarjeta(
      { url: m.img },
      badge(m.estado, 'badge--l ' + m.clase) + '<span class="badge badge--r">★ ' + esc(m.score) + '</span>',
      '<div class="card__m">' + esc(m.tipo) + '</div>' +
      '<h3 style="margin-top:8px">' + esc(m.titulo) + '</h3>' +
      '<p class="card__d">' + esc(m.d) + '</p>'
    )).join('');
    pintado(cont, 80);
  }

  /* ======================================================================
     PERSONAJES — filtro por grupo + ver más
     ====================================================================== */
  function personajes() {
    const cont = $('#grid-personajes');
    const filtros = $('#f-personajes');
    const btnMas = $('#btn-mas');
    const masTxt = $('#mas-txt');
    const wrapMas = $('#wrap-mas');
    if (!cont) return;

    const VISTOS = 15;
    let grupo = 'all';
    let expandido = false;

    filtros.innerHTML =
      '<button type="button" class="is-on" data-g="all">Todos <b>' +
        String(D.personajes.length).padStart(2, '0') + '</b></button>' +
      D.gruposPersonajes.map((g) => {
        const n = D.personajes.filter((p) => p.c === g.id).length;
        return '<button type="button" data-g="' + g.id + '">' + esc(g.label) +
               ' <b>' + String(n).padStart(2, '0') + '</b></button>';
      }).join('');

    const pintar = () => {
      const lista = grupo === 'all'
        ? D.personajes.slice(0, expandido ? undefined : VISTOS)
        : D.personajes.filter((p) => p.c === grupo);

      cont.innerHTML = lista.map((p) => tarjeta(
        { url: p.img, tall: true },
        '',
        '<h3>' + esc(p.n) + '</h3><div class="card__m">' + esc(p.s) + '</div>'
      )).join('');
      pintado(cont, 32);

      if (wrapMas) wrapMas.hidden = grupo !== 'all';
    };

    $$('#f-personajes button').forEach((b) => b.addEventListener('click', () => {
      $$('#f-personajes button').forEach((x) => x.classList.toggle('is-on', x === b));
      grupo = b.dataset.g;
      expandido = false;
      masTxt.textContent = 'Ver más personajes';
      pintar();
    }));

    if (btnMas) btnMas.addEventListener('click', () => {
      expandido = !expandido;
      masTxt.textContent = expandido ? 'Ver menos' : 'Ver más personajes';
      pintar();
    });

    pintar();
  }

  /* ======================================================================
     SPOTIFY
     ====================================================================== */
  function playlists() {
    const cont = $('#grid-playlists');
    if (!cont) return;
    cont.innerHTML = D.playlists.map((p) =>
      '<a class="card" href="' + esc(p.url) + '" target="_blank" rel="noopener" data-reveal="up">' +
        '<div class="card__img">' +
          '<img src="' + esc(p.img) + '" alt="" loading="lazy" decoding="async">' +
          '<span class="badge badge--red badge--l">▶ Play</span>' +
        '</div>' +
        '<div class="card__b"><h3>' + esc(p.t) + '</h3>' +
        '<div class="card__m">' + esc(p.g) + '</div></div>' +
      '</a>').join('');
    pintado(cont, 70);
  }

  /* ======================================================================
     SETUP
     ====================================================================== */
  function setup() {
    const cont = $('#grid-setup');
    if (!cont) return;
    cont.innerHTML = D.setup.map((b) =>
      '<div class="panel panel--notch panel--marks" data-reveal="up">' +
        '<div style="padding:22px 22px 8px">' +
          '<span class="tag">' + esc(b.t) + '</span>' +
        '</div>' +
        '<dl class="spec" style="padding:0 22px 16px">' +
          b.rows.map((r) =>
            '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>').join('') +
        '</dl>' +
      '</div>').join('');
    pintado(cont, 90);
  }

  /* ======================================================================
     CUENTA REGRESIVA — 21 de julio
     ====================================================================== */
  function cumple() {
    const cont = $('#countdown');
    if (!cont) return;
    const dos = (n) => String(n).padStart(2, '0');
    const leer = (k) => $('[data-cd="' + k + '"]', cont);

    const tick = () => {
      const ahora = new Date();
      let anio = ahora.getFullYear();
      let prox = new Date(anio, 6, 21, 0, 0, 0);
      if (ahora > prox) prox = new Date(++anio, 6, 21, 0, 0, 0);

      const ms = prox - ahora;
      leer('d').textContent = dos(Math.floor(ms / 864e5));
      leer('h').textContent = dos(Math.floor(ms / 36e5) % 24);
      leer('m').textContent = dos(Math.floor(ms / 6e4) % 60);
      leer('s').textContent = dos(Math.floor(ms / 1e3) % 60);
    };

    tick();
    setInterval(tick, 1000);
  }

  /* ======================================================================
     ARRANQUE
     ====================================================================== */
  function init() {
    juegos();
    animes();
    mangas();
    personajes();
    playlists();
    setup();
    cumple();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
