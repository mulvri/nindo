/**
 * Generic hook for async data fetching
 * Reduces boilerplate for useState + useEffect + async load pattern
 */

import { DependencyList, useCallback, useEffect, useState } from "react";

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching async data with loading and error states
 *
 * @example
 * const { data, loading, error, refetch } = useAsyncData(
 *   () => getMoodHistory(30),
 *   [someDepedency]
 * );
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = []
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("useAsyncData error:", err);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching async data with initial value
 *
 * @example
 * const { data, loading, refetch } = useAsyncDataWithDefault(
 *   () => getMoodStats(),
 *   { moodCounts: {}, percentages: {} },
 *   []
 * );
 */
export function useAsyncDataWithDefault<T>(
  fetcher: () => Promise<T>,
  defaultValue: T,
  deps: DependencyList = []
): Omit<AsyncDataState<T>, "data"> & { data: T } {
  const { data, ...rest } = useAsyncData(fetcher, deps);
  return { data: data ?? defaultValue, ...rest };
}
