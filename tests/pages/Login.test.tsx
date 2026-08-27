import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Login } from "../../src/pages/Login";
import { useAuth } from "../../src/hooks/useAuth";

// Hito 8 — useAuth es la puerta hacia Firebase Auth (a través de
// Authenticator). Se mockea directamente en ese límite: Login no se
// entera de que está hablando con una versión falsa, y el test no
// inicializa Firebase para nada.
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe("Login", () => {
  const signIn = vi.fn();
  const signInWithGoogle = vi.fn();

  beforeEach(() => {
    signIn.mockReset();
    signInWithGoogle.mockReset();
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signUp: vi.fn(),
      signIn,
      signInWithGoogle,
      logout: vi.fn(),
      changePassword: vi.fn(),
    });
  });

  it("muestra errores de validación y no llama a signIn con el formulario vacío", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El email es obligatorio.",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("llama a signIn con las credenciales ingresadas", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue(undefined);
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "persona@ejemplo.com");
    await user.type(screen.getByLabelText("Contraseña"), "123456");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(signIn).toHaveBeenCalledWith("persona@ejemplo.com", "123456");
  });

  // Caso borde: Firebase rechaza las credenciales.
  it("muestra un mensaje legible cuando signIn rechaza con credenciales inválidas", async () => {
    const user = userEvent.setup();
    signIn.mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "invalid"),
    );
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "persona@ejemplo.com");
    await user.type(screen.getByLabelText("Contraseña"), "123456");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(
      await screen.findByText("Email o contraseña incorrectos."),
    ).toBeInTheDocument();
  });
});
