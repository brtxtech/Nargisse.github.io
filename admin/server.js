#!/usr/bin/env node
'use strict';
/* =====================================================================
   admin/server.js — serveur local d’administration (aucune dépendance)

   • sert le site (http://localhost:3000/) et l’admin (http://localhost:3000/admin/)
   • connexion avec mot de passe (scrypt) + cookie de session signé
   • chaque catégorie de fonctionnalités = 1 fichier : data/features/<categorie>.js (+ .json)
   • les fichiers envoyés (images, musiques, polices) vont dans uploads/<categorie>/

   Démarrage :  node admin/server.js        (ou : npm start)
   Mot de passe oublié :  node admin/server.js --reset-password
   ===================================================================== */
const http = require('http'), fs = require('fs'), fsp = fs.promises, path = require('path'), crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

const ROOT = path.resolve(__dirname, '..');
const PRIV = path.join(__dirname, 'private');
const USERS_F = path.join(PRIV, 'users.json'), SECRET_F = path.join(PRIV, 'secret.key');
const FEAT = path.join(ROOT, 'data', 'features'), UPL = path.join(ROOT, 'uploads');
const PORT = +process.env.PORT || 3000, HOST = process.env.HOST || '127.0.0.1';
const SESSION_MS = 8 * 3600 * 1000, MAX_BODY = 30 * 1024 * 1024;

/* ---------------------------------------------------------------------
   Schéma : décrit chaque catégorie (champs + fichier). L’interface
   d’admin se construit toute seule à partir de ce schéma (GET /api/schema).
   Pour ajouter une catégorie : ajoutez-la ici, puis branchez-la dans
   js/catalog.js (bloc « fonctionnalités ajoutées depuis l’admin »).
   --------------------------------------------------------------------- */
