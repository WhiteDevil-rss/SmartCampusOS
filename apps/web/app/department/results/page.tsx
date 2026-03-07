'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuSignature, LuShieldCheck, LuSearch, LuFilter, LuEye, LuBadgeCheck, LuCircleAlert, LuArrowRight, LuExternalLink } from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';

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

export default function ResultManagementPage() {
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
            // Fetch results for the department
            const res = await api.get(`/v2/results/department/${user.entityId}`);
            setResults(res.data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to synchronize academic results.');
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
            showToast('success', 'Result successfully committed to the blockchain.');
            setSelectedResult(null);
            fetchResults();
        } catch (e) {
            showToast('error', 'Blockchain transaction failed. Please try again.');
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
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Result Finalization & Verification">
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-text-primary">Academic Ledger</h2>
                        <p className="text-text-secondary dark:text-text-muted">Finalize student results and publish them to the secure university blockchain.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="glass-card bg-indigo-500/5 border-indigo-500/20">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{results.filter(r => !r.publishedAt).length}</div>
                            <div className="text-xs text-text-secondary uppercase font-black tracking-widest mt-1">Pending Approval</div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{results.filter(r => !!r.blockchainTxHash).length}</div>
                            <div className="text-xs text-text-secondary uppercase font-black tracking-widest mt-1">Blockchain Verified</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
                        <Input
                            placeholder="Search by Enrollment No or Name..."
                            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-border-hover"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                        <LuFilter className="h-4 w-4" /> Filters
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent animate-spin rounded-full"></div></div>
                ) : (
                    <div className="table-container">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-secondary font-bold">
                                <tr>
                                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Student Details</th>
                                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Semester</th>
                                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">SGPA/CGPA</th>
                                    <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Auth Status</th>
                                    <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                                {filteredResults.map(result => (
                                    <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 dark:text-text-primary font-bold">{result.student.name}</div>
                                            <div className="text-xs text-text-secondary uppercase tracking-tighter italic">{result.student.enrollmentNo}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">Sem {result.semester}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/10">{result.sgpa.toFixed(2)}</Badge>
                                                <span className="text-text-muted dark:text-slate-700">|</span>
                                                <span className="text-slate-600 dark:text-text-muted font-mono text-xs">{result.cgpa.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {result.blockchainTxHash ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1 w-fit">
                                                    <LuShieldCheck className="h-3 w-3" /> Immutable
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20">Draft / Local</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedResult(result)}>
                                                <LuEye className="h-4 w-4 mr-2 text-text-muted group-hover:text-indigo-500" /> Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Result Detail Modal */}
                <Dialog open={!!selectedResult} onOpenChange={() => !publishing && setSelectedResult(null)}>
                    <DialogContent className="glass-card sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-black">
                                <LuSignature className="h-6 w-6 text-indigo-600" />
                                Result Finalization Terminal
                            </DialogTitle>
                        </DialogHeader>
                        {selectedResult && (
                            <div className="space-y-6 pt-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-border">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-xs uppercase font-black text-text-muted tracking-widest">Academic Transcript</div>
                                            <div className="font-bold text-lg text-slate-900 dark:text-text-primary leading-tight mt-1">{selectedResult.student.name}</div>
                                            <div className="text-sm text-text-secondary">{selectedResult.student.program.name}</div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                                            {selectedResult.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-border">
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-text-muted">SGPA</div>
                                            <div className="text-2xl font-black">{selectedResult.sgpa.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-text-muted">CGPA</div>
                                            <div className="text-2xl font-black">{selectedResult.cgpa.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedResult.blockchainTxHash ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                            <div className="flex items-center gap-3 text-emerald-600 font-bold mb-2 uppercase text-xs tracking-widest">
                                                <LuShieldCheck className="h-5 w-5" /> Cryptographically Secured
                                            </div>
                                            <p className="text-[11px] text-text-secondary font-mono break-all leading-relaxed">
                                                TX: {selectedResult.blockchainTxHash}
                                            </p>
                                        </div>
                                        <Button variant="outline" className="w-full flex items-center h-12 rounded-xl group" asChild>
                                            <a href={`https://polygonscan.com/tx/${selectedResult.blockchainTxHash}`} target="_blank" rel="noopener noreferrer">
                                                <span>View on Block Explorer</span>
                                                <LuExternalLink className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                            <div className="flex items-center gap-2 text-amber-600 font-bold mb-1 text-sm">
                                                <LuCircleAlert className="h-4 w-4" /> Review Required
                                            </div>
                                            <p className="text-xs text-text-secondary leading-relaxed italic">
                                                Committing this result to the blockchain is an irreversible action. Ensure all marks and grades have been verified by the examining body.
                                            </p>
                                        </div>
                                        <Button
                                            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center justify-center font-bold"
                                            onClick={handlePublishToChain}
                                            disabled={publishing}
                                        >
                                            {publishing ? 'Committing to Ledger...' : (
                                                <>
                                                    <LuShieldCheck className="mr-2 h-5 w-5" />
                                                    Publish to Blockchain
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
