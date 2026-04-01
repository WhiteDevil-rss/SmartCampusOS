'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Clock3, FileText, RefreshCw, Search, TrendingUp, X } from 'lucide-react';
import {
  LuDownload,
  LuFilter,
  LuLoader,
} from 'react-icons/lu';
import { DashboardLayout } from '@/components/dashboard-layout';
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
  StatCard,
} from '@/components/v2/shared/cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useToast } from '@/components/ui/toast-alert';

type DepartmentOption = {
  id: string;
  name: string;
  shortName?: string | null;
};

type AdmissionApplication = {
  id: string;
  applicantName: string;
  email: string;
  status: string;
  appliedAt: string;
  department?: {
    name?: string | null;
    shortName?: string | null;
  } | null;
  program?: {
    name?: string | null;
  } | null;
};

type AdmissionOverview = {
  totalApplications: number;
  filteredApplications: number;
  acceptanceRate: number;
  decisionRate: number;
  recentApplications: AdmissionApplication[];
  statusBreakdown: Array<{ name: string; label: string; count: number }>;
  programBreakdown: Array<{ programId: string; name: string; count: number }>;
  trend: Array<{ date: string; label: string; count: number }>;
  lastUpdatedAt: string;
};

type AdmissionsResponse = {
  applications: AdmissionApplication[];
  total: number;
  stats: Record<string, number>;
  overview: AdmissionOverview;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
};

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Enrolled', value: 'ENROLLED' },
];

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300';
    case 'PENDING':
      return 'border-amber-500/30 bg-amber-500/15 text-amber-300';
    case 'REJECTED':
      return 'border-rose-500/30 bg-rose-500/15 text-rose-300';
    case 'ENROLLED':
      return 'border-violet-500/30 bg-violet-500/15 text-violet-300';
    default:
      return 'border-blue-500/30 bg-blue-500/15 text-blue-300';
  }
};

