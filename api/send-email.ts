import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Hito 7 — Patrón BFF (Backend For Frontend). Esta función es la ÚNICA
// pieza del proyecto con permiso para hablar con AWS SES: las
// credenciales viven acá, en variables de entorno del servidor (sin
// prefijo VITE_, así que nunca llegan al bundle del navegador). El
// frontend solo sabe que existe un endpoint POST /api/send-email; no
// tiene forma de ver ni de usar estas claves directamente.
//
// Vive en `api/` (no en `functions/`, aunque la consigna lo sugiera así)
// porque esa es la convención real que usa Vercel para detectar
// Serverless Functions automáticamente: un archivo en `api/send-email.ts`
// queda expuesto como `/api/send-email` sin configuración adicional.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

interface SendEmailRequestBody {
  to?: string;
  summary?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method-not-allowed" });
  }

  const { to, summary } = (req.body ?? {}) as SendEmailRequestBody;

  if (!to || !summary) {
    return res.status(400).json({
      ok: false,
      error: "missing-fields",
      message: "Faltan los campos 'to' y/o 'summary'.",
    });
  }

  const source = process.env.SES_SOURCE_EMAIL;
  if (!source) {
    return res.status(500).json({
      ok: false,
      error: "server-misconfigured",
      message: "Falta configurar SES_SOURCE_EMAIL en el servidor.",
    });
  }

  try {
    const command = new SendEmailCommand({
      Source: source,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: "Resumen de tus tareas" },
        Body: { Text: { Data: summary } },
      },
    });

    const result = await sesClient.send(command);

    return res.status(200).json({ ok: true, messageId: result.MessageId });
  } catch (error) {
    // Nunca loguear las credenciales; sí el error, para poder depurar
    // desde los logs de Vercel sin exponer secretos.
    console.error("Error al enviar email con SES:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al enviar el email.";
    return res.status(500).json({ ok: false, error: "ses-send-failed", message });
  }
}
