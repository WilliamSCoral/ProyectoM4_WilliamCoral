import { TASK_PRIORITIES, type Task, type TaskPriority } from "../types/task";
import { isSameDay } from "./date";

// Extra credit — Devuelve una grilla de semanas (arrays de 7) para el
// mes indicado. Las celdas que no pertenecen al mes (relleno antes del
// día 1 o después del último día) son `null`, para que el componente
// solo tenga que decidir "¿renderizo un día o un hueco vacío?".
export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay(): 0 = domingo. La semana se muestra de lunes a domingo, así
  // que se corrige el offset para que lunes quede primero.
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (Date | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

// `dueDate` es obligatorio para las tareas nuevas, pero las que ya
// existían en Firestore antes de este cambio no lo tienen — filtrarlas
// acá evita que revienten el calendario en vez de simplemente no
// aparecer pintadas en ningún día.
export function getTasksDueOn(tasks: Task[], day: Date): Task[] {
  return tasks.filter((task) => task.dueDate && isSameDay(task.dueDate.toDate(), day));
}

// La prioridad "más alta" entre las tareas de un día es la que decide
// de qué color se pinta ese día en el calendario. Mismo motivo que
// arriba: las tareas viejas sin `priority` se tratan como "normal".
export function getHighestPriority(tasks: Task[]): TaskPriority | null {
  if (tasks.length === 0) return null;
  return tasks
    .map((task) => task.priority ?? "normal")
    .reduce((highest, current) =>
      TASK_PRIORITIES.indexOf(current) > TASK_PRIORITIES.indexOf(highest)
        ? current
        : highest,
    );
}
