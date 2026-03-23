'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { StudentMarksVisualizer } from '@/components/student/student-marks-visualizer';
import { AcademicsContent } from '@/components/student/academics-content';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STUDENT_NAV } from '@/lib/constants/nav-config';
import { LuGraduationCap, LuBookOpen } from 'react-icons/lu';

export default function AcademicsPage() {
    return (
        <DashboardLayout
            title="Academic Excellence"
            navItems={STUDENT_NAV}
        >
            <div className="space-y-10 max-w-7xl mx-auto pb-12">
                <Tabs defaultValue="performance" className="space-y-10">
                    <TabsList className="glass-morphism border border-border p-1.5 rounded-[20px] h-auto gap-2 inline-flex">
                        <TabsTrigger
                            value="performance"
                            className="rounded-[14px] px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold data-[state=active]:shadow-lg text-text-muted transition-all"
                        >
                            Marks & Grades
                        </TabsTrigger>
                        <TabsTrigger
                            value="resources"
                            className="rounded-[14px] px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold data-[state=active]:shadow-lg text-text-muted transition-all"
                        >
                            Study & Tasks
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                        <div className="relative mb-12">
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-primary">
                                    <span className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                                        <LuGraduationCap className="w-5 h-5" />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Academic Excellence</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold font-space-grotesk text-text-primary tracking-tight">
                                    Marks & <span className="text-primary italic">Grades</span>
                                </h1>
                                <p className="text-text-muted text-lg max-w-xl">
                                    Track your semester-wise results, internal assessments, and academic progress in real-time.
                                </p>
                            </div>
                        </div>
                        <StudentMarksVisualizer />
                    </TabsContent>

                    <TabsContent value="resources" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
                        <div className="relative mb-12">
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-indigo-400">
                                    <span className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <LuBookOpen className="w-5 h-5" />
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Learning Center</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold font-space-grotesk text-text-primary tracking-tight">
                                    Study & <span className="text-indigo-400 italic">Tasks</span>
                                </h1>
                                <p className="text-text-muted text-lg max-w-xl">
                                    Access lecture notes, syllabus resources, and manage your assignment submissions.
                                </p>
                            </div>
                        </div>
                        <AcademicsContent />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
