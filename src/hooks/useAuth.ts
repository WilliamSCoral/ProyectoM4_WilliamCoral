import { useContext } from "react";
import { AuthContext } from "../features/auth/Authenticator";
import type { AuthContextValue } from "../types/auth";

// Hito 3 — Hook de conveniencia para consumir el estado y las acciones de
// sesión desde cualquier componente, sin repetir `useContext(AuthContext)`
// ni el chequeo de `undefined` en cada lugar donde se necesite.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un <Authenticator>.");
  }
  return context;
}
