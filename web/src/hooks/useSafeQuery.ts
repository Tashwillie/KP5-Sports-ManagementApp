import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Safe wrapper for useQuery that handles QueryClient availability
export function useSafeQuery<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError> & { fallbackData?: TData }
) {
  const [hasQueryClient, setHasQueryClient] = useState(false);
  const [fallbackData, setFallbackData] = useState<TData | undefined>(options.fallbackData);

  useEffect(() => {
    // Check if QueryClient is available
    try {
      const queryClient = useQueryClient();
      setHasQueryClient(!!queryClient);
    } catch {
      setHasQueryClient(false);
    }
  }, []);

  if (!hasQueryClient) {
    return {
      data: fallbackData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
      isFetching: false,
      refetch: () => Promise.resolve(),
    };
  }

  return useQuery(options);
}

// Safe wrapper for useMutation
export function useSafeMutation<TData = unknown, TError = unknown, TVariables = unknown>(
  options: UseMutationOptions<TData, TError, TVariables>
) {
  const [hasQueryClient, setHasQueryClient] = useState(false);

  useEffect(() => {
    try {
      const queryClient = useQueryClient();
      setHasQueryClient(!!queryClient);
    } catch {
      setHasQueryClient(false);
    }
  }, []);

  if (!hasQueryClient) {
    return {
      mutate: () => {},
      mutateAsync: () => Promise.resolve() as Promise<TData>,
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: () => {},
    };
  }

  return useMutation(options);
} 