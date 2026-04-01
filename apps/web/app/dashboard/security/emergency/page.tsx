"use client";

import React, { useEffect, useState } from 'react';
import {
  Zap,
  AlertOctagon,
  Phone,
  Radio,
  MapPin,
  Clock,
  ShieldAlert,
  Users,
  Volume2,
  Lock,
  Unlock,
  ChevronsRight,
  Flame,
  Stethoscope,
  Siren
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EmergencyHubPage() {
  const [isLive, setIsLive] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [pulseColor, setPulseColor] = useState('rose');

  const triggerEmergency = (type: string) => {
    setActiveAlert(type);
    setIsLive(true);
    toast.error(`CRITICAL: ${type.toUpperCase()} PROTOCOL INITIALIZED`, {
      duration: 10000,
    });
    // This would call an API in a real app
  };

  const abortEmergency = () => {
    setActiveAlert(null);
    setIsLive(false);
    toast.success("EMERGENCY PROTOCOLS DISENGAGED");
  };

  return (
    <div className={cn(
      "p-8 pb-32 space-y-8 min-h-screen pt-24 lg:pt-14 max-w-7xl mx-auto transition-colors duration-1000 select-none",
      isLive ? "bg-rose-950/20" : "bg-[#020817]"
    )}>
      
      {/* Visual background pulse during emergency */}
      <AnimatePresence>
        {isLive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="fixed inset-0 pointer-events-none bg-rose-600/10 z-0"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 space-y-8">
        
        {/* Urgent Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                 "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500",
                 isLive ? "bg-rose-600 shadow-rose-600/40 animate-pulse" : "bg-zinc-800"
              )}>
                <Zap className={cn("h-7 w-7 text-white", isLive && "animate-bounce")} />
              </div>
              <h1 className="text-4xl font-black text-slate-100 tracking-tightest uppercase font-space-grotesk italic">
                Emergency <span className={cn("transition-colors", isLive ? "text-rose-500" : "text-white")}>Hub</span>
              </h1>
            </div>
            <p className="text-slate-500 font-medium italic">High-latency command channel for critical campus interventions.</p>
          </motion.div>

          {isLive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-3 bg-rose-600/10 border border-rose-500/20 px-6 py-3 rounded-2xl"
            >
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-500 font-black uppercase text-xs tracking-widest">Global Alert Broadcast Active</span>
              <Button 
                onClick={abortEmergency}
                variant="ghost" 
                className="ml-4 h-9 rounded-xl hover:bg-rose-500 hover:text-white font-black uppercase text-[10px] tracking-widest border border-rose-500/30"
              >Abort</Button>
            </motion.div>
          )}
        </div>

        {/* Primary Triple-Threat Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <EmergencyCard 
            title="Fire / Leak" 
            icon={Flame} 
            color="orange" 
            onTrigger={() => triggerEmergency('fire')}
            description="Activate sensors & automated suppression systems."
          />
          <EmergencyCard 
            title="Medical Crisis" 
            icon={Stethoscope} 
            color="blue" 
            onTrigger={() => triggerEmergency('medical')}
            description="Dispatch paramedics to exact GPS coordinates."
          />
          <EmergencyCard 
            title="Intrusion / Threat" 
            icon={ShieldAlert} 
            color="rose" 
            onTrigger={() => triggerEmergency('security')}
            description="Engage full campus perimeter lockdown."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tactical Map Placeholder */}
          <Card className="bg-[#0a1120] border-white/5 shadow-2xl rounded-3xl overflow-hidden min-h-[400px] flex flex-col group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity" />
            <CardHeader className="relative z-10 border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-lg font-black text-white uppercase tracking-tight font-space-grotesk flex items-center gap-3">
                <MapPin className="h-5 w-5 text-rose-500" />
                Spatial Command
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 flex-1 flex items-center justify-center p-12">
               <div className="relative">
                  <div className="w-64 h-64 rounded-full border border-rose-500/10 animate-[ping_4s_linear_infinite]" />
                  <div className="absolute inset-0 w-64 h-64 rounded-full border border-rose-500/20 animate-[ping_3s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 w-4 bg-rose-500 rounded-full shadow-[0_0_20px_#f43f5e] animate-pulse" />
                  </div>
               </div>
               <div className="absolute bottom-8 left-8 space-y-2 bg-[#121a2b]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live Assets Detected</p>
                 <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-emerald-500" />
                    <span className="text-xl font-black text-white">4,281</span>
                 </div>
               </div>
            </CardContent>
            <CardFooter className="relative z-10 bg-white/[0.01] border-t border-white/5 p-6 flex justify-between items-center transition-colors">
               <div className="flex gap-4">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase text-[9px] tracking-widest px-3">GPS Synchronized</Badge>
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black uppercase text-[9px] tracking-widest px-3">CCTV Analytics Live</Badge>
               </div>
               <Button variant="ghost" className="text-slate-500 hover:text-white rounded-xl h-10 w-10 p-0 transition-all">
                 <Siren className="h-4 w-4" />
               </Button>
            </CardFooter>
          </Card>

          {/* Hotline & Broadcast Controls */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-[#0a1120] to-[#121a2b] border-white/5 shadow-2xl rounded-3xl p-8">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest font-space-grotesk mb-6">Direct Dispatch Lines</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <HotlineButton label="Main Security" phone="+1 (555) 911-000" icon={Phone} />
                 <HotlineButton label="Medical Center" phone="+1 (555) 911-123" icon={Stethoscope} />
                 <HotlineButton label="Fire Dept." phone="+1 (555) 911-321" icon={Flame} />
                 <HotlineButton label="Admin Duty" phone="+1 (555) 444-000" icon={Users} />
               </div>
            </Card>

            <Card className="bg-[#0a1120] border-white/5 shadow-2xl rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Broadcast Protocols</h3>
                <Volume2 className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="space-y-4">
                 <ProtocolAction label="SMS Alert (All Users)" active={isLive} />
                 <ProtocolAction label="Mobile Push (SmartCampus App)" active={isLive} />
                 <ProtocolAction label="Public Address (PA) Audio" active={isLive} />
                 <ProtocolAction label="Emergency Exit Illumination" active={isLive} />
              </div>
              <div className="pt-4 border-t border-white/5">
                <Button className="w-full bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 rounded-2xl h-12 font-black uppercase text-[10px] tracking-[0.2em] transition-all">Configure Broadcast Sequence</Button>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}

function EmergencyCard({ title, icon: Icon, color, onTrigger, description }: any) {
  const colorMap: any = {
    orange: "border-orange-500/20 text-orange-500 shadow-orange-500/5",
    blue: "border-blue-500/20 text-blue-500 shadow-blue-500/5",
    rose: "border-rose-500/20 text-rose-500 shadow-rose-500/5"
  };

  const bgMap: any = {
    orange: "hover:bg-orange-500 shadow-orange-500/30",
    blue: "hover:bg-blue-500 shadow-blue-500/30",
    rose: "hover:bg-rose-500 shadow-rose-500/30"
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn("bg-[#0a1120]/50 backdrop-blur-3xl border shadow-2xl rounded-[2.5rem] p-8 group transition-all duration-500 h-full", colorMap[color])}>
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="h-24 w-24 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
             <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity", `bg-${color}-500`)} />
             <Icon className="h-12 w-12 relative z-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">{title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mx-auto italic">{description}</p>
          </div>
          <Button 
            onClick={onTrigger}
            className={cn(
              "w-full h-14 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all bg-white/5 border border-white/5 text-white",
              bgMap[color]
            )}
          >
            Engage
            <ChevronsRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function HotlineButton({ label, phone, icon: Icon }: any) {
  return (
    <button className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-indigo-500/30 transition-all text-left group">
      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-100">{phone}</p>
      </div>
    </button>
  );
}

function ProtocolAction({ label, active }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group transition-all">
       <div className="flex items-center gap-4">
         <div className={cn(
           "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
           active ? "bg-rose-500/20 text-rose-500" : "bg-white/5 text-slate-600"
         )}>
           {active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
         </div>
         <span className={cn(
           "text-[10px] font-black uppercase tracking-widest transition-colors",
           active ? "text-slate-100" : "text-slate-600"
         )}>{label}</span>
       </div>
       {active ? (
         <Badge className="bg-rose-500/20 text-rose-500 border-none uppercase text-[8px] font-black">Executing</Badge>
       ) : (
         <div className="h-2 w-2 rounded-full bg-white/10" />
       )}
    </div>
  );
}
