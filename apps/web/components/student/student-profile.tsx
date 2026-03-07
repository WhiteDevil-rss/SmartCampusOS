'use client';

import { LuUser, LuMail, LuPhone, LuMapPin, LuGraduationCap, LuHash, LuAward, LuPencil, LuCalendar, LuShieldCheck, LuExternalLink, LuCopy, LuDownload, LuFileCheck, LuCheck } from 'react-icons/lu';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentProfile() {
    const { user } = useAuthStore();
    const [docs, setDocs] = useState<any>(null);
    const [loadingDocs, setLoadingDocs] = useState(true);

    useEffect(() => {
        fetchVerifiedDocs();
    }, []);

    const fetchVerifiedDocs = async () => {
        try {
            const res = await api.get('/student/docs/vault');
            setDocs(res.data);
        } catch (error) {
            console.error('Failed to fetch docs', error);
        } finally {
            setLoadingDocs(false);
        }
    };

    // Mock student data for demonstration
    const studentInfo = {
        fullName: user?.username || 'John Doe',
        email: user?.email || 'john.doe@university.edu',
        enrollmentNo: 'EN-2023-00124',
        phone: '+91 98765 43210',
        program: 'B.Tech Computer Science & Engineering',
        batch: '2023-2027',
        semester: 4,
        address: '123 University Campus, Academic Block, City, State - 400001',
        photoUrl: null,
        academicStats: {
            cgpa: 8.75,
            backlogs: 0,
            creditsEarned: 72,
            totalCredits: 160
        }
    };

    const details = [
        { label: 'Enrollment No', value: studentInfo.enrollmentNo, icon: <LuHash /> },
        { label: 'Program', value: studentInfo.program, icon: <LuGraduationCap /> },
        { label: 'Batch', value: studentInfo.batch, icon: <LuCalendar /> },
        { label: 'Academic Standing', value: `CGPA ${studentInfo.academicStats.cgpa}`, icon: <LuAward /> },
        { label: 'Email', value: studentInfo.email, icon: <LuMail /> },
        { label: 'Phone', value: studentInfo.phone, icon: <LuPhone /> },
        { label: 'Address', value: studentInfo.address, icon: <LuMapPin /> },
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-12">
            {/* Header / Profile Hero */}
            <div className="p-8 md:p-12 glass-morphism rounded-[40px] border border-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000" />

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="relative group/avatar">
                        <div className="w-40 h-40 rounded-[32px] bg-black/40 border border-primary/20 flex items-center justify-center text-5xl font-bold font-space-grotesk text-primary shadow-glow overflow-hidden transition-transform group-hover/avatar:scale-105 duration-500">
                            {studentInfo.fullName.charAt(0).toUpperCase()}
                        </div>
                        <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 rounded-xl shadow-lg bg-[#020617] border border-border-hover hover:bg-surface-hover hover:border-border-hover transition-all text-slate-300">
                            <LuPencil className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                            <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk text-text-primary tracking-tight">{studentInfo.fullName}</h2>
                            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest self-center md:self-auto">
                                Active Node
                            </span>
                        </div>
                        <p className="text-lg text-text-muted max-w-2xl">
                            {studentInfo.program} <span className="mx-2 text-slate-600">•</span> Semester {studentInfo.semester}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                            <Button className="glow-button bg-primary text-text-primary rounded-[16px] px-8 font-bold h-12">
                                Download Protocol ID
                            </Button>
                            <Button variant="outline" className="border-border-hover hover:bg-surface-hover hover:border-border-hover hover:text-text-primary rounded-[16px] px-8 font-bold h-12 text-text-muted transition-all">
                                Generate Bonafide
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="info" className="w-full">
                <TabsList className="glass-morphism border border-border p-1.5 rounded-[20px] mb-12 inline-flex h-auto gap-2">
                    <TabsTrigger value="info" className="rounded-[14px] px-8 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-text-primary text-text-muted transition-all">Identity Details</TabsTrigger>
                    <TabsTrigger value="vault" className="rounded-[14px] px-8 py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-text-primary text-text-muted transition-all flex items-center gap-2">
                        <LuShieldCheck className="w-4 h-4" />
                        Trustless Vault
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Personal Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <h3 className="text-2xl font-bold font-space-grotesk text-text-primary tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <LuUser className="text-primary w-5 h-5" />
                                </div>
                                Identity Records
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {details.map((detail, i) => (
                                    <div key={i} className="p-6 rounded-[24px] bg-surface border border-border group hover:border-primary/20 transition-all duration-300">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3.5 rounded-[16px] bg-surface text-text-muted group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 transition-all">
                                                {detail.icon}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-1">{detail.label}</p>
                                                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{detail.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Academic Summary */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold font-space-grotesk text-text-primary tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <LuAward className="text-emerald-400 w-5 h-5" />
                                </div>
                                Telemetry
                            </h3>
                            <div className="p-8 glass-morphism rounded-[32px] border border-emerald-500/20 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                                <div className="space-y-10 relative z-10">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-3">Protocol Standing</p>
                                        <p className="text-7xl font-bold font-space-grotesk text-text-primary tracking-tighter tabular-nums drop-shadow-lg">{studentInfo.academicStats.cgpa}</p>
                                        <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-widest uppercase">
                                            Top 5% of Cluster
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold mb-3">
                                                <span className="text-text-muted">Credits</span>
                                                <span className="text-text-primary">{studentInfo.academicStats.creditsEarned} <span className="text-slate-600">/ {studentInfo.academicStats.totalCredits}</span></span>
                                            </div>
                                            <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-primary shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                                    style={{ width: `${(studentInfo.academicStats.creditsEarned / studentInfo.academicStats.totalCredits) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 grid grid-cols-2 gap-4">
                                            <div className="text-center p-4 rounded-[20px] bg-black/40 border border-border relative overflow-hidden">
                                                <div className="absolute inset-x-0 top-0 h-0.5 bg-rose-500/50" />
                                                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">Anomalies</p>
                                                <p className="text-2xl font-bold font-space-grotesk text-text-primary">{studentInfo.academicStats.backlogs}</p>
                                            </div>
                                            <div className="text-center p-4 rounded-[20px] bg-black/40 border border-border relative overflow-hidden">
                                                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/50" />
                                                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">Rank</p>
                                                <p className="text-2xl font-bold font-space-grotesk text-text-primary text-primary">12th</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="vault" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-10">
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full" />
                            <div className="w-24 h-24 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                <LuShieldCheck className="w-10 h-10" />
                            </div>
                            <div className="flex-1 text-center md:text-left relative z-10">
                                <h3 className="text-3xl font-bold font-space-grotesk text-text-primary tracking-tight mb-3">Trustless Verification</h3>
                                <p className="text-emerald-500/70 text-lg max-w-2xl leading-relaxed">
                                    All academic records issued through SmartCampus OS are cryptographically hashed and anchored on the <span className="text-emerald-400">Polygon L2</span> for immutable, instant verification.
                                </p>
                            </div>
                            {docs?.identity && (
                                <div className="p-5 rounded-[20px] bg-black/40 border border-emerald-500/20 relative z-10 text-center md:text-left">
                                    <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em] mb-2">Protocol Identity</p>
                                    <code className="text-xs text-emerald-400 font-bold block bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">{docs.identity.blockchainId}</code>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {loadingDocs ? (
                                [1, 2].map(i => <Skeleton key={i} className="h-56 bg-surface rounded-[32px]" />)
                            ) : docs?.results.length > 0 ? (
                                docs.results.map((res: any, i: number) => (
                                    <div key={i} className="p-8 glass-morphism rounded-[32px] border border-border hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 pointer-events-none">
                                            <LuFileCheck className="w-12 h-12 text-emerald-500/10 group-hover:text-emerald-500/30 transition-colors duration-500 transform group-hover:scale-110" />
                                        </div>
                                        <div className="mb-8 relative z-10">
                                            <h4 className="text-2xl font-bold font-space-grotesk text-text-primary mb-2">Semester {res.semester} Ledger</h4>
                                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-[0.2em]">{res.program.name}</p>
                                        </div>
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className="text-center p-4 px-8 rounded-[20px] bg-black/40 border border-border">
                                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">SGPA</p>
                                                <p className="text-3xl font-bold font-space-grotesk text-text-primary">{res.sgpa.toFixed(2)}</p>
                                            </div>
                                            <div className="flex-1 px-8 text-center flex justify-end">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                                    <LuCheck className="w-3.5 h-3.5" /> Immutable
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                                            <div className="flex items-center gap-2 text-[11px] text-text-secondary font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-border">
                                                Tx: {res.blockchainTxHash.substring(0, 16)}...
                                            </div>
                                            <div className="flex gap-3">
                                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-surface hover:bg-surface-hover text-slate-300 transition-colors">
                                                    <LuCopy className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" className="h-10 px-5 gap-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary font-bold transition-colors">
                                                    <LuExternalLink className="w-4 h-4" /> Validate
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="md:col-span-2 p-24 text-center glass-morphism rounded-[32px] border-dashed border-border-hover">
                                    <div className="w-20 h-20 rounded-[24px] bg-surface flex items-center justify-center mx-auto mb-6">
                                        <LuShieldCheck className="w-10 h-10 text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold font-space-grotesk text-text-primary mb-2">Vault Empty</h3>
                                    <p className="text-text-secondary font-medium">No trustless documents instantiated for this node.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

