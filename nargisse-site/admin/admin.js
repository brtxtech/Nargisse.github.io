'use strict';
/* admin.js — interface d’administration (construite à partir de GET /api/schema) */
const API = new URL('../api/', location.href).href, app = document.getElementById('app');
const h = (t, a, ...c) => {
  const e = document.createElement(t);
  for (const [k, v] of Object.entries(a || {})) { if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else e.setAttribute(k, v === true ? '' : v); }
  for (const x of c.flat(9)) { if (x == null || x === false) continue; e.append(x.nodeType ? x : document.createTextNode(String(x))); }
  return e;
};
async function api(p, o = {}) {
  let r;
  try { r = await fetch(API + p, { method: o.method || 'GET', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'admin' }, body: o.body ? JSON.stringify(o.body) : undefined, credentials: 'same-origin' }); }
  catch { throw Object.assign(new Error('Serveur injoignable'), { down: 1 }); }
  let j; try { j = await r.json(); } catch { throw Object.assign(new Error('Serveur d’administration introuvable'), { down: 1 }); }
  if (!r.ok) throw Object.assign(new Error(j.error || 'Erreur'), { status: r.status });
  return j;
}
const st = { user: '', must: false, cats: [], data: {}, cat: null, edit: null };
const toast = m => { const t = h('div', { class: 'toast' }, m); document.body.append(t); setTimeout(() => t.remove(), 2300); };
const sz = b => !b ? '' : b > 1048576 ? (b / 1048576).toFixed(1) + ' Mo' : Math.max(1, Math.round(b / 1024)) + ' Ko';
const lab = (c, k, v) => ((c.fields.find(f => f.k === k) || {}).opts || []).find(o => o[0] === v)?.[1]?.split(' (')[0];
const expired = e => { if (e.status === 401) { toast('Session expirée, reconnectez-vous'); login(); return true; } };

async function load() {
  const [s, d] = await Promise.all([api('schema'), api('features')]);
  st.cats = s.cats; st.data = d; if (!st.cats.some(c => c.id === st.cat)) st.cat = st.cats[0].id;
}
async function boot() {
  try {
    const s = await api('session'); if (!s.authenticated) return login();
    st.user = s.user; st.must = s.mustChange; await load(); shell();
  } catch (e) { login(e.down ? e : null); }
}

/* ---------- connexion ---------- */
function login(down) {
  const err = h('p', { class: 'err' }), btn = h('button', { class: 'btn p', type: 'submit' }, 'Se connecter');
  const u = h('input', { name: 'user', autocomplete: 'username', required: true, autofocus: true }), p = h('input', { name: 'password', type: 'password', autocomplete: 'current-password', required: true });
  const f = h('form', {
    onsubmit: async ev => {
      ev.preventDefault(); err.textContent = ''; btn.disabled = true;
      try { const r = await api('login', { method: 'POST', body: { user: u.value, password: p.value } }); st.user = r.user; st.must = r.mustChange; await load(); shell(); }
      catch (e) { err.textContent = e.message; btn.disabled = false; p.value = ''; p.focus(); }
    }
  },
    h('div', { class: 'brand' }, h('i', {}, '✿'), ' Nargisse'), h('h1', {}, 'Administration'),
    h('p', {}, 'Connectez-vous pour gérer les fonctionnalités du site.'),
    down && h('div', { class: 'down' }, 'Le serveur d’administration ne répond pas. La connexion demande le petit serveur local : lancez ', h('code', {}, 'npm start'), ' (ou ', h('code', {}, 'node admin/server.js'), ') puis ouvrez ', h('code', {}, 'http://localhost:3000/admin/'), '.'),
    h('div', {}, h('label', {}, 'Identifiant'), u), h('div', {}, h('label', {}, 'Mot de passe'), p), err, btn);
  app.replaceChildren(h('div', { class: 'login' }, f)); u.focus();
}

