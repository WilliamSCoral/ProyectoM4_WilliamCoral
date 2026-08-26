import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Authenticator } from "./features/auth/Authenticator";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento #root en index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </StrictMode>,
);
