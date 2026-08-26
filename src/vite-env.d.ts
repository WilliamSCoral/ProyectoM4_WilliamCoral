/// <reference types="vite/client" />

// Tipado de las variables de entorno expuestas al frontend (prefijo VITE_).
// Se completa en el Hito 2 al configurar Firebase.
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
