'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
    AlertTriangle, 
    ShieldCheck, 
    TrendingUp, 
    Users, 
    Wallet, 
    ChevronRight,
    Search,
    Filter,
    FileText,
    Shield,
    Info
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-alert';
import { ComplianceChecklist } from './compliance-checklist';
import { api } from '@/lib/api';

interface RiskProfile {
    departmentId: string;
    departmentName: string;
    dri: number;
    riskLevel: 'SAFE' | 'ELEVATED' | 'CRITICAL';
    factors: {
        academicRisk: number;
        budgetVariance: number;
        facultyRatio: number;
        complianceScore: number;
    };
    topIssues: string[];
}

interface RiskMapData {
    timestamp: string;
    totalDepartments: number;
    criticalDepartments: number;
    elevatedDepartments: number;
    profiles: RiskProfile[];
}

export const DepartmentRiskMap = () => {
  const { toast, showToast, hideToast } = useToast();
    const [data, setData] = useState<RiskMapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [showCompliance, setShowCompliance] = useState(false);

    useEffect(() => {
        fetchRiskMap();
    }, []);

    const fetchRiskMap = async () => {
        try {
            setLoading(true);
            const response = await api.get('/v2/analytics/admin/department-risk-map');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch risk map:', error);
            showToast('error', 'Failed to load institutional risk data.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-400 border-red-500/50 bg-red-500/10';
            case 'ELEVATED': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
            default: return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Analyzing institutional data...</div>;

    return (
        <div className="space-y-6">
            {/* Header Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Departments</p>
                                <p className="text-2xl font-bold text-white">{data?.totalDepartments || 0}</p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Critical Risk</p>
                                <p className="text-2xl font-bold text-red-400">{data?.criticalDepartments || 0}</p>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Elevated Risk</p>
                                <p className="text-2xl font-bold text-amber-400">{data?.elevatedDepartments || 0}</p>
                            </div>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">System Compliance</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {((data?.profiles || []).reduce((acc, p) => acc + p.factors.complianceScore, 0) / (data?.profiles?.length || 1)).toFixed(0)}%
                                </p>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {(data?.profiles || []).map((profile) => (
                    <Card key={profile.departmentId} className="bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-all backdrop-blur-md group overflow-hidden">
                        <div className={`h-1 w-full ${profile.riskLevel === 'CRITICAL' ? 'bg-red-500' : profile.riskLevel === 'ELEVATED' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                                        {profile.departmentName}
                                    </CardTitle>
                                    <CardDescription>DRI: {profile.dri.toFixed(1)} / 100</CardDescription>
                                </div>
                                <Badge variant="outline" className={getRiskColor(profile.riskLevel)}>
                                    {profile.riskLevel}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-400">
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Academic</span>
                                        <span className="text-white">{profile.factors.academicRisk.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={profile.factors.academicRisk} className="h-1 bg-slate-800" indicatorClassName="bg-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Budget</span>
                                        <span className="text-white">{profile.factors.budgetVariance.toFixed(0)}%</span>
                                    </div>
                                    <Progress value={profile.factors.budgetVariance} className="h-1 bg-slate-800" indicatorClassName="bg-amber-500" />
                                </div>
                            </div>

                            {profile.topIssues.length > 0 && (
                                <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                    <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Critical Drivers</p>
                                    <ul className="space-y-1">
                                        {profile.topIssues.map((issue, i) => (
                                            <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-red-500" />
                                                {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-xs h-8"
                                    onClick={() => {
                                        setSelectedDept(profile.departmentId);
                                        setShowCompliance(true);
                                    }}
                                >
                                    <FileText className="w-3 h-3 mr-2" />
                                    Audit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs h-8 uppercase font-bold tracking-wider"
                                    onClick={() => showToast('info', `Generating AI-driven improvement strategy for ${profile.departmentName}...`)}
                                >
                                    Optimize
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedDept && (
                <ComplianceChecklist 
                    departmentId={selectedDept} 
                    open={showCompliance} 
                    onClose={() => {
                        setShowCompliance(false);
                        setSelectedDept(null);
                    }} 
                />
            )}
        </div>
    );
};
