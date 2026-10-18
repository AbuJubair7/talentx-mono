"use client";

import { useEffect, useState } from "react";
import type { PasswordStrengthResult } from "../types";

export function usePasswordStrength(
  password: string,
  userInputs: string[] = []
) {
  const [strength, setStrength] = useState<PasswordStrengthResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!password) {
      setStrength(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const timeout = setTimeout(() => {
      import("../services/get-password-strength").then(({ getPasswordStrength }) => {
        if (cancelled) return;
        setStrength(getPasswordStrength(password, userInputs));
        setIsLoading(false);
      });
    }, 150); // small debounce so it doesn't recompute on every single keystroke

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, ...userInputs]);

  return { strength, isLoading };
}