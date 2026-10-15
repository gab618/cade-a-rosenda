// Server-only: lê/escreve o schedule (folgas extras + dias em Brasília) num GitHub Gist.
// Env vars: GIST_ID, GITHUB_TOKEN (fine-grained/classic com escopo "gist").
import { sanitizeSchedule } from "./schedule";

const FILE_NAME = "schedule.json";

function gistUrl() {
  const { GIST_ID } = process.env;
  if (!GIST_ID) throw new Error("GIST_ID não configurado");
  return `https://api.github.com/gists/${GIST_ID}`;
}

function headers() {
  const { GITHUB_TOKEN } = process.env;
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN não configurado");
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function readSchedule() {
  const res = await fetch(gistUrl(), { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao ler gist: ${res.status}`);
  const gist = await res.json();
  const file = gist.files?.[FILE_NAME];
  if (!file?.content) return sanitizeSchedule({});
  try {
    return sanitizeSchedule(JSON.parse(file.content));
  } catch {
    return sanitizeSchedule({});
  }
}

// Lê o arquivo atual, troca só o campo editado e grava de volta,
// para que salvar folgas não apague os dias de Brasília (e vice-versa).
export async function updateField(field, dates) {
  const current = await readSchedule();
  const next = sanitizeSchedule({ ...current, [field]: dates });
  const res = await fetch(gistUrl(), {
    method: "PATCH",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({
      files: {
        [FILE_NAME]: {
          content: JSON.stringify(next, null, 2),
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Erro ao salvar gist: ${res.status}`);
  return next;
}
