# 🏥 Cadê a Rosenda?

Aplicação PWA feita com carinho para acompanhar a escala de trabalho, folgas e viagens da Rosenda.

O app responde instantaneamente se hoje ela está no **plantão no hospital**, no **conforto do lar** ou visitando a Violeta em **Brasília**.

---

## ✨ Funcionalidades

- **Visão Inicial Clara**: Exibe na hora o status do dia com animações Lottie temáticas (plantão, folga/descanso ou viagem).
- **Escala Automática 12x36**: Cálculo automático dos dias de plantão e descanso a partir da escala base.
- **Calendário Mensal Visual**:
  - ⬜ **Plantão**: Dias regulares de trabalho.
  - 🔲 **Descanso**: Folgas da escala automática (12x36).
  - 🟩 **Folga (`☀️`)**: Folgas extras negociadas ou trocas (marcação com 1 toque).
  - 🟦 **Brasília (`✈️`)**: Dias de viagem em família, destacados com borda azul e aviso visual (`⚠️`) caso coincida com dia de plantão sem folga.
- **Sincronização em Nuvem (GitHub Gist)**:
  - As folgas e viagens ficam salvas em um Gist secreto pessoal.
  - O app usa uma rota de API segura no Next.js — nenhum token do GitHub é exposto no navegador.
  - Suporte a atualização manual (botão `↻`) com proteção contra perda de dados não sincronizados.
- **Offline First (PWA)**:
  - Cache local via `localStorage` com suporte offline e Service Worker via Serwist.
  - Salva alterações locais mesmo sem internet e sincroniza automaticamente assim que a conexão volta.
- **Controle de Acesso com PIN**:
  - **PIN das Folgas (`/schedule`)**: Acesso simples e memorizado no dispositivo para ela marcar folgas com apenas um toque.
  - **PIN de Admin (`/admin`)**: Área dedicada para planejar e marcar as viagens para Brasília.

---

## 🛠️ Tecnologias

- [Next.js](https://nextjs.org/) (Pages Router)
- [React](https://react.dev/)
- [styled-components](https://styled-components.com/)
- [date-fns](https://date-fns.org/)
- [Lottie React](https://github.com/Gamote/lottie-react)
- [Serwist](https://serwist.pages.dev/) (PWA & Service Worker)
- [GitHub Gist API](https://docs.github.com/en/rest/gists)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ (ou versão compatível)
- Yarn ou npm

### 1. Clonar e Instalar Dependências

```bash
git clone https://github.com/gab618/cade-a-rosenda.git
cd cade-a-rosenda
yarn install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz baseado no `.env.example`:

```env
GIST_ID=seu_gist_id_aqui
GITHUB_TOKEN=seu_github_personal_access_token_aqui
SCHEDULE_PIN=1234
ADMIN_PIN=5678
```

> **Configuração do Gist:**
> 1. Crie um Gist secreto no GitHub com um arquivo chamado `schedule.json`:
>    ```json
>    {
>      "daysOff": [],
>      "brasilia": []
>    }
>    ```
> 2. O `GIST_ID` é o hash final da URL do seu Gist.
> 3. O `GITHUB_TOKEN` precisa ter permissão de leitura/escrita no escopo `gist`.

### 3. Rodar em Desenvolvimento

```bash
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 📱 Páginas & Rotas

| Rota | Descrição |
| :--- | :--- |
| `/` | Tela principal informando onde a Rosenda está hoje |
| `/schedule` | Calendário mensal para visualização e marcação de folgas |
| `/admin` | Calendário administrativo para marcar viagens a Brasília (requer `ADMIN_PIN`) |
| `/api/schedule` | Endpoint de leitura e atualização segura no Gist |

---

## 📄 Licença

Projeto pessoal e afetivo desenvolvido por [Gabriel Rocha](https://github.com/gab618).
