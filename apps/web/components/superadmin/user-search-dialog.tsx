'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LuSearch, LuUser, LuMail, LuCheck, LuLoader } from 'react-icons/lu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    avatarUrl?: string;
}

interface UserSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (user: User) => void;
    excludeIds?: string[];
}

export function UserSearchDialog({ open, onOpenChange, onSelect, excludeIds = [] }: UserSearchDialogProps) {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedSearch = useDebounce(search, 300);

    const searchUsers = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setUsers([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get('/users', {
                params: { search: query, limit: 10 }
            });
            // Handle if data.users exists or data is array
            const results = data.users || data || [];
            setUsers(results.filter((u: User) => !excludeIds.includes(u.id)));
        } catch (error) {
            console.error('Failed to search users:', error);
        } finally {
            setLoading(false);
        }
    }, [excludeIds]);

    useEffect(() => {
        searchUsers(debouncedSearch);
    }, [debouncedSearch, searchUsers]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0c] border-slate-200 dark:border-border-hover rounded-[2rem] p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-text-primary">Find Identity</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-text-muted font-medium">Search the campus directory to map subscription controls.</DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="relative group">
                        <LuSearch className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300",
                            loading ? "text-neon-cyan animate-pulse" : "text-slate-400 group-focus-within:text-neon-cyan"
                        )} />
                        <Input
                            placeholder="Type name, email or username..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-border-hover focus:border-neon-cyan/50 rounded-2xl text-base font-medium transition-all"
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 py-2">
                        {loading && users.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                <LuLoader className="h-8 w-8 text-neon-cyan animate-spin" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Searching Registry...</p>
                            </div>
                        )}

                        {!loading && search.length >= 2 && users.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-500 font-medium italic">No identities match your query.</p>
                            </div>
                        )}

                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => {
                                    onSelect(user);
                                    onOpenChange(false);
                                    setSearch('');
                                }}
                                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group text-left border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                            >
                                <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-neon-cyan/30 transition-all duration-300">
                                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                                        {user.username.substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900 dark:text-text-primary truncate">{user.username}</p>
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-[10px] font-black text-slate-500 dark:text-text-muted uppercase tracking-tighter">
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-text-muted truncate flex items-center gap-1">
                                        <LuMail className="h-3 w-3" /> {user.email}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-neon-cyan hover:text-slate-900">
                                    <LuCheck className="h-4 w-4" />
                                </div>
                            </button>
                        ))}

                        {search.length < 2 && !loading && (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2 opacity-50">
                                <LuUser className="h-10 w-10" />
                                <p className="text-xs font-bold uppercase tracking-widest text-center">Start typing to search<br/>the identity fabric</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
