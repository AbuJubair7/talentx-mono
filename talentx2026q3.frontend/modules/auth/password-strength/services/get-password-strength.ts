import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
};

const zxcvbn = new ZxcvbnFactory(options);

export type PasswordStrengthResult = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Strong" | "Very strong";
  warning: string | null;
  suggestions: string[];
  crackTimeDisplay: string;
};

const labels: PasswordStrengthResult["label"][] = [
  "Very weak",
  "Weak",
  "Fair",
  "Strong",
  "Very strong",
];

export function getPasswordStrength(
  password: string,
  userInputs: string[] = []
): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: "Very weak",
      warning: null,
      suggestions: [],
      crackTimeDisplay: "",
    };
  }

  const result = zxcvbn.check(password, userInputs);

  return {
    score: result.score,
    label: labels[result.score],
    warning: result.feedback.warning || null,
    suggestions: result.feedback.suggestions,
    crackTimeDisplay: result.crackTimes.offlineSlowHashingXPerSecond.display,
  };
}