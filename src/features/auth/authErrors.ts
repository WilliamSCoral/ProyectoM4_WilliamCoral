import { FirebaseError } from "firebase/app";

// Hito 3 — Firebase devuelve códigos internos (ej: "auth/wrong-password")
// que no tienen sentido para una persona usuaria final. Este mapa traduce
// los códigos más comunes a mensajes comprensibles en español. Si aparece
// un código no mapeado, se muestra un mensaje genérico en vez del código
// crudo, para no romper nunca la experiencia de usuario.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "El email ingresado no tiene un formato válido.",
  "auth/user-disabled": "Esta cuenta fue deshabilitada. Contactá al soporte.",
  "auth/user-not-found": "No existe una cuenta registrada con ese email.",
  "auth/wrong-password": "La contraseña ingresada es incorrecta.",
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta registrada con ese email.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests":
    "Demasiados intentos fallidos. Esperá unos minutos antes de volver a intentar.",
  "auth/network-request-failed":
    "Error de conexión. Revisá tu conexión a internet e intentá de nuevo.",
  "auth/popup-closed-by-user": "Se cerró la ventana de Google antes de completar el inicio de sesión.",
  "auth/popup-blocked":
    "El navegador bloqueó la ventana emergente de Google. Habilitá los pop-ups para este sitio e intentá de nuevo.",
  "auth/cancelled-popup-request": "Se canceló el inicio de sesión con Google.",
  "auth/operation-not-allowed":
    "Este método de acceso no está habilitado todavía. Contactá al administrador del proyecto.",
  "auth/account-exists-with-different-credential":
    "Ya existe una cuenta con ese email registrada con otro método de acceso.",
};

const DEFAULT_MESSAGE = "Ocurrió un error inesperado. Intentá de nuevo.";

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}
