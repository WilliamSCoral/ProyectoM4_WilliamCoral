import { useState } from "react";
import { getHighestPriority, getMonthGrid, getTasksDueOn } from "../utils/calendar";
import { isSameDay } from "../utils/date";
import type { Task } from "../types/task";

interface TaskCalendarProps {
  // Siempre recibe TODAS las tareas del usuario (sin los filtros de
  // TaskFilters aplicados): el calendario es el mapa completo de
  // vencimientos, independiente de lo que se esté filtrando en la lista.
  tasks: Task[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Extra credit — Calendario chico: pinta por defecto (sin que haya que
// activar nada) los días que tienen alguna tarea con vencimiento ese
// día, con un punto del color de la prioridad más alta entre esas
// tareas. Al hacer clic en un día, Tasks.tsx filtra la lista para
// mostrar solo lo que vence ahí.
export function TaskCalendar({ tasks, selectedDate, onSelectDate }: TaskCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const weeks = getMonthGrid(viewDate.getFullYear(), viewDate.getMonth());

  function goToPreviousMonth() {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function handleDayClick(day: Date) {
    if (selectedDate && isSameDay(selectedDate, day)) {
      onSelectDate(null);
    } else {
      onSelectDate(day);
    }
  }

  return (
    <div className="task-calendar">
      <div className="task-calendar__header">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={goToPreviousMonth}
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="task-calendar__title">
          {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={goToNextMonth}
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="task-calendar__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="task-calendar__grid">
        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            if (!day) {
              return (
                <span key={`${weekIndex}-${dayIndex}`} className="task-calendar__day task-calendar__day--empty" />
              );
            }

            const dueTasks = getTasksDueOn(tasks, day);
            const highestPriority = getHighestPriority(dueTasks);
            const isToday = isSameDay(day, today);
            const isSelected = Boolean(selectedDate && isSameDay(day, selectedDate));

            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                type="button"
                className={`task-calendar__day ${isToday ? "task-calendar__day--today" : ""} ${isSelected ? "task-calendar__day--selected" : ""}`}
                onClick={() => handleDayClick(day)}
                aria-pressed={isSelected}
                aria-label={`${day.getDate()} de ${MONTH_LABELS[day.getMonth()]}${dueTasks.length > 0 ? `, ${dueTasks.length} tarea(s)` : ""}`}
              >
                {day.getDate()}
                {highestPriority && (
                  <span className={`task-calendar__dot priority-tag--${highestPriority}`} />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
