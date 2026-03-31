'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { UserFilterBar, FilterState } from './user-filter-bar';
import { LuUsers, LuShieldAlert, LuActivity, LuPower } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    university?: { shortName: string };
    faculty?: { name: string, designation: string }[];
    student?: { name: string, enrollmentNo: string, department: { name: string } };
}

interface UserListViewProps {
    initialFilters?: Partial<FilterState>;
    title?: string;
    description?: string;
    onEdit?: (user: User) => void;
    onToggleStatus?: (user: User) => void;
    onResetPassword?: (user: User) => void;
    renderActions?: (user: User) => React.ReactNode;
}

export function UserListView({ 
    initialFilters, 
    title, 
    description,
    onEdit,
    onToggleStatus,
    onResetPassword,
    renderActions
}: UserListViewProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        ...initialFilters
    });

    const fetchUsers = useCallback(async (currentFilters: FilterState) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.universityId && currentFilters.universityId !== 'all') params.append('universityId', currentFilters.universityId);
            if (currentFilters.departmentId && currentFilters.departmentId !== 'all') params.append('departmentId', currentFilters.departmentId);
            if (currentFilters.courseId && currentFilters.courseId !== 'all') params.append('courseId', currentFilters.courseId);
            if (currentFilters.batchId && currentFilters.batchId !== 'all') params.append('batchId', currentFilters.batchId);
            if (currentFilters.search) params.append('search', currentFilters.search);
            
            const { data } = await api.get(`/users?${params.toString()}`);
            setUsers(data.users);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(filters);
    }, [filters, fetchUsers]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center tracking-tight font-heading">
                        <LuUsers className="w-6 h-6 mr-3 text-primary opacity-80" /> {title || 'Active Identities'}
                    </h3>
                    <p className="text-muted text-sm font-medium mt-1">{description || 'Hierarchical directory of authorized system participants.'}</p>
                </div>
                <div className="flex items-center gap-3 bg-surface border border-border px-5 py-3 rounded-2xl shadow-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-black text-muted tracking-widest">Total Matches</span>
                        <span className="text-xl font-black text-white">{total}</span>
                    </div>
                    <div className="w-px h-8 bg-border mx-1" />
                    <LuActivity className="w-5 h-5 text-emerald-500 opacity-80" />
                </div>
            </div>

            <UserFilterBar onFilterChange={setFilters} initialFilters={initialFilters} />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-56 rounded-[2rem] bg-surface" />
                    ))}
                </div>
            ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-[3rem] border-2 border-dashed border-border">
                    <div className="w-16 h-16 bg-surface rounded-3xl flex items-center justify-center mb-4 border border-border">
                        <LuShieldAlert className="w-8 h-8 text-muted" />
                    </div>
                    <h4 className="text-xl font-bold text-white font-heading">No Identities Found</h4>
                    <p className="text-muted max-w-xs text-center mt-2 font-medium">Verify your filter parameters or broaden the search criteria in the Neural Solver.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {users.map((user) => (
                        <div key={user.id} className="group relative bg-surface border border-border rounded-[2rem] overflow-hidden hover:border-primary/40 transition-all duration-500">
                            
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center border border-border group-hover:border-primary/30 transition-all">
                                        <LuUsers className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                                    </div>
                                    <Badge variant="outline" className={`font-black tracking-widest text-[9px] uppercase border-opacity-30 ${user.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                        {user.isActive ? 'Authorised' : 'Revoked'}
                                    </Badge>
                                </div>

                                <h4 className="text-xl font-black text-white flex items-center truncate font-heading">
                                    {user.faculty?.[0]?.name || user.student?.name || user.username}
                                </h4>
                                <p className="text-muted text-sm font-bold mt-1 line-clamp-1 opacity-70">
                                    {user.email}
                                </p>

                                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-black text-muted tracking-widest">System Role</span>
                                        <span className="text-xs font-black text-white px-2.5 py-1 bg-surface-hover rounded-lg mt-1 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            {user.role}
                                        </span>
                                    </div>
                                    {user.university?.shortName && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] uppercase font-black text-muted tracking-widest text-right">Node</span>
                                            <span className="text-xs font-black text-white mt-1">{user.university.shortName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    {user.student?.enrollmentNo && (
                                        <span className="text-[10px] font-bold text-muted bg-surface-hover px-2 py-0.5 rounded border border-border/50">{user.student.enrollmentNo}</span>
                                    )}
                                    {user.faculty?.[0]?.designation && (
                                        <span className="text-[10px] font-bold text-muted bg-surface-hover px-2 py-0.5 rounded border border-border/50">{user.faculty[0].designation}</span>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-wrap gap-2">
                                    {renderActions && renderActions(user)}
                                    {onEdit && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => onEdit(user)}
                                            className="grow rounded-xl bg-surface-hover font-black text-[10px] uppercase border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all h-10"
                                        >
                                            Modify
                                        </Button>
                                    )}
                                    {onResetPassword && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => onResetPassword(user)}
                                            className="grow rounded-xl bg-surface-hover font-black text-[10px] uppercase border border-border hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30 transition-all h-10"
                                        >
                                            Reset
                                        </Button>
                                    )}
                                    {onToggleStatus && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => onToggleStatus(user)}
                                            className={`w-10 rounded-xl bg-surface-hover font-bold border border-border transition-all h-10 ${user.isActive ? 'hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30' : 'hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30'}`}
                                        >
                                            <LuPower className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div>
    );
}
