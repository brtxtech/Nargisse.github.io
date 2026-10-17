import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, Design } from './api';
import { CATS } from './studio';

type Opt = [string, string];
interface Field { k: string; t: 'text' | 'select' | 'color' | 'range'; l: string; opts?: Opt[]; def?: string | number; min?: number; max?: number; step?: number; showIf?: [string, string]; len?: number }
interface FileSpec { kind: 'image' | 'audio' | 'font'; l: string; showIf?: [string, string]; optional?: boolean; maxMB: number }
interface Spec { desc: string; fields: Field[]; file?: FileSpec }

const NAME: Field = { k: 'name', t: 'text', l: 'Nom', len: 80 };

// Même schéma que l'ancienne administration : le formulaire de chaque catégorie se construit tout seul.
// Les champs (hors « nom ») sont enregistrés en JSON dans designs.value ; le fichier dans designs.file.
const SCHEMA: Record<string, Spec> = {
  petals: {
    desc: 'Particules qui tombent sur la carte : une image (PNG transparent conseillé) ou un emoji. Elles apparaissent dans l’éditeur sous « Pétales & particules → Type ».',
    fields: [NAME, { k: 'kind', t: 'select', l: 'Source', def: 'emoji', opts: [['emoji', 'Emoji'], ['image', 'Image']] }, { k: 'emoji', t: 'text', l: 'Emoji', len: 8, showIf: ['kind', 'emoji'] }],
    file: { kind: 'image', l: 'Image du pétale', showIf: ['kind', 'image'], maxMB: 2 },
  },
  music: {
    desc: 'Morceaux complets proposés dans « Musique → Mélodie ». Préférez un MP3 léger (128 kbit/s, 5 Mo maximum).',
    fields: [{ ...NAME, l: 'Titre' }],
    file: { kind: 'audio', l: 'Fichier audio', maxMB: 5 },
  },
  frames: {
    desc: 'Images décoratives posées sur la carte : coins, bandes latérales ou cadre complet. Elles apparaissent dans « Décors sur les côtés ».',
    fields: [NAME, { k: 'mode', t: 'select', l: 'Disposition', def: 'corners', opts: [['corners', 'Coins (dessinez le coin en haut à gauche)'], ['sides', 'Côtés (bande répétée à gauche et à droite)'], ['overlay', 'Cadre complet (PNG transparent au centre)']] }],
    file: { kind: 'image', l: 'Image du décor', maxMB: 3 },
  },
  backgrounds: {
    desc: 'Images de fond : plein écran ou motif répété. Elles apparaissent dans « Fond ».',
    fields: [NAME, { k: 'mode', t: 'select', l: 'Affichage', def: 'cover', opts: [['cover', 'Plein écran'], ['tile', 'Motif répété']] },
      { k: 'tile', t: 'range', l: 'Taille du motif (px)', min: 60, max: 400, step: 10, def: 160, showIf: ['mode', 'tile'] },
      { k: 'opacity', t: 'range', l: 'Opacité (%)', min: 10, max: 100, step: 5, def: 100 }],
    file: { kind: 'image', l: 'Image de fond', maxMB: 3 },
  },
  envelopes: {
    desc: 'Photos d’enveloppes fermées affichées à l’ouverture, comme « Sceau doré (photo) ». Format portrait conseillé.',
    fields: [NAME],
    file: { kind: 'image', l: 'Photo de l’enveloppe', maxMB: 3 },
  },
  fonts: {
    desc: 'Importez une police (WOFF2, WOFF, TTF, OTF) ou indiquez le nom exact d’une police Google Fonts. Le nom devient celui de la police dans l’éditeur.',
    fields: [{ ...NAME, l: 'Nom de la police (lettres, chiffres, espaces, points, tirets)', len: 40 },
      { k: 'source', t: 'select', l: 'Source', def: 'google', opts: [['google', 'Google Fonts (nom exact)'], ['file', 'Fichier importé']] },
      { k: 'role', t: 'select', l: 'Utilisation', def: 'all', opts: [['all', 'Partout'], ['titles', 'Titres'], ['names', 'Prénoms (écriture)'], ['body', 'Texte']] }],
    file: { kind: 'font', l: 'Fichier de police', showIf: ['source', 'file'], maxMB: 2 },
  },
  palettes: {
    desc: 'Nouvelles palettes affichées dans « Style général → Palette ». Aucun fichier à envoyer.',
    fields: [NAME, { k: 'bg', t: 'color', l: 'Fond', def: '#faf7f2' }, { k: 'card', t: 'color', l: 'Cartes', def: '#f2ece1' }, { k: 'accent', t: 'color', l: 'Accent (or)', def: '#b8975a' },
      { k: 'ink', t: 'color', l: 'Texte', def: '#2a2a3c' }, { k: 'muted', t: 'color', l: 'Texte secondaire', def: '#7a736a' }],
  },
  venues: {
    desc: 'Lieux de réception proposés dans « Lieu », avec adresse, description et photo.',
    fields: [{ ...NAME, l: 'Nom du lieu' }, { k: 'a', t: 'text', l: 'Adresse', len: 160 }, { k: 'd', t: 'text', l: 'Description', len: 220 }],
    file: { kind: 'image', l: 'Photo du lieu', optional: true, maxMB: 3 },
  },
};

const ACCEPT = { image: 'image/png,image/jpeg,image/webp,image/gif', audio: 'audio/*', font: '.woff2,.woff,.ttf,.otf' };

