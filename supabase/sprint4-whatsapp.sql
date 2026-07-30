-- =====================================================================
-- InmoPilot — Sprint 4: conversaciones y mensajes de WhatsApp
-- Pega TODO este texto en Supabase → SQL Editor → New query → Run.
-- Es seguro ejecutarlo varias veces.
-- =====================================================================

-- Una conversación por número de teléfono (lead).
create table if not exists public.conversaciones (
  id                uuid primary key default gen_random_uuid(),
  telefono          text not null unique,
  nombre            text,
  modo              text not null default 'ia' check (modo in ('ia','humano')),
  ultimo_mensaje_at timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- Mensajes de cada conversación.
create table if not exists public.mensajes (
  id              uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.conversaciones(id) on delete cascade,
  direccion       text not null check (direccion in ('entrante','saliente')),
  texto           text not null,
  intencion       text,
  escalar         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_mensajes_conversacion
  on public.mensajes(conversacion_id, created_at);

-- Seguridad: el panel (Omar autenticado) puede leer/gestionar.
-- El webhook escribe con la service role key (salta RLS).
alter table public.conversaciones enable row level security;
alter table public.mensajes enable row level security;

drop policy if exists "conversaciones_autenticado" on public.conversaciones;
create policy "conversaciones_autenticado"
  on public.conversaciones for all
  to authenticated using (true) with check (true);

drop policy if exists "mensajes_autenticado" on public.mensajes;
create policy "mensajes_autenticado"
  on public.mensajes for all
  to authenticated using (true) with check (true);
