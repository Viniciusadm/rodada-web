# HolyPlay Backend Architecture Plan

## 1. Visao Geral Do Frontend Atual

O projeto atual e um frontend React mockado para o produto **HolyPlay**, um hub de jogos cristaos para igrejas, ministerios e pequenos grupos. A aplicacao usa React 19, TanStack Router, TanStack Query, Vite/TanStack Start, Tailwind CSS, Radix UI e Zustand.

Nao existe backend real no repositorio. Os dados estao concentrados em dois pontos:

- `src/lib/mock-data.ts`: mocks estaticos para biblioteca de jogos, jogadores, salas ao vivo e historico.
- `src/lib/match-store.ts`: store Zustand em memoria para criar e conduzir partidas, perguntas, jogadores, placar e buzzer remoto.

As rotas atuais indicam os fluxos reais desejados:

- `/`: dashboard com jogos disponiveis, ranking mensal e salas ao vivo.
- `/games`: biblioteca de jogos.
- `/matches`: listagem de partidas criadas localmente.
- `/matches/new`: wizard para criar partida com regras, perguntas e revisao.
- `/matches/:matchId/questions`: CRUD de perguntas da partida e importacao CSV.
- `/matches/:matchId/host`: painel do anfitriao para adicionar/remover jogadores, iniciar, sortear pergunta, revelar resposta, registrar acerto/erro, ajustar pontos, resetar buzzers, encerrar e resetar partida.
- `/matches/:matchId/present`: tela de apresentacao em fullscreen para publico/projecao.
- `/play/:matchId`: tela do jogador remoto para entrar, aguardar inicio e usar buzzer.
- `/rooms`: cards de salas ao vivo com PIN, anfitriao, capacidade e participantes.
- `/ranking`: ranking mensal com podio e lista.
- `/players`: cadastro visual/listagem de jogadores.
- `/history`: historico de partidas encerradas.
- `/settings`: preferencias da igreja, aparencia e notificacoes.

O estado atual e suficiente para inferir entidades, fluxos e intencoes, mas nao deve ser tratado como contrato de dados. Alguns mocks duplicam campos que em um sistema real devem ser derivados, relacionados por chave estrangeira ou calculados por agregacao.

## 2. Entidades Inferidas Pelas Telas

### Entidades Organizacionais

- **Organization**: a igreja/tenant atual, hoje visivel como "Igreja Betel".
- **Ministry**: agrupamento interno como Jovens, Louvor, EBD, Kids, Diaconia, Midia e Adolescentes.
- **User**: conta autenticada para lideres, anfitrioes e eventualmente jogadores.
- **Role**: autorizacao por organizacao, como owner, admin, host e member.
- **Notification Preference**: preferencias de notificacao por usuario.

### Entidades De Jogo

- **Game**: item do catalogo, como Quiz Biblico, Versiculo Completo ou Verdadeiro/Falso.
- **Game Mode**: modo de partida, hoje inferido como classico, pontos iniciais e eliminacao.
- **Question Bank**: banco reutilizavel de perguntas por organizacao e jogo.
- **Question**: pergunta, resposta esperada e pontos padrao.
- **CSV Import**: operacao de importacao de perguntas; nao e uma entidade central, mas exige validacao e relatorio de importacao.

### Entidades De Partida

- **Match**: partida configurada e conduzida por um host.
- **Match Settings**: regras da partida, como quantidade maxima de perguntas, tempo por pergunta, pontos iniciais e participacao remota.
- **Match Question**: snapshot da pergunta dentro da partida, porque a pergunta original pode mudar depois.
- **Match Participant**: jogador dentro de uma partida, com score e estado naquela partida.
- **Match Round**: rodada/pergunta sorteada.
- **Match Answer**: registro de resposta correta/incorreta, jogador respondente e pontuacao aplicada.
- **Score Event**: trilha auditavel para ajustes, acertos, erros e penalidades.
- **Room Session**: sala ao vivo associada a uma partida ativa, com PIN e capacidade.
- **Presence Session**: conexao ativa de host, presenter ou player.

### Entidades De Consulta/Derivadas

- **Ranking**: agregado por periodo, organizacao, jogador, jogo e/ou ministerio.
- **History Entry**: visao de partidas encerradas.
- **Live Room Card**: visao derivada de partida/sala/presenca.
- **Dashboard Stats**: totais e recortes para a home.

Essas entidades derivadas nao devem virar tabelas primarias quando puderem ser calculadas de `matches`, `match_participants`, `match_rounds`, `match_answers` e `score_events`.

## 3. Diagnostico Dos Mocks

### `src/lib/mock-data.ts`

Contem quatro colecoes principais:

- `games`: inclui `id`, `name`, `description`, `icon`, `iconColor`, `status` e `players`.
- `players`: inclui `id`, `name`, `initials`, `ministry`, `points`, `matches`, `level` e `color`.
- `rooms`: inclui `id`, `name`, `gameId`, `gameName`, `pin`, `participants`, `capacity`, `host` e `startedMinutesAgo`.
- `matches`: inclui `id`, `gameName`, `room`, `date`, `players`, `winner` e `duration`.

Problemas principais:

- `gameName` duplica `games.name`.
- `host` e `winner` sao nomes textuais, nao relacoes com usuarios/jogadores.
- `participants`, `players`, `matches`, `points`, `level`, `duration` e `startedMinutesAgo` sao dados calculados.
- `initials` e `color` sao apresentacao derivada/preferencia visual, nao dado central do dominio.
- `date` esta em formato textual local e deve virar timestamp UTC no backend.
- `room` aparece como string no historico, mas deve ser match, room session ou nome/snapshot da sala.
- `players` dentro de `games` representa popularidade/total agregado, nao deve ser mantido manualmente no catalogo.

### `src/lib/match-store.ts`

Contem o estado operacional mais proximo do dominio real:

- `Match`: `id`, `name`, `mode`, `maxQuestions`, `timePerQuestion`, `initialPoints`, `remoteEnabled`, `status`, `questions`, `players`, `currentQuestionId`, `currentPlayerId`, `answerRevealed`, `joinPin`, `createdAt`.
- `Question`: `id`, `text`, `answer`, `points`, `used`.
- `MatchPlayer`: `id`, `name`, `score`, `eliminatedThisRound`, `remote`.
- Acoes: criar/editar/excluir partida, importar perguntas, adicionar/remover jogador, iniciar, sortear, selecionar jogador, buzz, revelar resposta, registrar resposta, encerrar, resetar partida e resetar buzzers.

Problemas principais:

- Partida, perguntas e jogadores estao embutidos em um unico objeto em memoria.
- `used`, `currentQuestionId`, `currentPlayerId`, `answerRevealed` e `eliminatedThisRound` misturam estado operacional com dados persistentes.
- O sorteio de pergunta e feito no cliente; em producao deve ser deciso pelo backend para impedir divergencia entre host, presentation e players.
- O buzzer e local; em producao exige ordenacao temporal, broadcast e protecao contra dupla submissao.
- Nao ha autenticacao, autorizacao, concorrencia, persistencia, auditoria ou reconexao.

## 4. Normalization Audit

