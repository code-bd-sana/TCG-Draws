"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminPendingRaffles, useApproveRaffle } from "../../../hooks/useRaffleHooks";
import RejectCompetitionModal from "./RejectCompetitionModal";
import ReviewCompetitionModal, { ReviewCompetitionData } from "./ReviewCompetitionModal";
import { formatUkDateTime } from "../../../lib/uk-time";

export default function CompetitionApprovalQueue() {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<{ id: string, title: string } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewCompetition, setSelectedReviewCompetition] = useState<ReviewCompetitionData | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data: pendingRaffles, isLoading } = useAdminPendingRaffles();
  const approveMutation = useApproveRaffle();

  const handleOpenReview = (item: any) => {
    setSelectedReviewCompetition(item);
    setIsReviewModalOpen(true);
  };

  const handleReject = (id: string, title: string) => {
    setSelectedCompetition({ id, title });
    setIsRejectModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      // Simulating a short delay for the amazing loading effect
      await new Promise(resolve => setTimeout(resolve, 2500));
      await approveMutation.mutateAsync(id);
      toast.success('Competition approved and is now live!');
      setIsReviewModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Header Counter Pill */}
      <div className="flex items-center gap-3">
        <span className="font-heading font-black text-lg text-text-primary uppercase tracking-tight">Pending Submissions</span>
        <div className="px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] font-sans font-bold text-xs uppercase tracking-wider shadow-xs">
          {pendingRaffles?.length || 0} Pending Review
        </div>
      </div>

      {/* Queue List */}
      <div className="flex flex-col gap-6">
        {isLoading && (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full bg-surface border border-border rounded-card h-[240px] animate-pulse shadow-card" />
            ))}
          </div>
        )}

        {!isLoading && pendingRaffles?.map((item: any) => (
          <div key={item.id} className="relative w-full bg-surface border border-border rounded-card flex flex-col overflow-hidden shadow-card">

            {/* Glowing Loading Overlay */}
            {approvingId === item.id && (
              <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative flex items-center justify-center w-[100px] h-[100px] mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" style={{ animationDuration: '0.8s' }}></div>
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-md"></div>
                </div>
                <h3 className="font-heading font-black text-xl text-primary mb-1 uppercase tracking-tight animate-pulse">
                  Approving & Publishing...
                </h3>
                <p className="font-sans text-xs text-text-muted font-semibold">
                  Generating public URLs and updating live platform status
                </p>
              </div>
            )}

            {/* Top Bar (Host Info) */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-divider bg-elevated">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-bg border border-primary/30 flex items-center justify-center shrink-0 shadow-xs">
                  <span className="font-sans font-bold text-xs text-text-brand">
                    {item.host?.user?.firstName?.[0] || 'A'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs text-text-primary leading-tight">
                      {item.host?.user?.firstName || 'Host'} {item.host?.user?.lastName || ''}
                    </span>
                    {item.host?.isVerified && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-sans font-bold uppercase">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="font-sans text-[11px] font-semibold text-text-muted leading-tight mt-0.5">
                    Submitted {item.createdAt ? formatDistanceToNow(new Date(item.createdAt)) : 'recently'} ago
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenReview(item)}
                className="text-xs font-heading font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Host & Details</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Middle Bar (Content Details) */}
            <div className="flex flex-col sm:flex-row gap-6 p-6 pb-4">
              {/* Image Box */}
              <div 
                onClick={() => handleOpenReview(item)}
                className="w-full sm:w-[140px] h-[100px] shrink-0 bg-elevated border border-border-medium rounded-xl flex items-center justify-center overflow-hidden shadow-xs cursor-pointer group relative"
                title="Click to inspect competition details"
              >
                {item.mainImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.mainImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="font-sans font-bold text-[10px] text-white bg-black/60 px-2 py-0.5 rounded">View</span>
                    </div>
                  </>
                ) : (
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 
                    onClick={() => handleOpenReview(item)}
                    className="font-heading font-black text-lg text-text-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h3>
                  {item.category && (
                    <span className="px-2 py-0.5 rounded-full bg-accent-bg border border-primary/20 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                  {item.isAutoDraw ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-sans font-bold text-[10px] uppercase tracking-wider">
                      Auto Draw
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-sans font-bold text-[10px] uppercase tracking-wider">
                      Live Draw
                    </span>
                  )}
                </div>
                {item.prizeName && item.prizeName !== item.title && (
                  <p className="font-sans text-xs font-semibold text-text-primary">
                    <span className="text-text-muted">Main Prize: </span>
                    {item.prizeName}
                  </p>
                )}
                <p className="font-sans text-xs text-text-muted leading-relaxed max-w-[800px] line-clamp-2">
                  {item.description || 'No description provided.'}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {item.mainPrizeValue !== undefined && item.mainPrizeValue !== null && item.mainPrizeValue !== '' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] font-sans font-black text-[10px] uppercase tracking-wider shadow-xs">
                      Main Prize Value: £{Number(item.mainPrizeValue).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                    Price: £{Number(item.pricePerTicket).toFixed(2)} / ticket
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                    Total: {item.totalTickets} tickets
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                    Per Person: Min {item.minTickets || 1} {item.maxTickets ? `| Max ${item.maxTickets}` : '| Unlimited'}
                  </span>
                  {item.startDate && (
                    <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                      Starts (UK): {formatUkDateTime(item.startDate)}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-accent-bg border border-primary/30 text-text-brand font-sans font-bold text-[10px] uppercase tracking-wider">
                    Draws (UK): {item.endDate ? formatUkDateTime(item.endDate) : 'TBD'}
                  </span>
                  {item._count?.instantWins ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-sans font-bold text-[10px] uppercase tracking-wider">
                      ⚡ {item._count.instantWins} Instant Wins
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Bottom Bar (Actions) */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 pt-4 gap-4 mt-1 border-t border-divider bg-elevated/40">
              <button
                type="button"
                onClick={() => handleOpenReview(item)}
                disabled={approvingId !== null}
                className="w-full sm:w-auto h-10 px-5 rounded-xl border border-primary/40 bg-surface hover:bg-primary/5 text-primary font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:border-primary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <span>Review Full Details (Raffle & Host)</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleReject(item.id, item.title)}
                  disabled={approvingId !== null}
                  className="btn-glossy-red flex-1 sm:flex-none h-10 px-6 rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-98"
                >
                  Reject & Request Changes
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  disabled={approvingId !== null}
                  className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-98"
                >
                  Approve & Publish
                </button>
              </div>
            </div>

          </div>
        ))}
        {!isLoading && pendingRaffles?.length === 0 && (
          <div className="bg-surface border border-border rounded-card p-12 text-center text-text-muted font-sans text-xs font-bold shadow-card">
            No pending competition submissions in the approval queue.
          </div>
        )}
      </div>

      <ReviewCompetitionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        competition={selectedReviewCompetition}
        onApprove={handleApprove}
        isApproving={approvingId !== null}
        onReject={handleReject}
      />

      <RejectCompetitionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        competitionData={selectedCompetition}
      />
    </div>
  );
}
