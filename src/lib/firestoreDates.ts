import { Timestamp } from "firebase/firestore";

export type FirestoreDateValue = Timestamp | Date | string | number | null | undefined;

export function toDate(value: FirestoreDateValue): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date(0);
}

export function isValidDateValue(value: FirestoreDateValue): boolean {
  return !Number.isNaN(toDate(value).getTime());
}
