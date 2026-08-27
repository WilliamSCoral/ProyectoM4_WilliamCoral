import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

// Extra credit — Header fijo y compartido por toda la app (Home, Login,
// Register, Tareas). Antes cada página armaba su propia navegación
// (Home tenía su nav, Tareas su header con logout); ahora vive acá para
// que "Inicio" y "Iniciar sesión"/"Cerrar sesión" estén siempre visibles
// sin importar en qué ruta se esté, y para poder moverse entre Home y
// Tareas sin cerrar sesión.
export function AppHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand">
        {/* En mobile no entra el nombre completo al lado de los botones
            de sesión sin que el header se vaya a dos líneas — se acorta
            acá y se muestra completo desde tablet (>=768px). */}
        <span className="app-header__brand-text app-header__brand-text--short">
          Gestor
        </span>
        <span className="app-header__brand-text app-header__brand-text--full">
          Gestor Estratégico de Tareas
        </span>
      </Link>
      <div className="app-header__actions">
        {!loading &&
          (user ? (
            <>
              <Link to="/tareas" className="btn btn-ghost btn-sm">
                Mis tareas
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => logout()}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Iniciar sesión
            </Link>
          ))}
        <ThemeToggle />
      </div>
    </header>
  );
}
