'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LuUsers, LuBookOpen, LuBuilding2, LuActivity, LuArrowUpRight, LuShieldCheck, LuZap, LuFileText, LuTrendingUp, LuCalendar } from 'react-icons/lu';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data for visualizations (Premium presentation)
const SEMESTER_DATA = [
    { name: 'Sem 1', results: 85, attendance: 92 },
    { name: 'Sem 2', results: 88, attendance: 90 },
    { name: 'Sem 3', results: 82, attendance: 94 },
    { name: 'Sem 4', results: 91, attendance: 89 },
    { name: 'Sem 5', results: 95, attendance: 91 },
    { name: 'Sem 6', results: 89, attendance: 93 },
];

const DEPT_DISTRIBUTION = [
    { name: 'Engineering', value: 45, color: '#6366f1' },
    { name: 'Management', value: 25, color: '#8b5cf6' },
    { name: 'Science', value: 20, color: '#ec4899' },
    { name: 'Arts', value: 10, color: '#f43f5e' },
];

export default function UniAdminDashboard() {
    const { user } = useAuthStore();
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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title={`Executive Overview`}>
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-8 pb-12"
                >
                    {/* Hero Section */}
                    <motion.div variants={itemVariants}>
                        <Card className="relative overflow-hidden border-0 bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-purple-600/10" />
                            <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-black tracking-widest px-4 py-1 uppercase text-[10px]">
                                        Operational Intelligence
                                    </Badge>
                                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">
                                        Welcome, {user?.username || 'Administrator'}
                                    </h1>
                                    <p className="text-slate-400 font-bold text-lg max-w-xl">
                                        System-wide sync completed. {stats.departments} departments are currently reporting peak performance across the academic cluster.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <Button className="bg-white text-slate-900 hover:bg-indigo-50 rounded-2xl font-black px-8">
                                            Generate Report <LuFileText className="ml-2 w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl font-black px-8">
                                            Audit Logs <LuActivity className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="hidden lg:flex items-center gap-6 bg-white/5 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/10 shadow-inner">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">System Load</p>
                                        <div className="text-3xl font-black">98.2%</div>
                                    </div>
                                    <div className="w-[1px] h-12 bg-white/10" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Identity Trust</p>
                                        <div className="text-3xl font-black text-emerald-400">Verified</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Academic Depts', value: stats.departments, icon: <LuBuilding2 />, color: 'blue', trend: '+2' },
                            { label: 'Active Faculty', value: stats.faculty, icon: <LuUsers />, color: 'indigo', trend: '+12' },
                            { label: 'Global Courses', value: stats.courses, icon: <LuBookOpen />, color: 'purple', trend: 'Updated' },
                            { label: 'Student Cohorts', value: stats.batches, icon: <LuZap />, color: 'emerald', trend: 'Stable' },
                        ].map((stat, i) => (
                            <motion.div key={stat.label} variants={itemVariants}>
                                <Card className="group hover:border-indigo-500/50 transition-all duration-500 rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0c] border-slate-200 dark:border-border-hover shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-950/30 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                                {stat.icon}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                                {stat.trend} <LuArrowUpRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
                                                {loading ? '...' : stat.value}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Trend Chart */}
                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <Card className="rounded-[2rem] border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] p-8 shadow-sm h-full">
                                <CardHeader className="px-0 pt-0 pb-8 flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black">Performance Analytics</CardTitle>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Semester-wise Engagement & Accuracy</p>
                                    </div>
                                    <LuTrendingUp className="text-indigo-600 w-6 h-6" />
                                </CardHeader>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={SEMESTER_DATA}>
                                            <defs>
                                                <linearGradient id="colorResults" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 10 }}
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    borderRadius: '1rem', 
                                                    border: 'none', 
                                                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                                    background: '#0f172a',
                                                    color: '#fff'
                                                }} 
                                            />
                                            <Area type="monotone" dataKey="results" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorResults)" />
                                            <Area type="monotone" dataKey="attendance" stroke="#ec4899" strokeWidth={4} fillOpacity={0} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Pie Chart / Distribution */}
                        <motion.div variants={itemVariants}>
                            <Card className="rounded-[2rem] border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] p-8 shadow-sm h-full">
                                <CardHeader className="px-0 pt-0 pb-8">
                                    <CardTitle className="text-xl font-black">Cluster Split</CardTitle>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Faculty Weightage by Domain</p>
                                </CardHeader>
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={DEPT_DISTRIBUTION}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
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
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 mt-6">
                                    {DEPT_DISTRIBUTION.map(item => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2h-2 w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Publish Results', icon: <LuShieldCheck />, desc: 'Global semester release', href: '/dashboard/results' },
                            { title: 'Admission Control', icon: <LuUsers />, desc: 'Verify new pipelines', href: '/dashboard/admissions' },
                            { title: 'Infrastructure', icon: <LuBuilding2 />, desc: 'Manage departments', href: '/dashboard/departments' },
                            { title: 'System Audits', icon: <LuActivity />, desc: 'Real-time sync logs', href: '/v1/logs' },
                        ].map((item, i) => (
                            <motion.div key={item.title} variants={itemVariants}>
                                <button 
                                    onClick={() => window.location.href = item.href}
                                    className="w-full text-left bg-slate-100/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 p-6 rounded-[2rem] border border-transparent hover:border-indigo-500/20 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h4 className="font-black text-slate-900 dark:text-white mb-1">{item.title}</h4>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{item.desc}</p>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