| Problema encontrado                        | Origem                      | Diagnostico                                              | Solucao proposta                                                                                                                                                     |
| ------------------------------------------ | --------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gameName` repetido em salas e historico   | `rooms`, `matches`          | Nome duplicado e sujeito a divergencia                   | Persistir `game_id`; retornar `game.name` via join/DTO                                                                                                               |
| `host` como string                         | `rooms`                     | Anfitriao e uma pessoa/usuario                           | Usar `matches.host_user_id` referenciando `users.id`                                                                                                                 |
| `winner` como string                       | `matches`                   | Vencedor e resultado derivado do placar                  | Calcular por `match_participants.final_score`; opcionalmente gravar `winner_participant_id` ao encerrar como snapshot auditavel                                      |
| `participants` e `players` como contadores | `rooms`, `matches`, `games` | Contadores agregados                                     | Calcular com `COUNT(*)` em participantes/presenca/partidas                                                                                                           |
| `points`, `matches` e `level` em player    | `players`                   | Agregados por periodo e historico                        | Calcular por `score_events` e `match_participants`; `level` deriva de regra de progressao                                                                            |
| `initials`                                 | `players`                   | Valor de exibicao                                        | Gerar no frontend/backend a partir do nome ou armazenar como preferencia opcional se editavel                                                                        |
| `color`, `iconColor`                       | `players`, `games`          | Estilo visual do frontend                                | Preferir tokens de tema opcionais; nao acoplar dominio a classes CSS                                                                                                 |
| `startedMinutesAgo`                        | `rooms`                     | Tempo relativo calculado                                 | Persistir `started_at`; calcular no DTO/frontend                                                                                                                     |
| `duration`                                 | `matches`                   | Duracao calculada                                        | Persistir `started_at` e `ended_at`; calcular duracao                                                                                                                |
| `date` textual                             | `matches`                   | Formato localizado de apresentacao                       | Persistir `created_at`, `started_at`, `ended_at` em UTC                                                                                                              |
| Perguntas embutidas na partida             | `match-store`               | Reutilizacao e auditoria dificeis                        | Criar `questions` e `match_questions`                                                                                                                                |
| Jogadores embutidos na partida             | `match-store`               | N:N entre partidas e jogadores                           | Criar `players` e pivot `match_participants`                                                                                                                         |
| `used` em pergunta                         | `match-store`               | Estado da pergunta dentro da partida                     | Mover para `match_questions.used_at` ou para `match_rounds`                                                                                                          |
| `currentQuestionId`                        | `match-store`               | Estado ativo da rodada                                   | Persistir em `matches.current_round_id` ou derivar da rodada aberta                                                                                                  |
| `currentPlayerId`                          | `match-store`               | Participante selecionado na rodada                       | Persistir em `match_rounds.selected_participant_id`                                                                                                                  |
| `answerRevealed`                           | `match-store`               | Estado da rodada atual                                   | Persistir em `match_rounds.answer_revealed_at`                                                                                                                       |
| `eliminatedThisRound`                      | `match-store`               | Estado temporario por rodada                             | Persistir em `match_round_participant_states` somente se a regra de eliminacao exigir historico; para v1 pode ser `match_participants.eliminated_round_id` ou evento |
| `remote` no player                         | `match-store`               | Origem do participante na partida, nao do jogador global | Usar `match_participants.join_source`                                                                                                                                |
| PIN em varias telas                        | `rooms`, `match-store`      | Codigo de entrada da sala                                | Persistir `matches.join_pin_hash` ou `join_pin` com unicidade entre partidas ativas; nao expor em logs                                                               |
| Sala e partida misturadas                  | `rooms`, `matches`          | Sala ao vivo e uma visao do estado da partida            | Criar `room_sessions` 1:1 com partida ativa                                                                                                                          |
| Ranking mensal mockado                     | `ranking`                   | Ranking e consulta agregada por periodo                  | API `GET /rankings` calculada por score events/partidas encerradas                                                                                                   |
| Configuracoes de igreja mockadas           | `settings`                  | Dados reais de tenant                                    | Persistir em `organizations`, `notification_preferences` e preferencias locais de tema                                                                               |

Decisao arquitetural: quando houver conflito entre a estrutura mockada e uma modelagem normalizada, a modelagem normalizada prevalece. O frontend deve receber DTOs convenientes para tela, mas o banco deve manter relacoes e fontes de verdade separadas.

## 5. Modelagem Final Do Banco MySQL

### Convencoes Gerais

- Banco: MySQL 8 ou superior.
- Driver: SQLx MySQL.
- Nomes: ingles, snake_case, plural para tabelas.
- IDs: `CHAR(36)` com UUID textual para simplicidade com SQLx e interoperabilidade.
- Datas: `DATETIME(6)` em UTC.
- Timestamps padrao em todas as tabelas: `created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` e `updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`.
- Soft delete apenas quando necessario: `deleted_at DATETIME(6) NULL`.
- Sem colunas JSON.
- Sem arrays.
- Sem listas serializadas.
- Sem campos multiuso.
- N:N sempre via tabela pivot.
- Campos derivados nao devem ser persistidos, exceto snapshots necessarios para auditoria.
- Enums devem ser `VARCHAR` com validacao na camada Rust. `CHECK` pode ser usado se a versao MySQL alvo suportar, mas a aplicacao continua sendo a fonte de validacao.

### `organizations`

Finalidade: representa igrejas/tenants.

Campos:

| Campo           | Tipo           | Regras                                        |
| --------------- | -------------- | --------------------------------------------- |
| `id`            | `CHAR(36)`     | PK                                            |
| `name`          | `VARCHAR(160)` | NOT NULL                                      |
| `slug`          | `VARCHAR(120)` | NOT NULL, UNIQUE                              |
| `contact_email` | `VARCHAR(255)` | NULL                                          |
| `owner_user_id` | `CHAR(36)`     | NULL, FK para `users.id` apos criacao inicial |
| `created_at`    | `DATETIME(6)`  | NOT NULL, default                             |
| `updated_at`    | `DATETIME(6)`  | NOT NULL, default/on update                   |

Indices:

- `PRIMARY KEY (id)`
- `UNIQUE KEY organizations_slug_unique (slug)`
- `KEY organizations_owner_user_id_idx (owner_user_id)`

Relacionamentos:

- 1:N com `ministries`, `players`, `games` customizados se existirem, `matches`, `question_banks`.
- N:N indireto com `users` via `user_roles`.

### `users`

Finalidade: contas autenticadas para administradores, hosts e jogadores logados.

Campos:

| Campo           | Tipo           | Regras                |
| --------------- | -------------- | --------------------- |
| `id`            | `CHAR(36)`     | PK                    |
| `email`         | `VARCHAR(255)` | NOT NULL, UNIQUE      |
| `password_hash` | `VARCHAR(255)` | NOT NULL              |
| `display_name`  | `VARCHAR(140)` | NOT NULL              |
| `is_active`     | `BOOLEAN`      | NOT NULL DEFAULT TRUE |
| `last_login_at` | `DATETIME(6)`  | NULL                  |
| `created_at`    | `DATETIME(6)`  | NOT NULL              |
| `updated_at`    | `DATETIME(6)`  | NOT NULL              |

Indices:

- `PRIMARY KEY (id)`
- `UNIQUE KEY users_email_unique (email)`

Relacionamentos:

- 1:N com `user_roles`, `matches.host_user_id`, `presence_sessions`.
- 1:1 opcional com `players.user_id`.

### `user_roles`

Finalidade: define permissoes do usuario dentro de uma organizacao.

Campos:

| Campo             | Tipo          | Regras                                       |
| ----------------- | ------------- | -------------------------------------------- |
| `id`              | `CHAR(36)`    | PK                                           |
| `organization_id` | `CHAR(36)`    | NOT NULL, FK                                 |
| `user_id`         | `CHAR(36)`    | NOT NULL, FK                                 |
| `role`            | `VARCHAR(40)` | NOT NULL: `owner`, `admin`, `host`, `member` |
| `created_at`      | `DATETIME(6)` | NOT NULL                                     |
| `updated_at`      | `DATETIME(6)` | NOT NULL                                     |

Indices:

- `UNIQUE KEY user_roles_org_user_role_unique (organization_id, user_id, role)`
- `KEY user_roles_user_id_idx (user_id)`
- `KEY user_roles_org_role_idx (organization_id, role)`

Relacionamentos:

- Pivot entre `organizations` e `users`.

### `ministries`

Finalidade: grupos internos da organizacao.

Campos:

| Campo             | Tipo           | Regras                |
| ----------------- | -------------- | --------------------- |
| `id`              | `CHAR(36)`     | PK                    |
| `organization_id` | `CHAR(36)`     | NOT NULL, FK          |
| `name`            | `VARCHAR(120)` | NOT NULL              |
| `slug`            | `VARCHAR(120)` | NOT NULL              |
| `is_active`       | `BOOLEAN`      | NOT NULL DEFAULT TRUE |
| `created_at`      | `DATETIME(6)`  | NOT NULL              |
| `updated_at`      | `DATETIME(6)`  | NOT NULL              |

Indices:

- `UNIQUE KEY ministries_org_slug_unique (organization_id, slug)`
- `KEY ministries_org_active_idx (organization_id, is_active)`

Relacionamentos:

- 1:N com `players`.

### `players`

Finalidade: perfil jogavel dentro de uma organizacao.

Campos:

| Campo             | Tipo           | Regras                                        |
| ----------------- | -------------- | --------------------------------------------- |
| `id`              | `CHAR(36)`     | PK                                            |
| `organization_id` | `CHAR(36)`     | NOT NULL, FK                                  |
| `user_id`         | `CHAR(36)`     | NULL, FK                                      |
| `ministry_id`     | `CHAR(36)`     | NULL, FK                                      |
| `display_name`    | `VARCHAR(140)` | NOT NULL                                      |
| `normalized_name` | `VARCHAR(160)` | NOT NULL                                      |
| `avatar_token`    | `VARCHAR(80)`  | NULL, token visual opcional, nunca classe CSS |
| `is_active`       | `BOOLEAN`      | NOT NULL DEFAULT TRUE                         |
| `created_at`      | `DATETIME(6)`  | NOT NULL                                      |
| `updated_at`      | `DATETIME(6)`  | NOT NULL                                      |

Indices:

- `UNIQUE KEY players_org_normalized_name_unique (organization_id, normalized_name)`
- `UNIQUE KEY players_user_unique (user_id)`
- `KEY players_org_ministry_idx (organization_id, ministry_id)`
- `KEY players_org_active_idx (organization_id, is_active)`

Relacionamentos:

- N:1 com `organizations`, `ministries`, `users`.
- 1:N com `match_participants`.

Nao persistir aqui:

- Pontos totais, partidas jogadas, ranking, nivel e iniciais. Esses valores sao derivados.

### `games`

Finalidade: catalogo de jogos disponiveis.

Campos:

| Campo         | Tipo           | Regras                                                   |
| ------------- | -------------- | -------------------------------------------------------- |
| `id`          | `CHAR(36)`     | PK                                                       |
| `slug`        | `VARCHAR(120)` | NOT NULL, UNIQUE                                         |
| `name`        | `VARCHAR(140)` | NOT NULL                                                 |
| `description` | `TEXT`         | NOT NULL                                                 |
| `status`      | `VARCHAR(40)`  | NOT NULL: `active`, `beta`, `maintenance`, `coming_soon` |
| `icon_key`    | `VARCHAR(80)`  | NULL, nome logico do icone                               |
| `sort_order`  | `INT`          | NOT NULL DEFAULT 0                                       |
| `created_at`  | `DATETIME(6)`  | NOT NULL                                                 |
| `updated_at`  | `DATETIME(6)`  | NOT NULL                                                 |

Indices:

- `UNIQUE KEY games_slug_unique (slug)`
- `KEY games_status_sort_idx (status, sort_order)`

Relacionamentos:

- 1:N com `game_modes`, `question_banks`, `matches`.

Nao persistir aqui:

- Total de jogadores do card. Calcular por partidas/participantes.
- Classes Tailwind de cor. Usar `icon_key` e tokens no frontend.

### `game_modes`

Finalidade: modos suportados por jogo e suas regras padrao.

Campos:

| Campo                               | Tipo           | Regras                                               |
| ----------------------------------- | -------------- | ---------------------------------------------------- |
| `id`                                | `CHAR(36)`     | PK                                                   |
| `game_id`                           | `CHAR(36)`     | NOT NULL, FK                                         |
| `code`                              | `VARCHAR(60)`  | NOT NULL: `classic`, `initial_points`, `elimination` |
| `name`                              | `VARCHAR(120)` | NOT NULL                                             |
| `description`                       | `TEXT`         | NULL                                                 |
| `default_initial_points`            | `INT`          | NULL                                                 |
| `default_time_per_question_seconds` | `INT`          | NULL                                                 |
| `is_active`                         | `BOOLEAN`      | NOT NULL DEFAULT TRUE                                |
| `created_at`                        | `DATETIME(6)`  | NOT NULL                                             |
| `updated_at`                        | `DATETIME(6)`  | NOT NULL                                             |

Indices:

- `UNIQUE KEY game_modes_game_code_unique (game_id, code)`
- `KEY game_modes_game_active_idx (game_id, is_active)`

Relacionamentos:

- N:1 com `games`.
- 1:N com `matches`.

### `question_banks`

Finalidade: colecoes reutilizaveis de perguntas.

Campos:

| Campo                | Tipo           | Regras       |
| -------------------- | -------------- | ------------ |
| `id`                 | `CHAR(36)`     | PK           |
| `organization_id`    | `CHAR(36)`     | NOT NULL, FK |
| `game_id`            | `CHAR(36)`     | NOT NULL, FK |
| `name`               | `VARCHAR(160)` | NOT NULL     |
| `description`        | `TEXT`         | NULL         |
| `created_by_user_id` | `CHAR(36)`     | NOT NULL, FK |
| `created_at`         | `DATETIME(6)`  | NOT NULL     |
| `updated_at`         | `DATETIME(6)`  | NOT NULL     |

Indices:

- `KEY question_banks_org_game_idx (organization_id, game_id)`
- `KEY question_banks_created_by_idx (created_by_user_id)`

Relacionamentos:

- N:1 com `organizations`, `games`, `users`.
- 1:N com `questions`.

### `questions`

Finalidade: pergunta reutilizavel em um banco.

Campos:

| Campo              | Tipo          | Regras                |
| ------------------ | ------------- | --------------------- |
| `id`               | `CHAR(36)`    | PK                    |
| `question_bank_id` | `CHAR(36)`    | NOT NULL, FK          |
| `prompt`           | `TEXT`        | NOT NULL              |
| `expected_answer`  | `TEXT`        | NOT NULL              |
| `default_points`   | `INT`         | NOT NULL DEFAULT 100  |
| `difficulty`       | `VARCHAR(40)` | NULL                  |
| `is_active`        | `BOOLEAN`     | NOT NULL DEFAULT TRUE |
| `created_at`       | `DATETIME(6)` | NOT NULL              |
| `updated_at`       | `DATETIME(6)` | NOT NULL              |

Indices:

- `KEY questions_bank_active_idx (question_bank_id, is_active)`

Relacionamentos:

- N:1 com `question_banks`.
- 1:N com `match_questions`.

### `matches`

Finalidade: partida criada e conduzida por um host.

Campos:

| Campo                   | Tipo           | Regras                                                   |
| ----------------------- | -------------- | -------------------------------------------------------- |
| `id`                    | `CHAR(36)`     | PK                                                       |
| `organization_id`       | `CHAR(36)`     | NOT NULL, FK                                             |
| `game_id`               | `CHAR(36)`     | NOT NULL, FK                                             |
| `game_mode_id`          | `CHAR(36)`     | NOT NULL, FK                                             |
| `host_user_id`          | `CHAR(36)`     | NOT NULL, FK                                             |
| `name`                  | `VARCHAR(180)` | NOT NULL                                                 |
| `status`                | `VARCHAR(40)`  | NOT NULL: `waiting`, `in_progress`, `ended`, `cancelled` |
| `join_pin`              | `VARCHAR(12)`  | NOT NULL                                                 |
| `current_round_id`      | `CHAR(36)`     | NULL, FK para `match_rounds.id` apos criacao             |
| `winner_participant_id` | `CHAR(36)`     | NULL, FK para `match_participants.id` ao encerrar        |
| `started_at`            | `DATETIME(6)`  | NULL                                                     |
| `ended_at`              | `DATETIME(6)`  | NULL                                                     |
| `created_at`            | `DATETIME(6)`  | NOT NULL                                                 |
| `updated_at`            | `DATETIME(6)`  | NOT NULL                                                 |

Indices:

- `KEY matches_org_status_created_idx (organization_id, status, created_at)`
- `KEY matches_org_game_created_idx (organization_id, game_id, created_at)`
- `KEY matches_host_created_idx (host_user_id, created_at)`
- `UNIQUE KEY matches_join_pin_active_unique (join_pin, status)` se o produto aceitar unicidade por status; alternativa melhor e validar unicidade de PIN entre `waiting` e `in_progress` na aplicacao durante criacao/rotacao.

Relacionamentos:

- N:1 com `organizations`, `games`, `game_modes`, `users`.
- 1:1 com `match_settings` e `room_sessions`.
- 1:N com `match_questions`, `match_participants`, `match_rounds`, `score_events`.

### `match_settings`

Finalidade: regras configuraveis da partida.

Campos:

| Campo                       | Tipo          | Regras                |
| --------------------------- | ------------- | --------------------- |
| `match_id`                  | `CHAR(36)`    | PK, FK                |
| `max_questions`             | `INT`         | NULL                  |
| `time_per_question_seconds` | `INT`         | NULL                  |
| `initial_points`            | `INT`         | NULL                  |
| `remote_enabled`            | `BOOLEAN`     | NOT NULL DEFAULT TRUE |
| `capacity`                  | `INT`         | NOT NULL DEFAULT 100  |
| `created_at`                | `DATETIME(6)` | NOT NULL              |
| `updated_at`                | `DATETIME(6)` | NOT NULL              |

Indices:

- `PRIMARY KEY (match_id)`

Constraints:

- `max_questions` deve ser maior que zero quando presente.
- `time_per_question_seconds` deve ser maior que zero quando presente.
- `capacity` deve ser maior que zero.

Relacionamentos:

- 1:1 com `matches`.

### `match_questions`

Finalidade: snapshot da pergunta usada em uma partida.

Campos:

| Campo                      | Tipo          | Regras                       |
| -------------------------- | ------------- | ---------------------------- |
| `id`                       | `CHAR(36)`    | PK                           |
| `match_id`                 | `CHAR(36)`    | NOT NULL, FK                 |
| `source_question_id`       | `CHAR(36)`    | NULL, FK para `questions.id` |
| `position`                 | `INT`         | NOT NULL                     |
| `prompt_snapshot`          | `TEXT`        | NOT NULL                     |
| `expected_answer_snapshot` | `TEXT`        | NOT NULL                     |
| `points`                   | `INT`         | NOT NULL                     |
| `used_at`                  | `DATETIME(6)` | NULL                         |
| `created_at`               | `DATETIME(6)` | NOT NULL                     |
| `updated_at`               | `DATETIME(6)` | NOT NULL                     |

Indices:

- `UNIQUE KEY match_questions_match_position_unique (match_id, position)`
- `KEY match_questions_match_used_idx (match_id, used_at)`
- `KEY match_questions_source_question_idx (source_question_id)`

Relacionamentos:

- N:1 com `matches`.
- N:1 opcional com `questions`.
- 1:N com `match_rounds`.

Justificativa: snapshot impede que editar uma pergunta global altere historico ou uma partida em andamento.

### `match_participants`

Finalidade: pivot entre partida e jogador, com estado e placar da partida.

Campos:

| Campo                      | Tipo           | Regras                     |
| -------------------------- | -------------- | -------------------------- |
| `id`                       | `CHAR(36)`     | PK                         |
| `match_id`                 | `CHAR(36)`     | NOT NULL, FK               |
| `player_id`                | `CHAR(36)`     | NULL, FK                   |
| `display_name_snapshot`    | `VARCHAR(140)` | NOT NULL                   |
| `normalized_name_snapshot` | `VARCHAR(160)` | NOT NULL                   |
| `join_source`              | `VARCHAR(40)`  | NOT NULL: `host`, `remote` |
| `current_score`            | `INT`          | NOT NULL DEFAULT 0         |
| `is_connected`             | `BOOLEAN`      | NOT NULL DEFAULT FALSE     |
| `joined_at`                | `DATETIME(6)`  | NOT NULL                   |
| `left_at`                  | `DATETIME(6)`  | NULL                       |
| `created_at`               | `DATETIME(6)`  | NOT NULL                   |
| `updated_at`               | `DATETIME(6)`  | NOT NULL                   |

Indices:

- `UNIQUE KEY match_participants_match_name_unique (match_id, normalized_name_snapshot)`
- `KEY match_participants_match_score_idx (match_id, current_score)`
- `KEY match_participants_player_idx (player_id)`

Relacionamentos:

- N:1 com `matches`.
- N:1 opcional com `players`.
- 1:N com `match_answers`, `score_events`, `presence_sessions`.

### `match_rounds`

Finalidade: rodada ativa ou concluida de uma pergunta sorteada.

Campos:

| Campo                     | Tipo          | Regras                                            |
| ------------------------- | ------------- | ------------------------------------------------- |
| `id`                      | `CHAR(36)`    | PK                                                |
| `match_id`                | `CHAR(36)`    | NOT NULL, FK                                      |
| `match_question_id`       | `CHAR(36)`    | NOT NULL, FK                                      |
| `round_number`            | `INT`         | NOT NULL                                          |
| `status`                  | `VARCHAR(40)` | NOT NULL: `open`, `answered`, `skipped`, `closed` |
| `selected_participant_id` | `CHAR(36)`    | NULL, FK                                          |
| `answer_revealed_at`      | `DATETIME(6)` | NULL                                              |
| `opened_at`               | `DATETIME(6)` | NOT NULL                                          |
| `closed_at`               | `DATETIME(6)` | NULL                                              |
| `created_at`              | `DATETIME(6)` | NOT NULL                                          |
| `updated_at`              | `DATETIME(6)` | NOT NULL                                          |

Indices:

- `UNIQUE KEY match_rounds_match_round_number_unique (match_id, round_number)`
- `KEY match_rounds_match_status_idx (match_id, status)`
- `KEY match_rounds_question_idx (match_question_id)`
- `KEY match_rounds_selected_participant_idx (selected_participant_id)`

Relacionamentos:

- N:1 com `matches`, `match_questions`, `match_participants`.
- 1:N com `match_answers`.

### `match_answers`

Finalidade: resposta registrada em uma rodada.

Campos:

| Campo            | Tipo          | Regras             |
| ---------------- | ------------- | ------------------ |
| `id`             | `CHAR(36)`    | PK                 |
| `match_id`       | `CHAR(36)`    | NOT NULL, FK       |
| `match_round_id` | `CHAR(36)`    | NOT NULL, FK       |
| `participant_id` | `CHAR(36)`    | NOT NULL, FK       |
| `is_correct`     | `BOOLEAN`     | NOT NULL           |
| `points_awarded` | `INT`         | NOT NULL DEFAULT 0 |
| `answered_at`    | `DATETIME(6)` | NOT NULL           |
| `created_at`     | `DATETIME(6)` | NOT NULL           |
| `updated_at`     | `DATETIME(6)` | NOT NULL           |

Indices:

- `UNIQUE KEY match_answers_round_participant_unique (match_round_id, participant_id)`
- `KEY match_answers_match_participant_idx (match_id, participant_id)`

Relacionamentos:

- N:1 com `matches`, `match_rounds`, `match_participants`.

### `score_events`

Finalidade: trilha auditavel de toda mudanca de score.

Campos:

| Campo            | Tipo           | Regras                                                                                                    |
| ---------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| `id`             | `CHAR(36)`     | PK                                                                                                        |
| `match_id`       | `CHAR(36)`     | NOT NULL, FK                                                                                              |
| `participant_id` | `CHAR(36)`     | NOT NULL, FK                                                                                              |
| `match_round_id` | `CHAR(36)`     | NULL, FK                                                                                                  |
| `actor_user_id`  | `CHAR(36)`     | NULL, FK                                                                                                  |
| `event_type`     | `VARCHAR(50)`  | NOT NULL: `initial_points`, `correct_answer`, `incorrect_answer`, `manual_adjustment`, `penalty`, `reset` |
| `delta`          | `INT`          | NOT NULL                                                                                                  |
| `score_after`    | `INT`          | NOT NULL                                                                                                  |
| `reason`         | `VARCHAR(255)` | NULL                                                                                                      |
| `created_at`     | `DATETIME(6)`  | NOT NULL                                                                                                  |
| `updated_at`     | `DATETIME(6)`  | NOT NULL                                                                                                  |

Indices:

- `KEY score_events_match_created_idx (match_id, created_at)`
- `KEY score_events_participant_created_idx (participant_id, created_at)`
- `KEY score_events_actor_idx (actor_user_id)`

Relacionamentos:

- N:1 com `matches`, `match_participants`, `match_rounds`, `users`.

Justificativa: `match_participants.current_score` e leitura rapida; `score_events` e a fonte auditavel para recalculo e ranking.

### `room_sessions`

Finalidade: sala ao vivo associada a uma partida.

Campos:

| Campo             | Tipo          | Regras                     |
| ----------------- | ------------- | -------------------------- |
| `id`              | `CHAR(36)`    | PK                         |
| `match_id`        | `CHAR(36)`    | NOT NULL, UNIQUE, FK       |
| `organization_id` | `CHAR(36)`    | NOT NULL, FK               |
| `status`          | `VARCHAR(40)` | NOT NULL: `open`, `closed` |
| `capacity`        | `INT`         | NOT NULL                   |
| `opened_at`       | `DATETIME(6)` | NOT NULL                   |
| `closed_at`       | `DATETIME(6)` | NULL                       |
| `created_at`      | `DATETIME(6)` | NOT NULL                   |
| `updated_at`      | `DATETIME(6)` | NOT NULL                   |

Indices:

- `UNIQUE KEY room_sessions_match_unique (match_id)`
- `KEY room_sessions_org_status_opened_idx (organization_id, status, opened_at)`

Relacionamentos:

- 1:1 com `matches`.
- N:1 com `organizations`.

### `presence_sessions`

Finalidade: conexoes ativas para realtime/presenca.

Campos:

| Campo             | Tipo           | Regras                                            |
| ----------------- | -------------- | ------------------------------------------------- |
| `id`              | `CHAR(36)`     | PK                                                |
| `organization_id` | `CHAR(36)`     | NOT NULL, FK                                      |
| `match_id`        | `CHAR(36)`     | NULL, FK                                          |
| `user_id`         | `CHAR(36)`     | NULL, FK                                          |
| `participant_id`  | `CHAR(36)`     | NULL, FK                                          |
| `connection_role` | `VARCHAR(40)`  | NOT NULL: `host`, `presenter`, `player`, `viewer` |
| `connection_id`   | `VARCHAR(120)` | NOT NULL                                          |
| `connected_at`    | `DATETIME(6)`  | NOT NULL                                          |
| `last_seen_at`    | `DATETIME(6)`  | NOT NULL                                          |
| `disconnected_at` | `DATETIME(6)`  | NULL                                              |
| `created_at`      | `DATETIME(6)`  | NOT NULL                                          |
| `updated_at`      | `DATETIME(6)`  | NOT NULL                                          |

Indices:

- `UNIQUE KEY presence_sessions_connection_unique (connection_id)`
- `KEY presence_sessions_match_active_idx (match_id, disconnected_at)`
- `KEY presence_sessions_org_active_idx (organization_id, disconnected_at)`
- `KEY presence_sessions_participant_idx (participant_id)`

Relacionamentos:

- N:1 com `organizations`, `matches`, `users`, `match_participants`.

Nota: para v1, presenca pode ser mantida em memoria e persistida somente para auditoria/debug. A tabela ainda define o contrato futuro sem exigir Redis no primeiro release.

### `notification_preferences`

Finalidade: preferencias de notificacao por usuario e organizacao.

Campos:

| Campo             | Tipo          | Regras                                                     |
| ----------------- | ------------- | ---------------------------------------------------------- |
| `id`              | `CHAR(36)`    | PK                                                         |
| `organization_id` | `CHAR(36)`    | NOT NULL, FK                                               |
| `user_id`         | `CHAR(36)`    | NOT NULL, FK                                               |
| `preference_key`  | `VARCHAR(80)` | NOT NULL: `new_rooms`, `ranking_updates`, `weekly_summary` |
| `enabled`         | `BOOLEAN`     | NOT NULL DEFAULT TRUE                                      |
| `created_at`      | `DATETIME(6)` | NOT NULL                                                   |
| `updated_at`      | `DATETIME(6)` | NOT NULL                                                   |

Indices:

- `UNIQUE KEY notification_preferences_user_key_unique (organization_id, user_id, preference_key)`
- `KEY notification_preferences_user_idx (user_id)`

Relacionamentos:

- N:1 com `organizations` e `users`.

### `notifications`

Finalidade: notificacoes persistidas para bell/inbox quando necessario.

Campos:

| Campo             | Tipo           | Regras       |
| ----------------- | -------------- | ------------ |
| `id`              | `CHAR(36)`     | PK           |
| `organization_id` | `CHAR(36)`     | NOT NULL, FK |
| `user_id`         | `CHAR(36)`     | NOT NULL, FK |
| `type`            | `VARCHAR(80)`  | NOT NULL     |
| `title`           | `VARCHAR(160)` | NOT NULL     |
| `body`            | `VARCHAR(500)` | NOT NULL     |
| `resource_type`   | `VARCHAR(80)`  | NULL         |
| `resource_id`     | `CHAR(36)`     | NULL         |
| `read_at`         | `DATETIME(6)`  | NULL         |
| `created_at`      | `DATETIME(6)`  | NOT NULL     |
| `updated_at`      | `DATETIME(6)`  | NOT NULL     |

Indices:

- `KEY notifications_user_read_created_idx (user_id, read_at, created_at)`
- `KEY notifications_org_created_idx (organization_id, created_at)`

Relacionamentos:

- N:1 com `organizations` e `users`.

Nota: `resource_type` e `resource_id` sao aceitaveis como referencia polimorfica leve para notificacao, mas nao devem virar campo multiuso de dominio. Eles servem apenas para navegacao de UI.

## 6. Diagrama Textual Dos Relacionamentos

```text
organizations
  1 -- N ministries
  1 -- N players
  1 -- N question_banks
  1 -- N matches
  1 -- N room_sessions
  1 -- N notification_preferences
  N -- N users via user_roles

