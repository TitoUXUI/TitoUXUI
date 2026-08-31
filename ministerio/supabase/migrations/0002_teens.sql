-- ============================================================================
-- 0002: directorio de adolescentes
-- ============================================================================
-- Se separa en dos tablas a proposito: Postgres RLS es row-level, no
-- column-level. Para que un Colaborador pueda ver el listado basico (nombre,
-- fecha de nacimiento) pero NUNCA el contacto de emergencia ni datos de
-- salud, esos campos sensibles viven en una tabla aparte visible solo para
-- Lider.
create table public.teens (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth_date date not null,
  active boolean not null default true,
  photo_url text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.teens is 'Datos basicos del adolescente. Visibles para lider y colaborador.';

create table public.teen_sensitive_info (
  teen_id uuid primary key references public.teens (id) on delete cascade,
  guardian_name text not null default '',
  guardian_phone text not null default '',
  guardian_relationship text not null default '',
  health_notes text,
  parental_consent boolean not null default false,
  parental_consent_date date,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

comment on table public.teen_sensitive_info is 'Contacto de emergencia y datos de salud. Visible SOLO para rol lider.';

create trigger teens_set_updated_at
  before update on public.teens
  for each row execute procedure public.set_updated_at();

create trigger teen_sensitive_info_set_updated_at
  before update on public.teen_sensitive_info
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS: teens (basico)
-- ----------------------------------------------------------------------------
alter table public.teens enable row level security;

create policy "teens: lider y colaborador leen el directorio"
  on public.teens for select
  to authenticated
  using (public.current_role() in ('lider', 'colaborador'));

create policy "teens: solo lider crea"
  on public.teens for insert
  to authenticated
  with check (public.is_lider());

create policy "teens: solo lider edita"
  on public.teens for update
  to authenticated
  using (public.is_lider())
  with check (public.is_lider());

create policy "teens: solo lider elimina"
  on public.teens for delete
  to authenticated
  using (public.is_lider());

-- ----------------------------------------------------------------------------
-- RLS: teen_sensitive_info (solo lider, en todas las operaciones)
-- ----------------------------------------------------------------------------
alter table public.teen_sensitive_info enable row level security;

create policy "teen_sensitive_info: solo lider"
  on public.teen_sensitive_info for all
  to authenticated
  using (public.is_lider())
  with check (public.is_lider());
