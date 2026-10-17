import { Routes } from '@angular/router';
import { adminOnly, loggedIn } from './api';
import { Login } from './login';
import { Studio } from './studio';
import { Admin } from './admin';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'studio', component: Studio, canActivate: [loggedIn] },   // vue client
  { path: 'admin', component: Admin, canActivate: [adminOnly] },    // vue admin
  { path: '**', redirectTo: 'login' },
];
