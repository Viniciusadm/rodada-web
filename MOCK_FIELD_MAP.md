# Mapa campo -> tela -> significado

Este mapa classifica os campos vindos de `src/lib/mock-data.ts` e
`src/lib/match-store.ts` para evitar que estruturas denormalizadas sejam copiadas
para o banco. Classificacoes usadas:

- **real**: representa entidade, relacao, configuracao ou evento que deve existir
  como fonte de verdade.
- **derivado**: deve ser calculado a partir de outras tabelas/eventos.
- **duplicado**: repete informacao que deve vir de relacionamento.
- **apresentacional**: serve para UI, estado local ou formato de exibicao.

## `mock-data.ts`

### `Game`

| Campo         | Telas/componentes                                | Significado atual                               | Classificacao   |
| ------------- | ------------------------------------------------ | ----------------------------------------------- | --------------- |
| `id`          | `/`, `/games`, `GameCard`, `/rooms` via `gameId` | Identificador do jogo do catalogo               | real            |
| `name`        | `/`, `/games`, `GameCard`                        | Nome exibido do jogo                            | real            |
| `description` | `/`, `/games`, `GameCard`                        | Descricao curta do jogo                         | real            |
| `icon`        | `GameCard`                                       | Icone React usado no card                       | apresentacional |
| `iconColor`   | `GameCard`                                       | Classes CSS do icone/card                       | apresentacional |
| `status`      | `GameCard`, `StatusBadge`                        | Estado de disponibilidade do jogo               | real            |
| `players`     | `GameCard`                                       | Popularidade/total de jogadores exibido no card | derivado        |

### `Player`

| Campo      | Telas/componentes           | Significado atual                         | Classificacao   |
| ---------- | --------------------------- | ----------------------------------------- | --------------- |
| `id`       | `/`, `/players`, `/ranking` | Identificador do jogador/membro           | real            |
| `name`     | `/`, `/players`, `/ranking` | Nome do jogador                           | real            |
| `initials` | `/`, `/players`, `/ranking` | Iniciais exibidas no avatar               | apresentacional |
| `ministry` | `/`, `/players`, `/ranking` | Ministerio/grupo do jogador como texto    | duplicado       |
| `points`   | `/`, `/players`, `/ranking` | Pontuacao acumulada do jogador no periodo | derivado        |
| `matches`  | `/players`, `/ranking`      | Quantidade de partidas jogadas            | derivado        |
| `level`    | `/players`                  | Nivel gamificado do jogador               | derivado        |
| `color`    | `/`, `/players`, `/ranking` | Classes CSS do avatar                     | apresentacional |

### `Room`

| Campo               | Telas/componentes                         | Significado atual                      | Classificacao |
| ------------------- | ----------------------------------------- | -------------------------------------- | ------------- |
| `id`                | `/rooms`                                  | Identificador da sala/card ao vivo     | real          |
| `name`              | `/`, `/rooms`                             | Nome da sala/sessao ao vivo            | real          |
| `gameId`            | `mock-data`, relacao implicita com `Game` | Referencia ao jogo                     | real          |
| `gameName`          | `/`, `/rooms`                             | Nome do jogo repetido para exibicao    | duplicado     |
| `pin`               | `/rooms`                                  | Codigo de entrada da sala              | real          |
| `participants`      | `/`, `/rooms`                             | Quantidade de participantes conectados | derivado      |
| `capacity`          | `/`, `/rooms`                             | Limite/capacidade configurada da sala  | real          |
| `host`              | `/rooms`                                  | Nome textual do anfitriao              | duplicado     |
| `startedMinutesAgo` | `/rooms`                                  | Tempo relativo desde o inicio          | derivado      |

### `History Match`

| Campo      | Telas/componentes | Significado atual                  | Classificacao   |
| ---------- | ----------------- | ---------------------------------- | --------------- |
| `id`       | `/history`        | Identificador da partida historica | real            |
| `gameName` | `/history`        | Nome do jogo repetido no historico | duplicado       |
| `room`     | `/history`        | Nome textual da sala/grupo         | duplicado       |
| `date`     | `/history`        | Data/hora formatada para exibicao  | apresentacional |
| `players`  | `/history`        | Total de jogadores da partida      | derivado        |
| `winner`   | `/history`        | Nome textual do vencedor           | derivado        |
| `duration` | `/history`        | Duracao formatada                  | derivado        |

