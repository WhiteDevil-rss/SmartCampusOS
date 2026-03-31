'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    LuReceipt, 
    LuShieldCheck, 
    LuBrainCircuit, 
    LuDownload, 
    LuInfo, 
    LuSparkles,
    LuChevronRight,
    LuSearch
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface AuditExplanation {
    summary: string;
    breakdown: { component: string; explanation: string; importance: string }[];
    savingsTip: string;
}

export function FinancialLedger() {
    const [payments, setPayments] = useState<any[]>([]);
    const [structures, setStructures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [auditing, setAuditing] = useState<string | null>(null);
    const [auditResult, setAuditResult] = useState<{ [key: string]: AuditExplanation }>({});
    const [searchQuery, setSearchQuery] = useState('');
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchFinancials();
    }, []);

    const fetchFinancials = async () => {
        try {
            const res = await api.get('/v2/student/fees');
            setStructures(res.data.feeStructures || []);
            setPayments(res.data.feePayments || []);
        } catch (error) {
            console.error('Failed to load financials:', error);
            showToast('error', 'Critical error loading ledger data');
        } finally {
            setLoading(false);
        }
    };

    const handleAIAudit = async (structureId: string) => {
        setAuditing(structureId);
        try {
            const res = await api.get(`/v2/fees/audit/${structureId}`);
            setAuditResult(prev => ({ ...prev, [structureId]: res.data }));
            showToast('success', 'AI Audit completed successfully');
        } catch (error) {
            showToast('error', 'AI Engine is currently unavailable');
        } finally {
            setAuditing(null);
        }
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-40 w-full rounded-2xl bg-surface" /></div>;

    return (
        <div className="space-y-8">
            {/* AI Auditor Entry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-12 p-1 border-none bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 shadow-none overflow-hidden relative group">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                    <div className="glass-card p-6 bg-white/40 dark:bg-black/40 backdrop-blur-3xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
                                <LuBrainCircuit className="w-8 h-8 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    AI Financial Strategic Audit
                                    <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Beta</span>
                                </h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Automated transparency into fee structures & institutional spending.</p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => structures[0] && handleAIAudit(structures[0].id)}
                            disabled={!!auditing || structures.length === 0}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                        >
                            {auditing ? <LuSparkles className="w-4 h-4 animate-spin" /> : <LuShieldCheck className="w-4 h-4" />}
                            {auditing ? 'Auditing Logic...' : 'Run Global Audit'}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Audit Insights Tray */}
            <AnimatePresence>
                {Object.keys(auditResult).length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {Object.entries(auditResult).map(([id, audit]) => (
                            <Card key={id} className="p-6 glass-card bg-indigo-500/[0.02] border-indigo-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2">
                                    <LuSparkles className="w-4 h-4 text-indigo-400 opacity-50" />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                                    AI Insight: General Summary
                                </h4>
                                <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed mb-6 italic">
                                    "{audit.summary}"
                                </p>
                                <div className="space-y-3">
                                    {audit.breakdown.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-white/10">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.component}</span>
                                                <span className={cn(
                                                    "text-[8px] px-2 py-0.5 rounded-full font-black",
                                                    item.importance === 'CRITICAL' ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-500"
                                                )}>{item.importance}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                        <LuInfo className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Strategic Savings Tip</p>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{audit.savingsTip}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Matrix Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-12 glass-card bg-white/30 dark:bg-black/20 backdrop-blur-xl border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <LuReceipt className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">Transaction Matrix</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chronological Immutable Record</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Filter matrix..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border-none text-xs text-text-primary focus:ring-2 focus:ring-indigo-500/30 w-64 md:w-80 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference Hash</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Channel</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Value (INR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p, idx) => (
                                    <motion.tr 
                                        key={p.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group border-b border-slate-100 dark:border-white/5 hover:bg-indigo-500/[0.01] transition-colors"
                                    >
                                        <td className="p-5 whitespace-nowrap">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {new Date(p.paymentDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="p-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-black font-mono text-indigo-400/80 group-hover:text-indigo-400 transition-colors uppercase">
                                                    {p.transactionId?.slice(-12) || 'PENDING_SIG'}
                                                </span>
                                                <button className="p-1.5 rounded-lg bg-indigo-500/5 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <LuDownload className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-5 whitespace-nowrap text-slate-400 font-black text-[9px] uppercase tracking-widest">{p.method}</td>
                                        <td className="p-5 whitespace-nowrap">
                                           <div className={cn(
                                                "text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-2 w-fit border",
                                                p.status === 'COMPLETED' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                                           )}>
                                                <div className={cn("w-1 h-1 rounded-full", p.status === 'COMPLETED' ? "bg-emerald-500 shadow-[0_0_8px] shadow-emerald-500/50" : "bg-amber-500")} />
                                                {p.status}
                                           </div>
                                        </td>
                                        <td className="p-5 text-right whitespace-nowrap">
                                            <span className="text-base font-black text-slate-900 dark:text-white tracking-tighter">
                                                ₹{p.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
