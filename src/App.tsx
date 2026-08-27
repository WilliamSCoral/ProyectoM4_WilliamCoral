import { AppRoutes } from "./routes/AppRoutes";
import { AppHeader } from "./components/AppHeader";

// Hito 4 — App ya no gestiona el toggle Login/Register a mano (eso era
// un parche temporal del Hito 3): ahora la navegación la resuelve
// AppRoutes con React Router.
function App() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
