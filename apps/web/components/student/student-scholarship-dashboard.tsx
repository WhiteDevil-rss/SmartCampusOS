'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LuGraduationCap, LuCircleCheck, LuClock, LuTrendingUp, LuDollarSign, LuShield, LuInfo } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

export function StudentScholarshipDashboard() {
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        setScholarships([
            { id: 's-1', name: 'Merit-Cum-Means Scholarship 2026', amount: '0.5 ETH', status: 'RECEIVED', date: '2026-03-10' },
            { id: 's-2', name: 'STEM Excellence Grant', amount: '0.3 ETH', status: 'PENDING', date: '---' },
        ]);
    }, []);

    if (loading) return <Skeleton className="h-[400px] w-full rounded-3xl" />;

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 glass-card border-border bg-emerald-500/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                             <LuDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Received</p>
                            <p className="text-3xl font-black text-text-primary underline decoration-emerald-500/30">0.5 ETH</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                 <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <LuGraduationCap className="text-primary" />
                    Scholarship Programs
                </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scholarships.map((s) => (
                        <Card key={s.id} className="p-8 glass-card border-border hover:border-emerald-500/30 transition-all relative group overflow-hidden">
                             <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md", s.status === 'RECEIVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>
                                        {s.status}
                                    </span>
                                    {s.status === 'RECEIVED' && <LuShield className="w-4 h-4 text-emerald-500" title="On-Chain Verified" />}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-text-primary tracking-tight">{s.name}</h4>
                                    <p className="text-sm text-text-secondary mt-1 font-medium italic opacity-70">Amount: <span className="text-text-primary font-bold">{s.amount}</span></p>
                                </div>
                                
                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Release Date</span>
                                        <span className="text-sm font-medium text-text-primary">{s.date}</span>
                                    </div>
                                    <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs font-bold text-primary hover:bg-primary/10">
                                        View Details
                                    </Button>
                                </div>
                             </div>
                             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                        </Card>
                    ))}
               </div>
            </div>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
