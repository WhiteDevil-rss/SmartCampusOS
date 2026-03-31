'use client';

import { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, 
    AlertCircle, 
    Sparkles, 
    ShieldAlert,
    CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface BulkInterventionModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentIds: string[];
    riskLevel: string;
    courseName: string;
}

const TEMPLATES = [
    {
        id: 'academic_support',
        title: 'Academic Support Session',
        description: 'Mandatory remedial session to bridge knowledge gaps identified by the Class Sentinel.',
        type: 'ACADEMIC',
        icon: Sparkles
    },
    {
        id: 'attendance_warning',
        title: 'Attendance Regularization',
        description: 'Formal notification regarding declining attendance patterns and associated academic risk.',
        type: 'ATTENDANCE',
        icon: ShieldAlert
    },
    {
        id: 'engagement_boost',
        title: 'Peer Mentorship Match',
        description: 'Enrolling in the high-engagement peer mentorship program to stabilize academic performance.',
        type: 'ENGAGEMENT',
        icon: Zap
    }
];

export function BulkInterventionModal({ 
    isOpen, 
    onClose, 
    studentIds, 
    riskLevel,
    courseName 
}: BulkInterventionModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
    const [isDispatching, setIsDispatching] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleDispatch = async () => {
        setIsDispatching(true);
        try {
            await api.post('/v2/analytics/faculty/bulk-intervention', {
                studentIds,
                title: selectedTemplate.title,
                description: selectedTemplate.description,
                type: selectedTemplate.type
            });
            showToast('success', `Dispatched ${studentIds.length} interventions successfully.`);
            setTimeout(onClose, 1500);
        } catch (error) {
            console.error('Failed to dispatch interventions:', error);
            showToast('error', 'Failed to dispatch interventions.');
        } finally {
            setIsDispatching(false);
        }
    };

    return (
        <>
            <Toast toast={toast} onClose={hideToast} />
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl bg-slate-950/90 border-white/10 backdrop-blur-2xl rounded-[2rem] p-0 overflow-hidden outline-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
                    
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-100">
                                        Segment Support Dispatch
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                                        Targeting {studentIds.length} Students • {courseName}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Risk Segment Summary */}
                        <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-rose-500/20 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Segment</p>
                                    <p className="text-sm font-bold text-slate-200">{riskLevel} Risk Cadets</p>
                                </div>
                            </div>
                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-black px-4 py-1">
                                {studentIds.length} IMPACTED
                            </Badge>
                        </div>

                        {/* Template selection */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pedagogical Prescriptions</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {TEMPLATES.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group",
                                            selectedTemplate.id === template.id 
                                                ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                                                : "bg-white/5 border-white/5 hover:border-white/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            selectedTemplate.id === template.id ? "bg-primary text-white" : "bg-white/5 text-slate-400 group-hover:text-slate-200"
                                        )}>
                                            <template.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black uppercase tracking-tighter text-slate-200">
                                                    {template.title}
                                                </span>
                                                {selectedTemplate.id === template.id && (
                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                )}
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-1">
                                                {template.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-white/2 p-6 border-t border-white/5 sm:justify-between items-center gap-4">
                        <p className="text-[9px] font-medium text-slate-500 max-w-[250px] text-left">
                            Dispatched interventions will appear as active tasks in the Student Sentinel interface for the targeted segment.
                        </p>
                        <div className="flex gap-3">
                            <IndustrialButton 
                                variant="ghost" 
                                onClick={onClose}
                                className="px-6"
                            >
                                Abort
                            </IndustrialButton>
                            <IndustrialButton 
                                onClick={handleDispatch}
                                isLoading={isDispatching}
                                className="px-8 rounded-xl bg-primary hover:bg-primary/90 text-white min-w-[160px]"
                            >
                                Dispatch Support <Zap className="ml-2 w-3 h-3" />
                            </IndustrialButton>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
