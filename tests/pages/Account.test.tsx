import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FirebaseError } from "firebase/app";
import { Account } from "../../src/pages/Account";
import { useAuth } from "../../src/hooks/useAuth";

// Mismo patrón que Login.test.tsx: se mockea useAuth en el límite, sin
// tocar Firebase para nada.
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("Account", () => {
  const changePassword = vi.fn();

  beforeEach(() => {
    changePassword.mockReset();
    mockedUseAuth.mockReturnValue({
      user: { email: "persona@ejemplo.com" } as never,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
      changePassword,
    });
  });

  it("muestra un error y no llama a changePassword si la contraseña es muy corta", async () => {
    const user = userEvent.setup();
    render(<Account />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "123");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña"), "123");
    await user.click(
      screen.getByRole("button", { name: "Actualizar contraseña" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La contraseña debe tener al menos 6 caracteres.",
    );
    expect(changePassword).not.toHaveBeenCalled();
  });

  // Caso borde: mismo patrón de confirmación que Register.
  it("muestra un error y no llama a changePassword si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    render(<Account />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "123456");
    await user.type(screen.getByLabelText("Confirmar nueva contraseña"), "654321");
    await user.click(
      screen.getByRole("button", { name: "Actualizar contraseña" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Las contraseñas no coinciden.",
    );
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("llama a changePassword con la nueva contraseña y muestra la confirmación", async () => {
    const user = userEvent.setup();
    changePassword.mockResolvedValue(undefined);
    render(<Account />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "nuevaClave123");
    await user.type(
      screen.getByLabelText("Confirmar nueva contraseña"),
      "nuevaClave123",
    );
    await user.click(
      screen.getByRole("button", { name: "Actualizar contraseña" }),
    );

    expect(changePassword).toHaveBeenCalledWith("nuevaClave123");
    expect(
      await screen.findByText("Contraseña actualizada correctamente."),
    ).toBeInTheDocument();
  });

  // Caso borde: Firebase pide una sesión reciente para esta operación.
  it("muestra un mensaje legible cuando changePassword rechaza", async () => {
    const user = userEvent.setup();
    changePassword.mockRejectedValue(
      new FirebaseError("auth/requires-recent-login", "stale"),
    );
    render(<Account />);

    await user.type(screen.getByLabelText("Nueva contraseña"), "nuevaClave123");
    await user.type(
      screen.getByLabelText("Confirmar nueva contraseña"),
      "nuevaClave123",
    );
    await user.click(
      screen.getByRole("button", { name: "Actualizar contraseña" }),
    );

    expect(
      await screen.findByText(
        "Por seguridad, esta acción requiere una sesión reciente. Cerrá sesión, volvé a iniciarla y probá de nuevo.",
      ),
    ).toBeInTheDocument();
  });
});
