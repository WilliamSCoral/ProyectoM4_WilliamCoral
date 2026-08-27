import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithRedirect,
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

// `signInWithPopup` depende de que el navegador permita abrir una
// ventana y de que esta pueda avisarle a la pestaña original que
// terminó (vía `window.opener`/`window.closed`). En producción (Vercel)
// esto falla en varios navegadores por las políticas de aislamiento de
// origen (Cross-Origin-Opener-Policy): la ventana se abre y se cierra
// sola de inmediato, sin completar el login. `signInWithRedirect` evita
// el problema de raíz porque no depende de ninguna ventana emergente: la
// propia pestaña navega a Google y vuelve.
export function loginWithGoogle() {
  return signInWithRedirect(auth, new GoogleAuthProvider());
}

// Se llama una sola vez al iniciar la app (`Authenticator`) para
// recuperar el resultado de ese viaje de ida y vuelta a Google — sobre
// todo para poder mostrar un error legible si Google devolvió uno, ya
// que la página que inició el login se recarga por completo y pierde
// cualquier `try/catch` que tuviera en memoria.
export function getGoogleRedirectResult() {
  return getRedirectResult(auth);
}

export function logout() {
  return signOut(auth);
}
