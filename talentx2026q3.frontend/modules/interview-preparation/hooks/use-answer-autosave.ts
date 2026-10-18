'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ANSWER_AUTOSAVE_DEBOUNCE_MS,
  answerKey,
  buildAnswerMap,
  parseAnswerKey,
} from '../constants';
import type {
  AnswerEntry,
  AnswerMap,
  InterviewPreparationDto,
  SaveAnswerPayload,
  SaveState,
} from '../types';
import { useSaveAnswer } from './use-save-answer';

export interface AnswerAutosave {
  answers: AnswerMap;
  saveStates: Record<string, SaveState>;
  handleAnswerChange: (key: string, text: string) => void;
  togglePracticed: (key: string) => void;
  reset: () => void;
}

export function useAnswerAutosave(
  invitationId: string,
  prep: InterviewPreparationDto | undefined,
): AnswerAutosave {
  const { mutate: saveAnswer } = useSaveAnswer();

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  const answersRef = useRef<AnswerMap>({});
  const savedPayloadsRef = useRef<Map<string, SaveAnswerPayload>>(new Map());
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const hydratedRef = useRef<string | null>(null);

  answersRef.current = answers;

  useEffect(() => {
    if (!prep) return;
    const hydrationKey = `${prep.id}::${prep.generationCount}`;
    if (hydratedRef.current === hydrationKey) return;
    hydratedRef.current = hydrationKey;

    setAnswers(buildAnswerMap(prep.answers));
    setSaveStates({});
    savedPayloadsRef.current = new Map(
      prep.answers.map((answer) => [
        answerKey(answer.category, answer.questionIndex, answer.question),
        {
          category: answer.category,
          questionIndex: answer.questionIndex,
          answer: answer.answer,
          practiced: answer.practiced,
        },
      ]),
    );
    for (const timer of debounceTimersRef.current.values()) clearTimeout(timer);
    debounceTimersRef.current.clear();
  }, [prep]);

  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      for (const [key, timer] of timers) {
        clearTimeout(timer);
        timers.delete(key);
        const entry = answersRef.current[key];
        if (entry) commitAnswer(key, entry);
      }
    };
    // Commit only runs on unmount; timers map identity is stable via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commitAnswer(key: string, entry: AnswerEntry) {
    const payload: SaveAnswerPayload = {
      ...parseAnswerKey(key),
      answer: entry.text,
      practiced: entry.practiced,
    };
    const saved = savedPayloadsRef.current.get(key);
    if (saved && saved.answer === payload.answer && saved.practiced === payload.practiced) {
      return;
    }

    setSaveStates((prev) => ({ ...prev, [key]: 'saving' }));
    saveAnswer(
      { invitationId, payload },
      {
        onSuccess: () => {
          savedPayloadsRef.current.set(key, payload);
          setSaveStates((prev) => ({ ...prev, [key]: 'saved' }));
        },
        onError: () => {
          setSaveStates((prev) => ({ ...prev, [key]: 'error' }));
        },
      },
    );
  }

  function scheduleSave(key: string) {
    const existingTimer = debounceTimersRef.current.get(key);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(() => {
      debounceTimersRef.current.delete(key);
      const entry = answersRef.current[key];
      if (entry) commitAnswer(key, entry);
    }, ANSWER_AUTOSAVE_DEBOUNCE_MS);
    debounceTimersRef.current.set(key, timer);
  }

  function handleAnswerChange(key: string, text: string) {
    setAnswers((prev) => ({
      ...prev,
      [key]: { text, practiced: prev[key]?.practiced ?? false },
    }));
    setSaveStates((prev) => (prev[key] === 'saved' ? { ...prev, [key]: 'idle' } : prev));
    scheduleSave(key);
  }

  function togglePracticed(key: string) {
    const entry = answersRef.current[key] ?? { text: '', practiced: false };
    const updated: AnswerEntry = { ...entry, practiced: !entry.practiced };
    setAnswers((prev) => ({ ...prev, [key]: updated }));

    const pendingTimer = debounceTimersRef.current.get(key);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      debounceTimersRef.current.delete(key);
    }
    commitAnswer(key, updated);
  }

  function reset() {
    setAnswers({});
    setSaveStates({});
    savedPayloadsRef.current = new Map();
    for (const timer of debounceTimersRef.current.values()) clearTimeout(timer);
    debounceTimersRef.current.clear();
  }

  return { answers, saveStates, handleAnswerChange, togglePracticed, reset };
}