const FILES = {
  image: { ext: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'], max: 5, accept: 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml' },
  audio: { ext: ['mp3', 'm4a', 'aac', 'wav', 'ogg'], max: 15, accept: 'audio/*,.mp3,.m4a,.aac,.wav,.ogg' },
  font: { ext: ['woff2', 'woff', 'ttf', 'otf'], max: 3, accept: '.woff2,.woff,.ttf,.otf' }
};
const T = (k, l, o = {}) => ({ k, t: 'text', l, req: 1, len: 80, ...o });
const SEL = (k, l, opts, o = {}) => ({ k, t: 'select', l, opts, ...o });
const COL = (k, l, def) => ({ k, t: 'color', l, def });
const SCHEMA = {
  petals: {
    label: 'Pétales & particules', icon: '❀',
    desc: 'Nouveaux types de particules qui tombent sur la carte : une image (PNG transparent conseillé) ou un emoji. Ils apparaissent dans l’éditeur sous « Pétales & particules → Type ». Le choix du plan (devant ou derrière la carte) se fait ensuite dans l’éditeur.',
    fields: [T('name', 'Nom'), SEL('kind', 'Source', [['image', 'Image'], ['emoji', 'Emoji']]), T('emoji', 'Emoji', { showIf: ['kind', 'emoji'], len: 8 })],
    file: { kind: 'image', label: 'Image du pétale', showIf: ['kind', 'image'] }
  },
  music: {
    label: 'Musiques', icon: '♫',
    desc: 'Morceaux complets proposés dans « Musique → Mélodie ». Préférez un fichier léger (MP3 128 kbit/s, moins de 15 Mo).',
    fields: [T('name', 'Titre')],
    file: { kind: 'audio', label: 'Fichier audio' }
  },
  frames: {
    label: 'Décors latéraux', icon: '❖',
    desc: 'Images décoratives posées sur la carte : coins, bandes latérales ou cadre complet. Elles apparaissent dans « Décors sur les côtés ».',
    fields: [T('name', 'Nom'), SEL('mode', 'Disposition', [['corners', 'Coins (dessinez le coin en haut à gauche)'], ['sides', 'Côtés (bande répétée à gauche et à droite)'], ['overlay', 'Cadre complet (PNG transparent au centre)']])],
    file: { kind: 'image', label: 'Image du décor' }
  },
  backgrounds: {
    label: 'Fonds', icon: '▦',
    desc: 'Images de fond : plein écran ou motif répété. Elles apparaissent dans « Fond ».',
    fields: [T('name', 'Nom'), SEL('mode', 'Affichage', [['cover', 'Plein écran'], ['tile', 'Motif répété']]),
      { k: 'tile', t: 'range', l: 'Taille du motif (px)', min: 60, max: 400, step: 10, def: 160, showIf: ['mode', 'tile'] },
      { k: 'opacity', t: 'range', l: 'Opacité (%)', min: 10, max: 100, step: 5, def: 100 }],
    file: { kind: 'image', label: 'Image de fond' }
  },
  envelopes: {
    label: 'Enveloppes (photo)', icon: '✉',
    desc: 'Photos d’enveloppes fermées affichées à l’ouverture, comme « Sceau doré (photo) ». Format portrait conseillé, proche de assets/envelope.jpg.',
    fields: [T('name', 'Nom')],
    file: { kind: 'image', label: 'Photo de l’enveloppe' }
  },
  fonts: {
    label: 'Polices', icon: 'Aa',
    desc: 'Importez une police (WOFF2, WOFF, TTF, OTF) ou indiquez le nom exact d’une police Google Fonts. Le nom devient le nom de la police dans l’éditeur.',
    fields: [T('name', 'Nom de la police', { len: 40, safe: 'font', hint: 'Lettres, chiffres, espaces, points et tirets uniquement.' }),
      SEL('source', 'Source', [['file', 'Fichier importé'], ['google', 'Google Fonts (nom exact)']]),
      SEL('role', 'Utilisation', [['titles', 'Titres'], ['names', 'Prénoms (écriture)'], ['body', 'Texte'], ['all', 'Partout']])],
    file: { kind: 'font', label: 'Fichier de police', showIf: ['source', 'file'] }
  },
  palettes: {
    label: 'Palettes', icon: '🎨',
    desc: 'Nouvelles palettes de couleurs affichées dans « Style général → Palette ». Aucun fichier à envoyer.',
    fields: [T('name', 'Nom'), COL('bg', 'Fond', '#faf7f2'), COL('card', 'Cartes', '#f2ece1'), COL('accent', 'Accent (or)', '#b8975a'), COL('ink', 'Texte', '#2a2a3c'), COL('muted', 'Texte secondaire', '#7a736a')]
  },
  venues: {
    label: 'Lieux', icon: '⌖',
    desc: 'Lieux de réception proposés dans « Lieu », avec adresse, description et photo.',
    fields: [T('name', 'Nom du lieu'), T('a', 'Adresse', { req: 0, len: 160 }), T('d', 'Description', { req: 0, len: 220 })],
    file: { kind: 'image', label: 'Photo du lieu', optional: true }
  }
};
const CATS = Object.keys(SCHEMA);

/* ---------- utilitaires ---------- */
const bad = (msg, status = 400) => Object.assign(new Error(msg), { status });
const rid = n => crypto.randomBytes(n).toString('hex');
const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'item';
let chain = Promise.resolve();
const locked = fn => { const r = chain.then(fn); chain = r.catch(() => {}); return r; };
const shown = (def, o) => !def.showIf || o[def.showIf[0]] === def.showIf[1];

