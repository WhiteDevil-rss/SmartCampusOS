'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuLifeBuoy, LuClipboardList, LuMessageSquare, LuBadgeCheck, LuCircle, LuClock, LuEye, LuUser, LuCheck, LuInfo, LuCircleAlert } from 'react-icons/lu';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Toast, useToast } from '@/components/ui/toast-alert';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';

interface ServiceRequest {
    id: string;
    type: string;
    status: string;
    description: string;
    createdAt: string;
    student: {
        name: string;
        enrollmentNo: string;
        email: string;
        program: { name: string };
        batch: { name: string };
    }
}

interface Complaint {
    id: string;
    category: string;
    subject: string;
    description: string;
    status: string;
    resolution?: string;
    isAnonymous: boolean;
    createdAt: string;
    student?: {
        name: string;
        email: string;
    }
}

export default function HelpdeskPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [resolutionText, setResolutionText] = useState('');

    const fetchData = useCallback(async () => {
        if (!user?.universityId) return;
        try {
            const [reqRes, compRes] = await Promise.all([
                api.get(`/v2/service-requests/admin?universityId=${user.universityId}&departmentId=${user.entityId}`),
                api.get(`/v2/complaints/admin?universityId=${user.universityId}`)
            ]);
            setRequests(reqRes.data);
            setComplaints(compRes.data);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to synchronize helpdesk data.');
        } finally {
            setLoading(false);
        }
    }, [user, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (id: string, type: 'request' | 'complaint', newStatus: string, resolution?: string) => {
        try {
            if (type === 'request') {
                await api.patch(`/v2/service-requests/admin/${id}`, { status: newStatus, approvedBy: user?.id });
                showToast('success', `Request marked as ${newStatus.toLowerCase()}.`);
            } else {
                await api.patch(`/v2/complaints/admin/${id}`, { status: newStatus, resolution });
                showToast('success', `Complaint ${newStatus.toLowerCase()}.`);
            }
            setSelectedRequest(null);
            setSelectedComplaint(null);
            setResolutionText('');
            fetchData();
        } catch (e) {
            showToast('error', 'Operation failed. Please try again.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': case 'OPEN':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
            case 'APPROVED': case 'UNDER_REVIEW':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">In Progress</Badge>;
            case 'COMPLETED': case 'RESOLVED':
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Resolved</Badge>;
            case 'REJECTED':
                return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Helpdesk & Support">
                <Toast toast={toast} onClose={hideToast} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-text-primary">Support Command Center</h2>
                        <p className="text-text-secondary dark:text-text-muted">Manage student document requests and address campus grievances.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="glass-card bg-amber-500/5 border-amber-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600"><LuClock className="h-6 w-6" /></div>
                                <div>
                                    <div className="text-2xl font-bold">{requests.filter(r => r.status === 'PENDING').length}</div>
                                    <div className="text-xs text-text-secondary uppercase font-bold tracking-wider">Pending Requests</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-rose-500/5 border-rose-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600"><LuCircleAlert className="h-6 w-6" /></div>
                                <div>
                                    <div className="text-2xl font-bold">{complaints.filter(c => c.status === 'OPEN').length}</div>
                                    <div className="text-xs text-text-secondary uppercase font-bold tracking-wider">Open Complaints</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600"><LuBadgeCheck className="h-6 w-6" /></div>
                                <div>
                                    <div className="text-2xl font-bold">{requests.filter(r => r.status === 'COMPLETED').length + complaints.filter(c => c.status === 'RESOLVED').length}</div>
                                    <div className="text-xs text-text-secondary uppercase font-bold tracking-wider">Tickets Resolved</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card bg-indigo-500/5 border-indigo-500/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600"><LuLifeBuoy className="h-6 w-6" /></div>
                                <div>
                                    <div className="text-2xl font-bold">{requests.length + complaints.length}</div>
                                    <div className="text-xs text-text-secondary uppercase font-bold tracking-wider">Total Tickets</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="requests" className="space-y-6">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Service Requests</TabsTrigger>
                        <TabsTrigger value="complaints" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Student Complaints</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests" className="space-y-4">
                        <div className="table-container">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-secondary">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Student</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Request Type</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Submitted</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {requests.map(req => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 dark:text-text-primary">{req.student.name}</div>
                                                <div className="text-xs text-text-secondary">{req.student.enrollmentNo}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className="bg-indigo-500/5 text-indigo-600 border-indigo-500/10">{req.type}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="sm" variant="ghost" onClick={() => setSelectedRequest(req)}>
                                                    <LuEye className="h-4 w-4 mr-2" /> View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="complaints" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {complaints.map(comp => (
                                <Card key={comp.id} className="glass-card border-slate-200 dark:border-border hover:border-indigo-500/40 transition-all">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-6 flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="bg-rose-500/5 text-rose-600">{comp.category}</Badge>
                                                        {comp.isAnonymous && <Badge className="bg-slate-800 text-text-primary"><LuUser className="h-3 w-3 mr-1" /> Anonymous</Badge>}
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-text-primary">{comp.subject}</h4>
                                                </div>
                                                {getStatusBadge(comp.status)}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-text-muted line-clamp-2 italic">&ldquo;{comp.description}&rdquo;</p>
                                            <div className="text-[11px] text-text-muted flex items-center gap-4">
                                                <span className="flex items-center gap-1"><LuClock className="h-3 w-3" /> {new Date(comp.createdAt).toLocaleString()}</span>
                                                {!comp.isAnonymous && <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-text-muted"><LuUser className="h-3 w-3" /> {comp.student?.name}</span>}
                                            </div>
                                        </div>
                                        <div className="p-6 border-t md:border-t-0 md:border-l dark:border-border bg-slate-50/50 dark:bg-slate-800/20 flex flex-col justify-center items-center gap-2 w-full md:w-48">
                                            <Button className="w-full" onClick={() => setSelectedComplaint(comp)}>Resolve</Button>
                                            <Button variant="ghost" className="w-full">Archive</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* --- MODALS --- */}

                {/* Request Detail Modal */}
                <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                    <DialogContent className="glass-card sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <LuBadgeCheck className="h-5 w-5 text-indigo-600" />
                                Review Request: {selectedRequest?.type}
                            </DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-border">
                                        <div className="text-xs uppercase font-black text-text-muted mb-2">Student Particulars</div>
                                        <div className="font-bold text-slate-900 dark:text-text-primary">{selectedRequest.student.name}</div>
                                        <div className="text-sm text-text-secondary">{selectedRequest.student.program.name} • Batch {selectedRequest.student.batch.name}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs uppercase font-black text-text-muted">Request Motive</div>
                                        <div className="text-sm text-slate-700 dark:text-text-muted italic">&ldquo;{selectedRequest.description}&rdquo;</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(selectedRequest.id, 'request', 'APPROVED')}>
                                        <LuCheck className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button variant="destructive" className="flex-1" onClick={() => handleUpdateStatus(selectedRequest.id, 'request', 'REJECTED')}>
                                        <LuCircle className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </div>
                                {selectedRequest.status === 'APPROVED' && (
                                    <Button variant="outline" className="w-full border-emerald-600 text-emerald-600" onClick={() => handleUpdateStatus(selectedRequest.id, 'request', 'COMPLETED')}>
                                        Mark as Issued/Completed
                                    </Button>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Complaint Resolution Modal */}
                <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
                    <DialogContent className="glass-card sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Grievance Resolution</DialogTitle>
                            <DialogDescription>Provide a formal response to this complaint.</DialogDescription>
                        </DialogHeader>
                        {selectedComplaint && (
                            <div className="space-y-4 pt-4">
                                <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                                    <div className="font-bold text-slate-900 dark:text-text-primary mb-1">{selectedComplaint.subject}</div>
                                    <p className="text-sm text-slate-600 dark:text-text-muted">&ldquo;{selectedComplaint.description}&rdquo;</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Official Resolution / Response</label>
                                    <Textarea
                                        placeholder="Outline the steps taken to resolve this issue..."
                                        className="h-32"
                                        value={resolutionText}
                                        onChange={e => setResolutionText(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button variant="outline" onClick={() => setSelectedComplaint(null)}>Close</Button>
                                    <Button disabled={!resolutionText} onClick={() => handleUpdateStatus(selectedComplaint.id, 'complaint', 'RESOLVED', resolutionText)}>
                                        Submit Resolution
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </DashboardLayout>
        </ProtectedRoute>
    );
}
