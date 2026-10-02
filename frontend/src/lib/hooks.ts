import { useQuery } from "@tanstack/react-query";
import { apiGet, ApiError } from "./api";
import type { Summary, User } from "./types";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<User>("/auth/me"),
    retry: false,
    staleTime: 60_000,
  });
}

export function useSummary(enabled = true) {
  return useQuery({
    queryKey: ["summary"],
    queryFn: () => apiGet<Summary>("/summary"),
    enabled,
    retry: false,
  });
}

export function errMsg(err: unknown, fallback = "Terjadi kendala, silakan coba lagi."): string {
  if (err instanceof ApiError) {
    const body = err.body as { detail?: unknown } | null;
    if (body && typeof body.detail === "string") return body.detail;
    if (body && Array.isArray(body.detail)) return "Mohon periksa kembali isian Anda.";
  }
  return fallback;
}
