"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthCardProps {
  type?: 'login' | 'signup';
  onSubmit?: (data: any) => void;
  onSocialAuth?: (provider: string) => void;
  isLoading?: boolean;
}

const PremiumAuthCard: React.FC<AuthCardProps> = ({
  type = 'login',
  onSubmit,
  onSocialAuth,
  isLoading = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password });
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-[440px]"
    >
      <div className="relative group">
        {/* Animated Background Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-slate-800 via-primary/20 to-slate-800 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        
        {/* Main Card */}
        <div className="relative bg-[#020817] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-10 text-center">
              <motion.div
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 rounded-2xl bg-[#0a1120] border border-white/5 flex items-center justify-center mb-6 shadow-inner"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-2">
                {type === 'login' ? 'System Access' : 'Create Credentials'}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {type === 'login' 
                  ? 'Enter your institutional identifiers to proceed' 
                  : 'Establish your SmartCampus OS identity'}
              </p>
            </div>

            {/* Social Auth */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => onSocialAuth?.('google')}
                className="flex items-center justify-center gap-3 py-3 bg-[#0a1120]/50 border border-white/5 rounded-xl text-slate-300 hover:text-white hover:bg-[#0a1120] transition-all duration-300 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest">Google</span>
              </button>

              <button
                type="button"
                onClick={() => onSocialAuth?.('github')}
                className="flex items-center justify-center gap-3 py-3 bg-[#0a1120]/50 border border-white/5 rounded-xl text-slate-300 hover:text-white hover:bg-[#0a1120] transition-all duration-300 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest">GitHub</span>
              </button>
            </div>

            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-white/5" />
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                Secure Protocol
              </span>
              <div className="flex-grow border-t border-white/5" />
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity Endpoint</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-12 pr-4 py-4 bg-[#0a1120]/30 border border-white/5 rounded-xl text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encryption Key</label>
                  {type === 'login' && (
                    <a href="#" className="text-[10px] font-bold text-primary hover:text-blue-400 uppercase tracking-widest">Forgot?</a>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-[#0a1120]/30 border border-white/5 rounded-xl text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-mono text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex items-center justify-center py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl overflow-hidden shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2 tracking-widest uppercase text-xs">
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {type === 'login' ? 'Establish Session' : 'Create Identity'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="text-xs text-slate-600 font-medium">
                {type === 'login' ? "New operative?" : "Already registered?"}{' '}
                <button 
                  onClick={() => console.log('Toggle type')} // Handle externally in real app
                  className="text-primary hover:text-blue-400 font-bold transition-colors uppercase tracking-widest ml-1"
                >
                  {type === 'login' ? 'Register Account' : 'Return to Login'}
                </button>
              </p>
            </div>
          </div>

          {/* Security Indicator */}
          <div className="bg-[#0a1120]/50 border-t border-white/5 p-4 flex items-center justify-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">TLS 1.3 Encryption Active</span>
          </div>
        </div>
      </div>
      
      {/* Footer Support */}
      <div className="mt-8 flex justify-center gap-6">
        <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">Privacy Charter</a>
        <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">Infosec</a>
        <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors">Legal</a>
      </div>
    </motion.div>
  );
};

export default PremiumAuthCard;
