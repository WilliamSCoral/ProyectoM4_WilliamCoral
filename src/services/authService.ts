import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
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

// Caso real que motivó esto: alguien crea una cuenta con contraseña y
// después inicia sesión con Google usando el mismo email — Firebase
// linkea ambos proveedores a la misma cuenta, pero eso no le da
// automáticamente una contraseña nueva a esa persona si nunca la usó o
// no la recuerda. `updatePassword` sirve si ya tiene el proveedor
// "password"; si no lo tiene (por ejemplo, la cuenta se creó solo con
// Google), `linkWithCredential` se lo agrega por primera vez.
export async function changePassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No hay una sesión activa.");
  }

  const hasPasswordProvider = user.providerData.some(
    (provider) => provider.providerId === "password",
  );

  if (hasPasswordProvider) {
    await updatePassword(user, newPassword);
    return;
  }

  await linkWithCredential(
    user,
    EmailAuthProvider.credential(user.email, newPassword),
  );
}
