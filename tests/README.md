# tests/

Tests unitarios y de componentes con Vitest + React Testing Library.
La estructura espeja la de `src/`:

```
tests/
├─ utils/       # Funciones puras (validators, taskSummary)
├─ features/    # authErrors (traducción de códigos de Firebase)
├─ components/  # TaskForm, TaskList, EmailSummaryButton
└─ pages/       # Login
```

Principio guía (Hito 8): los tests verifican **comportamiento observable**
(lo que ve y puede hacer quien usa la app), no detalles internos. Se
mockean los límites donde el proyecto ya aislaba los servicios externos
en hitos anteriores — `services/emailService` y `hooks/useAuth` — nunca
Firebase directamente, así los tests no dependen de red ni de
credenciales reales.

Casos borde cubiertos explícitamente: lista de tareas vacía
(`TaskList`, `taskSummary`, `EmailSummaryButton` deshabilitado), y error
de la función serverless de email (`EmailSummaryButton`) y de
autenticación (`Login`, credenciales inválidas).
