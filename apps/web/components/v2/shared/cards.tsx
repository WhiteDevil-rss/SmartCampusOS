"use client";

import * as React from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// --- StatCard Component ---

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number | string;
  change?: number;
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
    const isPositive = (change || 0) >= 0;

    const motionValue = useSpring(0, {
      damping: 60,
      stiffness: 100,
    });

    const displayValue = useTransform(motionValue, (latest) => {
      if (typeof value === 'string') return value;
      return precision > 0 
        ? latest.toFixed(precision).toLocaleString()
        : Math.round(latest).toLocaleString();
    });

    React.useEffect(() => {
      if (typeof value === 'number') {
        const controls = animate(motionValue, value, {
          duration: 2,
          ease: [0.16, 1, 0.3, 1],
        });
        return controls.stop;
      }
    }, [value, motionValue]);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "relative overflow-hidden rounded-[2.5rem] border border-primary/10 bg-surface/60 p-8 group transition-all duration-300 backdrop-blur-3xl",
          "hover:border-primary/30 hover:bg-surface/80 hover:shadow-2xl hover:shadow-primary/5",
          className
        )}
        {...safeProps}
      >
        <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
          {Icon && <Icon className="w-24 h-24 text-primary rotate-12" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em]">{title}</p>
            <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors shadow-inner shadow-primary/10">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            {prefix && <span className="text-2xl font-black text-muted-foreground/40">{prefix}</span>}
            <motion.h3 className="text-5xl font-black tracking-tight text-foreground">
               {typeof value === 'string' ? value : displayValue}
            </motion.h3>
            {suffix && <span className="text-2xl font-black text-muted-foreground/40">{suffix}</span>}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                  isPositive 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                )}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? "+" : ""}{change}%
              </div>
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{changeDescription}</span>
            </div>
          )}
        </div>
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
      low: "bg-surface/20",
      medium: "bg-surface/50",
      high: "bg-surface/80",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "relative overflow-hidden rounded-[2.5rem] border border-primary/10",
          glassIntensities[intensity],
          "backdrop-blur-3xl",
          glowEffect && "shadow-2xl shadow-primary/5",
          "group transition-all duration-300",
          className
        )}
        {...safeProps}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

// Helper components for GlassCard
export const GlassCardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-8 pb-4", className)} {...props}>{children}</div>
);

export const GlassCardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-2xl font-black text-foreground tracking-tight", className)} {...props}>{children}</h3>
);

export const GlassCardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]", className)} {...props}>{children}</p>
);

export const GlassCardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-8", className)} {...props}>{children}</div>
);

export const GlassCardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-8 pt-0 flex items-center border-t border-primary/10 mt-4", className)} {...props}>{children}</div>
);
