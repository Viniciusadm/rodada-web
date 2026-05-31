# Normalization Audit

Objetivo: impedir que contadores, strings duplicadas e estado operacional do
frontend sejam persistidos como fonte de verdade no backend.

## Regras de normalizacao

- Strings que identificam outra entidade devem virar FK ou snapshot auditavel
  explicito.
- Contadores e totais devem ser calculados por query, evento ou presenca.
- Placar e ranking precisam de trilha auditavel em `score_events`.
- Campos de visual, formatacao e tema pertencem a DTO/UI, nao ao dominio.
- Arrays embutidos do store devem virar relacoes normalizadas.

## Auditoria de `src/lib/mock-data.ts`

| Campo problemático        | Origem              | Problema                                                           | Solucao proposta                                                                                                 |
| ------------------------- | ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `games.players`           | `games`             | Contador agregado de popularidade; pode divergir de partidas reais | Calcular por `match_participants`, `matches` encerradas ou metrica analitica separada                            |
| `games.icon`              | `games`             | Componente React, nao dado de dominio                              | Manter no frontend ou mapear por chave de icone em DTO de catalogo                                               |
| `games.iconColor`         | `games`             | Classes CSS acopladas ao dominio                                   | Manter no frontend/tema; se editavel, usar token visual opcional                                                 |
| `players.initials`        | `players`           | Derivado do nome e usado so no avatar                              | Gerar no DTO/frontend a partir de `players.display_name`                                                         |
| `players.ministry`        | `players`           | Nome textual duplicado de ministerio                               | Persistir `players.ministry_id`; retornar `ministry.name` via join/DTO                                           |
| `players.points`          | `players`           | Total agregado usado em ranking e cards                            | Calcular por `score_events` no periodo selecionado                                                               |
| `players.matches`         | `players`           | Total agregado de partidas                                         | Calcular por `match_participants` e `matches` encerradas                                                         |
| `players.level`           | `players`           | Valor gamificado derivado de pontuacao/regra                       | Calcular por regra de progressao a partir de pontos ou snapshots controlados                                     |
| `players.color`           | `players`           | Classes CSS do avatar                                              | Manter no frontend/tema; se editavel, armazenar token de preferencia visual separado                             |
| `rooms.gameName`          | `rooms`             | Duplica `games.name`                                               | Persistir `room_sessions.match_id`; retornar `match.game.name` no DTO                                            |
| `rooms.participants`      | `rooms`             | Contador de conectados/participantes                               | Calcular por `presence_sessions` ativas ou `match_participants`, conforme tela                                   |
| `rooms.capacity`          | `rooms`             | Configuracao real, mas nao deve ficar solta no card                | Persistir em `match_settings.max_participants` ou `room_sessions.capacity`                                       |
| `rooms.host`              | `rooms`             | Nome textual do anfitriao                                          | Persistir `matches.host_user_id`; retornar `users.display_name` via DTO                                          |
| `rooms.startedMinutesAgo` | `rooms`             | Tempo relativo de apresentacao                                     | Persistir `room_sessions.started_at`; calcular relativo no DTO/frontend                                          |
| `matches.gameName`        | `matches` historico | Duplica nome do jogo                                               | Persistir `matches.game_id`; retornar `games.name` via join ou snapshot de encerramento                          |
| `matches.room`            | `matches` historico | Nome textual de sala/grupo                                         | Relacionar a `room_sessions` ou gravar `room_name_snapshot` somente ao encerrar                                  |
| `matches.date`            | `matches` historico | Data formatada local                                               | Persistir timestamps UTC (`created_at`, `started_at`, `ended_at`); formatar na UI                                |
| `matches.players`         | `matches` historico | Contador agregado                                                  | Calcular por `match_participants`                                                                                |
| `matches.winner`          | `matches` historico | Nome textual e resultado sem prova                                 | Derivar do placar final recalculado por `score_events`; opcionalmente salvar `winner_participant_id` ao encerrar |
| `matches.duration`        | `matches` historico | Duracao formatada                                                  | Calcular por `started_at` e `ended_at`                                                                           |
| `statusLabel`             | `mock-data`         | Traducao de status para UI                                         | Manter em frontend/i18n, nao no banco                                                                            |

## Auditoria de `src/lib/match-store.ts`

