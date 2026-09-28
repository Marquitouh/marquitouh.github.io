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
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const enCampo = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      const k = e.key;

      if (k === 'Escape') { cerrarPanel(); return; }

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
