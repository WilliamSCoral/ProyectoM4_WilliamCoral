import { useState } from "react";
import { sendTasksSummaryEmail } from "../services/emailService";
import { buildTasksSummary } from "../utils/taskSummary";
import type { Task } from "../types/task";

interface EmailSummaryButtonProps {
  userEmail: string;
  tasks: Task[];
}

type SendStatus = "idle" | "loading" | "success" | "error";

// Hito 7 — Botón "Enviar resumen por email". El estado idle/loading/
// success/error se maneja acá porque es puramente de presentación; el
// envío real queda delegado a emailService (que a su vez llama a la
// Vercel Function, no a AWS).
export function EmailSummaryButton({ userEmail, tasks }: EmailSummaryButtonProps) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSend() {
    setStatus("loading");
    setErrorMessage("");

    const summary = buildTasksSummary(tasks);
    const result = await sendTasksSummaryEmail(userEmail, summary);

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.message ?? "No se pudo enviar el email.");
      return;
    }

    setStatus("success");
  }

  return (
    <div className="email-summary">
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={handleSend}
        disabled={status === "loading" || tasks.length === 0}
      >
        {status === "loading" ? "Enviando..." : "Enviar resumen por email"}
      </button>

      {status === "success" && (
        <p className="alert alert-info" role="status">
          Resumen enviado a {userEmail}.
        </p>
      )}
      {status === "error" && (
        <p className="alert alert-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
