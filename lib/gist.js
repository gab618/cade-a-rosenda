// Server-only: lê/escreve as folgas extras num GitHub Gist.
// Env vars: GIST_ID, GITHUB_TOKEN (fine-grained/classic com escopo "gist").
import { sanitizeDaysOff } from "./schedule";

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

export async function readDaysOff() {
  const res = await fetch(gistUrl(), { headers: headers(), cache: "no-store" });
  if (!res.ok) throw new Error(`Erro ao ler gist: ${res.status}`);
  const gist = await res.json();
  const file = gist.files?.[FILE_NAME];
  if (!file?.content) return [];
  try {
    return sanitizeDaysOff(JSON.parse(file.content).daysOff);
  } catch {
    return [];
  }
}

export async function writeDaysOff(daysOff) {
  const clean = sanitizeDaysOff(daysOff);
  const res = await fetch(gistUrl(), {
    method: "PATCH",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({
      files: {
        [FILE_NAME]: {
          content: JSON.stringify({ daysOff: clean }, null, 2),
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Erro ao salvar gist: ${res.status}`);
  return clean;
}