users
  1 -- N user_roles
  1 -- N hosted matches
  1 -- 0..1 players
  1 -- N notification_preferences

games
  1 -- N game_modes
  1 -- N question_banks
  1 -- N matches

question_banks
  1 -- N questions

matches
  1 -- 1 match_settings
  1 -- 1 room_sessions
  1 -- N match_questions
  1 -- N match_participants
  1 -- N match_rounds
  1 -- N score_events

questions
  1 -- N match_questions as source snapshots

players
  1 -- N match_participants

match_questions
  1 -- N match_rounds

match_participants
  1 -- N match_answers
  1 -- N score_events
  1 -- N presence_sessions

match_rounds
  1 -- N match_answers
  1 -- N score_events
```

## 7. Arquitetura Rust/Axum

### Estrutura De Diretorios

```text
backend/
  Cargo.toml
  .env.example
  migrations/
  src/
    main.rs
    lib.rs
    config/
    errors/
    domain/
      organizations/
      users/
      games/
      questions/
      matches/
      rankings/
      notifications/
    application/
      auth/
      organizations/
      games/
      players/
      questions/
      matches/
      rankings/
      rooms/
      notifications/
    infrastructure/
      auth/
      database/
      repositories/
      realtime/
      clock/
    api/
      mod.rs
      routes/
      dto/
      extractors/
      middleware/
    realtime/
      mod.rs
      hub.rs
      channels.rs
      events.rs
      payloads.rs
    database/
      mod.rs
      pool.rs
      transaction.rs
    seeds/
