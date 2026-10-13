import { createFileRoute } from "@tanstack/react-router";

import { PublicLanding } from "@/components/landing/PublicLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rodada — Plataforma de jogos" },
      {
        name: "description",
        content:
          "Jogos interativos. Crie partidas ao vivo e engaje participantes em segundos.",
      },
    ],
  }),
  component: PublicLanding,
});
