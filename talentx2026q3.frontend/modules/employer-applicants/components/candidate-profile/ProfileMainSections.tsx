import { Building2, CheckCircle2, ExternalLink, FolderOpen, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProfileSection } from './ProfileSection';
import { ProfileEmptyState } from './ProfileEmptyState';
import { APPLICANT_FALLBACKS } from '../../constants';
import { joinDateRangeLabels } from '../../utils/format';
import { nonBlankText, safeItemList, safeStringList } from '../../utils/profileData';
import { formatMonthYear } from '@/lib/date';
import type { CandidateProfile } from '../../types/applicant.types';

interface ProfileMainSectionsProps {
  profile: CandidateProfile;
}

interface SkillGroup {
  label: string;
  skills: string[];
}

export function ProfileMainSections({ profile }: ProfileMainSectionsProps) {
  const shortBio = nonBlankText(profile.shortBio);
  const skillPropositions = safeStringList(profile.skillPropositions);
  const workExperiences = safeItemList(profile.workExperiences);
  const educations = safeItemList(profile.educations);
  const projects = safeItemList(profile.projects);

  const skillGroups: SkillGroup[] = [
    { label: 'Technical Skills', skills: safeStringList(profile.technicalSkills) },
    { label: 'Tools & Platforms', skills: safeStringList(profile.toolsAndPlatforms) },
    { label: 'Soft Skills', skills: safeStringList(profile.softSkills) },
  ].filter((group) => group.skills.length > 0);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <ProfileSection title="Short Bio">
        {shortBio ? (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">{shortBio}</p>
        ) : (
          <ProfileEmptyState message={APPLICANT_FALLBACKS.NO_ABOUT} />
        )}
      </ProfileSection>

      <ProfileSection title="Core Competencies & Key Highlights">
        {skillPropositions.length > 0 ? (
          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-x-6">
            {skillPropositions.map((item) => (
              <li
                key={item}
                className="flex min-w-0 items-start gap-3 rounded-r-lg border-l-2 border-brand/35 bg-canvas/70 px-3.5 py-3"
              >
                <span
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand"
                  aria-hidden="true"
                >
                  <CheckCircle2 className="size-4" />
                </span>
                <p className="min-w-0 pt-0.5 text-[15px] font-medium leading-6 text-ink [overflow-wrap:anywhere]">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <ProfileEmptyState message={APPLICANT_FALLBACKS.NO_COMPETENCIES} />
        )}
      </ProfileSection>

      <ProfileSection title="Skills & Expertise">
        {skillGroups.length > 0 ? (
          <dl className="divide-y divide-line">
            {skillGroups.map((group) => (
              <div
                key={group.label}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-6"
              >
                <dt className="w-40 shrink-0 text-[13px] font-medium text-ink-subtle">{group.label}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-md border border-line bg-canvas px-2.5 py-1 text-[13px] font-medium text-ink"
                    >
                      {skill}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <ProfileEmptyState message={APPLICANT_FALLBACKS.NO_SKILLS} />
        )}
      </ProfileSection>

      <ProfileSection title="Work Experience">
        {workExperiences.length > 0 ? (
          <ol className="relative space-y-6 border-l border-line pl-6">
            {workExperiences.map((exp) => {
              const startLabel = exp.startDate
                ? formatMonthYear(exp.startDate, APPLICANT_FALLBACKS.NOT_AVAILABLE)
                : null;
              const endLabel = exp.isCurrent
                ? APPLICANT_FALLBACKS.PRESENT_DATE
                : exp.endDate
                  ? formatMonthYear(exp.endDate, APPLICANT_FALLBACKS.NOT_AVAILABLE)
                  : null;
              const dateRange = joinDateRangeLabels(startLabel, endLabel);

              return (
                <li key={exp.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[30px] top-1.5 size-3 rounded-full border-2 ${
                      exp.isCurrent ? 'border-brand bg-brand' : 'border-slate-300 bg-surface'
                    }`}
                  />
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h3 className="text-[15px] font-semibold text-ink">{exp.jobTitle}</h3>
                    {exp.isCurrent && (
                      <Badge className="rounded-full border-transparent bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                        Current Role
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-ink-subtle" aria-hidden="true" />
                      {exp.companyName}
                    </span>
                    {dateRange && <span className="tabular-nums text-ink-subtle">{dateRange}</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <ProfileEmptyState message={APPLICANT_FALLBACKS.NO_WORK_EXPERIENCE} />
        )}
      </ProfileSection>

      <ProfileSection title="Education">
        {educations.length > 0 ? (
          <ul className="divide-y divide-line">
            {educations.map((edu) => {
              const startLabel = edu.startDate
                ? formatMonthYear(edu.startDate, APPLICANT_FALLBACKS.NOT_AVAILABLE)
                : null;
              const endLabel = edu.endDate
                ? formatMonthYear(edu.endDate, APPLICANT_FALLBACKS.NOT_AVAILABLE)
                : null;
              const dateRange = joinDateRangeLabels(startLabel, endLabel);

              return (
                <li key={edu.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-muted"
                    aria-hidden="true"
                  >
                    <GraduationCap className="size-[18px]" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-ink">{edu.degree}</p>
                      <p className="text-[13px] text-ink-muted">{edu.institution}</p>
                    </div>
                    {dateRange && (
                      <p className="shrink-0 text-[13px] tabular-nums text-ink-subtle">{dateRange}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ProfileEmptyState message={APPLICANT_FALLBACKS.NO_EDUCATION} />
        )}
      </ProfileSection>

      <ProfileSection title="Projects">
        {projects.length > 0 ? (
          <ul className="space-y-4">
            {projects.map((project) => {
              const startLabel = project.startDate
                ? formatMonthYear(project.startDate, APPLICANT_FALLBACKS.NOT_AVAILABLE)
                : null;
              const endLabel = project.isOngoing
                ? APPLICANT_FALLBACKS.PRESENT_DATE
                : project.endDate
                  ? formatMonthYear(project.endDate, APPLICANT_FALLBACKS.NOT_AVAILABLE)
                  : null;
              const dateRange = joinDateRangeLabels(startLabel, endLabel);
              const description = nonBlankText(project.description);
              const technologies = safeStringList(project.technologiesUsed);
              const projectUrl = nonBlankText(project.projectUrl);

              return (
                <li key={project.id} className="rounded-md border border-line bg-canvas/30 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-canvas text-ink-muted"
                      aria-hidden="true"
                    >
                      <FolderOpen className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <h3 className="text-[15px] font-semibold text-ink">{project.projectName}</h3>
                            {project.isOngoing && (
                              <Badge className="rounded-full border-transparent bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                                Ongoing
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-[13px] text-ink-muted">
                            {project.role} · {project.projectType}
                          </p>
                        </div>
                        {dateRange && (
                          <p className="shrink-0 text-[13px] tabular-nums text-ink-subtle">{dateRange}</p>
                        )}
                      </div>

                      {description && (
                        <p className="mt-2.5 whitespace-pre-line break-words text-[14px] text-ink-muted">
                          {description}
                        </p>
                      )}

                      {technologies.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {technologies.map((technology) => (
                            <span
                              key={technology}
                              className="inline-flex items-center rounded-md border border-line bg-canvas px-2.5 py-0.5 text-[12px] font-medium text-ink break-all"
                            >
                              {technology}
                            </span>
                          ))}
                        </div>
                      )}

                      {projectUrl && (
                        <div className="mt-3">
                          <a
                            href={projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-sm"
                          >
                            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                            <span>View project</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ProfileEmptyState message={APPLICANT_FALLBACKS.NO_PROJECTS} />
        )}
      </ProfileSection>
    </div>
  );
}
