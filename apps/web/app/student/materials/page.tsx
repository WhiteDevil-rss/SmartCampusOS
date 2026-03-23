'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useMaterials } from '@/lib/hooks/use-materials';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LuBookOpen, LuDownload, LuLayoutDashboard, LuCalendar, LuCheck, LuCreditCard, LuLibrary, LuBriefcase, LuUser, LuMessageSquare, LuCircleHelp, LuFolder } from 'react-icons/lu';
import { cn } from '@/lib/utils';

const studentNavItems = [
    { title: 'Dashboard', href: '/student', icon: <LuLayoutDashboard className="w-5 h-5" /> },
    { title: 'Timetable', href: '/student/timetable', icon: <LuCalendar className="w-5 h-5" /> },
    { title: 'Attendance', href: '/student/attendance', icon: <LuCheck className="w-5 h-5" /> },
    { title: 'Academics', href: '/student/academics', icon: <LuBookOpen className="w-5 h-5" /> },
    { title: 'Study Materials', href: '/student/materials', icon: <LuFolder className="w-5 h-5" /> },
    { title: 'Fees & Finance', href: '/student/fees', icon: <LuCreditCard className="w-5 h-5" /> },
    { title: 'Library', href: '/student/library', icon: <LuLibrary className="w-5 h-5" /> },
    { title: 'Placement', href: '/student/placement', icon: <LuBriefcase className="w-5 h-5" /> },
    { title: 'Service Requests', href: '/student/requests', icon: <LuCircleHelp className="w-5 h-5" /> },
    { title: 'Messages', href: '/student/messages', icon: <LuMessageSquare className="w-5 h-5" /> },
    { title: 'Profile', href: '/student/profile', icon: <LuUser className="w-5 h-5" /> },
];

export default function MaterialsPage() {
    const { materials, loading } = useMaterials();

    return (
        <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout navItems={studentNavItems} title="Learning Materials">
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Study Materials</h2>
                        <p className="text-slate-500 font-medium max-w-2xl">Access all files, lecture notes, and resources uploaded by your faculty members for your current semester.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-white/5" />
                            ))
                        ) : materials.length > 0 ? (
                            materials.map((material) => (
                                <Card key={material.id} className="p-6 rounded-[2rem] border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                                    
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                                            <LuBookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">{material.title}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{material.course.name}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-2 min-h-[40px]">{material.description || 'Quick access learning material.'}</p>

                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-border-hover/50 pt-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Uploaded By</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{material.faculty.name}</span>
                                        </div>
                                        <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Button className="rounded-2xl h-11 px-6 font-black text-xs uppercase bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center gap-2">
                                                <LuDownload className="w-4 h-4" />
                                                Download
                                            </Button>
                                        </a>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="md:col-span-2 lg:col-span-3 p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-border-hover text-center">
                                <p className="text-slate-400 font-bold text-lg">No study materials found for your batch.</p>
                                <p className="text-slate-300 text-sm mt-1">Check back later once faculty uploads resources.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
