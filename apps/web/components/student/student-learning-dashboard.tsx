'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LuPlay, LuLock, LuBookOpen, LuClock, LuShield, LuWallet, LuMonitor } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

export function StudentLearningDashboard() {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        setModules([
            { id: 'm-1', title: 'Advanced Smart Contract Security', duration: '4h 30m', price: '0.02 ETH', isUnlocked: true },
            { id: 'm-2', title: 'Sustainable AI Architectures', duration: '6h 15m', price: '0.05 ETH', isUnlocked: false },
            { id: 'm-3', title: 'Quantum Computing Fundamentals', duration: '12h 00m', price: '0.1 ETH', isUnlocked: false },
        ]);
    }, []);

    const handlePurchase = async (moduleId: string, price: string) => {
        try {
            await api.post('/v2/blockchain/learning/modules/purchase', { moduleId, amount: price.replace(' ETH', '') });
            showToast('success', 'Module unlocked on-chain! You now have lifetime access.');
            setModules(modules.map(m => m.id === moduleId ? { ...m, isUnlocked: true } : m));
        } catch (error) {
            showToast('error', 'Purchase failed. Ensure your wallet has sufficient funds.');
        }
    };

    if (loading) return <Skeleton className="h-[400px] w-full rounded-3xl" />;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map((m) => (
                    <Card key={m.id} className={cn("p-8 glass-card border-border transition-all relative group overflow-hidden", m.isUnlocked ? "hover:border-primary/50" : "hover:border-amber-500/30")}>
                         <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className={cn("p-3 rounded-2xl", m.isUnlocked ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-500")}>
                                    {m.isUnlocked ? <LuMonitor className="w-8 h-8" /> : <LuLock className="w-8 h-8" />}
                                </div>
                                {m.isUnlocked && <LuShield className="w-5 h-5 text-emerald-500" title="Lifetime Blockchain Access" />}
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-text-primary tracking-tight leading-snug">{m.title}</h4>
                                <div className="flex items-center gap-4 mt-3 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                                    <span className="flex items-center gap-1"><LuClock className="w-3.5 h-3.5" /> {m.duration}</span>
                                    <span className="flex items-center gap-1"><LuBookOpen className="w-3.5 h-3.5" /> Video + Labs</span>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                                {m.isUnlocked ? (
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-text-primary font-black uppercase tracking-widest text-[10px] h-12 rounded-xl flex items-center justify-center gap-2">
                                        <LuPlay className="w-5 h-5" /> Resume Learning
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => handlePurchase(m.id, m.price)}
                                        className="w-full bg-surface border border-border hover:bg-amber-500/10 hover:border-amber-500/50 text-text-primary font-black uppercase tracking-widest text-[10px] h-12 rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <LuWallet className="w-4 h-4" /> Unlock for {m.price}
                                    </Button>
                                )}
                            </div>
                         </div>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    </Card>
                ))}
            </div>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
