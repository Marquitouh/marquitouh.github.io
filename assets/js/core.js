/* ==========================================================================
   MARQUITOUH · PLANO TECNICO
   core.js — arranque, tema, reproductor, navegación, scroll, retícula
   Se carga igual en las 3 páginas. Sin dependencias.
   ========================================================================== */
(() => {
  'use strict';

  const DOC  = document;
  const ROOT = DOC.documentElement;
  const $    = (s, r = DOC) => r.querySelector(s);
  const $$   = (s, r = DOC) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine   = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;

  /* ======================================================================
     1 · TEMA  (CLARO por defecto)
     ====================================================================== */
  const Tema = (() => {
    const KEY = 'mq.theme';
    const meta = $('meta[name="theme-color"]');
    const PALE = { light: '#F7F6F3', dark: '#0A0A0B' };

    const paint = (t) => {
      ROOT.setAttribute('data-theme', t);
      if (meta) meta.setAttribute('content', PALE[t]);
      $$('[data-theme-toggle]').forEach((b) => {
        b.setAttribute('aria-pressed', String(t === 'dark'));
        b.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      });
      DOC.dispatchEvent(new CustomEvent('tema:cambio', { detail: t }));
    };

    const get = () => ROOT.getAttribute('data-theme') || localStorage.getItem(KEY) || 'light';

    const init = () => {
      paint(get());
      $$('[data-theme-toggle]').forEach((b) =>
        b.addEventListener('click', () => {
          const next = get() === 'dark' ? 'light' : 'dark';
          localStorage.setItem(KEY, next);
          paint(next);
        })
      );
    };

    return { init, get };
  })();

  /* ======================================================================
     2 · CAPA DE PLANO — retícula, cruces, escaneo, grano
        + reglas de borde + cursor-retícula
     ====================================================================== */
  const Plano = (() => {
    const SVG_CROSS_LIGHT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 51v18M51 60h18' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E\")";

    function capa() {
      const d = DOC.createElement('div');
      d.className = 'plano';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML =
        '<div class="plano__grid"></div>' +
        '<div class="plano__bass"></div>' +
        '<div class="plano__cross"></div>' +
        (reduce ? '' : '<div class="plano__scan"></div>') +
        '<div class="plano__grain"></div>';
      DOC.body.prepend(d);
    }

    /* --- Reglas de borde con ticks numerados --- */
    function regla(lado) {
      const r = DOC.createElement('div');
      r.className = 'ruler ruler--' + lado;
      r.setAttribute('aria-hidden', 'true');
      r.innerHTML = '<div class="ruler__ticks"></div><div class="ruler__prog"></div><div class="ruler__nums"></div>';
      DOC.body.appendChild(r);
      return r;
    }

    const TICK = 30;   // px por tick
    const STEP = 5;    // un número cada STEP ticks

    function pintarNums(r) {
      const alto = DOC.documentElement.scrollHeight;
      const total = Math.max(40, Math.ceil(alto / TICK) + 4);
      let html = '';
      for (let i = 0; i < total; i++) {
        // El numero va en data-n, no como texto: el CSS lo pinta con
        // content: attr(data-n). Son marcas de escala decorativas y no
        // deberian contarse como texto legible.
        html += (i % STEP === 0)
          ? '<span data-i="' + (i / STEP) + '" data-n="' + String(i / STEP).padStart(2, '0') + '"></span>'
          : '<span></span>';
      }
      $('.ruler__nums', r).innerHTML = html;
    }

    let rulers = [];
    function init() {
      capa();
      rulers = [regla('l'), regla('r')];
      rulers.forEach(pintarNums);
    }

    function repintar() { rulers.forEach(pintarNums); }

    /* --- Marcador de posición en las reglas --- */
    function marcar(p) {
      rulers.forEach((r) => {
        $('.ruler__prog', r).style.height = (p * 100).toFixed(2) + '%';
        const act = Math.floor((p * (DOC.documentElement.scrollHeight)) / (TICK * STEP));
        $$('.ruler__nums span', r).forEach((s, i) =>
          s.classList.toggle('on', i === act)
        );
      });
    }

    /* --- Cursor retícula --- */
    function cursor() {
      if (!fine || reduce) return;
      DOC.body.classList.add('has-cursor');
      const c = DOC.createElement('div');
      c.className = 'cursor';
      c.setAttribute('aria-hidden', 'true');
      c.innerHTML =
        '<div class="cursor__ring"></div><div class="cursor__cross"></div>' +
        '<div class="cursor__label">0000 · 0000</div>';
      DOC.body.appendChild(c);

      const lab = $('.cursor__label', c);
      let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;

      addEventListener('pointermove', (e) => {
        tx = e.clientX; ty = e.clientY;
        c.classList.add('is-ready');
      }, { passive: true });
      addEventListener('pointerdown', () => c.classList.add('is-down'));
      addEventListener('pointerup',   () => c.classList.remove('is-down'));
      addEventListener('pointerover', (e) => {
        c.classList.toggle('is-hot', !!e.target.closest('a, button, .panel, [data-hot]'));
      }, { passive: true });

      (function loop() {
        x = lerp(x, tx, .22); y = lerp(y, ty, .22);
        c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        lab.textContent =
          String(Math.round(x)).padStart(4, '0') + ' · ' + String(Math.round(y)).padStart(4, '0');
        requestAnimationFrame(loop);
      })();
    }

    return { init, repintar, marcar, cursor };
  })();

  /* ======================================================================
     3 · ARRANQUE TIPO SISTEMA (loader)
     ====================================================================== */
  const Boot = (() => {
    const KEY = 'mq.booted';
    const LOG = [
      'INICIANDO SISTEMA DE PLANO',
      'CALIBRANDO RETICULA ......... OK',
      'MONTANDO MARCOS ............. OK',
      'TRAZANDO LOGO MARQUITOUH .... OK',
      'ENLACE A DISPOSITIVOS ....... OK',
      'ACCESO CONCEDIDO'
    ];

    function el() {
      const d = DOC.createElement('div');
      d.className = 'loader';
      d.id = 'loader';
      d.setAttribute('role', 'status');
      d.setAttribute('aria-live', 'polite');
      d.innerHTML =
        '<div class="loader__box">' +
          '<div class="loader__top"><span>MARQUITOUH.SYS</span><span class="loader__pct">000</span></div>' +
          '<div class="loader__bar"><i></i></div>' +
          '<div class="loader__log"></div>' +
          '<div class="loader__logo"></div>' +
        '</div>';
      return d;
    }

    function run(done) {
      /* En navegaciones entre paginas NO mostramos el loader: la transicion
         de entrada hace ese trabajo y un flash de arranque se siente lento. */
      const primera = !reduce && !sessionStorage.getItem(KEY);
      if (!primera) {
        DOC.documentElement.classList.remove('is-booting');
        DOC.body.classList.remove('is-booting');
        ancla();
        if (done) done();
        return;
      }

      const box = el();
      DOC.body.appendChild(box);
      DOC.body.classList.add('is-booting');

      const pct  = $('.loader__pct', box);
      const bar  = $('.loader__bar i', box);
      const log  = $('.loader__log', box);

      const total = LOG.length;
      let i = 0;

      const paso = () => {
        if (i < total) {
          const linea = DOC.createElement('div');
          linea.textContent = LOG[i];
          linea.style.animationDelay = '0ms';
          log.appendChild(linea);
          if (i > 0) log.firstChild.remove();

          const p = Math.round(((i + 1) / total) * 100);
          pct.textContent = String(p).padStart(3, '0');
          bar.style.right = (100 - p) + '%';

          i++;
          setTimeout(paso, 200);
        } else {
          box.classList.add('is-ready');
          setTimeout(() => cerrar(box, done), 420);
        }
      };
      setTimeout(paso, 260);

      // Seguro: si la pestaña pierde el foco los timers se ralentizan y el
      // arranque podría quedar colgado con la página bloqueada.
      setTimeout(() => { if (!box.classList.contains('is-done')) cerrar(box, done); }, 4000);
    }

    function cerrar(box, done) {
      box.classList.add('is-done');
      sessionStorage.setItem(KEY, '1');
      // hay que quitarlo de <html> y de <body>: el script inline lo pone en
      // ambos para bloquear el scroll desde el primer frame
      DOC.documentElement.classList.remove('is-booting');
      DOC.body.classList.remove('is-booting');
      ancla();
      DOC.dispatchEvent(new CustomEvent('plano:listo'));
      setTimeout(() => { box.remove(); done && done(); }, 520);
    }

    /* Mientras is-booting esta puesto el documento tiene overflow:hidden, y el
       salto al ancla que hace el navegador al cargar se pierde: la pagina
       abria arriba del todo aunque la URL fuera /index.html#juegos. Con las
       fichas revelandose por scroll, ademas quedaban en opacity 0 para siempre
       y parecian no existir. Se reintenta el salto apenas se libera. */
    function ancla() {
      const h = location.hash;
      if (!h || h.length < 2) return;
      let destino = null;
      try { destino = DOC.getElementById(decodeURIComponent(h.slice(1))); } catch (e) { return; }
      if (!destino) return;
      // dos intentos: el primero en el mismo frame, el segundo cuando ya
      // craving las fichas midieron su alto
      destino.scrollIntoView({ behavior: 'auto', block: 'start' });
      requestAnimationFrame(() => destino.scrollIntoView({ behavior: 'auto', block: 'start' }));
      setTimeout(() => destino.scrollIntoView({ behavior: 'auto', block: 'start' }), 260);
    }

    return { run };
  })();

  /* ======================================================================
     4 · REPRODUCTOR — Web Audio API, volumen propio, posición persistente
     ====================================================================== */
  const Player = (() => {
    const KEY = 'mq.audio';
    const SRC = 'audio/background-theme.mp3';

    const ICON = {
      play:  '<svg class="pl__ico pl__ico--play"  viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
      pause: '<svg class="pl__ico pl__ico--pause" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15"/><rect x="14" y="4.5" width="4" height="15"/></svg>',
      spk:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
      ic:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 2.2 1.7 5.1 5.1 1.7-5.1 1.7L12 19l-1.7-5.3L5.2 12l5.1-1.7L12 5.2z"/></svg>'
    };

    let el, ctx, gain, nodo, analizador, espectro;
    let eqRaf = null;
    let S = { vol: .4, on: false, t: 0 };
    let ui = {};
    let saveT;

    /* primera vez que se abre el sitio (no hay estado guardado) */
    let primerInicio = false;
    try {
      const crudo = localStorage.getItem(KEY);
      if (!crudo) primerInicio = true;
      else Object.assign(S, JSON.parse(crudo));
    } catch (e) { primerInicio = true; }
    S.vol = clamp(typeof S.vol === 'number' ? S.vol : .4, 0, 1);

    const save = () => {
      S.t = el ? el.currentTime : S.t;
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    };

    function markup() {
      const d = DOC.createElement('div');
      d.className = 'pl is-idle';
      d.setAttribute('role', 'group');
      d.setAttribute('aria-label', 'Reproductor de música de fondo');
      d.innerHTML =
        '<div class="pl__label">Tema · ' + (S.on ? 'en curso' : 'en pausa') + '</div>' +
        '<button class="pl__btn" type="button" data-pl-toggle aria-label="Reproducir o pausar la música">' +
          ICON.play + ICON.pause +
        '</button>' +
        '<div class="pl__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
        '<div class="pl__vol">' + ICON.spk +
          '<div class="vol" data-pl-vol role="slider" tabindex="0" ' +
               'aria-label="Volumen" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
               Math.round(S.vol * 100) + '">' +
            '<div class="vol__track"></div><div class="vol__fill"></div><div class="vol__knob"></div>' +
          '</div>' +
          '<span class="pl__num">' + String(Math.round(S.vol * 100)).padStart(2, '0') + '</span>' +
        '</div>' +
        '<div class="pl__gate" aria-hidden="true"></div>';
      DOC.body.appendChild(d);
      return d;
    }

    /* pinta volumen + persiste */
    function pintarVol(v) {
      S.vol = clamp(typeof v === 'number' ? v : S.vol, 0, 1);
      const p = S.vol * 100;
      $('.vol__fill', ui.root).style.width = p + '%';
      $('.vol__knob', ui.root).style.left  = p + '%';
      $('.pl__num',  ui.root).textContent = String(Math.round(p)).padStart(2, '0');
      $('[data-pl-vol]', ui.root).setAttribute('aria-valuenow', String(Math.round(p)));
      if (gain && el && !el.paused) {
        const t0 = ctx.currentTime;
        gain.gain.cancelScheduledValues(t0);
        gain.gain.setTargetAtTime(S.vol, t0, .04);
      }
    }

    function pintarEstado() {
      const sonando = !!el && !el.paused;
      ui.root.classList.toggle('is-playing', sonando);
      if (sonando) arrancarEq(); else pararEq();

      const lab = $('.pl__label', ui.root);
      if (!lab) return;
      if (sonando) lab.textContent = 'Tema · en curso';
      else if (primerInicio && !S.tocar) lab.textContent = '♪ Tocar para escuchar';
      else lab.textContent = 'Tema · en pausa';
    }

    function construir() {
      el = new Audio();
      el.src = SRC;
      el.loop = true;
      el.preload = 'auto';
      el.volume = 1; // el volumen real lo maneja el GainNode

      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
        nodo = ctx.createMediaElementSource(el);
        analizador = ctx.createAnalyser();
        analizador.fftSize = 128;                  // 64 bandas
        // Ventana en dB. La de por defecto (−100 a −30) satura cualquier pista
        // masterizada: casi todas las bandas bajas dan tope y el VU se clava
        // en el maximo. Con −88 a −12 entra en rango la dinamica real.
        analizador.minDecibels = -88;
        analizador.maxDecibels = -12;
        analizador.smoothingTimeConstant = .55;
        espectro = new Uint8Array(analizador.frequencyBinCount);

        gain = ctx.createGain();
        gain.gain.value = 0;

        // El analizador cuelga en medio de la cadena pero no la altera: el
        // volumen sigue entero del GainNode. Solo mira pasar el audio.
        nodo.connect(analizador);
        analizador.connect(gain);
        gain.connect(ctx.destination);
      } else {
        gain = { gain: { value: S.vol, setTargetAtTime(){}, cancelScheduledValues(){} } };
      }
    }

    /* ======================================================================
       ECUALIZADOR REAL
       Las 4 barras leen el espectro de verdad: graves, medios-bajos,
       medios y agudos. Raiz sobre el promedio (si no, la mitad superior de
       la escala pesa igual que la inferior y el VU miente) y ataque rapido
       con caida lenta, que es como se lee un medidor real y no un parpadeo.

       Si no hay Web Audio o el visitante pidio menos movimiento, no se
       engancha nada y queda la animacion CSS de respaldo.
       ====================================================================== */
    const BANDAS = [[1, 4], [4, 10], [10, 24], [24, 48]];
    let niveles = [0, 0, 0, 0];
    let graves = 0, medio = 0;

    function leerEq() {
      if (!analizador || !el || el.paused || DOC.hidden) { pararEq(); return; }

      analizador.getByteFrequencyData(espectro);
      const eq = $('.pl__eq', ui.root);
      const barras = eq && eq.children;

      for (let b = 0; b < BANDAS.length; b++) {
        const ini = BANDAS[b][0];
        const fin = Math.min(BANDAS[b][1], espectro.length);
        let suma = 0, n = 0;
        for (let i = ini; i < fin; i++) { suma += espectro[i]; n++; }

        // getByteFrequencyData YA devuelve una escala logaritmica (dB dentro
        // de la ventana min/max), asi que el promedio de la banda se puede
        // dibujar tal cual. Normalizar cada banda contra su propio pico
        // aplasta el movimiento —una banda estable queda siempre en 1 y las
        // cuatro barras clavadas—, que es justo lo que hay que evitar.
        const dB = n ? (suma / n) / 255 : 0;
        const v = Math.pow(dB, .8);              // abre los niveles medios

        // sube rapido, baja despacio: asi se lee como un medidor y no como
        // un parpadeo
        niveles[b] = v > niveles[b] ? v : niveles[b] * .6 + v * .4;

        if (barras && barras[b]) {
          barras[b].style.height = (3 + niveles[b] * 10).toFixed(1) + 'px';
        }
        // el detector de golpe mira el valor crudo, no el suavizado: asi
        // alcanza los transientes
        if (b === 0) graves = v;
      }

      // El brillo del fondo sale del EXCESO de graves sobre su media reciente,
      // no del nivel absoluto. Con el nivel absoluto la pista entera esta
      // masterizada y la grilla quedaria siempre encendida; asi late con los
      // golpes del ritmo.
      medio = medio * .96 + graves * .04;
      const golpe = Math.max(0, graves - medio) * 15;
      DOC.documentElement.style.setProperty('--bass', Math.min(1, golpe).toFixed(3));

      eqRaf = requestAnimationFrame(leerEq);
    }

    function arrancarEq() {
      if (eqRaf || !analizador || reduce) return;
      ui.root.classList.add('has-eq');
      eqRaf = requestAnimationFrame(leerEq);
    }

    function pararEq() {
      if (eqRaf) cancelAnimationFrame(eqRaf);
      eqRaf = null;
      niveles = [0, 0, 0, 0];
      graves = 0; medio = 0;
      DOC.documentElement.style.setProperty('--bass', '0');
      // vuelve a la animacion CSS de respaldo
      if (ui.root) ui.root.classList.remove('has-eq');
    }

    function fadeIn(ms) {
      if (!ctx) { el.volume = S.vol; return; }
      const t0 = ctx.currentTime;
      gain.gain.cancelScheduledValues(t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(S.vol, t0 + ms / 1000);
    }

    async function play(fade) {
      if (!el) return;
      try { await ctx && ctx.resume(); } catch (e) {}
      try {
        await el.play();
      } catch (e) {
        // Autoplay bloqueado: esperamos al primer gesto
        ui.root.classList.add('needs-gesture');
        armGesture();
        return false;
      }
      ui.root.classList.remove('needs-gesture');
      fadeIn(fade === undefined ? 700 : fade);
      S.on = true; save(); pintarEstado();
      return true;
    }

    function pause() {
      if (!el) return;
      if (ctx) {
        const t0 = ctx.currentTime;
        gain.gain.cancelScheduledValues(t0);
        gain.gain.setValueAtTime(gain.gain.value, t0);
        gain.gain.linearRampToValueAtTime(0.0001, t0 + .22);
        setTimeout(() => el.pause(), 240);
      } else { el.pause(); }
      S.on = false; save(); pintarEstado();
    }

    const toggle = () => {
      desarmarPrimerInicio();
      return (el && !el.paused) ? pause() : play();
    };

    /* Volumen: drag + teclado */
    function volumen() {
      const v = $('[data-pl-vol]', ui.root);
      const setFromX = (clientX) => {
        const r = v.getBoundingClientRect();
        pintarVol(clamp((clientX - r.left) / r.width, 0, 1));
      };
      let dragging = false;

      v.addEventListener('pointerdown', (e) => {
        dragging = true; v.classList.add('is-drag');
        v.setPointerCapture(e.pointerId); setFromX(e.clientX);
      });
      v.addEventListener('pointermove', (e) => { if (dragging) setFromX(e.clientX); });
      v.addEventListener('pointerup',   (e) => {
        dragging = false; v.classList.remove('is-drag');
        try { v.releasePointerCapture(e.pointerId); } catch (err) {}
        save();
      });
      v.addEventListener('keydown', (e) => {
        let v2 = null;
        switch (e.key) {
          case 'ArrowRight': case 'ArrowUp':   v2 = S.vol + .05; break;
          case 'ArrowLeft':  case 'ArrowDown': v2 = S.vol - .05; break;
          case 'Home': v2 = 0; break;
          case 'End':  v2 = 1; break;
          default: return;
        }
        e.preventDefault();
        pintarVol(v2);
        if (el && el.paused && S.vol > 0) { S.on = true; play(180); }
        save();
      });
    }

    function armGesture() {
      if (armGesture.done) return;
      armGesture.done = true;
      const go = async () => {
        removeEventListener('pointerdown', go);
        removeEventListener('keydown', go);
        if (!S.on) return;
        try { await ctx && ctx.resume(); } catch (e) {}
        el.currentTime = S.t;
        el.play().then(() => { fadeIn(500); pintarEstado(); }).catch(() => {});
      };
      addEventListener('pointerdown', go);
      addEventListener('keydown', go);
    }

    /* Primera visita: el navegador no deja reproducir solo, asi que arrancamos
       con el primer gesto real del visitante (click, toque o tecla) en
       cualquier parte de la pagina. Solo la primera vez: si el visitante pauso
       a proposito, al volver NO se le vuelve a imponer la musica. */
    function armarPrimerInicio() {
      if (armarPrimerInicio.hecho) return;
      const go = async () => {
        removeEventListener('pointerdown', go);
        removeEventListener('keydown', go);
        armarPrimerInicio.hecho = false;
        // si el boton play ya lo empezo, no hacer nada
        if (el && !el.paused) return;
        S.on = true;
        S.tocar = true;
        ui.root.classList.remove('needs-gesture');
        try { await ctx && ctx.resume(); } catch (e) {}
        try {
          await el.play();
          fadeIn(1100);
          pintarEstado();
          save();
        } catch (e) {
          S.on = false; save();
        }
      };
      armarPrimerInicio.go = go;
      armarPrimerInicio.hecho = true;
      addEventListener('pointerdown', go);
      addEventListener('keydown', go);
      ui.root.classList.add('needs-gesture');
    }

    /* cancela el arranque automatico (lo usa el boton play / pause, para que
       el pointerdown del clic y el click no se pisen) */
    function desarmarPrimerInicio() {
      if (!armarPrimerInicio.hecho) return;
      removeEventListener('pointerdown', armarPrimerInicio.go);
      removeEventListener('keydown', armarPrimerInicio.go);
      armarPrimerInicio.hecho = false;
      if (ui.root) ui.root.classList.remove('needs-gesture');
    }

    function init() {
      ui.root = markup();
      construir();
      pintarVol(S.vol);
      $('[data-pl-toggle]', ui.root).addEventListener('click', toggle);
      volumen();

      // Restaurar posición y reanudar si estaba sonando
      el.addEventListener('loadedmetadata', () => {
        if (S.t > 0 && S.t < el.duration - 2) el.currentTime = S.t;
      }, { once: true });

      el.addEventListener('play',  pintarEstado);
      el.addEventListener('pause', pintarEstado);
      el.addEventListener('error', () => {
        pararEq();
        el = null;
        ui.root.remove();
      }, { once: true });

      // al volver a la pestaña no se dibuja nada: se reanuda solo
      DOC.addEventListener('visibilitychange', () => {
        if (DOC.hidden) pararEq();
        else if (el && !el.paused) arrancarEq();
      });

      // Guardar posición periódicamente
      saveT = setInterval(() => { if (el && !el.paused) save(); }, 2000);
      addEventListener('pagehide', save);
      DOC.addEventListener('visibilitychange', () => { if (DOC.hidden) save(); });

      if (S.on) {
        play(900);
      } else {
        pintarEstado();
        if (primerInicio) armarPrimerInicio();
      }
    }

    /* volumen con API propia: despachar eventos de flecha falsos contaminaba
       la secuencia del Konami (cada flecha contaba doble) */
    function moverVol(delta) {
      pintarVol(clamp(S.vol + delta, 0, 1));
      volAntes = null;
      if (el && el.paused && S.vol > 0) { S.on = true; play(180); }
      save();
    }

    /* silencio ON/OFF, recordando el volumen anterior */
    let volAntes = null;
    function mutear() {
      if (S.vol > 0) {
        volAntes = S.vol;
        pintarVol(0);
      } else {
        pintarVol(volAntes === null ? .4 : volAntes);
        volAntes = null;
      }
      save();
    }

    return { init, toggle, mutear, moverVol,
             el: () => el, vol: () => S.vol,
             // Para inspeccionar el espectro desde la consola
             espectro: () => espectro };
  })();

  /* ======================================================================
     5 · HEADER — estado, ocultar al bajar, menú móvil, link activo
     ====================================================================== */
  const Header = (() => {
    function init() {
      const h = $('.hdr');
      if (!h) return;

      // Marcar la página activa según la URL
      const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      $$('.nav a').forEach((a) => {
        const href = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
        if (href === file || (file === '' && href === 'index.html')) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });

      // Menú móvil
      const burger = $('[data-burger]');
      const nav = $('.nav');
      if (burger && nav) {
        burger.addEventListener('click', () => {
          const open = nav.classList.toggle('is-open');
          burger.setAttribute('aria-expanded', String(open));
        });
        $$('.nav a').forEach((a) => a.addEventListener('click', () => {
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        }));
      }

      // Ocultar al bajar, mostrar al subir
      let prev = scrollY;
      addEventListener('scroll', () => {
        const y = scrollY;
        h.classList.toggle('is-solid', y > 10);
        if (y > 220 && y > prev + 4)       h.classList.add('is-hidden');
        else if (y < prev - 4 || y < 120)   h.classList.remove('is-hidden');
        prev = y;
      }, { passive: true });
    }
    return { init };
  })();

  /* ======================================================================
     6 · SCROLL — barra de progreso, reglas, botón volver arriba
     ====================================================================== */
  const Scroll = (() => {
    function init() {
      const bar = $('.progbar__fill');
      const top = $('[data-to-top]');
      let ticking = false;

      const upd = () => {
        ticking = false;
        const max = DOC.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
        if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
        Plano.marcar(p);
        if (top) top.classList.toggle('is-on', scrollY > 500);
      };

      const pedir = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(upd);
      };

      addEventListener('scroll', pedir, { passive: true });
      addEventListener('resize', debounce(() => Plano.repintar(), 220));
      addEventListener('load', () => Plano.repintar());
      DOC.addEventListener('plano:listo', () => setTimeout(() => Plano.repintar(), 60));
      setTimeout(() => Plano.repintar(), 500);
      upd();
    }
    return { init };
  })();

  function debounce(fn, ms) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ======================================================================
     7 · REVEAL — entrada de bloques al hacer scroll
     ====================================================================== */
  /* ======================================================================
     7 · VISOR — detección de entrada al viewport
        Chequeo manual en vez de IntersectionObserver: los elementos con
        clip-path inicial tienen área visible 0 y el IO no los detecta.
     ====================================================================== */
  const Visor = (() => {
    const pendientes = new Set();
    let armado = false;

    function check() {
      const h = innerHeight;
      /* Margen generoso (hasta 1.6 pantallas por debajo del borde) para que
         un bloque se revele segun se acerca, no cuando su parte SUPERIOR ya
         entro en pantalla. Sin esto, en bloques altos el contenido inferior
         quedaba invisible hasta scrollear bastante mas. */
      const limite = h * 1.6;
      pendientes.forEach((el) => {
        const r = el.getBoundingClientRect();
        // display:none -> rect en ceros. No hay nada que revelar todavia, y
        // marcarlo como invisible haceria que al redimensionar (girar una
        // tablet) quedara en opacity:0 para siempre.
        if (r.width === 0 && r.height === 0) return;
        if (r.top < limite && r.bottom > 0) {
          el.classList.add('in');
          pendientes.delete(el);
        }
      });
      if (!pendientes.size) desarmar();
    }

    function armar() {
      // Si ya estaba armado igual hay que correr check(): pueden haberse
      // agregado elementos nuevos (tarjetas re-renderizadas) y esperar al
      // proximo scroll las dejaba en opacity:0.
      if (!armado) {
        armado = true;
        addEventListener('scroll', check, { passive: true });
        addEventListener('resize', check);
      }
      check();
    }

    function desarmar() {
      if (!armado) return;
      armado = false;
      removeEventListener('scroll', check);
      removeEventListener('resize', check);
    }

    function observar(sel, alEntrar) {
      const items = $$(sel);
      if (!items.length) return;
      if (reduce) { items.forEach(alEntrar); return; }
      items.forEach((el) => {
        if (el.dataset.rvD) el.style.setProperty('--rv-d', el.dataset.rvD + 'ms');
        pendientes.add(el);
      });
      armar();
    }

    /* Re-registra las tarjetas que nacieron DESPUES del arranque.
       Sin esto, todo lo que se re-renderice con innerHTML se queda en
       opacity:0 para siempre (el observer ya se desarmó). */
    function revelar(raiz, inmediato) {
      const ambito = raiz || DOC;
      const nuevos = $$('[data-reveal]', ambito).filter((el) => !el.classList.contains('in'));
      if (!nuevos.length) return 0;
      if (reduce || inmediato) {
        nuevos.forEach((el) => el.classList.add('in'));
        return nuevos.length;
      }
      nuevos.forEach((el) => {
        if (el.dataset.rvD) el.style.setProperty('--rv-d', el.dataset.rvD + 'ms');
        pendientes.add(el);
      });
      armar();
      return nuevos.length;
    }

    /* Red de seguridad: pasa varias veces durante los primeros segundos
       para revelar cualquier cosa que se haya renderizado tarde y se haya
       quedado fuera del chequeo por scroll. */
    function redDeSeguridad() {
      let vueltas = 0;
      const t = setInterval(() => {
        if (reduce) { clearInterval(t); return; }
        const h = innerHeight;
        $$('[data-reveal]').forEach((el) => {
          if (el.classList.contains('in')) return;
          const r = el.getBoundingClientRect();
          if (r.top < h && r.bottom > 0) {
            el.classList.add('in');
            pendientes.delete(el);
          }
        });
        if (++vueltas > 12) clearInterval(t);
      }, 400);
    }

    return { observar, revelar, redDeSeguridad };
  })();

  /* --- reveal --- */
  const Reveal = () => Visor.observar('[data-reveal]', (el) => el.classList.add('in'));

  /* ======================================================================
     8 · CONTADORES
     ====================================================================== */
  const Count = () => {
    const correr = (el) => {
      if (el.dataset.countDone) return;
      el.dataset.countDone = '1';
      const to = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const pre = el.dataset.countPre || '';
      const suf = el.dataset.countSuf || '';
      const dur = reduce ? 0 : 1400;
      const t0 = performance.now();
      const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const tick = (now) => {
        const k = dur ? clamp((now - t0) / dur, 0, 1) : 1;
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + miles((to * e).toFixed(dec)) + suf;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    Visor.observar('[data-count]', correr);
  };

  /* ======================================================================
     9 · MODO RETÍCULA — código Konami
     ====================================================================== */
  const Reticle = (() => {
    const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];

    /* Normaliza el evento a algo comparable con la secuencia.
       e.code es lo ideal, pero no siempre viene informado (emuladores de
       teclado, remotos, algunos layouts), asi que se cae a e.key. */
    function codigo(e) {
      if (e.code) return e.code;
      const k = e.key;
      if (!k) return '';
      if (/^Arrow(Up|Down|Left|Right)$/.test(k)) return k;
      if (k.length === 1) {
        const may = k.toUpperCase();
        if (may >= 'A' && may <= 'Z') return 'Key' + may;
      }
      return '';
    }

    function init() {
      let i = 0;
      let toast;
      let on = false;

      addEventListener('keydown', (e) => {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        const c = codigo(e);
        if (c && c === SEQ[i]) {
          i++;
          if (i === SEQ.length) { i = 0; toggle(); }
        } else if (c !== SEQ[0]) {
          i = 0;
        }
      });

      function toggle() {
        on = DOC.body.classList.toggle('reticle-on');
        try { localStorage.setItem('mq.reticle', on ? '1' : '0'); } catch (e) {}
        if (!toast) {
          toast = DOC.createElement('div');
          toast.className = 'reticle-toast';
          toast.setAttribute('role', 'status');
          DOC.body.appendChild(toast);
        }
        toast.textContent = on ? '◈ Modo retícula activado' : '◈ Modo retícula desactivado';
        toast.classList.add('is-on');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('is-on'), 2600);
      }

      /* queda como estaba entre visitas */
      try {
        if (localStorage.getItem('mq.reticle') === '1') {
          DOC.body.classList.add('reticle-on');
          on = true;
        }
      } catch (e) {}
    }
    return { init };
  })();

  /* ======================================================================
     10 · REGISTRO DE SECCIONES
     Se deriva del DOM: cada <section> con .sec__head aporta numero, etiqueta
     corta y titulo. Lo usan el indice de la regla, el rotulo fijo, el escaneo
     por seccion y el panel de atajos.
     ====================================================================== */
  const Sec = (() => {
    let lista = [];
    let activa = null;

    function init() {
      lista = $$('main section').map((el) => {
        const head = $('.sec__head', el);
        return {
          el,
          id: el.id || '',
          num: head ? ($('.sec__num', head)?.textContent || '').trim() : '',
          corto: el.dataset.sec || (head ? ($('.tag', head)?.textContent || '').trim() : ''),
          titulo: head ? ($('h2', head)?.textContent || '').trim() : ''
        };
      }).filter((s) => s.num && s.corto);
    }

    /* la seccion que ocupa la franja central del viewport */
    function actual() {
      if (!lista.length) return null;
      const linea = innerHeight * 0.38;
      let mejor = lista[0];
      for (const s of lista) {
        const r = s.el.getBoundingClientRect();
        if (r.top <= linea && r.bottom > linea) { mejor = s; break; }
        if (r.top > linea) break;
        mejor = s;
      }
      return mejor;
    }

    function progreso(s) {
      if (!s) return 0;
      const max = DOC.documentElement.scrollHeight - innerHeight;
      return max > 0 ? clamp((s.el.getBoundingClientRect().top + scrollY) / max, 0, 1) : 0;
    }

    /* progreso dentro de la seccion actual, 0..1 */
    function interno(s) {
      if (!s) return 0;
      const r = s.el.getBoundingClientRect();
      const total = r.height - innerHeight;
      if (total <= 0) return 0;
      return clamp(-r.top / total, 0, 1);
    }

    return { init, lista: () => lista, actual, progreso, interno,
             get activa() { return activa; }, set activa(v) { activa = v; } };
  })();

  /* ======================================================================
     ARRANQUE
     ====================================================================== */
  function init() {
    Tema.init();
    Plano.init();
    Header.init();
    Sec.init();
    Scroll.init();
    Reticle.init();
    Plano.cursor();
    Player.init();

    // Volver arriba
    const top = $('[data-to-top]');
    if (top) top.addEventListener('click', () =>
      scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    );

    // El arranque tapa la página: los reveals y contadores esperan a que salga
    Boot.run(() => {
      Reveal();
      Count();
      // pasa varias veces al principio, para cubrir contenido que las
      // paginas renderizan despues del arranque
      Visor.redDeSeguridad();
    });
  }

  if (DOC.readyState === 'loading') DOC.addEventListener('DOMContentLoaded', init);
  else init();

  /* API minima para las paginas */
  window.MQ = {
    tema: Tema, plano: Plano, player: Player,
    revelar: Visor.revelar, redDeSeguridad: Visor.redDeSeguridad, debounce: debounce,
    seccion: Sec
  };
})();
