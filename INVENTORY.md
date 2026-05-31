# Inventario de telas e acoes HolyPlay

Este documento consolida os fluxos existentes como referencia de produto para a
modelagem futura descrita em `ARCHITECTURE_PLAN.md`.

## Criterios de leitura

- Acoes reais sao as que alteram o estado atual da aplicacao, principalmente via
  `src/lib/match-store.ts`.
- Acoes decorativas sao botoes, campos ou cards que hoje apenas exibem toast,
  redirecionam ou mostram dados mockados.
- Dados de `src/lib/mock-data.ts` representam intencao visual/produto, nao
  contrato normalizado de backend.

## Navegacao global

Fonte: `src/components/layout/AppSidebar.tsx`.

- Principal: Inicio, Jogos, Partidas, Salas ao vivo e Ranking.
- Comunidade: Jogadores e Historico.
- Gestao: Nova partida e Configuracoes.
- Rodape fixo mockado: Igreja Betel / Ministerio Jovem.

## Telas e acoes

### `/` Inicio

Fonte: `src/routes/index.tsx`.

- Mostra destaque de jogos, ranking do mes e salas ao vivo.
- Acoes:
  - Criar novo jogo: navega para `/create-game`, que redireciona para `/matches/new`.
  - Ver salas ao vivo: navega para `/rooms`.
  - Ver todos os jogos: navega para `/games`.
  - Ver ranking completo: navega para `/ranking`.
- Dados:
  - Jogos, jogadores e salas vem de `mock-data`.
  - Ranking e salas sao agregados visuais mockados.

### `/games` Biblioteca de jogos

Fonte: `src/routes/games.tsx` e `src/components/games/GameCard.tsx`.

- Lista jogos disponiveis e cards "em breve".
- Acoes:
  - Criar jogo: navega para `/create-game`, que redireciona para `/matches/new`.
  - Entrar em jogo: quando habilitado, apenas exibe toast de entrada.
- Dados:
  - `GameCard` usa `Game` de `mock-data`.
  - `status` controla se o botao fica desabilitado para manutencao ou em breve.
  - Contagem de jogadores e cores dos icones sao dados de apresentacao.

### `/matches` Partidas

Fonte: `src/routes/matches.index.tsx`.

- Lista partidas existentes no store local.
- Acoes reais:
  - Criar nova partida: navega para `/matches/new`.
  - Abrir painel: navega para `/matches/:matchId/host`.
  - Abrir perguntas: navega para `/matches/:matchId/questions`.
  - Excluir partida: remove a partida de `match-store` apos confirmacao.
- Dados:
  - Usa `matches` de Zustand, nao `mock-data`.
  - Exibe modo, status, quantidade de perguntas, jogadores e PIN.

### `/matches/new` Nova partida

Fonte: `src/routes/matches.new.tsx`.

- Wizard em tres etapas: Regras, Perguntas e Revisao.
- Acoes reais:
  - Definir nome da partida.
  - Selecionar modo: classico, pontos iniciais ou eliminacao.
  - Definir maximo de perguntas, tempo por pergunta e pontos iniciais quando aplicavel.
  - Ativar/desativar participacao remota.
  - Adicionar pergunta manual.
  - Remover pergunta do rascunho.
  - Importar perguntas via CSV.
  - Criar partida em `match-store`.
  - Navegar para `/matches/:matchId/host` apos criar.
- Validacoes atuais:
  - Nome obrigatorio para avancar da etapa Regras.
  - Ao menos uma pergunta com texto e resposta para avancar da etapa Perguntas.

### `/matches/:matchId/questions` Perguntas da partida

Fonte: `src/routes/matches.$matchId.questions.tsx` e `src/components/match/CsvImport.tsx`.

- Gerencia perguntas de uma partida ja criada.
- Acoes reais:
  - Voltar para o painel do host.
  - Adicionar pergunta.
  - Editar pergunta existente.
  - Remover pergunta.
  - Importar perguntas via CSV.
- CSV:
  - Aceita colunas `pergunta,resposta,pontos`.
  - Ignora linhas invalidas sem pergunta ou resposta.
  - Usa 100 pontos como padrao quando pontos nao e informado ou invalido.
  - Mostra pre-visualizacao antes de importar.
  - Permite baixar modelo CSV.

### `/matches/:matchId/host` Painel do anfitriao

Fonte: `src/routes/matches.$matchId.host.tsx`.

- Tela principal de conducao da partida.
- Acoes reais:
  - Copiar PIN.
  - Abrir perguntas.
  - Abrir apresentacao em nova aba.
  - Adicionar jogador local quando participacao remota esta desativada.
  - Remover jogador.
  - Ajustar pontuacao em +50 ou -50.
  - Iniciar partida.
  - Sortear pergunta.
  - Resetar buzzers.
  - Encerrar partida.
  - Resetar partida.
  - Revelar resposta.
  - Selecionar/trocar jogador respondente.
  - Registrar resposta correta.
  - Registrar resposta incorreta.
- Regras atuais:
  - Nao inicia sem jogadores.
  - Nao inicia sem perguntas.
  - Sorteio ignora perguntas usadas e respeita `maxQuestions`.
  - Enquanto uma pergunta esta ativa e a resposta nao foi revelada, novo sorteio fica bloqueado.
  - Resposta correta soma os pontos da pergunta ao jogador selecionado.
  - Resposta incorreta marca a pergunta como usada sem alterar placar.
- Dados operacionais:
  - `currentQuestionId`, `currentPlayerId`, `answerRevealed`, `used` e
    `eliminatedThisRound` sao estados de rodada/partida.

