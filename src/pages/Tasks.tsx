import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import {
  createTask,
  deleteTask,
  toggleTaskCompleted,
  updateTask,
} from "../services/taskService";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import type { Task, TaskFormValues } from "../types/task";

// Hito 6 — Reemplaza el placeholder del Hito 4: ahora esta ruta
// protegida muestra el CRUD real de tareas del usuario autenticado.
export function Tasks() {
  const { user, logout } = useAuth();
  const { tasks, loading, error } = useTasks();
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreate(values: TaskFormValues) {
    if (!user) return;
    await createTask(user.uid, values);
  }

  async function handleSave(task: Task, values: TaskFormValues) {
    await updateTask(task.id, values);
  }

  async function handleToggle(task: Task) {
    try {
      await toggleTaskCompleted(task.id, !task.completed);
    } catch {
      setActionError("No se pudo actualizar la tarea. Intentá de nuevo.");
    }
  }

  async function handleDelete(task: Task) {
    try {
      await deleteTask(task.id);
    } catch {
      setActionError("No se pudo eliminar la tarea. Intentá de nuevo.");
      throw new Error("delete-failed");
    }
  }

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <h1>Gestor Estratégico de Tareas</h1>
          <p className="tasks-header__user">Sesión iniciada como {user?.email}.</p>
        </div>
        <div className="tasks-header__actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => logout()}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <TaskForm submitLabel="Agregar tarea" onSubmit={handleCreate} />

      {actionError && (
        <p className="alert alert-error" role="alert">
          {actionError}
        </p>
      )}
      {loading && <p className="state-message">Cargando tareas...</p>}
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && (
        <TaskList
          tasks={tasks}
          onToggle={handleToggle}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
