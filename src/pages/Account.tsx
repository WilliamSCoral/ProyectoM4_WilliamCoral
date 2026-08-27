import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { validatePassword } from "../utils/validators";

// Caso real que motivó esta página: alguien inicia sesión con Google
// usando un email que ya tenía cuenta con contraseña (Firebase linkea
// ambos proveedores a la misma cuenta) y termina sin poder entrar con
// esa contraseña porque no la recuerda o nunca llegó a usarla. Acá
// puede definir una nueva sin necesidad de saber la anterior — está
// autenticada por sesión, no por la contraseña vieja.
export function Account() {
  const { user, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setFormError(passwordError);
      setSuccess(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      setSuccess(false);
      return;
    }

    setFormError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await changePassword(newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1>Mi cuenta</h1>
        <p className="account-email">Sesión iniciada como {user?.email}.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="account-new-password">Nueva contraseña</label>
            <input
              id="account-new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="account-confirm-password">
              Confirmar nueva contraseña
            </label>
            <input
              id="account-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          {formError && (
            <p className="alert alert-error" role="alert">
              {formError}
            </p>
          )}
          {success && (
            <p className="alert alert-success" role="status">
              Contraseña actualizada correctamente.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Actualizar contraseña"}
          </button>
        </form>
      </section>
    </div>
  );
}
