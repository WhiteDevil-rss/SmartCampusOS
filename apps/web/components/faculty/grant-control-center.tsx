'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BrainCircuit, 
  Plus,
  ArrowUpRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { GlassCard, StatCard } from '../v2/shared/cards';
import { IndustrialButton } from '../v2/shared/inputs';
import { useToast, Toast } from '../ui/toast-alert';
import { grantService, ResearchGrant } from '../../lib/services/grant-service';
import { reviewService } from '../../lib/services/review-service';
import { cn } from '@/lib/utils';
import { ProposalCanvas } from './proposal-canvas';
import { GrantPortfolio } from './grant-portfolio';
import { Users, ShieldCheck, MessageSquare } from 'lucide-react';

export const GrantControlCenter: React.FC = () => {
  const [grants, setGrants] = useState<ResearchGrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrafting, setIsDrafting] = useState<string | null>(null);
  const [selectedGrant, setSelectedGrant] = useState<ResearchGrant | null>(null);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchReviews = async (grantId: string) => {
    try {
      const data = await reviewService.getGrantReviews(grantId);
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchGrants = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await grantService.getGrants();
      setGrants(data);
    } catch (error) {
      showToast('error', 'Failed to fetch your research grants');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const handleGenerateProposal = async (grantId: string) => {
    try {
      setIsDrafting(grantId);
      showToast('info', 'Ollama is synthesizing your research proposal...');
      const updated = await grantService.generateProposal(grantId);
      showToast('success', 'Research proposal drafted and moved to Internal Review');
      setSelectedGrant(updated);
      fetchGrants();
    } catch (error) {
      showToast('error', 'Could not generate proposal. Ensure AI Engine is online.');
    } finally {
      setIsDrafting(null);
    }
  };

  const handleAssignReviewers = async (grantId: string) => {
    try {
      setIsAssigning(true);
      // For demo purposes, we auto-assign 2 placeholder reviewers 
      // In production, this would open a faculty selector modal
      await reviewService.assignReviewers(grantId, ['mock-reviewer-1', 'mock-reviewer-2']);
      showToast('success', 'Internal reviewers assigned successfully');
      fetchGrants();
    } catch (error) {
      showToast('error', 'Failed to assign reviewers');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusConfig = (status: ResearchGrant['status']) => {
    switch (status) {
      case 'PROPOSAL_DRAFT':
        return { label: 'Draft', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'INTERNAL_REVIEW':
        return { label: 'Review', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'EXTERNAL_SUBMITTED':
        return { label: 'Submitted', icon: Send, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'ACTIVE':
        return { label: 'Active', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'REJECTED':
        return { label: 'Rejected', icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' };
      default:
        return { label: 'Unknown', icon: Clock, color: 'text-zinc-400', bg: 'bg-zinc-500/10' };
    }
  };

  return (
    <div className="space-y-6">
      {activePortfolioId ? (
        <GrantPortfolio 
          grantId={activePortfolioId} 
          onBack={() => setActivePortfolioId(null)} 
        />
      ) : (
        <>
          {/* Header Stat Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Active Funding" 
              value={grants.filter(g => g.status === 'ACTIVE').reduce((acc, g) => acc + g.amount, 0)}
              prefix="$"
              icon={DollarSign}
              change={12}
              changeDescription="last month"
            />
            <StatCard 
              title="Pending Reviews" 
              value={grants.filter(g => g.status === 'INTERNAL_REVIEW').length}
              icon={Clock}
              change={0}
            />
            <StatCard 
              title="Success Rate" 
              value={68} 
              suffix="%"
              icon={TrendingUp}
              change={5}
            />
          </div>

          <GlassCard className="p-0 overflow-hidden border-zinc-800/50 bg-black/40">
            <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                  Grant Lifecycle Manager
                </h3>
                <p className="text-zinc-400 text-sm">Monitor and accelerate your research funding pipeline.</p>
              </div>
              <IndustrialButton className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Research Application
              </IndustrialButton>
            </div>

            <div className="divide-y divide-zinc-800/50">
              {isLoading ? (
                <div className="p-12 text-center text-zinc-500">Retrieving grant data...</div>
              ) : grants.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">No research grants tracked yet.</div>
              ) : (
                grants.map((grant) => {
                  const config = getStatusConfig(grant.status);
                  return (
                    <div key={grant.id} className="p-5 hover:bg-zinc-900/40 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                              {grant.title}
                            </h4>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                              config.color,
                              config.bg
                            )}>
                              <config.icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400 line-clamp-1">{grant.agency} • ${grant.amount.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {grant.status === 'ACTIVE' && (
                            <IndustrialButton 
                              onClick={() => setActivePortfolioId(grant.id)}
                              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/30 flex items-center gap-2 py-1.5 h-auto text-sm"
                            >
                              <TrendingUp className="w-4 h-4" />
                              Manage Portfolio
                            </IndustrialButton>
                          )}

                          {grant.proposalBody && (
                            <IndustrialButton 
                              onClick={() => setSelectedGrant(grant)}
                              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 h-auto text-sm"
                            >
                              View Draft
                            </IndustrialButton>
                          )}
                          
                          {grant.status === 'PROPOSAL_DRAFT' && (
                            <IndustrialButton 
                              onClick={() => handleGenerateProposal(grant.id)}
                              disabled={isDrafting === grant.id}
                              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/30 flex items-center gap-2 py-1.5 h-auto text-sm"
                            >
                              <BrainCircuit className={cn("w-4 h-4", isDrafting === grant.id && "animate-pulse")} />
                              {isDrafting === grant.id ? 'Drafting...' : 'AI Draft Proposal'}
                            </IndustrialButton>
                          )}

                          {grant.status === 'INTERNAL_REVIEW' && (
                            <IndustrialButton 
                              onClick={() => handleAssignReviewers(grant.id)}
                              disabled={isAssigning}
                              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border-amber-500/30 flex items-center gap-2 py-1.5 h-auto text-sm"
                            >
                              <Users className="w-4 h-4" />
                              Assign Peer Reviewers
                            </IndustrialButton>
                          )}
                          
                          <IndustrialButton 
                            variant="ghost" 
                            onClick={() => {
                              setSelectedGrant(grant);
                              fetchReviews(grant.id);
                            }}
                            className="p-2 h-auto text-zinc-500 hover:text-zinc-300"
                          >
                            <ArrowUpRight className="w-5 h-5" />
                          </IndustrialButton>
                        </div>
                      </div>

                      {/* Review Quick Stats */}
                      {grant.status === 'INTERNAL_REVIEW' && (
                        <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                            Governance: 2/3 Reviews Completed
                          </div>
                        </div>
                      )}
                      
                      {/* Progress Bar (simplified) */}
                      <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            grant.status === 'PROPOSAL_DRAFT' ? "w-1/5 bg-blue-500" :
                            grant.status === 'INTERNAL_REVIEW' ? "w-2/5 bg-amber-500" :
                            grant.status === 'EXTERNAL_SUBMITTED' ? "w-3/5 bg-purple-500" :
                            grant.status === 'ACTIVE' ? "w-full bg-emerald-500" : "w-0"
                          )}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </>
      )}

      {selectedGrant && (
        <ProposalCanvas 
          grant={selectedGrant} 
          isOpen={!!selectedGrant} 
          onClose={() => setSelectedGrant(null)} 
        />
      )}

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};
