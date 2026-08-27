import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timestamp } from "firebase/firestore";
import { EmailSummaryButton } from "../../src/components/EmailSummaryButton";
import { sendTasksSummaryEmail } from "../../src/services/emailService";
import type { Task } from "../../src/types/task";

// Hito 8 — emailService.sendTasksSummaryEmail hace un fetch real a
// /api/send-email (que a su vez habla con AWS SES). Se mockea acá para
// que el test no dependa de red, de Vercel Functions ni de credenciales:
// solo se verifica cómo reacciona la UI a lo que el servicio devuelve.
vi.mock("../../src/services/emailService", () => ({
  sendTasksSummaryEmail: vi.fn(),
}));

const mockedSendTasksSummaryEmail = vi.mocked(sendTasksSummaryEmail);

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

describe("EmailSummaryButton", () => {
  beforeEach(() => {
    mockedSendTasksSummaryEmail.mockReset();
  });

  // Caso borde explícito: no hay tareas para resumir.
  it("está deshabilitado cuando no hay tareas", () => {
    render(<EmailSummaryButton userEmail="user@ejemplo.com" tasks={[]} />);

    expect(
      screen.getByRole("button", { name: "Enviar resumen por email" }),
    ).toBeDisabled();
  });

  it("muestra la confirmación cuando el envío es exitoso", async () => {
    const user = userEvent.setup();
    mockedSendTasksSummaryEmail.mockResolvedValue({ ok: true });

    render(
      <EmailSummaryButton
        userEmail="user@ejemplo.com"
        tasks={[makeTask({ title: "Una tarea" })]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Enviar resumen por email" }),
    );

    expect(
      await screen.findByText("Resumen enviado a user@ejemplo.com."),
    ).toBeInTheDocument();
    expect(mockedSendTasksSummaryEmail).toHaveBeenCalledWith(
      "user@ejemplo.com",
      expect.stringContaining("Una tarea"),
    );
  });

  // Caso borde explícito: error devuelto por la función serverless (SES
  // rechaza el envío, por ejemplo por un email no verificado en sandbox).
  it("muestra el mensaje de error cuando la función serverless rechaza el envío", async () => {
    const user = userEvent.setup();
    mockedSendTasksSummaryEmail.mockResolvedValue({
      ok: false,
      message: "Email address is not verified.",
    });

    render(
      <EmailSummaryButton
        userEmail="user@ejemplo.com"
        tasks={[makeTask({ title: "Una tarea" })]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Enviar resumen por email" }),
    );

    expect(
      await screen.findByText("Email address is not verified."),
    ).toBeInTheDocument();
  });
});
