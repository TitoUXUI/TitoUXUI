-- ============================================================================
-- Datos de prueba realistas para desarrollo local (`supabase db reset`).
-- NO correr contra un proyecto de produccion.
--
-- Nota: el insert directo a auth.users/auth.identities asume el esquema que
-- trae la version actual del Supabase CLI. Si `supabase db reset` falla con
-- "column ... does not exist", corre `supabase db diff --schema auth` (o
-- mira Studio > Table Editor > auth.users) para ajustar la lista de
-- columnas a tu version instalada.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Usuarios de prueba (login sin password: magic link / OTP).
-- Se insertan directamente en auth.users + auth.identities como hace
-- Supabase localmente; el trigger handle_new_user crea el profile con rol
-- "colaborador" por defecto y despues lo ajustamos.
-- ----------------------------------------------------------------------------
do $$
declare
  v_users jsonb := '[
    {"id": "00000000-0000-0000-0000-000000000001", "email": "lider1@iglesia-ejemplo.org", "full_name": "Marcos Ibanez", "role": "lider"},
    {"id": "00000000-0000-0000-0000-000000000002", "email": "lider2@iglesia-ejemplo.org", "full_name": "Sofia Ramallo",  "role": "lider"},
    {"id": "00000000-0000-0000-0000-000000000003", "email": "colaborador1@iglesia-ejemplo.org", "full_name": "Ezequiel Torres", "role": "colaborador"},
    {"id": "00000000-0000-0000-0000-000000000004", "email": "colaborador2@iglesia-ejemplo.org", "full_name": "Valentina Diaz",   "role": "colaborador"},
    {"id": "00000000-0000-0000-0000-000000000005", "email": "colaborador3@iglesia-ejemplo.org", "full_name": "Nicolas Ferreyra", "role": "colaborador"},
    {"id": "00000000-0000-0000-0000-000000000006", "email": "anciano1@iglesia-ejemplo.org", "full_name": "Anciano Ruben Godoy", "role": "anciano"}
  ]';
  u jsonb;
