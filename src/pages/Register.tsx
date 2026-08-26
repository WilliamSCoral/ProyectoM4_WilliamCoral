import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { validateEmail, validatePassword } from "../utils/validators";

export function Register() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setFormError(emailError ?? passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await signUp(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setFormError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />

        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />

        <label htmlFor="register-confirm-password">Confirmar contraseña</label>
        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />

        {formError && <p role="alert">{formError}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <button type="button" onClick={handleGoogleSignUp} disabled={submitting}>
        Continuar con Google
      </button>

      <p>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </section>
  );
}
