'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { 
  Dna, 
  Box, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Zap, 
  ShieldCheck,
  FlaskConical,
  Cpu,
  Microscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

// Mock types for now - will be replaced with real API client
interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  building: string;
  floor: string;
  status: string;
  isResearchOnly: boolean;
  requiresApproval: boolean;
  specifications: any;
}

const TYPE_ICONS: Record<string, any> = {
  LAB: FlaskConical,
  EQUIPMENT: Cpu,
  SPACE: Box,
  COMPUTE: Zap,
  MICROSCOPE: Microscope,
  SEQUENCER: Dna
};

export function AssetRegistry({ onSelect }: { onSelect?: (asset: Resource) => void }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get('/v1/resources');
        setResources(response.data);
      } catch (err) {
        console.error('Failed to load assets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(search.toLowerCase()) || 
                         res.building.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || res.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <GlassCard className="h-full flex flex-col p-6 min-h-[600px] border-white/5 bg-slate-900/40">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Box className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Asset Registry</h2>
            <p className="text-[10px] text-blue-200/40 font-mono tracking-widest uppercase">Research Marketplace v22.1</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Vectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all w-64 font-medium"
            />
          </div>
          <IndustrialButton variant="outline" className="px-3 rounded-xl border-white/5">
            <Filter className="w-4 h-4" />
          </IndustrialButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar content-start">
        <AnimatePresence mode="popLayout">
          {filteredResources.map((asset, idx) => {
            const Icon = TYPE_ICONS[asset.type] || Box;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                key={asset.id}
                className="group p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => onSelect?.(asset)}
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 group-hover:border-blue-500/50 transition-all shadow-xl">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-lg text-white truncate leading-tight tracking-tight uppercase font-space-grotesk">{asset.name}</h3>
                      {asset.requiresApproval && (
                        <div className="p-1 px-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-tighter">
                          Approval Required
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-500/50" />
                        {asset.building} (F{asset.floor})
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Users className="w-3.5 h-3.5 text-blue-500/50" />
                        Cap: {asset.capacity}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-black uppercase tracking-widest text-[9px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {asset.status === 'AVAILABLE' ? 'Online' : 'In Transit'}
                      </div>
                    </div>
                  </div>
                </div>

                {asset.isResearchOnly && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-1">
                      {asset.specifications && Object.entries(asset.specifications).slice(0, 3).map(([key, value]: any) => (
                        <span key={key} className="px-2 py-0.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-[9px] font-mono text-blue-300">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      Research Restricted
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
          {filteredResources.length} Assets Synchronized
        </p>
        <IndustrialButton variant="primary" className="h-10 px-8 rounded-xl uppercase font-black text-[10px] tracking-widest shadow-lg shadow-blue-500/20">
          Request Custom Config
        </IndustrialButton>
      </div>
    </GlassCard>
  );
}
