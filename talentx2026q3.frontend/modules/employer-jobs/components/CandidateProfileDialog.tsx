'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  GraduationCap,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Send,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { useCandidateSummary } from '../hooks/useCandidateSummary';
import { useSendInvitation } from '../hooks/useSendInvitation';

interface CandidateProfileDialogProps {
  candidateIdentifier: string | null;
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  hasActiveInvitation?: boolean;
  invitationStatus?: string | null;
}

export function CandidateProfileDialog({
  candidateIdentifier,
  jobId,
  isOpen,
  onClose,
  hasActiveInvitation = false,
  invitationStatus,
}: CandidateProfileDialogProps) {
  const { data: profile, isLoading } = useCandidateSummary(isOpen ? candidateIdentifier : null);
  const sendInviteMutation = useSendInvitation(jobId);

  const handleSendInvite = () => {
    if (!profile) return;
    sendInviteMutation.mutate(profile.userId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-emerald-600" />
            <p className="mt-3 text-sm text-slate-500">Loading candidate profile...</p>
          </div>
        ) : !profile ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">Candidate details not available.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.name}
                      className="size-16 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="size-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                      <User className="size-7 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900 break-words [overflow-wrap:anywhere]">
                      {profile.name}
                    </DialogTitle>
                    {profile.tagline && (
                      <DialogDescription className="text-sm font-medium text-slate-600 mt-1 break-words">
                        {profile.tagline}
                      </DialogDescription>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100 mt-2">
                {profile.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-[200px]" title={profile.email}>{profile.email}</span>
                  </span>
                )}
                {profile.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5 text-slate-400" />
                    {profile.phone}
                  </span>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                )}
                {profile.totalYearsExperience != null && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5 text-slate-400" />
                    {profile.totalYearsExperience} yrs experience
                  </span>
                )}
                {profile.expectedSalary != null && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="size-3.5 text-slate-400" />
                    ${profile.expectedSalary.toLocaleString()}/yr expected
                  </span>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-6 py-2 text-sm text-slate-700">
              {/* Short Bio */}
              {profile.shortBio && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">About</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">{profile.shortBio}</p>
                </div>
              )}

              {/* Skills */}
              {(profile.technicalSkills && profile.technicalSkills.length > 0) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.technicalSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {(profile.softSkills && profile.softSkills.length > 0) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Soft Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.softSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-block rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools & Platforms */}
              {(profile.toolsAndPlatforms && profile.toolsAndPlatforms.length > 0) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Tools & Platforms</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.toolsAndPlatforms.map((tool) => (
                      <span
                        key={tool}
                        className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600 border border-slate-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {(profile.workExperiences && profile.workExperiences.length > 0) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2.5 flex items-center gap-1.5">
                    <Briefcase className="size-4 text-slate-500" />
                    Work Experience
                  </h4>
                  <div className="space-y-3 pl-1">
                    {profile.workExperiences.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-emerald-400 pl-3 py-0.5">
                        <div className="font-semibold text-slate-900 text-sm">{exp.jobTitle}</div>
                        <div className="text-xs text-slate-600 font-medium">{exp.companyName}</div>
                        {(exp.startDate || exp.endDate || exp.isCurrent) && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {exp.startDate ?? 'Start'} — {exp.isCurrent ? 'Present' : (exp.endDate ?? 'End')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {(profile.educations && profile.educations.length > 0) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2.5 flex items-center gap-1.5">
                    <GraduationCap className="size-4 text-slate-500" />
                    Education
                  </h4>
                  <div className="space-y-2 pl-1">
                    {profile.educations.map((edu, idx) => (
                      <div key={idx} className="border-l-2 border-blue-400 pl-3 py-0.5">
                        <div className="font-semibold text-slate-900 text-sm">{edu.degree}</div>
                        <div className="text-xs text-slate-600">{edu.institution}</div>
                        {(edu.startDate || edu.endDate) && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {edu.startDate ?? ''} {edu.endDate ? `— ${edu.endDate}` : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(profile.linkedInUrl || (profile.additionalUrls && profile.additionalUrls.length > 0)) && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {profile.linkedInUrl && (
                      <a
                        href={profile.linkedInUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <ExternalLink className="size-3" />
                        LinkedIn
                      </a>
                    )}
                    {profile.additionalUrls?.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium truncate max-w-xs"
                      >
                        <ExternalLink className="size-3" />
                        {url.replace(/^https?:\/\//, '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              {invitationStatus === 'Pending' ? (
                <Button disabled variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                  <Clock className="size-4 mr-1 text-blue-500" />
                  Invitation Pending
                </Button>
              ) : invitationStatus === 'Accepted' ? (
                <Button disabled variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  <CheckCircle2 className="size-4 mr-1 text-emerald-600" />
                  Accepted
                </Button>
              ) : invitationStatus === 'Declined' ? (
                <Button disabled variant="outline" className="text-slate-600 border-slate-200 bg-slate-100">
                  Declined
                </Button>
              ) : invitationStatus === 'Withdrawn' ? (
                <Button disabled variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  Withdrawn
                </Button>
              ) : invitationStatus === 'Expired' ? (
                <Button disabled variant="outline" className="text-red-600 border-red-200 bg-red-50">
                  Expired
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={sendInviteMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {sendInviteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin mr-1" />
                  ) : (
                    <Send className="size-4 mr-1" />
                  )}
                  Invite to Apply
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