| Campo problemático                | Origem        | Problema                                                                     | Solucao proposta                                                                                           |
| --------------------------------- | ------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Match.questions`                 | `Match`       | Array embutido impede reutilizacao e auditoria                               | Criar `match_questions` com FK para `matches` e snapshot de `questions`                                    |
| `Match.players`                   | `Match`       | Array embutido mistura partida e jogador                                     | Criar `match_participants` como pivot entre `matches` e `players`                                          |
| `Question.used`                   | `Question`    | Estado da pergunta dentro da partida, nao da pergunta global                 | Derivar de `match_rounds` ou persistir `match_questions.used_at`                                           |
| `Match.currentQuestionId`         | `Match`       | Estado ativo de rodada no objeto de partida                                  | Usar `matches.current_round_id` ou derivar da rodada aberta em `match_rounds`                              |
| `Match.currentPlayerId`           | `Match`       | Participante selecionado sem trilha de origem                                | Persistir em `match_rounds.selected_participant_id`; origem vem de host ou `buzzer_events`                 |
| `Match.answerRevealed`            | `Match`       | Booleano operacional sem historico                                           | Persistir `match_rounds.answer_revealed_at`                                                                |
| `MatchPlayer.score`               | `MatchPlayer` | Placar atual pode divergir de acertos, erros e ajustes                       | Usar `score_events` como fonte; `match_participants.current_score` pode ser cache recalculavel             |
| `MatchPlayer.eliminatedThisRound` | `MatchPlayer` | Estado temporario por rodada                                                 | Registrar em `buzzer_events`/`score_events` ou em estado de rodada quando eliminacao exigir historico      |
| `MatchPlayer.remote`              | `MatchPlayer` | Origem da entrada, nao atributo global do jogador                            | Persistir `match_participants.join_source` (`local`, `remote`)                                             |
| `Match.joinPin`                   | `Match`       | Codigo sensivel misturado a partida                                          | Persistir em `room_sessions` ou campo controlado com unicidade entre ativas; evitar logs e considerar hash |
| `Match.createdAt`                 | `Match`       | Timestamp local numerico do cliente                                          | Persistir `created_at DATETIME(6)` UTC no backend                                                          |
| `drawQuestion`                    | store/action  | Sorteio decidido no cliente pode divergir entre host, apresentacao e jogador | Decidir no backend e registrar `match_rounds`                                                              |
| `buzzIn`                          | store/action  | Buzzer local nao garante ordenacao nem dupla submissao                       | Registrar `buzzer_events` com timestamp do servidor e decisao atomica                                      |
| `applyPenalty`                    | store/action  | Ajuste direto de placar sem auditoria                                        | Criar `score_events` do tipo `manual_adjustment` ou `penalty`                                              |
| `registerAnswer`                  | store/action  | Muda pergunta e placar sem trilha completa                                   | Criar `match_answers` e `score_events` vinculados a rodada e participante                                  |
| `resetMatch`                      | store/action  | Apaga/reescreve estado sem registro                                          | Em producao, criar novo ciclo de partida ou registrar eventos de reset administrativos                     |

## Ranking e placar

- `ranking` nao deve ser tabela primaria para v1.
- Ranking mensal deve ser uma query sobre `score_events`, `match_participants`,
  `matches`, `players` e filtros de periodo/jogo/ministerio.
- `match_participants.current_score` pode existir como leitura rapida, desde que
  `score_events` seja a fonte auditavel e permita recalculo.
- Vitoria e vencedor devem ser derivados do placar final ou gravados como
  `winner_participant_id` somente no encerramento, com score final preservado.

## Resultado esperado por campo

| Categoria          | Campos                                                                                  | Destino correto                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Strings duplicadas | `gameName`, `host`, `winner`, `room`, `ministry`                                        | FKs para `games`, `users`, `match_participants`, `room_sessions`, `ministries`; snapshots so quando auditaveis |
| Contadores         | `players`, `participants`, `matches`                                                    | Queries agregadas sobre participantes, presenca e partidas                                                     |
| Totais e ranking   | `points`, `score`, `level`, `winner`                                                    | `score_events` + regras de agregacao                                                                           |
| Tempo formatado    | `date`, `duration`, `startedMinutesAgo`                                                 | Timestamps UTC e formatacao no DTO/UI                                                                          |
| Visual             | `icon`, `iconColor`, `initials`, `color`, `statusLabel`                                 | Frontend, i18n ou tokens opcionais de tema                                                                     |
| Estado operacional | `used`, `currentQuestionId`, `currentPlayerId`, `answerRevealed`, `eliminatedThisRound` | `match_rounds`, `match_questions`, `buzzer_events`, `match_answers`, `score_events`                            |

## Criterio de aceite

Todos os campos problematicos dos mocks e do store possuem uma solucao
normalizada. Nenhum contador, ranking, placar ou nome textual duplicado fica como
fonte primaria sem trilha auditavel.
