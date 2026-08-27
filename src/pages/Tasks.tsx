import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import {
  createTask,
  deleteTask,
  toggleTaskCompleted,
  updateTask,
} from "../services/taskService";
import { isSameDay } from "../utils/date";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { TaskFilters, type PriorityFilter, type StatusFilter } from "../components/TaskFilters";
import { TaskCalendar } from "../components/TaskCalendar";
import { EmailSummaryButton } from "../components/EmailSummaryButton";
import type { Task, TaskFormValues } from "../types/task";

// Hito 6 — Reemplaza el placeholder del Hito 4: ahora esta ruta
// protegida muestra el CRUD real de tareas del usuario autenticado.
export function Tasks() {
  const { user, logout } = useAuth();
  const { tasks, loading, error } = useTasks();
  const [actionError, setActionError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("todas");
  const [search, setSearch] = useState("");
  // Extra credit — Día elegido en el calendario. El calendario en sí
  // siempre pinta TODAS las tareas (sin filtrar), pero elegir un día acá
  // se combina con los demás filtros para la lista de abajo.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter === "pendientes" && task.completed) return false;
      if (statusFilter === "completadas" && !task.completed) return false;
      if (priorityFilter !== "todas" && (task.priority ?? "normal") !== priorityFilter) {
        return false;
      }
      if (search.trim() && !task.title.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      if (selectedDate && (!task.dueDate || !isSameDay(task.dueDate.toDate(), selectedDate))) {
        return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, search, selectedDate]);

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
          {user?.email && <EmailSummaryButton userEmail={user.email} tasks={tasks} />}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => logout()}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <TaskForm submitLabel="Agregar tarea" onSubmit={handleCreate} />

      <TaskCalendar tasks={tasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {selectedDate && (
        <p className="task-filters__selected-date">
          Mostrando tareas del {selectedDate.toLocaleDateString("es-AR")}.{" "}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedDate(null)}>
            Quitar filtro de fecha
          </button>
        </p>
      )}

      <TaskFilters
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        search={search}
        onSearchChange={setSearch}
      />

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
          tasks={filteredTasks}
          onToggle={handleToggle}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
