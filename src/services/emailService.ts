// Hito 7 — Única capa que el frontend usa para pedir el envío de un
// email. Nunca llama a AWS directamente: hace un fetch a la Serverless
// Function (patrón BFF), que es la que de verdad habla con SES.
export interface SendSummaryEmailResult {
  ok: boolean;
  message?: string;
}

export async function sendTasksSummaryEmail(
  to: string,
  summary: string,
): Promise<SendSummaryEmailResult> {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, summary }),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    return {
      ok: false,
      message: data.message ?? "No se pudo enviar el email.",
    };
  }

  return { ok: true };
}
