import { AppRoutes } from "./routes/AppRoutes";
import { ThemeToggle } from "./components/ThemeToggle";

// Hito 4 — App ya no gestiona el toggle Login/Register a mano (eso era
// un parche temporal del Hito 3): ahora la navegación la resuelve
// AppRoutes con React Router.
function App() {
  return (
    <main className="app-shell">
      <ThemeToggle />
      <AppRoutes />
    </main>
  );
}

export default App;
