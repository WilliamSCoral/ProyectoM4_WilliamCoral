import { useEffect, useState } from "react";
import { auth, db } from "./services/firebase";

// Hito 2 — Checkpoint temporal de verificación.
// Este componente SOLO sirve para confirmar que la app se conecta a
// Firebase (Auth + Firestore) sin errores en la consola, usando las
// variables de entorno correctamente. Se reemplaza por completo en el
// Hito 3 al introducir el Router y el Authenticator real.
function App() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">(
    "checking",
  );

  useEffect(() => {
    try {
      // Si `auth` y `db` se inicializaron sin lanzar, las credenciales del
      // .env están bien leídas y Firebase App se inicializó correctamente.
      if (auth.app && db.app) {
        console.log("Firebase conectado. Proyecto:", auth.app.options.projectId);
        setStatus("ok");
      }
    } catch (err) {
      console.error("Error conectando con Firebase:", err);
      setStatus("error");
    }
  }, []);

  return (
    <main>
      <h1>Gestor Estratégico de Tareas</h1>
      <p>Hito 2 — Configuración de Firebase</p>
      {status === "checking" && <p>Verificando conexión con Firebase...</p>}
      {status === "ok" && (
        <p style={{ color: "green" }}>
          ✅ Conectado a Firebase (Auth + Firestore). Revisa la consola del
          navegador para ver el projectId.
        </p>
      )}
      {status === "error" && (
        <p style={{ color: "red" }}>
          ❌ Error al conectar. Revisa que tu archivo .env tenga las 4
          variables VITE_FIREBASE_* completas y reinicia `npm run dev`.
        </p>
      )}
    </main>
  );
}

export default App;