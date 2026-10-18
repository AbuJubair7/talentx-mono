'use client';

import { useQuery } from '@tanstack/react-query';
import { getFallbackQuote, getMotivationalQuote } from '../services/quote.service';

export function useMotivationalQuote() {
  const query = useQuery({
    queryKey: ['motivational-quote'],
    queryFn: getMotivationalQuote,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const fallback = getFallbackQuote();

  return {
    quote: query.data?.quote ?? fallback.quote,
    author: query.data?.author ?? fallback.author,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
