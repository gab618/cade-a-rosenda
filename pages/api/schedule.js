import { timingSafeEqual } from "crypto";
import { readSchedule, updateFields } from "../../lib/gist";
import { SCHEDULE_FIELDS } from "../../lib/schedule";

const ADMIN_ONLY_FIELDS = ["brasilia"];

function matches(pin, expected) {
  if (!expected || typeof pin !== "string") return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Folgas e plantões extras: PIN da Rosenda ou de admin. Brasília: só admin.
function canEdit(fields, pin) {
  if (matches(pin, process.env.ADMIN_PIN)) return true;
  if (fields.some((f) => ADMIN_ONLY_FIELDS.includes(f))) return false;
  return matches(pin, process.env.SCHEDULE_PIN);
}

function isValidChanges(changes) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    return false;
  }
  const fields = Object.keys(changes);
  return (
    fields.length > 0 &&
    fields.every(
      (f) =>
        SCHEDULE_FIELDS.includes(f) &&
        Array.isArray(changes[f]) &&
        changes[f].length <= 2000
    )
  );
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const schedule = await readSchedule();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(schedule);
    }

    if (req.method === "PUT") {
      // Body: { changes: { daysOff?: [...], extraShifts?: [...], brasilia?: [...] } }
      const { changes } = req.body || {};
      if (!isValidChanges(changes)) {
        return res.status(400).json({ error: "Formato inválido" });
      }
      if (!canEdit(Object.keys(changes), req.headers["x-schedule-pin"])) {
        return res.status(401).json({ error: "PIN inválido" });
      }
      const schedule = await updateFields(changes);
      return res.status(200).json(schedule);
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao acessar a escala" });
  }
}
