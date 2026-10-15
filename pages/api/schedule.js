import { timingSafeEqual } from "crypto";
import { readSchedule, updateField } from "../../lib/gist";
import { SCHEDULE_FIELDS } from "../../lib/schedule";

function matches(pin, expected) {
  if (!expected || typeof pin !== "string") return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Folgas: PIN da Rosenda ou de admin. Brasília: só admin.
function canEdit(field, pin) {
  const isAdmin = matches(pin, process.env.ADMIN_PIN);
  if (field === "brasilia") return isAdmin;
  return isAdmin || matches(pin, process.env.SCHEDULE_PIN);
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const schedule = await readSchedule();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(schedule);
    }

    if (req.method === "PUT") {
      const { field, dates } = req.body || {};
      if (
        !SCHEDULE_FIELDS.includes(field) ||
        !Array.isArray(dates) ||
        dates.length > 2000
      ) {
        return res.status(400).json({ error: "Formato inválido" });
      }
      if (!canEdit(field, req.headers["x-schedule-pin"])) {
        return res.status(401).json({ error: "PIN inválido" });
      }
      const schedule = await updateField(field, dates);
      return res.status(200).json(schedule);
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao acessar a escala" });
  }
}
