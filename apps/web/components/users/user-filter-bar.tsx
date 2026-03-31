'use client';

import { useState, useEffect } from 'react';
import { LuSearch, LuX, LuFilter } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Badge } from '@/components/ui/badge';

export interface FilterState {
    universityId?: string;
    departmentId?: string;
    courseId?: string;
    batchId?: string;
    search: string;
}

interface UserFilterBarProps {
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: Partial<FilterState>;
}

export function UserFilterBar({ onFilterChange, initialFilters }: UserFilterBarProps) {
    const { user } = useAuthStore();
    const [universities, setUniversities] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    
    const [filters, setFilters] = useState<FilterState>({
        universityId: (initialFilters?.universityId || (user?.role !== 'SUPERADMIN' ? user?.universityId : '')) || '',
        departmentId: (initialFilters?.departmentId || (user?.role === 'DEPT_ADMIN' ? user?.departmentId : '')) || '',
        courseId: initialFilters?.courseId || '',
        batchId: initialFilters?.batchId || '',
        search: initialFilters?.search || '',
    });

    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    // Fetch Universities
    useEffect(() => {
        if (user?.role === 'SUPERADMIN') {
            api.get('/universities').then(({ data }) => setUniversities(data));
        }
    }, [user?.role]);

    // Fetch Departments when University changes
    useEffect(() => {
        const uniId = filters.universityId;
        if (uniId && uniId !== 'all') {
            api.get(`/universities/${uniId}/departments`).then(({ data }) => setDepartments(data));
        } else {
            setDepartments([]);
        }
    }, [filters.universityId]);

    // Fetch Courses & Batches when Department changes
    useEffect(() => {
        const deptId = filters.departmentId;
        const uniId = filters.universityId;
        if (deptId && deptId !== 'all' && uniId) {
            api.get(`/universities/${uniId}/departments/${deptId}/courses`).then(({ data }) => setCourses(data));
            api.get(`/batches?departmentId=${deptId}`).then(({ data }) => setBatches(data));
        } else {
            setCourses([]);
            setBatches([]);
        }
    }, [filters.departmentId, filters.universityId]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== filters.search) {
                const newFilters = { ...filters, search: debouncedSearch };
                setFilters(newFilters);
                onFilterChange(newFilters);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [debouncedSearch, filters, onFilterChange]);

    const handleFilterUpdate = (key: keyof FilterState, value: string) => {
        const val = value === 'all' ? '' : value;
        const newFilters = { ...filters, [key]: val };
        
        // Reset children when parent changes
        if (key === 'universityId') {
            newFilters.departmentId = '';
            newFilters.courseId = '';
            newFilters.batchId = '';
        } else if (key === 'departmentId') {
            newFilters.courseId = '';
            newFilters.batchId = '';
        }

        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const reset: FilterState = {
            universityId: (user?.role !== 'SUPERADMIN' ? user?.universityId : '') || '',
            departmentId: (user?.role === 'DEPT_ADMIN' ? (user as any)?.departmentId || (user as any)?.entityId : '') || '',
            courseId: '',
            batchId: '',
            search: '',
        };
        setFilters(reset);
        setDebouncedSearch('');
        onFilterChange(reset);
    };

    const activeFilterCount = [
        filters.universityId && user?.role === 'SUPERADMIN',
        filters.departmentId && user?.role !== 'DEPT_ADMIN',
        filters.courseId,
        filters.batchId,
    ].filter(Boolean).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-end bg-surface p-6 rounded-2xl border border-border backdrop-blur-sm shadow-sm md:shadow-none">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] uppercase font-black text-muted tracking-widest ml-1 flex items-center">
                        <LuSearch className="w-3 h-3 mr-1.5 opacity-60" /> Search Matrix
                    </label>
                    <div className="relative group">
                        <Input
                            placeholder="Name, email, or identifier..."
                            value={debouncedSearch}
                            onChange={(e) => setDebouncedSearch(e.target.value)}
                            className="h-11 bg-background border-border group-hover:border-primary/40 transition-all rounded-xl pl-10 pr-4 font-medium text-white"
                        />
                        <LuSearch className="absolute left-3.5 top-3.5 w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    </div>
                </div>

                {user?.role === 'SUPERADMIN' && (
                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] uppercase font-black text-muted tracking-widest ml-1">University Partition</label>
                        <Select value={filters.universityId || 'all'} onValueChange={(v) => handleFilterUpdate('universityId', v)}>
                            <SelectTrigger className="h-11 bg-background border-border rounded-xl font-bold text-white">
                                <SelectValue placeholder="All Universities" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface border-border rounded-xl shadow-2xl">
                                <SelectItem value="all">All Universities</SelectItem>
                                {universities.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.shortName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {(user?.role === 'SUPERADMIN' || user?.role === 'UNI_ADMIN') && (
                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] uppercase font-black text-muted tracking-widest ml-1">Topology Sector</label>
                        <Select 
                            value={filters.departmentId || 'all'} 
                            onValueChange={(v) => handleFilterUpdate('departmentId', v)}
                        >
                            <SelectTrigger 
                                className="h-11 bg-background border-border rounded-xl font-bold text-white"
                                disabled={!filters.universityId && user?.role === 'SUPERADMIN'}
                            >
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface border-border rounded-xl shadow-2xl">
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.shortName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="w-full md:w-64 space-y-2">
                    <label className="text-[10px] uppercase font-black text-muted tracking-widest ml-1">Course Stream</label>
                    <Select 
                        value={filters.courseId || 'all'} 
                        onValueChange={(v) => handleFilterUpdate('courseId', v)}
                    >
                        <SelectTrigger 
                            className="h-11 bg-background border-border rounded-xl font-bold text-white"
                            disabled={!filters.departmentId}
                        >
                            <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border rounded-xl shadow-2xl">
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full md:w-64 space-y-2">
                    <label className="text-[10px] uppercase font-black text-muted tracking-widest ml-1">Academic Batch</label>
                    <Select 
                        value={filters.batchId || 'all'} 
                        onValueChange={(v) => handleFilterUpdate('batchId', v)}
                    >
                        <SelectTrigger 
                            className="h-11 bg-background border-border rounded-xl font-bold text-white"
                            disabled={!filters.departmentId}
                        >
                            <SelectValue placeholder="All Batches" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-border rounded-xl shadow-2xl">
                            <SelectItem value="all">All Batches</SelectItem>
                            {batches.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                { (activeFilterCount > 0 || debouncedSearch) && (
                    <Button 
                        variant="ghost" 
                        onClick={clearFilters}
                        className="h-11 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500/20 font-bold px-4 border border-transparent hover:border-rose-500/30 transition-all mb-[1px]"
                    >
                        <LuX className="w-4 h-4 mr-2" /> Reset
                    </Button>
                )}
            </div>

            {/* Active Chips */}
            {(activeFilterCount > 0 || debouncedSearch) && (
                <div className="flex flex-wrap gap-2 px-1">
                    {debouncedSearch && (
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold animate-in fade-in slide-in-from-left-2 transition-all">
                            Contains: &ldquo;{debouncedSearch}&rdquo;
                            <LuX className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setDebouncedSearch('')} />
                        </Badge>
                    )}
                    {filters.universityId && user?.role === 'SUPERADMIN' && (
                        <Badge variant="outline" className="bg-indigo-500/5 border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold">
                            University: {universities.find(u => u.id === filters.universityId)?.shortName || 'Selected'}
                            <LuX className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleFilterUpdate('universityId', '')} />
                        </Badge>
                    )}
                    {filters.departmentId && (
                        <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold">
                            Department: {departments.find(d => d.id === filters.departmentId)?.shortName || 'Selected'}
                            <LuX className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleFilterUpdate('departmentId', '')} />
                        </Badge>
                    )}
                    {filters.courseId && (
                        <Badge variant="outline" className="bg-amber-500/5 border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold">
                            Course: {courses.find(c => c.id === filters.courseId)?.name || 'Selected'}
                            <LuX className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleFilterUpdate('courseId', '')} />
                        </Badge>
                    )}
                    {filters.batchId && (
                        <Badge variant="outline" className="bg-purple-500/5 border-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold">
                            Batch: {batches.find(b => b.id === filters.batchId)?.name || 'Selected'}
                            <LuX className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleFilterUpdate('batchId', '')} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
