'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Loader2, X, Search } from 'lucide-react';
import type { CandidateMatch } from '../types/employer-job.types';
import { useMatchedCandidates } from '../hooks/useMatchedCandidates';
import { useRunMatching } from '../hooks/useRunMatching';
import { useSendInvitation } from '../hooks/useSendInvitation';
import { useWithdrawInvitation } from '../hooks/useWithdrawInvitation';
import { RunMatchingButton } from './RunMatchingButton';
import { CandidateRow } from './CandidateRow';
import { CandidateProfileDialog } from './CandidateProfileDialog';
import { CandidateActionConfirmDialog } from './CandidateActionConfirmDialog';

interface TalentMatchPanelProps {
  jobId: string;
}

type ConfirmAction =
  | { type: 'invite'; talentUserId: string }
  | { type: 'withdraw'; invitationId: string };

export function TalentMatchPanel({ jobId }: TalentMatchPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const confirmTargetCandidate = useMemo(() => {
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const hasMatches = candidates.length > 0;
  const isMatching = runMatchingMutation.isPending;

  const filteredCandidates = useMemo(() => {
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

  return (
    <>
      <RunMatchingButton
        onClick={() => {
          if (!hasMatches) handleRunMatching();
          setIsOpen(true);
        }}
        isLoading={isMatching}
        hasMatches={hasMatches}
        matchCount={candidates.length}
      />

      {/* Slide Panel */}
      {isOpen && (
        <div className="fixed top-14 bottom-0 left-0 right-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="AI Talent Recommendations">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-50 flex h-full w-full md:max-w-[55%] min-w-0 md:min-w-[400px] flex-col bg-slate-100 shadow-2xl"
          >
            {/* Panel Header */}
            <div className="flex flex-wrap items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200/80 shrink-0 bg-white/60 backdrop-blur-sm gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    AI Talent Recommendations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Match eligible candidates for this role
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RunMatchingButton
                  onClick={handleRunMatching}
                  isLoading={isMatching}
                  hasMatches={hasMatches}
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="space-y-5">
              {/* Content States */}
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
                    Click &quot;Run AI Matching&quot; to analyze candidate profiles and generate ranked recommendations.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-3"
                  >
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/40">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search name, skills..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-md border border-white/60 bg-white/80 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <select
                        value={minScore}
                        onChange={(e) => setMinScore(Number(e.target.value))}
                        className="rounded-md border border-white/60 bg-white/80 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                      >
                        <option value={0}>All Scores</option>
                        <option value={80}>80%+</option>
                        <option value={70}>70%+</option>
                        <option value={60}>60%+</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="rounded-md border border-white/60 bg-white/80 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="all">All</option>
                        <option value="uninvited">Uninvited</option>
                        <option value="invited">Invited</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span>
                        Showing <strong className="text-slate-800">{filteredCandidates.length}</strong> of {candidates.length} candidate(s)
                      </span>
                      <span>Ranked by compatibility score</span>
                    </div>

                    {filteredCandidates.length === 0 ? (
                      <div className="text-center py-8 px-4 rounded-md border border-slate-100 bg-slate-50/50 text-xs text-slate-500">
                        No candidates match your selected filters. Try adjusting search or filters.
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
              </div>
            </div>
          </motion.div>
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
    </>
  );
}
