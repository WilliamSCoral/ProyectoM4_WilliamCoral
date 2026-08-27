import { useId, useState, type FormEvent } from "react";
import { validateTaskTitle, validateDueDate } from "../utils/validators";
import { todayDateInputValue } from "../utils/date";
import { TASK_PRIORITIES, type TaskFormValues, type TaskPriority } from "../types/task";

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

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  normal: "Normal",
  media: "Media",
  alta: "Alta",
};

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
  const [priority, setPriority] = useState<TaskPriority>(
    initialValues?.priority ?? "normal",
  );
  // Extra credit — La fecha de ejecución es obligatoria. En modo
  // creación arranca en "hoy" (un valor de partida razonable) en vez de
  // vacía, para que quien crea la tarea solo tenga que tocarla si
  // realmente vence otro día.
  const [dueDate, setDueDate] = useState(
    initialValues?.dueDate ?? todayDateInputValue(),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // `useId` evita ids duplicados en el DOM cuando hay varias instancias
  // de este formulario montadas a la vez (el de creación + el de
  // edición de una tarea puntual).
  const titleId = useId();
  const descriptionId = useId();
  const priorityId = useId();
  const dueDateId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleError = validateTaskTitle(title);
    const dueDateError = validateDueDate(dueDate);
    if (titleError || dueDateError) {
      setFormError(titleError ?? dueDateError);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
      });
      if (!initialValues) {
        // Solo se limpia en modo creación: en edición, si el usuario
        // vuelve a abrir el formulario, espera ver los valores actuales.
        setTitle("");
        setDescription("");
        setPriority("normal");
        setDueDate(todayDateInputValue());
      }
    } catch {
      setFormError("No se pudo guardar la tarea. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const priorityIndex = TASK_PRIORITIES.indexOf(priority);

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

      <div className="field">
        <label htmlFor={dueDateId}>Fecha de ejecución</label>
        <input
          id={dueDateId}
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="field">
        <label htmlFor={priorityId}>Prioridad</label>
        <input
          id={priorityId}
          type="range"
          min={0}
          max={TASK_PRIORITIES.length - 1}
          step={1}
          value={priorityIndex}
          aria-valuetext={PRIORITY_LABELS[priority]}
          onChange={(event) =>
            setPriority(TASK_PRIORITIES[Number(event.target.value)])
          }
          className={`priority-slider priority-slider--${priority}`}
          disabled={submitting}
        />
        {/* Los 3 botones marcan a qué corresponde cada posición del
            deslizador y también sirven como atajo: tocar uno cambia la
            prioridad sin tener que arrastrar el thumb. */}
        <div className="priority-slider__ticks">
          {TASK_PRIORITIES.map((value) => (
            <button
              key={value}
              type="button"
              className={`priority-slider__tick priority-slider__tick--${value} ${
                value === priority ? "priority-slider__tick--active" : ""
              }`}
              aria-pressed={value === priority}
              onClick={() => setPriority(value)}
              disabled={submitting}
            >
              {PRIORITY_LABELS[value]}
            </button>
          ))}
        </div>
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
