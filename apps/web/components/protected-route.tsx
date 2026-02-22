'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: Array<'SUPERADMIN' | 'UNI_ADMIN' | 'DEPT_ADMIN' | 'FACULTY'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Basic hydration wait
        setIsReady(true);

        if (!isAuthenticated || !user) {
            router.push('/login');
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            // Redirect to correct dashboard or fallback
            switch (user.role) {
                case 'SUPERADMIN': router.push('/superadmin'); break;
                case 'UNI_ADMIN': router.push('/dashboard'); break;
                case 'DEPT_ADMIN': router.push('/department'); break;
                case 'FACULTY': router.push('/faculty-panel'); break;
                default: router.push('/login');
            }
        }
    }, [isAuthenticated, user, router, allowedRoles]);

    if (!isReady || !isAuthenticated || !user || !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
