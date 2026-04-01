'use client';

import { motion } from 'framer-motion';

interface AssetPulseProps {
    status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
}

export default function AssetPulse({ status }: AssetPulseProps) {
    const getColor = () => {
        switch (status) {
            case 'OPERATIONAL': return '#10b981'; // Emerald
            case 'WARNING': return '#f59e0b'; // Amber
            case 'CRITICAL': return '#ef4444'; // Red
            case 'MAINTENANCE': return '#8b5cf6'; // Violet
            default: return '#6b7280';
        }
    };

    const color = getColor();

    return (
        <div className="relative flex items-center justify-center w-4 h-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute w-full h-full rounded-full"
                style={{ backgroundColor: color }}
            />
            <div 
                className="relative z-10 w-2 h-2 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}
