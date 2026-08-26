import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

// Hito 3 — Reemplaza el checkpoint temporal del Hito 2.
// Todavía no existe React Router (eso es el Hito 4), así que la
// navegación entre Login/Register es un simple toggle de estado local.
// Una vez logueado, se muestra un placeholder: la vista real de tareas
// llega en el Hito 6.
function App() {
  const { user, loading, logout } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");

  // Mientras `loading` es true, Firebase todavía está restaurando (o no)
  // una sesión previa desde el storage local. Mostrar algo neutral acá
  // evita un parpadeo de "no autenticado" seguido de "autenticado" al
  // recargar la página.
  if (loading) {
    return (
      <main>
        <p>Cargando sesión...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        {authView === "login" ? (
          <Login onSwitchToRegister={() => setAuthView("register")} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView("login")} />
        )}
      </main>
    );
  }

  return (
    <main>
      <h1>Gestor Estratégico de Tareas</h1>
      <p>Sesión iniciada como {user.email}.</p>
      <p>
        La gestión de tareas se implementa en el Hito 6. Por ahora, esta
        vista solo confirma que la sesión persiste al recargar la página.
      </p>
      <button type="button" onClick={() => logout()}>
        Cerrar sesión
      </button>
    </main>
  );
}

export default App;
