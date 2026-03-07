'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { STUDENT_NAV } from '@/lib/constants/nav-config';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    LuBot, LuSend, LuUser, LuLoader, LuSparkles
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    sender: { role: string; username?: string };
    createdAt: string;
}

export default function AssistantPage() {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [inputQuery, setInputQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        fetchHistory();
    }, [user]);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/v2/chatbot/history');
            if (res.data.threadId) {
                setThreadId(res.data.threadId);
                setMessages(res.data.messages || []);
            } else {
                // Initialize with welcome message if empty
                setMessages([{
                    id: 'welcome',
                    content: 'Hello! I am your AI Doubt Assistant. How can I help you with your studies or attendance today?',
                    senderId: 'system',
                    sender: { role: 'SYSTEM_AI' },
                    createdAt: new Date().toISOString()
                }]);
            }
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const q = inputQuery.trim();
        if (!q || loading) return;

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const newMsg: ChatMessage = {
            id: tempId,
            content: q,
            senderId: user?.id || 'me',
            sender: { role: 'STUDENT' },
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMsg]);
        setInputQuery('');
        setLoading(true);

        try {
            const res = await api.post('/v2/chatbot/ask', {
                message: q,
                threadId
            });

            // Re-fetch history to get actual IDs, or just append the AI response
            if (!threadId) setThreadId(res.data.threadId);

            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId);
                return [...filtered, res.data.userMessage, res.data.aiMessage];
            });

        } catch (error) {
            console.error('Chat error', error);
            // Revert on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['STUDENT']}>
            <DashboardLayout navItems={STUDENT_NAV} title="AI Doubt Assistant">
                <div className="h-[calc(100vh-140px)] flex flex-col md:max-w-4xl mx-auto">

                    <div className="mb-4">
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <LuSparkles className="w-6 h-6 text-purple-500" />
                            Academic Assistant
                        </h1>
                        <p className="text-text-secondary dark:text-text-muted text-sm">Ask questions about your syllabus, attendance, or university policies.</p>
                    </div>

                    <Card className="flex-1 flex flex-col overflow-hidden glass-card shadow-md border-indigo-100 dark:border-indigo-500/20">
                        {/* Header */}
                        <div className="bg-indigo-50/80 dark:bg-indigo-900/40 border-b border-indigo-100 dark:border-indigo-500/30 p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                                <LuBot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-indigo-950 dark:text-indigo-100">Zembaa AI</h3>
                                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                                </div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 dark:bg-[#0a0a0c]/50"
                        >
                            {messages.map((msg, i) => {
                                const isAi = msg.sender.role === 'SYSTEM_AI';
                                return (
                                    <div key={msg.id || i} className={cn("flex gap-3 max-w-[85%]", isAi ? "self-start" : "ml-auto flex-row-reverse")}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                            isAi ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                        )}>
                                            {isAi ? <LuBot className="w-5 h-5" /> : <LuUser className="w-5 h-5" />}
                                        </div>
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            isAi
                                                ? "bg-white border border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-border-hover dark:text-slate-200 rounded-tl-none"
                                                : "bg-indigo-600 text-white rounded-tr-none shadow-[0_4px_14px_rgba(79,70,229,0.3)]"
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}

                            {loading && (
                                <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                                        <LuBot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-800 dark:bg-slate-900 dark:border-border-hover dark:text-slate-200 rounded-tl-none flex items-center gap-1.5 h-12">
                                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-75" />
                                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-border-hover">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <Input
                                    value={inputQuery}
                                    onChange={(e) => setInputQuery(e.target.value)}
                                    placeholder="Ask anything about your courses..."
                                    className="pr-12 py-6 rounded-xl border-slate-200 dark:border-border-hover dark:bg-[#0a0a0c] focus-visible:ring-indigo-500 shadow-sm"
                                    disabled={loading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={loading || !inputQuery.trim()}
                                    className="absolute right-1.5 w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
                                >
                                    {loading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSend className="w-4 h-4 ml-0.5" />}
                                </Button>
                            </form>
                            <p className="text-center text-[10px] text-text-muted mt-2 font-medium">
                                AI responses are generated automatically. Always verify critical academic deadlines.
                            </p>
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
