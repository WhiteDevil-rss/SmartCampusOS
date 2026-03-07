'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
    LuLogOut,
    LuBriefcase,
    LuGraduationCap,
    LuMail,
    LuPhone,
    LuMapPin
} from 'react-icons/lu';
import { facultyNavItems } from '../page';

export default function FacultyProfilePage() {
    const { user, logout } = useAuthStore();

    return (
        <ProtectedRoute allowedRoles={['FACULTY']}>
            <DashboardLayout
                title="Faculty Profile"
                navItems={facultyNavItems}
            >
                <div className="max-w-4xl space-y-8 animate-fade-in">
                    {/* Hero Section */}
                    <Card className="p-8 glass-card border-border bg-surface relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                            <div className="w-32 h-32 rounded-3xl bg-surface border border-border flex items-center justify-center text-4xl font-black text-primary shadow-glow">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-black text-text-primary tracking-tighter mb-2">{user?.username}</h1>
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4">Senior Faculty • Department of Computer Science</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-text-muted text-sm font-bold">
                                        <LuMail className="w-4 h-4 text-primary" />
                                        {user?.email || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted text-sm font-bold">
                                        <LuPhone className="w-4 h-4 text-primary" />
                                        +91 98765 43210
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted text-sm font-bold">
                                        <LuMapPin className="w-4 h-4 text-primary" />
                                        Block A, Room 402
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-2xl border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 font-bold gap-2 self-start" onClick={logout}>
                                <LuLogOut className="w-4 h-4" />
                                Sign Out
                            </Button>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Qualifications */}
                        <Card className="p-6 glass-card border-border bg-surface">
                            <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-3">
                                <LuGraduationCap className="text-primary" />
                                Academic Background
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { degree: 'Ph.D. in Machine Learning', school: 'IIT Bombay', year: '2018' },
                                    { degree: 'M.Tech in Computer Science', school: 'NIT Surat', year: '2012' },
                                    { degree: 'B.E. in Information Technology', school: 'VNSGU', year: '2010' },
                                ].map((edu, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-surface/50 border border-border border-l-primary border-l-4">
                                        <h4 className="font-bold text-text-primary text-sm">{edu.degree}</h4>
                                        <p className="text-xs text-text-muted font-bold">{edu.school} • {edu.year}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Research Interests */}
                        <Card className="p-6 glass-card border-border bg-surface">
                            <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-3">
                                <LuBriefcase className="text-primary" />
                                Research & Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['Artificial Intelligence', 'Blockchain Technology', 'Cloud Computing', 'Data Mining', 'Internet of Things', 'Cyber Security'].map((tag, idx) => (
                                    <span key={idx} className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-8">
                                <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">Ongoing Projects</h4>
                                <ul className="space-y-2 text-sm text-text-secondary font-medium">
                                    <li className="flex items-center gap-2">• Smart Campus IoT Infrastructure</li>
                                    <li className="flex items-center gap-2">• decentralized Academic Credentials</li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
