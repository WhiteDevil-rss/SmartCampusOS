"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto", className)}>
            {children}
        </div>
    );
}

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    colSpan?: number;
    rowSpan?: number;
}

function BentoCard({ children, className, colSpan = 1, rowSpan = 1, ...props }: BentoCardProps) {
    return (
        <div
            {...props}
            className={cn(
                "group relative p-8 rounded-[2.5rem] overflow-hidden",
                "transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)",
                "border border-white/10 bg-surface/10 backdrop-blur-[40px]",
                "hover:border-primary/50 hover:bg-surface/20 hover:-translate-y-2 hover:shadow-glow",
                "active:scale-[0.985] active:brightness-110 active:duration-100",
                colSpan === 1 ? "md:col-span-1" : 
                colSpan === 2 ? "md:col-span-2" : 
                colSpan === 3 ? "md:col-span-3" : "md:col-span-4",
                rowSpan === 2 ? "md:row-span-2" : "md:row-span-1",
                className
            )}
        >
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:16px_16px]" />
            </div>

            {/* Content Wrapper */}
            <div className="relative h-full flex flex-col">
                {children}
            </div>

            {/* Glowing Border Effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl p-px bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
}

export { BentoGrid, BentoCard }

