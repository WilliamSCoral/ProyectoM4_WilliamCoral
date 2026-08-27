import type { User, UserCredential } from "firebase/auth";

// Hito 3 — Tipos del dominio de autenticación.
// Se reexporta `User` de Firebase como `AppUser` para que el resto de las
// capas (hooks, pages) dependan de un alias propio del dominio y no
// importen directamente el tipo de la librería en todos lados.
export type AppUser = User;

// El contexto expone tanto el estado de sesión (user, loading) como las
// acciones para modificarlo. Esto sigue el patrón "Authenticator": ningún
// componente fuera de este contexto debe llamar a Firebase Auth
// directamente, todo pasa por las funciones que expone `useAuth()`.
export interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  // Si el último intento de login con Google (redirect de ida y vuelta a
  // Google) terminó en error, el mensaje ya traducido queda acá — la
  // página que inició el login se recargó por completo y no puede
  // atraparlo con su propio try/catch.
  googleRedirectError: string | null;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  // `signInWithRedirect` no devuelve las credenciales: solo navega a
  // Google. El resultado real llega después, cuando la app se vuelve a
  // montar y `Authenticator` lo resuelve (ver `googleRedirectError` y
  // `onAuthStateChanged`).
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}
