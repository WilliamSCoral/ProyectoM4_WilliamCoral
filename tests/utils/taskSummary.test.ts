import { buildTasksSummary } from "../../src/utils/taskSummary";
import type { Task } from "../../src/types/task";

// `createdAt` no lo usa buildTasksSummary, así que un valor cualquiera
// alcanza para completar el tipo en los fixtures de este archivo.
function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "id",
    title: "Tarea",
    description: "",
    completed: false,
    priority: "normal",
    dueDate: {} as Task["dueDate"],
    userId: "user-1",
    createdAt: {} as Task["createdAt"],
    ...overrides,
  };
}

describe("buildTasksSummary", () => {
  // Caso borde explícito: lista de tareas vacía.
  it("arma un resumen en cero cuando no hay tareas", () => {
    const summary = buildTasksSummary([]);
    expect(summary).toContain(
      "Tenés 0 tarea(s) en total: 0 pendiente(s) y 0 completada(s).",
    );
    expect(summary).not.toContain("Pendientes:");
    expect(summary).not.toContain("Completadas:");
  });

  it("separa correctamente pendientes y completadas", () => {
    const tasks = [
      makeTask({ id: "1", title: "Pendiente A", completed: false }),
      makeTask({ id: "2", title: "Completada A", completed: true }),
      makeTask({ id: "3", title: "Pendiente B", completed: false }),
    ];

    const summary = buildTasksSummary(tasks);

    expect(summary).toContain(
      "Tenés 3 tarea(s) en total: 2 pendiente(s) y 1 completada(s).",
    );
    expect(summary).toContain("Pendientes:\n- Pendiente A\n- Pendiente B");
    expect(summary).toContain("Completadas:\n- Completada A");
  });

  it("no incluye la sección de completadas si ninguna tarea lo está", () => {
    const tasks = [makeTask({ title: "Solo pendiente", completed: false })];
    const summary = buildTasksSummary(tasks);
    expect(summary).not.toContain("Completadas:");
  });
});
