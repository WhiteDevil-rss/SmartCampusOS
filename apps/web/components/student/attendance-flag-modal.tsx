'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LuPlus, LuFileText, LuClock, LuCircleCheck, LuCircleX } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface FlagRequest {
    id: string;
    flagType: string;
    startDate: string;
    endDate: string;
    status: string;
    appliedAt: string;
}

export function AttendanceFlagModal() {
    const [open, setOpen] = useState(false);
    const [flags, setFlags] = useState<FlagRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    // Form states
    const [type, setType] = useState('MEDICAL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const fetchFlags = async () => {
        try {
            const res = await api.get('/v2/student/attendance/flags');
            setFlags(res.data);
        } catch (error) {
            console.error('Failed to load flags:', error);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !reason) {
            showToast('error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/v2/student/attendance/flags', {
                flagType: type,
                startDate,
                endDate,
                reason
            });
            showToast('success', 'Exemption request submitted successfully');
            setOpen(false);
            fetchFlags();
            // Reset form
            setReason('');
            setStartDate('');
            setEndDate('');
        } catch (error) {
            showToast('error', 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-2">
                    <LuPlus className="w-4 h-4" />
                    Request Exemption
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border-hover text-text-primary">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">Attendance Exemption</DialogTitle>
                    <DialogDescription className="text-text-muted">
                        Apply for medical leave, hackathons, or official sports events.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary">Exemption Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-surface border border-border-hover rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="MEDICAL">Medical Leave</option>
                            <option value="HACKATHON">Hackathon / Competition</option>
                            <option value="SPORTS_DAY">Official Sports Event</option>
                            <option value="OFFICIAL_EVENT">Other Official Event</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary">Start Date</label>
                            <Input
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-surface border-border-hover"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary">End Date</label>
                            <Input
                                type="date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-surface border-border-hover"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary">Reason</label>
                        <Textarea
                            required
                            placeholder="Briefly explain your absence..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="bg-surface border-border-hover resize-none"
                            rows={3}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-text-primary font-bold py-6 rounded-xl mt-2"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </form>

                <div className="mt-8">
                    <h4 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-4">Past Requests</h4>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {flags.length === 0 ? (
                            <p className="text-xs text-text-muted italic">No exemption requests found.</p>
                        ) : (
                            flags.map(flag => (
                                <div key={flag.id} className="flex flex-col gap-2 p-3 rounded-xl bg-surface/50 border border-border">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                                            <LuFileText className="w-4 h-4 text-primary" />
                                            {flag.flagType.replace('_', ' ')}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1",
                                            flag.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" :
                                                flag.status === 'REJECTED' ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {flag.status === 'APPROVED' ? <LuCircleCheck className="w-3 h-3" /> :
                                                flag.status === 'REJECTED' ? <LuCircleX className="w-3 h-3" /> : <LuClock className="w-3 h-3" />}
                                            {flag.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-text-muted">
                                        <span>
                                            {new Date(flag.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} -
                                            {new Date(flag.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
            <Toast toast={toast} onClose={hideToast} />
        </Dialog>
    );
}
