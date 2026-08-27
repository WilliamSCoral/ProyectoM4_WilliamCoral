import { TASK_PRIORITIES, type TaskPriority } from "../types/task";

export type StatusFilter = "todas" | "pendientes" | "completadas";
export type PriorityFilter = "todas" | TaskPriority;

interface TaskFiltersProps {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  priority: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendientes", label: "Pendientes" },
  { value: "completadas", label: "Completadas" },
];

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  normal: "Normal",
  media: "Media",
  alta: "Alta",
};

// Extra credit — Filtros de la lista de tareas: por estado, por
// prioridad y por texto en el título. Es un componente puramente
// controlado (recibe el valor actual y notifica los cambios por
// props), igual que TaskForm: quien mantiene el estado real es Tasks.tsx.
export function TaskFilters({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  search,
  onSearchChange,
}: TaskFiltersProps) {
  return (
    <div className="task-filters">
      <div className="task-filters__status" role="group" aria-label="Filtrar por estado">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn btn-sm ${status === option.value ? "btn-primary" : "btn-outline"}`}
            onClick={() => onStatusChange(option.value)}
            aria-pressed={status === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="task-filters__row">
        <input
          type="search"
          className="task-filters__search"
          placeholder="Buscar por título..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Buscar tareas por título"
        />

        <select
          className="task-filters__priority"
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value as PriorityFilter)}
          aria-label="Filtrar por prioridad"
        >
          <option value="todas">Toda prioridad</option>
          {TASK_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
