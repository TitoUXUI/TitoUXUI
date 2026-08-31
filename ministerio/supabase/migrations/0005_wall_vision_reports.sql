-- ============================================================================
-- 0005: muro de anuncios/oracion, pagina de vision y estatuto, reporte mensual
-- ============================================================================
create type public.wall_post_type as enum ('anuncio', 'oracion');

create table public.wall_posts (
  id uuid primary key default gen_random_uuid(),
  type public.wall_post_type not null,
  title text,
  content text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger wall_posts_set_updated_at
  before update on public.wall_posts
  for each row execute procedure public.set_updated_at();

-- Pagina estatica "Vision y estatuto": una sola fila (singleton).
create table public.ministry_page (
  id boolean primary key default true,
  content text not null default '',
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  constraint ministry_page_singleton check (id)
);

create trigger ministry_page_set_updated_at
  before update on public.ministry_page
  for each row execute procedure public.set_updated_at();

insert into public.ministry_page (id, content)
values (true, '# Vision y estatuto\n\nEscribi aqui la vision, los valores y el estatuto del ministerio de adolescentes. Solo el equipo de Lideres puede editar esta pagina.')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- RLS: wall_posts
-- ----------------------------------------------------------------------------
alter table public.wall_posts enable row level security;

create policy "wall_posts: lectura para los 3 roles"
  on public.wall_posts for select
  to authenticated
  using (true);

create policy "wall_posts: oracion para cualquiera, anuncio solo lider"
  on public.wall_posts for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and (type = 'oracion' or (type = 'anuncio' and public.is_lider()))
  );

create policy "wall_posts: autor o lider edita"
  on public.wall_posts for update
  to authenticated
  using (author_id = auth.uid() or public.is_lider())
  with check (author_id = auth.uid() or public.is_lider());

create policy "wall_posts: autor o lider elimina"
  on public.wall_posts for delete
  to authenticated
  using (author_id = auth.uid() or public.is_lider());

-- ----------------------------------------------------------------------------
-- RLS: ministry_page
-- ----------------------------------------------------------------------------
alter table public.ministry_page enable row level security;

create policy "ministry_page: lectura para los 3 roles"
  on public.ministry_page for select
  to authenticated
  using (true);

create policy "ministry_page: solo lider edita"
  on public.ministry_page for update
  to authenticated
  using (public.is_lider())
  with check (public.is_lider());

-- ----------------------------------------------------------------------------
-- Reporte mensual: funcion SQL (security invoker, por defecto) para que se
-- respeten las policies de RLS de quien la ejecuta. Un anciano, por ejemplo,
-- solo vera el conteo de tareas completadas porque su policy de "tasks" no
-- le deja ver las pendientes.
-- ----------------------------------------------------------------------------
create or replace function public.monthly_report(p_month date)
returns table (
  period_start date,
  period_end date,
  events_total bigint,
  events_programados bigint,
  events_cancelados bigint,
  events_by_type jsonb,
  rsvps_confirmados bigint,
  rsvps_no_puede bigint,
  tasks_completadas bigint,
  tasks_pendientes_visibles bigint
)
language sql
stable
as $$
  with bounds as (
    select date_trunc('month', p_month)::date as start_date,
           (date_trunc('month', p_month) + interval '1 month')::date as end_date
  ),
  month_events as (
    select e.*
    from public.events e, bounds b
    where e.start_at >= b.start_date and e.start_at < b.end_date
  ),
  month_rsvps as (
    select r.*
    from public.event_rsvps r
    join month_events e on e.id = r.event_id
  ),
  month_tasks as (
    select t.*
    from public.tasks t, bounds b
    where coalesce(t.completed_at::date, t.due_date, t.created_at::date) >= b.start_date
      and coalesce(t.completed_at::date, t.due_date, t.created_at::date) < b.end_date
  )
  select
    b.start_date,
    (b.end_date - interval '1 day')::date,
    (select count(*) from month_events),
    (select count(*) from month_events where status = 'programado'),
    (select count(*) from month_events where status = 'cancelado'),
    (select coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb)
       from (select event_type, count(*) as cnt from month_events group by event_type) t),
    (select count(*) from month_rsvps where status = 'confirmado'),
    (select count(*) from month_rsvps where status = 'no_puedo'),
    (select count(*) from month_tasks where status = 'completada'),
    (select count(*) from month_tasks where status = 'pendiente')
  from bounds b;
$$;

comment on function public.monthly_report is 'Reporte mensual para el consistorio: eventos, RSVPs y tareas del mes indicado. Respeta RLS de quien lo ejecuta.';
