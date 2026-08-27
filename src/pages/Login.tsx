import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { validateEmail, validatePassword } from "../utils/validators";

interface LocationState {
  from?: { pathname: string };
}

export function Login() {
  const { signIn, signInWithGoogle, googleRedirectError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // El login con Google navega fuera de la SPA y vuelve: si Google
  // devolvió un error, esta página ya se recargó por completo y no
  // puede haberlo atrapado con su propio try/catch, así que se muestra
  // acá apenas `Authenticator` lo resuelve.
  useEffect(() => {
    if (googleRedirectError) {
      setFormError(googleRedirectError);
    }
  }, [googleRedirectError]);

  // Hito 4 — Si ProtectedRoute mandó acá guardando la ruta original en
  // `state.from`, volvemos ahí después de loguearse. Si no, a "/tareas".
  function redirectAfterAuth() {
    navigate(state?.from?.pathname ?? "/tareas", { replace: true });
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
      // A partir de acá la pestaña navega a Google: no hay nada más
      // para hacer en este componente. Cuando la persona vuelva,
      // `PublicOnlyRoute` la manda a /tareas apenas `onAuthStateChanged`
      // confirme la sesión (o `googleRedirectError`, más arriba, muestra
      // el error si Google no la autenticó).
      await signInWithGoogle();
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <h1>Bienvenido de nuevo</h1>

        {state?.from && (
          <p className="alert alert-info" role="alert">
            Necesitás iniciar sesión para acceder a esa página.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {formError && (
            <p className="alert alert-error" role="alert">
              {formError}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="auth-divider">
          <span>o continuá con</span>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-block"
          onClick={handleGoogleLogin}
          disabled={submitting}
        >
          Continuar con Google
        </button>

        <p className="auth-switch">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </section>
    </div>
  );
}
