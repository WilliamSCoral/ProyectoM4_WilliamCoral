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

// Se probó `signInWithRedirect` como alternativa a `signInWithPopup`,
// pero en producción el viaje de ida y vuelta por Google (tu dominio ->
// accounts.google.com -> el `authDomain` de Firebase -> tu dominio de
// nuevo) perdía el estado silenciosamente en el navegador probado
// (sin ningún error, simplemente no completaba el login) — muy probable
// por bloqueo de cookies/almacenamiento de terceros en ese viaje. El
// problema original de `signInWithPopup` ("se abre y se cierra la
// ventana") era en realidad porque el dominio de producción no estaba
// en la lista de dominios autorizados de Firebase (ya corregido en la
// consola); con eso resuelto, el popup evita el viaje de ida y vuelta
// por completo y es más confiable acá.
export function loginWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function logout() {
  return signOut(auth);
}
