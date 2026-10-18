const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_ID_PATTERN = /^\d+$/;
const HEX_HASH_ID_PATTERN = /^[0-9a-f]{20,}$/i;

const UPPERCASE_ACRONYMS = new Set(["AI", "API", "UI", "ID", "URL"]);

const STATIC_SEGMENT_MAPPINGS: Record<string, string> = {
  admin: "Admin",
  "audit-log": "Audit Log",
  dashboard: "Dashboard",
  "job-listing": "My Jobs",
  jobpost: "Post a Job",
  job: "Jobs",
};

export function isIdentifierSegment(segment: string): boolean {
  return (
    UUID_PATTERN.test(segment) ||
    NUMERIC_ID_PATTERN.test(segment) ||
    HEX_HASH_ID_PATTERN.test(segment)
  );
}

export function formatSlugToTitleCase(slug: string): string {
  if (!slug) {
    return "";
  }

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }

  const separatedWords = decodedSlug
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z0-9])/g, "$1 $2")
    .replace(/[-_]+/g, " ");

  const rawWords = separatedWords.trim().split(/\s+/).filter(Boolean);

  const formattedWords = rawWords.map((word) => {
    const uppercaseVersion = word.toUpperCase();
    if (UPPERCASE_ACRONYMS.has(uppercaseVersion)) {
      return uppercaseVersion;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return formattedWords.join(" ");
}

export function parseBreadcrumbSegments(pathname: string): string[] {
  if (!pathname) {
    return ["Dashboard"];
  }

  const cleanPath = pathname.split(/[?#]/)[0] ?? "";
  const rawSegments = cleanPath.split("/").filter(Boolean);

  if (rawSegments.length === 0) {
    return ["Dashboard"];
  }

  const firstSegment = rawSegments[0]?.toLowerCase();

  if (firstSegment === "job") {
    const secondSegment = rawSegments[1]?.toLowerCase();
    const thirdSegment = rawSegments[2]?.toLowerCase();

    if (secondSegment === "job-listing") {
      if (rawSegments.length >= 3 && isIdentifierSegment(rawSegments[2])) {
        const remainingSegments = rawSegments
          .slice(3)
          .filter((segment) => !isIdentifierSegment(segment))
          .map(formatSlugToTitleCase);

        return ["My Jobs", "Job Details", ...remainingSegments];
      }

      const remainingSegments = rawSegments
        .slice(2)
        .filter((segment) => !isIdentifierSegment(segment))
        .map(formatSlugToTitleCase);

      return ["My Jobs", ...remainingSegments];
    }

    if (
      (rawSegments.length >= 3 &&
        isIdentifierSegment(rawSegments[1]) &&
        thirdSegment === "edit") ||
      (rawSegments.length >= 2 && secondSegment === "edit")
    ) {
      const startIndex = secondSegment === "edit" ? 2 : 3;
      const remainingSegments = rawSegments
        .slice(startIndex)
        .filter((segment) => !isIdentifierSegment(segment))
        .map(formatSlugToTitleCase);

      return ["My Jobs", "Edit Jobs", ...remainingSegments];
    }

    if (secondSegment === "jobpost") {
      const remainingSegments = rawSegments
        .slice(2)
        .filter((segment) => !isIdentifierSegment(segment))
        .map(formatSlugToTitleCase);

      return ["Jobs", "Post a Job", ...remainingSegments];
    }
  }

  const nonIdentifierSegments = rawSegments.filter(
    (segment) => !isIdentifierSegment(segment)
  );

  if (nonIdentifierSegments.length === 0) {
    return ["Dashboard"];
  }

  return nonIdentifierSegments.map((segment) => {
    const lowerSegment = segment.toLowerCase();
    const mappedTitle = STATIC_SEGMENT_MAPPINGS[lowerSegment];
    if (mappedTitle) {
      return mappedTitle;
    }
    return formatSlugToTitleCase(segment);
  });
}
