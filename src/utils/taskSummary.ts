import type { Task } from "../types/task";

// Hito 7 — Arma el texto plano del email a partir de las tareas ya
// cargadas en el frontend. La Serverless Function no consulta Firestore
// por su cuenta: solo envía el texto que ya se armó acá.
export function buildTasksSummary(tasks: Task[]): string {
  const pending = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);

  const lines = [
    `Tenés ${tasks.length} tarea(s) en total: ${pending.length} pendiente(s) y ${completed.length} completada(s).`,
    "",
  ];

  if (pending.length > 0) {
    lines.push("Pendientes:");
    pending.forEach((task) => lines.push(`- ${task.title}`));
    lines.push("");
  }

  if (completed.length > 0) {
    lines.push("Completadas:");
    completed.forEach((task) => lines.push(`- ${task.title}`));
  }

  return lines.join("\n");
}
