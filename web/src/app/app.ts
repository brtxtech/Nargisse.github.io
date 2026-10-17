import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Api } from './api';

@Component({
  selector: 'app-root', imports: [RouterOutlet, RouterLink],
  template: `
  @if (api.user(); as u) {
    <header><b>Nargisse</b>
      <nav><a routerLink="/studio">Mon invitation</a>@if (api.isAdmin()) {<a routerLink="/admin">Administration</a>}</nav>
      <span>{{ u.email }} <button (click)="out()">Déconnexion</button></span></header>
  }
  <main><router-outlet /></main>`,
})
export class App {
  api = inject(Api); private r = inject(Router);
  out() { this.api.logout(); this.r.navigateByUrl('/login'); }
}
