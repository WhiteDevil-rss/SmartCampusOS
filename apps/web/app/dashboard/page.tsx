'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  Briefcase,
  Building2,
  ClipboardList,
  Layers,
  Library,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ProtectedRoute } from '@/components/protected-route';
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
import { api } from '@/lib/api';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';
import { useAuthStore } from '@/lib/store/useAuthStore';

type UniversityStats = {
  departments: number;
  faculty: number;
  courses: number;
  batches: number;
};

type AdmissionTrendPoint = {
  date: string;
  label: string;
  count: number;
};

type StatusBreakdown = {
  name: string;
  label: string;
  count: number;
};

type ProgramBreakdown = {
  programId: string;
  name: string;
  count: number;
};

type RecentApplication = {
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

type AdmissionsOverview = {
  totalApplications: number;
  filteredApplications: number;
  acceptanceRate: number;
  decisionRate: number;
  recentApplications: RecentApplication[];
  statusBreakdown: StatusBreakdown[];
  programBreakdown: ProgramBreakdown[];
  trend: AdmissionTrendPoint[];
  lastUpdatedAt: string;
};

type AdmissionsResponse = {
  overview: AdmissionsOverview;
  stats: Record<string, number>;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--primary)',
  under_review: '#3b82f6',
  approved: '#10b981',
  rejected: '#f43f5e',
  enrolled: '#8b5cf6',
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

function ChartFrame({
  height,
  children,
}: {
  height: number;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      {width > 0 ? children({ width, height }) : null}
    </div>
  );
}

const formatStatusLabel = (status: string) =>
  status
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

const getStatusColor = (status: string) => STATUS_COLORS[status] ?? '#94a3b8';

export default function UniAdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<UniversityStats>({ departments: 0, faculty: 0, courses: 0, batches: 0 });
  const [admissions, setAdmissions] = useState<AdmissionsOverview>({
    totalApplications: 0,
    filteredApplications: 0,
    acceptanceRate: 0,
    decisionRate: 0,
    recentApplications: [],
    statusBreakdown: [],
    programBreakdown: [],
    trend: [],
    lastUpdatedAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async (showRefreshingState = false) => {
    if (!user?.universityId) return;

    if (showRefreshingState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [deptRes, facRes, crsRes, bchRes, admissionsRes] = await Promise.all([
        api.get(`/universities/${user.universityId}/departments`),
        api.get('/faculty'),
        api.get('/courses'),
        api.get('/batches'),
        api.get<AdmissionsResponse>(`/v2/admissions/university/${user.universityId}`, {
          params: { limit: 5 },
        }),
      ]);

      setStats({
        departments: deptRes.data.length,
        faculty: facRes.data.length,
        courses: crsRes.data.length,
        batches: bchRes.data.length,
      });
      setAdmissions(admissionsRes.data.overview);
      setErrorMessage(null);
    } catch (error) {
      console.warn('University dashboard failed to refresh live analytics', error);
      setErrorMessage('Live admissions analytics are temporarily unavailable. Operational counts may be partially stale.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.universityId]);

  useEffect(() => {
    if (!user?.universityId) return;

    fetchData();
    const intervalId = window.setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchData, user?.universityId]);

  const reviewQueue = (admissions.statusBreakdown.find((entry) => entry.name === 'pending')?.count ?? 0)
    + (admissions.statusBreakdown.find((entry) => entry.name === 'under_review')?.count ?? 0);

  const statCards = useMemo(() => ([
    {
      title: 'Applications Received',
      value: admissions.totalApplications,
      change: admissions.decisionRate,
      changeDescription: 'decision coverage',
      icon: ClipboardList,
    },
    {
      title: 'Review Queue',
      value: reviewQueue,
      change: 0,
      changeDescription: 'pending + review',
      icon: Activity,
    },
    {
      title: 'Acceptance Rate',
      value: admissions.acceptanceRate,
      suffix: '%',
      change: admissions.acceptanceRate,
      changeDescription: 'approved applications',
      icon: TrendingUp,
      precision: 1,
    },
    {
      title: 'Academic Programs',
      value: stats.courses,
      change: 0,
      changeDescription: 'live catalog items',
      icon: BookOpen,
    },
  ]), [admissions.acceptanceRate, admissions.decisionRate, admissions.totalApplications, reviewQueue, stats.courses]);

  const quickActions = [
    { title: 'Manage Admissions', icon: ClipboardList, desc: 'Applications and statuses', href: '/dashboard/admissions' },
    { title: 'Academic Programs', icon: Layers, desc: 'Portfolio and curriculum', href: '/dashboard/programs' },
    { title: 'Departments', icon: Building2, desc: 'Structure and governance', href: '/dashboard/departments' },
    { title: 'Results', icon: ShieldCheck, desc: 'Publish and audit outcomes', href: '/dashboard/results' },
    { title: 'Resources', icon: Library, desc: 'Facilities and assets', href: '/dashboard/resources' },
    { title: 'Placements', icon: Briefcase, desc: 'Career services and outcomes', href: '/dashboard/placements' },
    { title: 'Networking', icon: Sparkles, desc: 'Collaboration intelligence', href: '/dashboard/networking' },
    { title: 'Security', icon: Activity, desc: 'Campus monitoring hub', href: '/dashboard/security' },
  ];

  return (
    <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
      <DashboardLayout navItems={UNI_ADMIN_NAV} title="Executive Dashboard">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-10 pb-20"
        >
          <motion.div variants={item} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">University Operations</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
                  {user?.username ? `Welcome back, ${user.username}` : 'University Command Center'}
                </h1>
                <p className="max-w-3xl text-base font-medium leading-relaxed text-muted-foreground/80 md:text-lg">
                  Live admissions flow, academic capacity, and institutional readiness in one operating surface.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                {refreshing ? 'Refreshing live data' : `Updated ${formatTimeAgo(admissions.lastUpdatedAt)}`}
              </Badge>
              <Button className="rounded-2xl" onClick={() => fetchData(true)}>
                Refresh Analytics
              </Button>
            </div>
          </motion.div>

          {errorMessage ? (
            <motion.div variants={item}>
              <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-200">
                {errorMessage}
              </div>
            </motion.div>
          ) : null}

          <motion.div variants={item} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={loading ? 0 : card.value}
                change={card.change}
                changeDescription={card.changeDescription}
                icon={card.icon}
                suffix={card.suffix}
                precision={card.precision}
              />
            ))}
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Departments', value: stats.departments, icon: Building2 },
              { label: 'Faculty', value: stats.faculty, icon: Users },
              { label: 'Courses', value: stats.courses, icon: BookOpen },
              { label: 'Batches', value: stats.batches, icon: Layers },
            ].map((entry) => (
              <GlassCard key={entry.label}>
                <GlassCardContent className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/60">{entry.label}</p>
                    <div className="text-3xl font-black tracking-tight text-foreground">{loading ? '...' : entry.value}</div>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <entry.icon className="size-5" />
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            <motion.div variants={item} className="xl:col-span-2">
              <GlassCard className="h-full">
                <GlassCardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <GlassCardTitle>Application Volume Trend</GlassCardTitle>
                      <GlassCardDescription>Daily admissions activity across the last 30 days</GlassCardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                      {admissions.filteredApplications} in scope
                    </Badge>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  {admissions.trend.length ? (
                    <ChartFrame height={340}>
                      {({ width, height }) => (
                        <AreaChart width={width} height={height} data={admissions.trend}>
                          <defs>
                            <linearGradient id="applicationsTrendFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.32} />
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--primary)" opacity={0.1} />
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'currentColor', opacity: 0.6, fontWeight: 800, fontSize: 10 }}
                            dy={10}
                          />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.4, fontWeight: 800, fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '24px',
                              border: '1px solid var(--primary)',
                              background: 'var(--surface)',
                              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                              padding: '16px',
                            }}
                          />
                          <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#applicationsTrendFill)" />
                        </AreaChart>
                      )}
                    </ChartFrame>
                  ) : (
                    <div className="flex h-[340px] items-center justify-center rounded-[2rem] border border-dashed border-border/60 bg-muted/10 px-6 text-center text-sm font-semibold text-muted-foreground">
                      Application trend data will appear once the university receives admissions records in the selected time window.
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="h-full">
                <GlassCardHeader>
                  <GlassCardTitle>Status Mix</GlassCardTitle>
                  <GlassCardDescription>Current application distribution by status</GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent className="flex flex-col gap-6">
                  {admissions.statusBreakdown.length ? (
                    <>
                      <div className="relative">
                        <ChartFrame height={240}>
                          {({ width, height }) => (
                            <PieChart width={width} height={height}>
                              <Pie
                                data={admissions.statusBreakdown}
                                dataKey="count"
                                nameKey="label"
                                innerRadius={60}
                                outerRadius={92}
                                paddingAngle={5}
                              >
                                {admissions.statusBreakdown.map((entry) => (
                                  <Cell key={entry.name} fill={getStatusColor(entry.name)} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          )}
                        </ChartFrame>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/60">Applications</span>
                          <span className="text-4xl font-black tracking-tight text-foreground">{admissions.filteredApplications}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {admissions.statusBreakdown.map((entry) => (
                          <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/20 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-2.5 rounded-full" style={{ backgroundColor: getStatusColor(entry.name) }} />
                              <span className="text-sm font-bold text-foreground">{entry.label}</span>
                            </div>
                            <span className="text-sm font-black text-foreground">{entry.count}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-[320px] items-center justify-center rounded-[2rem] border border-dashed border-border/60 bg-muted/10 px-6 text-center text-sm font-semibold text-muted-foreground">
                      Status distribution will populate automatically when live admissions start flowing into the university panel.
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.div variants={item}>
              <GlassCard className="h-full">
                <GlassCardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <GlassCardTitle>Recent Applications</GlassCardTitle>
                      <GlassCardDescription>Latest submissions reaching the university review surface</GlassCardDescription>
                    </div>
                    <Button variant="outline" className="rounded-2xl border-primary/20 bg-primary/5" onClick={() => router.push('/dashboard/admissions')}>
                      Open Admissions
                    </Button>
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  {admissions.recentApplications.length ? (
                    admissions.recentApplications.map((application) => (
                      <div key={application.id} className="flex flex-col gap-4 rounded-[1.75rem] border border-border/60 bg-background/20 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-black tracking-tight text-foreground">{application.applicantName}</h3>
                            <Badge
                              variant="outline"
                              className="rounded-full border-transparent px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em]"
                              style={{
                                color: getStatusColor(application.status.toLowerCase()),
                                backgroundColor: `${getStatusColor(application.status.toLowerCase())}1a`,
                              }}
                            >
                              {formatStatusLabel(application.status)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
                            <span>{application.program?.name ?? 'Program pending'}</span>
                            <span>{application.department?.shortName || application.department?.name || 'Department pending'}</span>
                            <span>{application.email}</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-muted-foreground">
                          {formatTimeAgo(application.appliedAt)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-[2rem] border border-dashed border-border/60 bg-muted/10 px-6 text-center text-sm font-semibold text-muted-foreground">
                      Recent application activity will appear here as soon as new forms are submitted.
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="h-full">
                <GlassCardHeader>
                  <GlassCardTitle>Program Demand</GlassCardTitle>
                  <GlassCardDescription>Top programs attracting the most applications</GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  {admissions.programBreakdown.length ? (
                    admissions.programBreakdown.map((program, index) => (
                      <div key={program.programId} className="space-y-2 rounded-[1.5rem] border border-border/60 bg-background/20 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-black tracking-tight text-foreground">{program.name}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/60">
                              Rank #{index + 1}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black tracking-tight text-foreground">{program.count}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/60">applications</div>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.max(8, (program.count / Math.max(...admissions.programBreakdown.map((entry) => entry.count))) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-[2rem] border border-dashed border-border/60 bg-muted/10 px-6 text-center text-sm font-semibold text-muted-foreground">
                      Program demand analytics will populate after the first round of applications is available.
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </div>

          <motion.div variants={item} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <GlassCard
                key={action.title}
                className="cursor-pointer group"
                onClick={() => router.push(action.href)}
              >
                <GlassCardContent className="flex flex-col gap-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <action.icon className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black tracking-tight">{action.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{action.desc}</p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