/* ---------- coque ---------- */
function shell() {
  const nav = h('nav', { class: 'nav' }, st.cats.map(c => h('button', { class: c.id === st.cat ? 'on' : '', onclick: () => { st.cat = c.id; st.edit = null; shell(); scrollTo(0, 0); } },
    h('span', { class: 'ic' }, c.icon), c.label, h('em', {}, (st.data[c.id] || []).length))));
  const side = h('aside', { class: 'side' }, h('div', { class: 'brand' }, h('i', {}, '✿'), ' Nargisse · Admin'), nav,
    h('div', { class: 'foot' }, h('div', { class: 'who' }, 'Connecté : ' + st.user),
      h('a', { class: 'btn s', href: '../', target: '_blank', rel: 'noopener' }, 'Voir le site ↗'),
      h('button', { class: 'btn s', onclick: pwDialog }, 'Mot de passe'),
      h('button', { class: 'btn s', onclick: async () => { try { await api('logout', { method: 'POST' }); } catch { } login(); } }, 'Déconnexion')));
  app.replaceChildren(h('div', { class: 'shell' }, side, main()));
}
function main() {
  const c = st.cats.find(x => x.id === st.cat), items = st.data[c.id] || [];
  return h('main', { class: 'main' },
    st.must && h('div', { class: 'banner' }, h('span', {}, 'Vous utilisez un mot de passe provisoire. Choisissez-en un personnel.'), h('button', { class: 'btn s p', onclick: pwDialog }, 'Changer le mot de passe')),
    h('div', { class: 'mh' }, h('h2', {}, c.label)), h('p', { class: 'desc' }, c.desc),
    h('div', { class: 'file' }, '📄 ', h('b', {}, `data/features/${c.id}.js`), ` · ${items.length} élément${items.length > 1 ? 's' : ''}`),
    form(c), h('p', { class: 'sub' }, 'Éléments ajoutés'), list(c, items));
}