/* ---------- mot de passe & sessions ---------- */
let secret = '', users = null;
const pwHash = async pw => { const salt = crypto.randomBytes(16); return 'scrypt$' + salt.toString('base64') + '$' + (await scrypt(pw, salt, 64)).toString('base64'); };
const pwCheck = async (pw, stored) => {
  const [, s, h] = String(stored).split('$'); if (!s || !h) return false;
  const a = await scrypt(String(pw), Buffer.from(s, 'base64'), 64), b = Buffer.from(h, 'base64');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const randPw = () => { const A = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from({ length: 16 }, () => A[crypto.randomInt(A.length)]).join(''); };
async function saveUsers(u) { users = u; await fsp.writeFile(USERS_F, JSON.stringify(u, null, 2), { mode: 0o600 }); }
async function initAuth() {
  await fsp.mkdir(PRIV, { recursive: true });
  try { secret = (await fsp.readFile(SECRET_F, 'utf8')).trim(); } catch { secret = rid(32); await fsp.writeFile(SECRET_F, secret, { mode: 0o600 }); }
  const reset = process.argv.includes('--reset-password');
  try { users = JSON.parse(await fsp.readFile(USERS_F, 'utf8')); } catch { users = null; }
  if (!users || reset) {
    const name = (users && users.user) || process.env.ADMIN_USER || 'admin', given = !reset && process.env.ADMIN_PASSWORD, pw = given || randPw();
    await saveUsers({ user: name, hash: await pwHash(pw), epoch: Date.now(), mustChange: !given });
    const L = ['Compte administrateur ' + (reset ? 'réinitialisé' : 'créé'), '', '  Identifiant   : ' + name, '  Mot de passe  : ' + (given ? '(celui de ADMIN_PASSWORD)' : pw), '', given ? '' : 'Changez-le après la première connexion.'];
    console.log('\n┌' + '─'.repeat(54) + '┐\n' + L.map(l => '│ ' + l.padEnd(53) + '│').join('\n') + '\n└' + '─'.repeat(54) + '┘\n');
  }
}
const sign = p => { const b = Buffer.from(JSON.stringify(p)).toString('base64url'); return b + '.' + crypto.createHmac('sha256', secret).update(b).digest('base64url'); };
function verify(t) {
  if (!t) return null; const [b, s] = String(t).split('.'); if (!b || !s) return null;
  const e = crypto.createHmac('sha256', secret).update(b).digest(), g = Buffer.from(s, 'base64url');
  if (g.length !== e.length || !crypto.timingSafeEqual(g, e)) return null;
  try { const p = JSON.parse(Buffer.from(b, 'base64url')); return p.exp > Date.now() ? p : null; } catch { return null; }
}
const cookie = (req, n) => (req.headers.cookie || '').split(/;\s*/).map(x => x.split(/=(.*)/s)).find(x => x[0] === n)?.[1];
const session = req => { const p = verify(cookie(req, 'adm')); return p && users && p.u === users.user && p.v === users.epoch ? users : null; };
const isHttps = req => req.headers['x-forwarded-proto'] === 'https' || process.env.COOKIE_SECURE === '1';
const setCookie = (req, res, v, age) => res.setHeader('Set-Cookie', `adm=${v}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${isHttps(req) ? '; Secure' : ''}`);
const startSession = (req, res) => setCookie(req, res, sign({ u: users.user, v: users.epoch, exp: Date.now() + SESSION_MS }), SESSION_MS / 1000);

/* anti force-brute : 5 échecs = 15 min de blocage par adresse */
const fails = new Map();
const locked_ = ip => { const f = fails.get(ip); return f && f.n >= 5 && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 60000) : 0; };
const fail = ip => { const f = fails.get(ip) || { n: 0 }; f.n++; f.until = Date.now() + 15 * 60000; fails.set(ip, f); };

