import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api, Design } from './api';

export const CATS: Record<string, string> = { palettes: 'Palette', fonts: 'Police', petals: 'Pétales', frames: 'Décor latéral', backgrounds: 'Fond', envelopes: 'Enveloppe', music: 'Musique', venues: 'Lieu' };

@Component({
  selector: 'app-studio', imports: [FormsModule],
  template: `
  <div class="studio">
    <aside>
      <h2>Mon invitation</h2>
      <label>Les mariés<input [(ngModel)]="names" placeholder="Nargisse & Karim"></label>
      <label>Date<input type="date" [(ngModel)]="date"></label>
      @for (c of cats; track c) {
        <label>{{ labels[c] }}
          <select [ngModel]="sel()[c]" (ngModelChange)="pick(c, $event)">
            <option [ngValue]="null">— aucun —</option>
            @for (d of by()[c] || []; track d.id) {<option [ngValue]="d.id">{{ d.name }}</option>}
          </select></label>
      }
      <button class="pri" (click)="save()">Enregistrer</button>@if (msg()) {<small>{{ msg() }}</small>}
    </aside>
    <section class="card" [style.background]="bg()" [style.color]="pal()[1]" [style.font-family]="font()"
             [style.background-image]="img('backgrounds') ? 'url(' + img('backgrounds') + ')' : null">
      @if (img('frames')) {<div class="frame" [style.background-image]="'url(' + img('frames') + ')'"></div>}
      @for (p of petals; track p) {<i class="petal" [style.left.%]="p * 8" [style.animation-delay.s]="p * 0.7">{{ petal() }}</i>}
      @if (img('envelopes')) {<img class="env" [src]="img('envelopes')">}
      <h1 [style.color]="pal()[2]">{{ names || 'Prénom & Prénom' }}</h1>
      <p>Vous invitent à célébrer leur mariage</p><p><b>{{ date || 'Date à définir' }}</b></p>
      @if (venue(); as v) {<p>{{ v.name }}<br><small>{{ v.value }}</small></p>@if (v.file) {<img class="env" [src]="v.file">}}
      @if (music(); as m) {<audio controls [src]="m.file!"></audio>}
    </section>
  </div>`,
})
export class Studio {
  private api = inject(Api);
  cats = Object.keys(CATS); labels = CATS; petals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  all = signal<Design[]>([]); names = ''; date = ''; msg = signal('');
  sel = signal<Record<string, number | null>>({});
  by = computed(() => this.all().reduce((o, d) => ((o[d.category] ||= []).push(d), o), {} as Record<string, Design[]>));
  get = (c: string) => this.all().find(d => d.id === this.sel()[c]);
  pal = computed(() => (this.get('palettes')?.value || '#ffffff|#222222|#b07a8a').split('|'));
  bg = computed(() => this.pal()[0]);
  font = computed(() => this.get('fonts')?.value || 'serif');
  petal = computed(() => this.get('petals')?.value || '');
  venue = computed(() => this.get('venues')); music = computed(() => { const m = this.get('music'); return m?.file ? m : null; });
  img = (c: string) => this.get(c)?.file || null;
  constructor() {
    this.api.designs().subscribe(d => { this.all.set(d);
      this.api.invitation().subscribe(c => { if (c) { this.names = c.names; this.date = c.date; this.sel.set(c.sel || {}); } }); });
  }
  pick(c: string, id: number | null) { this.sel.update(s => ({ ...s, [c]: id })); }
  save() { this.api.saveInvitation({ names: this.names, date: this.date, sel: this.sel() }).subscribe(() => { this.msg.set('Enregistré ✓'); setTimeout(() => this.msg.set(''), 2000); }); }
}
