import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/create-game")({
  beforeLoad: () => {
    throw redirect({ to: "/matches/new" });
  },
});