const formatStatus = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const formatTimeAgo = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function UniAdmissionsPage() {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [data, setData] = useState<AdmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const fetchAdmissions = useCallback(async (showRefreshingState = false) => {
    if (!user?.universityId) return;

    if (showRefreshingState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter !== 'all') params.departmentId = departmentFilter;

      const [admissionsRes, departmentsRes] = await Promise.all([
        api.get<AdmissionsResponse>(`/v2/admissions/university/${user.universityId}`, { params }),
        api.get<DepartmentOption[]>(`/universities/${user.universityId}/departments`),
      ]);

      setData(admissionsRes.data);
      setDepartments(departmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch university admissions:', error);
      showToast('error', 'Failed to load admission analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [departmentFilter, showToast, statusFilter, user?.universityId]);

  useEffect(() => {
    if (!user?.universityId) return;
    fetchAdmissions();
  }, [fetchAdmissions, user?.universityId]);

  const visibleApplications = useMemo(() => {
    if (!data?.applications?.length) return [];

    const loweredQuery = query.trim().toLowerCase();
    if (!loweredQuery) return data.applications;

    return data.applications.filter((application) =>
      [application.applicantName, application.email, application.program?.name, application.department?.name, application.department?.shortName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(loweredQuery))
    );
  }, [data?.applications, query]);

  const statsCards = [
    { title: 'Total Applications', value: data?.overview.totalApplications ?? 0, icon: FileText, change: data?.overview.decisionRate ?? 0, changeDescription: 'decision coverage' },
    { title: 'Approved', value: data?.stats?.approved ?? 0, icon: Check, change: data?.overview.acceptanceRate ?? 0, changeDescription: 'acceptance rate' },
    { title: 'Pending Review', value: (data?.stats?.pending ?? 0) + (data?.stats?.under_review ?? 0), icon: Clock3, change: 0, changeDescription: 'active queue' },
    { title: 'Rejected', value: data?.stats?.rejected ?? 0, icon: X, change: 0, changeDescription: 'closed out' },
  ];

  return (
    <DashboardLayout navItems={UNI_ADMIN_NAV} title="University Admissions Dashboard">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Live Admissions Intelligence</div>
            <h2 className="text-4xl font-black tracking-tight text-foreground">Admissions Overview</h2>
            <p className="max-w-2xl text-sm font-medium text-muted-foreground">
              Aggregated real-time applications, filters, and department-level visibility for university administrators.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              {refreshing ? 'Refreshing now' : `Updated ${data?.overview?.lastUpdatedAt ? formatTimeAgo(data.overview.lastUpdatedAt) : 'just now'}`}
            </Badge>
            <Button variant="outline" className="rounded-2xl border-primary/20 bg-primary/5">
              <LuDownload className="mr-2 h-4 w-4" /> Export Report
            </Button>
            <Button onClick={() => fetchAdmissions(true)} className="rounded-2xl">
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={loading ? 0 : stat.value}
              change={stat.change}
              changeDescription={stat.changeDescription}
              icon={stat.icon}
            />
          ))}
        </div>

        <GlassCard>
          <GlassCardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <GlassCardTitle>Application Control Surface</GlassCardTitle>
                <GlassCardDescription>Filter and inspect applications without leaving the university dashboard</GlassCardDescription>
              </div>
              <div className="grid w-full gap-3 md:grid-cols-3 xl:max-w-4xl">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search applicants, programs, departments"
                    className="h-11 rounded-2xl border-border/60 bg-background/40 pl-11"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 rounded-2xl border-border/60 bg-background/40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="h-11 rounded-2xl border-border/60 bg-background/40">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.shortName ? `${department.shortName} · ${department.name}` : department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-background/15">
                {loading ? (
                  <div className="flex h-72 items-center justify-center">
                    <LuLoader className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !visibleApplications.length ? (
                  <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <div className="text-xl font-black text-foreground">No applications found</div>
                    <p className="max-w-md text-sm font-medium text-muted-foreground">
                      Adjust your filters or wait for new submissions to reach this university-level intake queue.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border/50 bg-background/30 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/65">
                          <th className="px-6 py-4">Applicant</th>
                          <th className="px-6 py-4">Department</th>
                          <th className="px-6 py-4">Program</th>
                          <th className="px-6 py-4">Applied</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {visibleApplications.map((application) => (
                          <tr key={application.id} className="transition-colors hover:bg-background/30">
                            <td className="px-6 py-4">
                              <div className="font-black tracking-tight text-foreground">{application.applicantName}</div>
                              <div className="text-xs font-medium text-muted-foreground">{application.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="rounded-full border-border/50 bg-background/30 text-xs font-bold text-foreground">
                                {application.department?.shortName || application.department?.name || 'N/A'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-foreground">
                              {application.program?.name || 'Program pending'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={`rounded-full border text-[10px] font-black uppercase tracking-[0.15em] ${getStatusBadgeClass(application.status)}`}>
                                {formatStatus(application.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-border/60 bg-background/15 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    <LuFilter className="h-4 w-4" />
                    Active Scope
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-muted-foreground">Filtered Applications</span>
                      <span className="font-black text-foreground">{data?.overview.filteredApplications ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-muted-foreground">Decision Rate</span>
                      <span className="font-black text-foreground">{data?.overview.decisionRate ?? 0}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-muted-foreground">Acceptance Rate</span>
                      <span className="font-black text-foreground">{data?.overview.acceptanceRate ?? 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-border/60 bg-background/15 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    <TrendingUp className="h-4 w-4" />
                    Program Demand
                  </div>
                  <div className="mt-4 space-y-3">
                    {data?.overview.programBreakdown?.length ? (
                      data.overview.programBreakdown.slice(0, 4).map((program) => (
                        <div key={program.programId} className="space-y-2">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="truncate font-bold text-foreground">{program.name}</span>
                            <span className="font-black text-foreground">{program.count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.max(12, (program.count / Math.max(...data.overview.programBreakdown.map((entry) => entry.count))) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-medium text-muted-foreground">Program demand data will appear once applications are available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Recent Application Feed</GlassCardTitle>
              <GlassCardDescription>Latest applicants entering the university review surface</GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              {data?.overview.recentApplications?.length ? (
                data.overview.recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border/60 bg-background/15 px-4 py-4">
                    <div className="min-w-0 space-y-1">
                      <div className="truncate text-sm font-black tracking-tight text-foreground">{application.applicantName}</div>
                      <div className="truncate text-xs font-medium text-muted-foreground">
                        {application.program?.name || 'Program pending'} · {application.department?.shortName || application.department?.name || 'Department pending'}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`rounded-full border text-[10px] font-black uppercase tracking-[0.15em] ${getStatusBadgeClass(application.status)}`}>
                        {formatStatus(application.status)}
                      </Badge>
                      <div className="mt-2 text-xs font-medium text-muted-foreground">{formatTimeAgo(application.appliedAt)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-background/10 px-6 py-10 text-center text-sm font-medium text-muted-foreground">
                  Recent application activity will appear here when new submissions are received.
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Status Summary</GlassCardTitle>
                <GlassCardDescription>How the current filtered application set is distributed</GlassCardDescription>
              </GlassCardHeader>
              <GlassCardContent className="space-y-3">
                {data?.overview.statusBreakdown?.length ? (
                  data.overview.statusBreakdown.map((status) => (
                    <div key={status.name} className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/15 px-4 py-3">
                      <div className="text-sm font-bold text-foreground">{status.label}</div>
                      <div className="text-lg font-black tracking-tight text-foreground">{status.count}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">Status analytics will appear once the university has admissions data.</p>
                )}
              </GlassCardContent>
            </GlassCard>

            <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/10 p-5">
              <div className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 text-blue-300" />
                <div className="space-y-2">
                  <p className="text-sm font-black text-blue-200">Read-Only Oversight</p>
                  <p className="text-sm font-medium text-blue-100/80">
                    University administrators can monitor application flow, filter intake, and export analytics here. Final application actions remain department-controlled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
