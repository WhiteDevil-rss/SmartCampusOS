'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { 
    Users, 
    UserPlus, 
    BookOpen, 
    FileText, 
    Sparkles, 
    Plus,
    ChevronRight,
    MessageSquare,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function StudyHub() {
    const [mentors, setMentors] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHubData = useCallback(async () => {
        setLoading(true);
        try {
            const [mentorRes, groupRes] = await Promise.all([
                api.get('/v2/collaboration/mentor/suggested'),
                api.get('/v2/collaboration/groups/available')
            ]);
            setMentors(mentorRes.data);
            setGroups(groupRes.data);
        } catch (error) {
            console.error('Failed to fetch Study Hub data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHubData();
    }, [fetchHubData]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[400px] w-full rounded-[2.5rem] bg-white/5" />
                <Skeleton className="h-[400px] w-full rounded-[2.5rem] bg-white/5" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-100 flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-500" />
                        Collaborative Learning Hub
                    </h2>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mt-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        AI-Optimized Peer Synergies
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <IndustrialButton variant="outline" size="sm" className="rounded-xl h-10 px-4 uppercase tracking-widest text-[9px] font-black">
                        <Plus className="w-3 h-3 mr-2" /> Start Study Group
                    </IndustrialButton>
                    <IndustrialButton className="rounded-xl h-10 px-4 uppercase tracking-widest text-[9px] font-black glow-button">
                        <UserPlus className="w-3 h-3 mr-2" /> Become a Mentor
                    </IndustrialButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Mentor Suggestions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 italic flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            AI Suggested Mentors
                        </h3>
                        <IndustrialButton variant="ghost" size="sm" className="text-[9px] uppercase font-black tracking-widest opacity-50 hover:opacity-100">
                            View All <ChevronRight className="w-3 h-3 ml-1" />
                        </IndustrialButton>
                    </div>

                    <div className="space-y-4">
                        {mentors.length > 0 ? mentors.map((mentor, i) => (
                            <motion.div
                                key={mentor.mentorProfileId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <GlassCard className="p-6 border-white/5 hover:border-amber-500/30 group cursor-pointer transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] pointer-events-none group-hover:bg-amber-500/10 transition-all" />
                                    
                                    <div className="flex items-center gap-5 relative z-10">
                                        <Avatar className="w-14 h-14 rounded-2xl border-2 border-white/10 group-hover:border-amber-500/40 transition-all duration-300">
                                            <AvatarFallback className="bg-amber-500/20 text-amber-500 font-black">
                                                {mentor.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-lg font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                                                    {mentor.name}
                                                </h4>
                                                <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-500 text-[8px] uppercase font-black tracking-tighter">
                                                    Expert Match
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed line-clamp-1 italic">
                                                "{mentor.reason}"
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                {mentor.expertiseOverlap.map((exp: string) => (
                                                    <span key={exp} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                        {exp}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <IndustrialButton variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 border border-white/5 group-hover:border-amber-500/30">
                                            <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                                        </IndustrialButton>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )) : (
                            <div className="py-20 text-center rounded-[2.5rem] bg-white/2 border border-dashed border-white/5">
                                <Search className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                                <p className="text-[10px] font-black font-space-grotesk uppercase tracking-tighter text-slate-600">No AI matches found for current risk profile</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Study Groups */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 italic flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                            Active Study Cells
                        </h3>
                        <IndustrialButton variant="ghost" size="sm" className="text-[9px] uppercase font-black tracking-widest opacity-50 hover:opacity-100">
                            Browse All <ChevronRight className="w-3 h-3 ml-1" />
                        </IndustrialButton>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {groups.length > 0 ? groups.map((group, i) => (
                            <motion.div
                                key={group.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <GlassCard className="p-5 border-white/5 hover:border-indigo-500/30 group cursor-pointer transition-all duration-300">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                <Users className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-slate-200 group-hover:text-indigo-400 transition-colors">
                                                    {group.title}
                                                </h4>
                                                <p className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-1">
                                                    {group.description || `Subject-focused collaboration for ${group.subject || 'All'}`}
                                                </p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {group._count.members} Members
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> {group._count.resources} Resources
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <IndustrialButton variant="outline" size="sm" className="rounded-xl h-8 px-4 opacity-0 group-hover:opacity-100 transition-all uppercase font-black tracking-widest text-[8px]">
                                            Join Cell
                                        </IndustrialButton>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )) : (
                            <div className="py-20 text-center rounded-[2.5rem] bg-white/2 border border-dashed border-white/5">
                                <p className="text-[10px] font-black font-space-grotesk uppercase tracking-tighter text-slate-600 italic">Initiate the first cell in this department</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
