import { useCallback, useEffect, useRef, useState } from "react";
import { sanitizeDaysOff, sanitizeSchedule } from "../../lib/schedule";

const CACHE_KEY = "rosenda:schedule";
const SAVE_DELAY_MS = 1000;

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (!raw) return null;
    return {
      schedule: sanitizeSchedule(raw.schedule),
      dirty: { daysOff: !!raw.dirty?.daysOff, brasilia: !!raw.dirty?.brasilia },
    };
  } catch {
    return null;
  }
}

function writeCache(schedule, dirty) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ schedule, dirty }));
}

function isDirty(field) {
  return !!readCache()?.dirty[field];
}

// Mescla dados do servidor mantendo campos com alteração local pendente.
function mergeRemote(local, remote, dirty) {
  return {
    daysOff: dirty.daysOff ? local.daysOff : remote.daysOff,
    brasilia: dirty.brasilia ? local.brasilia : remote.brasilia,
  };
}

/**
 * Estado do schedule com cache em localStorage e sync com o gist.
 * `field` é o campo que esta tela edita ("daysOff" ou "brasilia");
 * `pinKey` é a chave do localStorage onde o PIN fica guardado.
 */
export default function useSchedule(field, pinKey) {
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

    const pin = localStorage.getItem(pinKey);
    if (!pin) {
      setStatus("needPin");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-schedule-pin": pin },
        body: JSON.stringify({ field, dates: scheduleRef.current[field] }),
      });
      if (res.status === 401) {
        localStorage.removeItem(pinKey);
        setHasPin(false);
        setStatus("needPin");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));

      const remote = sanitizeSchedule(await res.json());
      const dirty = readCache()?.dirty || {};
      // Se houve toque novo durante o save, mantém o campo como pendente.
      const stillPending = !!saveTimer.current;
      const nextDirty = { ...dirty, [field]: stillPending };
      apply(
        mergeRemote(scheduleRef.current, remote, { ...nextDirty, [field]: true }),
        nextDirty
      );
      setStatus(stillPending ? "pending" : "saved");
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    }
  }, [field, pinKey, apply]);

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
        const dirty = discard
          ? { daysOff: false, brasilia: false }
          : readCache()?.dirty || { daysOff: false, brasilia: false };
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

    if (cache?.dirty[field]) {
      // Tem alteração local que não chegou ao servidor: envia.
      save();
      return;
    }
    pull();
  }, [field, pinKey, save, pull]);

  // Quando voltar a conexão, tenta enviar pendências.
  useEffect(() => {
    function onOnline() {
      if (isDirty(field)) save();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [field, save]);

  // Ao sair da página com save pendente, envia na hora.
  useEffect(
    () => () => {
      if (saveTimer.current) save();
    },
    [save]
  );

  const toggle = useCallback(
    (key) => {
      const current = scheduleRef.current[field];
      const nextDates = current.includes(key)
        ? current.filter((d) => d !== key)
        : sanitizeDaysOff([...current, key]);

      const dirty = readCache()?.dirty || {};
      apply(
        { ...scheduleRef.current, [field]: nextDates },
        { ...dirty, [field]: true }
      );
      setStatus("pending");

      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(save, SAVE_DELAY_MS);
    },
    [field, apply, save]
  );

  const hasPending = useCallback(
    () => !!saveTimer.current || isDirty(field),
    [field]
  );

  const submitPin = useCallback(
    (pin) => {
      localStorage.setItem(pinKey, pin);
      setHasPin(true);
      if (isDirty(field)) save();
      else setStatus("saved");
    },
    [pinKey, field, save]
  );

  return { schedule, status, hasPin, toggle, pull, hasPending, submitPin };
}
