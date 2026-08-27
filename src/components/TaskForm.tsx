import { useId, useState, type FormEvent } from "react";
import { validateTaskTitle } from "../utils/validators";
import type { TaskFormValues } from "../types/task";

interface TaskFormProps {
  // Si viene con valores iniciales, el formulario opera en modo edición
  // (y no se limpia solo al guardar). Sin ellos, es el formulario de
  // creación.
  initialValues?: TaskFormValues;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel?: () => void;
  // Permite que quien lo use (Tasks para crear, TaskItem para editar)
  // aplique un estilo distinto sin duplicar el componente.
  className?: string;
}

// Hito 6 — Un mismo componente controlado sirve tanto para crear como
// para editar una tarea (Tasks lo usa para crear; TaskItem lo reutiliza
// para editar), evitando duplicar el formulario y su validación.
export function TaskForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  className = "",
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // `useId` evita ids duplicados en el DOM cuando hay varias instancias
  // de este formulario montadas a la vez (el de creación + el de
  // edición de una tarea puntual).
  const titleId = useId();
  const descriptionId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleError = validateTaskTitle(title);
    if (titleError) {
      setFormError(titleError);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
      if (!initialValues) {
        // Solo se limpia en modo creación: en edición, si el usuario
        // vuelve a abrir el formulario, espera ver los valores actuales.
        setTitle("");
        setDescription("");
      }
    } catch {
      setFormError("No se pudo guardar la tarea. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`task-form ${className}`}>
      <div className="field">
        <label htmlFor={titleId}>Título</label>
        <input
          id={titleId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(formError)}
          aria-describedby={formError ? `${titleId}-error` : undefined}
          disabled={submitting}
        />
      </div>

      <div className="field">
        <label htmlFor={descriptionId}>Descripción</label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={submitting}
        />
      </div>

      {formError && (
        <p id={`${titleId}-error`} className="alert alert-error" role="alert">
          {formError}
        </p>
      )}

      <div className="task-form__actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Guardando..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