begin
  for u in select * from jsonb_array_elements(v_users) loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at, email_change_token_new, email_change,
      email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
      is_sso_user, deleted_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      (u ->> 'id')::uuid,
      'authenticated', 'authenticated',
      u ->> 'email',
      crypt('devpassword123', gen_salt('bf')),
      now(), now(), '', now(), '', null, '', '', null, now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', u ->> 'full_name'),
      false, now(), now(), null, null, false, null
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), (u ->> 'id')::uuid, u ->> 'email',
      jsonb_build_object('sub', u ->> 'id', 'email', u ->> 'email'),
      'email', now(), now(), now()
    )
    on conflict do nothing;

    update public.profiles
      set role = (u ->> 'role')::public.app_role,
          full_name = u ->> 'full_name'
      where id = (u ->> 'id')::uuid;
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Directorio de adolescentes
-- ----------------------------------------------------------------------------
insert into public.teens (id, full_name, birth_date, active, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'Camila Sosa',        '2010-03-14', true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Tomas Herrera',      '2009-07-02', true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Abril Nunez',        '2011-01-22', true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', 'Bautista Roldan',    '2010-11-09', true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000005', 'Delfina Aguero',     '2009-05-30', true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000006', 'Santino Paez',       '2012-02-18', true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000007', 'Mia Ledesma',        '2010-09-25', true, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000008', 'Lautaro Correa',     '2008-12-05', false, '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.teen_sensitive_info (
  teen_id, guardian_name, guardian_phone, guardian_relationship, health_notes,
  parental_consent, parental_consent_date, updated_by
) values
  ('10000000-0000-0000-0000-000000000001', 'Laura Sosa', '+54 9 11 5555-0001', 'Madre', null, true, '2026-02-01', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Ruben Herrera', '+54 9 11 5555-0002', 'Padre', 'Alergia a la penicilina', true, '2026-02-01', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Marina Nunez', '+54 9 11 5555-0003', 'Madre', null, true, '2026-02-03', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', 'Diego Roldan', '+54 9 11 5555-0004', 'Padre', 'Asma leve, usa inhalador de rescate', true, '2026-02-03', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000005', 'Patricia Aguero', '+54 9 11 5555-0005', 'Madre', null, false, null, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000006', 'Hector Paez', '+54 9 11 5555-0006', 'Padre', 'Alergia alimentaria: frutos secos', true, '2026-02-10', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000007', 'Carla Ledesma', '+54 9 11 5555-0007', 'Madre', null, true, '2026-02-10', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000008', 'Omar Correa', '+54 9 11 5555-0008', 'Padre', null, true, '2025-11-05', '00000000-0000-0000-0000-000000000001')
on conflict (teen_id) do nothing;

-- ----------------------------------------------------------------------------
-- Eventos: uno pasado (para el reporte), uno esta semana con itinerario, uno
-- a futuro (campamento), uno cancelado.
-- ----------------------------------------------------------------------------
insert into public.events (id, title, description, event_type, location, start_at, end_at, status, created_by) values
  ('20000000-0000-0000-0000-000000000001', 'Reunion de jovenes - mes pasado', 'Reunion semanal regular', 'reunion', 'Salon principal', (date_trunc('month', now()) - interval '1 month' + interval '6 days 19 hours'), (date_trunc('month', now()) - interval '1 month' + interval '6 days 21 hours'), 'programado', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Reunion de jovenes del sabado', 'Merienda, juegos y predica', 'reunion', 'Salon principal', (date_trunc('week', now()) + interval '5 days 19 hours'), (date_trunc('week', now()) + interval '5 days 21 hours'), 'programado', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Campamento de adolescentes', 'Campamento anual de fin de semana', 'campamento', 'Camping Rio Claro', (now() + interval '5 weeks'), (now() + interval '5 weeks 2 days'), 'programado', '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000004', 'Salida cancelada por lluvia', 'Salida a la plaza', 'evento', 'Plaza San Martin', (now() + interval '10 days'), (now() + interval '10 days 2 hours'), 'cancelado', '00000000-0000-0000-0000-000000000001')
on conflict (id) do nothing;

insert into public.event_rsvps (event_id, user_id, status) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'confirmado'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'confirmado'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'confirmado'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'confirmado'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'no_puedo'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'confirmado')
on conflict (event_id, user_id) do nothing;

-- Itinerario por etapas de la reunion del sabado (dispara notificaciones)
insert into public.event_stages (event_id, title, starts_at, sort_order, assigned_to) values
  ('20000000-0000-0000-0000-000000000002', 'Recepcion y merienda', (date_trunc('week', now()) + interval '5 days 19 hours'),      1, '00000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000002', 'Juegos y rompehielos',  (date_trunc('week', now()) + interval '5 days 19 hours 30 minutes'), 2, '00000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000002', 'Predica',               (date_trunc('week', now()) + interval '5 days 20 hours'),      3, '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'Cierre y oracion',      (date_trunc('week', now()) + interval '5 days 20 hours 45 minutes'), 4, null);

-- ----------------------------------------------------------------------------
-- Tareas
-- ----------------------------------------------------------------------------
insert into public.tasks (title, description, event_id, assigned_to, due_date, status, created_by, completed_at) values
  ('Comprar merienda para el sabado', 'Alfajores, jugo y galletitas para ~25 personas', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', (date_trunc('week', now()) + interval '4 days')::date, 'pendiente', '00000000-0000-0000-0000-000000000001', null),
  ('Probar sonido y microfonos', 'Revisar cables y bateria del microfono inalambrico', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', (date_trunc('week', now()) + interval '5 days')::date, 'pendiente', '00000000-0000-0000-0000-000000000001', null),
  ('Coordinar transporte al campamento', 'Confirmar micro y horarios de salida/regreso', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', (now() + interval '3 weeks')::date, 'pendiente', '00000000-0000-0000-0000-000000000002', null),
  ('Reservar salon para el mes pasado', 'Confirmar disponibilidad del salon principal', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', (date_trunc('month', now()) - interval '1 month' + interval '3 days')::date, 'completada', '00000000-0000-0000-0000-000000000001', (date_trunc('month', now()) - interval '1 month' + interval '3 days')),
  ('Actualizar lista de contactos de emergencia', 'Revisar que todos los adolescentes tengan consentimiento firmado', null, '00000000-0000-0000-0000-000000000001', (now() + interval '2 weeks')::date, 'pendiente', '00000000-0000-0000-0000-000000000001', null);

-- ----------------------------------------------------------------------------
-- Muro de anuncios y oracion
-- ----------------------------------------------------------------------------
insert into public.wall_posts (type, title, content, author_id, pinned) values
  ('anuncio', 'Campamento anual - inscripciones abiertas', 'Ya podes anotarte para el campamento de adolescentes. Cupos limitados, hablar con Marcos o Sofia.', '00000000-0000-0000-0000-000000000001', true),
  ('anuncio', 'Cambio de horario este sabado', 'Este sabado arrancamos 19:00 en punto para aprovechar mejor la merienda.', '00000000-0000-0000-0000-000000000002', false),
  ('oracion', null, 'Pidamos por la familia de Bautista, su abuelo esta internado.', '00000000-0000-0000-0000-000000000004', false),
  ('oracion', null, 'Gracias a Dios por el buen clima que tuvimos en la ultima salida.', '00000000-0000-0000-0000-000000000006', false),
  ('oracion', null, 'Oremos por sabiduria para el equipo de lideres en la planificacion del campamento.', '00000000-0000-0000-0000-000000000003', false);

update public.ministry_page set
  content = E'# Vision y estatuto del Ministerio de Adolescentes\n\n## Vision\nAcompanar a cada adolescente de la congregacion en su crecimiento espiritual, ' ||
            E'ensenandole las Escrituras y modelando una vida cristiana coherente, en sujecion al consistorio de ancianos.\n\n' ||
            E'## Valores\n- Fidelidad biblica y doctrina reformada\n- Cuidado pastoral personalizado de cada adolescente\n- Trabajo en equipo y rendicion de cuentas\n- Excelencia y orden en cada actividad\n\n' ||
            E'## Estatuto\nEl equipo de Lideres coordina la actividad diaria del ministerio y responde directamente ante el consistorio de ancianos, ' ||
            E'quienes supervisan la doctrina y reciben un reporte mensual de actividades.',
  updated_by = '00000000-0000-0000-0000-000000000001'
where id = true;