@Component({
  selector: 'app-admin', imports: [FormsModule],
  template: `
  <h2>Ajouter une fonctionnalité</h2>
  <div class="row" style="margin-bottom:8px">
    <label>Catégorie
      <select [ngModel]="cat()" (ngModelChange)="setCat($event)">@for (c of cats; track c) {<option [value]="c">{{ labels[c] }}</option>}</select>
    </label>
  </div>
  <p><small>{{ spec().desc }}</small></p>
  <div class="adm-form">
    @for (f of spec().fields; track f.k) {
      @if (shown(f.showIf)) {
        <label>{{ f.l }}
          @switch (f.t) {
            @case ('select') {<select [(ngModel)]="form[f.k]">@for (o of f.opts; track o[0]) {<option [value]="o[0]">{{ o[1] }}</option>}</select>}
            @case ('color') {<input type="color" [(ngModel)]="form[f.k]">}
            @case ('range') {<span class="row"><input type="range" [min]="f.min!" [max]="f.max!" [step]="f.step!" [(ngModel)]="form[f.k]"> <b>{{ form[f.k] }}</b></span>}
            @default {<input [maxlength]="f.len || 80" [(ngModel)]="form[f.k]">}
          }
        </label>
      }
    }
    @if (fileSpec(); as fs) {
      <label>{{ fs.l }}{{ fs.optional ? ' (facultatif)' : '' }} <small>— {{ fs.maxMB }} Mo max</small>
        <input type="file" [accept]="accept[fs.kind]" (change)="read($event, fs)"></label>
      @if (file && fs.kind === 'image') {<img [src]="file" class="thumb" alt="">}
    }
    <div><button class="pri" (click)="add()" [disabled]="busy()">{{ busy() ? 'Envoi…' : 'Ajouter' }}</button></div>
  </div>
  @if (err()) {<div class="err">{{ err() }}</div>}

  @for (c of cats; track c) {
    <h3>{{ labels[c] }} ({{ (by()[c] || []).length }})</h3>
    <ul class="adm-list">@for (d of by()[c] || []; track d.id) {
      <li>
        @if (d.file && isImg(d.file)) {<img [src]="d.file" class="thumb" alt="">}
        @else if (d.file) {<span>📎</span>}
        <span>{{ d.name }}</span> <small>{{ info(d) }}</small>
        <button (click)="del(d)" title="Supprimer">✕</button>
      </li>}
    </ul>
  }`,
})
export class Admin {
  private api = inject(Api);
  cats = Object.keys(CATS); labels = CATS; accept = ACCEPT;
  cat = signal('petals');
  spec = computed(() => SCHEMA[this.cat()]);
  form: Record<string, string | number> = {};
  file: string | null = null; fileName = '';
  all = signal<Design[]>([]); err = signal(''); busy = signal(false);
  by = computed(() => this.all().reduce((o, d) => ((o[d.category] ||= []).push(d), o), {} as Record<string, Design[]>));

  constructor() { this.setCat('petals'); this.load(); }
  load() { this.api.designs().subscribe(d => this.all.set(d)); }
  setCat(c: string) {
    this.cat.set(c); this.file = null; this.fileName = ''; this.err.set('');
    this.form = { name: '' };
    for (const f of SCHEMA[c].fields) if (f.def !== undefined) this.form[f.k] = f.def; else if (f.k !== 'name') this.form[f.k] = '';
  }
  shown(c?: [string, string]) { return !c || this.form[c[0]] === c[1]; }
  fileSpec() { const f = this.spec().file; return f && this.shown(f.showIf) ? f : null; }
  isImg(u: string) { return u.startsWith('data:image/'); }
  info(d: Design) {
    try { const o = JSON.parse(d.value); return o.mode || o.emoji || o.a || o.source || ''; } catch { return d.value && !d.file ? d.value : ''; }
  }

  read(e: Event, fs: FileSpec) {
    const input = e.target as HTMLInputElement, f = input.files?.[0]; this.file = null; this.err.set('');
    if (!f) return;
    if (f.size > fs.maxMB * 1e6) { this.err.set(`Fichier trop lourd (${fs.maxMB} Mo max)`); input.value = ''; return; }
    if (fs.kind === 'font' && !/\.(woff2?|ttf|otf)$/i.test(f.name)) { this.err.set('Format de police non pris en charge'); input.value = ''; return; }
    const r = new FileReader(); r.onload = () => { this.file = r.result as string; this.fileName = f.name; }; r.readAsDataURL(f);
  }

  add() {
    const name = String(this.form['name'] || '').trim(), fs = this.fileSpec(), c = this.cat();
    if (!name) { this.err.set('Donnez un nom'); return; }
    if (c === 'fonts' && !/^[\w .-]{1,40}$/.test(name)) { this.err.set('Nom de police : lettres, chiffres, espaces, points et tirets uniquement'); return; }
    if (c === 'petals' && this.form['kind'] === 'emoji' && !String(this.form['emoji'] || '').trim()) { this.err.set('Saisissez un emoji'); return; }
    if (fs && !fs.optional && !this.file) { this.err.set('Choisissez un fichier'); return; }
    const o: Record<string, unknown> = {};
    for (const f of this.spec().fields) if (f.k !== 'name' && this.shown(f.showIf)) o[f.k] = f.t === 'range' ? +this.form[f.k] : String(this.form[f.k] ?? '').trim();
    if (c === 'fonts' && o['source'] === 'file') o['ext'] = (this.fileName.split('.').pop() || 'woff2').toLowerCase();
    this.busy.set(true); this.err.set('');
    this.api.addDesign({ category: c, name, value: JSON.stringify(o), file: fs ? this.file : null }).subscribe({
      next: () => { this.busy.set(false); this.setCat(c); this.load(); },
      error: e => { this.busy.set(false); this.err.set(e.error?.error || 'Erreur'); },
    });
  }
  del(d: Design) { if (confirm(`Supprimer « ${d.name} » ?`)) this.api.deleteDesign(d.id).subscribe(() => this.load()); }
}
