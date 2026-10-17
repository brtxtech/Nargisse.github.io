import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from './api';

@Component({
  selector: 'app-login', imports: [FormsModule],
  template: `
  <div class="box"><h1>Nargisse</h1><p>{{ mode() === 'login' ? 'Connectez-vous' : 'Créez votre compte' }}</p>
    <input type="email" placeholder="E-mail" [(ngModel)]="email">
    <input type="password" placeholder="Mot de passe (8 caractères min.)" [(ngModel)]="pw" (keyup.enter)="go()">
    @if (err()) {<div class="err">{{ err() }}</div>}
    <button class="pri" (click)="go()">{{ mode() === 'login' ? 'Se connecter' : 'Créer le compte' }}</button>
    <a (click)="mode.set(mode() === 'login' ? 'reg' : 'login')">{{ mode() === 'login' ? 'Pas de compte ? S’inscrire' : 'Déjà un compte ? Connexion' }}</a>
  </div>`,
})
export class Login {
  private api = inject(Api); private r = inject(Router);
  email = ''; pw = ''; mode = signal<'login' | 'reg'>('login'); err = signal('');
  go() {
    (this.mode() === 'login' ? this.api.login(this.email, this.pw) : this.api.register(this.email, this.pw))
      .subscribe({ next: u => this.r.navigateByUrl(u.user.role === 'admin' ? '/admin' : '/studio'), error: e => this.err.set(e.error?.error || 'Erreur') });
  }
}
