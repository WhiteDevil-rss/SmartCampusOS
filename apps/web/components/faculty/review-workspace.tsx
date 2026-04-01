'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { reviewService, PendingReview } from '@/lib/services/review-service';
import { ClipboardCheck, Eye, Loader2, Scale, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast, Toast } from '@/components/ui/toast-alert';
import { AnimatePresence, motion } from 'framer-motion';

export function ReviewWorkspace() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState({
    score: 85,
    recommendation: 'APPROVE' as 'APPROVE' | 'REVISE' | 'REJECT',
    comments: ''
  });

  const { toast: toastState, showToast, hideToast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewService.getPendingReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch pending reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async () => {
    if (!selectedReview) return;
    try {
      setIsSubmitting(true);
      await reviewService.submitReview(selectedReview.id, evaluation);
      showToast('success', 'Peer review submitted successfully.');
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      showToast('error', 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="h-full flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">Governance Inbox</h2>
              <p className="text-xs text-blue-200/50 uppercase tracking-wider font-mono">
                Peer Review Queue ({reviews.length})
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="py-8 text-center opacity-50">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-500/50" />
              <p className="text-sm font-medium text-slate-400">Queue Cleared. Academic integrity maintained.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div 
                key={rev.id} 
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase truncate max-w-[180px]">
                    {rev.grant.title}
                  </h3>
                  <p className="text-[10px] text-blue-200/40 uppercase font-mono mt-1">
                    {rev.grant.agency} • ${rev.grant.amount.toLocaleString()}
                  </p>
                </div>
                <IndustrialButton 
                    variant="outline" 
                    size="sm" 
                    className="scale-75 origin-right"
                    onClick={() => setSelectedReview(rev)}
                >
                  <Eye className="w-3 h-3 mr-2" />
                  Evaluate
                </IndustrialButton>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl h-[85vh] bg-[#0a1120] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                    Internal Peer Review
                  </h2>
                  <p className="text-xs text-blue-200/40 mt-1 uppercase tracking-[0.2em] font-mono">
                    Proposal ID: {selectedReview.grantId.slice(0, 8)} • DOUBLE-BLIND PROTOCOL
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex">
                {/* Proposal View */}
                <div className="flex-1 overflow-y-auto p-10 border-r border-white/5 custom-scrollbar bg-black/20">
                  <div className="prose prose-invert prose-blue max-w-none">
                    <h1 className="text-3xl font-black text-emerald-400 mb-6">{selectedReview.grant.title}</h1>
                    <div className="flex items-center gap-6 mb-10 pb-6 border-b border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Agency</span>
                            <span className="text-sm font-bold text-white">{selectedReview.grant.agency}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Amount</span>
                            <span className="text-sm font-bold text-emerald-500">${selectedReview.grant.amount.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-blue-100/80">
                        {selectedReview.grant.proposalBody || 'No proposal body available for preview.'}
                    </div>
                  </div>
                </div>

                {/* Score Card */}
                <div className="w-96 p-8 space-y-8 bg-white/[0.01]">
                   <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-3 mb-6">
                        <Scale className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Rubric Evaluation</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                            Strategic Alignment Score: <span className="text-blue-400">{evaluation.score}</span>
                          </label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={evaluation.score}
                            onChange={(e) => setEvaluation(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                            Governance Action
                          </label>
                          <select 
                            value={evaluation.recommendation}
                            onChange={(e) => setEvaluation(prev => ({ ...prev, recommendation: e.target.value as any }))}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors uppercase font-bold"
                          >
                            <option value="APPROVE">APPROVE FOR SUBMISSION</option>
                            <option value="REVISE">REQUEST MAJOR REVISION</option>
                            <option value="REJECT">DENY / ARCHIVE</option>
                          </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                Blind Feedback
                            </label>
                            <textarea 
                                value={evaluation.comments}
                                onChange={(e) => setEvaluation(prev => ({ ...prev, comments: e.target.value }))}
                                placeholder="State your technical critique..."
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors h-40 resize-none font-medium leading-relaxed"
                            />
                        </div>
                      </div>
                   </div>

                   <IndustrialButton 
                    className="w-full h-16 rounded-2xl group relative overflow-hidden" 
                    variant="primary"
                    disabled={isSubmitting || !evaluation.comments}
                    onClick={handleSubmit}
                   >
                     {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                     ) : (
                        <div className="flex items-center justify-center gap-3">
                            <span className="uppercase font-black tracking-widest">Lock & Submit Review</span>
                        </div>
                     )}
                   </IndustrialButton>

                   <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                     <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-amber-500/70 font-medium leading-relaxed uppercase">
                       Confidential Submission: Once locked, this evaluation will be transmitted anonymously to the applicant for proposal hardening.
                     </p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast toast={toastState} onClose={hideToast} />
    </div>
  );
}
