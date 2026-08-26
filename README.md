# Gestor Estratégico de Tareas

Proyecto Integrador — Módulo 4 (Henry). SPA de gestión de tareas con
autenticación de usuarios, persistencia en la nube por usuario, envío de
notificaciones por email y deploy en producción.

> 🚧 Este README se completa progresivamente a medida que se avanza en los
> hitos del proyecto. Estado actual: **Hito 1 — Setup inicial**.

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
- [ ] Hito 2 — Configuración de Firebase
- [ ] Hito 3 — Autenticación
- [ ] Hito 4 — Rutas protegidas
- [ ] Hito 5 — Modelo de datos y seguridad (Firestore Rules)
- [ ] Hito 6 — CRUD de tareas
- [ ] Hito 7 — Email con AWS SES
- [ ] Hito 8 — Testing
- [ ] Hito 9 — Deploy en Vercel
