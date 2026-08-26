import { useAuth } from "../hooks/useAuth";

// Hito 4 — Placeholder de la vista protegida. Confirma que ProtectedRoute
// funciona; el CRUD real de tareas se implementa en el Hito 6.
export function Tasks() {
  const { user, logout } = useAuth();

  return (
    <section>
      <h1>Gestor Estratégico de Tareas</h1>
      <p>Sesión iniciada como {user?.email}.</p>
      <p>
        Esta ruta ("/") está protegida: sin sesión activa, React Router
        redirige automáticamente a /login. La gestión de tareas (crear,
        listar, editar, eliminar, completar) se implementa en el Hito 6.
      </p>
      <button type="button" onClick={() => logout()}>
        Cerrar sesión
      </button>
    </section>
  );
}
