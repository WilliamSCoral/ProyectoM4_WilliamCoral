import { createContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import * as authService from "../../services/authService";
import type { AppUser, AuthContextValue } from "../../types/auth";

// Hito 3 — "Authenticator": Context + Provider que centraliza TODO lo
// relacionado a autenticación (estado de sesión y acciones). Ningún otro
// componente debe llamar a `services/authService` directamente: las
// pages consumen `useAuth()` y listo. Esto evita que la lógica de sesión
// quede duplicada o inconsistente entre distintas partes de la app.
//
// `onAuthStateChanged` es un Observer: Firebase lo llama automáticamente
// cada vez que cambia el estado de auth (login, logout, o al recargar la
// página y restaurar la sesión desde el storage local). Suscribirse acá,
// una sola vez, es lo que hace que la sesión persista al recargar sin
// tener que guardar/leer nada manualmente en localStorage.
//
// `loading` empieza en `true` porque, al montar la app, todavía no
// sabemos si hay una sesión previa restaurándose o no. Mientras sea
// `true`, el resto de la app (en el Hito 4, ProtectedRoute) debe esperar
// en vez de asumir "no autenticado" y redirigir de forma prematura.
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function Authenticator({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cancelar la suscripción al desmontar evita fugas de memoria y
    // llamadas a `setState` sobre un componente ya desmontado.
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signUp: authService.registerWithEmail,
    signIn: authService.loginWithEmail,
    signInWithGoogle: authService.loginWithGoogle,
    logout: authService.logout,
    changePassword: authService.changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
