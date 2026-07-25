-- =====================================================================
-- InmoPilot — Sprint 1: tabla de propiedades + almacén de fotos
-- Pega TODO este texto en Supabase → SQL Editor → New query → Run.
-- Es seguro ejecutarlo varias veces (usa IF NOT EXISTS / ON CONFLICT).
-- =====================================================================

-- 1) Tabla de propiedades
create table if not exists public.propiedades (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  operacion     text not null check (operacion in ('arriendo','venta')),
  tipo          text not null check (tipo in ('apartamento','casa','local','oficina','lote','bodega')),
  precio        bigint not null default 0,
  ciudad        text,
  barrio        text,
  direccion     text,
  habitaciones  integer not null default 0,
  banos         integer not null default 0,
  parqueaderos  integer not null default 0,
  area          numeric,
  estrato       integer,
  descripcion   text,
  estado        text not null default 'disponible' check (estado in ('disponible','arrendada','vendida')),
  fotos         text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Mantener updated_at al día automáticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_propiedades_updated_at on public.propiedades;
create trigger trg_propiedades_updated_at
  before update on public.propiedades
  for each row execute function public.set_updated_at();

-- 2) Seguridad: solo usuarios autenticados (Omar) pueden ver/editar
alter table public.propiedades enable row level security;

drop policy if exists "propiedades_todo_autenticado" on public.propiedades;
create policy "propiedades_todo_autenticado"
  on public.propiedades for all
  to authenticated
  using (true) with check (true);

-- 3) Almacén de fotos (bucket público para poder mostrarlas)
insert into storage.buckets (id, name, public)
values ('propiedades', 'propiedades', true)
on conflict (id) do update set public = true;

-- 4) Permisos del almacén:
--    - Cualquiera puede VER las fotos (para mostrarlas en el panel y publicaciones)
--    - Solo el usuario autenticado puede subir/actualizar/borrar
drop policy if exists "fotos_lectura_publica" on storage.objects;
create policy "fotos_lectura_publica"
  on storage.objects for select
  to public
  using (bucket_id = 'propiedades');

drop policy if exists "fotos_subida_autenticada" on storage.objects;
create policy "fotos_subida_autenticada"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'propiedades');

drop policy if exists "fotos_update_autenticada" on storage.objects;
create policy "fotos_update_autenticada"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'propiedades');

drop policy if exists "fotos_borrado_autenticado" on storage.objects;
create policy "fotos_borrado_autenticado"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'propiedades');
