-- ============================================================================
-- 0004: itinerario por etapas dentro de un evento + infraestructura de
-- notificaciones push (Web Push + pg_cron + Edge Function)
-- ============================================================================
create table public.event_stages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  sort_order integer not null default 0,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index event_stages_event_id_idx on public.event_stages (event_id, sort_order);
create index event_stages_starts_at_idx on public.event_stages (starts_at);

create trigger event_stages_set_updated_at
  before update on public.event_stages
  for each row execute procedure public.set_updated_at();

-- Suscripcion Web Push de cada dispositivo/navegador que acepto el permiso
-- de notificaciones. Un mismo usuario puede tener varios dispositivos.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- Registro de notificaciones ya disparadas por etapa: el cron corre cada
-- minuto y esto evita reenviar la misma notificacion dos veces.
create table public.stage_notifications_log (
  stage_id uuid primary key references public.event_stages (id) on delete cascade,
  sent_at timestamptz not null default now(),
  recipient_count integer not null default 0
);

-- ----------------------------------------------------------------------------
-- RLS: event_stages
-- ----------------------------------------------------------------------------
alter table public.event_stages enable row level security;

create policy "event_stages: lectura para todos los roles con sesion"
  on public.event_stages for select
  to authenticated
  using (true);

create policy "event_stages: solo lider administra el itinerario"
  on public.event_stages for all
  to authenticated
  using (public.is_lider())
  with check (public.is_lider());

-- ----------------------------------------------------------------------------
-- RLS: push_subscriptions (cada usuario administra sus propios dispositivos)
-- ----------------------------------------------------------------------------
alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions: cada usuario administra las suyas"
  on public.push_subscriptions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- RLS: stage_notifications_log (auditoria, visible para lider)
-- ----------------------------------------------------------------------------
alter table public.stage_notifications_log enable row level security;

create policy "stage_notifications_log: solo lider audita"
  on public.stage_notifications_log for select
  to authenticated
  using (public.is_lider());

-- Nota: el Edge Function "send-stage-notifications" corre con la
-- service_role key (bypassa RLS) tanto para leer que etapas arrancan
-- "ahora" como para insertar en este log, asi que no necesita policies de
-- insert/update para el rol authenticated.
