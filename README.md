# Gestor Estratégico de Tareas

Proyecto Integrador — Módulo 4 (Henry). SPA de gestión de tareas con
autenticación de usuarios, persistencia en la nube por usuario, envío de
notificaciones por email y deploy en producción.

> 🚧 Este README se completa progresivamente a medida que se avanza en los
> hitos del proyecto. Estado actual: **Hito 6 — CRUD de tareas**.

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
| `npm run dev` | Levanta el servidor de desarrollo de Vite |
| `npm run build` | Chequea tipos y genera el build de producción |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run typecheck` | Corre el compilador de TypeScript sin emitir archivos |
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

_(Se completa en el Hito 9 — Deploy en Vercel.)_

## Flujo de envío de emails

_(Se completa en el Hito 7 — Email con AWS SES.)_

## Uso de IA en el proyecto

_(Se completa progresivamente. Este proyecto se desarrolló con Claude como
asistente de desarrollo. Se documentará aquí qué prompts se utilizaron, en
qué situaciones fue más efectiva la asistencia de IA, y qué decisiones se
tomaron a partir de las respuestas generadas — evitando copiar código sin
comprenderlo.)_

## Estado del proyecto (hitos)

- [x] Hito 1 — Setup inicial
- [x] Hito 2 — Configuración de Firebase
- [x] Hito 3 — Autenticación
- [x] Hito 4 — Rutas protegidas
- [x] Hito 5 — Modelo de datos y seguridad (Firestore Rules)
- [x] Hito 6 — CRUD de tareas
- [ ] Hito 7 — Email con AWS SES
- [ ] Hito 8 — Testing
- [ ] Hito 9 — Deploy en Vercel
