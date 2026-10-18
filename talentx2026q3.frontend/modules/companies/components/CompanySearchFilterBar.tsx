'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { CompanyFilterParams } from '../types/company-list.types';

interface CompanySearchFilterBarProps {
  filters: CompanyFilterParams;
  onKeywordChange: (keyword: string) => void;
  onLocationChange?: (location: string) => void;
}

const DEBOUNCE_MS = 400;

export function CompanySearchFilterBar({
  filters,
  onKeywordChange,
}: CompanySearchFilterBarProps) {
  const [prevKeyword, setPrevKeyword] = useState(filters.keyword ?? '');
  const [keywordInput, setKeywordInput] = useState(filters.keyword ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const committedKeyword = filters.keyword ?? '';
  if (committedKeyword !== prevKeyword) {
    setPrevKeyword(committedKeyword);
    setKeywordInput(committedKeyword);
  }

  // Filter live as the user stops typing — no submit button or Enter needed.
  useEffect(() => {
    if (keywordInput === committedKeyword) return;
    const timer = setTimeout(() => {
      onKeywordChange(keywordInput.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keywordInput, committedKeyword, onKeywordChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Enter commits the field immediately instead of waiting for the debounce.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onKeywordChange(keywordInput.trim());
  };

  const clearButtonClassName =
    'text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200/60 cursor-pointer shrink-0';

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search companies"
      className="w-full"
    >
      <div className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 h-12 focus-within:border-teal-600/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-600/15 transition">
        <Search className="size-4.5 text-slate-400 shrink-0" />
        <span className="sr-only">Search by company name, industry, or location</span>
        <input
          ref={inputRef}
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          placeholder="Search by company name, industry, or location…"
          aria-label="Search by company name, industry, or location"
          className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-[15px]"
        />
        {keywordInput && (
          <button
            type="button"
            onClick={() => {
              setKeywordInput('');
              onKeywordChange('');
            }}
            aria-label="Clear company search"
            className={clearButtonClassName}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
