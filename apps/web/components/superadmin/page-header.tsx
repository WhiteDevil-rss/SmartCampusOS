import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatItem {
    label: string;
    value: ReactNode;
}

interface SuperAdminPageHeaderProps {
    eyebrow?: string;
    title: string;
    description: string;
    icon?: ReactNode;
    actions?: ReactNode;
    stats?: StatItem[];
    className?: string;
}

export function SuperAdminPageHeader({
    eyebrow = 'Superadmin Console',
    title,
    description,
    icon,
    actions,
    stats = [],
    className,
}: SuperAdminPageHeaderProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
                'relative overflow-hidden rounded-[2.5rem] border border-primary/10 bg-surface/80 p-8 text-foreground shadow-2xl shadow-primary/5 backdrop-blur-3xl md:p-10',
                className,
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30" />
            <div className="absolute -right-24 -top-24 size-64 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-indigo-500/10 blur-[100px]" />

            <div className="relative flex flex-col gap-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {icon ? (
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner shadow-primary/20 backdrop-blur-md">
                                {icon}
                            </div>
                        ) : null}

                        <div className="flex max-w-3xl flex-col gap-4">
                            <Badge variant="ghost" className="w-fit rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                {eyebrow}
                            </Badge>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">
                                    {title}
                                </h1>
                                <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground/80 md:text-xl">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {actions ? (
                        <div className="flex shrink-0 items-center gap-3 self-start lg:mt-2">
                            {actions}
                        </div>
                    ) : null}
                </div>

                {stats.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i + 0.3, duration: 0.5 }}
                                className="group relative overflow-hidden rounded-3xl border border-primary/10 bg-primary/5 px-6 py-6 transition-all hover:border-primary/30 hover:bg-primary/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
                                        {stat.label}
                                    </div>
                                    <div className="mt-2 text-3xl font-black tracking-tight text-foreground">
                                        {stat.value}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : null}
            </div>
        </motion.section>
    );
}