/* ---------- formulaire (ajout / modification) ---------- */
function preview(kind, f, box) {
  box.replaceChildren(); const src = URL.createObjectURL(f);
  if (kind === 'image') box.append(h('img', { src, alt: '' }));
  else if (kind === 'audio') box.append(h('audio', { controls: true, src }));
  else { const fam = 'prev' + Date.now(), s = h('div', { class: 'fs', style: `font-family:'${fam}',serif` }, 'Amara & Ethan'); box.append(s); new FontFace(fam, `url(${src})`).load().then(x => document.fonts.add(x)).catch(() => s.textContent = 'Aperçu indisponible'); }
}
function form(c) {
  const ed = st.edit && st.edit.cat === c.id ? st.edit.item : null, val = {}; let file = null;
  c.fields.forEach(f => val[f.k] = ed && ed[f.k] !== undefined ? ed[f.k] : f.t === 'select' ? f.opts[0][0] : (f.t === 'color' || f.t === 'range') ? f.def : '');
  const err = h('p', { class: 'err full' }), rows = {}; let fileRow = null;
  const sync = () => { c.fields.forEach(f => rows[f.k].hidden = !!f.showIf && val[f.showIf[0]] !== f.showIf[1]); if (fileRow) fileRow.hidden = !!c.file.showIf && val[c.file.showIf[0]] !== c.file.showIf[1]; };
  const mk = f => {
    let el;
    if (f.t === 'select') { el = h('select', {}, f.opts.map(o => h('option', { value: o[0], selected: o[0] === val[f.k] }, o[1]))); el.onchange = () => { val[f.k] = el.value; sync(); }; }
    else if (f.t === 'color') { el = h('input', { type: 'color', value: val[f.k] }); el.oninput = () => val[f.k] = el.value; }
    else if (f.t === 'range') { const o = h('em', {}, val[f.k]); el = h('input', { type: 'range', min: f.min, max: f.max, step: f.step, value: val[f.k] }); el.oninput = () => { val[f.k] = +el.value; o.textContent = el.value; }; return h('div', {}, h('label', { class: 'rv' }, f.l, o), el); }
    else { el = h('input', { type: 'text', maxlength: f.len, value: val[f.k], required: !!f.req && !f.showIf }); el.oninput = () => val[f.k] = el.value; }
    return h('div', {}, h('label', {}, f.l), el, f.hint && h('span', { class: 'hint' }, f.hint));
  };
  c.fields.forEach(f => rows[f.k] = mk(f));
  if (c.file) {
    const box = h('div', { class: 'pv chk' }), inp = h('input', { type: 'file', accept: c.file.accept });
    const cur = () => { box.replaceChildren(); if (ed && ed.url) { const u = '../' + ed.url; box.append(c.file.kind === 'image' ? h('img', { src: u, alt: '' }) : c.file.kind === 'audio' ? h('audio', { controls: true, src: u }) : h('div', { class: 'fs' }, ed.name)); } else box.append(h('small', { class: 'hint' }, 'Aucun fichier choisi')); };
    inp.onchange = () => {
      const f = inp.files[0]; file = null; err.textContent = ''; if (!f) return cur();
      if (f.size > c.file.max * 1048576) { err.textContent = `Fichier trop lourd (max ${c.file.max} Mo)`; inp.value = ''; return cur(); }
      const r = new FileReader(); r.onload = () => { file = { name: f.name, data: String(r.result).split(',')[1] }; }; r.readAsDataURL(f); preview(c.file.kind, f, box);
    };
    cur();
    fileRow = h('div', { class: 'full' }, h('label', {}, c.file.label + (c.file.optional ? ' (facultatif)' : '') + (ed ? ' — laisser vide pour conserver l’actuel' : '')), inp, h('span', { class: 'hint' }, `Max ${c.file.max} Mo`), box);
  }
  const btn = h('button', { class: 'btn p', type: 'submit' }, ed ? 'Enregistrer' : '＋ Ajouter');
  const fm = h('form', {
    class: 'card form', onsubmit: async ev => {
      ev.preventDefault(); err.textContent = ''; btn.disabled = true;
      try {
        const body = { item: val, file }, r = ed ? await api(`features/${c.id}/${ed.id}`, { method: 'PUT', body }) : await api(`features/${c.id}`, { method: 'POST', body });
        const a = st.data[c.id] = st.data[c.id] || []; if (ed) a[a.findIndex(x => x.id === ed.id)] = r; else a.push(r);
        st.edit = null; toast(ed ? 'Modifié ✓' : 'Ajouté ✓'); shell();
      } catch (e) { if (!expired(e)) { err.textContent = e.message; btn.disabled = false; } }
    }
  }, h('h3', {}, ed ? 'Modifier « ' + ed.name + ' »' : 'Ajouter'), ...c.fields.map(f => rows[f.k]), fileRow, err,
    h('div', { class: 'row full' }, btn, ed && h('button', { class: 'btn', type: 'button', onclick: () => { st.edit = null; shell(); } }, 'Annuler')));
  sync(); return fm;
}

