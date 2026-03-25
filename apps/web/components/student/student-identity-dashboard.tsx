'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LuShield, LuClock, LuUserCheck, LuLock, LuGamepad2, LuQrCode, LuInfo, LuCircleCheck } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

export function StudentIdentityDashboard() {
    const [kycStatus, setKycStatus] = useState<'NONE' | 'PENDING' | 'VERIFIED'>('VERIFIED');
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const activePermissions = [
        { resource: 'High-Performance Computing Lab', expiry: '2026-04-15', status: 'ACTIVE' },
        { resource: 'Premium Research Database', expiry: '2026-03-30', status: 'ACTIVE' },
    ];

    if (loading) {
        return <Skeleton className="h-[400px] w-full rounded-3xl" />;
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* KYC & Identity */}
                <Card className="p-8 glass-card border-border relative overflow-hidden group">
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <LuUserCheck className="w-8 h-8" />
                            </div>
                            {kycStatus === 'VERIFIED' ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Verified Identity</span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Action Required</span>
                            )}
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-text-primary tracking-tight">On-Chain Identity</h4>
                            <p className="text-text-secondary text-sm mt-1 font-medium italic opacity-70">Your decentralized ID is synced with your campus profile.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-surface/50 border border-border flex items-center gap-4">
                            <LuQrCode className="w-10 h-10 text-text-primary opacity-50" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">KYC Blockchain Hash</p>
                                <p className="text-xs font-mono text-text-primary break-all">0x71C7656...459e</p>
                            </div>
                        </div>
                        <Button className="w-full bg-surface border border-border hover:bg-primary/10 text-text-primary font-bold py-4 rounded-xl transition-all">
                           Manage Privacy Permissions
                        </Button>
                    </div>
                </Card>

                {/* Access Control */}
                <Card className="p-8 glass-card border-border">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <LuLock className="w-8 h-8" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Active Permissions</span>
                        </div>
                        <h4 className="text-2xl font-black text-text-primary tracking-tight">Resource Access</h4>
                        <div className="space-y-4">
                            {activePermissions.map((perm, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-surface/30 border border-border/50 group-hover:border-primary/30 transition-all">
                                    <div>
                                        <p className="text-sm font-bold text-text-primary">{perm.resource}</p>
                                        <p className="text-[10px] text-text-muted mt-0.5">Expires on: {perm.expiry}</p>
                                    </div>
                                    <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase">Active</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest">
                            <LuShield className="w-4 h-4" />
                            Time-based Access Control Secured
                        </div>
                    </div>
                </Card>
            </div>

            {/* Gaming Tournaments */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <LuGamepad2 className="text-primary" />
                    Gaming & E-Sports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card className="p-6 bg-surface/50 border border-border hover:border-primary/30 transition-all relative group overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Valorant Open</span>
                                 <span className="text-[10px] font-bold text-emerald-500">🏆 1.5 ETH Pool</span>
                            </div>
                            <h4 className="text-lg font-bold text-text-primary">Annual Campus Shootout</h4>
                            <p className="text-xs text-text-secondary leading-relaxed font-medium">Entry Fee: 0.005 ETH. Automated prize distribution upon victory verification.</p>
                            <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold h-10 rounded-lg text-xs transition-all">
                                Join Tournament
                            </Button>
                        </div>
                   </Card>
                </div>
            </div>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
