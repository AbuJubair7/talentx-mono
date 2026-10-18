'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lightbulb, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { MAX_ANSWER_LENGTH } from '../constants';
import type { PrepQuestion, SaveState } from '../types';

interface QuestionItemProps {
  question: PrepQuestion;
  practiced: boolean;
  answer: string;
  saveState?: SaveState;
  onTogglePracticed: () => void;
  onAnswerChange: (text: string) => void;
}

function saveIndicator(saveState: SaveState): string {
  switch (saveState) {
    case 'saving':
      return 'Saving…';
    case 'saved':
      return 'Saved';
    case 'error':
      return 'Not saved';
    default:
      return '';
  }
}

function counterTone(length: number): string {
  if (length >= MAX_ANSWER_LENGTH) return 'text-danger';
  if (length >= Math.floor(MAX_ANSWER_LENGTH * 0.9)) return 'text-amber-700';
  return 'text-ink-subtle';
}

export function QuestionItem({
  question,
  practiced,
  answer,
  saveState = 'idle',
  onTogglePracticed,
  onAnswerChange,
}: QuestionItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const inputId = useId();
  const expandable = Boolean(question.tip);

  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
        <button
          type="button"
          role="checkbox"
          aria-checked={practiced}
          aria-label={practiced ? 'Mark as not practiced' : 'Mark as practiced'}
          onClick={onTogglePracticed}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
            practiced
              ? 'border-success bg-success text-white'
              : 'border-line-strong bg-surface hover:border-ink-subtle'
          }`}
        >
          {practiced && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
        </button>

        <span className={`flex-1 text-[15px] leading-6 ${practiced ? 'text-ink-muted' : 'text-ink'}`}>
          {question.question}
        </span>

        {expandable && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'Hide how to approach' : 'Show how to approach'}
            title="How to approach it"
            onClick={() => setOpen((o) => !o)}
            className={`-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              open
                ? 'bg-brand/10 text-brand'
                : 'text-ink-subtle hover:bg-brand/10 hover:text-brand'
            }`}
          >
            <Lightbulb className="h-4.5 w-4.5" aria-hidden />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 pl-12 pr-5 sm:pl-[52px]">
              <p className="text-xs font-medium text-ink-subtle">How to approach it</p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">{question.tip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-4 pl-12 pr-5 sm:pl-[52px]">
        <label htmlFor={inputId} className="sr-only">
          Your answer to: {question.question}
        </label>
        <Textarea
          id={inputId}
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="Type your answer…"
          maxLength={MAX_ANSWER_LENGTH}
          rows={2}
          className="min-h-16 resize-y rounded-xl border-line-strong bg-canvas placeholder:text-ink-subtle focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-brand"
        />
        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-ink-subtle">
            Your answer autosaves and is only used for your AI evaluation.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            {answer.length > 0 && (
              <span
                className={`text-xs tabular-nums ${counterTone(answer.length)}`}
              >
                {answer.length} / {MAX_ANSWER_LENGTH}
              </span>
            )}
            <span
              aria-live="polite"
              className={`flex shrink-0 items-center gap-1 text-xs ${
                saveState === 'error' ? 'text-danger' : 'text-ink-muted'
              }`}
            >
              {saveState === 'saving' && (
                <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden />
              )}
              {saveIndicator(saveState)}
            </span>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
