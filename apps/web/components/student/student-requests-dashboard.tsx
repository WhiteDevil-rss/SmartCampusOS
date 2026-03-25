'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LuFileText, LuMessageSquare, LuPlus, LuClock, LuCircleCheck, LuCircleX, LuInfo, LuSend, LuFileSearch, LuShield } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface ServiceRequest {
    id: string;
    type: string;
    status: string;
    description: string | null;
    createdAt: string;
}

interface Complaint {
    id: string;
    category: string;
    subject: string;
    status: string;
    createdAt: string;
}

export function StudentRequestsDashboard() {
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

    // Form states
    const [requestType, setRequestType] = useState('BONAFIDE');
    const [requestDesc, setRequestDesc] = useState('');

    const [complaintCategory, setComplaintCategory] = useState('ACADEMIC');
    const [complaintSubject, setComplaintSubject] = useState('');
    const [complaintDesc, setComplaintDesc] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get('/student/requests');
            setServiceRequests(res.data.serviceRequests || []);
            setComplaints(res.data.complaints || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            showToast('error', 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onServiceRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/student/requests/service', {
                description: requestDesc,
                type: requestType
            });
            showToast('success', 'Service request submitted successfully');
            setIsRequestModalOpen(false);
            setRequestDesc('');
            fetchData();
        } catch (error) {
            showToast('error', 'Failed to submit service request');
        }
    };

    const onComplaintSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/student/requests/complaint', {
                subject: complaintSubject,
                description: complaintDesc,
                category: complaintCategory
            });
            showToast('success', 'Complaint lodged successfully');
            setIsComplaintModalOpen(false);
            setComplaintSubject('');
            setComplaintDesc('');
            fetchData();
        } catch (error) {
            showToast('error', 'Failed to lodge complaint');
        }
    };

    const handleViewDocument = async (requestId: string) => {
        try {
            const res = await api.get(`/v2/student/requests/document/${requestId}`);
            showToast('success', `Viewing ${res.data.title}. Verification Code: ${res.data.verificationCode}`);
            // In a real app, open a PDF modal
        } catch (e) {
            showToast('error', 'Failed to generate document. Ensure the request is approved.');
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <Skeleton className="h-[400px] rounded-3xl bg-surface" />
            </div>
        );
    }

    const StatusPill = ({ status }: { status: string }) => {
        const colors: any = {
            PENDING: "bg-amber-500/10 text-amber-500",
            APPROVED: "bg-emerald-500/10 text-emerald-500",
            REJECTED: "bg-rose-500/10 text-rose-500",
            COMPLETED: "bg-indigo-500/10 text-indigo-500",
            OPEN: "bg-blue-500/10 text-blue-500",
            UNDER_REVIEW: "bg-amber-500/10 text-amber-500",
            RESOLVED: "bg-emerald-500/10 text-emerald-500",
            ESCALATED: "bg-rose-500/10 text-rose-500",
        };
        const icons: any = {
            PENDING: <LuClock className="w-3 h-3" />,
            APPROVED: <LuCircleCheck className="w-3 h-3" />,
            REJECTED: <LuCircleX className="w-3 h-3" />,
            COMPLETED: <LuCircleCheck className="w-3 h-3" />,
            OPEN: <LuInfo className="w-3 h-3" />,
            UNDER_REVIEW: <LuClock className="w-3 h-3" />,
            RESOLVED: <LuCircleCheck className="w-3 h-3" />,
            ESCALATED: <LuInfo className="w-3 h-3" />,
        };
        return (
            <div className="flex items-center gap-2">
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1 w-fit", colors[status] || "bg-surface text-text-muted")}>
                    {icons[status] || <LuClock className="w-3.5 h-3.5" />}
                    {status.replace('_', ' ')}
                </span>
                {status === 'RESOLVED' && <LuShield className="w-3.5 h-3.5 text-emerald-500" title="On-Chain Verified Resolution" />}
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <Tabs defaultValue="services" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <TabsList className="bg-surface p-1 h-auto rounded-2xl border border-border">
                        <TabsTrigger value="services" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-text-primary transition-all font-bold">
                            Official Requests
                        </TabsTrigger>
                        <TabsTrigger value="complaints" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-rose-500 data-[state=active]:text-text-primary transition-all font-bold">
                            Grievances
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4">
                        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-text-primary font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]">
                                    <LuPlus className="w-4 h-4 mr-2" /> New Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card border-border-hover bg-surface/95 backdrop-blur-3xl text-text-primary max-w-md rounded-3xl p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black tracking-tighter">New Service Request</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={onServiceRequestSubmit} className="space-y-6 mt-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Request Type</label>
                                        <select
                                            value={requestType}
                                            onChange={(e) => setRequestType(e.target.value)}
                                            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="BONAFIDE" className="bg-surface">Bonafide Certificate</option>
                                            <option value="TRANSCRIPT" className="bg-surface">Official Transcript</option>
                                            <option value="ID_CARD" className="bg-surface">New ID Card</option>
                                            <option value="PASS" className="bg-surface">College Pass / Entry Permit</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Reason / Description</label>
                                        <Textarea value={requestDesc} onChange={(e) => setRequestDesc(e.target.value)} placeholder="State the reason for your request..." className="bg-surface border-border rounded-xl min-h-[120px] focus:ring-primary shadow-inner" />
                                    </div>
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-text-primary font-black py-4 rounded-xl shadow-[0_10px_30px_rgba(var(--primary-rgb),0.2)] flex items-center justify-center gap-2">
                                        <LuSend className="w-4 h-4" /> Submit Request
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isComplaintModalOpen} onOpenChange={setIsComplaintModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-rose-500 hover:bg-rose-600 text-text-primary font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.3)]">
                                    <LuPlus className="w-4 h-4 mr-2" /> Lodge Grievance
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card border-border-hover bg-surface/95 backdrop-blur-3xl text-text-primary max-w-md rounded-3xl p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black tracking-tighter">Lodge Grievance</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={onComplaintSubmit} className="space-y-6 mt-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Category</label>
                                        <select
                                            value={complaintCategory}
                                            onChange={(e) => setComplaintCategory(e.target.value)}
                                            className="w-full h-12 bg-surface border border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="ACADEMIC" className="bg-surface">Academic Issues</option>
                                            <option value="INFRASTRUCTURE" className="bg-surface">Campus Infrastructure</option>
                                            <option value="RAGGING" className="bg-surface">Ragging / Bullying</option>
                                            <option value="HARASSMENT" className="bg-surface">Harassment</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Subject</label>
                                        <Input value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} placeholder="Brief title of your grievance..." className="h-12 bg-surface border-border rounded-xl focus:ring-rose-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Detailed Description</label>
                                        <Textarea value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} placeholder="Please explain the issue in detail..." className="bg-surface border-border rounded-xl min-h-[120px] focus:ring-rose-500 shadow-inner" />
                                    </div>
                                    <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-text-primary font-black py-4 rounded-xl shadow-[0_10px_30px_rgba(244,63,94,0.2)] flex items-center justify-center gap-2">
                                        <LuSend className="w-4 h-4" /> Lodge Complaint
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <TabsContent value="services" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="glass-card border-border overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-surface">
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Request ID</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Type</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Date Raised</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-3 text-text-muted">
                                                    <LuFileSearch className="w-8 h-8 opacity-20" />
                                                    <p className="italic text-sm">No official requests found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        serviceRequests.map((req) => (
                                            <tr key={req.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                                                <td className="p-4 font-mono text-xs text-text-muted">{req.id.split('-')[0]}</td>
                                                <td className="p-4">
                                                    <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                                                        <LuFileText className="w-4 h-4 text-primary opacity-60" />
                                                        {req.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-text-secondary">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4"><StatusPill status={req.status} /></td>
                                                <td className="p-4 text-right">
                                                    {(req.status === 'APPROVED' || req.status === 'COMPLETED') ? (
                                                        <Button
                                                            onClick={() => handleViewDocument(req.id)}
                                                            className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-[9px] font-black uppercase tracking-widest gap-1 border-none"
                                                        >
                                                            <LuFileSearch className="w-3 h-3" /> View Doc
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
                                                            <LuFileSearch className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="complaints" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="glass-card border-border overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-surface">
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Case ID</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Category</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Subject</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                                        <th className="p-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-3 text-text-muted">
                                                    <LuMessageSquare className="w-8 h-8 opacity-20" />
                                                    <p className="italic text-sm">No grievances recorded.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        complaints.map((comp) => (
                                            <tr key={comp.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                                                <td className="p-4 font-mono text-xs text-text-muted">{comp.id.split('-')[0]}</td>
                                                <td className="p-4 text-xs font-black uppercase text-rose-500">{comp.category}</td>
                                                <td className="p-4">
                                                    <p className="text-sm font-bold text-text-primary">{comp.subject}</p>
                                                </td>
                                                <td className="p-4 text-sm text-text-secondary">{new Date(comp.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4"><StatusPill status={comp.status} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
