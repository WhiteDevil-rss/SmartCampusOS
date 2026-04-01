'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Bell, Mail, Smartphone, Shield, 
    BookOpen, Users, Wrench, ShieldAlert, 
    Eye, Save, RefreshCcw, Check
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Channel = 'inApp' | 'email' | 'push';
type Category = 'ACADEMIC' | 'SOCIAL' | 'MAINTENANCE' | 'SYSTEM' | 'EXAM';

interface Preference {
    category: Category;
    channels: Record<Channel, boolean>;
}

const CATEGORIES: { id: Category; label: string; icon: any; description: string }[] = [
    { id: 'ACADEMIC', label: 'Academic Alerts', icon: BookOpen, description: 'Course updates, grades, and assignments.' },
    { id: 'MAINTENANCE', label: 'Campus Infrastructure', icon: Wrench, description: 'Asset health, outages, and repair status.' },
    { id: 'EXAM', label: 'Examination', icon: Shield, description: 'Schedule changes, hall tickets, and results.' },
    { id: 'SOCIAL', label: 'Social Activity', icon: Users, description: 'Event invites and club announcements.' },
    { id: 'SYSTEM', label: 'System Security', icon: ShieldAlert, description: 'Login alerts and account security.' },
];

export default function NotificationSettings() {
    const { user } = useAuthStore();
    const [preferences, setPreferences] = useState<Record<Category, Record<Channel, boolean>>>({
        ACADEMIC: { inApp: true, email: true, push: true },
        SOCIAL: { inApp: true, email: true, push: false },
        MAINTENANCE: { inApp: true, email: true, push: true },
        SYSTEM: { inApp: true, email: true, push: true },
        EXAM: { inApp: true, email: true, push: true },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchPrefs = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/v2/notifications/preferences', {
                params: { userId: user.id },
            });

            const mapped: Record<Category, Record<Channel, boolean>> = {
                ACADEMIC: { inApp: true, email: true, push: true },
                SOCIAL: { inApp: true, email: true, push: false },
                MAINTENANCE: { inApp: true, email: true, push: true },
                SYSTEM: { inApp: true, email: true, push: true },
                EXAM: { inApp: true, email: true, push: true },
            };

            (res.data as Preference[]).forEach((preference) => {
                mapped[preference.category] = preference.channels;
            });

            setPreferences(mapped);
        } catch (error) {
            console.error('Failed to load preferences', error);
            toast.error('Failed to load preferences');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchPrefs();
    }, [fetchPrefs]);

    const toggle = (category: Category, channel: Channel) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [channel]: !prev[category][channel]
            }
        }));
    };

    const handleSave = useCallback(async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const promises = CATEGORIES.map(cat => 
                api.patch('/v2/notifications/preferences', {
                        userId: user.id,
                        category: cat.id,
                        channels: preferences[cat.id]
                    })
            );
            await Promise.all(promises);
            toast.success('Communication preferences synchronized');
        } catch (error) {
            toast.error('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    }, [preferences, user?.id]);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="min-h-screen p-8 bg-[#0a0b0d] text-slate-200">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl ring-1 ring-blue-500/20">
                            <Bell className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Notification Center</h1>
                            <p className="text-slate-400 font-medium mt-1">Configure your global communication matrix</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/50 rounded-2xl border border-white/5 opacity-80 backdrop-blur-xl">
                        <div className="col-span-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500">Alert Category</div>
                        <div className="col-span-2 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-center gap-2">
                            <Eye className="w-3 h-3" /> In-App
                        </div>
                        <div className="col-span-2 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-center gap-2">
                            <Mail className="w-3 h-3" /> Email
                        </div>
                        <div className="col-span-2 text-center text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-center gap-2">
                            <Smartphone className="w-3 h-3" /> Push
                        </div>
                    </div>

                    {CATEGORIES.map((cat, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={cat.id}
                            className="grid grid-cols-12 gap-4 px-6 py-6 bg-slate-900/40 hover:bg-slate-900/60 transition-all rounded-3xl border border-white/5 group ring-1 ring-transparent hover:ring-white/10"
                        >
                            <div className="col-span-6 flex gap-4">
                                <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-slate-700 transition-colors">
                                    <cat.icon className="w-6 h-6 text-slate-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-100">{cat.label}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{cat.description}</p>
                                </div>
                            </div>

                            {(['inApp', 'email', 'push'] as Channel[]).map(chan => (
                                <div key={chan} className="col-span-2 flex items-center justify-center">
                                    <button
                                        onClick={() => toggle(cat.id, chan)}
                                        className={`w-14 h-8 rounded-full transition-all relative p-1 ${
                                            preferences[cat.id][chan] 
                                            ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                                            : 'bg-slate-800'
                                        }`}
                                    >
                                        <motion.div
                                            animate={{ x: preferences[cat.id][chan] ? 24 : 0 }}
                                            className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                                        >
                                            {preferences[cat.id][chan] && <Check className="w-3 h-3 text-blue-600" />}
                                        </motion.div>
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    ))}
                </div>

                <footer className="mt-12 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? (
                            <RefreshCcw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        {saving ? 'Synchronizing...' : 'Save Matrix Configuration'}
                    </button>
                </footer>
            </div>
        </div>
    );
}
