export interface WorkingHour {
  day: string;
  hours: string;
}

const DAY_NAMES = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
] as const;

const TIME_RANGE_PATTERN = /^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/;

export function parseTimeRange(value: string): { startMinutes: number; endMinutes: number } | null {
  const match = value.trim().match(TIME_RANGE_PATTERN);
  if (!match) return null;

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4]);
  if (startHour > 23 || endHour > 23 || startMinute > 59 || endMinute > 59) return null;

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  return startMinutes < endMinutes ? { startMinutes, endMinutes } : null;
}

function isDayInRange(day: string, dayOfWeek: number): boolean {
  if (!day.includes("-")) return false;

  const [start, end] = day.split("-").map((part) => part.trim());
  const startIndex = DAY_NAMES.indexOf(start as (typeof DAY_NAMES)[number]);
  const endIndex = DAY_NAMES.indexOf(end as (typeof DAY_NAMES)[number]);
  if (startIndex === -1 || endIndex === -1) return false;

  return startIndex <= endIndex
    ? dayOfWeek >= startIndex && dayOfWeek <= endIndex
    : dayOfWeek >= startIndex || dayOfWeek <= endIndex;
}

export function getWorkingHourForDate(workingHours: WorkingHour[], date: Date): WorkingHour | undefined {
  const dayOfWeek = date.getDay();
  const dayName = DAY_NAMES[dayOfWeek];
  return workingHours.find((item) => item.day.trim() === dayName)
    ?? workingHours.find((item) => isDayInRange(item.day, dayOfWeek));
}

export function generateTimeSlots(
  workingHours: WorkingHour[],
  date: Date,
  intervalMinutes = 60,
): string[] {
  const dayHours = getWorkingHourForDate(workingHours, date);
  if (!dayHours || dayHours.hours.trim().toLocaleLowerCase("tr-TR") === "kapalı") return [];

  const range = parseTimeRange(dayHours.hours);
  if (!range || intervalMinutes <= 0) return [];

  const slots: string[] = [];
  for (let minutes = range.startMinutes; minutes < range.endMinutes; minutes += intervalMinutes) {
    const hour = Math.floor(minutes / 60).toString().padStart(2, "0");
    const minute = (minutes % 60).toString().padStart(2, "0");
    slots.push(`${hour}:${minute}`);
  }
  return slots;
}

export function combineAppointmentDate(date: Date, time: string): Date {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Geçersiz randevu saati");

  const appointmentDate = new Date(date);
  appointmentDate.setHours(Number(match[1]), Number(match[2]), 0, 0);
  if (Number.isNaN(appointmentDate.getTime())) throw new Error("Geçersiz randevu tarihi");
  return appointmentDate;
}

export function getAppointmentDocumentId(date: Date): string {
  return `slot_${date.toISOString().replace(/[:.]/g, "-")}`;
}

