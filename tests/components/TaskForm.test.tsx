import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskForm } from "../../src/components/TaskForm";
import { todayDateInputValue } from "../../src/utils/date";

// Hito 8 — TaskForm no importa Firebase ni ningún servicio: recibe
// `onSubmit` por props. Estos tests verifican comportamiento observable
// (lo que ve y puede hacer quien usa el formulario), no implementación.
describe("TaskForm", () => {
  it("muestra un error y no llama a onSubmit si el título está vacío", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm submitLabel="Agregar tarea" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El título es obligatorio.",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // Caso borde: la fecha de ejecución es obligatoria, igual que el título.
  it("muestra un error y no llama a onSubmit si se borra la fecha de ejecución", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm submitLabel="Agregar tarea" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Título"), "Tarea sin fecha");
    await user.clear(screen.getByLabelText("Fecha de ejecución"));
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La fecha de ejecución es obligatoria.",
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("llama a onSubmit con los valores recortados, la fecha de hoy y prioridad normal por defecto", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm submitLabel="Agregar tarea" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Título"), "  Comprar pan  ");
    await user.type(screen.getByLabelText("Descripción"), "  para el desayuno  ");
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: "Comprar pan",
        description: "para el desayuno",
        priority: "normal",
        dueDate: todayDateInputValue(),
      }),
    );

    // Modo creación: el formulario se limpia solo después de guardar.
    await waitFor(() =>
      expect(screen.getByLabelText("Título")).toHaveValue(""),
    );
  });

  it("mueve el deslizador de prioridad y lo manda en el payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm submitLabel="Agregar tarea" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Título"), "Tarea urgente");
    // jsdom no simula el paso de las flechas de teclado sobre un
    // <input type="range">, así que se cambia el valor directamente
    // (equivalente a arrastrar el slider hasta el final).
    fireEvent.change(screen.getByRole("slider"), { target: { value: "2" } });
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ priority: "alta" }),
      ),
    );
  });

  it("toca el botón de prioridad 'Alta' y lo manda en el payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TaskForm submitLabel="Agregar tarea" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Título"), "Tarea urgente");
    await user.click(screen.getByRole("button", { name: "Alta" }));
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ priority: "alta" }),
      ),
    );
  });

  it("no limpia el formulario al guardar en modo edición", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskForm
        submitLabel="Guardar cambios"
        initialValues={{
          title: "Tarea existente",
          description: "",
          priority: "media",
          dueDate: todayDateInputValue(),
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(screen.getByLabelText("Título")).toHaveValue("Tarea existente");
  });

  // Caso borde: falla el guardado (por ejemplo, un error de Firestore).
  it("muestra un mensaje de error si onSubmit rechaza", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("network error"));

    render(<TaskForm submitLabel="Agregar tarea" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Título"), "Tarea con error");
    await user.click(screen.getByRole("button", { name: "Agregar tarea" }));

    expect(
      await screen.findByText("No se pudo guardar la tarea. Intentá de nuevo."),
    ).toBeInTheDocument();
  });

  it("llama a onCancel al hacer clic en Cancelar", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <TaskForm
        submitLabel="Guardar cambios"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
