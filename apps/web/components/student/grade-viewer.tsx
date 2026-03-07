'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentPerformance } from '@/lib/hooks/use-student-performance';
import { cn } from '@/lib/utils';
import { LuAward, LuBookOpen, LuCheck, LuLayoutDashboard, LuGraduationCap } from 'react-icons/lu';

export function GradeViewer() {
    const { performance, loading, error } = useStudentPerformance();

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

    if (error) {
        return (
            <Card className="p-8 border-rose-500/20 bg-rose-500/5 text-rose-500 text-center">
                <p className="font-bold">{error}</p>
            </Card>
        );
    }

    const latestResult = performance?.semesterResults[0];

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
                            <p className="text-3xl font-black text-text-primary">{latestResult?.sgpa || '0.00'}</p>
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
                            <p className="text-3xl font-black text-text-primary">{latestResult?.cgpa || '0.00'}</p>
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
                            <p className="text-3xl font-black text-text-primary">{latestResult?.status || 'N/A'}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Semester History */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                    <LuBookOpen className="text-primary" />
                    Semester Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {performance?.semesterResults.map((result) => (
                        <Card key={result.id} className="p-6 glass-card border-border hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                                        Semester {result.semester}
                                    </h4>
                                    <p className="text-xs text-text-muted font-medium">{result.academicYear}</p>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    result.status === 'PASS' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                )}>
                                    {result.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-end border-t border-border pt-4">
                                <div>
                                    <p className="text-[9px] font-black text-text-muted uppercase">SGPA</p>
                                    <p className="text-xl font-black text-text-primary">{result.sgpa}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-text-muted uppercase">CGPA</p>
                                    <p className="text-xl font-black text-text-primary">{result.cgpa}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Internal Assessments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Assignments */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                        <LuGraduationCap className="text-primary" />
                        Internal Assignments
                    </h3>
                    <div className="space-y-4">
                        {performance?.assignments.map((assignment) => (
                            <div key={assignment.id} className="p-5 rounded-2xl bg-surface/50 border border-border hover:border-primary/20 transition-all group">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{assignment.course}</p>
                                        <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{assignment.title}</h4>
                                        <p className="text-[10px] text-text-muted mt-1">{new Date(assignment.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-text-primary">{assignment.grade}<span className="text-xs text-text-muted">/{assignment.maxMarks}</span></p>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase">Graded</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quizzes */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                        <LuAward className="text-amber-500" />
                        Quiz Performances
                    </h3>
                    <div className="space-y-4">
                        {performance?.quizzes.map((quiz) => (
                            <div key={quiz.id} className="p-5 rounded-2xl bg-surface/50 border border-border hover:border-amber-500/20 transition-all group">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">{quiz.course}</p>
                                        <h4 className="text-sm font-bold text-text-primary group-hover:text-amber-500 transition-colors">{quiz.title}</h4>
                                        <p className="text-[10px] text-text-muted mt-1">{new Date(quiz.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-text-primary">{quiz.score}<span className="text-xs text-text-muted">%</span></p>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase">Completed</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