/* ---------- validation des fichiers ---------- */
function sniff(ext, b) {
  const s = (o, t) => b.subarray(o, o + t.length).toString('latin1') === t;
  switch (ext) {
    case 'png': return b[0] === 0x89 && s(1, 'PNG');
    case 'jpg': case 'jpeg': return b[0] === 0xFF && b[1] === 0xD8;
    case 'gif': return s(0, 'GIF8');
    case 'webp': return s(0, 'RIFF') && s(8, 'WEBP');
    case 'svg': { const t = b.subarray(0, 400000).toString('utf8'); return /<svg[\s>]/i.test(t) && !/<script|\son\w+\s*=|javascript:/i.test(t); }
    case 'mp3': return s(0, 'ID3') || (b[0] === 0xFF && (b[1] & 0xE0) === 0xE0);
    case 'wav': return s(0, 'RIFF') && s(8, 'WAVE');
    case 'ogg': return s(0, 'OggS');
    case 'm4a': return s(4, 'ftyp');
    case 'aac': return (b[0] === 0xFF && (b[1] & 0xF0) === 0xF0) || s(4, 'ftyp') || s(0, 'ID3');
    case 'woff2': return s(0, 'wOF2');
    case 'woff': return s(0, 'wOFF');
    case 'ttf': return (b[0] === 0 && b[1] === 1 && b[2] === 0 && b[3] === 0) || s(0, 'true');
    case 'otf': return s(0, 'OTTO');
  }
  return false;
}
async function saveFile(cat, id, file, kind) {
  const K = FILES[kind], name = String(file.name || ''), ext = (name.split('.').pop() || '').toLowerCase();
  if (!K.ext.includes(ext)) throw bad(`Format non accepté (${K.ext.join(', ')})`);
  const buf = Buffer.from(String(file.data || ''), 'base64');
  if (!buf.length) throw bad('Fichier vide');
  if (buf.length > K.max * 1048576) throw bad(`Fichier trop lourd (max ${K.max} Mo)`);
  if (!sniff(ext, buf)) throw bad('Le contenu du fichier ne correspond pas à son format (ou SVG avec script refusé)');
  const e = ext === 'jpeg' ? 'jpg' : ext, fn = `${id}-${rid(2)}.${e}`;
  await fsp.mkdir(path.join(UPL, cat), { recursive: true });
  await fsp.writeFile(path.join(UPL, cat, fn), buf);
  return { url: `uploads/${cat}/${fn}`, ext: e, bytes: buf.length };
}
const rmFile = async url => {
  if (!url) return; const fp = path.resolve(ROOT, url);
  if (fp.startsWith(UPL + path.sep)) await fsp.unlink(fp).catch(() => {});
};

/* ---------- lecture / écriture des fichiers de fonctionnalités ---------- */
const readCat = async cat => { try { const a = JSON.parse(await fsp.readFile(path.join(FEAT, cat + '.json'), 'utf8')); return Array.isArray(a) ? a : []; } catch { return []; } };
async function writeCat(cat, items) {
  await fsp.mkdir(FEAT, { recursive: true });
  const json = JSON.stringify(items, null, 2), js = `/* Généré par l’admin (${cat}) — ne pas modifier à la main */\n(window.FEATURES=window.FEATURES||{})[${JSON.stringify(cat)}]=${JSON.stringify(items)};\n`;
  for (const [ext, data] of [['json', json], ['js', js]]) {
    const f = path.join(FEAT, cat + '.' + ext), tmp = f + '.tmp'; await fsp.writeFile(tmp, data); await fsp.rename(tmp, f);
  }
}
async function ensureFiles() {
  await fsp.mkdir(FEAT, { recursive: true });
  for (const c of CATS) if (!fs.existsSync(path.join(FEAT, c + '.js')) || !fs.existsSync(path.join(FEAT, c + '.json'))) await writeCat(c, await readCat(c));
}

/* ---------- validation d’un élément ---------- */
function cleanItem(cat, raw) {
  const out = {};
  for (const f of SCHEMA[cat].fields) {
    if (!shown(f, out)) continue;
    let v = raw[f.k];
    if (f.t === 'select') { if (!f.opts.some(o => o[0] === v)) v = f.def ?? f.opts[0][0]; }
    else if (f.t === 'color') { if (!/^#[0-9a-f]{6}$/i.test(String(v))) throw bad(`${f.l} : couleur invalide`); v = v.toLowerCase(); }
    else if (f.t === 'range') { v = Number(v); if (!isFinite(v) || v < f.min || v > f.max) v = f.def; }
    else {
      v = String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim();
      if (!v && f.req) throw bad(`${f.l} : champ obligatoire`);
      if (v.length > f.len) throw bad(`${f.l} : ${f.len} caractères maximum`);
      if (f.safe === 'font' && !/^[\p{L}\p{N} .-]+$/u.test(v)) throw bad(`${f.l} : caractères non autorisés`);
    }
    out[f.k] = v;
  }
  return out;
}

/* ---------- API ---------- */
async function body(req) {
  const c = []; let n = 0, over = false;
  await new Promise((ok, no) => { req.on('data', d => { n += d.length; if (n > MAX_BODY) over = true; else c.push(d); }); req.on('end', ok); req.on('error', no); });
  if (over) throw bad('Envoi trop volumineux', 413);
  try { return c.length ? JSON.parse(Buffer.concat(c).toString('utf8')) : {}; } catch { throw bad('JSON invalide'); }
}
const json = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(o)); };
const sameOrigin = req => { const o = req.headers.origin; if (!o) return true; try { return new URL(o).host === req.headers.host; } catch { return false; } };
const catOf = c => { if (!SCHEMA[c]) throw bad('Catégorie inconnue', 404); return SCHEMA[c]; };

