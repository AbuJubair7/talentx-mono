interface QuoteSlateResponse {
  id: number;
  quote: string;
  author: string;
  length: number;
  tags: string[];
}

const QUOTE_URL =
  'https://quoteslate.vercel.app/api/quotes/random?minLength=20&maxLength=80&tags=motivation';
const QUOTE_TIMEOUT_MS = 5000;

// Local fallback pool used when the external quote API is unreachable.
// Rotated daily so the greeting still feels fresh offline.
export const FALLBACK_QUOTES: { quote: string; author: string }[] = [
  {
    quote: 'Every application is a step closer to your next opportunity.',
    author: '',
  },
  {
    quote: 'Small progress every day leads to big results.',
    author: '',
  },
  {
    quote: 'Your next role is one application away. Keep going.',
    author: '',
  },
];

export function getFallbackQuote(date = new Date()): {
  quote: string;
  author: string;
} {
  const dayIndex =
    Math.floor(date.getTime() / (24 * 60 * 60 * 1000)) %
    FALLBACK_QUOTES.length;
  return FALLBACK_QUOTES[((dayIndex % FALLBACK_QUOTES.length) + FALLBACK_QUOTES.length) % FALLBACK_QUOTES.length];
}

export async function getMotivationalQuote(): Promise<{
  quote: string;
  author: string;
}> {
  const res = await fetch(QUOTE_URL, {
    signal: AbortSignal.timeout(QUOTE_TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`Quote API returned ${res.status}`);
  }

  const data: QuoteSlateResponse = await res.json();

  if (!data?.quote || typeof data.quote !== 'string') {
    throw new Error('Empty quote response');
  }

  return {
    quote: data.quote.trim(),
    author: typeof data.author === 'string' ? data.author.trim() : '',
  };
}
