# Gestor Estratégico de Tareas

Proyecto Integrador — Módulo 4 (Henry). SPA de gestión de tareas con
autenticación de usuarios, persistencia en la nube por usuario, envío de
notificaciones por email y deploy en producción.

> 🚧 Este README se completa progresivamente a medida que se avanza en los
> hitos del proyecto. Estado actual: **Hito 9 — Deploy en Vercel (completo)**.

## Descripción del proyecto

MateCode es una startup que desarrolla aplicaciones web para pequeñas
empresas. Este proyecto es una aplicación web para que los empleados de un
cliente puedan gestionar sus tareas diarias de forma organizada, persistente
y accesible desde cualquier dispositivo.

**Stack:**

- Frontend: React + TypeScript (Vite)
- Backend as a Service: Firebase (Authentication + Cloud Firestore)
- Notificaciones por email: AWS SES, invocado desde una Vercel Function
  (patrón BFF)
- Testing: Vitest + React Testing Library
- Deploy: Vercel

## Decisiones arquitectónicas

El proyecto está organizado por capas dentro de `src/`:

```
src/
├─ pages/        # Vistas de nivel top asociadas a una ruta (Login, Register, Tasks)
├─ components/   # Componentes de UI reutilizables y presentacionales
├─ features/     # Lógica de negocio por dominio (auth, tasks)
├─ services/     # Integraciones externas (Firebase, API de emails)
├─ routes/       # Configuración de React Router y ProtectedRoute
├─ hooks/        # Custom hooks (useAuth, useTasks)
├─ types/        # Tipos e interfaces compartidas
└─ utils/        # Funciones helper puras
api/             # Vercel Functions (envío de emails vía AWS SES)
tests/           # Tests unitarios y de componentes
```

## Instrucciones de instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DE_TU_REPO>
cd gestor-estrategico-tareas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# completar .env con las credenciales reales (ver sección siguiente)

