### Fase 17: Remover Mocks Gradualmente

Objetivo: eliminar fontes falsas de verdade.

Arquivos envolvidos:

- `src/lib/mock-data.ts`
- `src/lib/match-store.ts`

Criar:

- Adaptadores temporarios se necessario.

Alterar:

- Rotas restantes.

Remover:

- Mocks apenas quando nao houver importadores.

Criterio de conclusao:

- `rg "mock-data|useMatchStore"` nao encontra uso funcional.

Riscos:

- Remover store antes de realtime estar pronto.
