-- À coller dans Supabase → SQL Editor → Run

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'admin')));

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
insert into public.profiles(id) select id from auth.users on conflict do nothing;

create function public.is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create table public.designs (
  id bigint generated always as identity primary key,
  category text not null check (category in ('palettes','fonts','petals','frames','backgrounds','envelopes','music','venues')),
  name text not null check (length(name) between 1 and 80),
  value text not null default '',
  file text check (file is null or length(file) < 7000000),
  created_at timestamptz default now());

create table public.invitations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  config jsonb not null default '{}', updated timestamptz default now());

alter table public.profiles enable row level security;
alter table public.designs enable row level security;
alter table public.invitations enable row level security;

create policy "voir son profil" on public.profiles for select to authenticated using (id = auth.uid());
create policy "voir les designs" on public.designs for select to authenticated using (true);
create policy "admin ajoute" on public.designs for insert to authenticated with check (public.is_admin());
create policy "admin supprime" on public.designs for delete to authenticated using (public.is_admin());
create policy "son invitation" on public.invitations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into public.designs(category, name, value)
select * from (values
  ('palettes','Rose poudré','#fdf2f4|#4a2c35|#c98b9b'), ('palettes','Vert sauge','#f1f5ef|#2f3d2f|#7d9a78'), ('palettes','Nuit & or','#14161f|#f3e9d2|#d4af37'),
  ('fonts','Élégante','''Playfair Display'', serif'), ('fonts','Moderne','''Inter'', sans-serif'), ('fonts','Manuscrite','''Brush Script MT'', cursive'),
  ('petals','Pétale rose','🌸'), ('petals','Cœur','❤️'), ('petals','Étoile','✨')) v(category, name, value)
where not exists (select 1 from public.designs);

-- Après votre première inscription, rendez-vous administrateur (remplacez l'e-mail) :
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'vous@exemple.com');
