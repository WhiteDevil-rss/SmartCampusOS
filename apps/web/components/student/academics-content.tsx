'use client';

import { useAssignments } from '@/lib/hooks/use-assignments';
import { useMaterials } from '@/lib/hooks/use-materials';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LuFileText, LuBookOpen, LuDownload, LuExternalLink, LuClock, LuCircleCheck, LuCircleAlert, LuCloudUpload } from 'react-icons/lu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function AcademicsContent() {
    const { assignments, loading: assignmentsLoading } = useAssignments();
    const { materials, loading: materialsLoading } = useMaterials();

    if (assignmentsLoading || materialsLoading) return <Skeleton className="h-96 rounded-3xl bg-surface" />;

    return (
        <div className="space-y-8 animate-fade-in">
            <Tabs defaultValue="assignments" className="space-y-8">
                <TabsList className="bg-surface border border-border p-1 rounded-2xl h-auto gap-1">
                    <TabsTrigger value="assignments" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-text-primary font-bold">
                        Assignments
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-text-primary font-bold">
                        Study Materials
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {assignments.map((assignment) => {
                            const isSubmitted = assignment.submissions && assignment.submissions.length > 0;
                            const submission = isSubmitted ? assignment.submissions![0] : null;
                            const isGraded = submission?.status === 'GRADED';

                            return (
                                <Card key={assignment.id} className="p-6 glass-card border-border hover:border-primary/20 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                            <LuFileText className="w-6 h-6" />
                                        </div>
                                        {isSubmitted ? (
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                isGraded ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {isGraded ? <LuCircleCheck className="w-3 h-3" /> : <LuClock className="w-3 h-3" />}
                                                {isGraded ? 'Graded' : 'Submitted'}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                                                <LuCircleAlert className="w-3 h-3" />
                                                Pending
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{assignment.title}</h4>
                                        <p className="text-xs text-text-muted line-clamp-2">{assignment.course.name} • {assignment.course.code}</p>
                                    </div>

                                    <div className="flex items-center justify-between py-4 border-t border-border mb-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Deadline</p>
                                            <p className="text-xs font-bold text-text-primary">{format(new Date(assignment.dueDate), 'MMM d, h:mm a')}</p>
                                        </div>
                                        {isGraded && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Grade</p>
                                                <p className="text-sm font-black text-emerald-500">{submission.grade}/{assignment.maxMarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    <Button className={cn(
                                        "w-full rounded-xl font-bold py-6 gap-2",
                                        isSubmitted ? "bg-surface hover:bg-surface-hover text-text-primary" : ""
                                    )}>
                                        {isSubmitted ? 'View Submission' : (
                                            <>
                                                <LuCloudUpload className="w-5 h-5" />
                                                Submit Assignment
                                            </>
                                        )}
                                    </Button>
                                </Card>
                            );
                        })}

                        {assignments.length === 0 && (
                            <div className="md:col-span-2 p-20 rounded-3xl border border-dashed border-border-hover text-center">
                                <p className="text-text-muted font-bold">No assignments found for your batch.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="materials" className="outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((material) => (
                            <Card key={material.id} className="p-6 glass-card border-border hover:border-indigo-500/20 transition-all group relative overflow-hidden">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                                        <LuBookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate">{material.title}</h4>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{material.course.name}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-text-muted mb-6 line-clamp-2 min-h-[32px]">{material.description || 'No description provided.'}</p>

                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Uploaded By</span>
                                        <span className="text-[10px] font-bold text-text-primary">{material.faculty.name}</span>
                                    </div>
                                    <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-wider px-4">
                                            <LuDownload className="w-3 h-3" />
                                            Download
                                        </Button>
                                    </a>
                                </div>
                            </Card>
                        ))}

                        {materials.length === 0 && (
                            <div className="lg:col-span-3 p-20 rounded-3xl border border-dashed border-border-hover text-center">
                                <p className="text-text-muted font-bold">No study materials available yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
