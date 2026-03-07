'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DEPT_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    LuSearch, LuTrendingUp, LuStar, LuTrophy, LuBookOpen,
    LuClock, LuActivity, LuChevronRight, LuDownload
} from 'react-icons/lu';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';

interface FacultyPerformance {
    id: string;
    name: string;
    designation: string;
    metrics: {
        passPercentage: number;
        studentRating: number;
        regularity: number;
        syllabusCompletion: number;
    };
    overallScore: number;
    category: string;
}

export default function FacultyPerformancePage() {
    const { user } = useAuthStore();
    const [data, setData] = useState<FacultyPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyPerformance | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (!user?.entityId) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/faculty/performance/${user!.entityId}`);
            setData(res.data);
            if (res.data.length > 0) setSelectedFaculty(res.data[0]);
        } catch (error) {
            console.error('Failed to load faculty performance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedFaculty) return;
        setIsExporting(true);
        try {
            const element = document.getElementById('faculty-report');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Faculty_Report_${selectedFaculty.name.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const filteredData = data.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const radarData = selectedFaculty ? [
        { subject: 'Pass Rate', A: selectedFaculty.metrics.passPercentage, fullMark: 100 },
        { subject: 'Feedback', A: selectedFaculty.metrics.studentRating * 20, fullMark: 100 },
        { subject: 'Regularity', A: selectedFaculty.metrics.regularity, fullMark: 100 },
        { subject: 'Syllabus', A: selectedFaculty.metrics.syllabusCompletion, fullMark: 100 },
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LuActivity className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['DEPT_ADMIN', 'UNI_ADMIN']}>
            <DashboardLayout navItems={DEPT_ADMIN_NAV} title="Faculty Performance Analytics">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Sidebar / List View */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="relative">
                            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                            <Input
                                placeholder="Search faculty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 dark:bg-[#0a0a0c] dark:border-border-hover"
                            />
                        </div>

                        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                            {filteredData.map((faculty) => (
                                <div
                                    key={faculty.id}
                                    onClick={() => setSelectedFaculty(faculty)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedFaculty?.id === faculty.id
                                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30'
                                        : 'bg-white border-slate-200 dark:bg-[#0a0a0c] dark:border-border hover:border-slate-300 dark:hover:border-border-hover'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-text-primary capitalize">{faculty.name}</div>
                                            <div className="text-xs text-text-secondary">{faculty.designation}</div>
                                        </div>
                                        <Badge className={`${faculty.overallScore > 85 ? 'bg-emerald-500' : faculty.overallScore > 70 ? 'bg-indigo-500' : 'bg-slate-500'
                                            }`}>
                                            {faculty.overallScore}
                                        </Badge>
                                    </div>
                                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                                        {faculty.category} Performance
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Detail View */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {selectedFaculty && (
                                <motion.div
                                    key={selectedFaculty.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-bold dark:text-text-primary capitalize">{selectedFaculty.name}</h2>
                                            <p className="text-text-secondary">{selectedFaculty.designation} • Dept Analytics</p>
                                        </div>
                                        <div className="flex items-start gap-6">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleExport}
                                                disabled={isExporting}
                                                className="bg-white dark:bg-surface border-slate-200 dark:border-border-hover"
                                            >
                                                {isExporting ? <LuActivity className="w-4 h-4 mr-2 animate-spin" /> : <LuDownload className="w-4 h-4 mr-2" />}
                                                Export Report
                                            </Button>
                                            <div className="text-right">
                                                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{selectedFaculty.overallScore}<span className="text-xl text-text-muted font-normal">/100</span></div>
                                                <div className="text-xs uppercase tracking-widest text-text-muted font-bold">Overall Score</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="faculty-report" className="space-y-6 pt-2">

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Performance Matrix */}
                                            <Card className="glass-card border dark:border-border-hover">
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <LuActivity className="w-4 h-4 text-indigo-500" />
                                                        Performance Metrics
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="h-[250px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                                            <Radar
                                                                name={selectedFaculty.name}
                                                                dataKey="A"
                                                                stroke="#6366f1"
                                                                fill="#6366f1"
                                                                fillOpacity={0.6}
                                                            />
                                                            <Tooltip />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </CardContent>
                                            </Card>

                                            {/* Quick Stats Grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: 'Pass Rate', value: `${selectedFaculty.metrics.passPercentage}%`, icon: LuTrophy, color: 'emerald' },
                                                    { label: 'Avg Rating', value: `${selectedFaculty.metrics.studentRating}/5`, icon: LuStar, color: 'amber' },
                                                    { label: 'Classes Conducted', value: `${selectedFaculty.metrics.regularity}%`, icon: LuClock, color: 'indigo' },
                                                    { label: 'Syllabus Finish', value: `${selectedFaculty.metrics.syllabusCompletion}%`, icon: LuBookOpen, color: 'sky' }
                                                ].map((stat, i) => (
                                                    <Card key={i} className="glass-card border-none shadow-sm flex flex-col items-center justify-center p-4">
                                                        <stat.icon className={`w-8 h-8 mb-2 text-${stat.color}-500`} />
                                                        <div className="text-xl font-bold">{stat.value}</div>
                                                        <div className="text-[10px] uppercase text-text-secondary font-semibold">{stat.label}</div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Detailed Breakdown */}
                                        <Card className="glass-card border dark:border-border-hover">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <LuTrendingUp className="w-4 h-4 text-indigo-500" />
                                                    Benchmark Analysis
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Academic Excellence (Student Results)', value: selectedFaculty.metrics.passPercentage },
                                                        { label: 'Instructional Feedback (Student Voice)', value: selectedFaculty.metrics.studentRating * 20 },
                                                        { label: 'Schedule Adherence (Regularity)', value: selectedFaculty.metrics.regularity },
                                                        { label: 'Curricular Progress (Syllabus Coverage)', value: selectedFaculty.metrics.syllabusCompletion }
                                                    ].map((bar, i) => (
                                                        <div key={i} className="space-y-1.5">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-slate-600 dark:text-text-muted font-medium">{bar.label}</span>
                                                                <span className="font-bold">{bar.value}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-slate-100 dark:bg-surface rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${bar.value}%` }}
                                                                    className={`h-full bg-gradient-to-r from-indigo-500 to-indigo-400`}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
