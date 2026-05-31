# Modelo final de dominio HolyPlay

Este documento transforma as telas e mocks atuais em entidades reais para orientar
o futuro `backend/src/domain`. O dominio deve suportar varios tipos de jogos, nao
apenas quiz biblico.

## Principios

- `Organization` e a fronteira de tenant.
- `Game` descreve um tipo de experiencia jogavel; regras especificas ficam em
  configuracoes e conteudos relacionados, nao em campos fixos de quiz.
- `Match` e uma instancia jogada de um `Game`.
- Placares, rankings, historico e dashboard sao leituras derivadas de partidas,
  participantes, rodadas, respostas, presenca e eventos de pontuacao.
- Campos de UI como icones, cores, iniciais e textos formatados nao sao fonte de
  verdade do dominio.

## Entidades finais

### Organizacao e acesso

| Entidade                 | Responsabilidade                                                    | Relacoes principais                                                                      |
| ------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Organization`           | Igreja/tenant que possui jogos, jogadores, partidas e configuracoes | 1:N `Ministry`, 1:N `Player`, 1:N `Match`, 1:N `QuestionBank`, N:N `User` via `UserRole` |
| `Ministry`               | Grupo interno da organizacao, como Jovens, EBD ou Kids              | N:1 `Organization`, 1:N `Player`, opcionalmente 1:N `Match`                              |
| `User`                   | Conta autenticada para lideres, hosts e jogadores logados           | N:N `Organization` via `UserRole`, 1:N `Match` como host, 1:N `PresenceSession`          |
| `UserRole`               | Papel do usuario dentro de uma organizacao                          | N:1 `Organization`, N:1 `User`; roles: `owner`, `admin`, `host`, `member`                |
| `NotificationPreference` | Preferencias de notificacao por usuario/organizacao                 | N:1 `User`, N:1 `Organization`                                                           |

### Catalogo e conteudo de jogos

| Entidade        | Responsabilidade                                                                                       | Relacoes principais                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `Game`          | Tipo de jogo disponivel no catalogo, como quiz, verdadeiro/falso, completar versiculo ou jogos futuros | 1:N `GameMode`, 1:N `QuestionBank`, 1:N `Match`                                              |
| `GameMode`      | Modo/regra selecionavel de uma partida                                                                 | N:1 `Game`, 1:N `Match`                                                                      |
| `QuestionBank`  | Banco reutilizavel de conteudo por organizacao e jogo                                                  | N:1 `Organization`, N:1 `Game`, 1:N `Question`                                               |
| `Question`      | Item de conteudo reutilizavel; no quiz contem pergunta, resposta e pontos padrao                       | N:1 `QuestionBank`, 1:N `MatchQuestion`                                                      |
| `ContentImport` | Operacao auditavel de importacao, como CSV de perguntas                                                | N:1 `Organization`, N:1 `QuestionBank`, N:1 `User`; gera `Question` e relatorio de validacao |

### Jogadores e partidas

| Entidade           | Responsabilidade                                    | Relacoes principais                                                                                                                                                         |
| ------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Player`           | Pessoa jogadora dentro da organizacao               | N:1 `Organization`, N:1 opcional `Ministry`, 1:1 opcional `User`, 1:N `MatchParticipant`                                                                                    |
| `Match`            | Partida criada para um jogo e conduzida por um host | N:1 `Organization`, N:1 `Game`, N:1 `GameMode`, N:1 `User` como host, 1:1 `MatchSettings`, 1:N `MatchParticipant`, 1:N `MatchQuestion`, 1:N `MatchRound`, 0:1 `RoomSession` |
| `MatchSettings`    | Configuracoes da partida                            | 1:1 `Match`; inclui limite de rodadas/perguntas, tempo, pontos iniciais, entrada remota e capacidade                                                                        |
| `MatchQuestion`    | Snapshot do conteudo usado dentro da partida        | N:1 `Match`, N:1 opcional `Question`, 1:N `MatchRound`                                                                                                                      |
| `MatchParticipant` | Participacao de um jogador em uma partida           | N:1 `Match`, N:1 `Player`, 1:N `MatchAnswer`, 1:N `ScoreEvent`, 1:N `BuzzerEvent`                                                                                           |
| `MatchRound`       | Rodada ativa ou encerrada de uma partida            | N:1 `Match`, N:1 opcional `MatchQuestion`, 1:N `MatchAnswer`, 1:N `BuzzerEvent`                                                                                             |
| `MatchAnswer`      | Resposta registrada numa rodada                     | N:1 `MatchRound`, N:1 opcional `MatchParticipant`; registra resultado, pontos aplicados e timestamps                                                                        |
| `ScoreEvent`       | Lancamento auditavel de pontuacao                   | N:1 `Match`, N:1 `MatchParticipant`, N:1 opcional `MatchRound`; tipos como acerto, erro, ajuste manual, penalidade, reset                                                   |

### Sala ao vivo, apresentacao e buzzer

| Entidade              | Responsabilidade                                         | Relacoes principais                                                                                                                      |
| --------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `RoomSession`         | Sala ao vivo associada a uma partida ativa               | 1:1 `Match`; possui PIN, status, capacidade, abertura e encerramento                                                                     |
| `PresenceSession`     | Conexao ativa de host, apresentacao ou jogador           | N:1 `RoomSession`, N:1 opcional `User`, N:1 opcional `MatchParticipant`; roles: `host`, `presenter`, `player`, `viewer`                  |
| `BuzzerEvent`         | Tentativa de buzzer de um participante numa rodada       | N:1 `MatchRound`, N:1 `MatchParticipant`, N:1 opcional `PresenceSession`; registra timestamp, ordem e estado aceito/rejeitado/antecipado |
| `PresentationSession` | Estado e permissao de exibicao para tela de apresentacao | N:1 `RoomSession`, N:1 opcional `PresenceSession`; consome `Match`, `MatchRound`, placar e resposta revelada                             |

