import { Timestamp } from "firebase/firestore";
import { getHighestPriority, getMonthGrid, getTasksDueOn } from "../../src/utils/calendar";
import type { Task } from "../../src/types/task";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "id",
    title: "Tarea",
    description: "",
    completed: false,
    priority: "normal",
    dueDate: Timestamp.now(),
    userId: "user-1",
    createdAt: Timestamp.now(),
    ...overrides,
  };
}

describe("getMonthGrid", () => {
  it("cada semana tiene 7 días (incluyendo huecos)", () => {
    const weeks = getMonthGrid(2026, 7); // agosto 2026 (0-indexado)
    weeks.forEach((week) => expect(week).toHaveLength(7));
  });

  it("incluye todos los días del mes exactamente una vez", () => {
    const weeks = getMonthGrid(2026, 1); // febrero 2026 (no bisiesto: 28 días)
    const days = weeks.flat().filter((day): day is Date => day !== null);
    expect(days).toHaveLength(28);
    expect(days[0].getDate()).toBe(1);
    expect(days[days.length - 1].getDate()).toBe(28);
  });

  it("respeta año bisiesto (2028 tiene 29 de febrero)", () => {
    const weeks = getMonthGrid(2028, 1);
    const days = weeks.flat().filter((day): day is Date => day !== null);
    expect(days).toHaveLength(29);
  });
});

describe("getTasksDueOn", () => {
  // Caso borde explícito: ningún vencimiento ese día.
  it("devuelve un array vacío si no hay tareas ese día", () => {
    const day = new Date(2026, 7, 27);
    const otherDay = new Date(2026, 7, 28);
    const tasks = [makeTask({ dueDate: Timestamp.fromDate(otherDay) })];
    expect(getTasksDueOn(tasks, day)).toEqual([]);
  });

  it("devuelve las tareas que vencen ese día, ignorando la hora", () => {
    const day = new Date(2026, 7, 27);
    const sameDayDifferentHour = new Date(2026, 7, 27, 22, 0);
    const tasks = [
      makeTask({ id: "1", dueDate: Timestamp.fromDate(sameDayDifferentHour) }),
      makeTask({ id: "2", dueDate: Timestamp.fromDate(new Date(2026, 7, 28)) }),
    ];
    expect(getTasksDueOn(tasks, day).map((t) => t.id)).toEqual(["1"]);
  });
});

describe("getHighestPriority", () => {
  it("devuelve null si no hay tareas", () => {
    expect(getHighestPriority([])).toBeNull();
  });

  it("devuelve la prioridad más alta entre varias tareas", () => {
    const tasks = [
      makeTask({ priority: "normal" }),
      makeTask({ priority: "alta" }),
      makeTask({ priority: "media" }),
    ];
    expect(getHighestPriority(tasks)).toBe("alta");
  });
});
