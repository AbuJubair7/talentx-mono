const FALLBACK_EMPLOYER_INITIAL = "E";
const EMPTY_DATE_PLACEHOLDER = "—";

export function getEmployerInitial(name?: string): string {
  if (!name || typeof name !== "string") {
    return FALLBACK_EMPLOYER_INITIAL;
  }
  const trimmedName = name.trim();
  return trimmedName.length > 0
    ? trimmedName.charAt(0).toUpperCase()
    : FALLBACK_EMPLOYER_INITIAL;
}

export function formatEmployerDate(
  isoString?: string | null,
  monthStyle: "short" | "long" = "short"
): string {
  if (!isoString) {
    return EMPTY_DATE_PLACEHOLDER;
  }
  const parsedDate = new Date(isoString);
  if (Number.isNaN(parsedDate.getTime())) {
    return isoString;
  }
  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: monthStyle,
    day: "numeric",
    timeZone: "UTC",
  });
}
