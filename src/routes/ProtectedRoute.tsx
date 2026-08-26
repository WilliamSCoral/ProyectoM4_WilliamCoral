import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Hito 4 — Decide si el usuario puede ver una ruta privada o debe ser
// redirigido a /login. Se guarda la ubicación actual en `state.from` para
// que, después de loguearse, Login pueda devolver al usuario a la página
// que realmente quería ver (en vez de mandarlo siempre a "/").
//
// Mientras `loading` es true todavía no sabemos si hay sesión: mostrar un
// estado neutral acá evita el parpadeo "redirige a /login y después
// vuelve a /" que ocurriría si asumiéramos "no autenticado" antes de
// tiempo (el mismo problema que loading resuelve en el Hito 3).
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Cargando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
