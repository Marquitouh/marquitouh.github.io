/* ==========================================================================
   MARQUITOUH · PLANO TECNICO
   ui.js — indice lateral, transiciones, escaneo, modo blueprint y atajos
   Depende de window.MQ (lo define core.js, que se carga antes).
   ========================================================================== */
(() => {
  'use strict';

  const DOC  = document;
  const ROOT = DOC.documentElement;
  const $    = (s, r = DOC) => r.querySelector(s);
  const $$   = (s, r = DOC) => Array.from(r.querySelectorAll(s));
  const MQ   = window.MQ || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ======================================================================
     1 · ÍNDICE DE SECCIONES EN LA REGLA DEL BORDE
     La regla izquierda deja de ser decorativa: muestra la sección que
     estás leyendo, y se mueve a medida que scrolleás.
     ====================================================================== */
  function indiceLateral() {
    const rulers = $$('.ruler');
    if (!rulers.length || !MQ.seccion) return;

    rulers.forEach((r) => {
      const d = DOC.createElement('div');
      d.className = 'ruler__sec';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<b></b><span></span>';
      r.appendChild(d);
    });

    let ultima = null;

    const tick = () => {
      const s = MQ.seccion.actual();
      if (!s) return;
      const cambio = s !== ultima;
      ultima = s;
      MQ.seccion.activa = s;

      const p = MQ.seccion.progreso(s);
      rulers.forEach((r) => {
        const d = $('.ruler__sec', r);
        d.style.top = (p * 100).toFixed(2) + '%';
        if (cambio) {
          $('b', d).textContent = s.num;
          $('span', d).textContent = s.corto;
          d.classList.remove('is-on');
          // reinicia la animacion de entrada
          void d.offsetWidth;
          d.classList.add('is-on');
        }
      });

      // rotulo fijo (movil) + filete de avance de la seccion
      const fijo = $('.sec-rotulo');
      if (fijo) {
        $('[data-sr-num]', fijo).textContent = s.num;
        $('[data-sr-nom]', fijo).textContent = s.corto;
        fijo.classList.toggle('is-on', scrollY > 260);
        $('.sec-rotulo__fill', fijo).style.width =
          (MQ.seccion.interno(s) * 100).toFixed(1) + '%';
      }
    };

    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
    addEventListener('resize', tick);
    setTimeout(tick, 60);
    DOC.addEventListener('plano:listo', () => setTimeout(tick, 30));
  }

  /* ======================================================================
     2 · ROTULO FIJO DE SECCION (lo que en movil reemplaza a la regla)
     ====================================================================== */
  function rotulo() {
    if (document.querySelector('.sec-rotulo')) return;
    const d = DOC.createElement('div');
    d.className = 'sec-rotulo';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML =
      '<span class="sec-rotulo__n" data-sr-num>01</span>' +
      '<span class="sec-rotulo__t" data-sr-nom>Portada</span>' +
      '<span class="sec-rotulo__bar"><i class="sec-rotulo__fill"></i></span>';
    DOC.body.appendChild(d);
  }

  /* ======================================================================
     3 · ESCANEO POR SECCION
     Cuando una sección entra, una línea la recorre una sola vez.
     ====================================================================== */
  function escaneo() {
    if (reduce || !('IntersectionObserver' in window)) return;
    const secs = $$('main section');
    if (!secs.length) return;

    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting || e.target.classList.contains('es-scan')) return;
        e.target.classList.add('es-scan');
        setTimeout(() => e.target.classList.remove('es-scan'), 1400);
        io.unobserve(e.target);
      });
    }, { threshold: .12 });

    secs.forEach((s) => io.observe(s));
  }

  /* ======================================================================
     4 · PREVIEW FANTASMA DEL PORTAFOLIO
     ====================================================================== */
  function fantasma() {
    const items = $$('[data-fondo]');
    if (!items.length || reduce) return;
    const capa = DOC.createElement('div');
    capa.className = 'proy-fantasma';
    capa.setAttribute('aria-hidden', 'true');
    DOC.body.appendChild(capa);

    let t;
    items.forEach((it) => {
      it.addEventListener('pointerenter', () => {
        clearTimeout(t);
        capa.style.backgroundImage = 'url(' + it.dataset.fondo + ')';
        capa.classList.add('is-on');
      });
      it.addEventListener('pointerleave', () => {
        clearTimeout(t);
        t = setTimeout(() => capa.classList.remove('is-on'), 260);
      });
    });
  }

  /* ======================================================================
     5 · MODO RETICULA (Konami) — plano tecnico puro + HUD
     ====================================================================== */
  function modoReticula() {
    if (DOC.querySelector('.ret-hud')) return;
    const hud = DOC.createElement('div');
    hud.className = 'ret-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML =
      '<i class="ret-hud__c ret-hud__c--tl"></i><i class="ret-hud__c ret-hud__c--tr"></i>' +
      '<i class="ret-hud__c ret-hud__c--bl"></i><i class="ret-hud__c ret-hud__c--br"></i>' +
      '<span class="ret-hud__t">◈ SCANNING</span>' +
      '<span class="ret-hud__x" data-ret-x>0000</span>' +
      '<span class="ret-hud__y" data-ret-y>0000</span>';
    DOC.body.appendChild(hud);
  }

  function hud() {
    const x = $('[data-ret-x]');
    const y = $('[data-ret-y]');
    if (!x || !y) return;
    addEventListener('pointermove', (e) => {
      x.textContent = String(Math.round(e.clientX)).padStart(4, '0');
      y.textContent = String(Math.round(e.clientY)).padStart(4, '0');
    }, { passive: true });
  }

  /* ======================================================================
     6 · PANEL DE ATAJOS (tecla ?)
     ====================================================================== */
  const ATAJOS = [
    ['Ctrl K', 'Paleta de comandos'],
    ['?', 'Abrir / cerrar esta ayuda'],
    ['T', 'Cambiar tema claro / oscuro'],
    ['P', 'Reproducir o pausar la música'],
    ['M', 'Silenciar'],
    ['↑ ↓', 'Volumen'],
    ['R', 'Modo retícula (plano técnico)'],
    ['↑↑↓↓←→←→ B A', 'Código Konami'],
    ['Esc', 'Cerrar']
  ];

  function panel() {
    if (DOC.querySelector('.atajos')) return;
    const d = DOC.createElement('div');
    d.className = 'atajos';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Atajos de teclado');
    d.innerHTML =
      '<div class="atajos__box">' +
        '<div class="atajos__top"><span>Atajos de teclado</span>' +
          '<button class="atajos__x" type="button" data-atajos-cerrar aria-label="Cerrar">✕</button></div>' +
        '<dl class="atajos__l">' +
          ATAJOS.map(([k, d2]) =>
            '<div><dt>' + k.split(' ').map((x) => '<kbd>' + x + '</kbd>').join(' ') +
            '</dt><dd>' + d2 + '</dd></div>').join('') +
        '</dl>' +
      '</div>';
    DOC.body.appendChild(d);
    $('[data-atajos-cerrar]', d).addEventListener('click', () => cerrarPanel());
    d.addEventListener('click', (e) => { if (e.target === d) cerrarPanel(); });
  }

  let panelAbierto = false;
  function abrirPanel() {
    panel();
    $('.atajos').classList.add('is-on');
    panelAbierto = true;
  }
  function cerrarPanel() {
    const d = $('.atajos');
    if (d) d.classList.remove('is-on');
    panelAbierto = false;
  }

  /* ======================================================================
     7 · TECLAS
     ====================================================================== */
  function teclas() {
    addEventListener('keydown', (e) => {
      const k = e.key;

      // Ctrl+K / Cmd+K va PRIMERO: el resto de atajos se descarta si hay
      // modificador, pero la paleta vive justamente en Ctrl
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (k === 'k' || k === 'K')) {
        e.preventDefault();
        Paleta.alternar();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);

      if (k === 'Escape') { cerrarPanel(); Paleta.cerrar(); return; }

      if (k === '?' || (k === '/' && e.shiftKey)) {
        e.preventDefault();
        panelAbierto ? cerrarPanel() : abrirPanel();
        return;
      }
      if (enCampo || !MQ.player) return;

      switch (k.toLowerCase()) {
        case 't': { const b = $('[data-theme-toggle]'); if (b) b.click(); break; }
        case 'p': MQ.player.toggle(); break;
        case 'm': MQ.player.mutear(); break;
        case 'r': DQ.toggleReticle(); break;
        case 'arrowup':   e.preventDefault(); MQ.player.moverVol(.05); break;
        case 'arrowdown': e.preventDefault(); MQ.player.moverVol(-.05); break;
      }
    });
  }

  /* el toggle del modo reticula vive en core.js; lo expone aca */
  const DQ = {
    toggleReticle() {
      const b = $('[data-reticle]');
      if (b) b.click();
      else DOC.body.classList.toggle('reticle-on');
    }
  };

  /* ======================================================================
     8 · PISTA DE LOS ATAJOS
     Un "?" chiquito que aparece al pasar el mouse por la esquina, para que
     el panel con "?" se pueda descubrir.
     ====================================================================== */
  function pista() {
    if (DOC.querySelector('.pista-atajos')) return;
    const b = DOC.createElement('button');
    b.className = 'pista-atajos';
    b.type = 'button';
    b.setAttribute('aria-label', 'Ver atajos de teclado');
    b.textContent = '?';
    b.addEventListener('click', abrirPanel);
    DOC.body.appendChild(b);

    let t;
    const mostrar = () => { clearTimeout(t); t = setTimeout(() => b.classList.add('is-on'), 700); };
    const ocultar = () => { clearTimeout(t); b.classList.remove('is-on'); };
    addEventListener('pointermove', (e) => {
      if (e.clientX > innerWidth - 190 && e.clientY > innerHeight - 150) mostrar();
      else ocultar();
    }, { passive: true });
    addEventListener('pointerleave', ocultar);
  }

  /* ======================================================================
     8 · PALETA DE COMANDOS (Ctrl+K / Cmd+K)
     Una sola caja para moverse: paginas, secciones de esta pagina, acciones
     del sitio y enlaces externos. Todo lo que se puede llegar con el mouse
     tambien se llega escribiendo.
     ====================================================================== */
  const Paleta = (() => {
    let raiz, campo, lista, resultados = [], sel = 0, abierto = false, focoPrevio = null;

    /*去掉 acentos y mayusculas para que "comu" encuentre "comunidad" */
    const norm = (s) => String(s).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    /* coincidencia por subsecuencia, como en un command palette de verdad:
       los caracteres tecleados tienen que aparecer en orden. Devuelve null si
       no calza, o la posicion del primer hueco (mejor = mas temprano). */
    function puntuar(texto, q) {
      if (!q) return 0;
      const t = norm(texto);
      let i = 0, hueco = 0, enPalabra = true;
      for (let c = 0; c < q.length; c++) {
        const j = t.indexOf(q[c], i);
        if (j < 0) return null;
        if (j > i) hueco += (enPalabra ? 0 : 1);
        enPalabra = j === 0 || t[j - 1] === ' ';
        i = j + 1;
      }
      return hueco - (t.length * .01);
    }

    function acciones() {
      const listaA = [
        { g: 'Acciones', t: 'Cambiar tema claro / oscuro', k: 'T', f: () => {
            const b = $('[data-theme-toggle]'); if (b) b.click();
          } },
        { g: 'Acciones', t: 'Reproducir o pausar la música', k: 'P', f: () => MQ.player.toggle() },
        { g: 'Acciones', t: 'Silenciar', k: 'M', f: () => MQ.player.mutear() },
        { g: 'Acciones', t: 'Subir volumen', k: '↑', f: () => MQ.player.moverVol(.05) },
        { g: 'Acciones', t: 'Bajar volumen', k: '↓', f: () => MQ.player.moverVol(-.05) },
        { g: 'Acciones', t: 'Modo retícula (plano técnico)', k: 'R', f: () => DQ.toggleReticle() },
        { g: 'Acciones', t: 'Ver atajos de teclado', k: '?', f: () => abrirPanel() }
      ];
      return listaA;
    }

    function externas() {
      return $$('a[href^="http"]')
        .filter((a) => !a.hostname || a.hostname !== location.hostname)
        .filter((a) => a.offsetParent !== null || a.closest('.juego, .social, [data-fondo]'))
        .map((a) => {
          // Las tarjetas de juego y los botones sociales tienen varios bloques
          // de texto: pegados dan un desastre. data-paleta gana; si no, se
          // arma con las partes que ya existen en la marca.
          const k = a.querySelector('.social__k');
          const u = a.querySelector('.social__u');
          const armado = k && u ? k.textContent.trim() + ' ' + u.textContent.trim() : '';
          return {
            g: 'Enlaces',
            t: (a.getAttribute('data-paleta') || armado || a.textContent || a.href)
                 .trim().replace(/\s+/g, ' ').slice(0, 70),
            u: a.href
          };
        });
    }

    function catalogo() {
      const salida = [];
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

      $$('main section[id]').forEach((s) => {
        if (s.classList.contains('hero')) return;    // la portada no es destino
        const h = s.querySelector('h2');
        const num = s.querySelector('.sec__num');
        salida.push({
          g: 'En esta página',
          t: (h ? h.textContent : cap(s.id)).trim().replace(/\s+/g, ' '),
          s: (num ? num.textContent + ' · ' : '') + s.id,
          f: () => {
            s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
            history.replaceState(null, '', '#' + s.id);
          }
        });
      });

      $$('.nav a[href]').forEach((a) => {
        const archivo = (a.getAttribute('href') || '').split('#')[0];
        if (!archivo) return;                       // anclas dentro de la pagina
        salida.push({ g: 'Ir a', t: a.textContent.trim() + ' — ' + archivo, u: a.getAttribute('href') });
      });

      return salida.concat(acciones()).concat(externas());
    }

    function filtrar(q) {
      const todo = catalogo();
      if (!q.trim()) return todo;
      return todo
        .map((it) => ({ it, s: puntuar(it.t, norm(q.trim())) }))
        .filter((x) => x.s !== null)
        .sort((a, b) => a.s - b.s)
        .slice(0, 40)
        .map((x) => x.it);
    }

    function pintar() {
      lista.innerHTML = resultados.length
        ? resultados.map((it, i) => {
            const etiq = it.g ? '<span class="pal__g">' + it.g + '</span>' : '';
            const sub  = it.s ? '<span class="pal__s">' + it.s + '</span>' :
                         it.k ? '<kbd class="pal__k">' + it.k + '</kbd>' : '';
            const exi  = it.u && it.u !== location.pathname.split('/').pop() + location.hash
                          ? '<span class="pal__x">↗</span>' : '';
            return '<li class="pal__it' + (i === sel ? ' is-sel' : '') + '" role="option" id="pal-i' + i +
                   '" aria-selected="' + (i === sel) + '" data-i="' + i + '">' +
                   etiq + '<span class="pal__t">' + it.t + '</span>' + sub + exi + '</li>';
          }).join('')
        : '<li class="pal__vacio" role="option" aria-selected="false" aria-disabled="true">Sin coincidencias</li>';
      campo.setAttribute('aria-activedescendant', resultados.length ? 'pal-i' + sel : '');
    }

    function mover(d) {
      if (!resultados.length) return;
      sel = (sel + d + resultados.length) % resultados.length;
      pintar();
      const n = lista.querySelector('.is-sel');
      if (n) n.scrollIntoView({ block: 'nearest' });
    }

    function correr(it) {
      cerrar();
      if (!it) return;
      if (typeof it.f === 'function') { it.f(); return; }
      if (it.u) { if (/\.html$/.test(it.u)) location.href = it.u; else window.open(it.u, '_blank', 'noopener'); }
    }

    function construir() {
      if (raiz) return;
      raiz = DOC.createElement('div');
      raiz.className = 'pal';
      raiz.setAttribute('role', 'dialog');
      raiz.setAttribute('aria-modal', 'true');
      raiz.setAttribute('aria-label', 'Paleta de comandos');
      raiz.innerHTML =
        '<div class="pal__box">' +
          '<div class="pal__top">' +
            '<span class="pal__ico" aria-hidden="true">⌘</span>' +
            '<input class="pal__in" type="text" role="combobox" aria-expanded="true" ' +
              'aria-controls="pal-lista" aria-autocomplete="list" autocomplete="off" ' +
              'autocorrect="off" autocapitalize="off" spellcheck="false" ' +
              'placeholder="Buscar páginas, secciones, acciones…">' +
            '<kbd class="pal__esc">Esc</kbd>' +
          '</div>' +
          '<ul class="pal__l" id="pal-lista" role="listbox" aria-label="Resultados"></ul>' +
          '<div class="pal__pie">' +
            '<span><kbd>↑</kbd><kbd>↓</kbd> moverse</span>' +
            '<span><kbd>↵</kbd> abrir</span>' +
            '<span><kbd>Esc</kbd> cerrar</span>' +
          '</div>' +
        '</div>';
      DOC.body.appendChild(raiz);

      campo = $('.pal__in', raiz);
      lista = $('#pal-lista', raiz);

      campo.addEventListener('input', () => { sel = 0; resultados = filtrar(campo.value); pintar(); });
      campo.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown': e.preventDefault(); mover(1); break;
          case 'ArrowUp':   e.preventDefault(); mover(-1); break;
          case 'Enter':     e.preventDefault(); correr(resultados[sel]); break;
          case 'Escape':    e.preventDefault(); cerrar(); break;
          case 'Home':      e.preventDefault(); sel = 0; pintar(); break;
          case 'End':       e.preventDefault(); sel = resultados.length - 1; pintar(); break;
          case 'Tab':       e.preventDefault(); mover(e.shiftKey ? -1 : 1); break;
        }
      });

      lista.addEventListener('click', (e) => {
        const it = e.target.closest('[data-i]');
        if (it) correr(resultados[+it.dataset.i]);
      });
      lista.addEventListener('mousemove', (e) => {
        const it = e.target.closest('[data-i]');
        if (it && +it.dataset.i !== sel) { sel = +it.dataset.i; pintar(); }
      });

      raiz.addEventListener('mousedown', (e) => { if (e.target === raiz) cerrar(); });
    }

    function abrir() {
      construir();
      if (abierto) return;
      // no pueden quedar dos dialogos apilados: si el panel de atajos esta
      // abierto, se cierra y la paleta queda sola arriba
      cerrarPanel();
      abierto = true;
      focoPrevio = DOC.activeElement;
      raiz.classList.add('is-on');
      campo.value = '';
      sel = 0;
      resultados = filtrar('');
      pintar();
      // Un elemento con visibility:hidden NO admite foco. Recién al segundo
      // frame la transicion ya/volteo la visibilidad, asi que recien ahi se
      // puede enfocar; el setTimeout es la red por si ese frame no llega.
      requestAnimationFrame(() => requestAnimationFrame(() => campo.focus()));
      setTimeout(() => { if (abierto && DOC.activeElement !== campo) campo.focus(); }, 120);
    }

    function cerrar() {
      if (!raiz || !abierto) return;
      abierto = false;
      raiz.classList.remove('is-on');
      if (focoPrevio && focoPrevio.focus) focoPrevio.focus();
    }

    function alternar() { abierto ? cerrar() : abrir(); }

    /* el foco no puede escaparse del dialogo mientras esta abierto */
    addEventListener('focusin', (e) => {
      if (abierto && raiz && !raiz.contains(e.target)) campo.focus();
    });

    return { abrir, cerrar, alternar, activo: () => abierto };
  })();

  /* ======================================================================
     ARRANQUE
     Las transiciones entre paginas las maneja el CSS con
     "@view-transition { navigation: auto }": es lo nativo y no hace falta
     interceptar clicks, asi que no se rompe el boton derecho ni "abrir en
     pestana nueva".
     ====================================================================== */
  function init() {
    rotulo();
    modoReticula();
    panel();
    indiceLateral();
    escaneo();
    fantasma();
    hud();
    teclas();
    pista();
  }

  if (DOC.readyState === 'loading') DOC.addEventListener('DOMContentLoaded', init);
  else init();
})();
