/* ==========================================================================
   MARQUITOUH · PLANO TECNICO
   home.js — lógica exclusiva de la portada
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ======================================================================
     Estado de Discord en vivo — Lanyard
     ====================================================================== */
  const DISCORD_ID = '420043805614407680';

  async function lanyard() {
    const dot = $('#lanyard-dot');
    const txt = $('#lanyard-text');
    if (!dot || !txt) return;

    try {
      const r = await fetch('https://api.lanyard.rest/v1/users/' + DISCORD_ID);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      if (!j.success || !j.data) throw new Error('sin datos');

      const d = j.data;
      dot.className = 'dot dot--' + (d.discord_status || 'offline');

      const act = (d.activities || []).filter((a) => a.type !== 4);
      if (act.length) {
        const a = act[0];
        if (a.type === 0) {
          txt.textContent = /visual studio code/i.test(a.name || '')
            ? 'Programando en ' + a.name
            : 'Jugando a ' + (a.name || 'algo');
        } else if (a.type === 1) txt.textContent = 'Transmitiendo ' + (a.name || '').trim();
        else if (a.type === 2) txt.textContent = 'Escuchando ' + (a.name || '').trim();
        else if (a.type === 3) txt.textContent = 'Viendo ' + (a.name || '').trim();
        else txt.textContent = 'En ' + (a.name || 'Discord');
      } else if (d.custom_status && d.custom_status.state) {
        txt.textContent = d.custom_status.state;
      } else {
        txt.textContent = {
          online: 'En línea en Discord',
          idle: 'Ausente',
          dnd: 'No molestar',
          offline: 'Desconectado'
        }[d.discord_status] || 'En línea';
      }
    } catch (e) {
      dot.className = 'dot dot--offline';
      txt.textContent = 'Estado no disponible';
    }
  }

  /* ======================================================================
     Filtros de proyectos
     ====================================================================== */
  function filtrosProyecto() {
    const cont = $('[data-filtro-proyectos]');
    if (!cont) return;
    $$('[data-cat]', cont).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('[data-cat]', cont).forEach((b) => b.classList.toggle('is-on', b === btn));
        const cat = btn.dataset.cat;
        $$('[data-proyecto]').forEach((it) => {
          it.hidden = !(cat === 'all' || it.dataset.cat === cat);
        });
      });
    });
  }

  /* ======================================================================
     Acordeón FAQ
     ====================================================================== */
  function faq() {
    $$('[data-faq]').forEach((item) => {
      const q = $('[data-faq-q]', item);
      const a = $('[data-faq-a]', item);
      if (!q || !a) return;
      q.setAttribute('aria-expanded', 'false');
      q.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        q.setAttribute('aria-expanded', String(open));
        a.style.height = open ? a.scrollHeight + 'px' : '0px';
      });
    });
  }

  /* ======================================================================
     Arranque
     ====================================================================== */
  function init() {
    lanyard();
    filtrosProyecto();
    faq();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
