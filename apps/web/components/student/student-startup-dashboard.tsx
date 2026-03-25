'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LuRocket, LuUsers, LuTrendingUp, LuShield, LuMilestone, LuCircleCheck, LuPlus } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

export function StudentStartupDashboard() {
    const [startups, setStartups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        setStartups([
            { 
                id: 'st-1', 
                name: 'EcoTrack Solutions', 
                role: 'Founder', 
                equity: '40%', 
                milestones: [
                    { title: 'MVP Launch', status: 'COMPLETED' },
                    { title: 'Beta Testing (100 Users)', status: 'IN_PROGRESS' },
                    { title: 'Seed Funding Round', status: 'LOCKED' }
                ]
            }
        ]);
    }, []);

    if (loading) return <Skeleton className="h-[400px] w-full rounded-3xl" />;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {startups.map((s) => (
                    <Card key={s.id} className="p-8 glass-card border-border relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <LuRocket className="w-8 h-8" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">Vesting Active</span>
                            </div>
                            <div>
                                <h4 className="text-3xl font-black text-text-primary tracking-tight">{s.name}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm font-bold text-text-secondary flex items-center gap-1.5"><LuUsers className="w-4 h-4" /> {s.role}</span>
                                    <span className="text-sm font-black text-primary flex items-center gap-1.5"><LuShield className="w-4 h-4" /> {s.equity} Equity Locked</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">On-Chain Milestones</p>
                                {s.milestones.map((m: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-surface/30 border border-border/50">
                                        <div className="flex items-center gap-3">
                                            {m.status === 'COMPLETED' ? <LuCircleCheck className="w-5 h-5 text-emerald-500" /> : <LuMilestone className="w-5 h-5 text-text-muted" />}
                                            <p className={cn("text-sm font-bold", m.status === 'COMPLETED' ? "text-text-primary" : "text-text-secondary")}>{m.title}</p>
                                        </div>
                                        <span className={cn("text-[8px] font-black px-2 py-0.5 rounded-md", m.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" : "bg-surface text-text-muted")}>{m.status}</span>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full bg-primary hover:bg-primary/90 text-text-primary font-black py-4 rounded-xl shadow-[0_10px_30px_rgba(var(--primary-rgb),0.2)]">
                                Submit Milestone Proof
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24" />
                    </Card>
                ))}

                <Card className="p-8 border-dashed border-2 border-border bg-surface/20 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 transition-all cursor-pointer group">
                    <div className="p-4 rounded-3xl bg-surface text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <LuPlus className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-text-primary">Register Startup</h4>
                        <p className="text-sm text-text-muted max-w-xs mt-1">Initialize on-chain equity distribution with your co-founders.</p>
                    </div>
                </Card>
            </div>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
