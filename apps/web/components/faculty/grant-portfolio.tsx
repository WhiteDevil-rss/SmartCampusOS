'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  History, 
  ShieldCheck, 
  AlertTriangle,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { GlassCard, StatCard } from '../v2/shared/cards';
import { IndustrialButton } from '../v2/shared/inputs';
import { grantService } from '../../lib/services/grant-service';
import { useToast, Toast } from '../ui/toast-alert';
import { cn } from '@/lib/utils';
import { ExpenditureForm } from '@/components/faculty/expenditure-form';

interface GrantPortfolioProps {
  grantId: string;
  onBack: () => void;
}

export const GrantPortfolio: React.FC<GrantPortfolioProps> = ({ grantId, onBack }) => {
  const [financials, setFinancials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const fetchFinancials = async () => {
    try {
      setIsLoading(true);
      const data = await grantService.getGrantFinancials(grantId);
      setFinancials(data);
    } catch (error) {
      showToast('error', 'Failed to retrieve grant financials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [grantId]);

  const handleAnalyzeEthics = async () => {
    try {
      showToast('info', 'AI is analyzing research project for ethical compliance...');
      await grantService.analyzeEthics(grantId);
      showToast('success', 'Ethical analysis completed. Check status below.');
      fetchFinancials();
    } catch (error) {
      showToast('error', 'Ethical analysis failed. Ensure AI Engine is active.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs">
          Loading Financial Portfolio...
        </p>
      </div>
    );
  }

  if (!financials) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{financials.grantTitle}</h2>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Financial Portfolio & Accountability</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Grant" 
          value={financials.totalBudget} 
          prefix="$" 
          icon={DollarSign}
          change={0}
        />
        <StatCard 
          title="Expended" 
          value={financials.totalExpended} 
          prefix="$" 
          icon={TrendingUp}
          change={0}
          className="border-blue-500/20"
        />
        <StatCard 
          title="Remaining" 
          value={financials.remaining} 
          prefix="$" 
          icon={History}
          change={0}
          className="border-emerald-500/20"
        />
        <StatCard 
          title="Burn Rate" 
          value={financials.burnRate} 
          suffix="%" 
          icon={PieChartIcon}
          change={0}
          className={cn(financials.burnRate > 90 ? "border-rose-500/30" : "border-zinc-800")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenditure History & Log */}
        <GlassCard className="lg:col-span-2 p-0 flex flex-col border-zinc-800/50">
          <div className="p-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/20">
            <h4 className="font-bold text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              Expenditure Ledger
            </h4>
            <IndustrialButton 
              onClick={() => setShowLogForm(true)}
              className="py-1.5 h-auto text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Spending
            </IndustrialButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 border-b border-zinc-800/30">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {financials.expenditures.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-zinc-500 text-sm">
                      No expenditures recorded yet.
                    </td>
                  </tr>
                ) : (
                  financials.expenditures.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-4 text-xs tabular-nums text-zinc-400">
                        {exp.date ? new Date(exp.date).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded bg-zinc-800 text-[10px] font-bold uppercase text-zinc-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-300 group-hover:text-white transition-colors">
                        {exp.description}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-right text-zinc-100 tabular-nums">
                        ${exp.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Accountability & Compliance */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-zinc-800/50 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Ethical Compliance
                </h4>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                  financials.ethicalStatus === 'APPROVED' ? "bg-emerald-500/10 text-emerald-400" : 
                  financials.ethicalStatus === 'FLAG_NEED_REVIEW' ? "bg-rose-500/10 text-rose-400" : 
                  "bg-amber-500/10 text-amber-400"
                )}>
                  {financials.ethicalStatus ? financials.ethicalStatus.replace('_', ' ') : 'PENDING'}
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Institutional Review Board (IRB) status tracks the ethical integrity and regulatory compliance of this research project.
                </p>
                
                {financials.ethicalStatus === 'NOT_STARTED' && (
                  <IndustrialButton 
                    onClick={handleAnalyzeEthics}
                    className="w-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-widest text-[10px]"
                  >
                    Trigger AI Ethical Audit
                  </IndustrialButton>
                )}

                {financials.ethicalStatus === 'FLAG_NEED_REVIEW' && (
                  <div className="p-3 rounded bg-rose-500/5 border border-rose-500/20 flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-300 font-medium">
                      AI systems flagged ethical considerations. Reviewer notes will appear here once human audit is complete.
                    </p>
                  </div>
                )}
             </div>
          </GlassCard>

          <GlassCard className="p-6 border-zinc-800/50">
            <h4 className="font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-purple-400" />
              Budget Allocation
            </h4>
            <div className="space-y-3">
              {financials.categoryBreakdown && Object.keys(financials.categoryBreakdown).length > 0 ? (
                Object.entries(financials.categoryBreakdown).map(([cat, amt]: [any, any]) => {
                  const percentage = (amt / financials.totalBudget) * 100;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                        <span>{cat}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-700" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-zinc-500 text-xs italic">No budget data available</p>
              )}
            </div>
          </GlassCard>

          {/* Linked Resources Section */}
          <GlassCard className="p-6 border-zinc-800/50">
            <h4 className="font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-emerald-400" />
              Linked Resources
            </h4>
            <div className="space-y-3">
              {financials.linkedBookings?.length === 0 ? (
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">No active reservations</p>
              ) : (
                financials.linkedBookings?.map((rb: any) => (
                  <div key={rb.id} className="p-3 rounded bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-200">{rb.resourceName}</span>
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded",
                        rb.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-400"
                      )}>
                        {rb.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 tabular-nums">
                      {new Date(rb.startTime).toLocaleDateString()} - {new Date(rb.endTime).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {showLogForm && (
        <ExpenditureForm 
          grantId={grantId}
          isOpen={showLogForm}
          onClose={() => setShowLogForm(false)}
          onSuccess={() => {
            setShowLogForm(false);
            fetchFinancials();
          }}
        />
      )}

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};
