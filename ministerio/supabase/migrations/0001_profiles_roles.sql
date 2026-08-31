-- ============================================================================
-- 0001: perfiles y sistema de roles
-- ============================================================================
-- Roles del ministerio:
--   lider       -> control total
--   colaborador -> uso operativo diario
--   anciano     -> solo lectura de calendario, tareas completadas y reportes
create type public.app_role as enum ('lider', 'colaborador', 'anciano');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  role public.app_role not null default 'colaborador',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuario autenticado. El rol inicial es colaborador; un lider puede promoverlo.';

-- ----------------------------------------------------------------------------
-- Helper SECURITY DEFINER: evita recursion infinita en las policies de RLS
-- que necesitan saber el rol del usuario actual (si una policy de "profiles"
-- consultara "profiles" directamente, RLS se auto-invocaria en bucle).
-- ----------------------------------------------------------------------------
create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_lider()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'lider' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select active from public.profiles where id = auth.uid()), false);
$$;

-- ----------------------------------------------------------------------------
-- Trigger: crea automaticamente un profile (rol colaborador) cuando alguien
-- confirma su primer login via magic link / OTP.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Cualquier usuario autenticado activo puede ver la lista basica de perfiles
-- (se necesita para elegir responsables de tareas/etapas y mostrar nombres).
create policy "profiles: lectura para usuarios autenticados"
  on public.profiles for select
  to authenticated
  using (true);

-- Una sola policy de UPDATE (a proposito: si hubiera dos policies permisivas
-- para el mismo comando, Postgres combina sus WITH CHECK con OR sin atarlos
-- al USING que dejo pasar la fila, lo que abriria una escalada de rol).
-- Un usuario comun solo puede tocar su propio perfil y nunca su propio rol;
-- un lider puede editar cualquier perfil, incluyendo rol y estado activo.
create policy "profiles: editar perfil propio o administracion de lider"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_lider())
  with check (
    public.is_lider()
    or (id = auth.uid() and role = public.current_role() and active = true)
  );

create policy "profiles: lider inserta perfiles"
  on public.profiles for insert
  to authenticated
  with check (public.is_lider() or id = auth.uid());

create policy "profiles: lider elimina perfiles"
  on public.profiles for delete
  to authenticated
  using (public.is_lider());
