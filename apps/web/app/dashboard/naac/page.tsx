'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import {
    LuDownload, LuLibrary, LuUsers, LuBuilding2,
    LuBriefcase, LuGraduationCap, LuActivity, LuFileText, LuTrendingUp
} from 'react-icons/lu';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import jspdf from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Diagnostic: V2 API Integration Active

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function NaacDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/v2/accreditation/naac');
            setData(res.data.data);
        } catch (error) {
            console.error('Failed to load accreditation metrics', error);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        if (!data) return;
        const rootDoc = new jspdf('p', 'mm', 'a4');
        rootDoc.setFontSize(20);
        rootDoc.text('NAAC Accreditation Report', 14, 22);
        rootDoc.setFontSize(10);
        rootDoc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const criteria = data.criteria;

        // C1
        (rootDoc as any).autoTable({
            startY: 40,
            head: [['Criterion 1: Curricular Aspects', 'Value']],
            body: [
                ['Total Programs (UG/PG)', criteria.curricularAspects.totalPrograms],
                ['Total Active Courses', criteria.curricularAspects.totalCourses],
                ['Operational Departments', criteria.curricularAspects.totalDepartments],
            ],
            theme: 'striped',
        });

        // C2
        (rootDoc as any).autoTable({
            head: [['Criterion 2: Teaching-Learning', 'Value']],
            body: [
                ['Total Enrolled Students', criteria.teachingLearning.totalStudents],
                ['Full-time Faculty', criteria.teachingLearning.totalFaculty],
                ['Student-Faculty Ratio', criteria.teachingLearning.studentFacultyRatio],
                ['Average Pass Percentage', criteria.teachingLearning.passPercentage],
            ],
            theme: 'striped',
        });

        // C4
        (rootDoc as any).autoTable({
            head: [['Criterion 4: Infrastructure', 'Value']],
            body: [
                ['Instructional Classrooms', criteria.infrastructure.classrooms],
                ['Specialized Laboratories', criteria.infrastructure.labs],
                ['Library Book Volumes', criteria.infrastructure.totalLibraryBooks],
            ],
            theme: 'striped',
        });

        // C5
        (rootDoc as any).autoTable({
            head: [['Criterion 5: Student Support', 'Value']],
            body: [
                ['Students Placed Internally', criteria.studentSupport.totalPlacedStudents],
                ['Active Recruiting Partners', criteria.studentSupport.totalRecruitingCompanies],
            ],
            theme: 'striped',
        });

        rootDoc.save(`NAAC_Report_${new Date().getTime()}.pdf`);
    };

    const exportExcel = () => {
        if (!data) return;
        const ws = XLSX.utils.json_to_sheet([
            { Metric: "Total Programs", Value: data.criteria.curricularAspects.totalPrograms, Criterion: "1" },
            { Metric: "Total Courses", Value: data.criteria.curricularAspects.totalCourses, Criterion: "1" },
            { Metric: "Total Departments", Value: data.criteria.curricularAspects.totalDepartments, Criterion: "1" },
            { Metric: "Total Students", Value: data.criteria.teachingLearning.totalStudents, Criterion: "2" },
            { Metric: "Total Faculty", Value: data.criteria.teachingLearning.totalFaculty, Criterion: "2" },
            { Metric: "Pass Percentage", Value: data.criteria.teachingLearning.passPercentage, Criterion: "2" },
            { Metric: "Classrooms", Value: data.criteria.infrastructure.classrooms, Criterion: "4" },
            { Metric: "Labs", Value: data.criteria.infrastructure.labs, Criterion: "4" },
            { Metric: "Library Books", Value: data.criteria.infrastructure.totalLibraryBooks, Criterion: "4" },
            { Metric: "Placed Students", Value: data.criteria.studentSupport.totalPlacedStudents, Criterion: "5" },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "NAAC Metrics");
        XLSX.writeFile(wb, `NAAC_Metrics_${new Date().getTime()}.xlsx`);
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
                <DashboardLayout navItems={UNI_ADMIN_NAV} title="Accreditation Desk">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    if (!data) return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Accreditation Desk">
                <div className="p-8 text-center text-text-muted">Metrics data could not be synchronized.</div>
            </DashboardLayout>
        </ProtectedRoute>
    );

    const cData = data.criteria;

    return (
        <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
            <DashboardLayout navItems={UNI_ADMIN_NAV} title="Accreditation Desk">
                <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl opacity-50"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-[10px] uppercase font-black px-3">Live Integration</Badge>
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Self-Study Report v4.0</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 underline decoration-neon-cyan/30 underline-offset-8">NAAC Intelligence</h1>
                            <p className="text-indigo-200/60 font-medium max-w-xl">Autonomous orchestration of institutional metrics across all criteria for accreditation excellence.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" className="h-14 px-6 rounded-2xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white font-bold transition-all" onClick={exportExcel}>
                                <LuFileText className="w-5 h-5 mr-3" /> Export Dataset
                            </Button>
                            <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-indigo-50 font-black shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all" onClick={exportPDF}>
                                <LuDownload className="w-5 h-5 mr-3" /> Generate SSR
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <MetricCard
                        title="Student-Faculty Ratio"
                        value={cData.teachingLearning.studentFacultyRatio}
                        icon={LuUsers}
                        criterion="Criterion II"
                        color="cyan"
                    />
                    <MetricCard
                        title="Average Pass Rate"
                        value={`${cData.teachingLearning.passPercentage}%`}
                        icon={LuGraduationCap}
                        criterion="Criterion II"
                        color="indigo"
                    />
                    <MetricCard
                        title="Resource Hub (Books)"
                        value={cData.infrastructure.totalLibraryBooks.toLocaleString()}
                        icon={LuLibrary}
                        criterion="Criterion IV"
                        color="emerald"
                    />
                    <MetricCard
                        title="Career Conversion"
                        value={cData.studentSupport.totalPlacedStudents}
                        icon={LuBriefcase}
                        criterion="Criterion V"
                        color="amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Criterion 1: Curricular */}
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                        <LuLibrary className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black text-white">Curricular Aspects</CardTitle>
                                        <CardDescription className="text-indigo-300/40 font-bold uppercase tracking-widest text-[10px] mt-1">Criterion I &bull; Academic Architecture</CardDescription>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Weightage</div>
                                    <div className="text-2xl font-black text-indigo-400">100</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                                    <p className="text-4xl font-black text-white group-hover:text-indigo-400 transition-colors">{cData.curricularAspects.totalPrograms}</p>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">Active Programs</p>
                                </div>
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                                    <p className="text-4xl font-black text-white group-hover:text-indigo-400 transition-colors">{cData.curricularAspects.totalCourses}</p>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">Mapped Courses</p>
                                </div>
                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                                    <p className="text-4xl font-black text-white group-hover:text-indigo-400 transition-colors">{cData.curricularAspects.totalDepartments}</p>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">Active Depts</p>
                                </div>
                            </div>
                            <div className="h-[300px] relative">
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global</p>
                                        <p className="text-2xl font-black text-white">Catalog</p>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={cData.curricularAspects.programStudentDistribution}
                                            cx="50%" cy="50%"
                                            innerRadius={80} outerRadius={110}
                                            paddingAngle={8} dataKey="total"
                                            stroke="none"
                                        >
                                            {cData.curricularAspects.programStudentDistribution.map((entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                    className="outline-none hover:opacity-80 transition-opacity cursor-pointer"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Criterion 4 & 5 Combined View */}
                    <div className="space-y-8">
                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8 pb-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                            <LuBuilding2 className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-white">Infrastructure</CardTitle>
                                            <CardDescription className="text-emerald-300/40 font-bold uppercase tracking-widest text-[10px] mt-1">Criterion IV &bull; Capacity</CardDescription>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-emerald-400 opacity-50 underline">W: 100</div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl relative group overflow-hidden transition-all hover:border-emerald-500/30">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><LuBuilding2 className="w-24 h-24" /></div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Main Classrooms</p>
                                    <p className="text-5xl font-black text-white">{cData.infrastructure.classrooms}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                        <LuTrendingUp className="w-3 h-3" /> Fully Optimized
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl relative group overflow-hidden transition-all hover:border-indigo-500/30">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><LuActivity className="w-24 h-24" /></div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Reseach Labs</p>
                                    <p className="text-5xl font-black text-white">{cData.infrastructure.labs}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                        <LuTrendingUp className="w-3 h-3" /> High Utilization
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
                            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8 pb-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                            <LuBriefcase className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-white">Student Support</CardTitle>
                                            <CardDescription className="text-amber-300/40 font-bold uppercase tracking-widest text-[10px] mt-1">Criterion V &bull; Outcome Analysis</CardDescription>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-amber-400 opacity-50 underline">W: 140</div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl mb-8 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-amber-500/20 to-transparent blur-2xl"></div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-amber-300/60 uppercase tracking-widest">Active Recruiting Partners</p>
                                        <p className="text-5xl font-black text-white mt-1">{cData.studentSupport.totalRecruitingCompanies}</p>
                                    </div>
                                    <LuBriefcase className="w-16 h-16 text-amber-400/20 relative z-10 group-hover:scale-110 transition-transform" />
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] mb-4">Elite Industrial Placements</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {cData.studentSupport.topRecruiters.map((company: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all rounded-2xl group">
                                                <span className="font-bold text-white/80 group-hover:text-white transition-colors">{company.name}</span>
                                                <Badge className="bg-white/5 text-white/60 border-white/10 font-mono text-[10px] px-3">{company.hires} Hires</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function MetricCard({ title, value, icon: Icon, criterion, color }: { title: string, value: string | number, icon: any, criterion: string, color: 'cyan' | 'indigo' | 'emerald' | 'amber' }) {
    const colorMap = {
        cyan: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    };

    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-lg rounded-[2rem] overflow-hidden group hover:bg-slate-900/60 transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl border ${colorMap[color]} group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{criterion}</span>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-4xl font-black text-white tracking-tight">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
