'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { STUDENT_NAV, UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Toast, useToast } from '@/components/ui/toast-alert';
import { 
    LuNetwork, LuUserCheck, LuSearch, LuMessageSquare, LuStar, LuMapPin, 
    LuBuilding2, LuGraduationCap, LuClock, LuSparkles, LuLoader, LuBriefcase 
} from 'react-icons/lu';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useStudentData } from '@/lib/hooks/use-student-data';

export default function NetworkingHub() {
    const { user } = useAuthStore();
    const isStudentView = user?.role === 'STUDENT';
    const { profile: studentProfile } = useStudentData();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [directory, setDirectory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    // Search/Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('recommendations');

    const fetchRecommendations = useCallback(async () => {
        if (!isStudentView || !studentProfile?.id) {
            setRecommendations([]);
            return;
        }
        try {
            const res = await api.get(`/v2/alumni/recommendations?studentId=${studentProfile.id}`);
            setRecommendations(res.data.matches || []);
        } catch (error) {
            console.error('Failed to fetch recommendations', error);
        }
    }, [isStudentView, studentProfile?.id]);

    const fetchDirectory = useCallback(async () => {
        try {
            const res = await api.get('/v2/alumni/search');
            setDirectory(res.data || []);
        } catch (error) {
            console.error('Failed to fetch directory', error);
        }
    }, []);

    const init = useCallback(async () => {
        setLoading(true);
        await Promise.all([
            fetchDirectory(),
            fetchRecommendations(),
        ]);
        setLoading(false);
    }, [fetchDirectory, fetchRecommendations]);

    useEffect(() => {
        if (!user) return;
        if (isStudentView && !studentProfile) return;
        init();
    }, [init, isStudentView, studentProfile, user]);

    useEffect(() => {
        if (!isStudentView && activeTab === 'recommendations') {
            setActiveTab('directory');
        }
    }, [activeTab, isStudentView]);

    const navItems = useMemo(
        () => (isStudentView ? STUDENT_NAV : UNI_ADMIN_NAV),
        [isStudentView]
    );

    const pageTitle = isStudentView ? 'AI Networking Hub' : 'Alumni Networking';

    const handleConnect = async (alumnusId: string, alumnusUserId: string) => {
        try {
            await api.post('/v2/alumni/connect', {
                senderId: user?.id,
                receiverUserId: alumnusUserId,
                message: `Hi, I'm a student at your alma mater and would love to connect for career guidance!`
            });
            showToast('success', 'Connection request sent!');
        } catch (error: any) {
            showToast('error', error.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['STUDENT', 'UNI_ADMIN', 'COLLEGE_ADMIN']}>
            <DashboardLayout navItems={navItems} title={pageTitle}>
                <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-text-primary tracking-tight flex items-center gap-3">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
                                    <LuNetwork className="w-8 h-8" />
                                </div>
                                Networking Hub
                            </h1>
                            <p className="text-text-secondary mt-2 font-medium flex items-center gap-2">
                                <LuSparkles className="w-4 h-4 text-amber-500" />
                                AI-powered alumni matching and career networking.
                            </p>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-surface-secondary border border-border-subtle p-1 rounded-xl h-12">
                            {isStudentView ? (
                                <TabsTrigger value="recommendations" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                                    <LuSparkles className="w-4 h-4 mr-2" /> AI Matches
                                </TabsTrigger>
                            ) : null}
                            <TabsTrigger value="directory" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                                <LuSearch className="w-4 h-4 mr-2" /> Alumni Directory
                            </TabsTrigger>
                            <TabsTrigger value="requests" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                                <LuClock className="w-4 h-4 mr-2" /> Requests
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="recommendations" className="space-y-6 outline-none">
                            {loading ? (
                                <div className="p-20 text-center text-text-muted flex flex-col items-center gap-4">
                                    <LuLoader className="w-10 h-10 animate-spin text-indigo-600" />
                                    <p className="font-bold">Analyzing your profile to find perfect matches...</p>
                                </div>
                            ) : recommendations.length === 0 ? (
                                <Card className="border-dashed border-2 border-border p-12 text-center bg-surface-secondary/30">
                                    <LuUserCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-text-primary">No Recommendations Yet</h3>
                                    <p className="text-text-secondary mt-2 max-w-sm mx-auto">
                                        Our AI engine needs more data about your skills and interests to find relevant alumni.
                                    </p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recommendations.map((match: any) => (
                                        <Card key={match.studentId} className="bg-surface border-border shadow-lg hover:shadow-xl hover:border-indigo-500/50 transition-all group rounded-2xl overflow-hidden flex flex-col">
                                            <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                                                <div className="absolute -bottom-10 left-6">
                                                    <div className="w-20 h-20 rounded-2xl bg-surface border-4 border-surface shadow-md flex items-center justify-center text-3xl font-black text-indigo-600">
                                                        {match.name.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 font-black">
                                                        {Math.round(match.matchScore * 100)}% Match
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="pt-12 pb-6 px-6 flex-1 flex flex-col">
                                                <div>
                                                    <h3 className="text-xl font-black text-text-primary group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                        {match.name}
                                                    </h3>
                                                    <p className="text-sm font-bold text-text-secondary mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                                                        <LuBriefcase className="w-3.5 h-3.5" />
                                                        {match.currentRole} at {match.currentCompany}
                                                    </p>
                                                </div>

                                                <div className="mt-6 flex flex-wrap gap-2">
                                                    {match.skills.slice(0, 3).map((skill: string) => (
                                                        <Badge key={skill} variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-none font-bold text-[10px]">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {match.skills.length > 3 && (
                                                        <Badge variant="secondary" className="bg-surface-secondary text-text-muted border-none font-bold text-[10px]">
                                                            +{match.skills.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="mt-6 p-4 bg-surface-secondary rounded-xl text-sm border border-border-subtle italic">
                                                    "{match.reason}"
                                                </div>

                                                <div className="mt-auto pt-6 flex gap-3">
                                                    <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold h-11" onClick={() => handleConnect(match.studentId, match.userId)}>
                                                        Connect
                                                    </Button>
                                                    <Button variant="outline" size="icon" className="h-11 w-11 border-border-subtle hover:bg-surface-secondary">
                                                        <LuMessageSquare className="w-5 h-5 text-indigo-600" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="directory" className="space-y-6 outline-none">
                            <Card className="bg-surface border-border shadow-md rounded-2xl overflow-hidden">
                                <CardHeader className="bg-surface-secondary/50 border-b border-border-subtle p-6">
                                    <div className="relative">
                                        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                        <Input 
                                            className="pl-12 bg-surface-primary border-border h-12 text-base font-medium rounded-xl"
                                            placeholder="Search by company, role, or skill..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border-subtle">
                                        {directory.filter(a => 
                                            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            a.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            a.skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
                                        ).map((alumnus: any) => (
                                            <div key={alumnus.id} className="p-6 hover:bg-surface-hover/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl font-black text-indigo-600 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {alumnus.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-text-primary group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                            {alumnus.name}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold uppercase tracking-wider">
                                                                <LuBuilding2 className="w-3.5 h-3.5" /> {alumnus.currentCompany || 'N/A'}
                                                            </div>
                                                            <div className="w-1 h-1 bg-text-muted rounded-full" />
                                                            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold uppercase tracking-wider">
                                                                <LuGraduationCap className="w-3.5 h-3.5" /> {alumnus.batch.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 max-w-md">
                                                    {alumnus.skills.slice(0, 4).map((skill: string) => (
                                                        <Badge key={skill} className="bg-surface-secondary text-text-primary border-border-subtle font-bold text-[10px]">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                <Button 
                                                    className="bg-surface-primary hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-500/20 font-black h-10 px-6"
                                                    onClick={() => handleConnect(alumnus.id, alumnus.userId)}
                                                >
                                                    Connect
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="requests" className="outline-none">
                            <Card className="border-none shadow-none bg-transparent">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-surface border-border shadow-md rounded-2xl overflow-hidden">
                                        <CardHeader className="bg-surface-secondary/50 border-b border-border-subtle p-6">
                                            <CardTitle className="text-lg font-black text-text-primary flex items-center gap-2 uppercase tracking-tight">
                                                <LuClock className="w-5 h-5 text-amber-500" /> Pending Outgoing
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 text-center text-text-muted italic py-12">
                                            No pending outgoing requests.
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-surface border-border shadow-md rounded-2xl overflow-hidden">
                                        <CardHeader className="bg-surface-secondary/50 border-b border-border-subtle p-6">
                                            <CardTitle className="text-lg font-black text-text-primary flex items-center gap-2 uppercase tracking-tight">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Incoming Requests
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 text-center text-text-muted italic py-12">
                                            No incoming requests.
                                        </CardContent>
                                    </Card>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </div>
                <Toast toast={toast} onClose={hideToast} />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
