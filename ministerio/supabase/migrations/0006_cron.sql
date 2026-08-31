-- ============================================================================
-- 0006: disparador del lado del servidor para las notificaciones de etapas
-- ============================================================================
-- pg_cron corre CADA MINUTO una funcion que llama (via pg_net, HTTP interno
-- a Postgres) a la Edge Function "send-stage-notifications". La Edge
-- Function es la que decide que etapas arrancan "ahora" y envia el Web Push;
-- esta funcion de Postgres solo dispara el HTTP POST.
--
-- Los dos valores de configuracion (URL de las Functions y un secreto
-- compartido para autenticar la llamada) NO se commitean: se configuran una
-- vez despues de desplegar. Ver README.md > "Configurar el cron de
-- notificaciones".
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create or replace function public.trigger_stage_notifications()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  functions_url text := current_setting('app.settings.supabase_functions_url', true);
  cron_secret text := current_setting('app.settings.cron_secret', true);
begin
  if functions_url is null or cron_secret is null then
    raise warning 'app.settings.supabase_functions_url / cron_secret no configurados: notificaciones de etapas deshabilitadas';
    return;
  end if;

  perform extensions.net_http_post(
    url := functions_url || '/send-stage-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', cron_secret
    ),
    body := '{}'::jsonb
  );
exception when undefined_function then
  -- algunas versiones de pg_net exponen net.http_post en vez de extensions.net_http_post
  perform net.http_post(
    url := functions_url || '/send-stage-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', cron_secret
    ),
    body := '{}'::jsonb
  );
end;
$$;

select cron.schedule(
  'send-stage-notifications-every-minute',
  '* * * * *',
  $$select public.trigger_stage_notifications();$$
);
