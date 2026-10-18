'use client';

import { LucideIcon } from 'lucide-react';
import { QuestionItem } from './QuestionItem';
import { questionKey } from '../constants';
import type { AnswerMap, PrepQuestion, SaveState } from '../types';

interface QuestionCategoryCardProps {
  categoryKey: string;
  title: string;
  source?: string;
  icon: LucideIcon;
  questions: PrepQuestion[];
  answers: AnswerMap;
  saveStates?: Record<string, SaveState>;
  onTogglePracticed: (key: string) => void;
  onAnswerChange: (key: string, text: string) => void;
}

export function QuestionCategoryCard({
  categoryKey,
  title,
  source,
  icon: Icon,
  questions,
  answers,
  saveStates = {},
  onTogglePracticed,
  onAnswerChange,
}: QuestionCategoryCardProps) {
  if (!questions?.length) return null;

  return (
    <section>
      <div className="mb-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
          <Icon className="h-5 w-5 text-brand" aria-hidden />
          {title}
          <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-medium tabular-nums text-ink-muted ring-1 ring-line">
            {questions.length}
          </span>
        </h3>
        {source && <p className="mt-0.5 text-sm text-ink-subtle">{source}</p>}
      </div>

      <div className="overflow-hidden rounded-md border border-line bg-surface shadow-card">
        <ul className="divide-y divide-line">
          {questions.map((q, idx) => {
            const key = questionKey(categoryKey, idx, q);
            const entry = answers[key];
            return (
              <QuestionItem
                key={key}
                question={q}
                practiced={entry?.practiced ?? false}
                answer={entry?.text ?? ''}
                saveState={saveStates[key] ?? 'idle'}
                onTogglePracticed={() => onTogglePracticed(key)}
                onAnswerChange={(text) => onAnswerChange(key, text)}
              />
            );
          })}
        </ul>
      </div>
    </section>
  );
}
