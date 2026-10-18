'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Loader2 } from 'lucide-react';
import type { CandidateMatch } from '../types/employer-job.types';
import { useMatchedCandidates } from '../hooks/useMatchedCandidates';
import { useRunMatching } from '../hooks/useRunMatching';
import { useSendInvitation } from '../hooks/useSendInvitation';
import { useWithdrawInvitation } from '../hooks/useWithdrawInvitation';
import { RunMatchingButton } from './RunMatchingButton';
import { CandidateRow } from './CandidateRow';
import { CandidateProfileDialog } from './CandidateProfileDialog';
import { CandidateActionConfirmDialog } from './CandidateActionConfirmDialog';

interface MatchedCandidatesListProps {
  jobId: string;
}

type ConfirmAction =
  | { type: 'invite'; talentUserId: string }
  | { type: 'withdraw'; invitationId: string };

export function MatchedCandidatesList({ jobId }: MatchedCandidatesListProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'uninvited' | 'invited' | 'accepted' | 'declined' | 'withdrawn'>('all');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const {
    data: candidates = [],
    isLoading: isLoadingCandidates,
    isError: isErrorCandidates,
  } = useMatchedCandidates(jobId);

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter((c) => {
      if (c.score < minScore) return false;
      if (statusFilter === 'uninvited' && c.hasActiveInvitation) return false;
      if (statusFilter === 'invited' && !c.hasActiveInvitation) return false;
      if (statusFilter === 'accepted' && c.invitationStatus !== 'Accepted') return false;
      if (statusFilter === 'declined' && c.invitationStatus !== 'Declined') return false;
      if (statusFilter === 'withdrawn' && c.invitationStatus !== 'Withdrawn') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesTagline = c.tagline?.toLowerCase().includes(q);
        const matchesSkills = c.technicalSkills?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesSkills) return false;
      }
      return true;
    });
  }, [candidates, minScore, statusFilter, searchQuery]);

  const runMatchingMutation = useRunMatching(jobId);
  const sendInviteMutation = useSendInvitation(jobId);
  const withdrawMutation = useWithdrawInvitation(jobId);

  useEffect(() => {
    if (selectedCandidate && candidates.length > 0) {
      const updated = candidates.find((c) => c.talentUserId === selectedCandidate.talentUserId);
      if (updated) {
        setSelectedCandidate(updated);
      }
    }
  }, [candidates]);

  const handleOpenProfile = (candidate: CandidateMatch) => {
    setSelectedCandidate(candidate);
    setIsDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setIsDialogOpen(false);
    setSelectedCandidate(null);
  };

  const handleRunMatching = () => {
    runMatchingMutation.mutate();
  };

  const confirmTargetCandidate = React.useMemo(() => {
    if (!confirmAction) return null;
    if (confirmAction.type === 'invite') {
      return candidates.find((c) => c.talentUserId === confirmAction.talentUserId) ?? null;
    }
    return candidates.find((c) => c.invitationId === confirmAction.invitationId) ?? null;
  }, [confirmAction, candidates]);

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'invite') {
        await sendInviteMutation.mutateAsync(confirmAction.talentUserId);
      } else {
        await withdrawMutation.mutateAsync(confirmAction.invitationId);
      }
      setConfirmAction(null);
    } catch {
      // Error toast handled by mutation onError; keep dialog open.
    }
  };

  const hasMatches = candidates.length > 0;
  const isMatching = runMatchingMutation.isPending;

  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              AI Talent Recommendations
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Match eligible candidates based on technical skills, years of experience, past roles, and work preferences.
          </p>
        </div>

        <div>
          <RunMatchingButton
            onClick={handleRunMatching}
            isLoading={isMatching}
            hasMatches={hasMatches}
            matchCount={candidates.length}
          />
        </div>
      </div>

      {/* Main Content States */}
      {isMatching ? (
        <div className="text-center py-16 px-4 rounded-md border border-dashed border-emerald-200 bg-emerald-50/50 space-y-3">
          <Loader2 className="size-8 animate-spin text-emerald-600 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">Evaluating Candidates with AI</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Comparing job requirements, required technologies, experience levels, and location criteria against talent profiles...
          </p>
        </div>
      ) : isLoadingCandidates ? (
        <div className="space-y-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-md bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : isErrorCandidates ? (
        <div className="text-center py-12 px-4 rounded-md border border-red-100 bg-red-50 text-red-700 text-sm">
          Failed to load candidate matches. Please try again.
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-md border border-dashed border-slate-200 bg-slate-50 space-y-3">
          <div className="p-3 bg-white border border-slate-200 rounded-full inline-block text-slate-400">
            <Users className="size-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">No Candidate Matches Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Run AI Matching&quot; to analyze candidate profiles and generate ranked recommendations for this role.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls bar: Search, Min Score Filter, Status Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-md bg-slate-50 border border-slate-200/80">
            <div>
              <input
                type="text"
                placeholder="Search candidate name, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value={0}>All Compatibility Scores</option>
                <option value={80}>80%+ (Strong Matches)</option>
                <option value={70}>70%+ (Good Matches)</option>
                <option value={60}>60%+ (Moderate Matches)</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Candidates</option>
                <option value="uninvited">Uninvited Only</option>
                <option value="invited">Invited Only</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{filteredCandidates.length}</strong> of {candidates.length} candidate(s)
            </span>
            <span>Ranked by AI compatibility score</span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-md border border-slate-100 bg-slate-50/50 text-xs text-slate-500">
              No candidates match your selected filters. Try clearing search or adjusting min score.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="candidate-results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-4"
              >
                {/* Featured hero card — top candidate */}
                <CandidateRow
                  candidate={filteredCandidates[0]}
                  rank={1}
                  featured
                  onViewProfile={handleOpenProfile}
                  onSendInvite={(uid) => setConfirmAction({ type: 'invite', talentUserId: uid })}
                  isInviting={
                    sendInviteMutation.isPending &&
                    sendInviteMutation.variables === filteredCandidates[0].talentUserId
                  }
                  onWithdraw={(invId) => setConfirmAction({ type: 'withdraw', invitationId: invId })}
                  isWithdrawing={withdrawMutation.isPending}
                />

                {/* Compact rows — remaining candidates in a single divided container */}
                {filteredCandidates.length > 1 && (
                  <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                    {filteredCandidates.slice(1).map((candidate, index) => (
                      <CandidateRow
                        key={candidate.talentUserId}
                        candidate={candidate}
                        rank={index + 2}
                        featured={false}
                        onViewProfile={handleOpenProfile}
                        onSendInvite={(uid) => setConfirmAction({ type: 'invite', talentUserId: uid })}
                        isInviting={
                          sendInviteMutation.isPending &&
                          sendInviteMutation.variables === candidate.talentUserId
                        }
                        onWithdraw={(invId) => setConfirmAction({ type: 'withdraw', invitationId: invId })}
                        isWithdrawing={withdrawMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Profile Dialog */}
      <CandidateProfileDialog
        candidateIdentifier={selectedCandidate?.talentUserId ?? null}
        jobId={jobId}
        isOpen={isDialogOpen}
        onClose={handleCloseProfile}
        hasActiveInvitation={selectedCandidate?.hasActiveInvitation ?? false}
        invitationStatus={selectedCandidate?.invitationStatus ?? null}
      />

      {/* Invite / Withdraw Confirmation Dialog */}
      <CandidateActionConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={confirmAction?.type === 'withdraw' ? 'Withdraw Invitation?' : 'Send Invitation?'}
        description={
          confirmAction?.type === 'withdraw'
            ? `Are you sure you want to withdraw the invitation to ${confirmTargetCandidate?.name ?? 'this candidate'}?`
            : `Invite ${confirmTargetCandidate?.name ?? 'this candidate'} to apply for this job?`
        }
        confirmLabel={confirmAction?.type === 'withdraw' ? 'Withdraw' : 'Send Invite'}
        variant={confirmAction?.type === 'withdraw' ? 'destructive' : 'primary'}
        isPending={
          confirmAction?.type === 'withdraw'
            ? withdrawMutation.isPending
            : sendInviteMutation.isPending
        }
        onConfirm={handleConfirmAction}
      />
    </section>
  );
}