# 4. Correr en modo desarrollo
npm run dev
```

Scripts disponibles:

| Script | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo de Vite (no sirve `/api/*`) |
| `npm run dev:functions` | Levanta todo con Vercel CLI, incluidas las Serverless Functions de `api/` — necesario para probar el envío de email en local |
| `npm run build` | Chequea tipos (app + `api/`) y genera el build de producción |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run typecheck` | Chequea tipos en `src/`, `api/` y la config de Vite, sin emitir archivos |
| `npm run test` | Corre los tests una vez (Vitest) |
| `npm run test:watch` | Corre los tests en modo watch |

## Variables de entorno necesarias

Ver `.env.example` para la plantilla completa. Resumen:

| Variable | Dónde se usa | Se completa en |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Frontend | Hito 2 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Hito 2 |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | Hito 2 |
| `VITE_FIREBASE_APP_ID` | Frontend | Hito 2 |
| `AWS_ACCESS_KEY_ID` | Vercel Function (backend) | Hito 7 |
| `AWS_SECRET_ACCESS_KEY` | Vercel Function (backend) | Hito 7 |
| `AWS_REGION` | Vercel Function (backend) | Hito 7 |
| `SES_SOURCE_EMAIL` | Vercel Function (backend) | Hito 7 |

⚠️ Las variables sin prefijo `VITE_` nunca deben usarse en código del
frontend: quedarían expuestas en el bundle del navegador.

## URL de producción

**https://tareas-inky.vercel.app**

Verificado en producción real (no solo en local):
- Login/logout, rutas protegidas y persistencia de sesión.
- CRUD de tareas contra Firestore (crear, editar, completar, eliminar),
  actualizándose sin recargar.
- Envío de resumen por email a través de la Vercel Function
  `/api/send-email`, probado en producción tanto el envío exitoso (con
  la cuenta de prueba verificada en SES) como el rechazo por email no
  verificado.
- Diseño responsive en mobile (375px) y sin errores inesperados en la
  consola del navegador.

### Cuenta de prueba

Para verificar el flujo completo (login, CRUD y envío de email) sin
crear una cuenta nueva:

| Email | Contraseña |
|---|---|
| `test.pim444@gmail.com` | `test123` |

Esta cuenta es solo para evaluación — no tiene datos sensibles. Al
apretar "Enviar resumen por email" logueado con ella, el email llega
realmente a esa bandeja (`test.pim444@gmail.com` está verificada en AWS
SES), así que sirve para confirmar el envío real, no solo la UI.

## Flujo de envío de emails

1. En la pantalla de tareas, la persona usuaria hace clic en **"Enviar
   resumen por email"**.
2. El frontend arma un resumen en texto plano a partir de las tareas ya
   cargadas (`utils/taskSummary.ts`: cuántas hay en total, pendientes y
   completadas, con sus títulos) y llama a
   `POST /api/send-email` con `{ to: <email del usuario>, summary }`.
3. La Vercel Function `api/send-email.ts` valida el body, arma un
   `SendEmailCommand` del AWS SDK v3 y lo envía usando `SESClient` con
   las credenciales que solo existen como variables de entorno del
   servidor.
4. AWS SES procesa el envío y la función responde `{ ok: true,
   messageId }` o `{ ok: false, error, message }`.
5. El botón refleja el resultado: mientras espera dice "Enviando...",
   y al terminar muestra la confirmación o el mensaje de error —nunca
   un código interno sin explicar.

Requisitos en AWS (una sola vez, fuera del código):

- Usuario IAM dedicado (ej. `ses-sender`) con permiso para
  `ses:SendEmail` — nunca se usan las credenciales de la cuenta raíz.
- Identidad del remitente (`SES_SOURCE_EMAIL`) verificada en SES, en la
  región de `AWS_REGION`.
- Mientras la cuenta de SES esté en modo Sandbox, el email de
  **destino** también debe estar verificado (SES no lo enviará si no
  lo está, aunque el código sea correcto).

## Uso de IA en el proyecto

Usé Claude (Claude Code) como asistente de desarrollo a lo largo de los
9 hitos, pero con un alcance acotado a propósito: le pedí ayuda puntual
en la estructura funcional del proyecto, la configuración de Firebase, la
configuración de AWS (el código, no las credenciales), el manejo de
tests y errores, y la parte visual de la SPA. El resto de las decisiones
de arquitectura, y toda la configuración sensible (crear el usuario IAM,
generar las Access Keys, verificar identidades en SES, cargar las
variables de entorno reales en Firebase/Vercel) las hice yo mismo,
manualmente, sin pasarle nunca esos valores a la IA.

**Dónde fue más efectiva:**

- **Estructura funcional inicial:** Vite + React + TypeScript, capas
  (`services/`, `hooks/`, `components/`, `pages/`, `types/`, `utils/`) y
  el patrón de mantener cada integración externa (Firebase, AWS SES)
  aislada en una única capa de servicio. Esto simplificó mucho el
  testing después: los componentes de tareas ni siquiera necesitaron
  mocks porque reciben todo por props.
- **Firebase:** el patrón `Authenticator` (Context + `onAuthStateChanged`
  + hook `useAuth`) para centralizar la sesión, y las Security Rules de
  Firestore con ownership por `userId`. Le pedí explícitamente que
  siguiera el mismo patrón que se explica en las clases del curso, en
  vez de una implementación genérica, para no desviarme de lo que se
  evalúa.
- **AWS SES:** el patrón BFF (`api/send-email.ts` como única pieza con
  acceso a las credenciales, patrón "mesero/cocina" de la clase) y el
  componente de UI para el botón de envío. Yo hice todo el circuito de
  AWS Console (usuario IAM, políticas, verificación de identidades en
  modo Sandbox) y cargué las variables directamente en mi `.env` y en
  Vercel.
- **Tests y manejo de errores:** la estrategia de mockear en los límites
  correctos (`hooks/useAuth`, `services/emailService`) en vez de mockear
  Firebase directamente, y traducir los códigos de error de Firebase a
  mensajes legibles en vez de mostrarlos crudos al usuario.
- **Parte visual:** el sistema de variables CSS para modo claro/oscuro
  (automático por `prefers-color-scheme` + interruptor manual) y el
  enfoque mobile-first en ese orden estricto (mobile → tablet → desktop).

**Patrones que aprendí a usar:**
- No aceptar ningún hito como terminado solo porque el código "se veía
  bien": pedí que se probara cada uno de verdad (`npm run typecheck`,
  `npm run build`, y probando el flujo real en el navegador o contra
  Firebase/AWS reales) antes de darlo por hecho. Esto sirvió: en un
  momento se descubrió que el script `npm run typecheck` llevaba
  configurado mal desde el Hito 1 y en realidad no estaba chequeando
  ningún archivo — se corrigió al auditarlo en vez de confiar en que
  "pasaba en verde".
- Trazar una línea clara sobre qué nunca le paso a la IA: cualquier
  credencial (API keys de AWS, contraseñas, tokens) la cargué yo mismo
  directamente en `.env` o en el dashboard de Vercel, nunca pegada en el
  chat.
- Usarla para acelerar el "primer borrador" (formularios, reglas de
  seguridad, tests) y revisar/entender ese borrador antes de aceptarlo,
  en vez de copiarlo sin leerlo.

## Estado del proyecto (hitos)

- [x] Hito 1 — Setup inicial
- [x] Hito 2 — Configuración de Firebase
- [x] Hito 3 — Autenticación
- [x] Hito 4 — Rutas protegidas
- [x] Hito 5 — Modelo de datos y seguridad (Firestore Rules)
- [x] Hito 6 — CRUD de tareas
- [x] Hito 7 — Email con AWS SES
- [x] Hito 8 — Testing
- [x] Hito 9 — Deploy en Vercel

## Extra credit implementado

- **Filtros**: por estado (pendientes/completadas/todas), por prioridad y
  por texto en el título ([TaskFilters.tsx](src/components/TaskFilters.tsx)).
- **Prioridad y fechas**: cada tarea tiene una prioridad obligatoria
  (Normal/Media/Alta, elegida con un `<input type="range">` de 3
  posiciones coloreado verde/naranja/rojo) y una fecha de ejecución
  obligatoria. Se muestran la fecha de creación y de vencimiento en cada
  tarjeta de tarea.
- **Calendario de vencimientos**: [TaskCalendar.tsx](src/components/TaskCalendar.tsx)
  pinta por defecto los días con tareas pendientes, con un punto del
  color de la prioridad más alta ese día. Al hacer clic en un día, filtra
  la lista de abajo a solo esas tareas.
- **Home pública**: `/` ya no es directo el login — es una landing que
  explica la app ([Home.tsx](src/pages/Home.tsx)). Las tareas se
  movieron a `/tareas` (protegida).
- **Header fijo y layout de escritorio**: [AppHeader.tsx](src/components/AppHeader.tsx)
  queda fijo arriba en toda la app (Home, Login, Register, Tareas), con
  acceso a Inicio y a "Iniciar sesión"/"Mis tareas" + "Cerrar sesión"
  según haya o no sesión — así se puede pasar de Tareas a Home sin
  cerrar sesión. En escritorio (≥1024px) el contenido usa el 90% del
  ancho y, en `/tareas`, se divide en dos paneles: uno a la izquierda
  (1/3) con el formulario de crear tarea y el calendario, y otro a la
  derecha (2/3) con los filtros y la lista.

No implementado: drag & drop para reordenar tareas.

⚠️ Si se clona este repo en un proyecto de Firebase nuevo (o se quiere
reflejar este cambio en uno ya existente), hay que volver a publicar
[firestore.rules](firestore.rules) en la consola de Firebase: ahora
`priority` y `dueDate` son campos obligatorios también en las reglas de
seguridad, no solo en el formulario.
