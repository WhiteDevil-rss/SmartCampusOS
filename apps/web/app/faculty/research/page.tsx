'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard-layout';
import { facultyNavItems } from '../page';
import { AssetRegistry } from '@/components/faculty/asset-registry';
import { ResourceScheduler } from '@/components/faculty/resource-scheduler';
import { motion } from 'framer-motion';
import { FlaskConical, Beaker, History, Layers } from 'lucide-react';
import { GlassCard } from '@/components/v2/shared/cards';

export default function ResearchHubPage() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  return (
    <ProtectedRoute allowedRoles={['FACULTY']}>
      <DashboardLayout
        title="Faculty Research Hub"
        navItems={facultyNavItems}
      >
        <div className="p-6 md:p-10 space-y-10 max-w-[1600px] mx-auto pb-32">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-blue-400 mb-2">
                <FlaskConical className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Infrastructure Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                Research <span className="text-blue-500">Logistics</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-2xl text-lg">
                Coordinate specialized campus assets, synchronize laboratory windows, and manage high-performance equipment reservations for advanced research initiatives.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <GlassCard className="p-4 px-6 flex items-center gap-4 border-white/5 bg-slate-900/40">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Reserves</div>
                  <div className="text-xl font-black text-white leading-none mt-1">12</div>
                </div>
              </GlassCard>
              <GlassCard className="p-4 px-6 flex items-center gap-4 border-white/5 bg-slate-900/40">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Slots</div>
                  <div className="text-xl font-black text-white leading-none mt-1">48</div>
                </div>
              </GlassCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Registry (Marketplace) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7 xl:col-span-8"
            >
              <AssetRegistry onSelect={setSelectedAsset} />
            </motion.div>

            {/* Tactical Scheduler */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 xl:col-span-4 sticky top-10"
            >
              <ResourceScheduler selectedAsset={selectedAsset} />
            </motion.div>
          </div>

          {/* Footer Branding */}
          <div className="pt-10 border-t border-white/5 flex items-center justify-between opacity-30">
             <div className="flex items-center gap-3">
               <Beaker className="w-5 h-5 text-blue-400" />
               <span className="text-xs font-black uppercase tracking-widest font-mono text-white">SmartCampus Advanced Research OS</span>
             </div>
             <span className="text-[10px] font-mono text-slate-500">LOG_STRAT_VER_22.1.0</span>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
