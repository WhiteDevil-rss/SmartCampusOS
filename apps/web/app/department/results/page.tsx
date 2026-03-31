'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { 
    LuSignature, 
    LuShieldCheck, 
    LuSearch, 
    LuFilter, 
    LuEye, 
    LuBadgeCheck, 
    LuCircleAlert, 
    LuArrowRight, 
    LuExternalLink,
    LuActivity,
    LuRefreshCw
} from 'react-icons/lu';
import { 
    FileText, 
    ShieldCheck, 
    Activity, 
    BadgeCheck,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
    GlassCard, 
    GlassCardContent, 
    GlassCardHeader, 
    GlassCardTitle,
    StatCard 
} from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { GreetingCard } from '@/components/v2/shared/greeting-card';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Result {
    id: string;
    studentId: string;
    semester: number;
    academicYear: string;
    sgpa: number;
    cgpa: number;
    status: string;
    publishedAt: string | null;
    blockchainTxHash: string | null;
    student: {
        name: string;
        enrollmentNo: string;
        program: { name: string };
    }
}

export default function AcademicAchievementRegistry() {
    const { user } = useAuthStore();
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const [selectedResult, setSelectedResult] = useState<Result | null>(null);
    const [publishing, setPublishing] = useState(false);

    const fetchResults = useCallback(async () => {
        if (!user?.entityId) return;
        try {
            const res = await api.get(`/v2/results/department/${user.entityId}`);
            setResults(res.data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to synchronize academic achievements.');
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handlePublishToChain = async () => {
        if (!selectedResult) return;
        setPublishing(true);
        try {
            await api.post(`/v2/verification/publish/${selectedResult.id}`);
            showToast('success', 'Achievement successfully committed to the institutional ledger.');
            setSelectedResult(null);
            fetchResults();
        } catch (e) {
            showToast('error', 'Institutional verification failed. Please try again.');
        } finally {
            setPublishing(false);
        }
    };

    const filteredResults = results.filter(r =>
        r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <V2DashboardLayout title="Academic Achievement & Registry">
                <Toast toast={toast} onClose={hideToast} />

                <div className="space-y-10 pb-24">
                    
                    {/* Institutional Greeting */}
                    <GreetingCard 
                        name={user?.username || 'Administrator'}
                        role="Registry Registrar"
                        stats={[
                            { label: "Pending Verification", value: results.filter(r => !r.publishedAt).length, icon: FileText },
                            { label: "Verified Achievements", value: results.filter(r => !!r.blockchainTxHash).length, icon: ShieldCheck }
                        ]}
                    />

                    {/* Registry Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Registrations" 
                            value={results.length} 
                            change={5.2} 
                            icon={FileText} 
                            changeDescription="vs last semester"
                        />
                        <StatCard 
                            title="Pending Approval" 
                            value={results.filter(r => !r.publishedAt).length} 
                            change={-12} 
                            icon={Activity} 
                            changeDescription="awaiting review"
                        />
                        <StatCard 
                            title="Verified Assets" 
                            value={results.filter(r => !!r.blockchainTxHash).length} 
                            change={24} 
                            icon={ShieldCheck} 
                            changeDescription="blockchain-secured"
                        />
                        <StatCard 
                            title="Registry Integrity" 
                            value={100} 
                            change={0} 
                            icon={BadgeCheck} 
                            suffix="%"
                            changeDescription="security status"
                        />
                    </div>

                    <GlassCard className="rounded-[3rem] border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.01]">
                            <div className="flex items-center gap-4 w-full md:w-96 relative group">
                                <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search by identity or enrollment..."
                                    className="pl-12 h-14 rounded-2xl bg-white/5 border-white/10 font-bold text-slate-100 placeholder:text-slate-600 focus:ring-primary/50 transition-all border-dashed"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <IndustrialButton variant="secondary" size="sm" className="h-14 px-6 text-[10px] uppercase font-black tracking-widest flex-1 md:flex-none">
                                    <LuFilter className="mr-2 h-4 w-4" /> Filter Registry
                                </IndustrialButton>
                                <IndustrialButton variant="primary" size="sm" className="h-14 px-6 text-[10px] uppercase font-black tracking-widest flex-1 md:flex-none" onClick={fetchResults}>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                                </IndustrialButton>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    <tr>
                                        <th className="px-8 py-5">Academic Identity</th>
                                        <th className="px-8 py-5">Semester Cycle</th>
                                        <th className="px-8 py-5">Efficiency Index (GPA)</th>
                                        <th className="px-8 py-5">Integrity Status</th>
                                        <th className="px-8 py-5 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-medium">
                                    <AnimatePresence mode="popLayout">
                                        {filteredResults.map((result, i) => (
                                            <motion.tr 
                                                key={result.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="hover:bg-primary/[0.03] transition-all duration-300 group cursor-pointer"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-black text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                                            {result.student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-100 uppercase tracking-tight font-space-grotesk group-hover:text-primary transition-colors duration-300">{result.student.name}</div>
                                                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter italic">{result.student.enrollmentNo}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-mono text-[11px] font-black uppercase text-slate-400">
                                                    Cycle {result.semester}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] rounded-lg h-7 px-3">
                                                            SGPA: {result.sgpa.toFixed(2)}
                                                        </Badge>
                                                        <span className="text-white/10 font-bold">|</span>
                                                        <span className="text-slate-600 italic font-black text-[10px] uppercase tracking-widest">CGPA: {result.cgpa.toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {result.blockchainTxHash ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Institutional Secure</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Awaiting Verification</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <IndustrialButton 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-10 px-4 text-[9px] uppercase font-black tracking-widest hover:text-primary transition-all"
                                                        onClick={() => setSelectedResult(result)}
                                                    >
                                                        <LuEye className="mr-2 h-3.5 w-3.5" /> View Registry
                                                    </IndustrialButton>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Result Detail Modal */}
                <Dialog open={!!selectedResult} onOpenChange={() => !publishing && setSelectedResult(null)}>
                    <DialogContent className="glass-card border-white/10 bg-slate-900 shadow-2xl rounded-[2.5rem] sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-2xl font-black italic uppercase tracking-tighter text-slate-100 font-space-grotesk">
                                <LuSignature className="h-6 w-6 text-primary" />
                                Achievement Publication
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                Secure verification terminal for academic transcripts.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedResult && (
                            <div className="space-y-6 pt-6">
                                <GlassCard className="border-white/5 bg-white/[0.02] p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mb-1">Academic Recipient</div>
                                            <div className="font-black text-xl text-slate-100 font-space-grotesk leading-tight uppercase tracking-tight">{selectedResult.student.name}</div>
                                            <div className="text-[10px] font-black text-primary uppercase mt-1 tracking-widest">{selectedResult.student.program.name}</div>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/40 text-primary rounded-lg px-3 py-1 bg-primary/5">
                                            {selectedResult.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                        <div className="space-y-1">
                                            <div className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Efficiency (SGPA)</div>
                                            <div className="text-3xl font-black text-slate-100 font-space-grotesk tracking-tighter">{selectedResult.sgpa.toFixed(2)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Endurance (CGPA)</div>
                                            <div className="text-3xl font-black text-slate-400 font-space-grotesk tracking-tighter">{selectedResult.cgpa.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </GlassCard>

                                {selectedResult.blockchainTxHash ? (
                                    <div className="space-y-4">
                                        <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem]">
                                            <div className="flex items-center gap-3 text-emerald-500 font-black mb-3 uppercase text-[10px] tracking-widest">
                                                <LuShieldCheck className="h-5 w-5" /> Institutional Security Locked
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-mono break-all leading-relaxed whitespace-pre-wrap">
                                                INTEGRITY_TX::{selectedResult.blockchainTxHash}
                                            </p>
                                        </div>
                                        <IndustrialButton 
                                            variant="secondary" 
                                            className="w-full h-14 rounded-2xl group text-[10px] uppercase font-black tracking-widest"
                                            onClick={() => window.open(`https://polygonscan.com/tx/${selectedResult.blockchainTxHash}`, '_blank')}
                                        >
                                            <span>Verify on Block Explorer</span>
                                            <ExternalLink className="ml-auto h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                        </IndustrialButton>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-[2rem]">
                                            <div className="flex items-center gap-2 text-amber-500 font-black mb-2 text-[10px] uppercase tracking-widest">
                                                <LuCircleAlert className="h-4 w-4" /> Final Verification Review
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic">
                                                Committing this achievement to the institutional ledger is an irreversible action. Confirm all academic metrics have been audited.
                                            </p>
                                        </div>
                                        <IndustrialButton
                                            variant="primary"
                                            className="w-full h-14 rounded-2xl flex items-center justify-center font-black uppercase text-[11px] tracking-[0.2em]"
                                            onClick={handlePublishToChain}
                                            disabled={publishing}
                                        >
                                            {publishing ? (
                                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <LuShieldCheck className="mr-3 h-5 w-5" />
                                                    Commit to Secure Registry
                                                </>
                                            )}
                                        </IndustrialButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </V2DashboardLayout>
        </ProtectedRoute>
    );
}
