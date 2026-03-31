"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Server,
  Zap,
  Shield
} from 'lucide-react';

// Utility function (inline to avoid dependency issues for now)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  colSpan?: string;
  rowSpan?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon,
  colSpan = "col-span-1",
  rowSpan = "row-span-1"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative bg-[#0a1120] border border-white/5 rounded-lg p-6 hover:border-primary/40 transition-all duration-300",
        colSpan,
        rowSpan
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-white/5 rounded-md group-hover:bg-primary/10 transition-colors duration-300">
            {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded",
            trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Chart Component
interface ChartCardProps {
  title: string;
  colSpan?: string;
  rowSpan?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title,
  colSpan = "col-span-2",
  rowSpan = "row-span-2"
}) => {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    const generateData = () => {
      const newData = Array.from({ length: 20 }, () => Math.random() * 100);
      setData(newData);
    };
    
    generateData();
    const interval = setInterval(generateData, 3000);
    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...data, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "bg-[#0a1120] border border-white/5 rounded-lg p-6 hover:border-primary/40 transition-all duration-300",
        colSpan,
        rowSpan
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
        <Activity className="w-4 h-4 text-primary" />
      </div>
      
      <div className="h-full flex items-end gap-1">
        {data.map((value, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.02 }}
            className="flex-1 bg-gradient-to-t from-primary to-blue-400 rounded-sm min-h-[4px]"
          />
        ))}
      </div>
    </motion.div>
  );
};

// Activity Feed Component
interface ActivityFeedProps {
  colSpan?: string;
  rowSpan?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  colSpan = "col-span-1",
  rowSpan = "row-span-3"
}) => {
  const [activities, setActivities] = useState([
    { id: '1', user: 'System', action: 'Backup completed', time: '2m ago', status: 'success' },
    { id: '2', user: 'Admin', action: 'Config updated', time: '5m ago', status: 'success' },
    { id: '3', user: 'Monitor', action: 'High CPU usage', time: '8m ago', status: 'warning' },
    { id: '4', user: 'API', action: 'Rate limit reached', time: '12m ago', status: 'error' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now().toString(),
        user: ['System', 'Admin', 'Monitor', 'API'][Math.floor(Math.random() * 4)],
        action: ['Task completed', 'Update deployed', 'Alert triggered', 'Request processed'][Math.floor(Math.random() * 4)],
        time: 'Just now',
        status: (['success', 'warning', 'error'][Math.floor(Math.random() * 3)] as 'success' | 'warning' | 'error')
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 5)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "bg-[#0a1120] border border-white/5 rounded-lg p-6 hover:border-primary/40 transition-all duration-300 overflow-hidden",
        colSpan,
        rowSpan
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Activity Feed</h3>
        <Clock className="w-4 h-4 text-primary" />
      </div>
      
      <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 p-3 bg-white/5 rounded-md hover:bg-white/10 transition-colors"
            >
              <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", getStatusColor(activity.status))} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 font-medium">{activity.user}</p>
                <p className="text-xs text-slate-500 truncate">{activity.action}</p>
              </div>
              <span className="text-xs text-slate-600 flex-shrink-0">{activity.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Status Card Component
interface StatusCardProps {
  title: string;
  status: string;
  icon: React.ReactNode;
  colSpan?: string;
  rowSpan?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  status, 
  icon,
  colSpan = "col-span-1",
  rowSpan = "row-span-1"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn(
        "bg-[#0a1120] border border-white/5 rounded-lg p-6 hover:border-primary/40 transition-all duration-300",
        colSpan,
        rowSpan
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-100">{status}</p>
        </div>
        <div className="p-3 bg-white/5 rounded-md">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
interface BentoGridDashboardProps {
  userName?: string;
  role?: string;
  customMetricCards?: Array<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ElementType;
    changeDescription?: string;
    suffix?: string;
  }>;
}

export const BentoGridDashboard: React.FC<BentoGridDashboardProps> = ({ 
  userName = "Admin", 
  role = "ADMIN",
  customMetricCards 
}) => {
  return (
    <div className="w-full space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest shadow-glow-blue shadow-primary/20">
                {role} Context
               </span>
               <div className="w-1 h-1 rounded-full bg-slate-700" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v4.0.1 Stable</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
              Terminal Overview
            </h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">
              Welcome back, <span className="text-slate-300">{userName}</span>. System diagnostics nominal.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#09090b] bg-white/5 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900" />
                  </div>
                ))}
             </div>
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">+12 Nodes Online</span>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]">
          {/* Metrics Row */}
          {customMetricCards ? (
            customMetricCards.map((card, idx) => (
              <MetricCard
                key={idx}
                title={card.title}
                value={`${card.value}${card.suffix || ''}`}
                change={card.change}
                trend={card.change >= 0 ? 'up' : 'down'}
                icon={<card.icon className="w-5 h-5 text-primary" />}
              />
            ))
          ) : (
            <>
              <MetricCard
                title="Revenue"
                value="$45.2K"
                change={12.5}
                trend="up"
                icon={<DollarSign className="w-5 h-5 text-primary" />}
              />
              <MetricCard
                title="Active Users"
                value="2,847"
                change={8.3}
                trend="up"
                icon={<Users className="w-5 h-5 text-primary" />}
              />
              <MetricCard
                title="Orders"
                value="1,234"
                change={-3.2}
                trend="down"
                icon={<Package className="w-5 h-5 text-primary" />}
              />
              <MetricCard
                title="Conversion"
                value="3.24%"
                change={5.7}
                trend="up"
                icon={<TrendingUp className="w-5 h-5 text-primary" />}
              />
            </>
          )}

          {/* Chart Section */}
          <ChartCard 
            title="Sytem Throughput (24h)"
            colSpan="col-span-1 md:col-span-2 lg:col-span-3"
            rowSpan="row-span-2"
          />

          {/* Activity Feed */}
          <ActivityFeed 
            colSpan="col-span-1"
            rowSpan="row-span-3"
          />

          {/* Status Cards */}
          <StatusCard
            title="Core Status"
            status="Operational"
            icon={<Server className="w-5 h-5 text-emerald-500" />}
          />
          
          <StatusCard
            title="Latency"
            status="45ms"
            icon={<Zap className="w-5 h-5 text-primary" />}
          />
          
          <StatusCard
            title="Kernel Security"
            status="L3 Encrypted"
            icon={<Shield className="w-5 h-5 text-blue-500" />}
          />
        </div>
    </div>
  );
};

