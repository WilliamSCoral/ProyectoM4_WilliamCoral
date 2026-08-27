import {
  validateEmail,
  validatePassword,
  validateTaskTitle,
} from "../../src/utils/validators";

// Hito 8 — Funciones puras, sin dependencias externas: no hace falta
// mockear nada acá.
describe("validateEmail", () => {
  it("rechaza un email vacío", () => {
    expect(validateEmail("")).toBe("El email es obligatorio.");
  });

  it("rechaza un email con formato inválido", () => {
    expect(validateEmail("no-es-un-email")).toBe(
      "El email ingresado no es válido.",
    );
  });

  it("acepta un email válido", () => {
    expect(validateEmail("persona@ejemplo.com")).toBeNull();
  });
});

describe("validatePassword", () => {
  it("rechaza una contraseña vacía", () => {
    expect(validatePassword("")).toBe("La contraseña es obligatoria.");
  });

  it("rechaza una contraseña de menos de 6 caracteres", () => {
    expect(validatePassword("123")).toBe(
      "La contraseña debe tener al menos 6 caracteres.",
    );
  });

  it("acepta una contraseña válida", () => {
    expect(validatePassword("123456")).toBeNull();
  });
});

describe("validateTaskTitle", () => {
  it("rechaza un título vacío", () => {
    expect(validateTaskTitle("")).toBe("El título es obligatorio.");
  });

  it("rechaza un título que solo tiene espacios", () => {
    expect(validateTaskTitle("   ")).toBe("El título es obligatorio.");
  });

  it("acepta un título válido", () => {
    expect(validateTaskTitle("Comprar pan")).toBeNull();
  });
});