async function api(req, res, u) {
  const m = req.method, parts = u.pathname.split('/').filter(Boolean).slice(1); // après « api »
  if (m !== 'GET' && m !== 'HEAD') {
    if (!sameOrigin(req) || req.headers['x-requested-with'] !== 'admin') throw bad('Requête refusée', 403);
  }
  const ip = req.socket.remoteAddress || '?';

  if (parts[0] === 'session' && m === 'GET') {
    const s = session(req); return json(res, 200, s ? { authenticated: true, user: s.user, mustChange: !!s.mustChange } : { authenticated: false });
  }
  if (parts[0] === 'login' && m === 'POST') {
    const wait = locked_(ip); if (wait) throw bad(`Trop de tentatives. Réessayez dans ${wait} min.`, 429);
    const b = await body(req), okUser = typeof b.user === 'string' && b.user === users.user, okPw = await pwCheck(b.password ?? '', users.hash);
    if (!(okUser && okPw)) { fail(ip); await new Promise(r => setTimeout(r, 500)); throw bad('Identifiant ou mot de passe incorrect', 401); }
    fails.delete(ip); startSession(req, res); return json(res, 200, { ok: true, user: users.user, mustChange: !!users.mustChange });
  }
  if (parts[0] === 'logout' && m === 'POST') { setCookie(req, res, '', 0); return json(res, 200, { ok: true }); }

  const me = session(req); if (!me) throw bad('Connexion requise', 401);

  if (parts[0] === 'schema' && m === 'GET') return json(res, 200, { cats: CATS.map(id => ({ id, ...SCHEMA[id], file: SCHEMA[id].file && { ...SCHEMA[id].file, accept: FILES[SCHEMA[id].file.kind].accept, max: FILES[SCHEMA[id].file.kind].max } })) });
  if (parts[0] === 'password' && m === 'POST') {
    const b = await body(req);
    if (!(await pwCheck(b.current ?? '', me.hash))) throw bad('Mot de passe actuel incorrect', 401);
    if (typeof b.next !== 'string' || b.next.length < 10) throw bad('Le nouveau mot de passe doit faire au moins 10 caractères');
    await saveUsers({ ...me, hash: await pwHash(b.next), epoch: Date.now(), mustChange: false }); startSession(req, res);
    return json(res, 200, { ok: true });
  }
  if (parts[0] !== 'features') throw bad('Introuvable', 404);

  if (parts.length === 1 && m === 'GET') { const o = {}; for (const c of CATS) o[c] = await readCat(c); return json(res, 200, o); }
  const sc = catOf(parts[1]), cat = parts[1], id = parts[2];

  if (parts.length === 2 && m === 'GET') return json(res, 200, await readCat(cat));

  if (parts.length === 2 && m === 'POST') {
    const b = await body(req);
    return json(res, 200, await locked(async () => {
      const items = await readCat(cat), clean = cleanItem(cat, b.item || {}), nid = slug(clean.name) + '-' + rid(2);
      if (cat === 'fonts' && items.some(i => i.name.toLowerCase() === clean.name.toLowerCase())) throw bad('Une police porte déjà ce nom');
      const it = { id: nid, ...clean, createdAt: new Date().toISOString() };
      if (sc.file && shown(sc.file, clean)) {
        if (b.file && b.file.data) Object.assign(it, await saveFile(cat, nid, b.file, sc.file.kind));
        else if (!sc.file.optional) throw bad(`${sc.file.label} : fichier obligatoire`);
      }
      items.push(it); await writeCat(cat, items); return it;
    }));
  }

  if (parts.length === 3 && m === 'PUT') {
    const b = await body(req);
    return json(res, 200, await locked(async () => {
      const items = await readCat(cat), i = items.findIndex(x => x.id === id); if (i < 0) throw bad('Élément introuvable', 404);
      const prev = items[i], clean = cleanItem(cat, b.item || {});
      if (cat === 'fonts' && items.some(x => x.id !== id && x.name.toLowerCase() === clean.name.toLowerCase())) throw bad('Une police porte déjà ce nom');
      const it = { id, ...clean, createdAt: prev.createdAt, updatedAt: new Date().toISOString() };
      let drop = null;
      if (sc.file && shown(sc.file, clean)) {
        if (b.file && b.file.data) { Object.assign(it, await saveFile(cat, id, b.file, sc.file.kind)); drop = prev.url; }
        else if (prev.url) Object.assign(it, { url: prev.url, ext: prev.ext, bytes: prev.bytes });
        else if (!sc.file.optional) throw bad(`${sc.file.label} : fichier obligatoire`);
      } else drop = prev.url;
      items[i] = it; await writeCat(cat, items); await rmFile(drop); return it;
    }));
  }

  if (parts.length === 3 && m === 'DELETE') {
    return json(res, 200, await locked(async () => {
      const items = await readCat(cat), it = items.find(x => x.id === id); if (!it) throw bad('Élément introuvable', 404);
      await writeCat(cat, items.filter(x => x.id !== id)); await rmFile(it.url); return { ok: true };
    }));
  }
  throw bad('Introuvable', 404);
}

