import { useState } from "react";
import { Check, CheckCircle2, Pencil, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

const GOAL_PRESETS = [5, 10, 15, 20];

interface WeeklyGoalCardProps {
  currentGoalCount: number;
  weeklyGoal: number;
  onSaveGoal?: (newGoal: number) => void;
}

export function WeeklyGoalCard({
  currentGoalCount,
  weeklyGoal,
  onSaveGoal,
}: WeeklyGoalCardProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(
    weeklyGoal.toString()
  );

  const goalProgress = Math.min(
    100,
    Math.round(
      weeklyGoal > 0 ? (currentGoalCount / weeklyGoal) * 100 : 0
    )
  );
  const isGoalReached = currentGoalCount >= weeklyGoal && weeklyGoal > 0;
  const remaining = Math.max(0, weeklyGoal - currentGoalCount);

  const handleSave = (goalValue?: number) => {
    const valueToSave = goalValue ?? parseInt(customGoalInput, 10);
    if (!isNaN(valueToSave) && valueToSave > 0) {
      onSaveGoal?.(valueToSave);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
            >
              <Target className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Weekly application goal
              </p>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Job applications submitted in the last 7 days
              </p>
            </div>
          </div>

          {!isEditingGoal ? (
            <button
              type="button"
              onClick={() => {
                setCustomGoalInput(weeklyGoal.toString());
                setIsEditingGoal(true);
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              title="Edit weekly goal"
              aria-label="Edit weekly goal"
            >
              <Pencil className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              title="Cancel edit"
              aria-label="Cancel edit"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {isEditingGoal ? (
          <div className="space-y-2.5 rounded-md border border-slate-200/80 bg-slate-50 p-3">
            <p className="text-[11px] font-medium text-slate-500">
              How many jobs will you apply to per week?
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">
                Target:
              </span>
              {GOAL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSave(preset)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                    weeklyGoal === preset
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white border border-slate-200/80 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={100}
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsEditingGoal(false);
                }}
                placeholder="Custom"
                aria-label="Custom weekly application target"
                className="w-20 rounded-md border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
              />
              <button
                type="button"
                onClick={() => handleSave()}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <Check className="size-3" /> Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                {currentGoalCount}
              </span>
              <span className="text-sm font-medium text-slate-500">
                of {weeklyGoal} {weeklyGoal === 1 ? "application" : "applications"}
              </span>
              <span className="ml-auto text-[11px] font-medium text-slate-500">
                {goalProgress}% complete
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Weekly application goal progress"
              aria-valuenow={Math.min(currentGoalCount, weeklyGoal)}
              aria-valuemin={0}
              aria-valuemax={weeklyGoal}
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  isGoalReached
                    ? "bg-gradient-to-r from-emerald-700 to-emerald-500"
                    : "bg-emerald-700"
                )}
                style={{
                  width: `${goalProgress}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              {isGoalReached ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="size-3.5" /> Goal reached — nice work!
                </span>
              ) : (
                <span className="text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {remaining} more
                  </span>{" "}
                  to reach your goal
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
