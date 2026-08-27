import { Timestamp } from "firebase/firestore";
import {
  dateInputValueToTimestamp,
  isSameDay,
  timestampToDateInputValue,
} from "../../src/utils/date";

describe("dateInputValueToTimestamp / timestampToDateInputValue", () => {
  it("son inversas: convertir y volver a convertir da el mismo string", () => {
    const original = "2026-08-27";
    const timestamp = dateInputValueToTimestamp(original);
    expect(timestampToDateInputValue(timestamp)).toBe(original);
  });

  // Caso borde: fin de mes / fin de año, donde un corrimiento de huso
  // horario mal manejado rompería la fecha.
  it("no corre un día para atrás en 31 de diciembre", () => {
    const timestamp = dateInputValueToTimestamp("2026-12-31");
    expect(timestampToDateInputValue(timestamp)).toBe("2026-12-31");
  });
});

describe("isSameDay", () => {
  it("es true para el mismo día con distinta hora", () => {
    const a = new Date(2026, 7, 27, 8, 0);
    const b = new Date(2026, 7, 27, 23, 45);
    expect(isSameDay(a, b)).toBe(true);
  });

  it("es false para días distintos", () => {
    const a = new Date(2026, 7, 27);
    const b = new Date(2026, 7, 28);
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe("Timestamp helpers (sanity check con Firestore real)", () => {
  it("Timestamp.now() se puede formatear como string de input date", () => {
    const value = timestampToDateInputValue(Timestamp.now());
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
