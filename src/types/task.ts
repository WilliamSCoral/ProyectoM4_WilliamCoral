import type { Timestamp } from "firebase/firestore";

// Extra credit — Prioridad de la tarea. El orden del array importa: se
// usa tanto para el deslizador (posición 0/1/2) como para decidir cuál
// es "la más alta" cuando varias tareas vencen el mismo día (para
// pintar el calendario).
export const TASK_PRIORITIES = ["normal", "media", "alta"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

// Hito 5 — Modelo de datos "consulta primero" (Firestore es NoSQL: se
// diseña a partir de la consulta que necesita la UI, no de relaciones
// entre tablas). La consulta central de esta app es "dame todas las
// tareas de este usuario, ordenadas por fecha de creación". Eso exige
// que cada documento lleve su propio `userId` (no hay tabla de usuarios
// ni joins) y un `createdAt` para poder ordenar.
//
// `id` NO se guarda como campo dentro del documento: Firestore genera el
// Document ID solo, y se recupera del snapshot al leer (`doc.id`). Se
// incluye acá porque es el tipo que usa la UI una vez que el dato ya fue
// leído de Firestore, no el que se envía al crear.
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  // Fecha en la que la tarea debe cumplirse (obligatoria): es lo que
  // pinta el calendario. Distinta de `createdAt`, que es cuándo se creó
  // el registro.
  dueDate: Timestamp;
  userId: string;
  createdAt: Timestamp;
}

// Lo que el usuario completa en el formulario de creación/edición, antes
// de que el código le agregue `userId`/`completed` y Firestore le
// agregue `id`/`createdAt`. `dueDate` viaja como string "YYYY-MM-DD"
// (el formato nativo de `<input type="date">`) y se convierte a
// Timestamp recién en la capa de servicio.
export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}
