import { differenceInCalendarDays, format, parseISO } from "date-fns";

// Escala 12x36: a partir desta data, dias ímpares de diferença são folga.
const SHIFT_ANCHOR = new Date(2021, 7, 15);

export const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function toDateKey(date) {
  return format(date, "yyyy-MM-dd");
}

// Data de hoje ("yyyy-MM-dd") no fuso de São Paulo, independente do fuso do servidor.
export function todayKeyInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Folga pela escala (sem considerar folgas extras).
export function isScheduledOff(dateKey) {
  const days = differenceInCalendarDays(parseISO(dateKey), SHIFT_ANCHOR);
  return Math.abs(days) % 2 === 1;
}

// Tipo do dia no calendário:
// - "work": plantão da escala
// - "extra": plantão da escala com folga marcada
// - "scheduled": descanso da escala
// - "extraShift": descanso da escala com plantão extra marcado
export function getDayKind(dateKey, schedule) {
  if (isScheduledOff(dateKey)) {
    return schedule.extraShifts.includes(dateKey) ? "extraShift" : "scheduled";
  }
  return schedule.daysOff.includes(dateKey) ? "extra" : "work";
}

export function isDayOff(dateKey, schedule) {
  const kind = getDayKind(dateKey, schedule);
  return kind === "scheduled" || kind === "extra";
}

export function sanitizeDaysOff(value) {
  if (!Array.isArray(value)) return [];
  const valid = value.filter(
    (d) => typeof d === "string" && DATE_KEY_REGEX.test(d)
  );
  return [...new Set(valid)].sort();
}

// Campos editáveis do schedule.json.
export const SCHEDULE_FIELDS = ["daysOff", "extraShifts", "brasilia"];

export function sanitizeSchedule(value) {
  return {
    daysOff: sanitizeDaysOff(value?.daysOff),
    extraShifts: sanitizeDaysOff(value?.extraShifts),
    brasilia: sanitizeDaysOff(value?.brasilia),
  };
}

// Status do dia: "brasilia" tem prioridade sobre folga/plantão.
export function getDayStatus(dateKey, schedule) {
  if (schedule.brasilia.includes(dateKey)) return "brasilia";
  return isDayOff(dateKey, schedule) ? "off" : "work";
}

// Dia de Brasília que cai em plantão (da escala ou extra).
export function isBrasiliaConflict(dateKey, schedule) {
  return schedule.brasilia.includes(dateKey) && !isDayOff(dateKey, schedule);
}
