import { Navigate, Route, Routes } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Tasks } from "../pages/Tasks";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";

// Hito 4 (extra credit: Home pública) — "/" es la landing pública, sin
// guardas: la ve cualquiera, esté o no logueado. Las tareas viven en
// "/tareas", protegida. Cualquier URL desconocida ("*") cae en "/".
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/tareas"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
