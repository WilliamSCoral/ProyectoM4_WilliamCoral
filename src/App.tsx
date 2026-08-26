import { AppRoutes } from "./routes/AppRoutes";

// Hito 4 — App ya no gestiona el toggle Login/Register a mano (eso era
// un parche temporal del Hito 3): ahora la navegación la resuelve
// AppRoutes con React Router.
function App() {
  return (
    <main>
      <AppRoutes />
    </main>
  );
}

export default App;
