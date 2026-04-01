"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// --- IndustrialButton Component ---

interface IndustrialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const IndustrialButton: React.FC<IndustrialButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading = false,
  ...props
}) => {
  const { onAnimationStart, onDragStart, onDragEnd, onDrag, onAnimationComplete, onAnimationIteration, onMeasureDragConstraints, ...safeProps } = props as any;
  const [isPressed, setIsPressed] = useState(false);


  const sizeClasses = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
  };

  const variantClasses = {
    primary: "bg-[#0a1120] text-white border-white/10 hover:border-primary/50 shadow-glow shadow-primary/5",
    secondary: "bg-primary text-white border-primary/50 hover:bg-primary/90",
    outline: "bg-transparent text-slate-300 border-white/5 hover:text-white hover:border-white/20",
    ghost: "bg-transparent text-slate-400 border-transparent hover:text-slate-100 hover:bg-white/5",
  };

  return (
      <motion.button
        onClick={onClick}
        disabled={disabled || isLoading}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(
          "group relative overflow-hidden font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 uppercase tracking-[0.15em] border rounded-xl cursor-pointer",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...safeProps}
      >
      {/* Gloss effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Internal blue glow */}
      {variant === 'primary' && (
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(0, 112, 255, 0.1), transparent 70%)",
          }}
        />
      )}

      {/* Status dot */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary"
          animate={{
            boxShadow: [
              "0 0 5px rgba(0, 112, 255, 0.5)",
              "0 0 15px rgba(0, 112, 255, 0.8)",
              "0 0 5px rgba(0, 112, 255, 0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {children}
            {Icon && <Icon className="h-3.5 w-3.5" />}
          </>
        )}
      </span>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100 shadow-[0_0_10px_rgba(0,112,255,1)]"
      />
    </motion.button>
  );
};

// --- ModernInput Component ---

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  error,
  icon: Icon,
  className = "",
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && (
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block">
          {label}
        </label>
      )}
      
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Border glow wrapper */}
        <motion.div
          className="absolute -inset-[1px] rounded-xl"
          animate={{
            background: isFocused
              ? "linear-gradient(90deg, rgba(0, 112, 255, 0.3), rgba(59, 130, 246, 0.2), rgba(0, 112, 255, 0.3))"
              : "linear-gradient(90deg, rgba(30, 41, 59, 0.5), rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.5))",
          }}
          transition={{ duration: 0.3 }}
        />

        <div
          className={cn(
            "relative overflow-hidden rounded-xl transition-all duration-300 bg-[#0a1120]/80 backdrop-blur-xl border border-white/5",
            isFocused && "border-primary/30"
          )}
        >
          {/* Internal radial highlight */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: isFocused
                ? "radial-gradient(circle at 50% 0%, rgba(0, 112, 255, 0.05), transparent 70%)"
                : "none",
            }}
          />

          <div className="relative flex items-center">
            {Icon && (
              <Icon className={cn(
                "ml-4 h-4 w-4 transition-colors duration-300",
                isFocused ? "text-primary" : "text-slate-600"
              )} />
            )}
            
            <input
              disabled={disabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "w-full bg-transparent px-4 py-4 text-slate-100 placeholder-slate-700 outline-none font-mono text-sm transition-opacity",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              {...props}
            />
          </div>

          {/* Animated bottom progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary to-blue-400"
            initial={{ width: "0%" }}
            animate={{ width: isFocused ? "100%" : "0%" }}
            transition={{ duration: 0.4, ease: "circOut" }}
            style={{
              boxShadow: isFocused ? "0 0 10px rgba(0, 112, 255, 0.5)" : "none",
            }}
          />
        </div>
      </motion.div>
      
      {error && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

// Aliases for Industrial theme consistency 
export const IndustrialInput = ModernInput;

export const IndustrialSelect: React.FC<any> = ({ children, className, ...props }) => (
  <select
    className={cn(
      "w-full bg-[#0a1120]/80 backdrop-blur-xl border border-white/5 rounded-xl px-4 py-4 text-slate-100 outline-none font-mono text-sm focus:border-primary/30 transition-all appearance-none cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
  </select>
);
