import { timingSafeEqual } from "crypto";
import { readDaysOff, writeDaysOff } from "../../lib/gist";

function isValidPin(pin) {
  const expected = process.env.SCHEDULE_PIN;
  if (!expected || typeof pin !== "string") return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const daysOff = await readDaysOff();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ daysOff });
    }

    if (req.method === "PUT") {
      if (!isValidPin(req.headers["x-schedule-pin"])) {
        return res.status(401).json({ error: "PIN inválido" });
      }
      const { daysOff } = req.body || {};
      if (!Array.isArray(daysOff) || daysOff.length > 2000) {
        return res.status(400).json({ error: "Formato inválido" });
      }
      const saved = await writeDaysOff(daysOff);
      return res.status(200).json({ daysOff: saved });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao acessar a escala" });
  }
}
