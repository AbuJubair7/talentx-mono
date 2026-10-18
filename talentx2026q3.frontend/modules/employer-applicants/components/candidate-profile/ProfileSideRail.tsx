import { Download, Video } from 'lucide-react';
import { ProfileSection } from './ProfileSection';
import { ProfileEmptyState } from './ProfileEmptyState';
import { APPLICANT_FALLBACKS } from '../../constants';
import { AI_SCORE_BAND_STYLES, getAiScoreBand } from '../../utils/score';
import { isFiniteNumber, nonBlankText } from '../../utils/profileData';
import { getFileKind, ResumeFileThumbnail } from '@/modules/resumes';
import { formatShortDate } from '@/lib/date';
import type { CandidateProfile } from '../../types/applicant.types';

interface ProfileSideRailProps {
  profile: CandidateProfile;
}

export function ProfileSideRail({ profile }: ProfileSideRailProps) {
  const aiMatchScore = profile.aiMatchScore;
  const hasScore = isFiniteNumber(aiMatchScore);
  const score = hasScore ? Math.min(100, Math.max(0, Math.round(aiMatchScore))) : 0;
  const scoreStroke = AI_SCORE_BAND_STYLES[getAiScoreBand(score)].stroke;
  const resumeUrl = nonBlankText(profile.resumeUrl);
  const videoIntroUrl = nonBlankText(profile.videoIntroUrl);
  const coverLetter = nonBlankText(profile.coverLetter);
  const resumeKind = profile.resumeKind ?? getFileKind('', profile.resumeOriginalFileName ?? '') ?? 'PDF';

  const snapshotRows = [
    {
      label: 'Total experience',
      value: isFiniteNumber(profile.totalYearsExperience)
        ? `${profile.totalYearsExperience} years`
        : APPLICANT_FALLBACKS.NOT_SPECIFIED,
    },
    {
      label: 'Expected salary',
      value: isFiniteNumber(profile.expectedSalary)
        ? `$${profile.expectedSalary.toLocaleString()}`
        : APPLICANT_FALLBACKS.NOT_SPECIFIED,
    },
    {
      label: 'Applied date',
      value: formatShortDate(profile.appliedAt, APPLICANT_FALLBACKS.NOT_SPECIFIED),
    },
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <ProfileSection title="Application Snapshot">
        <div className="mb-4 rounded-lg bg-canvas p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-ink-muted">AI match score</span>
            <span className="text-[15px] font-semibold tabular-nums text-ink">
              {hasScore ? `${score}%` : APPLICANT_FALLBACKS.SCORE_NOT_AVAILABLE}
            </span>
          </div>
          {hasScore ? (
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="AI match score"
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${score}%`, backgroundColor: scoreStroke }}
              />
            </div>
          ) : (
            <div
              className="mt-2 flex h-5 w-full items-center justify-center rounded-full bg-line/70"
              aria-hidden="true"
            >
              <span className="text-[11px] font-semibold tracking-wide text-ink-subtle">N/A</span>
            </div>
          )}
        </div>

        <dl className="divide-y divide-line">
          {snapshotRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <dt className="text-[13px] text-ink-muted">{row.label}</dt>
              <dd className="text-[13px] font-semibold tabular-nums text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </ProfileSection>

      <ProfileSection title="Resume">
        {resumeUrl ? (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-line bg-canvas p-3">
              <ResumeFileThumbnail kind={resumeKind} />
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-medium leading-snug text-ink [overflow-wrap:anywhere]"
                  title={profile.resumeOriginalFileName ?? undefined}
                >
                  {profile.resumeOriginalFileName || APPLICANT_FALLBACKS.DEFAULT_RESUME_FILENAME}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-ink-subtle">
                  {`${resumeKind} · Available to download`}
                </p>
              </div>
            </div>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Download ${profile.resumeOriginalFileName ?? APPLICANT_FALLBACKS.DEFAULT_RESUME_FILENAME}`}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <Download className="size-4" aria-hidden="true" />
              Download resume
            </a>
          </>
        ) : (
          <div className="rounded-lg border border-line bg-canvas p-3">
            <ProfileEmptyState message={APPLICANT_FALLBACKS.NO_RESUME} />
          </div>
        )}
      </ProfileSection>

      {videoIntroUrl && (
        <ProfileSection title="Video Introduction">
          <div className="overflow-hidden rounded-lg border border-line bg-ink/5">
            <video
              controls
              preload="metadata"
              className="aspect-video w-full"
              src={videoIntroUrl}
              aria-label={`Video introduction from ${profile.name}`}
            >
              Your browser does not support embedded video.
            </video>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-subtle">
            <Video className="size-3.5" aria-hidden="true" />
            Recorded introduction from the candidate
          </p>
        </ProfileSection>
      )}

      {coverLetter && (
        <ProfileSection title="Cover Letter" className="border-brand/30 bg-brand-soft/60">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">{coverLetter}</p>
        </ProfileSection>
      )}
    </div>
  );
}
