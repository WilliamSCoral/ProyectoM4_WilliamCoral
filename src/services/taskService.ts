import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FirestoreError,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Task, TaskFormValues } from "../types/task";

// Hito 6 — Capa de servicio: encapsula todas las llamadas a Firestore
// para la colección `tasks`. Nadie fuera de este archivo importa
// `firebase/firestore` directamente para tareas, igual que
// `authService.ts` hace con `firebase/auth` en el Hito 3.
const tasksCollection = collection(db, "tasks");

// Se suscribe en tiempo real a las tareas del usuario autenticado.
// `onSnapshot` es un observer: se ejecuta una vez con el estado actual y
// de nuevo cada vez que algo cambia en Firestore (propio o de otra
// pestaña), lo que permite que la UI se actualice sola sin recargar. El
// filtro `where("userId", "==", userId)` es lo que hace que cada persona
// solo reciba SUS tareas — las Security Rules del Hito 5 son la defensa
// real, pero sin este filtro la propia regla `list` rechazaría toda la
// consulta (Firestore no puede evaluar "list" sin que el cliente ya
// filtre por el campo protegido).
//
// Devuelve la función de unsubscribe: quien llama es responsable de
// invocarla en el cleanup de su efecto para no dejar la suscripción
// escuchando después de desmontar el componente.
export function subscribeToUserTasks(
  userId: string,
  onTasksChange: (tasks: Task[]) => void,
  onError: (error: FirestoreError) => void,
) {
  const userTasksQuery = query(
    tasksCollection,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    userTasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map(
        (docSnapshot) =>
          ({ id: docSnapshot.id, ...docSnapshot.data() }) as Task,
      );
      onTasksChange(tasks);
    },
    onError,
  );
}

export function createTask(userId: string, values: TaskFormValues) {
  return addDoc(tasksCollection, {
    ...values,
    userId,
    completed: false,
    // Se calcula en el servidor de Firestore, no en el reloj del
    // cliente, para que el orden sea consistente sin importar la hora
    // configurada en el dispositivo de quien crea la tarea.
    createdAt: serverTimestamp(),
  });
}

export function updateTask(taskId: string, values: TaskFormValues) {
  return updateDoc(doc(db, "tasks", taskId), { ...values });
}

export function toggleTaskCompleted(taskId: string, completed: boolean) {
  return updateDoc(doc(db, "tasks", taskId), { completed });
}

export function deleteTask(taskId: string) {
  return deleteDoc(doc(db, "tasks", taskId));
}
