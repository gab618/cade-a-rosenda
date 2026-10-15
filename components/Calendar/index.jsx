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
import {
  MdArrowBack,
  MdChevronLeft,
  MdChevronRight,
  MdRefresh,
} from "react-icons/md";
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
  RefreshButton,
  Status,
  StatusRow,
  Swatch,
  WeekDay,
} from "./styles";

const CACHE_KEY = "rosenda:daysOff";
const PIN_KEY = "rosenda:pin";
const SAVE_DELAY_MS = 1000;
const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const STATUS_TEXT = {
  loading: "Carregando…",
  pulling: "Atualizando…",
  pullError: "Não foi possível atualizar",
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

  // Busca do gist e sobrescreve o estado local.
  const pull = useCallback(async () => {
    clearTimeout(saveTimer.current);
    saveTimer.current = null;
    setStatus("pulling");
    try {
      const res = await fetch("/api/schedule", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const clean = sanitizeDaysOff((await res.json()).daysOff);
      daysOffRef.current = clean;
      setDaysOff(clean);
      writeCache(clean, false);
      setStatus("saved");
    } catch {
      setStatus(navigator.onLine ? "pullError" : "offline");
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

    pull();
  }, [save, pull]);

  function handlePull() {
    const hasPending = saveTimer.current || readCache()?.dirty;
    if (
      hasPending &&
      !window.confirm(
        "Há alterações não salvas neste aparelho. Descartar e baixar a versão salva?"
      )
    ) {
      return;
    }
    pull();
  }

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

      <StatusRow>
        <Status>{STATUS_TEXT[status]}</Status>
        <RefreshButton
          type="button"
          onClick={handlePull}
          disabled={status === "pulling" || status === "saving"}
          $spinning={status === "pulling"}
          aria-label="Baixar folgas salvas"
          title="Baixar folgas salvas"
        >
          <MdRefresh />
        </RefreshButton>
      </StatusRow>

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
