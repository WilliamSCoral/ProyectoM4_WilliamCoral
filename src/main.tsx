import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Authenticator } from "./features/auth/Authenticator";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento #root en index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <Authenticator>
        <App />
      </Authenticator>
    </BrowserRouter>
  </StrictMode>,
);
