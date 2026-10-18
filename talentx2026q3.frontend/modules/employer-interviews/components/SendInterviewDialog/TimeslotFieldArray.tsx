'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import type { SendInterviewFormValues } from '../../schemas/send-interview-schema';

interface TimeslotFieldArrayProps {
  control: Control<SendInterviewFormValues>;
  register: UseFormRegister<SendInterviewFormValues>;
  errors: FieldErrors<SendInterviewFormValues>;
}

export function TimeslotFieldArray({ control, register, errors }: TimeslotFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'timeslots' });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-900">
          Timeslots
          <span className="text-red-500">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ startTime: '', endTime: '', meetingUrl: '' })}
          className="h-8 gap-1 text-xs cursor-pointer"
        >
          <Plus className="size-3.5" />
          Add timeslot
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg text-center border border-dashed border-slate-200">
          No timeslots offered yet. The candidate will still see the meeting link/address above.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const slotErrors = errors.timeslots?.[index];
            return (
              <div
                key={field.id}
                className="p-4 rounded-lg border border-slate-200 bg-white space-y-3 relative"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                      Start time <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name={`timeslots.${index}.startTime` as const}
                      render={({ field: slotField }) => (
                        <DateTimePicker
                          value={slotField.value}
                          onChange={slotField.onChange}
                          onBlur={slotField.onBlur}
                          aria-invalid={Boolean(slotErrors?.startTime)}
                        />
                      )}
                    />
                    {slotErrors?.startTime ? (
                      <p className="mt-1 text-xs text-red-600">{slotErrors.startTime.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                      End time <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name={`timeslots.${index}.endTime` as const}
                      render={({ field: slotField }) => (
                        <DateTimePicker
                          value={slotField.value}
                          onChange={slotField.onChange}
                          onBlur={slotField.onBlur}
                          aria-invalid={Boolean(slotErrors?.endTime)}
                        />
                      )}
                    />
                    {slotErrors?.endTime ? (
                      <p className="mt-1 text-xs text-red-600">{slotErrors.endTime.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
