-- =====================================================================
-- InmoPilot — Sprint 3: historial de publicaciones
-- Pega TODO este texto en Supabase → SQL Editor → New query → Run.
-- Es seguro ejecutarlo varias veces.
-- =====================================================================

create table if not exists public.publicaciones (
  id            uuid primary key default gen_random_uuid(),
  propiedad_id  uuid references public.propiedades(id) on delete cascade,
  red           text not null default 'facebook',
  post_id       text,
  url           text,
  mensaje       text,
  estado        text not null default 'publicado',
  created_at    timestamptz not null default now()
);

alter table public.publicaciones enable row level security;

drop policy if exists "publicaciones_todo_autenticado" on public.publicaciones;
create policy "publicaciones_todo_autenticado"
  on public.publicaciones for all
  to authenticated
  using (true) with check (true);
