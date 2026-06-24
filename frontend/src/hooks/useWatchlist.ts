"use client";
import useSWR from "swr";
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/api";
import { WatchlistItem } from "@/types/watchlist";

export function useWatchlist() {
  const { data, isLoading, mutate } = useSWR<WatchlistItem[]>(
    "watchlist",
    fetchWatchlist,
    { revalidateOnFocus: false }
  );

  const add = async (ticker: string) => {
    try {
      await addToWatchlist(ticker);
      await mutate();
    } catch (e) {
      console.error("Failed to add to watchlist", e);
    }
  };

  const remove = async (ticker: string) => {
    try {
      await removeFromWatchlist(ticker);
      await mutate();
    } catch (e) {
      console.error("Failed to remove from watchlist", e);
    }
  };

  const isWatched = (ticker: string) =>
    data?.some((item) => item.ticker === ticker) ?? false;

  return {
    watchlist: data ?? [],
    isLoading,
    add,
    remove,
    isWatched,
    refresh: mutate,
  };
}
