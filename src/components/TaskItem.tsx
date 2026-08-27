import { useState } from "react";
import { TaskForm } from "./TaskForm";
import type { Task, TaskFormValues } from "../types/task";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onSave: (values: TaskFormValues) => Promise<void>;
  onDelete: () => Promise<void>;
}

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
      <li>
        <TaskForm
          initialValues={{ title: task.title, description: task.description }}
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

  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        aria-label={`Marcar "${task.title}" como ${task.completed ? "pendiente" : "completada"}`}
      />
      <span style={task.completed ? { textDecoration: "line-through" } : undefined}>
        {task.title}
      </span>
      {task.description && <p>{task.description}</p>}
      <button type="button" onClick={() => setIsEditing(true)}>
        Editar
      </button>
      <button type="button" onClick={handleDelete} disabled={deleting}>
        {deleting ? "Eliminando..." : "Eliminar"}
      </button>
    </li>
  );
}
