import { Injectable, signal, computed } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Observable } from 'rxjs';
import { SUPABASE_KEY, SUPABASE_URL } from './supabase.config';

export interface Design { id: number; category: string; name: string; value: string; file: string | null; }
export interface User { id: string; role: 'admin' | 'client'; email: string; }

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
// Transforme une promesse en Observable ; l'erreur garde la forme { error: { error: message } } attendue par les composants.
const run = <T>(fn: () => Promise<T>) => new Observable<T>(o => { fn().then(v => { o.next(v); o.complete(); }, e => o.error({ error: { error: e?.message || String(e) } })); });
const ok = (r: any) => { if (r.error) throw r.error; return r.data; };

@Injectable({ providedIn: 'root' })
export class Api {
  token = signal<string | null>(null);   // non nul = connecté
  user = signal<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  isAdmin = computed(() => this.user()?.role === 'admin'); // affichage seulement : la vraie protection est côté Supabase (RLS)

  constructor() {
    this.token.set(this.user() ? 'session' : null);
    sb.auth.getSession().then(async ({ data }) => data.session ? this.enter(data.session.user) : this.clear());
  }
  private async enter(u: { id: string; email?: string }) {
    const { data } = await sb.from('profiles').select('role').eq('id', u.id).maybeSingle();
    const user: User = { id: u.id, email: u.email || '', role: data?.role === 'admin' ? 'admin' : 'client' };
    localStorage.setItem('user', JSON.stringify(user)); this.user.set(user); this.token.set('session'); return user;
  }
  private clear() { localStorage.removeItem('user'); this.user.set(null); this.token.set(null); }

  login = (email: string, password: string) => run(async () => ({ user: await this.enter(ok(await sb.auth.signInWithPassword({ email, password })).user) }));
  register = (email: string, password: string) => run(async () => {
    const d = ok(await sb.auth.signUp({ email, password }));
    if (!d.session) throw new Error('Compte créé : confirmez votre e-mail (lien reçu), puis connectez-vous.');
    return { user: await this.enter(d.user!) };
  });
  logout() { sb.auth.signOut(); this.clear(); }

  designs = () => run(async () => ok(await sb.from('designs').select('*').order('id')) as Design[]);
  addDesign = (d: Partial<Design>) => run(async () => ok(await sb.from('designs').insert({ category: d.category, name: d.name, value: d.value || '', file: d.file || null })));
  deleteDesign = (id: number) => run(async () => ok(await sb.from('designs').delete().eq('id', id)));
  invitation = () => run(async () => ok(await sb.from('invitations').select('config').maybeSingle())?.config ?? null);
  saveInvitation = (config: any) => run(async () => ok(await sb.from('invitations').upsert({ user_id: this.user()!.id, config, updated: new Date().toISOString() })));
}

export const loggedIn: CanActivateFn = () => { const a = inject(Api), r = inject(Router); return a.token() ? true : r.parseUrl('/login'); };
export const adminOnly: CanActivateFn = () => { const a = inject(Api), r = inject(Router); return a.isAdmin() ? true : r.parseUrl(a.token() ? '/studio' : '/login'); };
