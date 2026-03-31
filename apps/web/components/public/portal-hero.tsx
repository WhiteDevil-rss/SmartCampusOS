'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { University } from '@smartcampus-os/types';
import { LuGraduationCap as GraduationCap, LuMapPin as MapPin, LuUsers as Users, LuBookOpen as BookOpen } from 'react-icons/lu';

interface PortalHeroProps {
    university: any; // We'll use the extended type from the API
}

export const PortalHero = ({ university }: PortalHeroProps) => {
    return (
        <section className="relative w-full py-20 overflow-hidden bg-slate-950">
            {/* Background Gradient/Mesh */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/30 blur-[120px] rounded-full" />
            </div>

            <div className="container relative z-10 px-4 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center px-4 py-1 mb-6 text-sm font-medium border rounded-full bg-blue-500/10 border-blue-500/20 text-blue-400">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Welcome to the official portal
                    </div>
                    
                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
                        {university.name}
                    </h1>
                    
                    <p className="flex items-center justify-center mb-10 text-xl text-slate-400">
                        <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                        {university.location || 'Global Campus'}
                    </p>

                    <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
                        <div className="p-6 transition-colors border rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
                            <Users className="w-8 h-8 mb-4 text-blue-400" />
                            <div className="text-3xl font-bold text-white">{university.stats?.students || '2,500+'}</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Students</div>
                        </div>
                        <div className="p-6 transition-colors border rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
                            <BookOpen className="w-8 h-8 mb-4 text-indigo-400" />
                            <div className="text-3xl font-bold text-white">{university.stats?.departments || '12'}</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Departments</div>
                        </div>
                        <div className="p-6 transition-colors border rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
                            <GraduationCap className="w-8 h-8 mb-4 text-emerald-400" />
                            <div className="text-3xl font-bold text-white">{university.programs?.length || '40+'}</div>
                            <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Programs</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Button size="lg" className="px-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25">
                            Apply Now
                        </Button>
                        <Button variant="outline" size="lg" className="px-8 font-semibold border-white/20 text-white hover:bg-white/5 rounded-xl backdrop-blur-sm">
                            View Programs
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
