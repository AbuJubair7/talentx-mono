/**
 * Formats a UTC timestamp string (ISO 8601 or "yyyy-MM-dd HH:mm:ss")
 * into the user's local timezone as "yyyy-MM-dd HH:mm:ss".
 */
export function formatToLocalTime(utcTimestampString: string): string {
  if (!utcTimestampString) {
    return "";
  }

  const utcNormalized = utcTimestampString.includes("T")
    ? (utcTimestampString.endsWith("Z") ? utcTimestampString : `${utcTimestampString}Z`)
    : `${utcTimestampString.replace(" ", "T")}Z`;

  const date = new Date(utcNormalized);
  if (Number.isNaN(date.getTime())) {
    return utcTimestampString;
  }

  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
