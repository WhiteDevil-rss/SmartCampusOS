"use client";

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  TrendingUp,
  Activity,
  Zap,
  MoreVertical,
  Bell,
  Search,
  Filter,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { securityService, SecurityIncident, SecurityIntelligence } from '@/lib/services/security';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { UNI_ADMIN_NAV } from '@/lib/constants/nav-config';

export default function SecurityOverviewPage() {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [intelligence, setIntelligence] = useState<SecurityIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.universityId) {
      setIsLoading(false);
      return;
    }

    try {
      const [incidentsData, intelligenceData] = await Promise.all([
        securityService.getIncidents(user.universityId),
        securityService.getIntelligence(user.universityId).catch(() => null)
      ]);
      setIncidents(incidentsData);
      setIntelligence(intelligenceData);
    } catch (error) {
      console.error("Security data sync failed:", error);
      toast.error("Security systems offline or inaccessible.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.universityId]);

  useEffect(() => {
    fetchData();
    // Real-time simulation or polling could be added here
  }, [fetchData]);

  const stats = useMemo(() => {
    const pending = incidents.filter(i => i.status === 'PENDING').length;
    const active = incidents.filter(i => i.status === 'INVESTIGATING').length;
    const critical = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
    
    return { pending, active, critical };
  }, [incidents]);

  const hotspots = intelligence?.hotspots ?? [];
  const suggestedPatrolFocus = intelligence?.suggestedPatrolFocus ?? [];

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
        <DashboardLayout navItems={UNI_ADMIN_NAV} title="Security Intelligence">
          <div className="p-8 space-y-8 bg-[#020817] min-h-screen">
            <Skeleton className="h-12 w-64 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-3xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="lg:col-span-2 h-[500px] bg-white/5 rounded-3xl" />
              <Skeleton className="h-[500px] bg-white/5 rounded-3xl" />
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['UNI_ADMIN']}>
      <DashboardLayout navItems={UNI_ADMIN_NAV} title="Security Intelligence">
    <div className="p-8 pb-32 space-y-8 bg-[#020817] min-h-screen max-w-[1600px] mx-auto">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-100 tracking-tightest uppercase font-space-grotesk italic">
              Security <span className="text-indigo-500 not-italic">Intelligence</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl">
            Unified command center for campus safety, incident response, and AI-driven threat assessment.
          </p>
        </motion.div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-all rounded-2xl h-12"
          >
            <Radio className="h-4 w-4 mr-2 text-rose-500 animate-pulse" />
            Live Feed
          </Button>
          <Link href="/dashboard/security/emergency">
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 rounded-2xl font-black uppercase tracking-widest text-xs px-6 h-12"
            >
              <Zap className="h-4 w-4 mr-2" />
              Emergency Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Reports" 
          value={stats.pending + stats.active} 
          subtitle="Awaiting resolution"
          icon={Activity}
          color="indigo"
        />
        <StatCard 
          title="High Priority" 
          value={stats.critical} 
          subtitle="Immediate attention"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard 
          title="On-Duty Personnel" 
          value={12} 
          subtitle="Patrolling campus"
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Safe Zones" 
          value="98%" 
          subtitle="Campus coverage"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Feed */}
        <Card className="lg:col-span-2 bg-[#0a1120] border-white/5 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="text-lg font-black text-white uppercase tracking-tight font-space-grotesk">Incident Dispatch</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live response queue</CardDescription>
            </div>
            <Link href="/dashboard/security/incidents">
              <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                View All Records <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-white/5">
              {incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="p-6 hover:bg-white/[0.02] transition-colors group flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                      incident.status === 'PENDING' ? "bg-rose-500/10 text-rose-500" : 
                      incident.status === 'INVESTIGATING' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-200 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">
                        {incident.title}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {incident.location || 'Nexus Point'}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(incident.createdAt))} ago</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-2">{incident.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <Badge className={cn(
                      "font-black uppercase text-[9px] tracking-widest px-2.5 py-1",
                      incident.severity === 'CRITICAL' ? "bg-rose-500 text-white" :
                      incident.severity === 'HIGH' ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"
                    )}>
                      {incident.severity}
                    </Badge>
                    <Link href={`/dashboard/security/incidents/${incident.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {incidents.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active incidents detected.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-white/[0.01] border-t border-white/5 py-4">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 mx-auto">
               <Activity className="h-3 w-3 text-emerald-500" />
               Pulse monitoring active
             </p>
          </CardFooter>
        </Card>

        {/* AI Security Intelligence */}
        <div className="space-y-6">
          <Card className="bg-indigo-600 border-none shadow-2xl rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
              <Zap className="h-40 w-40 text-white" />
            </div>
            <div className="relative z-10 space-y-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md uppercase text-[10px] font-black tracking-widest px-3 py-1">AI Guardian Engine</Badge>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase font-space-grotesk leading-none">
                {intelligence?.status || "SAFE"} LEVEL <br/> 
                <span className="text-indigo-200">INTEL</span>
              </h2>
              <p className="text-white/80 font-medium text-xs leading-relaxed">
                {intelligence?.summary || "Analyzing campus patterns... All safety protocols are currently optimal."}
              </p>
              <div className="pt-2">
                <Button className="w-full bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest h-11">
                  Run Deep Scan
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0a1120] border-white/5 shadow-2xl rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest font-space-grotesk">Hotspot Analysis</h3>
              <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 uppercase text-[9px] font-black">Spatial Alert</Badge>
            </div>
            <div className="space-y-4">
              {hotspots.map((hotspot, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{hotspot.location}</span>
                    <span className="text-indigo-400">{hotspot.incidentCount} Logs</span>
                  </div>
                  <Progress value={(hotspot.incidentCount / 10) * 100} className="h-1 border border-white/5" />
                </div>
              ))}
              {!hotspots.length && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest text-center">No persistent clusters detected.</p>
                  </div>
              )}
            </div>
            <div className="pt-4 border-t border-white/5">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Patrol Focus Recommends</h4>
               <div className="flex flex-wrap gap-2">
                  {suggestedPatrolFocus.map((loc, i) => (
                    <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-bold text-[9px] uppercase tracking-widest">{loc}</Badge>
                  ))}
                  {!suggestedPatrolFocus.length ? (
                    <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/10 text-emerald-400 font-bold text-[9px] uppercase tracking-widest">
                      Standard patrol coverage active
                    </Badge>
                  ) : null}
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: "from-indigo-500",
    rose: "from-rose-500",
    blue: "from-blue-500",
    emerald: "from-emerald-500"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-[#0a1120] border-white/5 shadow-2xl relative overflow-hidden group rounded-3xl h-full">
        <div className={cn("absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity transform group-hover:scale-110", `text-${color}-500`)}>
          <Icon className="h-24 w-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-space-grotesk">{title}</CardTitle>
          <div className="text-4xl font-black text-white mt-1 font-space-grotesk">{value}</div>
        </CardHeader>
        <CardFooter className="text-[10px] font-bold text-slate-500 uppercase pb-6 pt-0 flex gap-1.5 items-center">
          <span className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-tr", colorMap[color])} />
          {subtitle}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
