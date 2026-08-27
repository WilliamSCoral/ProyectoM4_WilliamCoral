import { useState } from "react";
import { TaskForm } from "./TaskForm";
import { formatDate, timestampToDateInputValue, todayDateInputValue } from "../utils/date";
import type { Task, TaskFormValues, TaskPriority } from "../types/task";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onSave: (values: TaskFormValues) => Promise<void>;
  onDelete: () => Promise<void>;
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  normal: "Normal",
  media: "Media",
  alta: "Alta",
};

export function TaskItem({ task, onToggle, onSave, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
      // No hace falta setDeleting(false) en el caso de éxito: el propio
      // onSnapshot va a quitar esta tarea de la lista y este componente
      // se desmonta.
    } catch {
      setDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <li className="task-item">
        <TaskForm
          className="task-form--edit"
          initialValues={{
            title: task.title,
            description: task.description,
            // Fallback para tareas creadas antes de agregar estos
            // campos: no deberían romper la edición.
            priority: task.priority ?? "normal",
            dueDate: task.dueDate
              ? timestampToDateInputValue(task.dueDate)
              : todayDateInputValue(),
          }}
          submitLabel="Guardar cambios"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (values) => {
            await onSave(values);
            setIsEditing(false);
          }}
        />
      </li>
    );
  }

  const priority = task.priority ?? "normal";

  return (
    <li className={`task-item ${task.completed ? "task-item--completed" : ""}`}>
      <div className="task-item__row">
        <input
          type="checkbox"
          className="task-item__checkbox"
          checked={task.completed}
          onChange={onToggle}
          aria-label={`Marcar "${task.title}" como ${task.completed ? "pendiente" : "completada"}`}
        />
        <span
          className={`task-item__title ${task.completed ? "task-item__title--completed" : ""}`}
        >
          {task.title}
        </span>
        <span className={`priority-tag priority-tag--${priority}`}>
          {PRIORITY_LABELS[priority]}
        </span>
      </div>
      {task.description && (
        <p className="task-item__description">{task.description}</p>
      )}
      <p className="task-item__meta">
        {/* `createdAt` usa serverTimestamp(): en el primer snapshot
            optimista (antes de que el servidor confirme la escritura)
            Firestore lo entrega como `null`, no como el Timestamp real. */}
        {task.createdAt ? `Creada el ${formatDate(task.createdAt)}` : "Guardando..."}
        {task.dueDate && <> · Vence el {formatDate(task.dueDate)}</>}
      </p>
      <div className="task-item__actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
          Editar
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </li>
  );
}
