import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Hito 4 — Complemento de ProtectedRoute: evita que una persona ya
// logueada vea los formularios de Login/Register. Sin esto, un usuario
// autenticado podría navegar manualmente a /login y quedar en un estado
// confuso (con sesión activa, pero mirando un formulario de acceso).
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="state-message">Cargando sesión...</p>;
  }

  if (user) {
    return <Navigate to="/tareas" replace />;
  }

  return <>{children}</>;
}
