/* ==========================================================================
   MARQUITOUH · PLANO TECNICO
   comunidad.js — render, estado del servidor y copiado de IP
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const D  = window.COMUNIDAD;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

  const escalonar = (cont, paso) => {
    $$('[data-reveal]', cont).forEach((el, i) =>
      el.style.setProperty('--rv-d', Math.min(i * paso, 700) + 'ms'));
  };

  /* Al renderizar hay que volver a registrar las tarjetas con el Visor de
     core.js: si no, nacen con opacity:0 y el observer ya se desarmó. */
  const pintado = (cont, paso, inmediato) => {
    escalonar(cont, paso || 0);
    if (window.MQ && window.MQ.revelar) window.MQ.revelar(cont, !!inmediato);
  };

  /* ======================================================================
     RANGOS
     ====================================================================== */
  function roles() {
    const cont = $('#roles');
    if (!cont) return;
    cont.innerHTML = D.roles.map((r) =>
      '<article class="role" data-reveal="up" style="--role-c:' + esc(r.c) + '">' +
        '<span class="role__i">' + r.i + '</span>' +
        '<span><span class="role__t">' + esc(r.t) + '</span>' +
        '<span class="role__s">' + esc(r.s) + '</span></span>' +
      '</article>').join('');
    pintado(cont, 70);
  }

  /* ======================================================================
     NIVELES
     ====================================================================== */
  function niveles() {
    const cont = $('#niveles');
    if (!cont) return;
    cont.innerHTML = D.niveles.map((n, i) =>
      '<span class="chain__i"><b>' + String(i + 1).padStart(2, '0') + '</b> ' + esc(n) + '</span>'
    ).join('');
  }

  /* ======================================================================
     NORMAS
     ====================================================================== */
  function reglas() {
    const cont = $('#rules');
    if (!cont) return;
    cont.innerHTML = D.reglas.map((r, i) =>
      '<article class="rule" data-reveal="up">' +
        '<span class="rule__n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h4>' + esc(r.t) + '</h4>' +
        '<p>' + esc(r.d) + '</p>' +
      '</article>').join('');
    pintado(cont, 55);
  }

  /* ======================================================================
     Estado del servidor en vivo — API de invitaciones de Discord
     ====================================================================== */
  const INVITE = 'GZD8mXVQ4Q';
  const RESPALDO = { online: '40+', members: '140+' };

  async function estadoServidor() {
    const on = $('#dc-online');
    const mem = $('#dc-members');
    const dot = $('#dc-dot');
    if (!on || !mem) return;

    try {
      const r = await fetch('https://discord.com/api/v10/invites/' + INVITE + '?with_counts=true');
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      on.textContent  = j.approximate_presence_count || RESPALDO.online;
      mem.textContent = j.approximate_member_count   || RESPALDO.members;
      if (dot) dot.className = 'dot dot--online';
    } catch (e) {
      on.textContent  = RESPALDO.online;
      mem.textContent = RESPALDO.members;
      if (dot) dot.className = 'dot dot--offline';
    }
  }

  /* ======================================================================
     Copiar IP de Minecraft
     ====================================================================== */
  function copiarIP() {
    const btn = $('#mc-ip');
    const txt = $('#mc-ip-txt');
    if (!btn || !txt) return;

    const original = txt.textContent;
    let t;

    btn.addEventListener('click', async () => {
      const ip = btn.dataset.ip;
      try {
        await navigator.clipboard.writeText(ip);
        txt.textContent = '¡IP copiada! ' + ip;
      } catch (e) {
        // fallback para contextos sin permiso de portapapeles
        const ta = document.createElement('textarea');
        ta.value = ip;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); txt.textContent = '¡IP copiada! ' + ip; }
        catch (err) { txt.textContent = ip; }
        ta.remove();
      }
      clearTimeout(t);
      t = setTimeout(() => { txt.textContent = original; }, 2200);
    });
  }

  /* ======================================================================
     ARRANQUE
     ====================================================================== */
  function init() {
    roles();
    niveles();
    reglas();
    estadoServidor();
    copiarIP();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
