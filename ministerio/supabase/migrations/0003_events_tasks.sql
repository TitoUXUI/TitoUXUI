-- ============================================================================
-- 0003: calendario de eventos, confirmacion de asistencia (RSVP) y tareas
-- ============================================================================
create type public.event_type as enum ('reunion', 'campamento', 'evento');
create type public.event_status as enum ('programado', 'cancelado');
create type public.rsvp_status as enum ('confirmado', 'no_puedo');
create type public.task_status as enum ('pendiente', 'completada');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type public.event_type not null default 'reunion',
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  status public.event_status not null default 'programado',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_at is null or end_at >= start_at)
);

create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();

create table public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.rsvp_status not null,
  responded_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_id uuid references public.events (id) on delete set null,
  assigned_to uuid references public.profiles (id) on delete set null,
  due_date date,
  status public.task_status not null default 'pendiente',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create or replace function public.tasks_stamp_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completada' and old.status is distinct from 'completada' then
    new.completed_at = now();
  elsif new.status = 'pendiente' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

create trigger tasks_stamp_completed_at
  before update on public.tasks
  for each row execute procedure public.tasks_stamp_completed_at();

-- Un colaborador solo puede marcar su propia tarea como completada/pendiente:
-- no puede reasignarla, cambiarle el titulo, la fecha limite ni el evento.
create or replace function public.enforce_task_update_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_lider() then
    return new;
  end if;

  if old.assigned_to is distinct from auth.uid() then
    raise exception 'No podes editar una tarea que no es tuya';
  end if;

  if new.title is distinct from old.title
     or new.description is distinct from old.description
     or new.event_id is distinct from old.event_id
     or new.assigned_to is distinct from old.assigned_to
     or new.due_date is distinct from old.due_date then
    raise exception 'Como colaborador solo podes marcar la tarea como completada o pendiente';
  end if;

  return new;
end;
$$;

create trigger tasks_enforce_update_scope
  before update on public.tasks
  for each row execute procedure public.enforce_task_update_scope();

-- ----------------------------------------------------------------------------
-- RLS: events
-- ----------------------------------------------------------------------------
alter table public.events enable row level security;

create policy "events: lectura para todos los roles con sesion"
  on public.events for select
  to authenticated
  using (true);

create policy "events: solo lider crea"
  on public.events for insert
  to authenticated
  with check (public.is_lider());

create policy "events: solo lider edita o cancela"
  on public.events for update
  to authenticated
  using (public.is_lider())
  with check (public.is_lider());

create policy "events: solo lider elimina"
  on public.events for delete
  to authenticated
  using (public.is_lider());

-- ----------------------------------------------------------------------------
-- RLS: event_rsvps
-- ----------------------------------------------------------------------------
alter table public.event_rsvps enable row level security;

create policy "rsvps: lectura para todos los roles con sesion"
  on public.event_rsvps for select
  to authenticated
  using (true);

create policy "rsvps: colaborador y lider confirman su propia asistencia"
  on public.event_rsvps for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.current_role() in ('lider', 'colaborador')
  );

create policy "rsvps: cada uno actualiza su propia confirmacion"
  on public.event_rsvps for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "rsvps: cada uno borra su propia confirmacion"
  on public.event_rsvps for delete
  to authenticated
  using (user_id = auth.uid() or public.is_lider());

-- ----------------------------------------------------------------------------
-- RLS: tasks
-- ----------------------------------------------------------------------------
alter table public.tasks enable row level security;

create policy "tasks: lider ve todas, colaborador ve las suyas, anciano ve completadas"
  on public.tasks for select
  to authenticated
  using (
    public.is_lider()
    or assigned_to = auth.uid()
    or (public.current_role() = 'anciano' and status = 'completada')
  );

create policy "tasks: solo lider crea"
  on public.tasks for insert
  to authenticated
  with check (public.is_lider());

create policy "tasks: lider edita cualquiera, colaborador solo la suya"
  on public.tasks for update
  to authenticated
  using (public.is_lider() or assigned_to = auth.uid())
  with check (public.is_lider() or assigned_to = auth.uid());

create policy "tasks: solo lider elimina"
  on public.tasks for delete
  to authenticated
  using (public.is_lider());
