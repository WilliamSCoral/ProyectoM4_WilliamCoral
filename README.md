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
functions/       # Vercel Functions (envío de emails vía AWS SES)
tests/           # Tests unitarios y de componentes
```

**Principio guía:** separar la lógica de negocio de los componentes de UI.
Los componentes describen *qué* se muestra; los hooks y servicios se
encargan de *cómo* se obtienen y actualizan los datos. Cada carpeta
contiene un `README.md` explicando su responsabilidad (se irán
reemplazando por código a medida que avancen los hitos).

**Hito 3 — Autenticación (Authenticator):** toda la lógica de sesión vive en
un único Context (`features/auth/Authenticator.tsx`) que expone estado
(`user`, `loading`) y acciones (`signUp`, `signIn`, `signInWithGoogle`,
`logout`) a través del hook `hooks/useAuth.ts`. Ningún componente llama a
Firebase Auth directamente: las páginas de Login/Register consumen
`useAuth()`, y `services/authService.ts` es la única capa que importa
`firebase/auth`. Esto centraliza el estado de sesión en una sola fuente
de verdad y facilita mockear Firebase en los tests del Hito 8. La sesión
persiste al recargar gracias a `onAuthStateChanged` (un observer de
Firebase), y mientras se resuelve el estado inicial se muestra un loading
en vez de asumir "no autenticado" (evita parpadeos/redirecciones
prematuras, relevante para el Hito 4). Los errores de Firebase
(`auth/wrong-password`, `auth/email-already-in-use`, etc.) se traducen a
mensajes en español en `features/auth/authErrors.ts` en vez de mostrarse
como código interno.

**Hito 4 — Rutas protegidas:** `routes/ProtectedRoute.tsx` bloquea `/`
(la vista de tareas) sin sesión activa y redirige a `/login`, guardando la
ruta original en `location.state.from` para volver ahí después de
loguearse (patrón enseñado en la lecture de React Router). El
complemento `routes/PublicOnlyRoute.tsx` evita que un usuario ya logueado
vea los formularios de Login/Register. Cualquier URL desconocida cae en
el wildcard `*`, que redirige a `/` y de ahí pasa por la misma protección.
Igual que en el Hito 3, mientras `loading` es `true` se muestra un estado
neutral en vez de redirigir de forma prematura, evitando parpadeos.

**Hito 5 — Modelo de datos y seguridad:** Firestore es NoSQL orientado a
documentos, así que el diseño parte de la consulta que necesita la UI
("dame todas las tareas de este usuario, ordenadas por fecha de
creación") y no de relaciones entre tablas. Por eso `Task`
([types/task.ts](src/types/task.ts)) incluye `userId` como campo propio
de cada documento (no hay tabla de usuarios ni joins) y `createdAt` para
poder ordenar. El `id` no se guarda dentro del documento: lo genera
Firestore automáticamente y se recupera del snapshot al leer.

La protección real de esos datos vive en
[firestore.rules](firestore.rules), no en el código del frontend: las
reglas deniegan todo por defecto y solo permiten leer/crear/editar/borrar
una tarea si `request.auth.uid` coincide con el `userId` del documento
(ownership), además de validar que el documento tenga la forma esperada
(`hasValidShape`). Esto es necesario porque cualquier filtro que haga el
cliente (`where("userId", "==", uid)`) es solo una optimización de
consulta — sin reglas del lado del servidor, un usuario malicioso podría
saltarse ese filtro y leer tareas ajenas directamente.

Las reglas se publicaron en Firebase Console y se verificaron explícitamente
con el Simulador de reglas (Rules Playground) — la guía del curso pide
probar puntualmente si un usuario puede leer las tareas de otro:

- `create` autenticado como `userA` con `userId: "userA"` → autorizado.
- `create` autenticado como `userA` con `userId: "userB"` (a nombre de otro
  usuario) → rechazado.
- `get` autenticado como `userA` sobre una tarea con `userId: "userA"` →
  autorizado.
- `get` autenticado como `userB` sobre esa misma tarea de `userA` →
  **rechazado**. Esta es la prueba explícita de que un usuario no puede
  leer las tareas de otro.

**Hito 6 — CRUD de tareas:** [services/taskService.ts](src/services/taskService.ts)
es la única capa que llama a `firebase/firestore` para tareas — igual que
`authService.ts` en el Hito 3, ningún componente importa Firestore
directamente. La lectura usa `onSnapshot` en vez de una consulta única
(`getDocs`), así la UI se actualiza sola ante cualquier cambio (propio o
de otra pestaña) sin recargar la página. El hook
[hooks/useTasks.ts](src/hooks/useTasks.ts) encapsula esa suscripción con
sus estados de `loading`/`error` y cancela la suscripción (cleanup) al
desmontar o cambiar de usuario, para no dejar listeners de Firestore
abiertos de más. `TaskForm` es un único componente controlado reutilizado
tanto para crear como para editar (el modo lo determina si recibe
`initialValues`), evitando duplicar validación y lógica de submit.

⚠️ **Índice compuesto de Firestore:** la consulta combina
`where("userId", "==", uid)` con `orderBy("createdAt", "desc")`, algo que
Firestore no puede resolver sin un índice compuesto. La primera vez que
corre, tira un error `failed-precondition` con un link para crearlo desde
la consola de Firebase (tarda 1-2 minutos en construirse). Ya se creó
para este proyecto; si se clona en un proyecto de Firebase nuevo, hay que
crearlo de nuevo la primera vez.

_(Esta sección se ampliará con las decisiones tomadas en cada hito.)_

**Diseño e interfaz:** todos los colores viven en variables CSS
(`src/index.css`) definidas una sola vez en `:root` y redefinidas dentro
de `@media (prefers-color-scheme: dark)` — el modo oscuro/claro lo decide
el sistema operativo del usuario, sin necesidad de un toggle manual ni
de duplicar reglas de estilo. El layout sigue un enfoque mobile-first
real: cada bloque define primero cómo se ve en una pantalla chica (una
columna, botones de al menos 44px de alto para que sean fáciles de tocar)
y las `@media (min-width: ...)` van agregando o reordenando desde ahí
hacia arriba — nunca al revés. Los cortes son `768px` (tablet: el header
de Tareas pasa a fila, los contenedores se ensanchan) y `1024px`
(desktop: contenedores más anchos todavía). `TaskForm` es el mismo
componente para crear y editar, así que su estilo también se comparte
(con una variante `.task-form--edit` más discreta para el modo inline).
Además del modo automático, hay un interruptor manual
([ThemeToggle.tsx](src/components/ThemeToggle.tsx) +
[useTheme.ts](src/hooks/useTheme.ts)) que escribe `data-theme` en
`<html>` y gana por encima de la preferencia del sistema; la elección se
guarda en `localStorage` y un pequeño script inline en `index.html` la
aplica antes de que React monte, para que no haya parpadeo del tema
equivocado al recargar.

**Hito 7 — Email con AWS SES (patrón BFF):** el frontend nunca llama a
AWS directamente ni conoce ninguna credencial de AWS — solo hace un
`fetch` a `POST /api/send-email` con `{ to, summary }`.
[api/send-email.ts](api/send-email.ts) es la única pieza del proyecto
con acceso a las variables `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`
(sin prefijo `VITE_`, así jamás llegan al bundle del navegador) y es la
que arma el `SendEmailCommand` del AWS SDK v3 y habla con SES. Vive en
`api/` (no en `functions/`, como sugiere la estructura de la consigna)
porque esa es la convención real que usa Vercel para detectar
Serverless Functions sin configuración adicional: un archivo en
`api/send-email.ts` queda expuesto automáticamente en `/api/send-email`.
[services/emailService.ts](src/services/emailService.ts) es la única
capa del frontend que hace ese `fetch`; [EmailSummaryButton.tsx](src/components/EmailSummaryButton.tsx)
solo maneja los estados `idle`/`loading`/`success`/`error` del botón.

⚠️ **Requiere configuración externa en AWS** que no vive en el código:
un usuario IAM con permiso `ses:SendEmail`, y las identidades (remitente
y, mientras la cuenta esté en modo Sandbox, también el destinatario)
verificadas en la consola de SES, en la misma región que `AWS_REGION`.
Sin esto la función responde `MessageRejected` aunque el código esté
bien. Ver la sección de variables de entorno más abajo.

**Hito 8 — Testing:** 30 tests en 7 archivos (`npm run test`), ver
[tests/README.md](tests/README.md) para el detalle. La arquitectura por
capas de los hitos anteriores (servicios separados de componentes,
acciones pasadas por props en vez de importadas directamente) es lo que
hace posible mockear solo en los límites correctos —
`services/emailService` y `hooks/useAuth` — sin tocar Firebase para
nada: los componentes de tareas (`TaskForm`, `TaskList`) ni siquiera
necesitan mocks porque son puramente controlados por props.

**Hito 9 — Deploy en Vercel:** las 8 variables de entorno se cargaron
manualmente en el dashboard de Vercel (Settings → Environment Variables),
nunca por código ni por CLI con los valores reales de por medio. Las 4
`VITE_FIREBASE_*` se guardaron como tipo **Config** (no *Secret*): como
Vite las expone igual en el bundle público por su prefijo, marcarlas
como secretas no aporta nada — Vercel lo señala si se intenta. Las 4 de
AWS/SES sí quedaron como **Secret**. El deploy se hizo con
`vercel --prod` (el proyecto ya estaba vinculado desde que se usó
`vercel dev` en el Hito 7), sin necesidad de conectar el repo de GitHub.

Verificado con un envío real de punta a punta (`vercel dev` + AWS SES en
modo Sandbox): la función respondió `ok: true` con `messageId`, y el
email llegó a la bandeja real (en Spam la primera vez, esperable para un
remitente nuevo sin reputación — no es un bug). También se probó el
camino de error: un usuario con un email no verificado en SES recibe el
mensaje real de AWS (`MessageRejected`) mostrado en la UI, sin exponer
ningún detalle interno roto.

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
  `/api/send-email` (probado el camino de rechazo de SES; el de éxito ya
  se había probado en local con un email verificado).
- Diseño responsive en mobile (375px) y sin errores inesperados en la
  consola del navegador.

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

- Pedirle que se basara en el material de clase (lectures del curso)
  antes de implementar, en vez de aceptar la primera solución genérica
  que proponía — varias veces el patrón que enseñaba la clase era
  distinto (y más específico) de lo que la IA hubiera hecho por
  defecto.
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
