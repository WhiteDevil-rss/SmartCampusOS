'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/v2/shared/cards';
import { IndustrialButton } from '@/components/v2/shared/inputs';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Lock,
  Zap,
  Info
} from 'lucide-react';
import { format, addDays, startOfDay, addHours, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/toast-alert';
import { api } from '@/lib/api';

interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  requiresApproval: boolean;
}

export function ResourceScheduler({ selectedAsset }: { selectedAsset: Resource | null }) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; reason?: string } | null>(null);
  const [booking, setBooking] = useState(false);
  const [purpose, setPurpose] = useState('');
  const { showToast } = useToast();

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  
  const timeSlots = [
    { start: "08:00", end: "10:00" },
    { start: "10:00", end: "12:00" },
    { start: "12:00", end: "14:00" },
    { start: "14:00", end: "16:00" },
    { start: "16:00", end: "18:00" },
    { start: "18:00", end: "20:00" },
  ];

  useEffect(() => {
    if (selectedAsset && selectedSlot) {
      validateSlot();
    }
  }, [selectedSlot, selectedDate, selectedAsset]);

  const validateSlot = async () => {
    if (!selectedAsset || !selectedSlot) return;
    
    setChecking(true);
    setAvailability(null);
    try {
      const startTime = new Date(selectedDate);
      const [sh, sm] = selectedSlot.start.split(':');
      startTime.setHours(parseInt(sh), parseInt(sm));

      const endTime = new Date(selectedDate);
      const [eh, em] = selectedSlot.end.split(':');
      endTime.setHours(parseInt(eh), parseInt(em));

      const response = await api.post('/v1/resources/check-availability', {
        resourceId: selectedAsset.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });
      setAvailability(response.data);
    } catch (err) {
      console.error('Validation failed', err);
    } finally {
      setChecking(false);
    }
  };

  const handleBook = async () => {
    if (!selectedAsset || !selectedSlot || !purpose) return;
    
    setBooking(true);
    try {
      const startTime = new Date(selectedDate);
      const [sh, sm] = selectedSlot.start.split(':');
      startTime.setHours(parseInt(sh), parseInt(sm));

      const endTime = new Date(selectedDate);
      const [eh, em] = selectedSlot.end.split(':');
      endTime.setHours(parseInt(eh), parseInt(em));

      await api.post('/v1/resources/book', {
        resourceId: selectedAsset.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose
      });

      showToast('success', 'Asset Reserved Successfully!');
      setSelectedSlot(null);
      setPurpose('');
      setAvailability(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (!selectedAsset) {
    return (
      <GlassCard className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10 bg-slate-900/20">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/5 flex items-center justify-center mb-6 border border-white/5 animate-pulse">
          <Info className="w-10 h-10 text-blue-500/40" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Vector Unassigned</h3>
        <p className="text-sm text-slate-500 max-w-[280px] mt-2 font-medium">Select a research asset from the registry to initiate chronological mapping.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="h-full flex flex-col p-6 border-white/5 bg-slate-950/40">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <Calendar className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase font-space-grotesk">{selectedAsset.name}</h2>
          <p className="text-[10px] text-emerald-200/40 font-mono tracking-widest uppercase">Chronos Mapping Module</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Date Selection */}
        <section>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Deployment Window</p>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {dates.map((date) => {
               const active = isSameDay(date, selectedDate);
               return (
                 <button
                   key={date.toISOString()}
                   onClick={() => setSelectedDate(date)}
                   className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border transition-all ${
                     active ? 'bg-emerald-500/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'bg-white/5 border-white/5 hover:border-white/10'
                   }`}
                 >
                   <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
                     {format(date, 'eee')}
                   </span>
                   <span className={`text-xl font-black ${active ? 'text-white' : 'text-slate-300'}`}>
                     {format(date, 'dd')}
                   </span>
                 </button>
               );
            })}
          </div>
        </section>

        {/* Slot Selection */}
        <section>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Tactical Slots</p>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot) => {
              const active = selectedSlot?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                    active ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-black font-mono ${active ? 'text-white' : 'text-slate-300'}`}>
                      {slot.start} - {slot.end}
                    </span>
                  </div>
                  {active && <Zap className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Validation Status */}
        <AnimatePresence mode="wait">
          {checking ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center gap-3"
            >
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-xs font-black text-blue-300 uppercase tracking-widest font-mono">Verifying Infrastructure Integrity...</span>
            </motion.div>
          ) : availability && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-3xl border ${
                availability.available ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
              }`}
            >
              <div className="flex items-start gap-4">
                {availability.available ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                ) : (
                  <Lock className="w-6 h-6 text-rose-500 shrink-0" />
                )}
                <div>
                  <h4 className={`font-black uppercase tracking-tight ${availability.available ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {availability.available ? 'Slot Open' : 'Access Restricted'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                    {availability.available 
                      ? 'The chosen tactical window is cleared of all academic and research conflicts.' 
                      : availability.reason}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Form */}
        {availability?.available && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Internal Purpose Vector</p>
              <textarea 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Declare Research Intent..."
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 min-h-[100px] resize-none font-medium"
              />
            </div>
            
            <IndustrialButton 
              onClick={handleBook}
              disabled={booking || !purpose}
              variant="primary"
              className="w-full h-14 rounded-2xl uppercase font-black tracking-[0.2em] text-xs shadow-xl shadow-emerald-500/20 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-400/20 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reservation'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </IndustrialButton>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
