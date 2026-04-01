'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { synergyService, SynergyMatch, CollaborationProposal } from '@/lib/services/synergy-service';
import { Users, Zap, Sparkles, Loader2, UserPlus, History } from 'lucide-react';
import { useToast, Toast } from '@/components/ui/toast-alert';

export function SynergyHub() {
  const [matches, setMatches] = useState<SynergyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposingId, setProposingId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<{ [key: string]: CollaborationProposal }>({});
  const { toast: toastState, showToast, hideToast } = useToast();

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const data = await synergyService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch synergy matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handlePropose = async (targetId: string) => {
    try {
      setProposingId(targetId);
      const data = await synergyService.proposeCollaboration(targetId);
      setProposal(prev => ({ ...prev, [targetId]: data }));
      showToast('success', 'AI Collaboration Proposal Generated!');
    } catch (error) {
      showToast('error', 'Failed to generate proposal.');
    } finally {
      setProposingId(null);
    }
  };

  if (loading) {
    return (
      <GlassCard className="h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-blue-200/60 font-medium font-mono text-sm tracking-widest uppercase">
            Analyzing Research Vectors...
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Synergy Hub</h2>
            <p className="text-xs text-blue-200/50 uppercase tracking-wider font-mono">
              AI-Driven Collaboration Matchmaker
            </p>
          </div>
        </div>
        <IndustrialButton onClick={fetchMatches} className="scale-90">
          Sync Vectors
        </IndustrialButton>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {matches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
            <Users className="w-12 h-12 mb-4 text-blue-200/20" />
            <p className="text-blue-100/60 leading-relaxed">
              No immediate synergies detected.<br />
              Add more publications to improve matching accuracy.
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <div 
              key={match.targetFacultyId}
              className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                    {match.targetName}
                  </h3>
                  <p className="text-xs text-blue-200/40 mb-2">{match.targetDepartment}</p>
                </div>
                <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-500/30">
                  <Zap className="w-3 h-3 fill-current" />
                  {(match.score * 100).toFixed(0)}% Match
                </div>
              </div>

              <p className="text-sm text-blue-100/70 mb-4 line-clamp-2 italic">
                "{match.reason}"
              </p>

              {proposal[match.targetFacultyId] ? (
                <div className="p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-400/20 animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-tighter mb-1 font-mono">
                    Proposed Initiative
                  </p>
                  <p className="text-sm font-semibold text-white mb-2 underline decoration-blue-500/50">
                    {proposal[match.targetFacultyId].title}
                  </p>
                  <p className="text-xs text-blue-200/70 leading-relaxed">
                    {proposal[match.targetFacultyId].goal}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <IndustrialButton className="w-full h-8 text-[10px]" variant="primary">
                      Contact Partner
                    </IndustrialButton>
                    <IndustrialButton 
                      className="w-full h-8 text-[10px]"
                      onClick={() => window.location.href = '/faculty/research'}
                    >
                      Reserve Labs
                    </IndustrialButton>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <IndustrialButton 
                    onClick={() => handlePropose(match.targetFacultyId)}
                    disabled={proposingId === match.targetFacultyId}
                    className="w-full"
                  >
                    {proposingId === match.targetFacultyId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Proposal
                      </>
                    )}
                  </IndustrialButton>
                  <IndustrialButton 
                    variant="outline" 
                    className="px-3"
                    onClick={() => window.location.href = '/faculty/research'}
                  >
                    <History className="w-4 h-4" />
                  </IndustrialButton>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-blue-200/30">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Powered by Ollama Engine
        </span>
        <span className="font-mono">v19.4.0-nexus</span>
      </div>
      <Toast toast={toastState} onClose={hideToast} />
    </GlassCard>
  );
}
