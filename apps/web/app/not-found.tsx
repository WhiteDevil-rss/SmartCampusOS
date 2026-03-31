'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LuArrowLeft, LuLayoutDashboard, LuCompass, LuTerminal, LuCpu, LuShieldAlert } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen w-full bg-[#020817] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-blue-500/10 blur-[140px] rounded-full animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,112,255,0.05),transparent_70%)]" />
            </div>

            {/* Matrix/Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] z-1 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <div className="absolute inset-0 z-1 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Floating Terminal Lines */}
            <div className="absolute top-20 left-10 opacity-10 hidden lg:block font-mono text-[10px] text-primary space-y-1 z-0">
                <p># ERROR CAUGHT: 0x404_ROUTE_UNDEFINED</p>
                <p># ATTEMPTING RECOVERY...</p>
                <p># SCANNING SECTOR [7-F]...</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="flex items-center justify-center w-28 h-28 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-2xl mb-10 relative group backdrop-blur-xl">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <LuShieldAlert className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 animate-pulse border-4 border-[#020817]" />
                    </div>
                </motion.div>

                <div className="relative mb-10">
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[12rem] md:text-[22rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-100/10 select-none font-space-grotesk drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                        404
                    </motion.h1>
                    <div className="absolute inset-0 flex items-center justify-center -z-10 blur-3xl opacity-20 bg-primary/30 rounded-full scale-150" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-[0.3em]">System Fault</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol V2.4</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black font-space-grotesk text-slate-100 tracking-tight uppercase italic">
                            Route <span className="text-primary not-italic">Desynchronized</span>
                        </h2>
                    </div>

                    <p className="text-lg text-slate-500 max-w-xl mx-auto mb-16 font-medium leading-relaxed">
                        The requested terminal endpoint could not be authenticated or has been re-routed by the institutional firewall. 
                        Please return to the centralized command hub.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button 
                                size="lg" 
                                className="w-full bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] px-10 h-16 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-4 group"
                            >
                                <LuLayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Return to Hub
                            </Button>
                        </Link>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => router.back()}
                            className="w-full sm:w-auto rounded-[1.5rem] px-10 h-16 font-black uppercase tracking-widest border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/10 text-slate-400 hover:text-white transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-4"
                        >
                            <LuArrowLeft className="w-5 h-5" />
                            Previous Node
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom System Bar */}
            <div className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-4 z-10 px-8">
                <div className="flex items-center gap-6 opacity-20">
                    <div className="flex items-center gap-2">
                        <LuCpu className="w-3 h-3 text-slate-400" />
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Engine Stable</span>
                    </div>
                    <div className="w-px h-2 bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <LuTerminal className="w-3 h-3 text-slate-400" />
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Node ID: 0x404</span>
                    </div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <span className="text-[9px] font-black tracking-[0.5em] uppercase text-slate-700 italic">
                    SmartCampus OS Institutional Intelligence Suite
                </span>
            </div>
        </div>
    );
}
