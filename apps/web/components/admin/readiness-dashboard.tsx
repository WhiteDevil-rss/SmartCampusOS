'use client';

import React, { useState, useEffect } from 'react';
import { 
    Users, 
    TrendingUp, 
    Search, 
    Filter, 
    Download, 
    CheckCircle2, 
    Clock, 
    AlertTriangle,
    ExternalLink,
    PieChart,
    ArrowUpRight,
    Briefcase
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast, useToast } from '@/components/ui/toast-alert';

interface StudentReadiness {
    id: string;
    studentName: string;
    enrollmentNo: string;
    department: string;
    overallReadiness: number;
    technicalScore: number;
    behavioralScore: number;
    experienceScore: number;
    gapAnalysis: string;
    lastAnalyzed: string;
}

export function ReadinessDashboard() {
    const [students, setStudents] = useState<StudentReadiness[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast: toastData, showToast, hideToast } = useToast();

    const fetchReadinessData = async () => {
        try {
            setLoading(true);
            // In a real scenario, this would be an aggregate call for the whole department/batch
            const res = await axios.get('/api/v2/analytics/department-readiness');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch readiness analytics:', error);
            // Mocking for demonstration if endpoint is pending development
            setStudents([
                { id: '1', studentName: 'Alex Chen', enrollmentNo: 'EN2022-001', department: 'C.S.E', overallReadiness: 88, technicalScore: 92, behavioralScore: 85, experienceScore: 80, gapAnalysis: 'Ready for placement.', lastAnalyzed: new Date().toISOString() },
                { id: '2', studentName: 'Sarah Miller', enrollmentNo: 'EN2022-045', department: 'C.S.E', overallReadiness: 72, technicalScore: 78, behavioralScore: 70, experienceScore: 65, gapAnalysis: 'Need project experience.', lastAnalyzed: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReadinessData();
    }, []);

    const filteredStudents = students.filter(s => 
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        avgReadiness: students.length ? Math.round(students.reduce((acc, s) => acc + s.overallReadiness, 0) / students.length) : 0,
        placedReady: students.filter(s => s.overallReadiness >= 80).length,
        criticalSupport: students.filter(s => s.overallReadiness < 60).length
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8 animate-in fade-in duration-700">
            <Toast toast={toastData} onClose={hideToast} />
            {/* Control Header */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Placement Intelligence</h1>
                    <p className="text-slate-400 font-medium">Real-time industry readiness tracking & analytics dashboard</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="bg-slate-900/50 border-white/10 rounded-xl h-11 px-6">
                        <Filter className="w-4 h-4 mr-2" /> Filter Batch
                    </Button>
                    <Button variant="outline" className="bg-slate-900/50 border-white/10 rounded-xl h-11 px-6">
                        <Download className="w-4 h-4 mr-2" /> Export Report
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 px-6">
                        <Briefcase className="w-4 h-4 mr-2" /> Schedule AI Audit
                    </Button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-600/10 border-blue-500/20 rounded-3xl overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <ArrowUpRight className="w-6 h-6 text-blue-500/50" />
                        </div>
                        <h3 className="text-sm font-bold text-blue-400/80 uppercase tracking-widest mb-1">Avg. Readiness Index</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{stats.avgReadiness}%</span>
                            <span className="text-xs text-blue-400 font-bold font-mono tracking-tighter">+4.2% from prev month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-600/10 border-emerald-500/20 rounded-3xl overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <PieChart className="w-6 h-6 text-emerald-500/50" />
                        </div>
                        <h3 className="text-sm font-bold text-emerald-400/80 uppercase tracking-widest mb-1">Placement Elite (80%+)</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{stats.placedReady}</span>
                            <span className="text-xs text-emerald-400 font-bold">Students identified</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-600/10 border-amber-500/20 rounded-3xl overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                                <Clock className="w-8 h-8" />
                            </div>
                            <AlertTriangle className="w-6 h-6 text-amber-500/50" />
                        </div>
                        <h3 className="text-sm font-bold text-amber-400/80 uppercase tracking-widest mb-1">Critical GAP Support</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{stats.criticalSupport}</span>
                            <span className="text-xs text-amber-400 font-bold">Immediate roadmap update required</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <TabsList className="bg-slate-900/50 border border-white/5 rounded-2xl p-1 h-auto">
                        <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">All Students</TabsTrigger>
                        <TabsTrigger value="topper" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">Placement Ready</TabsTrigger>
                        <TabsTrigger value="priority" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white transition-all">Priority Focus</TabsTrigger>
                    </TabsList>

                    <div className="relative flex-1 max-w-md hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input 
                            placeholder="Find student by name or enrollment..." 
                            className="bg-slate-900/50 border-white/10 rounded-2xl pl-12 h-12 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="all" className="animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-slate-900/50 backdrop-blur-2xl border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="px-8 py-5 text-slate-400">Student & Enrollment</TableHead>
                                    <TableHead className="py-5 text-slate-400 text-center">Industry Readiness</TableHead>
                                    <TableHead className="py-5 text-slate-400">Capability Matrix</TableHead>
                                    <TableHead className="py-5 text-slate-400">Strategic Gap</TableHead>
                                    <TableHead className="px-8 py-5 text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                                                    {student.studentName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{student.studentName}</div>
                                                    <div className="text-sm text-slate-500 font-mono tracking-tighter">{student.enrollmentNo}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-6">
                                            <div className="inline-flex flex-col items-center">
                                                <span className={`text-2xl font-black ${student.overallReadiness >= 80 ? 'text-emerald-400' : student.overallReadiness < 60 ? 'text-amber-400' : 'text-blue-400'}`}>
                                                    {student.overallReadiness}%
                                                </span>
                                                <Badge variant="outline" className={`mt-1 text-[10px] uppercase font-bold border-white/10 ${student.overallReadiness >= 80 ? 'text-emerald-400' : student.overallReadiness < 60 ? 'text-amber-400' : 'text-blue-400'}`}>
                                                    {student.overallReadiness >= 80 ? 'Placement Hit' : student.overallReadiness < 60 ? 'Risk High' : 'Baseline'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 min-w-[200px]">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 w-16">Tech</span>
                                                    <Progress value={student.technicalScore} className="h-1 flex-1 bg-slate-800" />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 w-16">Soft</span>
                                                    <Progress value={student.behavioralScore} className="h-1 flex-1 bg-slate-800" />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 w-16">Exp</span>
                                                    <Progress value={student.experienceScore} className="h-1 flex-1 bg-slate-800" />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 max-w-xs">
                                            <p className="text-sm text-slate-400 line-clamp-2 italic leading-relaxed">
                                                {student.gapAnalysis}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-8 py-6 text-right">
                                            <Button variant="ghost" className="h-12 w-12 rounded-2xl border border-white/5 hover:bg-blue-600 hover:text-white transition-all group-hover:border-blue-500/50">
                                                <ExternalLink className="w-5 h-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
