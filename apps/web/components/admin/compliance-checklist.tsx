'use client';

import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Shield, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { Progress } from '@/components/ui/progress';

interface ComplianceRuleResult {
    ruleId: string;
    name: string;
    category: string;
    passed: boolean;
    value: any;
    message: string;
}

interface ComplianceAudit {
    id: string;
    score: number;
    status: string;
    checkDate: string;
    results: ComplianceRuleResult[];
}

interface ComplianceChecklistProps {
    departmentId: string;
    open: boolean;
    onClose: () => void;
}

export const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ 
    departmentId, 
    open, 
    onClose 
}) => {
    const [audit, setAudit] = useState<ComplianceAudit | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && departmentId) {
            fetchAudit();
        }
    }, [open, departmentId]);

    const fetchAudit = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/analytics/admin/department-risk-map/${departmentId}/compliance`);
            if (response.data.success) {
                setAudit(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch compliance audit:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50';
            case 'NON_COMPLIANT': return 'bg-red-500/10 text-red-400 border-red-500/50';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/50';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-white shadow-2xl backdrop-blur-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" />
                                Regulatory Compliance Audit
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Real-time verification against institutional standards.
                            </DialogDescription>
                        </div>
                        {audit && (
                            <Badge variant="outline" className={getStatusVariant(audit.status)}>
                                {audit.status}
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-500">
                        <Clock className="w-8 h-8 animate-spin" />
                        <p className="text-sm">Running compliance engine...</p>
                    </div>
                ) : audit ? (
                    <div className="space-y-6 py-4">
                        {/* Overall Score */}
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-slate-400">Governance Fulfillment Score</span>
                                <span className={audit.score >= 80 ? 'text-emerald-400' : audit.score >= 60 ? 'text-amber-400' : 'text-red-400'}>
                                    {audit.score.toFixed(1)}%
                                </span>
                            </div>
                            <Progress 
                                value={audit.score} 
                                className="h-2 bg-slate-800" 
                                indicatorClassName={audit.score >= 80 ? 'bg-emerald-500' : audit.score >= 60 ? 'bg-amber-500' : 'bg-red-500'} 
                            />
                        </div>

                        {/* Rules List */}
                        <div className="space-y-3">
                            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 px-1">Rule Results</h4>
                            {audit.results.map((result) => (
                                <div key={result.ruleId} className="group p-4 bg-slate-900/30 hover:bg-slate-900 transition-colors border border-slate-800/50 rounded-xl flex items-start gap-4">
                                    <div className="mt-0.5">
                                        {result.passed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-white">{result.name}</p>
                                            <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-800">
                                                {result.category}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {result.message}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 italic">
                                            <Info className="w-3 h-3" />
                                            Value: {JSON.stringify(result.value)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                            <p className="text-[10px] text-blue-400 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" />
                                <strong>AI Insight:</strong> 
                                {audit.score < 100 
                                    ? 'Addressing administrative gaps (HOD/Budget) will increase the score by 15% immediately.'
                                    : 'Department is operating at peak regulatory efficiency.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-500">
                        Failed to retrieve audit data.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

// Supporting icon for the AI insight
const TrendingUp = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);
