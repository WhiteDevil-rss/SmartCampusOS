'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { V2DashboardLayout } from '@/components/v2/layout/dashboard-layout';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Zap, 
  Activity, 
  TrendingUp, 
  FileText,
  ShieldCheck,
  Globe,
  Library,
  Briefcase,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { 
  StatCard, 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardDescription, 
  GlassCardContent 
} from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { GreetingCard } from '@/components/v2/shared/greeting-card';

// Mock data for visualizations
const SEMESTER_DATA = [
    { name: 'Sem 1', results: 85, attendance: 92 },
    { name: 'Sem 2', results: 88, attendance: 90 },
    { name: 'Sem 3', results: 82, attendance: 94 },
    { name: 'Sem 4', results: 91, attendance: 89 },
    { name: 'Sem 5', results: 95, attendance: 91 },
    { name: 'Sem 6', results: 89, attendance: 93 },
];

const DEPT_DISTRIBUTION = [
    { name: 'Engineering', value: 45, color: '#0070ff' },
    { name: 'Management', value: 25, color: '#3b82f6' },
    { name: 'Science', value: 20, color: '#1d4ed8' },
    { name: 'Arts', value: 10, color: '#60a5fa' },
];

export default function UniAdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [stats, setStats] = useState({ departments: 0, faculty: 0, courses: 0, batches: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [deptRes, facRes, crsRes, bchRes] = await Promise.all([
                api.get(`/universities/${user?.universityId}/departments`),
                api.get(`/faculty`),
                api.get(`/courses`),
                api.get(`/batches`),
            ]);
            setStats({
                departments: deptRes.data.length,
                faculty: facRes.data.length,
                courses: crsRes.data.length,
                batches: bchRes.data.length,
            });
        } catch (e) {
            console.warn('Dashboard: Failed to fetch live stats, using defaults');
        } finally {
            setLoading(false);
        }
    }, [user?.universityId]);

    useEffect(() => {
        if (user?.universityId) {
            fetchData();
        }
    }, [user, fetchData]);

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <V2DashboardLayout title={`University Administration: ${user?.username || 'Administrator'}`}>
                <div className="space-y-10 pb-24">
                    {/* Executive Greeting */}
                    <GreetingCard 
                        name={user?.username || 'Administrator'}
                        role="University Admin"
                        stats={[
                            { label: "Active Departments", value: stats.departments, icon: Building2 },
                            { label: "Faculty Presence", value: stats.faculty, icon: Users }
                        ]}
                        quickAction={{
                            label: "Run Institutional Audit",
                            onClick: () => router.push('/v1/logs')
                        }}
                    />

                    {/* Humanized Institutional Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Academic Pillars" 
                            value={stats.departments} 
                            change={12} 
                            icon={Building2} 
                            changeDescription="active departments"
                        />
                        <StatCard 
                            title="Teaching Strength" 
                            value={stats.faculty} 
                            change={8} 
                            icon={Users} 
                            changeDescription="verified educators"
                        />
                        <StatCard 
                            title="Learning Matrix" 
                            value={stats.courses} 
                            change={4} 
                            icon={BookOpen} 
                            changeDescription="active programs"
                        />
                        <StatCard 
                            title="Student Cohorts" 
                            value={stats.batches} 
                            change={0} 
                            icon={Zap} 
                            changeDescription="semester groups"
                        />
                    </div>

                    {/* Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Performance Chart */}
                        <GlassCard className="lg:col-span-2 rounded-[3rem] border-primary/10">
                            <GlassCardHeader className="px-8 pt-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black font-space-grotesk text-slate-100">Academic Trajectory</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cross-Semester Performance Integrity</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                </div>
                            </GlassCardHeader>
                            <GlassCardContent className="p-8">
                                <div className="h-[350px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={SEMESTER_DATA}>
                                            <defs>
                                                <linearGradient id="colorAdminResults" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0070ff" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="#0070ff" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={1} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#71717a', fontWeight: 900, fontSize: 10, fontFamily: 'Space Grotesk' }}
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    borderRadius: '24px', 
                                                    border: '1px solid rgba(255,255,255,0.1)', 
                                                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                                    background: '#020817',
                                                    color: '#fff',
                                                    padding: '16px'
                                                }} 
                                                itemStyle={{ color: '#0070ff', fontWeight: 800 }}
                                            />
                                            <Area type="monotone" dataKey="results" stroke="#0070ff" strokeWidth={4} fillOpacity={1} fill="url(#colorAdminResults)" />
                                            <Area type="monotone" dataKey="attendance" stroke="#334155" strokeWidth={2} fillOpacity={0} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </GlassCardContent>
                        </GlassCard>

                        {/* Distribution Chart */}
                        <GlassCard className="rounded-[3rem] border-primary/10">
                            <GlassCardHeader className="px-8 pt-8">
                                <h3 className="text-2xl font-black font-space-grotesk text-slate-100">Faculty Hub</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resource Distribution by Sector</p>
                            </GlassCardHeader>
                            <GlassCardContent className="p-8">
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={DEPT_DISTRIBUTION}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {DEPT_DISTRIBUTION.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Load Status</p>
                                            <p className="text-4xl font-black text-slate-100 tracking-tighter leading-none">94%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    {DEPT_DISTRIBUTION.map(item => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-100 tracking-tight font-space-grotesk">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCardContent>
                        </GlassCard>
                    </div>

                    {/* Services Command Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Publish Grades', icon: ShieldCheck, desc: 'Institutional release', href: '/dashboard/results' },
                            { title: 'Manage Admissions', icon: Users, desc: 'Verify enrollment', href: '/dashboard/admissions' },
                            { title: 'Infrastructure Hub', icon: Building2, desc: 'Department management', href: '/dashboard/departments' },
                            { title: 'Academic Programs', icon: Layers, desc: 'Syllabus & curriculum', href: '/dashboard/programs' },
                            { title: 'Resource Center', icon: Library, desc: 'Library management', href: '/dashboard/library' },
                            { title: 'Career Services', icon: Briefcase, desc: 'Placements & training', href: '/dashboard/placements' },
                            { title: 'Quality Assurance', icon: Sparkles, desc: 'NAAC & compliance', href: '/dashboard/naac' },
                            { title: 'Security Audits', icon: Activity, desc: 'System telemetry', href: '/v1/logs' },
                        ].map((item, i) => (
                            <GlassCard 
                                key={item.title}
                                className="cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 group rounded-[2.5rem] border-white/5"
                                onClick={() => router.push(item.href)}
                            >
                                <GlassCardContent className="p-8">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:scale-110 transition-all duration-300">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-black text-slate-100 tracking-tight uppercase text-base font-space-grotesk mb-1">{item.title}</h4>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{item.desc}</p>
                                </GlassCardContent>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </V2DashboardLayout>
        </ProtectedRoute>
    );
}
