'use client';

import { CATEGORY_LABELS, evaluationBand, questionsForCategory } from '../constants';
import type { InterviewPreparationDto, QuestionFeedback } from '../types';

interface QuestionFeedbackItemProps {
  prep: InterviewPreparationDto;
  item: QuestionFeedback;
}

export function QuestionFeedbackItem({ prep, item }: QuestionFeedbackItemProps) {
  const question =
    questionsForCategory(prep, item.category)[item.questionIndex]?.question ?? null;
  const band = evaluationBand(item.score);

  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-ink-muted ring-1 ring-line">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          <p className="mt-2 text-sm font-medium leading-6 text-ink">
            {question ?? 'Question no longer available'}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-line ${band.className} bg-canvas`}
        >
          {Math.min(100, Math.max(0, item.score))}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{item.feedback}</p>
      {item.suggestedAnswer && (
        <div className="mt-2 rounded-md border border-ai-line bg-ai-soft px-3 py-2">
          <p className="text-xs font-medium text-ink-subtle">Suggested stronger answer</p>
          <p className="mt-0.5 text-sm leading-6 text-ink-muted">{item.suggestedAnswer}</p>
        </div>
      )}
    </li>
  );
}
