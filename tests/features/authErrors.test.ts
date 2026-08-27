import { FirebaseError } from "firebase/app";
import { getAuthErrorMessage } from "../../src/features/auth/authErrors";

// `FirebaseError` es solo una clase de error (no inicializa ninguna app
// ni hace llamadas de red), así que se puede importar directo en el test
// sin mockear nada.
describe("getAuthErrorMessage", () => {
  it("traduce un código conocido a un mensaje en español", () => {
    const error = new FirebaseError("auth/wrong-password", "wrong password");
    expect(getAuthErrorMessage(error)).toBe(
      "La contraseña ingresada es incorrecta.",
    );
  });

  it("devuelve un mensaje genérico para un código no mapeado", () => {
    const error = new FirebaseError("auth/algo-nuevo-que-no-existe", "x");
    expect(getAuthErrorMessage(error)).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
  });

  it("devuelve un mensaje genérico si el error no es de Firebase", () => {
    expect(getAuthErrorMessage(new Error("algo raro"))).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
    expect(getAuthErrorMessage("string cualquiera")).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
  });
});
