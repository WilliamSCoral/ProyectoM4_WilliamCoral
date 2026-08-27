import { Timestamp } from "firebase/firestore";

// Extra credit — Puente entre el formato que entiende `<input
// type="date">` (string "YYYY-MM-DD", en hora LOCAL) y el `Timestamp`
// que guarda Firestore. Se construye con año/mes/día explícitos (no
// `new Date(string)`) para evitar el corrimiento de un día que causa
// interpretar "2026-08-27" como UTC en vez de hora local.
export function dateInputValueToTimestamp(value: string): Timestamp {
  const [year, month, day] = value.split("-").map(Number);
  return Timestamp.fromDate(new Date(year, month - 1, day));
}

export function timestampToDateInputValue(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function todayDateInputValue(): string {
  const now = new Date();
  return timestampToDateInputValue(Timestamp.fromDate(now));
}
