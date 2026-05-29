# Fluxo de Criação e Condução de Partidas — HolyPlay (mockado)

Implementar todo o fluxo descrito como **frontend navegável com dados em memória**. Sem backend, sem websocket, sem auth real. O "anfitrião" é assumido como o usuário logado atual (mock).

## Novas rotas

```
src/routes/
  matches.tsx                  -> /matches              (listar partidas existentes)
  matches.new.tsx              -> /matches/new          (wizard de criação)
  matches.$matchId.questions.tsx -> gerenciar perguntas (CRUD + import CSV)
  matches.$matchId.host.tsx    -> painel do anfitrião
  matches.$matchId.present.tsx -> tela de apresentação (layout limpo, sem sidebar)
  play.$matchId.tsx            -> tela do jogador remoto (entrar com nome + botão de buzzer)
```

A rota `/create-game` existente vira atalho/redirect para `/matches/new` para manter consistência.
Adicionar item **"Partidas"** na `AppSidebar`.

## Estado mockado (Zustand)

Arquivo `src/lib/match-store.ts` — store em memória que persiste apenas durante a sessão (sem localStorage para manter "tudo mockado"). Modela:

```ts
type GameMode = "classico" | "pontos-iniciais" | "eliminacao";
type MatchStatus = "aguardando" | "em-andamento" | "encerrada";

type Question = { id; text; answer; points; used: boolean };
type MatchPlayer = { id; name; score; eliminatedThisRound: boolean; remote: boolean };
type Match = {
  id; name; maxQuestions?; timePerQuestion?; mode: GameMode;
  initialPoints?; remoteEnabled: boolean;
  status: MatchStatus;
  questions: Question[];
  players: MatchPlayer[];
  currentQuestionId?: string;
  currentPlayerId?: string;
  answerRevealed: boolean;
  joinPin: string; // 6 dígitos
};
```

Ações: `createMatch`, `updateMatch`, `deleteMatch`, `addQuestion`, `importQuestionsCsv`, `updateQuestion`, `removeQuestion`, `addPlayer`, `removePlayer`, `startMatch`, `drawQuestion`, `selectPlayer`, `buzzIn(playerId)`, `registerAnswer(correct)`, `applyPenalty(playerId, points)`, `endMatch`, `resetMatch`. Seed inicial com 2 partidas de exemplo (uma aguardando, uma encerrada com ranking).

## Telas

### `/matches` — lista
Grid de cards: nome, status badge, modo, nº de perguntas, nº de jogadores. Botões: **Abrir painel**, **Perguntas**, **Excluir**. Botão primário **Nova partida**.

### `/matches/new` — wizard (reaproveita visual do `create-game.tsx`)
3 passos:
1. **Regras** — nome, modo (select), max perguntas (opcional), tempo/pergunta (opcional), pontos iniciais (condicional ao modo), toggle "Participação remota".
2. **Perguntas** — cadastro manual (lista editável) + área de **Importar CSV** com botão "Baixar modelo" e drop zone que faz parse client-side (formato `pergunta,resposta,pontos`). Mostra preview das linhas importadas.
3. **Revisão** — resumo + botão **Criar partida** → cria no store e navega para `/matches/:id/host`.

### `/matches/:id/questions`
Tabela com pergunta, resposta, pontos, ações (editar inline em modal, excluir). Botão **Adicionar pergunta** e **Importar CSV**. Voltar para painel.

### `/matches/:id/host` — painel do anfitrião
Layout em 2 colunas:
- **Coluna esquerda (controle):**
  - Cabeçalho: nome da partida, status badge, PIN, botão "Abrir apresentação" (abre `/present` em nova aba).
  - Bloco **Jogadores**: lista com pontuação, botões +/− penalidade, remover. Input "Adicionar jogador" (desativado visualmente se `remoteEnabled` e mostrando aviso "Jogadores entram pelo link").
  - Botões grandes: **Iniciar partida** / **Sortear pergunta** / **Encerrar** / **Resetar**.
