'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { 
    CheckCircle2, 
    Circle, 
    BookOpen, 
    Users, 
    MessageSquare, 
    ChevronRight,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Intervention {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    type: 'TUTORIAL' | 'COUNSELING' | 'RESOURCE';
    createdAt: string;
}

interface InterventionHubProps {
    interventions: Intervention[];
    onUpdate?: () => void;
}

export function InterventionHub({ interventions, onUpdate }: InterventionHubProps) {
    const [updating, setUpdating] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, currentStatus: string) => {
        setUpdating(id);
        try {
            const nextStatus = currentStatus === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
            await api.patch(`/analytics/intervention/${id}`, { status: nextStatus });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Intervention update failed:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'TUTORIAL': return <Users className="w-4 h-4" />;
            case 'COUNSELING': return <MessageSquare className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence mode="popLayout">
                {interventions.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className={cn(
                            "group relative overflow-hidden transition-all duration-300 border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/20",
                            item.status === 'COMPLETED' ? "opacity-60 grayscale-[0.5]" : "hover:shadow-2xl hover:border-indigo-500/20"
                        )}>
                            <div className="p-5 flex items-start gap-5">
                                {/* Type Icon Hub */}
                                <div className={cn(
                                    "p-3 rounded-2xl transition-colors",
                                    item.status === 'COMPLETED' ? "bg-slate-100 text-slate-400" : "bg-indigo-500/10 text-indigo-500"
                                )}>
                                    {getTypeIcon(item.type)}
                                </div>

                                <div className="flex-grow space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                            {item.title}
                                            {item.status === 'PENDING' && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                            )}
                                        </h4>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Dynamic Action Hub */}
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => handleStatusUpdate(item.id, item.status)}
                                        disabled={updating === item.id || item.status === 'COMPLETED'}
                                        size="sm"
                                        variant="ghost"
                                        className={cn(
                                            "h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                                            item.status === 'COMPLETED' 
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                                : "bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-400/50"
                                        )}
                                    >
                                        {updating === item.id ? (
                                            <Zap className="w-3 h-3 animate-spin text-indigo-400" />
                                        ) : item.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-3 h-3" />
                                        ) : (
                                            <Circle className="w-3 h-3" />
                                        )}
                                        <span className="ml-2">
                                            {item.status === 'COMPLETED' ? 'Resolved' : item.status === 'IN_PROGRESS' ? 'Finalize' : 'Acknowledge'}
                                        </span>
                                        {item.status !== 'COMPLETED' && <ChevronRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Status Bottom Bar */}
                            <div className={cn(
                                "h-1 w-full",
                                item.status === 'COMPLETED' ? "bg-emerald-500/30" : item.status === 'IN_PROGRESS' ? "bg-indigo-500/30" : "bg-slate-200 dark:bg-white/5"
                            )} />
                        </Card>
                    </motion.div>
                ))}
                
                {interventions.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                        <ShieldCheck className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            No active interventions required<br/>
                            <span className="text-[10px] italic font-medium opacity-60 italic">Your academic health is within safe parameters</span>
                        </h4>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
