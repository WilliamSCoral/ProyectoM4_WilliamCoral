import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { subscribeToUserTasks } from "../services/taskService";
import type { Task } from "../types/task";

// Hito 6 — Encapsula la suscripción en tiempo real a las tareas del
// usuario logueado. Vive en hooks/ (no en features/tasks/) porque, a
// diferencia de la sesión, la lista de tareas la consume una única
// pantalla (Tasks) y no necesita compartirse vía Context.
export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserTasks(
      user.uid,
      (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
      },
      (firestoreError) => {
        console.error("Error al escuchar las tareas:", firestoreError);
        setError("No se pudieron cargar las tareas. Intentá de nuevo.");
        setLoading(false);
      },
    );

    // Cancela la suscripción al desmontar o al cambiar de usuario, para
    // no dejar un listener de Firestore escuchando de más (memory leak)
    // ni mezclar tareas de una sesión anterior con la nueva. Se usa
    // `user.uid` (no `user`) como dependencia: el objeto `User` de
    // Firebase puede recibir una referencia nueva en algunas
    // actualizaciones internas sin que el uid cambie, y no queremos
    // resuscribirnos sin necesidad.
    return unsubscribe;
  }, [user?.uid]);

  return { tasks, loading, error };
}
