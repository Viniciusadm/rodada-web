# Rodada Web

Rodada runs live quizzes and games for groups: a host builds a match, shows it on a big screen and players join from their phones. This repository holds the web app, with the host area, the player screens and the big screen. The API lives in its own repository.

| Part | What it is |
| --- | --- |
| [`rodada-web`](https://github.com/Viniciusadm/rodada-web) | This repository. React app for hosts and players. |
| [`rodada-api`](https://github.com/Viniciusadm/rodada-api) | Rust API with accounts, question bank, matches and the realtime channel. |

The first version of the UI (layouts, routes, landing page and the match flow over mock data) was generated with Lovable on the TanStack Start template. The move to a plain Vite app, the API client, the realtime updates, the match templates and the big screen were written by hand afterwards.

## What it does

- Sign up, log in and manage a question bank, with CSV import (`/general-questions`).
- Match templates (`/match-templates`) with the game mode, scoring and ranking rules, and a big screen written in [Ribalta](https://github.com/Viniciusadm/ribalta) and edited in a CodeMirror editor.
- A host console (`/matches/$matchId/host`) to start the match, draw rounds and end it.
- The big screen (`/matches/$matchId/present`), rendered with the `@ribaltalang` packages.
- Players join with a code (`/entrar`, `/play`) and answer from their phones.
- Match history (`/history`).

Screens refresh through a WebSocket connection to the API (`src/lib/realtime-client.ts`).

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 7) and npm
- A running [`rodada-api`](https://github.com/Viniciusadm/rodada-api)

Stack: React 19, Vite 7, TanStack Router and Query, Tailwind CSS 4, shadcn/ui (Radix), Zustand.

## Running locally

Copy the example environment and point `VITE_API_BASE_URL` at the API. `VITE_DEMO_ADMIN_EMAIL` and `VITE_DEMO_ADMIN_PASSWORD` only prefill the login form.

```bash
cp .env.example .env
```

Install the dependencies and start the dev server on port 8080:

```bash
npm install
npm run dev
```

Build for production into `dist`:

```bash
npm run build
```

Lint the code:

```bash
npm run lint
```
