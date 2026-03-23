'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';
import {
    LuSearch,
    LuSend,
    LuSettings,
    LuUser,
    LuMessageSquare,
    LuCheck,
    LuCheckCheck,
    LuPlus,
    LuCircleDot
} from 'react-icons/lu';
import { format } from 'date-fns';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    type: string;
    sender: {
        id: string;
        username: string;
        role: string;
    };
}

interface Participant {
    id: string;
    username: string;
    role: string;
    faculty?: { name: string; photoUrl: string | null };
    university?: { name: string; logo: string | null };
    student?: { name: string };
}

interface Thread {
    id: string;
    title: string | null;
    type: string;
    updatedAt: string;
    participants: Participant[];
    messages: Message[];
}

export function MessagesDashboard({ role = 'STUDENT' }: { role?: string }) {
    const { user } = useAuthStore();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<Thread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchThreads();
    }, []);

    useEffect(() => {
        if (activeThread) {
            fetchMessages(activeThread.id);
        }
    }, [activeThread]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchThreads = async () => {
        try {
            const apiPath = role === 'FACULTY' ? '/faculty/messages/threads' : '/v2/student/messages/threads';
            const res = await api.get(apiPath);
            setThreads(res.data);
            if (res.data.length > 0 && !activeThread) {
                setActiveThread(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch threads', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (threadId: string) => {
        try {
            const apiPath = role === 'FACULTY'
                ? `/faculty/messages/threads/${threadId}/messages`
                : `/v2/student/messages/threads/${threadId}/messages`;
            const res = await api.get(apiPath);
            setMessages(res.data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !activeThread || sending) return;

        setSending(true);
        try {
            const apiPath = role === 'FACULTY' ? '/faculty/messages/send' : '/v2/student/messages/send';
            const res = await api.post(apiPath, {
                threadId: activeThread.id,
                content: inputMessage,
                type: 'TEXT'
            });
            setMessages(prev => [...prev, res.data]);
            setInputMessage('');

            // Update thread list with last message
            setThreads(prev => prev.map(t => {
                if (t.id === activeThread.id) {
                    return { ...t, messages: [res.data], updatedAt: new Date().toISOString() };
                }
                return t;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setSending(false);
        }
    };

    const getOtherParticipant = (thread: Thread) => {
        return thread.participants.find(p => p.id !== user?.id);
    };

    const getDisplayName = (thread: Thread) => {
        if (thread.title) return thread.title;
        const other = getOtherParticipant(thread);
        if (other?.faculty) return other.faculty.name;
        if (other?.university) return other.university.name;
        if (other?.student) return other.student.name;
        return other?.username || 'Unknown User';
    };

    const getAvatarText = (thread: Thread) => {
        return getDisplayName(thread).charAt(0).toUpperCase();
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 animate-fade-in">
            {/* Thread List Sidebar */}
            <Card className="w-80 glass-card border-border flex flex-col overflow-hidden">
                <div className="p-6 border-b border-border bg-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-white tracking-tighter">Messages</h2>
                        <Button size="icon" variant="ghost" className="rounded-xl hover:bg-surface-hover text-primary">
                            <LuPlus className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="relative">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                            placeholder="Search chats..."
                            className="pl-10 bg-surface border-border rounded-xl text-sm h-10"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse mx-2" />
                        ))
                    ) : threads.length > 0 ? (
                        threads.map(thread => (
                            <div
                                key={thread.id}
                                onClick={() => setActiveThread(thread)}
                                className={cn(
                                    "p-4 rounded-2xl cursor-pointer transition-all flex gap-3 group",
                                    activeThread?.id === thread.id
                                        ? "bg-primary/20 border border-primary/20 shadow-glow"
                                        : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-lg font-black text-primary shrink-0 relative">
                                    {getAvatarText(thread)}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface border-2 border-background flex items-center justify-center">
                                        <LuCircleDot className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className="text-sm font-bold text-white truncate">{getDisplayName(thread)}</h3>
                                        <span className="text-[10px] text-text-muted font-bold">
                                            {format(new Date(thread.updatedAt), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-text-secondary truncate font-medium">
                                        {thread.messages[0]?.content || 'No messages yet...'}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center">
                            <LuMessageSquare className="w-8 h-8 text-text-muted mx-auto mb-3" />
                            <p className="text-xs text-text-muted font-bold">No threads found</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 glass-card border-border flex flex-col overflow-hidden relative">
                {activeThread ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-sm font-black text-primary">
                                    {getAvatarText(activeThread)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white leading-tight">{getDisplayName(activeThread)}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online</p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-surface-hover text-text-muted">
                                <LuSettings className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-surface/30"
                        >
                            {messages.map((msg, i) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "max-w-[70%] p-4 rounded-3xl text-sm relative group",
                                            isMe
                                                ? "bg-primary text-white rounded-tr-none shadow-glow"
                                                : "bg-surface border border-border text-slate-200 rounded-tl-none"
                                        )}>
                                            <p className="font-medium leading-relaxed">{msg.content}</p>
                                            <div className={cn(
                                                "flex items-center gap-1 mt-2 text-[10px]",
                                                isMe ? "text-white/70" : "text-text-muted"
                                            )}>
                                                {format(new Date(msg.createdAt), 'HH:mm')}
                                                {isMe && <LuCheckCheck className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white/5 border-t border-border">
                            <form onSubmit={handleSendMessage} className="relative flex items-center">
                                <Input
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="pr-16 h-14 bg-surface border-border rounded-2xl text-sm focus:ring-primary shadow-inner"
                                    disabled={sending}
                                />
                                <Button
                                    type="submit"
                                    disabled={!inputMessage.trim() || sending}
                                    className="absolute right-2 h-10 w-10 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-glow"
                                >
                                    {sending ? <LuCircleDot className="w-5 h-5 animate-spin" /> : <LuSend className="w-5 h-5" />}
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                        <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <LuMessageSquare className="w-16 h-16 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Select a Thread</h2>
                        <p className="text-sm text-text-muted font-bold max-w-sm">Choose a conversation from the sidebar to start messaging with university staff or peers.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
