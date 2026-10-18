// The two publish dates a moderated job carries.
interface PublishDates {
  publishedAt: string | null;
  firstPublishedAt?: string | null;
}

// When the job was first posted; jobs older than the first-publish date fall back to their latest publish.
export function postedDate(job: PublishDates): string | null {
  return job.firstPublishedAt ?? job.publishedAt;
}

// True when the job went live again after it was first posted (reopened, reactivated or re-published).
export function isRelisted(job: PublishDates): boolean {
  if (!job.firstPublishedAt || !job.publishedAt) return false;
  return new Date(job.publishedAt).getTime() > new Date(job.firstPublishedAt).getTime();
}
