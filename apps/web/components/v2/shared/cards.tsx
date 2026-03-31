"use client";

import * as React from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// --- StatCard Component ---

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number;
  change: number;
  changeDescription?: string;
  icon?: LucideIcon;
  suffix?: string;
  prefix?: string;
  precision?: number;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    title, 
    value, 
    change, 
    changeDescription = "last period", 
    icon: Icon, 
    suffix = "",
    prefix = "",
    precision = 0,
    className, 
    ...props 
  }, ref) => {
    const { onAnimationStart, onDragStart, onDragEnd, onDrag, onAnimationComplete, onAnimationIteration, onMeasureDragConstraints, ...safeProps } = props as any;
    const isPositive = change >= 0;

    const motionValue = useSpring(0, {
      damping: 60,
      stiffness: 100,
    });

    const displayValue = useTransform(motionValue, (latest) =>
      precision > 0 
        ? latest.toFixed(precision).toLocaleString()
        : Math.round(latest).toLocaleString()
    );

    React.useEffect(() => {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: [0.16, 1, 0.3, 1],
      });
      return controls.stop;
    }, [value, motionValue]);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a1120] p-6 group transition-colors duration-200",
          "hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]",
          className
        )}
        {...safeProps}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
          {Icon && <Icon className="w-24 h-24 text-primary rotate-12" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{title}</p>
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/10 transition-colors">
              {Icon && <Icon className="h-4 w-4 text-primary" />}
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xl font-bold text-slate-600">{prefix}</span>}
            <motion.h3 className="text-4xl font-black tracking-tighter text-slate-100">
               {displayValue}
            </motion.h3>
            {suffix && <span className="text-xl font-bold text-slate-600">{suffix}</span>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                isPositive 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              )}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{change}%
            </div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{changeDescription}</span>
          </div>
        </div>

        {/* Shine effect — removed: GPU-expensive 1000ms translate transition */}
      </motion.div>
    );
  }
);
StatCard.displayName = "StatCard";

// --- GlassCard Component ---

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowEffect?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowEffect = true, intensity = 'medium', children, ...props }, ref) => {
    const { onAnimationStart, onDragStart, onDragEnd, onDrag, onAnimationComplete, onAnimationIteration, onMeasureDragConstraints, ...safeProps } = props as any;
    const glassIntensities = {
      low: "bg-[#0a1120]/20 backdrop-blur-sm",
      medium: "bg-[#0a1120]/40 backdrop-blur-md",
      high: "bg-[#0a1120]/60 backdrop-blur-xl",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/5",
          glassIntensities[intensity],
          glowEffect && "shadow-[0_0_50px_rgba(0,0,0,0.5)] shadow-primary/5",
          "group transition-colors duration-200",
          className
        )}
        {...safeProps}
      >
        {/* Grain effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Subtle interior glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="relative z-10">
          {children}
        </div>

        {/* Hover Highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

// Helper components for GlassCard
export const GlassCardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pb-2", className)} {...props}>{children}</div>
);

export const GlassCardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-bold text-slate-100 uppercase tracking-tight", className)} {...props}>{children}</h3>
);

export const GlassCardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs font-bold text-slate-500 uppercase tracking-widest", className)} {...props}>{children}</p>
);

export const GlassCardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props}>{children}</div>
);

export const GlassCardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0 flex items-center border-t border-white/5 mt-4", className)} {...props}>{children}</div>
);
