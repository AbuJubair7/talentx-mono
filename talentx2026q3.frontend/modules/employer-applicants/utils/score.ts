export type AiScoreBand = 'strong' | 'good' | 'moderate' | 'low';

export const AI_SCORE_BAND_STYLES: Record<AiScoreBand, { stroke: string; text: string }> = {
  strong: { stroke: '#0F6E56', text: 'text-[#0F6E56]' },
  good: { stroke: '#475569', text: 'text-slate-600' },
  moderate: { stroke: '#92700C', text: 'text-amber-700' },
  low: { stroke: '#94a3b8', text: 'text-slate-400' },
};

export function getAiScoreBand(score: number): AiScoreBand {
  if (score >= 85) return 'strong';
  if (score >= 70) return 'good';
  if (score >= 50) return 'moderate';
  return 'low';
}
