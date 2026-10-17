import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, Design } from './api';
import { CATS } from './studio';

// Chaque catégorie décrit les champs de son formulaire : le formulaire se construit tout seul.
const FORM: Record<string, { colors?: boolean; text?: string; file?: 'image' | 'audio'; fileReq?: boolean }> = {
  palettes: { colors: true }, fonts: { text: 'Police CSS, ex. \'Playfair Display\', serif' }, petals: { text: 'Emoji (ou image ci-dessous)', file: 'image' },
  frames: { file: 'image', fileReq: true }, backgrounds: { file: 'image', fileReq: true }, envelopes: { file: 'image', fileReq: true },
  music: { file: 'audio', fileReq: true }, venues: { text: 'Adresse', file: 'image' },
};

@Component({
  selector: 'app-admin', imports: [FormsModule],
  template: `
  <h2>Ajouter un design</h2>
  <div class="row">
    <select [(ngModel)]="cat" (ngModelChange)="reset()">@for (c of cats; track c) {<option [value]="c">{{ labels[c] }}</option>}</select>
    <input [(ngModel)]="name" placeholder="Nom">
    @if (f().colors) {<label>Fond <input type="color" [(ngModel)]="c0"></label><label>Texte <input type="color" [(ngModel)]="c1"></label><label>Accent <input type="color" [(ngModel)]="c2"></label>}
    @if (f().text) {<input [(ngModel)]="text" [placeholder]="f().text">}
    @if (f().file) {<input type="file" [accept]="f().file === 'audio' ? 'audio/*' : 'image/*'" (change)="read($event)">}
    <button class="pri" (click)="add()">Ajouter</button>
  </div>
  @if (err()) {<div class="err">{{ err() }}</div>}
  @for (c of cats; track c) {
    <h3>{{ labels[c] }} ({{ (by()[c] || []).length }})</h3>
    <ul>@for (d of by()[c] || []; track d.id) {<li>{{ d.name }} <small>{{ d.file ? '📎' : d.value }}</small> <button (click)="del(d)">✕</button></li>}</ul>
  }`,
})
export class Admin {
  private api = inject(Api);
  cats = Object.keys(CATS); labels = CATS; cat = 'palettes'; name = ''; text = ''; c0 = '#ffffff'; c1 = '#222222'; c2 = '#b07a8a'; file: string | null = null;
  all = signal<Design[]>([]); err = signal('');
  by = computed(() => this.all().reduce((o, d) => ((o[d.category] ||= []).push(d), o), {} as Record<string, Design[]>));
  f = () => FORM[this.cat];
  constructor() { this.load(); }
  load() { this.api.designs().subscribe(d => this.all.set(d)); }
  reset() { this.text = ''; this.file = null; this.err.set(''); }
  read(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return;
    if (f.size > 5e6) { this.err.set('Fichier trop lourd (5 Mo max)'); return; }
    const r = new FileReader(); r.onload = () => this.file = r.result as string; r.readAsDataURL(f);
  }
  add() {
    const value = this.f().colors ? [this.c0, this.c1, this.c2].join('|') : this.text;
    if (this.f().fileReq && !this.file) { this.err.set('Choisissez un fichier'); return; }
    this.api.addDesign({ category: this.cat, name: this.name, value, file: this.file }).subscribe({
      next: () => { this.name = ''; this.reset(); this.load(); }, error: e => this.err.set(e.error?.error || 'Erreur') });
  }
  del(d: Design) { if (confirm(`Supprimer « ${d.name} » ?`)) this.api.deleteDesign(d.id).subscribe(() => this.load()); }
}