/* ---------- liste ---------- */
const seen = new Set();
function loadFont(it) {
  const k = it.name + '|' + (it.url || ''); if (seen.has(k)) return; seen.add(k);
  if (it.source === 'file' && it.url) new FontFace(it.name, `url(../${it.url})`).load().then(f => document.fonts.add(f)).catch(() => { });
  else if (it.source === 'google') document.head.append(h('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(it.name).replace(/%20/g, '+') + '&display=swap' }));
}
function thumb(cat, it) {
  const img = () => h('img', { src: '../' + it.url, alt: '', loading: 'lazy' });
  if (cat === 'petals') return it.kind === 'emoji' ? h('div', { class: 'fs' }, it.emoji) : img();
  if (cat === 'music') return h('audio', { controls: true, preload: 'none', src: '../' + it.url });
  if (cat === 'backgrounds') return h('div', { style: `width:100%;height:100%;border-radius:8px;background:url('../${it.url}') ${it.mode === 'tile' ? '0 0/' + it.tile + 'px' : 'center/cover'};opacity:${(it.opacity || 100) / 100}` });
  if (cat === 'fonts') { loadFont(it); return h('div', { class: 'fs', style: `font-family:'${it.name}',serif` }, 'Amara & Ethan'); }
  if (cat === 'palettes') return h('div', { class: 'sw' }, ['bg', 'card', 'accent', 'ink', 'muted'].map(k => h('i', { style: 'background:' + it[k] })));
  return it.url ? img() : h('div', { class: 'fs' }, '⌖');
}
function list(c, items) {
  if (!items.length) return h('div', { class: 'empty' }, 'Rien pour l’instant. Ajoutez votre premier élément ci-dessus.');
  return h('div', { class: 'grid' }, items.map(it => h('div', { class: 'card it' },
    h('div', { class: 'th chk' }, thumb(c.id, it)),
    h('div', { class: 'bd' }, h('b', {}, it.name),
      h('div', {}, ['kind', 'mode', 'source', 'role'].map(k => it[k] && lab(c, k, it[k]) && h('span', { class: 'tag' }, lab(c, k, it[k])))),
      it.url && h('small', {}, it.url + (it.bytes ? ' · ' + sz(it.bytes) : '')), it.a && h('small', {}, it.a)),
    h('div', { class: 'ac' },
      h('button', { class: 'btn s', onclick: () => { st.edit = { cat: c.id, item: it }; shell(); scrollTo({ top: 0, behavior: 'smooth' }); } }, 'Modifier'),
      h('button', { class: 'btn s d', onclick: () => del(c, it) }, 'Supprimer')))));
}
async function del(c, it) {
  if (!confirm(`Supprimer « ${it.name} » ? Le fichier envoyé sera aussi effacé.`)) return;
  try { await api(`features/${c.id}/${it.id}`, { method: 'DELETE' }); st.data[c.id] = st.data[c.id].filter(x => x.id !== it.id); if (st.edit && st.edit.item.id === it.id) st.edit = null; toast('Supprimé'); shell(); }
  catch (e) { if (!expired(e)) toast(e.message); }
}

/* ---------- changer le mot de passe ---------- */
function pwDialog() {
  const d = h('dialog'), err = h('p', { class: 'err' }), I = (n, ac) => h('input', { type: 'password', autocomplete: ac, required: true, minlength: n === 'c' ? 1 : 10 });
  const c = I('c', 'current-password'), n1 = I('n', 'new-password'), n2 = I('n', 'new-password'), btn = h('button', { class: 'btn p', type: 'submit' }, 'Enregistrer');
  d.append(h('form', {
    onsubmit: async ev => {
      ev.preventDefault(); err.textContent = ''; if (n1.value !== n2.value) { err.textContent = 'Les deux mots de passe sont différents'; return; }
      btn.disabled = true;
      try { await api('password', { method: 'POST', body: { current: c.value, next: n1.value } }); st.must = false; d.close(); toast('Mot de passe modifié ✓'); shell(); }
      catch (e) { if (!expired(e)) { err.textContent = e.message; btn.disabled = false; } }
    }
  }, h('h3', {}, 'Changer le mot de passe'), h('div', {}, h('label', {}, 'Mot de passe actuel'), c),
    h('div', {}, h('label', {}, 'Nouveau mot de passe (10 caractères minimum)'), n1), h('div', {}, h('label', {}, 'Confirmer'), n2), err,
    h('div', { class: 'row' }, btn, h('button', { class: 'btn', type: 'button', onclick: () => d.close() }, 'Annuler'))));
  d.onclose = () => d.remove(); document.body.append(d); d.showModal();
}
boot();