### `statusLabel`

| Campo         | Telas/componentes | Significado atual                | Classificacao   |
| ------------- | ----------------- | -------------------------------- | --------------- |
| `statusLabel` | `StatusBadge`     | Traducao de `GameStatus` para UI | apresentacional |

## `match-store.ts`

### `GameMode` e `MatchStatus`

| Campo                             | Telas/componentes                                    | Significado atual                   | Classificacao   |
| --------------------------------- | ---------------------------------------------------- | ----------------------------------- | --------------- |
| `GameMode`                        | `/matches/new`, `/matches`, `/matches/:matchId/host` | Regra/mecanica principal da partida | real            |
| `MatchStatus`                     | `/matches`, host, present, play                      | Ciclo de vida da partida            | real            |
| `modeLabels` / `getModeLabel`     | `/matches`, host                                     | Rotulo de UI para modo              | apresentacional |
| `statusLabels` / `getStatusLabel` | badges/status                                        | Rotulo de UI para status            | apresentacional |

### `Question`

| Campo    | Telas/componentes                                   | Significado atual                           | Classificacao |
| -------- | --------------------------------------------------- | ------------------------------------------- | ------------- |
| `id`     | perguntas, host, present, play                      | Identificador da pergunta dentro da partida | real          |
| `text`   | `/matches/new`, perguntas, host, present, play, CSV | Texto da pergunta                           | real          |
| `answer` | `/matches/new`, perguntas, host, present            | Resposta esperada                           | real          |
| `points` | `/matches/new`, perguntas, host, present, CSV       | Pontos padrao da pergunta                   | real          |
| `used`   | host, store                                         | Flag de pergunta ja usada na partida        | derivado      |

### `MatchPlayer`

| Campo                 | Telas/componentes                       | Significado atual                             | Classificacao |
| --------------------- | --------------------------------------- | --------------------------------------------- | ------------- |
| `id`                  | host, present, play                     | Identificador do participante na partida      | real          |
| `name`                | host, present, play                     | Nome exibido do participante                  | real          |
| `score`               | `/matches/:matchId/host`, present, play | Placar atual/final na partida                 | derivado      |
| `eliminatedThisRound` | host, play, store                       | Bloqueio temporario do participante na rodada | derivado      |
| `remote`              | host, store                             | Origem do participante: remoto ou local       | real          |

### `Match`

| Campo               | Telas/componentes                                 | Significado atual                                     | Classificacao |
| ------------------- | ------------------------------------------------- | ----------------------------------------------------- | ------------- |
| `id`                | `/matches`, perguntas, host, present, play        | Identificador da partida                              | real          |
| `name`              | `/matches/new`, `/matches`, host, present, play   | Nome da partida                                       | real          |
| `maxQuestions`      | `/matches/new`, host, store                       | Limite configurado de perguntas da partida            | real          |
| `timePerQuestion`   | `/matches/new`, revisao                           | Tempo configurado por pergunta                        | real          |
| `mode`              | `/matches/new`, `/matches`, host, store           | Modo/regra da partida                                 | real          |
| `initialPoints`     | `/matches/new`, store                             | Pontuacao inicial por participante no modo especifico | real          |
| `remoteEnabled`     | `/matches/new`, host, present, store              | Se entrada remota esta habilitada                     | real          |
| `status`            | `/matches`, host, present, play, store            | Estado da partida                                     | real          |
| `questions`         | `/matches`, perguntas, host, present, play, store | Lista embutida de perguntas da partida                | real          |
| `players`           | `/matches`, host, present, play, store            | Lista embutida de participantes da partida            | real          |
| `currentQuestionId` | host, present, play, store                        | Pergunta ativa da rodada atual                        | real          |
| `currentPlayerId`   | host, present, play, store                        | Participante selecionado/ganhador do buzzer           | real          |
| `answerRevealed`    | host, present, store                              | Estado de revelacao da resposta atual                 | derivado      |
| `joinPin`           | `/matches`, host, present, play                   | PIN de entrada da partida                             | real          |
| `createdAt`         | `/matches`, store                                 | Timestamp usado para ordenar partidas                 | real          |

### `CreateMatchInput`

