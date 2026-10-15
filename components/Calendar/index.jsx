import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfMonth,
} from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { MdArrowBack, MdChevronLeft, MdChevronRight } from "react-icons/md";
import {
  isScheduledOff,
  sanitizeDaysOff,
  toDateKey,
  todayKeyInSaoPaulo,
} from "../../lib/schedule";
import {
  ArrowWrapper,
  Button,
  Container,
  Day,
  Empty,
  Grid,
  Hint,
  Input,
  Legend,
  MonthHeader,
  PinForm,
  Status,
  Swatch,
  WeekDay,
} from "./styles";

const CACHE_KEY = "rosenda:daysOff";
const PIN_KEY = "rosenda:pin";
const SAVE_DELAY_MS = 1000;
const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const STATUS_TEXT = {
  loading: "Carregando…",
  saving: "Salvando…",
  saved: "Tudo salvo ✓",
  pending: "Alterações não salvas…",
  offline: "Sem conexão — salvo neste aparelho, sincroniza depois",
  error: "Erro ao salvar — tentando de novo depois",
  needPin: "Digite o PIN para salvar as folgas",
};

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    return raw
      ? { daysOff: sanitizeDaysOff(raw.daysOff), dirty: !!raw.dirty }
      : null;
  } catch {
    return null;
  }
}

function writeCache(daysOff, dirty) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ daysOff, dirty }));
}

function Calendar() {
  const [today, setToday] = useState(null);
  const [month, setMonth] = useState(null);
  const [daysOff, setDaysOff] = useState([]);
  const [status, setStatus] = useState("loading");
  const [pinInput, setPinInput] = useState("");

  const daysOffRef = useRef(daysOff);
  const saveTimer = useRef(null);

  const save = useCallback(async () => {
    clearTimeout(saveTimer.current);
    saveTimer.current = null;

    const pin = localStorage.getItem(PIN_KEY);
    if (!pin) {
      setStatus("needPin");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-schedule-pin": pin },
        body: JSON.stringify({ daysOff: daysOffRef.current }),
      });
      if (res.status === 401) {
        localStorage.removeItem(PIN_KEY);
        setStatus("needPin");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      writeCache(daysOffRef.current, false);
      setStatus("saved");
    } catch {
      setStatus(navigator.onLine ? "error" : "offline");
    }
  }, []);

  // Carrega cache local na hora e depois sincroniza com o servidor.
  useEffect(() => {
    const todayKey = todayKeyInSaoPaulo();
    setToday(todayKey);
    setMonth(startOfMonth(parseISO(todayKey)));

    const cache = readCache();
    if (cache) {
      daysOffRef.current = cache.daysOff;
      setDaysOff(cache.daysOff);
    }

    if (cache?.dirty) {
      // Tem alteração local que não chegou ao servidor: envia.
      save();
      return;
    }

    fetch("/api/schedule")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(({ daysOff: remote }) => {
        const clean = sanitizeDaysOff(remote);
        daysOffRef.current = clean;
        setDaysOff(clean);
        writeCache(clean, false);
        setStatus("saved");
      })
      .catch(() => setStatus(cache ? "offline" : "error"));
  }, [save]);

  // Quando voltar a conexão, tenta enviar pendências.
  useEffect(() => {
    function onOnline() {
      if (readCache()?.dirty) save();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [save]);

  // Ao sair da página com save pendente, envia na hora.
  useEffect(
    () => () => {
      if (saveTimer.current) save();
    },
    [save]
  );

  function toggle(key) {
    if (isScheduledOff(key)) return;
    const next = daysOffRef.current.includes(key)
      ? daysOffRef.current.filter((d) => d !== key)
      : sanitizeDaysOff([...daysOffRef.current, key]);

    daysOffRef.current = next;
    setDaysOff(next);
    writeCache(next, true);
    setStatus("pending");

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, SAVE_DELAY_MS);
  }

  function handlePinSubmit(e) {
    e.preventDefault();
    if (!pinInput) return;
    localStorage.setItem(PIN_KEY, pinInput);
    setPinInput("");
    save();
  }

  const cells = useMemo(() => {
    if (!month) return [];
    const days = eachDayOfInterval({
      start: month,
      end: endOfMonth(month),
    });
    const leading = Array.from({ length: getDay(month) }, () => null);
    return [...leading, ...days];
  }, [month]);

  if (!month) {
    return (
      <Container>
        <Status>{STATUS_TEXT.loading}</Status>
      </Container>
    );
  }

  return (
    <Container>
      <h1>Folgas da Rosenda</h1>
      <Hint>Toque num dia de plantão para marcar folga extra</Hint>

      <MonthHeader>
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => setMonth((m) => addMonths(m, -1))}
        >
          <MdChevronLeft />
        </button>
        <h2>{format(month, "MMMM yyyy", { locale: ptBR })}</h2>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          <MdChevronRight />
        </button>
      </MonthHeader>

      <Grid>
        {WEEK_DAYS.map((d, i) => (
          <WeekDay key={i}>{d}</WeekDay>
        ))}
        {cells.map((date, i) => {
          if (!date) return <Empty key={`empty-${i}`} />;
          const key = toDateKey(date);
          const kind = isScheduledOff(key)
            ? "scheduled"
            : daysOff.includes(key)
              ? "extra"
              : "work";
          return (
            <Day
              key={key}
              type="button"
              $kind={kind}
              $today={key === today}
              $past={key < today}
              disabled={kind === "scheduled"}
              onClick={() => toggle(key)}
              aria-pressed={kind === "extra"}
              aria-label={`${format(date, "d 'de' MMMM", {
                locale: ptBR,
              })}: ${kind === "work"
                  ? "plantão"
                  : kind === "extra"
                    ? "folga"
                    : "descanso"
                }`}
            >
              {date.getDate()}
              {kind === "extra" && <small>🌴</small>}
            </Day>
          );
        })}
      </Grid>

      <Legend>
        <span>
          <Swatch $kind="work" /> Plantão
        </span>
        <span>
          <Swatch $kind="scheduled" /> Descanso
        </span>
        <span>
          <Swatch $kind="extra" /> Folga
        </span>
      </Legend>

      <Status>{STATUS_TEXT[status]}</Status>

      {status === "needPin" && (
        <PinForm onSubmit={handlePinSubmit}>
          <Input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            autoFocus
          />
          <Button type="submit">Salvar</Button>
        </PinForm>
      )}

      <Link href="/">
        <ArrowWrapper>
          <MdArrowBack />
        </ArrowWrapper>
      </Link>
    </Container>
  );
}

export default Calendar;
