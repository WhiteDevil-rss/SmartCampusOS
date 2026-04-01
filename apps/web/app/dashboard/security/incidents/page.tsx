"use client";

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  Info,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { securityService, SecurityIncident } from '@/lib/services/security';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function IncidentsPage() {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // New Incident State
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    type: 'THEFT',
    location: '',
    severity: 'MEDIUM'
  });

  const fetchData = useCallback(async () => {
    if (!user?.universityId) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await securityService.getIncidents(user.universityId);
      setIncidents(data);
    } catch (error) {
      toast.error("Failed to sync incident records.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.universityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReport = async () => {
    if (!user?.universityId) {
      toast.error("University context unavailable.");
      return;
    }

    try {
      await securityService.reportIncident(user.universityId, {
        ...newIncident,
        universityId: user?.universityId,
        reportedById: user?.id
      });
      toast.success("Incident registered in safety logs.");
      setIsNewOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to transmit report.");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await securityService.updateIncidentStatus(id, status, user?.id);
      toast.success(`Incident status updated to ${status}.`);
      fetchData();
    } catch (error) {
      toast.error("Status update propagation failed.");
    }
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => {
      const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [incidents, searchTerm, filterStatus]);

  if (isLoading) {
    return <div className="p-8 space-y-8 bg-[#020817] min-h-screen pt-24 lg:pt-14 overflow-hidden">
      <Skeleton className="h-10 w-48 bg-white/5" />
      <Skeleton className="h-96 w-full bg-white/5 rounded-3xl" />
    </div>;
  }

  return (
    <div className="p-8 pb-32 space-y-8 bg-[#020817] min-h-screen pt-24 lg:pt-14 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tighter font-space-grotesk italic">
            Incident <span className="text-indigo-500 not-italic">Records</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm italic tracking-wide">Detailed security log and dispatch management system.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Query logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 bg-white/5 border-white/5 rounded-2xl h-11 focus:bg-white/10"
            />
          </div>
          <Button
            onClick={() => setIsNewOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-2xl px-6 font-black uppercase text-xs tracking-widest h-11"
          >
            <Plus className="h-4 w-4 mr-2" /> Report Incident
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="bg-[#0a1120] border-white/5 shadow-2xl rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2">
            {['ALL', 'PENDING', 'INVESTIGATING', 'RESOLVED'].map(s => (
              <Button
                key={s}
                variant="ghost"
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  filterStatus === s ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-white/5"
                )}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 px-8 w-[35%]">Incident Narrative</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Intelligence</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Spatial Data</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Operation Status</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 px-8">Dispatch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.map((incident) => (
              <TableRow key={incident.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="py-6 px-8">
                  <div className="space-y-2">
                    <p className="font-black text-slate-100 uppercase tracking-tighter text-base group-hover:text-indigo-400 transition-colors">{incident.title}</p>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed italic">"{incident.description}"</p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        <Calendar className="h-3 w-3" /> {format(new Date(incident.createdAt), 'MMM dd, HH:mm')}
                      </span>
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest border-l border-white/10 pl-4">
                        <User className="h-3 w-3" /> {incident.reporter?.name || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-3">
                    <Badge className={cn(
                      "font-black uppercase text-[9px] tracking-widest px-2.5 py-1",
                      incident.severity === 'CRITICAL' ? "bg-rose-500 text-white" :
                        incident.severity === 'HIGH' ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"
                    )}>
                      {incident.severity} PRIORITY
                    </Badge>
                    {incident.analysis && (
                      <div className="bg-indigo-500/5 p-2 rounded-xl border border-indigo-500/10 max-w-[200px]">
                        <p className="text-[9px] text-indigo-300 font-black uppercase tracking-widest leading-tight">AI Summary: <span className="text-indigo-100 normal-case font-medium">{incident.analysis.summary}</span></p>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-tighter">
                      <MapPin className="h-4 w-4 text-rose-500" /> {incident.location || 'Nexus Point'}
                    </span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-6">{incident.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Badge className={cn(
                      "w-fit font-black uppercase text-[9px] tracking-tighter px-2.5 py-1 ring-1",
                      incident.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 ring-amber-500/10" :
                        incident.status === 'INVESTIGATING' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 ring-indigo-500/10" :
                          incident.status === 'RESOLVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 ring-emerald-500/10" :
                            "bg-slate-800 text-slate-500"
                    )}>
                      {incident.status}
                    </Badge>
                    {incident.officer && (
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 pt-1">
                        <Shield className="h-3 w-3" /> DEP: {incident.officer.name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex justify-end gap-2">
                    {incident.status === 'PENDING' && (
                      <Button
                        onClick={() => updateStatus(incident.id, 'INVESTIGATING')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest h-9"
                      >Dispatch</Button>
                    )}
                    {incident.status === 'INVESTIGATING' && (
                      <Button
                        onClick={() => updateStatus(incident.id, 'RESOLVED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest h-9"
                      >Resolve</Button>
                    )}
                    <Button variant="ghost" className="h-9 w-9 p-0 text-slate-500 rounded-xl hover:bg-white/5">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredIncidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs italic">No matching security logs found.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* New Incident Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="bg-[#0a1120] border-white/10 rounded-3xl max-w-2xl p-8 backdrop-blur-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">Report Security <span className="text-indigo-500 italic">Incident</span></DialogTitle>
            <DialogDescription className="text-slate-500 font-medium pt-2 italic">Transmit safety report to the unified command center.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6 font-space-grotesk">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Operational Title</label>
              <Input
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-indigo-500/50"
                placeholder="e.g. Unauthorized Entry @ Gate 2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Threat Classification</label>
              <Select onValueChange={(val) => setNewIncident({ ...newIncident, type: val })}>
                <SelectTrigger className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-indigo-500/50">
                  <SelectValue placeholder="Select Threat" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1120] border-white/10 p-2 rounded-2xl">
                  <SelectItem value="THEFT">Theft & Vandalism</SelectItem>
                  <SelectItem value="INTRUSION">Unauthorized Access</SelectItem>
                  <SelectItem value="FIGHT">Physical Altercation</SelectItem>
                  <SelectItem value="FIRE">Fire / Smoke Signal</SelectItem>
                  <SelectItem value="HARASSMENT">Harassment / Conduct</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Deployment Location</label>
              <Input
                value={newIncident.location}
                onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                className="bg-white/5 border-white/5 text-white h-12 rounded-2xl focus:border-indigo-500/50"
                placeholder="e.g. Main Library, Floor 3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Severity Matrix</label>
              <div className="flex gap-2">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(lev => (
                  <Button
                    key={lev}
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewIncident({ ...newIncident, severity: lev as any })}
                    className={cn(
                      "flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all",
                      newIncident.severity === lev ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-500 hover:text-slate-300"
                    )}
                  >{lev}</Button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Incident Intelligence (Description)</label>
              <Input
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                className="bg-white/5 border-white/5 text-white h-24 rounded-2xl focus:border-indigo-500/50 pt-3"
                placeholder="Provide detailed spatial and narrative context..."
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-start">
            <Button
              onClick={handleReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-xs h-12 px-10 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
            >Transmit Dispatch</Button>
            <Button
              variant="ghost"
              onClick={() => setIsNewOpen(false)}
              className="text-slate-500 hover:text-white rounded-2xl font-black uppercase text-xs h-12 px-8"
            >Abort Operation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
