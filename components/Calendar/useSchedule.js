import { useCallback, useEffect, useRef, useState } from "react";
import {
  SCHEDULE_FIELDS,
  sanitizeDaysOff,
  sanitizeSchedule,
} from "../../lib/schedule";

const CACHE_KEY = "rosenda:schedule";
const SAVE_DELAY_MS = 1000;

function emptyDirty() {
  return Object.fromEntries(SCHEDULE_FIELDS.map((f) => [f, false]));
}

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (!raw) return null;
    return {
      schedule: sanitizeSchedule(raw.schedule),
      dirty: Object.fromEntries(
        SCHEDULE_FIELDS.map((f) => [f, !!raw.dirty?.[f]])
      ),
    };
  } catch {
    return null;
  }
}

function writeCache(schedule, dirty) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ schedule, dirty }));
}

function readDirty() {
  return readCache()?.dirty || emptyDirty();
}

function dirtyFields(fields) {
  const dirty = readDirty();
  return fields.filter((f) => dirty[f]);
}

// Mescla dados do servidor mantendo campos com alteração local pendente.
function mergeRemote(local, remote, dirty) {
  return Object.fromEntries(
    SCHEDULE_FIELDS.map((f) => [f, dirty[f] ? local[f] : remote[f]])
  );
}

/**
 * Estado do schedule com cache em localStorage e sync com o gist.
 * `fields` são os campos que esta tela edita (ex.: ["daysOff", "extraShifts"]);
 * `pinKey` é a chave do localStorage onde o PIN fica guardado.
 * Passe um array estável (constante de módulo) em `fields`.
 */
export default function useSchedule(fields, pinKey) {
  const [schedule, setSchedule] = useState(sanitizeSchedule({}));
  const [status, setStatus] = useState("loading");
  const [hasPin, setHasPin] = useState(false);

  const scheduleRef = useRef(schedule);
  const saveTimer = useRef(null);

  const apply = useCallback((next, dirty) => {
    scheduleRef.current = next;
    setSchedule(next);
    writeCache(next, dirty);
  }, []);

  const save = useCallback(async () => {
    clearTimeout(saveTimer.current);
    saveTimer.current = null;

    const toSend = dirtyFields(fields);
    if (toSend.length === 0) {
      setStatus("saved");
      return;
    }

    const pin = localStorage.getItem(pinKey);
    if (!pin) {
      setStatus("needPin");
      return;
    }

    setStatus("saving");
    try {
      const changes = Object.fromEntries(
        toSend.map((f) => [f, scheduleRef.current[f]])
      );
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-schedule-pin": pin },
        body: JSON.stringify({ changes }),
      });
      if (res.status === 401) {
        localStorage.removeItem(pinKey);
        setHasPin(false);
        setStatus("needPin");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));

      const remote = sanitizeSchedule(await res.json());
      // Se houve toque novo durante o save, mantém os campos como pendentes.
      const stillPending = !!saveTimer.current;
      const nextDirty = { ...readDirty() };
      if (!stillPending) toSend.forEach((f) => (nextDirty[f] = false));

      // Campos desta tela ficam com o valor local; o resto vem do servidor.
      const keepLocal = { ...nextDirty };
      fields.forEach((f) => (keepLocal[f] = true));
      apply(mergeRemote(scheduleRef.current, remote, keepLocal), nextDirty);
      setStatus(stillPending ? "pending" : "saved");
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    }
  }, [fields, pinKey, apply]);

  // Busca do gist. `discard` descarta alterações locais pendentes.
  const pull = useCallback(
    async ({ discard = false } = {}) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      setStatus("pulling");
      try {
        const res = await fetch("/api/schedule", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const remote = sanitizeSchedule(await res.json());
        const dirty = discard ? emptyDirty() : readDirty();
        apply(mergeRemote(scheduleRef.current, remote, dirty), dirty);
        setStatus("saved");
      } catch {
        setStatus(navigator.onLine ? "pullError" : "offline");
      }
    },
    [apply]
  );

  // Carrega cache local na hora e depois sincroniza com o servidor.
  useEffect(() => {
    setHasPin(!!localStorage.getItem(pinKey));

    const cache = readCache();
    if (cache) {
      scheduleRef.current = cache.schedule;
      setSchedule(cache.schedule);
    }

    if (dirtyFields(fields).length > 0) {
      // Tem alteração local que não chegou ao servidor: envia.
      save();
      return;
    }
    pull();
  }, [fields, pinKey, save, pull]);

  // Quando voltar a conexão, tenta enviar pendências.
  useEffect(() => {
    function onOnline() {
      if (dirtyFields(fields).length > 0) save();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [fields, save]);

  // Ao sair da página com save pendente, envia na hora.
  useEffect(
    () => () => {
      if (saveTimer.current) save();
    },
    [save]
  );

  const toggle = useCallback(
    (field, key) => {
      if (!fields.includes(field)) return;
      const current = scheduleRef.current[field];
      const nextDates = current.includes(key)
        ? current.filter((d) => d !== key)
        : sanitizeDaysOff([...current, key]);

      apply(
        { ...scheduleRef.current, [field]: nextDates },
        { ...readDirty(), [field]: true }
      );
      setStatus("pending");

      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(save, SAVE_DELAY_MS);
    },
    [fields, apply, save]
  );

  const hasPending = useCallback(
    () => !!saveTimer.current || dirtyFields(fields).length > 0,
    [fields]
  );

  const submitPin = useCallback(
    (pin) => {
      localStorage.setItem(pinKey, pin);
      setHasPin(true);
      if (dirtyFields(fields).length > 0) save();
      else setStatus("saved");
    },
    [pinKey, fields, save]
  );

  return { schedule, status, hasPin, toggle, pull, hasPending, submitPin };
}
