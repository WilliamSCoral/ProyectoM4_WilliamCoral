import type { Timestamp } from "firebase/firestore";

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
  userId: string;
  createdAt: Timestamp;
}

// Lo que el usuario completa en el formulario de creación/edición, antes
// de que el código le agregue `userId`/`completed` y Firestore le
// agregue `id`/`createdAt`.
export interface TaskFormValues {
  title: string;
  description: string;
}
