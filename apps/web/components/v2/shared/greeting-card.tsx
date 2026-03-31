'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './cards';

interface GreetingCardProps {
    name: string;
    role: string;
    stats?: {
        label: string;
        value: string | number;
        icon: any;
    }[];
    quickAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function GreetingCard({ name, role, stats, quickAction, className }: GreetingCardProps) {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <GlassCard className={cn("p-8 md:p-12 relative overflow-hidden border-primary/20 bg-primary/[0.03]", className)}>
            {/* Abstract Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[120%] bg-primary/10 blur-[80px] rounded-full rotate-12 pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[80%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="max-w-xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        <Sparkles className="w-3 h-3" /> System Initialized • {role} Portal
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black font-space-grotesk tracking-tight text-slate-100 mb-4"
                    >
                        {greeting}, <span className="text-primary italic">{name}</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 font-medium text-lg leading-relaxed mb-8 max-w-md"
                    >
                        Welcome back to your central command. All campus systems are operating within optimal parameters.
                    </motion.p>

                    {quickAction && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            onClick={quickAction.onClick}
                            className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 group"
                        >
                            {quickAction.label} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                    )}
                </div>

                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl backdrop-blur-md"
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                                </div>
                                <div className="text-2xl font-black font-space-grotesk text-slate-100">{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Digital Heartbeat Subtle Animation */}
            <div className="absolute bottom-10 right-10 flex items-end gap-1 pointer-events-none opacity-20 h-10">
                {[1,2,3,4,5].map(i => (
                    <motion.div 
                        key={i}
                        animate={{ 
                            height: [10, 30, 15, 40, 10],
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 1.5, 
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                        className="w-1 bg-primary rounded-full"
                    />
                ))}
            </div>
        </GlassCard>
    );
}