```

### `src/domain`

Responsabilidade:

- Entidades puras do dominio.
- Value objects.
- Enums de negocio.
- Regras que nao dependem de HTTP, SQLx, MySQL, Axum ou WebSocket.

Pode existir:

- `domain/matches/entities.rs`
- `domain/matches/value_objects.rs`
- `domain/matches/rules.rs`
- `domain/matches/errors.rs`
- `domain/games/game.rs`

Nao pode existir:

- Queries SQL.
- DTOs HTTP.
- Extractors Axum.
- `sqlx::FromRow`.
- `Json<T>`, `State<T>`, `WebSocket`.

Regras anti-acoplamento:

- O dominio nao conhece banco.
- O dominio nao retorna status HTTP.
- IDs devem ser tipos de dominio ou wrappers simples, nao strings soltas espalhadas.

### `src/application`

Responsabilidade:

- Casos de uso.
- Orquestracao transacional.
- Validacao de permissao por caso de uso.
- Portas/interfaces de repositories.
- Publicacao de eventos de dominio apos commit.

Pode existir:

- `application/matches/create_match.rs`
- `application/matches/start_match.rs`
- `application/matches/draw_question.rs`
- `application/matches/register_answer.rs`
- `application/players/list_players.rs`
- `application/auth/login.rs`

Nao pode existir:

- SQL concreto.
- Classes CSS ou detalhe de UI.
- Handler Axum.
- Serializacao especifica de WebSocket.

Regras anti-acoplamento:

- Use cases recebem DTOs de comando internos, nao requests HTTP diretamente.
- Repositories sao traits aqui; implementacoes ficam em `infrastructure`.
- Qualquer mudanca de score deve passar por use case que escreva `score_events`.

### `src/infrastructure`

Responsabilidade:

- Implementacoes concretas de portas.
- Repositories SQLx.
- Hash de senha.
- JWT/session tokens.
- Adaptadores de broadcast.
- Clock real.

Pode existir:

- `infrastructure/repositories/mysql_match_repository.rs`
- `infrastructure/repositories/mysql_player_repository.rs`
- `infrastructure/auth/argon2_password_hasher.rs`
- `infrastructure/auth/jwt_token_service.rs`
- `infrastructure/realtime/axum_broadcast_bus.rs`

Nao pode existir:

- Regra de negocio que deveria estar em domain/application.
- Handlers HTTP.

Regras anti-acoplamento:

- SQL fica em repositories ou arquivos organizados por recurso.
- Nao misturar queries de matches, players e rankings no mesmo arquivo gigante.
- Repositories retornam tipos de aplicacao/dominio ou records especificos, nunca DTO de tela diretamente sem passar por mapper.

### `src/api`

Responsabilidade:

- Composicao de routers Axum.
- Handlers HTTP finos.
- DTOs de request/response.
- Extractors de autenticacao/autorizacao.
- Middleware.
- Conversao de erro para HTTP.

Pode existir:

- `api/routes/matches.rs`
- `api/routes/players.rs`
- `api/dto/matches.rs`
- `api/extractors/authenticated_user.rs`
- `api/middleware/request_id.rs`

Nao pode existir:

- SQL.
- Regras de pontuacao.
- Sorteio de pergunta.
- Manipulacao direta de transacao complexa.

Regras anti-acoplamento:

- Handler valida shape basico, chama use case e converte resposta.
- Handler nao decide se resposta correta soma pontos; isso e application/domain.

### `src/realtime`

Responsabilidade:

- WebSocket server.
- Registro de conexoes.
- Canais/salas.
- Contratos de eventos.
- Presenca.
- Reconexao/resync.

Pode existir:

- `realtime/events.rs`
- `realtime/payloads.rs`
- `realtime/channels.rs`
- `realtime/hub.rs`
- `realtime/auth.rs`

Nao pode existir:

- SQL direto.
- Regra central de partida.
- DTO REST misturado sem mapper.

Regras anti-acoplamento:

- Eventos WebSocket sao consequencia de use cases.
- Mutacoes recebidas via WS devem chamar os mesmos use cases da API ou comandos especificos equivalentes.
- Broadcast ocorre depois de commit de banco.

### `src/database`

Responsabilidade:

- Criacao do pool.
- Health checks.
- Helpers de transacao.
- Integracao com SQLx.

Pode existir:

- `database/pool.rs`
- `database/transaction.rs`
- `database/health.rs`

Nao pode existir:

- Queries de dominio espalhadas.
- Regras de negocio.

### `src/config`

Responsabilidade:

- Ler e validar variaveis de ambiente.
- Expor structs de configuracao tipadas.

Pode existir:

- `config/app_config.rs`
- `config/database_config.rs`
- `config/security_config.rs`
- `config/realtime_config.rs`

Nao pode existir:

- `std::env::var` espalhado pelo projeto.
- Defaults inseguros em producao.

### `src/errors`

Responsabilidade:

- Tipos de erro compartilhados.
- Conversao para resposta HTTP.
- Codigos estaveis de erro.

Pode existir:

- `errors/app_error.rs`
- `errors/http_error.rs`
- `errors/validation_error.rs`

Nao pode existir:

- Texto de UI especifico.
- Tratamento silencioso de erro.

## 8. Estrategia SQLx CLI

### `.env`

```env
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8080
DATABASE_URL=mysql://holyplay:holyplay@127.0.0.1:3306/holyplay
JWT_SECRET=change-me-in-development
WS_TOKEN_TTL_SECONDS=60
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Migrations

