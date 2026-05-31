import { useQuery } from "@tanstack/react-query";

import {
  listGames,
  listLiveRooms,
  listMatches,
  listPlayers,
  listRankings,
  type Game,
  type LiveRoom,
  type MatchSummary,
  type Player,
  type RankingEntry,
} from "@/lib/api-client";

export function useGamesQuery() {
  return useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: listGames,
    staleTime: 60_000,
  });
}

export function usePlayersQuery() {
  return useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: () => listPlayers(),
    staleTime: 30_000,
  });
}

export function useRankingQuery() {
  return useQuery<RankingEntry[]>({
    queryKey: ["ranking"],
    queryFn: () => listRankings(),
    staleTime: 30_000,
  });
}

export function useLiveRoomsQuery() {
  return useQuery<LiveRoom[]>({
    queryKey: ["live-rooms"],
    queryFn: listLiveRooms,
    staleTime: 10_000,
  });
}

export function useMatchesQuery() {
  return useQuery<MatchSummary[]>({
    queryKey: ["matches"],
    queryFn: () => listMatches(),
    staleTime: 10_000,
  });
}
