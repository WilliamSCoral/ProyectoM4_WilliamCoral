// Hito 3 — Validaciones de formulario en el cliente. Se ejecutan ANTES de
// llamar a Firebase para dar feedback inmediato y evitar llamadas de red
// innecesarias con datos que ya sabemos inválidos.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "El email es obligatorio.";
  if (!EMAIL_REGEX.test(email)) return "El email ingresado no es válido.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "La contraseña es obligatoria.";
  // Firebase rechaza contraseñas de menos de 6 caracteres con
  // "auth/weak-password"; validar acá evita ese viaje de red.
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

// Hito 6 — La descripción es opcional, pero el título es lo único que
// realmente identifica a una tarea en la lista.
export function validateTaskTitle(title: string): string | null {
  if (!title.trim()) return "El título es obligatorio.";
  return null;
}

// Extra credit — La fecha de ejecución es obligatoria: sin ella la
// tarea no tendría sentido en el calendario.
export function validateDueDate(dueDate: string): string | null {
  if (!dueDate) return "La fecha de ejecución es obligatoria.";
  return null;
}
