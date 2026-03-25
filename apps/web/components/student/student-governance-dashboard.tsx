'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LuVote, LuTrophy, LuSignature, LuClock, LuCircleCheck, LuShield, LuLightbulb, LuPlus } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useToast, Toast } from '@/components/ui/toast-alert';

interface Poll {
    id: string;
    question: string;
    endTime: string;
    hasVoted: boolean;
}

interface Contest {
    id: string;
    name: string;
    prizePool: string;
    status: string;
}

export function StudentGovernanceDashboard() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        // Mocking for now as we don't have listing endpoints yet
        setPolls([
            { id: 'poll-1', question: 'Should we extend the library hours to 24/7 during finals?', endTime: new Date(Date.now() + 86400000).toISOString(), hasVoted: false },
            { id: 'poll-2', question: 'Preferred guest speaker for the Tech Summit 2026?', endTime: new Date(Date.now() + 172800000).toISOString(), hasVoted: true }
        ]);
        setContests([
            { id: 'contest-1', name: 'Digital Art Challenge', prizePool: '0.5 ETH', status: 'OPEN' },
            { id: 'contest-2', name: 'Smart Campus Hackathon', prizePool: '2.0 ETH', status: 'JUDGING' }
        ]);
        setLoading(false);
    }, []);

    const handleVote = async (pollId: string, optionIndex: number) => {
        try {
            await api.post('/v2/blockchain/governance/polls/vote', { pollId, optionIndex });
            showToast('success', 'Your vote has been recorded on the blockchain!');
            setPolls(polls.map(p => p.id === pollId ? { ...p, hasVoted: true } : p));
        } catch (error) {
            showToast('error', 'Blockchain transaction failed. Ensure your wallet is connected.');
        }
    };

    if (loading) {
        return <Skeleton className="h-[500px] w-full rounded-3xl" />;
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <Tabs defaultValue="voting" className="w-full">
                <TabsList className="bg-surface p-1 h-auto rounded-2xl border border-border mb-8">
                    <TabsTrigger value="voting" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-text-primary transition-all font-bold flex items-center gap-2">
                        <LuVote className="w-4 h-4" /> Active Voting
                    </TabsTrigger>
                    <TabsTrigger value="contests" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-text-primary transition-all font-bold flex items-center gap-2">
                        <LuTrophy className="w-4 h-4" /> Contests & Awards
                    </TabsTrigger>
                    <TabsTrigger value="ip" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-indigo-500 data-[state=active]:text-text-primary transition-all font-bold flex items-center gap-2">
                        <LuLightbulb className="w-4 h-4" /> Intellectual Property
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="voting" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {polls.map((poll) => (
                            <Card key={poll.id} className="p-8 glass-card border-border hover:border-primary/50 transition-all relative overflow-hidden group">
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md", poll.hasVoted ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                                            {poll.hasVoted ? 'Voted' : 'Active Poll'}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-bold">
                                            <LuClock className="w-3.5 h-3.5" />
                                            Exp: {new Date(poll.endTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-text-primary leading-tight">{poll.question}</h4>
                                    
                                    <div className="space-y-3">
                                        <Button 
                                            disabled={poll.hasVoted}
                                            onClick={() => handleVote(poll.id, 1)}
                                            className={cn("w-full h-12 rounded-xl justify-between px-4 font-bold border", poll.hasVoted ? "bg-surface/50 border-border text-text-muted" : "bg-surface hover:bg-primary/10 border-border/50 text-text-primary hover:border-primary/50")}
                                        >
                                            Option A: Yes, Absolutely
                                            {poll.hasVoted && <LuCircleCheck className="w-4 h-4 text-emerald-500" />}
                                        </Button>
                                        <Button 
                                            disabled={poll.hasVoted}
                                            onClick={() => handleVote(poll.id, 2)}
                                            className={cn("w-full h-12 rounded-xl justify-between px-4 font-bold border", poll.hasVoted ? "bg-surface/50 border-border text-text-muted" : "bg-surface hover:bg-primary/10 border-border/50 text-text-primary hover:border-primary/50")}
                                        >
                                            Option B: No, Keep as is
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
                                        <LuShield className="w-3.5 h-3.5 text-emerald-500" />
                                        Blockchain Verified Voting
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="contests" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contests.map((contest) => (
                            <Card key={contest.id} className="p-6 glass-card border-border hover:border-amber-500/30 transition-all group">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                            <LuTrophy className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{contest.status}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary">{contest.name}</h4>
                                        <p className="text-sm text-text-secondary mt-1">Prize Pool: <span className="text-text-primary font-black">{contest.prizePool}</span></p>
                                    </div>
                                    <Button className="w-full bg-surface border border-border group-hover:border-amber-500/50 group-hover:bg-amber-500/10 text-text-primary font-bold py-3 rounded-xl transition-all">
                                        View Contest Details
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="ip" className="space-y-8">
                    <div className="max-w-2xl">
                        <h3 className="text-2xl font-black text-text-primary tracking-tight mb-2">Protect Your Ideas</h3>
                        <p className="text-text-secondary font-medium">Register your research papers, patents, or creative work on the blockchain to prove timestamped ownership globally.</p>
                        
                        <Card className="p-8 mt-8 glass-card border-dashed border-2 border-border bg-surface/30 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-500/50 transition-all cursor-pointer group">
                             <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                                <LuSignature className="w-8 h-8" />
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-text-primary">Register New IP</h4>
                                <p className="text-sm text-text-muted max-w-xs mt-1">Upload your work hash to secure a permanent, immutable record of ownership.</p>
                             </div>
                             <Button className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-text-primary font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-2xl">
                                <LuPlus className="w-4 h-4 mr-2" /> Start Registration
                             </Button>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Toast toast={toast} onClose={hideToast} />
        </div>
    );
}
