import { useEffect, useState } from "react";

type Theme = "light" | "dark";

// La misma clave que lee el script inline de index.html (para que no
// haya parpadeo de tema equivocado al recargar la página).
const STORAGE_KEY = "gestor-tareas-theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // Sin preferencia guardada todavía: arranca en lo que ya diga el
  // sistema operativo, para que el primer toggle sea intuitivo (parte
  // del tema que la persona ya está viendo).
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Hito de diseño — Interruptor manual de tema. Las variables de color en
// index.css ya reaccionan solas a `prefers-color-scheme`; acá se agrega
// un override explícito vía `data-theme` en <html>, que gana por encima
// de la preferencia del sistema una vez que la persona elige un tema a
// mano. La elección se guarda en localStorage para que persista entre
// sesiones.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}
