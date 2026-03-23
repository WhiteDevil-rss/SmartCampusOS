'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LuChevronDown } from 'react-icons/lu';

export interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

const SelectContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}>({
    open: false,
    setOpen: () => {},
});

export const Select = ({ value, onValueChange, children }: SelectProps) => {
    const [open, setOpen] = React.useState(false);
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = ({ className, children, ...props }: any) => {
    const { open, setOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            {children}
            <LuChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
};

export const SelectValue = ({ placeholder, ...props }: any) => {
    const { value } = React.useContext(SelectContext);
    return <span className="truncate">{value || placeholder}</span>;
};

export const SelectContent = ({ className, children, ...props }: any) => {
    const { open } = React.useContext(SelectContext);
    if (!open) return null;
    return (
        <div
            className={cn(
                'absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95',
                className
            )}
            {...props}
        >
            <div className="p-1 bg-white dark:bg-[#0a0a0c]">{children}</div>
        </div>
    );
};

export const SelectItem = ({ value, className, children, ...props }: any) => {
    const { onValueChange, setOpen } = React.useContext(SelectContext);
    return (
        <div
            className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none hover:bg-slate-100 dark:hover:bg-white/10 transition-colors',
                className
            )}
            onClick={() => {
                onValueChange?.(value);
                setOpen(false);
            }}
            {...props}
        >
            {children}
        </div>
    );
};
