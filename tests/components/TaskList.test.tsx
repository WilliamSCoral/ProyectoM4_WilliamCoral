import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timestamp } from "firebase/firestore";
import { TaskList } from "../../src/components/TaskList";
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

describe("TaskList", () => {
  // Caso borde explícito: lista de tareas vacía.
  it("muestra un mensaje cuando no hay tareas", () => {
    render(
      <TaskList
        tasks={[]}
        onToggle={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No tenés tareas todavía. Creá la primera arriba."),
    ).toBeInTheDocument();
  });

  it("renderiza una tarea por cada elemento de la lista", () => {
    const tasks = [
      makeTask({ id: "1", title: "Primera" }),
      makeTask({ id: "2", title: "Segunda" }),
    ];

    render(
      <TaskList
        tasks={tasks}
        onToggle={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Primera")).toBeInTheDocument();
    expect(screen.getByText("Segunda")).toBeInTheDocument();
  });

  it("llama a onToggle con la tarea correcta al tildar el checkbox", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const task = makeTask({ id: "1", title: "Tarea a completar" });

    render(
      <TaskList
        tasks={[task]}
        onToggle={onToggle}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith(task);
  });

  it("llama a onDelete con la tarea correcta al eliminar", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const task = makeTask({ id: "1", title: "Tarea a borrar" });

    render(
      <TaskList
        tasks={[task]}
        onToggle={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});
