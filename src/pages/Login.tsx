import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { validateEmail, validatePassword } from "../utils/validators";

interface LocationState {
  from?: { pathname: string };
}

export function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Hito 4 — Si ProtectedRoute mandó acá guardando la ruta original en
  // `state.from`, volvemos ahí después de loguearse. Si no, a "/".
  function redirectAfterAuth() {
    navigate(state?.from?.pathname ?? "/", { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setFormError(emailError ?? passwordError);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      redirectAfterAuth();
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setFormError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      redirectAfterAuth();
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Iniciar sesión</h1>
      {state?.from && (
        <p role="alert">Necesitás iniciar sesión para acceder a esa página.</p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

        {formError && <p role="alert">{formError}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <button type="button" onClick={handleGoogleLogin} disabled={submitting}>
        Continuar con Google
      </button>

      <p>
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </section>
  );
}
