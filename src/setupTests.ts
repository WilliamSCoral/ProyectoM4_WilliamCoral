// Se carga automáticamente antes de cada test (ver vite.config.ts -> test.setupFiles).
// Sin este archivo, matchers como toBeInTheDocument() no existen aunque el
// paquete @testing-library/jest-dom esté instalado.
import "@testing-library/jest-dom";
