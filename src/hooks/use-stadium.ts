'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  VenueZoneMap,
  SeatRecommendationPreferences,
  SeatRecommendationResult,
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
 * Best evacuation route for a zone/exit pair returned by
 * `POST /api/stadium/emergency-route`.
 */
export interface EmergencyRoutePath {
  /** Ordered list of zone/exit identifiers describing the route to take. */
  route: string[];
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
 * Hook to fetch stadium data
 */
export function useStadiumData(matchId?: string) {
  const [data, setData] = useState<VenueZoneMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const query = matchId
          ? `?matchId=${encodeURIComponent(matchId)}`
          : '';
        const result = await fetchJson<VenueZoneMap>(
          `/api/stadium${query}`,
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
 * Hook to get AI recommendations
 */
export function useSeatRecommendations(prefs: SeatRecommendationPreferences) {
  const [data, setData] = useState<SeatRecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { matchId, budget, proximity, groupSize } = prefs;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const preferences: SeatRecommendationPreferences = {
          matchId,
          budget,
          proximity,
          groupSize,
        };
        const result = await fetchJson<SeatRecommendationResult>(
          '/api/stadium/seats/recommend',
          controller.signal,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
          }
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
  }, [matchId, budget, proximity, groupSize]);

  return { data, isLoading, error };
}

/**
 * Hook to get evacuation route
 */
export function useEmergencyRoute(zoneId: string, exitId: string) {
  const [data, setData] = useState<EmergencyRoutePath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const requestRoute = useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchJson<EmergencyRoutePath>(
        '/api/stadium/emergency-route',
        controller.signal,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zoneId, exitId }),
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
  }, [zoneId, exitId]);

  return { requestRoute, data, isLoading, error };
}
