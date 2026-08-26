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
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}