### Leituras derivadas

Estas nao devem ser tabelas primarias quando puderem ser calculadas.

| Leitura             | Fontes                                                                    | Telas cobertas              |
| ------------------- | ------------------------------------------------------------------------- | --------------------------- |
| `DashboardSummary`  | `Game`, `RoomSession`, `PresenceSession`, `ScoreEvent`, `Match`           | `/`                         |
| `LiveRoomCard`      | `RoomSession`, `Match`, `Game`, `User`, `PresenceSession`                 | `/rooms`, `/`               |
| `RankingEntry`      | `ScoreEvent`, `MatchParticipant`, `Player`, `Ministry`, `Match`           | `/ranking`, ranking da home |
| `PlayerStats`       | `ScoreEvent`, `MatchParticipant`, `Match`                                 | `/players`                  |
| `HistoryEntry`      | `Match`, `Game`, `RoomSession`, `MatchParticipant`, `ScoreEvent`          | `/history`                  |
| `PresentationState` | `Match`, `MatchRound`, `MatchQuestion`, `MatchParticipant`, `RoomSession` | `/matches/:matchId/present` |

## Relacoes por fluxo

### Dashboard

- `Organization` possui `Game`, `Player`, `Match` e `RoomSession`.
- Jogos disponiveis vem de `Game`.
- Salas ao vivo vem de `RoomSession` + `Match` + `Game` + contagem de
  `PresenceSession`.
- Ranking do mes vem de `ScoreEvent` agregado por `Player`.

### Jogos

- `Game` e a entidade principal do catalogo.
- `GameMode` permite modos diferentes por jogo sem prender o modelo a quiz.
- Conteudo reutilizavel fica em `QuestionBank` e `Question` quando o jogo usa
  perguntas; jogos futuros podem adicionar outros tipos de conteudo sem alterar
  `Match`.

### Partidas

- `Match` referencia `Organization`, `Game`, `GameMode` e host `User`.
- `MatchSettings` guarda regras configuradas.
- Participantes entram por `MatchParticipant`, ligados a `Player`.
- Conteudo usado fica em `MatchQuestion` como snapshot.
- Rodadas sao `MatchRound`; respostas sao `MatchAnswer`; pontos sao
  `ScoreEvent`.

### Salas ao vivo

- `RoomSession` e a sala real de uma partida ativa.
- PIN pertence a `RoomSession` ou a `Match` conforme implementacao, mas deve ser
  unico entre sessoes ativas.
- Participantes online sao derivados de `PresenceSession`, nao de contador salvo
  manualmente.

### Ranking e jogadores

- `Player` guarda identidade e vinculo organizacional.
- Pontos, partidas jogadas, vitorias e nivel sao derivados de `ScoreEvent`,
  `MatchParticipant` e `Match`.
- `Ministry` deve ser relacao, nao texto duplicado.

### Historico

- Historico e uma leitura de `Match` encerrada.
- Data e duracao derivam de timestamps da partida/sala.
- Vencedor deriva do placar final em `MatchParticipant` ou de snapshot auditavel
  ao encerrar.

### Apresentacao

- Tela de apresentacao consome `PresentationState`.
- `PresentationState` agrega partida, rodada atual, pergunta atual, resposta
  revelada e placar.
- A apresentacao nao deve comandar regras de jogo; ela observa estado emitido
  pelo backend.

### Buzzer

- Cada tentativa vira `BuzzerEvent` com timestamp do servidor.
- O backend decide a primeira tentativa valida por `MatchRound`.
- Tentativas antecipadas ou duplicadas devem ser registradas como rejeitadas ou
  penalizadas, sem depender do cliente.
- O participante selecionado na rodada vem do `BuzzerEvent` aceito ou de escolha
  manual do host.

## Cobertura obrigatoria do dominio

| Area         | Entidades que cobrem                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| Dashboard    | `DashboardSummary`, `Game`, `RoomSession`, `RankingEntry`                                                |
| Jogos        | `Game`, `GameMode`, `QuestionBank`, `Question`, `ContentImport`                                          |
| Partidas     | `Match`, `MatchSettings`, `MatchQuestion`, `MatchParticipant`, `MatchRound`, `MatchAnswer`, `ScoreEvent` |
| Salas        | `RoomSession`, `PresenceSession`                                                                         |
| Ranking      | `RankingEntry`, `ScoreEvent`, `MatchParticipant`, `Player`                                               |
| Jogadores    | `Player`, `Ministry`, `User`                                                                             |
| Historico    | `HistoryEntry`, `Match`, `RoomSession`, `ScoreEvent`                                                     |
| Apresentacao | `PresentationSession`, `PresentationState`, `MatchRound`                                                 |
| Buzzer       | `BuzzerEvent`, `MatchRound`, `MatchParticipant`, `PresenceSession`                                       |

## Limites para o futuro `backend/src/domain`

- Evitar structs com arrays persistidos para perguntas e jogadores dentro de
  `Match`; usar relacoes.
- Evitar campos `game_name`, `host_name`, `winner_name` como fonte primaria; usar
  IDs e DTOs de exibicao.
- Evitar gravar contadores agregados como fonte de verdade; calcular por query ou
  materializar apenas como cache controlado.
- Manter tipos de jogo extensibles: `Game` + `GameMode` + conteudo associado,
  em vez de criar um dominio chamado apenas `Quiz`.