| Campo             | Telas/componentes           | Significado atual                   | Classificacao |
| ----------------- | --------------------------- | ----------------------------------- | ------------- |
| `name`            | `/matches/new`              | Nome informado no wizard            | real          |
| `mode`            | `/matches/new`              | Modo escolhido                      | real          |
| `maxQuestions`    | `/matches/new`              | Limite opcional de perguntas        | real          |
| `timePerQuestion` | `/matches/new`              | Tempo por pergunta                  | real          |
| `initialPoints`   | `/matches/new`              | Pontos iniciais quando o modo exige | real          |
| `remoteEnabled`   | `/matches/new`              | Habilitacao de jogadores remotos    | real          |
| `questions`       | `/matches/new`, `CsvImport` | Perguntas iniciais da partida       | real          |

### `State` e acoes do store

| Campo             | Telas/componentes                          | Significado atual                           | Classificacao   |
| ----------------- | ------------------------------------------ | ------------------------------------------- | --------------- |
| `matches`         | `/matches`, perguntas, host, present, play | Dicionario local de partidas por id         | apresentacional |
| `createMatch`     | `/matches/new`                             | Cria partida em memoria                     | real            |
| `updateMatch`     | sem uso direto nas rotas atuais            | Atualiza patch de partida                   | real            |
| `deleteMatch`     | `/matches`                                 | Remove partida local                        | real            |
| `addQuestion`     | perguntas                                  | Adiciona pergunta a partida                 | real            |
| `updateQuestion`  | perguntas                                  | Edita pergunta da partida                   | real            |
| `removeQuestion`  | perguntas                                  | Remove pergunta da partida                  | real            |
| `importQuestions` | perguntas, `CsvImport`                     | Adiciona lote de perguntas via CSV          | real            |
| `addPlayer`       | host, play                                 | Adiciona participante local/remoto          | real            |
| `removePlayer`    | host                                       | Remove participante da partida              | real            |
| `applyPenalty`    | host                                       | Ajusta placar manualmente                   | real            |
| `startMatch`      | host                                       | Muda status para em andamento               | real            |
| `drawQuestion`    | host                                       | Sorteia pergunta disponivel no cliente      | real            |
| `selectPlayer`    | host                                       | Define participante respondente             | real            |
| `buzzIn`          | play                                       | Registra buzzer ou eliminacao antecipada    | real            |
| `revealAnswer`    | host                                       | Revela resposta da rodada                   | real            |
| `registerAnswer`  | host                                       | Registra acerto/erro e marca pergunta usada | real            |
| `endMatch`        | host                                       | Encerra partida                             | real            |
| `resetMatch`      | host                                       | Reinicia estado operacional da partida      | real            |
| `resetBuzzers`    | host                                       | Libera rodada para novo buzzer              | real            |

### CSV

| Campo                       | Telas/componentes                      | Significado atual                       | Classificacao   |
| --------------------------- | -------------------------------------- | --------------------------------------- | --------------- |
| `parseCsv(text)`            | `CsvImport`, `/matches/new`, perguntas | Parser local de importacao de perguntas | apresentacional |
| CSV `pergunta` / `question` | `CsvImport`, `parseCsv`                | Coluna de texto da pergunta             | real            |
| CSV `resposta`              | `CsvImport`, `parseCsv`                | Coluna de resposta esperada             | real            |
| CSV `pontos`                | `CsvImport`, `parseCsv`                | Coluna de pontos da pergunta            | real            |

## Campos com maior risco de denormalizacao

- `Room.gameName`, `History Match.gameName`, `History Match.room`, `Room.host`:
  devem virar relacionamentos ou snapshots claros, nao strings como fonte primaria.
- `Player.points`, `Player.matches`, `Player.level`, `Game.players`,
  `Room.participants`, `History Match.players`, `History Match.duration`,
  `History Match.winner`, `Room.startedMinutesAgo`: devem ser derivados de
  partidas, participantes, presenca, respostas e eventos de pontuacao.
- `Game.icon`, `Game.iconColor`, `Player.initials`, `Player.color`,
  `History Match.date`, labels de status/modo e `statusLabel`: pertencem a UI ou
  DTO de exibicao, nao ao nucleo do banco.
- `Match.questions` e `Match.players` hoje sao arrays embutidos por conveniencia
  do store; no backend devem ser tabelas relacionadas, como indicado no
  `ARCHITECTURE_PLAN.md`.