Organizacao:

```text
backend/migrations/
  20260601090000_create_organizations.sql
  20260601090100_create_users.sql
  20260601090200_create_games.sql
  20260601090300_create_questions.sql
  20260601090400_create_matches.sql
  20260601090500_create_realtime_and_notifications.sql
```

Convencoes:

- Uma migration por grupo coeso.
- Nao editar migration ja aplicada fora de ambiente local descartavel.
- Alteracao de schema sempre cria nova migration.
- Nome sempre `YYYYMMDDHHMMSS_action_resource.sql`.
- FKs nomeadas explicitamente.
- Indices nomeados explicitamente.
- Seeds nao devem ficar misturadas com migrations estruturais, exceto dados indispensaveis de sistema como modos base.

Comandos:

```bash
cd backend
sqlx database create
sqlx migrate add create_organizations
sqlx migrate run
cargo sqlx prepare
cargo test
```

Validacao de queries:

- Preferir `sqlx::query!` e `sqlx::query_as!` onde o shape for estavel.
- Usar `cargo sqlx prepare --workspace` no CI.
- Repositories com queries dinamicas devem restringir filtros e ordenacao por whitelist.

Seeds iniciais:

- Criar organizacao demo somente em ambiente local.
- Criar usuario admin demo somente em ambiente local.
- Criar jogos base: `quiz-biblico`, `versiculo-completo`, `quem-personagem`, `adivinhe-louvor`, `verdadeiro-falso`, `corrida-perguntas`.
- Criar modos base: `classic`, `initial_points`, `elimination`.
- Criar ministerios demo apenas local/dev.