### `/matches/:matchId/present` Apresentacao

Fonte: `src/routes/matches.$matchId.present.tsx`.

- Visualizacao fullscreen para publico/projecao.
- Acoes:
  - Nao possui controles diretos.
- Estados exibidos:
  - Partida aguardando, com PIN quando remoto esta ativo.
  - Aguardando proxima pergunta.
  - Pergunta atual, pontuacao e jogador da vez.
  - Resposta revelada.
  - Placar lateral.
  - Ranking final quando encerrada.

### `/play/:matchId` Jogador remoto

Fonte: `src/routes/play.$matchId.tsx`.

- Tela mobile/fullscreen para jogador remoto.
- Acoes reais:
  - Entrar na partida informando nome.
  - Aguardar inicio.
  - Pressionar buzzer depois do countdown.
  - Clique antecipado durante countdown envia buzz com penalidade de eliminacao na rodada.
- Estados exibidos:
  - Entrada com PIN e nome.
  - Aguardando anfitriao.
  - Aguardando proxima pergunta.
  - Buzzer bloqueado por countdown.
  - Buzzer ativo.
  - Jogador da vez.
  - Eliminado nesta rodada.
  - Resultado final com posicao no ranking.

### `/rooms` Salas ao vivo

Fonte: `src/routes/rooms.tsx`.

- Lista salas mockadas ativas.
- Acoes decorativas:
  - Criar sala: apenas exibe toast.
  - Entrar na sala: apenas exibe toast.
- Acoes utilitarias:
  - Copiar PIN para area de transferencia.
- Dados:
  - Sala, jogo, PIN, participantes, capacidade, host e tempo relativo vem de `mock-data`.
  - Participantes, capacidade e tempo relativo devem ser tratados como derivados no backend real.

### `/ranking` Ranking

Fonte: `src/routes/ranking.tsx`.

- Mostra podio e lista mensal de jogadores.
- Acoes:
  - Apenas visualizacao.
- Dados:
  - Usa `players` de `mock-data`.
  - Pontos, partidas e nivel sao agregados/derivados.

### `/players` Jogadores

Fonte: `src/routes/players.tsx`.

- Lista jogadores/membros mockados.
- Acoes decorativas:
  - Campo de busca existe visualmente, mas nao filtra a lista.
- Dados:
  - Nome e ministerio representam entidades.
  - Iniciais, cor, pontos, partidas e nivel sao apresentacao ou agregados.

### `/history` Historico

Fonte: `src/routes/history.tsx`.

- Lista partidas encerradas mockadas.
- Acoes:
  - Apenas visualizacao.
- Dados:
  - Jogo, sala, data textual, quantidade de jogadores, duracao e vencedor vem de `mock-data`.
  - Data, duracao, vencedor e contagens devem ser derivados ou snapshots auditaveis no backend real.

### `/settings` Configuracoes

Fonte: `src/routes/settings.tsx`.

- Preferencias de igreja, aparencia e notificacoes.
- Acoes reais:
  - Alterar tema entre claro e escuro via `ThemeProvider`.
- Acoes decorativas:
  - Salvar dados da igreja apenas exibe toast.
  - Toggles de notificacao ficam locais/visuais.
- Dados:
  - Igreja Betel, responsavel e email sao valores default mockados.

### `/create-game`

Fonte: `src/routes/create-game.tsx`.

- Rota tecnica de compatibilidade.
- Acoes:
  - Redireciona imediatamente para `/matches/new`.

## Estado operacional atual

Fonte: `src/lib/match-store.ts`.

- Entidades em memoria:
  - `Match`: partida, regras, status, perguntas, jogadores, PIN e estado da rodada.
  - `Question`: pergunta, resposta, pontos e flag `used`.
  - `MatchPlayer`: nome, placar, origem remota e eliminacao temporaria da rodada.
- Acoes reais expostas:
  - `createMatch`, `updateMatch`, `deleteMatch`.
  - `addQuestion`, `updateQuestion`, `removeQuestion`, `importQuestions`.
  - `addPlayer`, `removePlayer`, `applyPenalty`.
  - `startMatch`, `drawQuestion`, `selectPlayer`, `buzzIn`, `revealAnswer`,
    `registerAnswer`, `endMatch`, `resetMatch`, `resetBuzzers`.
- Limitacoes relevantes para arquitetura:
  - Persistencia e concorrencia nao existem.
  - Sorteio, buzzer e placar rodam no cliente.
  - PIN nao e validado contra backend.
  - Host, apresentacao e jogador dependem do mesmo store local da sessao.

## Separacao entre dado real e decorativo

- Entidades reais inferidas:
  - Organizacao, ministerio, usuario, papel, jogador, jogo, partida, pergunta,
    participante, rodada, resposta, evento de pontuacao e sala/sessao ao vivo.
- Dados derivados ou decorativos:
  - Contadores de jogadores/participantes.
  - Ranking mensal.
  - Historico formatado.
  - Duracao textual.
  - Tempo relativo de sala.
  - Iniciais e cores de avatar.
  - `gameName`, `host` e `winner` como strings duplicadas.
  - Cards "em breve" e toasts de entrada/criacao sem fluxo real.

## Conclusao

Todas as telas e acoes principais do frontend atual foram mapeadas. O fluxo de
partidas em `match-store` e a principal referencia funcional para o backend; os
mocks de jogos, salas, jogadores, ranking e historico devem ser usados apenas
como indicacao de produto e formato de tela.
