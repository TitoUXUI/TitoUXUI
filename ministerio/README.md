# Ministerio de Adolescentes

MVP de una aplicacion web (PWA instalable) para gestionar el ministerio de
adolescentes de una iglesia: directorio con datos sensibles protegidos,
calendario con confirmacion de asistencia, itinerario por etapas con avisos
push automaticos, tareas, muro de anuncios/oracion, pagina de vision y
estatuto, y reporte mensual para el consistorio de ancianos.

Stack: **Next.js 14 (App Router) + TypeScript**, **Supabase** (Postgres +
Auth + Storage) con **Row Level Security**, **Tailwind CSS**, componentes
accesibles estilo shadcn/ui, y **Web Push + pg_cron** para las
notificaciones de etapas. Todo el modelo de datos vive en SQL plano: no hay
lock-in a ningun proveedor y los datos se pueden exportar en cualquier
momento (ver [Exportar datos](#exportar-datos)).

## Indice

- [Roles del sistema](#roles-del-sistema)
- [Requisitos previos](#requisitos-previos)
- [Levantar el proyecto en local](#levantar-el-proyecto-en-local)
- [Configurar el cron de notificaciones](#configurar-el-cron-de-notificaciones)
- [Desplegar a produccion](#desplegar-a-producci%C3%B3n-vercel--supabase)
- [Usuarios de prueba](#usuarios-de-prueba-solo-en-local)
- [Exportar datos](#exportar-datos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Que falta pulir / siguiente fase](#qu%C3%A9-falta-pulir--siguiente-fase)

## Roles del sistema

| Rol | Puede hacer |
|---|---|
| **Lider** | Control total: directorio (incluye datos sensibles), calendario, itinerario, tareas, anuncios, vision/estatuto, gestion de usuarios y roles. |
| **Colaborador** | Uso operativo diario: ve el directorio basico (sin datos sensibles), confirma asistencia a eventos, ve y completa sus tareas, publica motivos de oracion. |
| **Anciano** | Solo lectura: calendario, tareas completadas y reporte mensual. **Sin acceso** al directorio de adolescentes. |

Todo usuario nuevo entra automaticamente como **Colaborador** apenas
confirma su primer login (magic link/OTP); un Lider lo puede ascender desde
`Mas > Usuarios y roles`. Todos los permisos estan aplicados con **RLS en
Postgres**, no solo en el frontend — ver `supabase/migrations/`.

## Requisitos previos

- Node.js 20+
- Una cuenta de [Supabase](https://supabase.com) (capa gratuita alcanza para este tamano de ministerio)
- Una cuenta de [Vercel](https://vercel.com) para el deploy (capa gratuita tambien alcanza)
- [Supabase CLI](https://supabase.com/docs/guides/cli) para correr las migraciones y el emulador local

## Levantar el proyecto en local

```bash
cd ministerio
npm install

# 1) Arranca Postgres + Auth + Studio local (requiere Docker)
npx supabase start

# 2) Copia las claves que imprime "supabase start" (o "supabase status")
cp .env.example .env.local
# completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY con los
# valores de "API URL" y "anon key" locales

# 3) Genera un par de claves VAPID para las notificaciones push
npx web-push generate-vapid-keys
# pega "Public Key" en NEXT_PUBLIC_VAPID_PUBLIC_KEY
# pega "Private Key" en VAPID_PRIVATE_KEY

# 4) Aplica las migraciones + datos de prueba (supabase/seed.sql)
npx supabase db reset

# 5) Levanta la app
npm run dev
```

Abri http://localhost:3000 — te va a pedir un email y un codigo de 6
digitos (no hay contrasena). Con el emulador local, Supabase Studio
(http://localhost:54323 > Authentication > Emails) muestra el email con el
codigo en vez de enviarlo de verdad. Tambien podes usar directamente los
[usuarios de prueba](#usuarios-de-prueba-solo-en-local) que trae el seed.

## Configurar el cron de notificaciones

Las notificaciones de itinerario se disparan del lado del servidor: un
`pg_cron` corre cada minuto y llama a la Edge Function
`send-stage-notifications`, que revisa que etapas arrancan "ahora" y manda
el Web Push. Esto pasa aunque nadie tenga la app abierta.

```bash
# Deployar la Edge Function (una sola vez y en cada cambio de codigo)
npx supabase functions deploy send-stage-notifications --project-ref TU_PROJECT_REF

# Cargar los secretos que usa la funcion (VAPID + un secreto propio para
# validar que la llamada viene realmente de tu proyecto)
npx supabase secrets set \
  VAPID_PUBLIC_KEY=... \
  VAPID_PRIVATE_KEY=... \
  VAPID_SUBJECT="mailto:tu-email@iglesia.org" \
  CRON_SECRET="$(openssl rand -hex 24)" \
  --project-ref TU_PROJECT_REF
```

Despues, en el **SQL editor de Supabase** (proyecto remoto), corre una sola
vez para que `pg_cron` sepa a donde llamar (usa el mismo `CRON_SECRET` de
arriba):

```sql
alter database postgres set app.settings.supabase_functions_url = 'https://TU_PROJECT_REF.functions.supabase.co';
alter database postgres set app.settings.cron_secret = 'EL_MISMO_CRON_SECRET_DE_ARRIBA';
```

Las migraciones (`0006_cron.sql`) ya crean el job de `pg_cron` que corre
cada minuto; este paso solo le da la URL y el secreto (a proposito no se
commitea ningun secreto real al repo).

## Desplegar a produccion (Vercel + Supabase)

1. **Supabase**: crea un proyecto nuevo en supabase.com, corre
   `npx supabase link --project-ref TU_PROJECT_REF` y despues
   `npx supabase db push` para aplicar las migraciones. **No corras
   `supabase/seed.sql` en produccion** (son datos de prueba).
2. **Vercel**: importa el repo, elegi la carpeta `ministerio/` como root
   directory, y cargá las variables de entorno de `.env.example`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_VAPID_PUBLIC_KEY`). `SUPABASE_SERVICE_ROLE_KEY` y
   `VAPID_PRIVATE_KEY` no se usan en el frontend, no hace falta cargarlos
   en Vercel.
3. Segui los pasos de [Configurar el cron de notificaciones](#configurar-el-cron-de-notificaciones)
   contra el proyecto remoto.
4. En Supabase > Authentication > URL Configuration, agrega la URL de
   produccion (`https://tu-app.vercel.app/auth/callback`) a las Redirect
   URLs.

## Usuarios de prueba (solo en local)

El seed (`supabase/seed.sql`) crea, con password de emulador
`devpassword123` (no aplica en produccion, ahi solo existe login sin
contrasena):

| Email | Rol |
|---|---|
| lider1@iglesia-ejemplo.org | Lider |
| lider2@iglesia-ejemplo.org | Lider |
| colaborador1@iglesia-ejemplo.org | Colaborador |
| colaborador2@iglesia-ejemplo.org | Colaborador |
| colaborador3@iglesia-ejemplo.org | Colaborador |
| anciano1@iglesia-ejemplo.org | Anciano |

Tambien incluye 8 adolescentes con datos de contacto/salud de ejemplo, 4
eventos (uno pasado, uno de esta semana con itinerario completo, un
campamento futuro y uno cancelado), tareas, y publicaciones en el muro.

## Exportar datos

Nada queda atado a Supabase de forma irreversible:

- **Base de datos completa**: `npx supabase db dump --project-ref TU_PROJECT_REF -f backup.sql` exporta todo el esquema + datos en SQL estandar, restaurable en cualquier Postgres.
- **Reporte mensual**: boton "Descargar CSV" en `/reportes`.
- **Cualquier tabla puntual**: `select * from teens;` etc. desde el SQL editor y "Export as CSV".

## Estructura del proyecto

```
ministerio/
├─ src/
│  ├─ app/                  # Rutas (App Router)
│  │  ├─ login/              # Login con codigo OTP (sin contrasena)
│  │  ├─ onboarding/         # Explica "Agregar a inicio" en iOS + activa push
│  │  ├─ (app)/              # Rutas autenticadas (requieren sesion)
│  │  │  ├─ dashboard/
│  │  │  ├─ directorio/      # Lider + Colaborador (no Anciano)
│  │  │  ├─ calendario/      # Eventos + itinerario de etapas + RSVP
│  │  │  ├─ tareas/
│  │  │  ├─ muro/            # Anuncios + motivos de oracion
│  │  │  ├─ vision/          # Pagina estatica editable (Lider)
│  │  │  ├─ reportes/        # Reporte mensual + export CSV
│  │  │  └─ usuarios/        # Gestion de roles (solo Lider)
│  │  └─ api/                # Suscripcion push + export CSV
│  ├─ components/           # UI compartida (estilo shadcn, sin Radix)
│  └─ lib/                  # Clientes Supabase, tipos, helpers de roles
├─ supabase/
│  ├─ migrations/           # Esquema SQL + RLS, en orden
│  ├─ functions/
│  │  └─ send-stage-notifications/  # Edge Function (Deno) que envia el Web Push
│  ├─ seed.sql               # Datos de prueba (solo local)
│  └─ config.toml
└─ public/                  # manifest.webmanifest, sw.js, iconos PWA
```

## Que falta pulir / siguiente fase

**Pulido pendiente de este MVP:**
- Tests automatizados (unitarios y end-to-end) — hoy la validacion fue manual (`npm run build`/`typecheck`).
- Paginacion en directorio/tareas/muro cuando el ministerio crezca mucho (hoy trae todo en una sola consulta).
- Editor de "Vision y estatuto" mas amigable que un textarea con markdown minimo.
- Manejo mas fino de zonas horarias si el equipo llegase a operar en mas de un huso horario.
- Confirmar que el navegador realmente soporta `Notification`/`PushManager` en gama baja de Android antes de mostrar el boton de activar notificaciones (hoy se detecta pero no hay fallback visual mas alla del mensaje de error).
- Revisar antes de producción la lista de vulnerabilidades que reporta `npm audit` (heredadas de Next.js 14.2.x) y evaluar migrar a Next 15/16 mas adelante — implica adaptar `cookies()` y `params` a sus nuevas APIs asincronicas.

**Fuera de alcance a proposito (el modelo de datos queda abierto para esto):**
- Bitacora de discipulado por adolescente.
- Portal completo para padres (hoy el consentimiento y contacto de emergencia los carga el Lider, no el padre/madre).
- Radar automatico de ausentismo (hoy no se registra asistencia individual de adolescentes por evento, solo RSVP de voluntarios — se puede sumar una tabla `attendance_records` en el futuro sin romper nada existente).
- Gamificacion.
- Integraciones con WhatsApp/Telegram.
- Biblioteca multimedia y plantillas de predicas.
