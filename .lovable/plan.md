## HolyPlay — Plataforma visual de jogos cristãos

Como você pediu para eu decidir, vou seguir com a direção **HolyPlay** (dark mode moderno com roxo) — combina com o requisito "dark mode elegante" do brief e transmite "tecnologia moderna sem parecer corporativa".

Tudo será **somente visual e navegável**, com dados mockados. Sem backend, autenticação, websocket ou lógica de jogo.

### Identidade visual

- **Nome:** HolyPlay
- **Paleta (dark):** fundo `#0f172a` (slate-900), superfície `#1e293b`, primária roxo `#8b5cf6`, secundária `#c084fc`, sucesso `#10b981`, texto slate-200/400
- **Paleta (light):** branco, slate-50/100, mesma primária roxa
- **Tipografia:** Outfit (display + texto), via `@fontsource/outfit`
- **Componentes:** shadcn (já no projeto) + ícones `lucide-react`
- **Cantos:** generosos (rounded-2xl em cards, rounded-xl em botões)
- **Toggle dark/light** no topbar (default dark)

### Estrutura de rotas (TanStack Router, arquivos em `src/routes/`)

- `__root.tsx` — shell com `<SidebarProvider>`, `<AppSidebar />`, `<Topbar />` e `<Outlet />`
- `index.tsx` → `/` — Dashboard (hero, grid de jogos, ranking resumido, salas ao vivo)
- `games.tsx` → `/games` — Lista completa de jogos com filtros
- `games.create.tsx` → `/games/create` — Formulário visual de criação (steps: info → perguntas mock → revisão)
- `rooms.tsx` → `/rooms` — Salas ao vivo (lista de salas com participantes, código PIN)
- `ranking.tsx` → `/ranking` — Tabela de ranking com pódio top 3 + lista
- `players.tsx` → `/players` — Grid/tabela de jogadores com avatar, pontos, nível
- `history.tsx` → `/history` — Histórico de partidas (timeline/tabela)
- `settings.tsx` → `/settings` — Tabs: perfil da igreja, aparência, notificações
- `coming-soon.tsx` → `/coming-soon` — Estado vazio "Em breve" reutilizável

Cada rota terá `head()` com title e description próprios.

### Componentes (`src/components/`)

- `layout/AppSidebar.tsx` — sidebar shadcn com grupos: Principal (Início, Jogos, Salas, Ranking) / Comunidade (Jogadores, Histórico) / Gestão (Criar jogo, Configurações). Collapsible em ícones.
- `layout/Topbar.tsx` — busca, toggle tema, notificações, avatar da igreja
- `games/GameCard.tsx` — card com ícone colorido, nome, descrição, badge status (ativo/beta/manutenção/em breve), contagem de jogadores, botão Entrar
- `games/StatusBadge.tsx` — variantes por status
- `games/ComingSoonCard.tsx` — placeholder tracejado
- `dashboard/HeroBanner.tsx` — banner de boas-vindas com gradiente
- `dashboard/RankingPreview.tsx` — top 3 resumido
- `dashboard/LiveRoomsPreview.tsx` — salas ativas resumidas
- `rooms/RoomCard.tsx`, `ranking/RankingRow.tsx`, `players/PlayerRow.tsx`, `history/MatchRow.tsx`
- `common/EmptyState.tsx`, `common/PageHeader.tsx`

### Dados mockados (`src/lib/mock-data.ts`)

- 6 jogos: Quiz Bíblico (ativo), Versículo Completo (beta), Quem é o Personagem? (ativo), Adivinhe o Louvor (manutenção), Verdadeiro ou Falso (ativo), Corrida de Perguntas (ativo) + 2 slots "em breve"
- ~12 jogadores fictícios com nomes, avatares (placeholder colorido), pontos
- ~5 salas ao vivo com código PIN, jogo, participantes
- ~10 partidas no histórico com data, jogo, vencedor, duração

### Detalhes técnicos

- Tailwind tokens em `src/styles.css` (variáveis `oklch` já existentes, ajustadas para a paleta roxa)
- Sidebar com `collapsible="icon"`, `SidebarTrigger` no topbar
- Responsivo: sidebar vira sheet no mobile (shadcn já faz isso)
- Sem chamadas a API, sem `createServerFn`, sem Supabase
- Botões "Entrar", "Criar", "Salvar" só navegam ou mostram toast (sonner já disponível)

### Fora do escopo

- Backend, auth, banco
- Lógica real de jogo, websocket, salas multiplayer
- Geração de imagens (uso ícones lucide + blocos coloridos)

Após sua aprovação, implemento tudo de uma vez.