/* ---------- fichiers statiques ---------- */
const MIME = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json; charset=utf-8', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', ico: 'image/x-icon', mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf', md: 'text/markdown; charset=utf-8', txt: 'text/plain; charset=utf-8' };
const ADMIN_PUBLIC = ['index.html', 'admin.css', 'admin.js'];
const ADMIN_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' blob: data: https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'";

async function serveStatic(req, res, u) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Méthode non autorisée' });
  let p; try { p = decodeURIComponent(u.pathname); } catch { return json(res, 400, { error: 'Requête invalide' }); }
  if (p === '/admin') { res.writeHead(301, { Location: '/admin/' }); return res.end(); }
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(ROOT, path.normalize(p)), rel = path.relative(ROOT, fp).split(path.sep);
  if (!fp.startsWith(ROOT + path.sep) || rel.some(s => s.startsWith('.') || s === 'node_modules') || (rel[0] === 'admin' && !ADMIN_PUBLIC.includes(rel[1] || '') ) || (rel[0] === 'admin' && rel.length > 2))
    return json(res, 404, { error: 'Introuvable' });
  let st; try { st = await fsp.stat(fp); } catch { return json(res, 404, { error: 'Introuvable' }); }
  if (!st.isFile()) return json(res, 404, { error: 'Introuvable' });
  const ext = path.extname(fp).slice(1).toLowerCase(), h = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' };
  if (rel[0] === 'admin') { h['Content-Security-Policy'] = ADMIN_CSP; h['X-Frame-Options'] = 'DENY'; }
  if (rel[0] === 'uploads') h['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  let a = 0, b = st.size - 1, code = 200; const r = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (r && (r[1] || r[2])) {
    if (r[1]) { a = +r[1]; if (r[2]) b = Math.min(b, +r[2]); } else { a = Math.max(0, st.size - +r[2]); }
    if (a > b || a >= st.size) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
    code = 206; h['Content-Range'] = `bytes ${a}-${b}/${st.size}`;
  }
  h['Content-Length'] = b - a + 1; res.writeHead(code, h);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(fp, { start: a, end: b }).on('error', () => res.destroy()).pipe(res);
}

/* ---------- démarrage ---------- */
(async () => {
  await initAuth();
  if (process.argv.includes('--reset-password')) return;
  await ensureFiles();
  http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://x');
      if (u.pathname.startsWith('/api/')) await api(req, res, u); else await serveStatic(req, res, u);
    } catch (e) {
      if (!e.status) console.error(e);
      if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'Erreur serveur' }); else res.end();
    }
  }).listen(PORT, HOST, () => {
    const o = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
    console.log(`Site   : ${o}/\nAdmin  : ${o}/admin/\n(Ctrl+C pour arrêter)`);
  });
})();
