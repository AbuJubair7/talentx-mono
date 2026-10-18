'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-invalid'?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const HOURS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

function parseDateValue(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatToInputValue(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

function formatToDisplayValue(date: Date | null): string {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hoursStr = String(hours).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hoursStr}:${mins} ${period}`;
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  placeholder = 'MM/DD/YYYY hh:mm AM/PM',
  disabled = false,
  className,
  id,
  name,
  'aria-invalid': ariaInvalid,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const [popoverPos, setPopoverPos] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const parsedDate = parseDateValue(value);
  const displayValue = formatToDisplayValue(parsedDate);
  const inputValue = formatToInputValue(parsedDate);

  // Temporary selection state inside popover
  const now = React.useMemo(() => new Date(), []);
  const initialDate = parsedDate || now;

  const [viewYear, setViewYear] = React.useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState<number>(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = React.useState<number>(initialDate.getDate());
  
  const initialHours24 = initialDate.getHours();
  const initialPeriod = initialHours24 >= 12 ? 'PM' : 'AM';
  const initialHours12Str = String(initialHours24 % 12 || 12).padStart(2, '0');
  const initialMinsStr = String(Math.floor(initialDate.getMinutes() / 5) * 5).padStart(2, '0');

  const [selectedHour, setSelectedHour] = React.useState<string>(initialHours12Str);
  const [selectedMinute, setSelectedMinute] = React.useState<string>(initialMinsStr);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'AM' | 'PM'>(initialPeriod);

  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);

  // Calculate position when opening or scrolling/resizing
  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 310;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top: number;
    if (spaceBelow < popoverHeight && spaceAbove > popoverHeight) {
      // Open above
      top = rect.top - popoverHeight - 6;
    } else {
      // Open below
      top = rect.bottom + 6;
    }

    let left = rect.left;
    const popoverWidth = 340;
    if (left + popoverWidth > window.innerWidth) {
      left = Math.max(10, window.innerWidth - popoverWidth - 10);
    }

    setPopoverPos({ top, left });
  }, []);

  const handleOpenPopover = () => {
    if (disabled) return;
    const base = parseDateValue(value) || new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setSelectedDay(base.getDate());

    const h24 = base.getHours();
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = String(h24 % 12 || 12).padStart(2, '0');
    const m = String(Math.floor(base.getMinutes() / 5) * 5).padStart(2, '0');

    setSelectedHour(h12);
    setSelectedMinute(m);
    setSelectedPeriod(period);
    setIsSelectorOpen(false);
    
    updatePosition();
    setIsOpen(true);
  };

  const handleClosePopover = () => {
    setIsOpen(false);
    setIsSelectorOpen(false);
    onBlur?.();
  };

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      handleClosePopover();
    } else {
      handleOpenPopover();
    }
  };

  // Close on outside click, window resize/scroll, or Escape
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        handleClosePopover();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClosePopover();
      }
    }

    function handleScrollOrResize() {
      updatePosition();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Calendar calculations
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const leadingDays = Array.from({ length: firstDayOfWeek }, (_, i) => prevMonthDays - firstDayOfWeek + 1 + i);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && hour24 < 12) hour24 += 12;
    if (selectedPeriod === 'AM' && hour24 === 12) hour24 = 0;

    const minute = parseInt(selectedMinute, 10);
    const dateObj = new Date(viewYear, viewMonth, selectedDay, hour24, minute);

    const formattedIsoLocal = formatToInputValue(dateObj);
    onChange?.(formattedIsoLocal);
    handleClosePopover();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleClosePopover();
  };

  const handleNativeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange?.(newVal);
  };

  return (
    <div ref={triggerRef} className={cn('relative w-full inline-block', className)}>
      {/* Hidden native datetime input for form library & testing compatibility */}
      <input
        type="datetime-local"
        id={id}
        name={name}
        aria-invalid={ariaInvalid}
        value={inputValue}
        onChange={handleNativeInputChange}
        disabled={disabled}
        className="sr-only opacity-0 absolute pointer-events-none -z-10 w-0 h-0"
        tabIndex={-1}
      />

      {/* Input Trigger */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={cn(
          'flex items-center justify-between h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs transition-colors cursor-pointer hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0',
          isOpen && 'border-emerald-600',
          ariaInvalid && 'border-red-500 focus:border-red-500 focus:ring-0',
          disabled && 'cursor-not-allowed opacity-50 bg-slate-50'
        )}
      >
        <span className={cn('truncate', !displayValue && 'text-slate-400')}>
          {displayValue || placeholder}
        </span>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className="text-slate-500 hover:text-slate-700 focus:outline-none cursor-pointer"
        >
          <CalendarIcon className="size-4" />
        </button>
      </div>

      {/* Popover Card Portaled directly to document.body */}
      {isOpen && mounted && createPortal(
        <div
          ref={popoverRef}
          data-testid="datetime-picker-popover"
          style={{
            position: 'fixed',
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
          }}
          className="z-[99999] shadow-2xl rounded-lg bg-white text-slate-900 border border-slate-200 overflow-hidden select-none w-[340px] animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="flex flex-row p-3 gap-3 border-b border-slate-100">
            {/* Left Calendar Panel */}
            <div className="w-[190px] flex flex-col justify-between">
              {/* Header: Month Year & Navigation */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-emerald-50"
                >
                  {MONTH_NAMES[viewMonth]} {viewYear}
                  <ChevronDown className="size-3.5 text-slate-500" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Month/Year selector mode or standard days grid */}
              {isSelectorOpen ? (
                <div className="h-[180px] overflow-y-auto space-y-3 p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Month</label>
                    <div className="grid grid-cols-3 gap-1">
                      {MONTH_NAMES.map((m, idx) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setViewMonth(idx);
                            setIsSelectorOpen(false);
                          }}
                          className={cn(
                            'text-xs py-1 rounded text-center cursor-pointer transition-colors',
                            viewMonth === idx ? 'bg-emerald-600 text-white font-bold' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          )}
                        >
                          {m.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Year</label>
                    <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {Array.from({ length: 15 }, (_, i) => viewYear - 5 + i).map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => {
                            setViewYear(y);
                            setIsSelectorOpen(false);
                          }}
                          className={cn(
                            'text-xs py-1 rounded text-center cursor-pointer transition-colors',
                            viewYear === y ? 'bg-emerald-600 text-white font-bold' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          )}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {WEEKDAYS.map((day, idx) => (
                      <span key={idx} className="text-[11px] font-medium text-slate-400">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {leadingDays.map((d, idx) => (
                      <span
                        key={`leading-${idx}`}
                        className="text-xs text-slate-300 size-6 flex items-center justify-center mx-auto select-none"
                      >
                        {d}
                      </span>
                    ))}
                    {currentMonthDays.map((d) => {
                      const isSelected = d === selectedDay;
                      return (
                        <button
                          key={`day-${d}`}
                          type="button"
                          aria-label={`Day ${d}`}
                          onClick={() => setSelectedDay(d)}
                          className={cn(
                            'text-xs size-6 flex items-center justify-center mx-auto transition-colors cursor-pointer rounded-full',
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          )}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Vertical Separator */}
            <div className="w-px bg-slate-200 my-1" />

            {/* Right Time Columns Panel */}
            <div className="flex flex-row gap-1 items-start">
              {/* Hours Column */}
              <div className="flex flex-col items-center">
                <div className="h-[180px] overflow-y-auto space-y-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {HOURS.map((h) => {
                    const isSelected = selectedHour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setSelectedHour(h)}
                        className={cn(
                          'w-8 text-xs py-1 rounded text-center cursor-pointer transition-colors block',
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        )}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="flex flex-col items-center">
                <div className="h-[180px] overflow-y-auto space-y-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {MINUTES.map((m) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMinute(m)}
                        className={cn(
                          'w-8 text-xs py-1 rounded text-center cursor-pointer transition-colors block',
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        )}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Period Column */}
              <div className="flex flex-col items-center space-y-1 px-1">
                {(['AM', 'PM'] as const).map((p) => {
                  const isSelected = selectedPeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPeriod(p)}
                      className={cn(
                        'w-8 text-xs py-1 rounded text-center cursor-pointer transition-colors block',
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="px-4 py-2.5 flex items-center justify-end gap-5 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCancel}
              className="text-slate-600 hover:text-slate-900 font-semibold text-xs uppercase tracking-wider cursor-pointer bg-transparent border-0"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="text-emerald-600 hover:text-emerald-700 font-bold text-xs uppercase tracking-wider cursor-pointer bg-transparent border-0"
            >
              OK
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
