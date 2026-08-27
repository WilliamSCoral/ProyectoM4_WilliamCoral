import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Extra credit — "/" deja de ser directo el login: ahora es una landing
// pública que explica la app. La navegación (Inicio / Iniciar sesión /
// Mis tareas) vive en el header fijo compartido (`AppHeader`), no acá.
export function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>Organizá tus tareas sin perder de vista lo importante</h1>
        <p>
          Creá tus tareas, marcalas por prioridad, seguí tus vencimientos en
          un calendario, y recibí un resumen por email cuando lo necesites —
          todo sincronizado al instante entre tus dispositivos.
        </p>
        <div className="home-hero__actions">
          <Link to={user ? "/tareas" : "/register"} className="btn btn-primary">
            {user ? "Ir a mis tareas" : "Comenzar gratis"}
          </Link>
          {!user && (
            <Link to="/login" className="btn btn-ghost">
              Ya tengo cuenta
            </Link>
          )}
        </div>
      </section>

      <section className="home-features">
        <article className="home-feature">
          <h2>Tiempo real</h2>
          <p>
            Cada cambio se guarda y aparece al instante, sin recargar la
            página, gracias a la sincronización en vivo con la nube.
          </p>
        </article>
        <article className="home-feature">
          <h2>Prioridad y calendario</h2>
          <p>
            Elegí la prioridad de cada tarea y mirá tus vencimientos
            pintados en un calendario mensual, de un vistazo.
          </p>
        </article>
        <article className="home-feature">
          <h2>Resumen por email</h2>
          <p>
            Con un clic, recibís en tu correo un resumen de tus tareas
            pendientes y completadas.
          </p>
        </article>
      </section>
    </div>
  );
}
