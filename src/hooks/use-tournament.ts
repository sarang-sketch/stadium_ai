'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  Tournament,
  Match,
  MatchPrediction,
  FixtureGenerationResult,
} from '@/types';

/**
 * Standard success envelope returned by the API route handlers
 * (`{ success: true, data: ... }`).
 */
interface ApiEnvelope<T> {
  success?: boolean;
  data: T;
}

/**
 * Fetch JSON from an API route, unwrapping the `{ data }` envelope and
 * throwing on a non-OK response. Accepts an AbortSignal for unmount cleanup.
 */
async function fetchJson<T>(
  input: string,
  signal: AbortSignal,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, { ...init, signal });
  if (!res.ok) {
    throw new Error(`Request to ${input} failed with status ${res.status}`);
  }
  const body: ApiEnvelope<T> = await res.json();
  return body.data;
}

/**
 * Hook for paginated tournament list
 */
export function useTournaments(page = 1) {
  const [data, setData] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchJson<Tournament[]>(
          `/api/tournament?page=${page}`,
          controller.signal
        );
        setData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [page]);

  return { data, isLoading, error };
}

/**
 * Hook for single tournament
 */
export function useTournament(id: string) {
  const [data, setData] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchJson<Tournament>(
          `/api/tournament/${id}`,
          controller.signal
        );
        setData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [id]);

  return { data, isLoading, error };
}

/**
 * Hook for tournament matches
 */
export function useMatches(tournamentId: string) {
  const [data, setData] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchJson<Match[]>(
          `/api/tournament/${tournamentId}/matches`,
          controller.signal
        );
        setData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [tournamentId]);

  return { data, isLoading, error };
}

/**
 * Hook for AI prediction
 */
export function useMatchPrediction(matchId: string) {
  const [data, setData] = useState<MatchPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchJson<MatchPrediction>(
          `/api/tournament/${matchId}/predict`,
          controller.signal
        );
        setData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [matchId]);

  return { data, isLoading, error };
}

/**
 * Hook to trigger fixture gen
 */
export function useFixtureGeneration(tournamentId: string) {
  const [data, setData] = useState<FixtureGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchJson<FixtureGenerationResult>(
        `/api/tournament/${tournamentId}/matches`,
        controller.signal,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      setData(result);
      return result;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error(String(err));
      setError(normalized);
      throw normalized;
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  return { generate, data, isLoading, error };
}
