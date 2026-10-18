"use client";

import { usePasswordStrength } from "../types";

const barColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-emerald-500",
];

export type PasswordStrengthMeterProps = {
  password: string;
  userInputs?: string[];
  showSuggestions?: boolean;
};

export function PasswordStrengthMeter({
  password,
  userInputs,
  showSuggestions = true,
}: PasswordStrengthMeterProps) {
  const { strength } = usePasswordStrength(password, userInputs);

  if (!password || !strength) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= strength.score ? barColors[strength.score] : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <p className="text-xs font-medium text-slate-600">{strength.label}</p>

      {strength.warning && (
        <p className="text-[11px] text-amber-600">{strength.warning}</p>
      )}

      {showSuggestions && strength.suggestions.length > 0 && (
        <ul className="text-[11px] text-slate-500 space-y-0.5">
          {strength.suggestions.map((suggestion, i) => (
            <li key={i}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}