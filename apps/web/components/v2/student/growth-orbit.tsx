'use client';

/**
 * Growth Orbit — v1.1.0
 * Specialized visualization for the Student AI Career roadmap.
 * Satellites orbit a central nucleus (the student's current status).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, 
    Target, 
    Briefcase, 
    Code, 
    Database, 
    Cloud, 
    ShieldCheck, 
    Trophy 
} from 'lucide-react';

interface OrbitMilestone {
    phase: string;
    focus: string;
    badge: string;
}

interface GrowthOrbitProps {
    careerTrack: string;
    orbitData: OrbitMilestone[];
    optimalityScore: number;
}

const badgeMap: Record<string, any> = {
    target: Target,
    briefcase: Briefcase,
    code: Code,
    database: Database,
    cloud: Cloud,
    shield: ShieldCheck,
    trophy: Trophy,
    zap: Zap
};

export function GrowthOrbit({ careerTrack, orbitData, optimalityScore }: GrowthOrbitProps) {
    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
            
            {/* Concentric Orbit Rings */}
            {[1, 2, 3].map((ring) => (
                <div 
                    key={ring}
                    className="absolute border border-white/5 rounded-full"
                    style={{ 
                        width: `${ring * 30 + 10}%`, 
                        height: `${ring * 30 + 10}%` 
                    }}
                />
            ))}

            {/* Central Nucleus */}
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(57,193,239,0.3)] border border-white/20"
            >
                <div className="text-[10px] uppercase font-black tracking-tighter opacity-70">Alignment</div>
                <div className="text-3xl font-black">{optimalityScore}%</div>
                <div className="text-[8px] uppercase font-bold px-2 py-0.5 bg-black/20 rounded-full mt-1">Status: Optimized</div>
            </motion.div>

            {/* Orbiting Satellites */}
            {orbitData.map((milestone, index) => {
                const Icon = badgeMap[milestone.badge.toLowerCase()] || Target;
                const orbitRadius = (index + 1) * 15 + 10; // Percentage based radius
                const duration = 20 + index * 10; // Seconds per rotation

                return (
                    <motion.div
                        key={index}
                        animate={{ rotate: 360 }}
                        transition={{ 
                            duration: duration, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                        className="absolute w-full h-full pointer-events-none"
                    >
                        <motion.div 
                            style={{ top: `${50 - orbitRadius}%`, left: '50%' }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group"
                            whileHover={{ scale: 1.2 }}
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-primary shadow-xl group-hover:border-primary/50 transition-colors cursor-help">
                                <Icon className="w-6 h-6" />
                            </div>
                            
                            {/* Hover Tooltip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-40 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 z-50 shadow-2xl">
                                <p className="text-[10px] font-black uppercase text-primary mb-1">{milestone.phase}</p>
                                <p className="text-xs text-white leading-tight font-medium">{milestone.focus}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                );
            })}

            {/* Track Label */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500 mb-1">Target Zenith</p>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">{careerTrack}</h4>
            </div>
        </div>
    );
}
