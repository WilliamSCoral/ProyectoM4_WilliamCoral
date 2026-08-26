import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { validateEmail, validatePassword } from "../utils/validators";

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validar en el cliente antes de llamar a Firebase: feedback
    // inmediato y sin gastar una request de red con datos ya inválidos.
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
      // No hace falta actualizar estado local de "usuario logueado" acá:
      // el Authenticator escucha onAuthStateChanged y propaga el cambio
      // solo, en cualquier parte de la app que use useAuth().
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
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1>Iniciar sesión</h1>
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
        ¿No tenés cuenta?{" "}
        <button type="button" onClick={onSwitchToRegister}>
          Registrate
        </button>
      </p>
    </section>
  );
}