## 9. Proposed Final API

### Convencoes Gerais

- Prefixo: `/api/v1`.
- Autenticacao: Bearer token HTTP.
- Content-Type: `application/json`.
- Datas: ISO 8601 UTC.
- IDs: UUID string.
- Paginacao: `page`, `per_page`, com `per_page` maximo 100.
- Resposta paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 120,
    "total_pages": 6
  }
}
```

- Erro:

```json
{
  "error": {
    "code": "match_not_found",
    "message": "Match not found",
    "details": []
  }
}
```

### Auth

#### `POST /api/v1/auth/login`

Request:

```json
{
  "email": "leader@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "access_token": "jwt",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "display_name": "Lider Juventude",
    "email": "leader@example.com"
  },
  "organization": {
    "id": "uuid",
    "name": "Igreja Betel",
    "roles": ["admin", "host"]
  }
}
```

#### `GET /api/v1/me`

Retorna usuario, organizacao ativa, roles e permissoes efetivas.

### Organizations And Settings

- `GET /api/v1/organizations/current`
- `PATCH /api/v1/organizations/current`
- `GET /api/v1/ministries`
- `POST /api/v1/ministries`
- `PATCH /api/v1/ministries/:id`

Autorizacao:

- Leitura: `member`.
- Escrita: `admin`.

### Games

- `GET /api/v1/games?status=active&search=quiz&page=1&per_page=20&sort=name`
- `GET /api/v1/games/:id`

Response item:

```json
{
  "id": "uuid",
  "slug": "quiz-biblico",
  "name": "Quiz Biblico",
  "description": "Desafie seus conhecimentos...",
  "status": "active",
  "icon_key": "book-open-text",
  "active_players_count": 128,
  "available_modes": [{ "id": "uuid", "code": "classic", "name": "Classico" }]
}
```

`active_players_count` e derivado.

### Players

- `GET /api/v1/players?search=gabriel&ministry_id=uuid&page=1&per_page=20&sort=display_name`
- `POST /api/v1/players`
- `PATCH /api/v1/players/:id`
- `GET /api/v1/players/:id`

Create request:

```json
{
  "display_name": "Gabriel Santos",
  "ministry_id": "uuid"
}
```

Response item:

```json
{
  "id": "uuid",
  "display_name": "Gabriel Santos",
  "initials": "GS",
  "ministry": { "id": "uuid", "name": "Jovens" },
  "stats": {
    "points": 14250,
    "matches_played": 87,
    "level": 12
  }
}
```

`initials`, `points`, `matches_played` e `level` sao calculados no DTO.

### Rankings

- `GET /api/v1/rankings?period=month&from=2026-05-01&to=2026-05-31&game_id=uuid&ministry_id=uuid&page=1&per_page=50`

Response item:

```json
{
  "rank": 1,
  "player_id": "uuid",
  "display_name": "Gabriel Santos",
  "ministry_name": "Jovens",
  "points": 14250,
  "matches_played": 87,
  "level": 12
}
```

### Matches

- `GET /api/v1/matches?status=waiting&game_id=uuid&page=1&per_page=20&sort=-created_at`
- `POST /api/v1/matches`
- `GET /api/v1/matches/:id`
- `PATCH /api/v1/matches/:id`
- `DELETE /api/v1/matches/:id`

Create request:

```json
{
  "name": "Quiz dos Profetas",
  "game_id": "uuid",
  "game_mode_id": "uuid",
  "max_questions": 10,
  "time_per_question_seconds": 20,
  "initial_points": 500,
  "remote_enabled": true,
  "capacity": 100,
  "questions": [
    {
      "prompt": "Quem foi o profeta levado ao ceu em um carro de fogo?",
      "expected_answer": "Elias",
      "points": 100
    }
  ]
}
```

Response:

```json
{
  "id": "uuid",
  "name": "Quiz dos Profetas",
  "status": "waiting",
  "join_pin": "482193",
  "game": { "id": "uuid", "name": "Quiz Biblico" },
  "mode": { "id": "uuid", "code": "classic", "name": "Classico" },
  "settings": {
    "max_questions": 10,
    "time_per_question_seconds": 20,
    "initial_points": null,
    "remote_enabled": true,
    "capacity": 100
  },
  "counts": {
    "questions": 6,
    "participants": 2,
    "used_questions": 0
  },
  "created_at": "2026-05-30T12:00:00Z",
  "started_at": null,
  "ended_at": null
}
```

### Match Questions

- `GET /api/v1/matches/:match_id/questions`
- `POST /api/v1/matches/:match_id/questions`
- `PATCH /api/v1/matches/:match_id/questions/:question_id`
- `DELETE /api/v1/matches/:match_id/questions/:question_id`
- `POST /api/v1/matches/:match_id/questions/import`

Import request:

```json
{
  "rows": [
    {
      "prompt": "Quem construiu a arca?",
      "expected_answer": "Noe",
      "points": 100
    }
  ]
}
```

Import response:

```json
{
  "imported": 1,
  "rejected": 0,
  "errors": []
}
```

### Match Participants And Player Join

- `POST /api/v1/matches/join-by-pin`
- `POST /api/v1/matches/:match_id/participants`
- `DELETE /api/v1/matches/:match_id/participants/:participant_id`

Join by PIN request:

```json
{
  "join_pin": "482193",
  "display_name": "Joao"
}
```

Response:

```json
{
  "match_id": "uuid",
  "participant_id": "uuid",
  "ws_token": "short-lived-token"
}
```

### Host Actions

Host actions devem ser endpoints explicitos para manter regras centralizadas:

- `POST /api/v1/matches/:id/start`
- `POST /api/v1/matches/:id/draw-question`
- `POST /api/v1/matches/:id/reveal-answer`
- `POST /api/v1/matches/:id/select-player`
- `POST /api/v1/matches/:id/register-answer`
- `POST /api/v1/matches/:id/adjust-score`
- `POST /api/v1/matches/:id/reset-buzzers`
- `POST /api/v1/matches/:id/end`
- `POST /api/v1/matches/:id/reset`

`register-answer` request:

```json
{
  "round_id": "uuid",
  "participant_id": "uuid",
  "is_correct": true
}
```

`adjust-score` request:

```json
{
  "participant_id": "uuid",
  "delta": -50,
  "reason": "Manual penalty"
}
```

### Rooms And History

- `GET /api/v1/rooms?status=open&page=1&per_page=20`
- `GET /api/v1/history?from=2026-05-01&to=2026-05-31&game_id=uuid&page=1&per_page=20`

Room item:

```json
{
  "id": "uuid",
  "match_id": "uuid",
  "name": "Jovens Betel - Sabado",
  "game_name": "Quiz Biblico",
  "join_pin": "482193",
  "participants_count": 18,
  "capacity": 40,
  "host_name": "Gabriel Santos",
  "opened_at": "2026-05-30T22:00:00Z"
}
```

History item:

```json
{
  "match_id": "uuid",
  "game_name": "Quiz Biblico",
  "match_name": "Jovens Betel",
  "started_at": "2026-05-23T22:42:00Z",
  "ended_at": "2026-05-23T23:00:00Z",
  "participants_count": 28,
  "winner": {
    "participant_id": "uuid",
    "display_name": "Gabriel Santos"
  },
  "duration_seconds": 1080
}
```

### Notifications

- `GET /api/v1/notification-preferences`
- `PATCH /api/v1/notification-preferences`
- `GET /api/v1/notifications`
- `POST /api/v1/notifications/:id/read`

## 10. Arquitetura Realtime/WebSockets

### Endpoint

```text
GET /ws?token=<short-lived-token>
```

O token WebSocket deve ser emitido por endpoint REST autenticado ou pelo join-by-pin para jogador remoto. TTL recomendado: 60 segundos para abrir conexao. A conexao validada recebe permissoes e canais permitidos.

### Canais

- `organization:{organization_id}`: dashboard, salas ao vivo, ranking e notificacoes organizacionais.
- `match:{match_id}`: host, tela de apresentacao e jogadores da partida.
- `player:{participant_id}`: eventos privados de um participante.
- `user:{user_id}`: notificacoes privadas de usuario autenticado.

### Eventos Client To Server

```json
{
  "type": "player.buzz",
  "request_id": "uuid",
  "payload": {
    "match_id": "uuid",
    "round_id": "uuid",
    "participant_id": "uuid"
  }
}
```

Eventos aceitos:

- `presence.ping`: mantem conexao ativa.
- `match.subscribe`: solicita inscricao em canal permitido.
- `match.unsubscribe`: remove inscricao.
- `player.buzz`: jogador tenta responder.
- `player.leave`: jogador sai da partida.

Mutacoes de host podem ser feitas via REST para simplicidade. Se tambem forem aceitas via WS no futuro, devem chamar os mesmos use cases.

### Eventos Server To Client

```json
{
  "type": "match.question_drawn",
  "event_id": "uuid",
  "occurred_at": "2026-05-30T12:00:00Z",
  "channel": "match:uuid",
  "payload": {}
}
```

Eventos:

- `match.created`
- `match.updated`
- `match.started`
- `match.question_drawn`
- `match.answer_revealed`
- `match.player_selected`
- `match.answer_registered`
- `match.score_updated`
- `match.buzzers_reset`
- `match.ended`
- `match.reset`
- `participant.joined`
- `participant.left`
- `participant.connected`
- `participant.disconnected`
- `room.opened`
- `room.updated`
- `room.closed`
- `ranking.updated`
- `presence.updated`
- `notification.created`
- `error`

### Payloads Principais

`match.question_drawn`:

```json
{
  "match_id": "uuid",
  "round_id": "uuid",
  "question": {
    "id": "uuid",
    "prompt": "Quem construiu a arca?",
    "points": 100
  },
  "answer_revealed": false
}
```

`match.answer_revealed`:

```json
{
  "match_id": "uuid",
  "round_id": "uuid",
  "expected_answer": "Noe"
}
```

`match.player_selected`:

```json
{
  "match_id": "uuid",
  "round_id": "uuid",
  "participant_id": "uuid",
  "display_name": "Gabriel Santos"
}
```

`match.score_updated`:

```json
{
  "match_id": "uuid",
  "participant_id": "uuid",
  "display_name": "Gabriel Santos",
  "delta": 100,
  "score_after": 600,
  "reason": "correct_answer"
}
```

`presence.updated`:

```json
{
  "match_id": "uuid",
  "connected_participants": 18,
  "presenter_connected": true,
  "host_connected": true
}
```

### Estrategia De Broadcast

- Use case executa validacao e transacao.
- Transacao grava estado e eventos necessarios.
- Apos commit, application publica evento em um `RealtimeBus`.
- `RealtimeBus` envia para canais relevantes.
- Cliente que perder evento deve fazer resync REST com `GET /matches/:id`.

### Presenca

V1:

- Presenca em memoria no processo Axum.
- Heartbeat por `presence.ping`.
- Timeout de conexao apos janela configurada.

Escala futura:

- Redis Pub/Sub para broadcast entre instancias.
- Redis com TTL para presenca.
- Event log persistido para replay se necessario.

### Reconexao

- Frontend guarda `match_id` e `participant_id`.
- Ao reconectar, solicita novo WS token via REST ou endpoint de rejoin.
- Apos abrir WS, chama `GET /matches/:id` para snapshot atual.
- Eventos subsequentes sao aplicados incrementalmente.

## 11. Estrategia De Integracao Com React

### Camada API

Criar:

```text
src/lib/api-client.ts
src/lib/realtime-client.ts
src/features/games/api.ts
src/features/players/api.ts
src/features/matches/api.ts
src/features/rankings/api.ts
src/features/rooms/api.ts
```

Regras:

- `fetch` centralizado com base URL, token, tratamento de erro e request id.
- React Query para dados REST.
- WebSocket separado, com resync apos reconexao.
- DTOs de API em TypeScript nao devem importar mocks.

### Substituicao Gradual Dos Mocks

Ordem recomendada:

1. `/games`: trocar `games` por `GET /games`.
2. `/players`: trocar `players` por `GET /players`.
3. `/ranking`: trocar ranking mockado por `GET /rankings`.
4. `/rooms`: trocar `rooms` por `GET /rooms` + WS `room.updated`.
5. `/history`: trocar `matches` mockado por `GET /history`.
6. `/matches` e `/matches/new`: trocar Zustand por API de partidas.
7. `/matches/:id/questions`: trocar CRUD local por endpoints.
8. `/matches/:id/host`: trocar acoes do Zustand por host action endpoints e eventos WS.
9. `/matches/:id/present`: usar snapshot REST + eventos WS.
10. `/play/:id`: trocar entrada e buzzer local por join-by-pin + WS.

### Papel Do Zustand Depois Do Backend

Zustand pode continuar apenas para estado efemero:

- formulario em andamento;
- estado local de UI;
- cache temporario de conexao;
- countdown visual do buzzer.

Nao deve guardar fonte de verdade de partida, placar, participantes ou perguntas.

## 12. Seguranca E Autorizacao

### Autenticacao

- Email/senha com hash Argon2id.
- JWT access token curto.
- Refresh token opcional em fase posterior.
- WS token curto e escopado.

### Autorizacao

Roles:

- `owner`: controla organizacao e usuarios admins.
- `admin`: gerencia configuracoes, jogadores, ministerios e partidas.
- `host`: cria e conduz partidas.
- `member`: participa e consulta dados permitidos.

Regras:

- Toda query deve filtrar por `organization_id`.
- Host so pode conduzir partida da propria organizacao.
- Player remoto via PIN so acessa a partida que entrou.
- Presenter so le dados necessarios para exibicao publica.
- Ranking e historico respeitam organizacao ativa.

### Protecoes

- Rate limit em login, join-by-pin e buzzer.
- PIN com entropia suficiente e rotacao ao resetar/reabrir sala.
- Nao registrar PIN em logs sensiveis.
- CORS restrito por ambiente.
- Validacao server-side de todos os DTOs.
- Tamanho maximo para CSV/importacao.
- Auditoria de score via `score_events`.

## 13. Performance E Escalabilidade

### Banco

- Indices por `organization_id`, `status`, `created_at`, `match_id`, `participant_id`.
- Paginacao obrigatoria em listas.
- Ranking calculado com agregacao sobre `score_events` e filtros de periodo.
- Para alto volume, criar tabela de snapshots de ranking em fase futura, atualizada por job.
- Evitar N+1 usando joins especificos para DTOs de tela.

### API

- Separar comandos de consultas.
- DTOs de tela podem ser read models montados por queries otimizadas.
- Timeouts de requests e pool configurado.
- `tower-http` para trace, compression e CORS.

### Realtime

- V1 em memoria e single-node e suficiente para validar produto.
- Interface `RealtimeBus` deve permitir Redis/NATS no futuro sem reescrever use cases.
- Eventos devem ser pequenos; snapshots completos devem vir por REST.
- Debounce/coalescing para eventos de ranking/dashboard.

### Frontend

- React Query com stale times por recurso.
- Invalidation por evento WS.
- Resync completo ao reconectar.
- Loading, empty e error states em todas as telas que substituirem mocks.
