'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LuBriefcase, LuBuilding2, LuGraduationCap, LuAward, LuGlobe, LuExternalLink, LuMapPin, LuCalendarRange } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface Company {
    id: string;
    name: string;
    type: string;
    website: string | null;
}

interface PlacementRecord {
    id: string;
    ctc: number;
    role: string;
    placedAt: string;
    company: Company;
}

export function StudentPlacementDashboard() {
    const [placement, setPlacement] = useState<PlacementRecord | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        const fetchPlacement = async () => {
            try {
                const res = await api.get('/v2/student/assets/placement');
                setPlacement(res.data.placementRecord || null);
                setCompanies(res.data.visitingCompanies || []);
            } catch (error) {
                console.error('Failed to load placement data:', error);
                showToast('error', 'Failed to load placement details');
            } finally {
                setLoading(false);
            }
        };
        fetchPlacement();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <Skeleton className="h-64 rounded-3xl bg-surface" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl bg-surface" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Status Hero */}
            <Card className="relative overflow-hidden border-border glass-card">
                {/* Dynamic Background */}
                <div className={cn(
                    "absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
                    placement ? "from-emerald-500 via-emerald-900/20 to-transparent" : "from-blue-500 via-blue-900/20 to-transparent"
                )} />

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className={cn(
                        "w-32 h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center shrink-0 border-4 shadow-2xl relative",
                        placement ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20" : "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/20"
                    )}>
                        {placement ? <LuAward className="w-16 h-16 md:w-20 md:h-20" /> : <LuGraduationCap className="w-16 h-16 md:w-20 md:h-20" />}
                        <div className={cn(
                            "absolute -bottom-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-lg whitespace-nowrap",
                            placement ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        )}>
                            {placement ? 'Placed' : 'Eligible for Placement'}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        {placement ? (
                            <>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight mb-2">Congratulations!</h2>
                                    <p className="text-emerald-400/80 font-medium text-lg">You have secured your career start.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-surface rounded-2xl p-4 border border-border">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-text-muted mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                                            <LuBuilding2 className="w-3.5 h-3.5" /> Company
                                        </p>
                                        <p className="font-bold text-text-primary text-lg">{placement.company.name}</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-4 border border-border">
                                        <p className="text-[10px] font-black tracking-widest uppercase text-text-muted mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                                            <LuBriefcase className="w-3.5 h-3.5" /> Role
                                        </p>
                                        <p className="font-bold text-text-primary text-lg">{placement.role}</p>
                                    </div>
                                    <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 col-span-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black tracking-widest uppercase text-emerald-500 mb-1">Package (CTC)</p>
                                            <span className="text-xs font-bold text-emerald-400/60">{new Date(placement.placedAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-black text-emerald-400 text-3xl">₹{placement.ctc.toLocaleString()} <span className="text-sm font-medium text-emerald-500/60">LPA</span></p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight mb-2">Drive Ahead.</h2>
                                    <p className="text-blue-400/80 font-medium text-lg">Your placement season is active. Keep preparing!</p>
                                </div>
                                <Card className="bg-blue-500/5 border border-blue-500/20 p-6 mt-6 max-w-lg mx-auto md:mx-0">
                                    <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                                        <LuCalendarRange className="text-blue-400" />
                                        Next Steps
                                    </h3>
                                    <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
                                        <li>Update your digital resume in the profile tab.</li>
                                        <li>Review the upcoming company list below.</li>
                                        <li>Attend pre-placement talks and mock interviews.</li>
                                    </ul>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Upcoming Companies */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <LuBuilding2 className="text-indigo-400" />
                    Visiting Companies
                </h3>

                {companies.length === 0 ? (
                    <Card className="p-10 border-border bg-surface/50 text-center flex flex-col items-center justify-center space-y-3">
                        <LuBuilding2 className="w-10 h-10 text-text-muted" />
                        <p className="text-sm text-text-muted font-medium">No visiting companies announced yet.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company) => (
                            <Card key={company.id} className="p-6 glass-card border-border hover:border-indigo-400/30 transition-all group flex flex-col h-full">
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                            <LuBuilding2 className="w-6 h-6" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-surface text-text-secondary">
                                            {company.type}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary mb-1 group-hover:text-indigo-300 transition-colors">{company.name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                            <LuMapPin className="w-3.5 h-3.5" />
                                            <span>Campus Drive</span>
                                        </div>
                                    </div>
                                </div>

                                {company.website && (
                                    <div className="pt-5 mt-5 border-t border-border">
                                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors w-fit">
                                            <LuGlobe className="w-3.5 h-3.5" />
                                            Visit Website
                                            <LuExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
