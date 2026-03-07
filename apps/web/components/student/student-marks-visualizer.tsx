'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LuLayoutDashboard, LuAward, LuCheck, LuBookOpen, LuChevronRight } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface SubjectResult {
    id: string;
    internalMarks: number;
    midTermMarks: number;
    externalMarks: number;
    totalMarks: number;
    grade: string;
    creditsEarned: number;
    course: {
        name: string;
        code: string;
        credits: number;
    }
}

interface SemesterResult {
    id: string;
    semester: number;
    academicYear: string;
    sgpa: number;
    cgpa: number;
    status: string;
    subjectResults: SubjectResult[];
}

export function StudentMarksVisualizer() {
    const [results, setResults] = useState<SemesterResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSem, setActiveSem] = useState<number | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get('/v2/student/results');
                setResults(res.data);
                if (res.data.length > 0) {
                    setActiveSem(res.data[res.data.length - 1].semester);
                }
            } catch (error) {
                console.error('Failed to load results:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl bg-surface" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-3xl bg-surface" />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <Card className="p-8 border-border bg-surface text-center">
                <p className="text-text-muted font-bold">No academic results published yet.</p>
            </Card>
        );
    }

    const latestResult = results[results.length - 1];
    const activeResult = results.find(r => r.semester === activeSem) || latestResult;

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 glass-card border-primary/20 bg-primary/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <LuLayoutDashboard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Current SGPA</p>
                            <p className="text-3xl font-black text-text-primary">{latestResult.sgpa.toFixed(2)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-card border-emerald-500/20 bg-emerald-500/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <LuAward className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Overall CGPA</p>
                            <p className="text-3xl font-black text-text-primary">{latestResult.cgpa.toFixed(2)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 glass-card border-amber-500/20 bg-amber-500/5 hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                            <LuCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status</p>
                            <p className="text-3xl font-black text-text-primary">{latestResult.status}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Semester Navigator */}
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
                {results.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => setActiveSem(r.semester)}
                        className={cn(
                            "px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border",
                            activeSem === r.semester
                                ? "bg-primary text-text-primary border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                                : "bg-surface border-border text-text-muted hover:text-text-primary hover:bg-surface/80"
                        )}
                    >
                        Sem {r.semester} ({r.academicYear})
                    </button>
                ))}
            </div>

            {/* Detailed Subject Breakdown */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <LuBookOpen className="text-primary" />
                    Marks Breakdown - Semester {activeSem}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeResult.subjectResults.map((sub) => (
                        <Card key={sub.id} className="p-6 glass-card border-border group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors pr-8">
                                        {sub.course.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {sub.course.code}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-surface text-text-muted px-2 py-0.5 rounded-full">
                                            {sub.course.credits} Credits
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-2xl font-black text-text-primary">{sub.grade}</div>
                                    <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">Grade</div>
                                </div>
                            </div>

                            {/* Stacked Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                    <span className="text-emerald-500">Internal ({sub.internalMarks}/30)</span>
                                    <span className="text-amber-500">Mid ({sub.midTermMarks}/20)</span>
                                    <span className="text-primary">Ext ({sub.externalMarks}/50)</span>
                                    <span className="text-text-primary">Total: {sub.totalMarks}</span>
                                </div>

                                <div className="h-2 w-full bg-surface rounded-full overflow-hidden flex">
                                    {/* Internal Bar - Green */}
                                    <div
                                        style={{ width: `${(sub.internalMarks / 100) * 100}%` }}
                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                    />
                                    {/* Mid-term Bar - Yellow */}
                                    <div
                                        style={{ width: `${(sub.midTermMarks / 100) * 100}%` }}
                                        className="h-full bg-amber-500 transition-all duration-1000"
                                    />
                                    {/* External Bar - Blue/Primary */}
                                    <div
                                        style={{ width: `${(sub.externalMarks / 100) * 100}%` }}
                                        className="h-full bg-primary transition-all duration-1000"
                                    />
                                </div>
                            </div>

                            {/* Subtle hover effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
