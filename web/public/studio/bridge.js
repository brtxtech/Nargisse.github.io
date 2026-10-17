/* bridge.js — branche le studio classique sur les « designs » ajoutés depuis l’admin (table Supabase public.designs).
 *
 * Deux modes :
 *  1. Dans l’application Angular (iframe) : l’appli parente fournit window.parent.__NARGISSE = { designs, state }.
 *     Le studio affiche alors TOUS les designs, et chaque modification est renvoyée au parent (postMessage) pour être
 *     enregistrée dans Supabase.
 *  2. Page seule (lien invité …/studio/index.html#v=…) : on ne télécharge que les designs utilisés par la carte.
 *
 * La clé « publishable » Supabase est publique par conception (la sécurité vient des règles RLS, voir supabase/schema.sql).
 * Gardez ces deux valeurs identiques à web/src/app/supabase.config.ts.
 */
(function () {
  'use strict';
  var SB_URL = 'https://hacxbikdjxskjadszsnu.supabase.co';
  var SB_KEY = 'sb_publishable_G84tmegAKRwcnBQSp4-xng_uaNNW2_Z';
  var STATE_KEY = 'nargisse:v2';
  var SCRIPTS = ['js/catalog.js', 'js/music.js', 'js/render.js', 'js/studio.js'];

  /* ---------- utilitaires ---------- */
  function json(v) { if (typeof v === 'string' && v.charAt(0) === '{') { try { return JSON.parse(v); } catch (e) { } } return null; }
  function hex(c) { var m = /^#?([0-9a-f]{6})$/i.exec(c || ''); return m ? [0, 2, 4].map(function (i) { return parseInt(m[1].substr(i, 2), 16); }) : null; }
  function mix(a, b, t) {
    var x = hex(a), y = hex(b); if (!x || !y) return a;
    return '#' + x.map(function (v, i) { return ('0' + Math.round(v + (y[i] - v) * t).toString(16)).slice(-2); }).join('');
  }
  // On n’accepte que des data: URL base64 (fichiers envoyés depuis l’admin) : rien d’autre ne peut finir dans le CSS / le HTML.
  function safeUrl(u) { return typeof u === 'string' && /^data:[\w.+\/-]*;base64,[A-Za-z0-9+\/=]+$/.test(u) ? u : ''; }
  function safeFont(n) { return String(n || '').replace(/[^\w .-]/g, '').trim().slice(0, 40); }
  function num(v, d) { v = +v; return isFinite(v) ? v : d; }

  /* ---------- designs Supabase → format FEATURES attendu par js/catalog.js ---------- */
  function convert(designs) {
    var F = { petals: [], music: [], frames: [], backgrounds: [], envelopes: [], fonts: [], palettes: [], venues: [] };
    (designs || []).forEach(function (d) {
      var id = String(d.id), name = String(d.name || ''), o = json(d.value), legacy = o === null, url = safeUrl(d.file);
      o = o || {};
      switch (d.category) {
        case 'palettes': {
          var p = o;
          if (legacy) { var q = String(d.value || '').split('|'); p = { bg: q[0], ink: q[1], accent: q[2] }; }
          var bg = hex(p.bg) ? p.bg : '#faf7f2', ink = hex(p.ink) ? p.ink : '#2a2a3c';
          F.palettes.push({
            id: id, name: name, bg: bg, card: hex(p.card) ? p.card : mix(bg, ink, 0.06),
            accent: hex(p.accent) ? p.accent : '#b8975a', ink: ink, muted: hex(p.muted) ? p.muted : mix(ink, bg, 0.45)
          });
          break;
        }
        case 'petals': {
          var kind = o.kind || (legacy && url ? 'image' : 'emoji');
          if (kind === 'image') { if (url) F.petals.push({ id: id, name: name, kind: 'image', url: url }); }
          else { var em = String((legacy ? d.value : o.emoji) || '').slice(0, 8); if (em) F.petals.push({ id: id, name: name, kind: 'emoji', emoji: em }); }
          break;
        }
        case 'music': if (url) F.music.push({ id: id, name: name, url: url }); break;
        case 'frames': if (url) F.frames.push({ id: id, name: name, url: url, mode: /^(corners|sides|overlay)$/.test(o.mode) ? o.mode : 'corners' }); break;
        case 'backgrounds': if (url) F.backgrounds.push({ id: id, name: name, url: url, mode: o.mode === 'tile' ? 'tile' : 'cover', tile: num(o.tile, 160), opacity: num(o.opacity, 100) }); break;
        case 'envelopes': if (url) F.envelopes.push({ id: id, name: name, url: url }); break;
        case 'fonts': {
          if (legacy) break; // anciennes polices d’exemple (nom CSS libre) : ignorées
          var fn = safeFont(name); if (!fn) break;
          var src = o.source === 'file' ? 'file' : 'google';
          if (src === 'file' && !url) break;
          F.fonts.push({ id: id, name: fn, source: src, role: /^(titles|names|body|all)$/.test(o.role) ? o.role : 'all', url: url, ext: /^(woff2|woff|ttf|otf)$/.test(o.ext) ? o.ext : 'woff2' });
          break;
        }
        case 'venues': F.venues.push({ id: id, name: name, a: String(o.a || (legacy ? d.value : '') || '').slice(0, 160), d: String(o.d || '').slice(0, 220), url: url }); break;
      }
    });
    return F;
  }

  /* Quels designs une carte utilise-t-elle ? (ids « x_12 », « f_3 », « i_7 » + polices par nom) */
  function used(list, state) {
    var txt = JSON.stringify(state || {}), ids = {};
    txt.replace(/"(?:x|f|i)_(\d+)"/g, function (m, n) { ids[n] = 1; return m; });
    return (list || []).filter(function (d) {
      if (ids[String(d.id)]) return true;
      return d.category === 'fonts' && txt.indexOf('"' + safeFont(d.name) + '"') > -1;
    });
  }

  /* Export HTML du studio : js/studio.js demande « data/features/<cat>.js » → on fournit le code, limité à ce qui est utilisé. */
  window.__featJS = function (url) {
    var cat = String(url).replace(/^.*\//, '').replace(/\.js$/, '');
    var list = window.__ALL_DESIGNS || [], st = null;
    try { st = typeof S !== 'undefined' ? S : null; } catch (e) { }
    var F = convert(used(list, st));
    return '(window.FEATURES=window.FEATURES||{})[' + JSON.stringify(cat) + ']=' + JSON.stringify(F[cat] || []) + ';';
  };

  /* ---------- chargement ---------- */
  function load(i) {
    if (i >= SCRIPTS.length) return;
    var s = document.createElement('script');
    s.src = SCRIPTS[i];
    s.onload = function () { load(i + 1); };
    s.onerror = function () { console.error('Impossible de charger ' + SCRIPTS[i]); };
    document.body.appendChild(s);
  }
  function boot(designs) {
    window.__ALL_DESIGNS = designs || [];
    window.FEATURES = convert(window.__ALL_DESIGNS);
    load(0);
  }

  var host = null;
  try { if (window.parent && window.parent !== window) host = window.parent.__NARGISSE || null; } catch (e) { }

  if (host) {
    // 1) état de l’invitation de l’utilisateur connecté → remplace la sauvegarde locale du studio
    try {
      if (host.state) localStorage.setItem(STATE_KEY, JSON.stringify(host.state));
      else localStorage.removeItem(STATE_KEY);
    } catch (e) { }
    // 2) chaque sauvegarde du studio est renvoyée à l’appli parente (qui l’enregistre dans Supabase)
    var orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      orig.apply(this, arguments);
      if (k === STATE_KEY && this === window.localStorage) {
        try { window.parent.postMessage({ type: 'nargisse:save', state: JSON.parse(v) }, location.origin); } catch (e) { }
      }
    };
    boot(host.designs);
  } else {
    // Page invité : on ne télécharge que les designs utilisés par la carte (pas tout le catalogue)
    var state = null;
    try {
      var m = /[#&]v=([^&]+)/.exec(location.hash);
      state = m ? JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(m[1]), function (c) { return c.charCodeAt(0); })))
        : JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
    } catch (e) { }
    var get = function (q) {
      var ctl = window.AbortController ? new AbortController() : null;
      if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
      return fetch(SB_URL + '/rest/v1/designs?' + q, { headers: { apikey: SB_KEY }, signal: ctl && ctl.signal })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    };
    if (!state) boot([]);
    else get('select=id,category,name,value&order=id').then(function (list) {
      var want = used(list, state);
      if (!want.length) return [];
      return get('select=*&id=in.(' + want.map(function (d) { return +d.id; }).join(',') + ')');
    }).then(boot, function (e) { console.warn('Designs indisponibles (la carte s’affiche avec les options par défaut)', e); boot([]); });
  }
})();
