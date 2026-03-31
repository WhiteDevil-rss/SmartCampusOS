'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuClipboardList, LuCheck, LuX, LuEye, LuFileText, LuClock, LuUser, LuBadgeCheck } from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';

interface AttendanceFlag {
    id: string;
    studentId: string;
    startDate: string;
    endDate: string;
    flagType: string;
    reason: string;
    documentUrl: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    appliedAt: string;
    student: {
        name: string;
        enrollmentNo: string;
        batch: { name: string };
    }
}

export default function LeaveApprovalsPage() {
    const { user } = useAuthStore();
    const [flags, setFlags] = useState<AttendanceFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    const [selectedFlag, setSelectedFlag] = useState<AttendanceFlag | null>(null);
    const [remarks, setRemarks] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchFlags = useCallback(async () => {
        if (!user?.universityId) return;
        try {
            const res = await api.get(`/v2/student/attendance/flags/admin?universityId=${user.universityId}&departmentId=${user.entityId}`);
            setFlags(res.data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to fetch leave requests.');
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        fetchFlags();
    }, [fetchFlags]);

    const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
        if (!selectedFlag) return;
        setProcessing(true);
        try {
            await api.patch(`/v2/student/attendance/flags/admin/${selectedFlag.id}`, { status, remarks });
            showToast('success', `Request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
            setSelectedFlag(null);
            setRemarks('');
            fetchFlags();
        } catch (e) {
            showToast('error', 'Action failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
            case 'APPROVED':
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>;
            case 'REJECTED':
                return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Leave & Attendance Approvals">
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-text-primary">Attendance Flag Center</h2>
                        <p className="text-text-secondary dark:text-text-muted">Review medical, sports, and official event leave requests from students.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : flags.length === 0 ? (
                    <Card className="glass-card border-dashed border-2 py-20 text-center">
                        <CardContent>
                            <LuClipboardList className="h-16 w-16 mx-auto text-text-muted mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-text-primary mb-1">Queue Empty</h3>
                            <p className="text-text-secondary">There are no pending leave requests in your department.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="table-container">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-secondary">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Student</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Type</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Period</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {flags.map(flag => (
                                    <tr key={flag.id} className="hover:bg-slate-50/50 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-text-primary">{flag.student.name}</div>
                                            <div className="text-xs text-text-secondary">{flag.student.enrollmentNo} • {flag.student.batch.name}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <Badge variant="secondary" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/10 uppercase text-[10px]">
                                                {flag.flagType.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary text-xs">
                                            {new Date(flag.startDate).toLocaleDateString()} - {new Date(flag.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(flag.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedFlag(flag)}>
                                                <LuEye className="h-4 w-4 mr-2" /> View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Approval Dialog */}
                <Dialog open={!!selectedFlag} onOpenChange={() => !processing && setSelectedFlag(null)}>
                    <DialogContent className="glass-card sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <LuBadgeCheck className="h-5 w-5 text-indigo-600" />
                                Review Leave Request
                            </DialogTitle>
                            <DialogDescription>Validate the reason and documents before approving.</DialogDescription>
                        </DialogHeader>
                        {selectedFlag && (
                            <div className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-border">
                                        <div className="text-xs uppercase font-black text-text-muted mb-2">Student Info</div>
                                        <div className="font-bold text-slate-900 dark:text-text-primary">{selectedFlag.student.name}</div>
                                        <div className="text-sm text-text-secondary">{selectedFlag.student.enrollmentNo}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-xs uppercase font-black text-text-muted">Duration</div>
                                            <div className="text-xs font-semibold">{new Date(selectedFlag.startDate).toLocaleDateString()} to {new Date(selectedFlag.endDate).toLocaleDateString()}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs uppercase font-black text-text-muted">Category</div>
                                            <div className="text-xs font-semibold">{selectedFlag.flagType}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs uppercase font-black text-text-muted">Reason/Context</div>
                                        <div className="text-sm text-slate-700 dark:text-text-muted italic">&ldquo;{selectedFlag.reason || 'No reason provided.'}&rdquo;</div>
                                    </div>
                                    {selectedFlag.documentUrl && (
                                        <Button variant="outline" className="w-full flex items-center gap-2" asChild>
                                            <a href={selectedFlag.documentUrl} target="_blank" rel="noopener noreferrer">
                                                <LuFileText className="h-4 w-4" /> View Supporting Document
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                {selectedFlag.status === 'PENDING' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-text-secondary">Remarks (Optional)</label>
                                            <Textarea
                                                placeholder="Add comments for the student..."
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                className="bg-slate-50/50 dark:bg-slate-900/50"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-10"
                                                onClick={() => handleUpdateStatus('APPROVED')}
                                                disabled={processing}
                                            >
                                                {processing ? 'Processing...' : <><LuCheck className="mr-2 h-4 w-4" /> Approve</>}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 h-10"
                                                onClick={() => handleUpdateStatus('REJECTED')}
                                                disabled={processing}
                                            >
                                                {processing ? 'Processing...' : <><LuX className="mr-2 h-4 w-4" /> Reject</>}
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {selectedFlag.status !== 'PENDING' && (
                                    <div className={`p-4 rounded-xl text-center font-bold uppercase text-sm ${selectedFlag.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                        Status: {selectedFlag.status}
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
