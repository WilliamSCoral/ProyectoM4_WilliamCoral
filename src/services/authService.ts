import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

// Hito 3 — Capa de servicio: encapsula las llamadas directas a Firebase
// Auth. El Authenticator (features/auth) llama a estas funciones en vez
// de importar `firebase/auth` directamente, para que Firebase quede
// aislado en `services/` y sea más fácil de mockear en los tests del
// Hito 8.

export function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function loginWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function logout() {
  return signOut(auth);
}
