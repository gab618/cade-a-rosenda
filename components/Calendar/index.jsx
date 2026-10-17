import { useEffect, useMemo, useState } from "react";
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
  MdFlight,
  MdRefresh,
  MdEvent,
} from "react-icons/md";
import {
  getDayKind,
  isBrasiliaConflict,
  toDateKey,
  todayKeyInSaoPaulo,
} from "../../lib/schedule";
import useSchedule from "./useSchedule";
import {
  ArrowWrapper,
  Button,
  Container,
  CornerLink,
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
  Warning,
  WeekDay,
} from "./styles";

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const MODES = {
  // Tela da Rosenda: marca folgas e plantões extras.
  daysOff: {
    fields: ["daysOff", "extraShifts"],
    pinKey: "rosenda:pin",
    title: "Folgas da Rosenda",
    hint: "Toque num plantão para marcar folga, ou num descanso para marcar plantão extra",
    needPin: "Digite o PIN para salvar as alterações",
    requirePinUpfront: false,
  },
  // Tela de admin: marca dias em Brasília.
  brasilia: {
    fields: ["brasilia"],
    pinKey: "rosenda:adminPin",
    title: "Dias em Brasília",
    hint: "Toque num dia para marcar/desmarcar Brasília",
    needPin: "Digite o PIN de admin",
    requirePinUpfront: true,
  },
};

const STATUS_TEXT = {
  loading: "Carregando…",
  pulling: "Atualizando…",
  pullError: "Não foi possível atualizar",
  saving: "Salvando…",
  saved: "Tudo salvo ✓",
  pending: "Alterações não salvas…",
  offline: "Sem conexão — salvo neste aparelho, sincroniza depois",
  error: "Erro ao salvar — tentando de novo depois",
};

const KIND_LABEL = {
  work: "plantão",
  extra: "folga",
  scheduled: "descanso",
  extraShift: "plantão extra",
};

// Na tela da Rosenda, o campo alterado depende do tipo do dia.
const FIELD_BY_KIND = {
  work: "daysOff",
  extra: "daysOff",
  scheduled: "extraShifts",
  extraShift: "extraShifts",
};

function Calendar({ mode = "daysOff" }) {
  const config = MODES[mode];
  const { schedule, status, hasPin, toggle, pull, hasPending, submitPin } =
    useSchedule(config.fields, config.pinKey);

  const [today, setToday] = useState(null);
  const [month, setMonth] = useState(null);
  const [pinInput, setPinInput] = useState("");

  useEffect(() => {
    const todayKey = todayKeyInSaoPaulo();
    setToday(todayKey);
    setMonth(startOfMonth(parseISO(todayKey)));
  }, []);

  const cells = useMemo(() => {
    if (!month) return [];
    const days = eachDayOfInterval({ start: month, end: endOfMonth(month) });
    const leading = Array.from({ length: getDay(month) }, () => null);
    return [...leading, ...days];
  }, [month]);

  const conflicts = useMemo(
    () =>
      cells
        .filter(Boolean)
        .map(toDateKey)
        .filter((key) => isBrasiliaConflict(key, schedule)),
    [cells, schedule]
  );

  const locked = config.requirePinUpfront && !hasPin;
  const showPinForm = status === "needPin" || locked;

  function handlePull() {
    if (
      hasPending() &&
      !window.confirm(
        "Há alterações não salvas neste aparelho. Descartar e baixar a versão salva?"
      )
    ) {
      return;
    }
    pull({ discard: true });
  }

  function handlePinSubmit(e) {
    e.preventDefault();
    if (!pinInput) return;
    submitPin(pinInput);
    setPinInput("");
  }

  if (!month) {
    return (
      <Container>
        <Status>{STATUS_TEXT.loading}</Status>
      </Container>
    );
  }

  return (
    <Container>
      <h1>{config.title}</h1>
      <Hint>{config.hint}</Hint>

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
          const kind = getDayKind(key, schedule);
          const brasilia = schedule.brasilia.includes(key);
          const conflict = isBrasiliaConflict(key, schedule);
          const field = mode === "brasilia" ? "brasilia" : FIELD_BY_KIND[kind];

          return (
            <Day
              key={key}
              type="button"
              $kind={kind}
              $brasilia={brasilia}
              $today={key === today}
              $past={key < today}
              disabled={locked}
              onClick={() => toggle(field, key)}
              aria-pressed={
                mode === "brasilia"
                  ? brasilia
                  : kind === "extra" || kind === "extraShift"
              }
              aria-label={`${format(date, "d 'de' MMMM", { locale: ptBR })}: ${
                KIND_LABEL[kind]
              }${brasilia ? ", Brasília" : ""}${
                conflict ? " (atenção: plantão)" : ""
              }`}
            >
              {date.getDate()}
              {(kind === "extra" || kind === "extraShift" || brasilia) && (
                <small>
                  {kind === "extra" && "☀️"}
                  {kind === "extraShift" && "🏥"}
                  {brasilia && "✈️"}
                  {conflict && "⚠️"}
                </small>
              )}
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
        <span>
          <Swatch $kind="extraShift" /> Plantão extra
        </span>
        <span>
          <Swatch $kind="brasilia" /> Brasília
        </span>
      </Legend>

      {conflicts.length > 0 && (
        <Warning>
          ⚠️ Brasília em dia de plantão:{" "}
          {conflicts.map((k) => Number(k.slice(-2))).join(", ")}
        </Warning>
      )}

      <StatusRow>
        <Status>
          {showPinForm ? config.needPin : STATUS_TEXT[status]}
        </Status>
        <RefreshButton
          type="button"
          onClick={handlePull}
          disabled={status === "pulling" || status === "saving"}
          $spinning={status === "pulling"}
          aria-label="Baixar dados salvos"
          title="Baixar dados salvos"
        >
          <MdRefresh />
        </RefreshButton>
      </StatusRow>

      {showPinForm && (
        <PinForm onSubmit={handlePinSubmit}>
          <Input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            autoFocus
          />
          <Button type="submit">
            {config.requirePinUpfront ? "Entrar" : "Salvar"}
          </Button>
        </PinForm>
      )}

      {mode === "daysOff" ? (
        <Link href="/admin" aria-label="Dias em Brasília (admin)">
          <CornerLink $faded>
            <MdFlight />
          </CornerLink>
        </Link>
      ) : (
        <Link href="/schedule" aria-label="Folgas">
          <CornerLink>
            <MdEvent />
          </CornerLink>
        </Link>
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
