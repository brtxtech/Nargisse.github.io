import { Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Api, Design } from './api';

/** Catégories de designs ajoutables depuis l'admin (libellés partagés avec la page Administration). */
export const CATS: Record<string, string> = {
  petals: 'Pétales & particules', music: 'Musiques', frames: 'Décors latéraux', backgrounds: 'Fonds',
  envelopes: 'Enveloppes (photo)', fonts: 'Polices', palettes: 'Palettes', venues: 'Lieux',
};

/** Données passées au studio classique (public/studio/bridge.js les lit via window.parent.__NARGISSE). */
declare global { interface Window { __NARGISSE?: { designs: Design[]; state: unknown } } }

/**
 * Le studio complet (50 palettes, enveloppes animées, musiques, programme, menu, RSVP, QR, liens invités…)
 * vit dans public/studio/ et s'affiche ici dans une iframe de même origine.
 * - Les designs ajoutés par l'admin (Supabase) sont injectés dans ses listes de choix.
 * - Chaque modification est enregistrée automatiquement dans la table invitations (Supabase), par utilisateur.
 */
@Component({
  selector: 'app-studio',
  template: `
    <div class="studio-bar"><b>Mon invitation</b><small [class.err]="status() === 'error'">{{ label() }}</small></div>
    @if (src(); as s) { <iframe #fr class="studio-frame" title="Studio d'invitation" [src]="s"></iframe> }
    @else if (error()) { <div class="err" style="padding:24px">{{ error() }}</div> }
    @else { <p style="padding:24px">Chargement…</p> }`,
})
export class Studio implements OnDestroy {
  private api = inject(Api);
  private dom = inject(DomSanitizer);
  private frame = viewChild<ElementRef<HTMLIFrameElement>>('fr');
  src = signal<SafeResourceUrl | null>(null);
  error = signal('');
  status = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pending: unknown = null;
  private onMsg = (e: MessageEvent) => {
    if (e.origin !== location.origin || e.source !== this.frame()?.nativeElement.contentWindow) return;
    if (e.data?.type !== 'nargisse:save') return;
    clearTimeout(this.timer);
    this.status.set('saving'); this.pending = e.data.state;
    this.timer = setTimeout(() => this.flush(), 1200);   // on attend la fin des retouches
  };

  constructor() {
    window.addEventListener('message', this.onMsg);
    this.api.designs().subscribe({
      next: designs => this.api.invitation().subscribe({
        next: cfg => {
          // seules les sauvegardes du nouveau studio ({ v: 2, state }) sont reprises ; l'ancien format simple est ignoré
          window.__NARGISSE = { designs, state: cfg?.v === 2 ? cfg.state : null };
          this.src.set(this.dom.bypassSecurityTrustResourceUrl(new URL('studio/index.html', document.baseURI).href));
        },
        error: e => this.error.set(e.error?.error || 'Impossible de charger votre invitation'),
      }),
      error: e => this.error.set(e.error?.error || 'Impossible de charger les designs'),
    });
  }
  private flush() {
    if (this.pending === null) return;
    const state = this.pending; this.pending = null;
    this.api.saveInvitation({ v: 2, state }).subscribe({
      next: () => this.status.set('saved'),
      error: () => this.status.set('error'),
    });
  }
  label() {
    return { idle: '', saving: 'Enregistrement…', saved: 'Enregistré ✓', error: 'Échec de l’enregistrement (connexion ?)' }[this.status()];
  }
  ngOnDestroy() { window.removeEventListener('message', this.onMsg); clearTimeout(this.timer); this.flush(); delete window.__NARGISSE; }
}