- **Coluna direita (rodada atual):**
  - Card grande com pergunta sorteada, resposta (oculta até revelar), pontos.
  - Seletor "Quem responde?": lista de jogadores com botão selecionar. Se remoto, mostra "Aguardando buzzer..." e destaca o jogador que apertou.
  - Botões **Acertou** (verde) / **Errou** (vermelho) → registram resultado, atualizam placar, marcam pergunta como usada.
  - Contador "Perguntas restantes: X/Y".
- Quando `status === "encerrada"`: mostra **ranking final** ordenado, com pódio dos 3 primeiros e botão **Resetar partida**.

### `/matches/:id/present` — tela pública
Rota fora do layout com sidebar (usar pathless: renderizar sem `AppSidebar`/`Topbar`). Fundo escuro, tipografia grande:
- Estado aguardando: nome da partida, PIN gigante + QR mockado, lista de jogadores conectados, "Aguardando início...".
- Em andamento: enunciado da pergunta em destaque, contador de tempo (visual, decorativo), jogador da vez destacado, placar lateral.
- Resposta revelada: mostra resposta correta com animação simples.
- Encerrada: tela de ranking final com pódio.

Atualização entre painel e apresentação via **store compartilhado em memória** (mesma aba) + simulação cross-tab usando `BroadcastChannel` para refletir mudanças quando aberta em outra aba — ainda 100% client-side, sem backend.

### `/play/:id` — jogador remoto
- Tela 1: input "Seu nome" + botão **Entrar na partida** (adiciona ao store via BroadcastChannel).
- Tela 2: aguardando início.
- Tela 3 (rodada ativa): **botão buzzer gigante** centralizado. Estados:
  - "Aguarde..." (contagem regressiva visual de 3s após pergunta sortear),
  - "PRESSIONE!" (verde, clicável),
  - "Eliminado nesta rodada" (se apertou cedo),
  - "Você foi escolhido — responda!" (se ganhou o buzzer).
- Sempre mostra pontuação do próprio jogador no topo.

## Componentes novos

- `src/components/match/MatchCard.tsx`
- `src/components/match/PlayerRow.tsx` (com botões de penalidade)
- `src/components/match/QuestionRow.tsx`
- `src/components/match/CsvImport.tsx` (parse client-side, sem libs extras — split por linha/vírgula com tratamento de aspas)
- `src/components/match/BuzzerButton.tsx`
- `src/components/match/PodiumFinal.tsx` (reaproveitar visual do ranking existente)
- `src/components/match/PresentLayout.tsx` (layout limpo para `/present` e `/play`)

## Detalhes técnicos

- **Store:** `zustand` (já está no projeto? se não, adicionar via `bun add zustand`). Caso queira evitar dependência, usar React Context + reducer.
- **BroadcastChannel:** `new BroadcastChannel("holyplay-match-${id}")` em hook `useMatchSync(matchId)` para sincronizar painel ↔ apresentação ↔ player.
- **CSV:** parser simples em `src/lib/csv.ts`, sem dependência externa.
- **PIN:** gerado com `Math.random().toString().slice(2,8)` no `createMatch`.
- **Rotas sem layout:** `/present` e `/play` precisam escapar do `AppSidebar` definido em `__root.tsx`. Solução: detectar `location.pathname.startsWith("/present") || startsWith("/play")` no `__root` e renderizar apenas `<Outlet/>` sem chrome.
- **Toasts** via `sonner` em ações (jogador adicionado, pergunta sorteada, partida encerrada, CSV importado com N linhas).
- **Sem backend:** nenhuma chamada a Supabase, nenhuma server function, nenhum websocket.

## Fora de escopo

- Persistência real (recarregar a página limpa o estado — comportamento esperado de mock).
- Autenticação do anfitrião (assume usuário fixo já logado).
- QR code real (placeholder visual).
- Timer funcional contando o tempo por pergunta (apenas exibição visual).
