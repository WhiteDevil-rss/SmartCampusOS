'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    LuLoader, 
    LuMessageSquare, 
    LuMail, 
    LuPhone, 
    LuSearch,
    LuCheck,
    LuUserPlus,
    LuArrowRight,
    LuCalendar,
    LuInfo,
    LuHistory,
    LuGlobe
} from 'react-icons/lu';
import { useToast } from '@/components/ui/toast-alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function DeptInquiriesPage() {
    const { user } = useAuthStore();
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const { showToast } = useToast();
    
    // UI States
    const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
    const [replyMode, setReplyMode] = useState(false);
    const [convertMode, setConvertMode] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [programId, setProgramId] = useState('');

    const fetchInquiries = useCallback(async () => {
        if (!user?.entityId) return;
        try {
            setLoading(true);
            const statusType = activeStatus ? `&status=${activeStatus}` : '';
            const searchQuery = search ? `&search=${search}` : '';
            const res = await api.get(`/v2/admission-inquiries/department/${user.entityId}?page=1&limit=20${statusType}${searchQuery}`);
            setInquiries(res.data.inquiries);
        } catch (error) {
            console.error('Failed to fetch department inquiries:', error);
            showToast('error', 'Failed to load admission inquiries.');
        } finally {
            setLoading(false);
        }
    }, [user, activeStatus, search, showToast]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const handleReply = async () => {
        if (!selectedInquiry || !replyText) return;
        try {
            await api.patch(`/v2/admission-inquiries/${selectedInquiry.id}/reply`, { replyMessage: replyText });
            showToast('success', 'Reply recorded and status updated.');
            setReplyMode(false);
            setReplyText('');
            fetchInquiries();
        } catch (error) {
            showToast('error', 'Failed to save reply.');
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await api.patch(`/v2/admission-inquiries/${id}/resolve`);
            showToast('success', 'Inquiry marked as resolved.');
            fetchInquiries();
        } catch (error) {
            showToast('error', 'Failed to resolve inquiry.');
        }
    };

    const handleConvert = async () => {
        if (!selectedInquiry || !programId) return;
        try {
            await api.post(`/v2/admission-inquiries/${selectedInquiry.id}/convert`, { programId });
            showToast('success', 'Inquiry converted to a formal application!');
            setConvertMode(false);
            fetchInquiries();
        } catch (error) {
            showToast('error', 'Failed to convert inquiry.');
        }
    };

    const statusFilters = [
        { label: 'All', value: null },
        { label: 'New', value: 'NEW' },
        { label: 'Responded', value: 'RESPONDED' },
        { label: 'Resolved', value: 'RESOLVED' },
        { label: 'Converted', value: 'CONVERTED' },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            NEW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            RESPONDED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            RESOLVED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
            CONVERTED: 'bg-primary/10 text-primary border-primary/20',
        };
        return <Badge className={`${styles[status] || 'bg-slate-500/10 text-slate-500'} border`}>{status}</Badge>;
    };

    return (
        <DashboardLayout navItems={[]} title="Admission Inquiries">
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold font-space-grotesk text-white">Prospective Inquiries</h2>
                        <p className="text-text-secondary mt-1">Engage with interested students and convert leads to applications.</p>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                            {statusFilters.map((f) => (
                                <Button
                                    key={f.label}
                                    variant={activeStatus === f.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveStatus(f.value)}
                                    className={activeStatus === f.value ? 'bg-primary border-primary' : 'bg-surface border-border text-text-secondary'}
                                >
                                    {f.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="w-full lg:w-96 flex flex-col gap-3">
                        <div className="relative group">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search leads by name or email..." 
                                className="pl-10 bg-surface/50 border-border focus:border-primary transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary"><LuMessageSquare className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Unresolved</p>
                                <p className="text-2xl font-bold text-white">{inquiries.filter(i => i.status === 'NEW' || i.status === 'RESPONDED').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><LuUserPlus className="w-6 h-6" /></div>
                            <div>
                                <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Converted</p>
                                <p className="text-2xl font-bold text-white">{inquiries.filter(i => i.status === 'CONVERTED').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/10 border-border">
                        <CardContent className="p-6 flex items-center gap-4 text-text-secondary">
                            <LuInfo className="w-6 h-6" />
                            <p className="text-xs">
                                Inquiries are department-private. University admins cannot see these conversations to ensure department autonomy in lead nurturing.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* List View */}
                {loading ? (
                    <div className="flex h-96 items-center justify-center">
                        <LuLoader className="w-12 h-12 text-primary animate-spin" />
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 glass-morphism rounded-3xl border border-border">
                        <LuMessageSquare className="w-16 h-16 text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-white">No inquiries found</h3>
                        <p className="text-text-secondary text-sm">Your department mailbox is currently empty.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {inquiries.map((inq) => (
                            <Card key={inq.id} className="bg-surface/50 border-border hover:border-primary/30 transition-all group overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-stretch">
                                        <div className="p-6 flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {inq.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{inq.name}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                            <LuMail className="w-3 h-3" /> {inq.email}
                                                            <span className="mx-1">•</span>
                                                            <LuCalendar className="w-3 h-3" /> {new Date(inq.submittedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                {getStatusBadge(inq.status)}
                                            </div>
                                            
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm text-text-secondary leading-relaxed">
                                                <p className="line-clamp-2 italic">&ldquo;{inq.message}&rdquo;</p>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                                                <div className="flex items-center gap-1"><LuGlobe className="w-3 h-3" /> {inq.country || 'Unknown Location'}</div>
                                                <div className="flex items-center gap-1"><LuPhone className="w-3 h-3" /> {inq.phone || 'No phone'}</div>
                                                <div className="flex items-center gap-1 font-mono text-primary/70">{inq.inquiryId}</div>
                                            </div>
                                        </div>

                                        <div className="p-4 md:w-64 bg-white/5 border-l border-border/30 flex flex-col justify-center gap-2">
                                            {inq.status !== 'CONVERTED' && inq.status !== 'RESOLVED' ? (
                                                <>
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full bg-primary hover:bg-primary/90 text-white"
                                                        onClick={() => {
                                                            setSelectedInquiry(inq);
                                                            setReplyMode(true);
                                                        }}
                                                    >
                                                        Reply & Track
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="w-full border-border text-white hover:bg-white/5"
                                                        onClick={() => {
                                                            setSelectedInquiry(inq);
                                                            setConvertMode(true);
                                                        }}
                                                    >
                                                        <LuArrowRight className="w-3 h-3 mr-1" /> To Application
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="w-full text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10"
                                                        onClick={() => handleResolve(inq.id)}
                                                    >
                                                        <LuCheck className="w-3 h-3 mr-1" /> Resolve
                                                    </Button>
                                                </>
                                            ) : inq.status === 'CONVERTED' ? (
                                                <div className="flex flex-col items-center gap-1 py-4 text-primary font-bold text-xs uppercase tracking-widest text-center">
                                                    <LuHistory className="w-5 h-5 mb-1" />
                                                    Processed
                                                </div>
                                            ) : (
                                                <div className="text-center text-text-secondary text-xs italic py-4">
                                                    Inquiry Resolved
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Reply Dialog */}
            <Dialog open={replyMode} onOpenChange={setReplyMode}>
                <DialogContent className="bg-surface border-border text-white">
                    <DialogHeader>
                        <DialogTitle>Reply to {selectedInquiry?.name}</DialogTitle>
                        <DialogDescription className="text-text-secondary italic">
                            Recording a response will notify the student and update the inquiry status.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea 
                            placeholder="Enter your response message..." 
                            className="bg-surface border-border min-h-[150px]"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyMode(false)}>Cancel</Button>
                        <Button onClick={handleReply}>Submit Response</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Convert Dialog */}
            <Dialog open={convertMode} onOpenChange={setConvertMode}>
                <DialogContent className="bg-surface border-border text-white">
                    <DialogHeader>
                        <DialogTitle>Convert to Formal Application</DialogTitle>
                        <DialogDescription className="text-text-secondary">
                            This will create a new admission application record using the student&apos;s inquiry details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-primary uppercase mb-1 block">Course Selection</label>
                            <Input 
                                placeholder="Target Program/Course ID" 
                                className="bg-surface border-border"
                                value={programId}
                                onChange={(e) => setProgramId(e.target.value)}
                            />
                            <p className="text-[10px] text-text-secondary mt-1">Select the course the student is applying for.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertMode(false)}>Cancel</Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConvert}>
                            Confirm Conversion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
