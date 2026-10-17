# Nargisse — Angular + Supabase (GitHub Pages)

- `web/` : Angular 20. Routes : `/login`, `/studio` (vue client), `/admin` (vue admin).
- `supabase/schema.sql` : tables (profiles, designs, invitations) + règles de sécurité RLS + designs de départ.
- Connexion = Supabase Auth (e-mail + mot de passe). Le rôle `admin` est stocké en base ; seul un admin peut ajouter/supprimer des designs (appliqué par la base, pas seulement par l'interface).

## 1. Supabase
1. Créez un projet sur https://supabase.com.
2. SQL Editor → collez `supabase/schema.sql` → Run.
3. Project Settings → API : copiez l'URL et la clé `anon` (publishable) dans `web/src/app/supabase.config.ts`.
4. (Optionnel) Authentication → Providers → Email : désactivez « Confirm email » pour des inscriptions immédiates.
5. Authentication → URL Configuration : ajoutez l'adresse de votre site GitHub Pages.

## 2. Premier administrateur
Inscrivez-vous sur le site, puis dans le SQL Editor :
```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'vous@exemple.com');
```
Reconnectez-vous : le lien « Administration » apparaît.

## 3. Lancer en local
```
cd web && npm install && npm start      # http://localhost:4200
```

## 4. Publier sur GitHub Pages
Envoyez tout ce dossier à la racine d'un dépôt GitHub → Settings → Pages → Source : **GitHub Actions**. Chaque `git push` sur `main` publie le site.
