import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Hito 2 — Configuración de Firebase.
// Authentication (identidades de usuario) y Firestore (datos) son dos
// servicios distintos que se inicializan por separado, aunque compartan
// el mismo proyecto de Firebase (la misma `app`).
//
// Las credenciales SIEMPRE se leen desde variables de entorno (VITE_...),
// nunca hardcodeadas acá. Ver .env.example.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Se exportan por separado para dejar explícito, en cualquier archivo que
// los importe, si se está trabajando con identidades (auth) o con datos
// (db). Se usarán en el Hito 3 (Authenticator) y en el Hito 6 (CRUD).
export const auth = getAuth(app);
export const db = getFirestore(app);