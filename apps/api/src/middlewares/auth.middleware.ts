import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../lib/firebase-admin';
import prisma from '../lib/prisma';
import { UserRole, RoleHierarchy } from '@smartcampus-os/types';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        entityId: string | null;
        universityId: string | null;
        email?: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Auth Middleware: Missing or invalid Authorization header');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        console.warn(`Auth Middleware: Malformed Authorization header. Parts: ${parts.length}`);
        return res.status(401).json({ error: 'Unauthorized: Malformed token format' });
    }

    const token = parts[1];

    // Debug logging (safely)
    console.log('Auth Middleware: Token received, length:', token?.length || 0);
    if (token) {
        console.log('Auth Middleware: Token start:', token.substring(0, 15), '... end:', token.substring(token.length - 15));
    } else {
        console.error('Auth Middleware: Token extraction resulted in null/undefined!');
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    try {
        // Verify Firebase ID Token
        console.log('Auth Middleware: Verifying token with Firebase Admin...');
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        const { uid, email } = decodedToken;

        // Lookup user in our DB by firebaseUid or email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebaseUid: uid },
                    { email: email }
                ]
            }
        });

        if (!user) {
            console.warn(`Auth Middleware: Rejected login for email: ${email || 'none'} (uid: ${uid}). Not found in local database.`);
            return res.status(401).json({ error: `User not registered in local database. Please add ${email || uid} via Prisma Studio.` });
        }

        // If user found by email but firebaseUid not set, sync it
        if (!user.firebaseUid) {
            await prisma.user.update({
                where: { id: user.id },
                data: { firebaseUid: uid }
            });
        }

        req.user = {
            id: user.id,
            role: user.role as UserRole,
            entityId: user.entityId,
            universityId: user.universityId,
            email: user.email || undefined
        };

        next();
    } catch (err) {
        console.error('Auth Error:', err);
        return res.status(401).json({ error: `Invalid Firebase token. Received: [${token.substring(0, 20)}...] Length: ${token.length}` });
    }
};

export const requireRole = (roles: UserRole | UserRole[] | string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRole = req.user.role as UserRole;
        const userLevel = RoleHierarchy[userRole] || 0;

        if (Array.isArray(roles)) {
            // Backward compatibility: check if user's role is in the allowed list
            const hasLegacyMatch = (roles as string[]).includes(userRole);

            // Hierarchy check: check if user's level is >= any of the requested roles
            const roleLevels = (roles as string[]).map(r => RoleHierarchy[r as UserRole] || 0);
            const maxRequiredLevel = Math.max(...roleLevels);

            if (!hasLegacyMatch && userLevel < maxRequiredLevel) {
                return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
            }
        } else {
            // New hierarchical check
            const requiredLevel = RoleHierarchy[roles as UserRole] || 0;
            if (userLevel < requiredLevel) {
                return res.status(403).json({ error: `Forbidden. Role ${roles} or higher required.` });
            }
        }

        next();
    };
};

export const requirePermission = (module: string, action: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRole = req.user.role as string;

        // Superadmins bypass all permission checks
        if (userRole === UserRole.SUPER_ADMIN) {
            return next();
        }

        try {
            // Check for specific permission in DB
            const permission = await prisma.permission.findFirst({
                where: {
                    roleId: userRole,
                    module: module,
                    action: { in: [action, 'ALL'] },
                    allowed: true
                }
            });

            if (!permission) {
                return res.status(403).json({
                    error: `Forbidden. You do not have ${action} permission for the ${module} module.`
                });
            }

            next();
        } catch (error) {
            console.error('Permission Check Error:', error);
            res.status(500).json({ error: 'Internal server error during permission validation' });
        }
    };
};

export const checkSubscriptionQuota = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(); // Public users ignore quota for now, or we can handle them separately
    }

    try {
        const control = await prisma.subscriptionControl.findUnique({
            where: { userId: req.user.id }
        });

        // If no control set, default to allow for now (Superadmins have no control record usually)
        if (!control) return next();

        if (!control.canSubscribe) {
            return res.status(403).json({ error: 'Your subscription privileges have been suspended.' });
        }

        // Check current usage
        const currentCount = await prisma.subscriber.count({
            where: { creatorId: req.user.id }
        });

        if (currentCount >= control.subscriptionLimit) {
            return res.status(403).json({
                error: `Subscription limit reached (${control.subscriptionLimit}). Please contact Superadmin to upgrade.`
            });
        }

        next();
    } catch (error) {
        console.error('Quota Check Error:', error);
        next(); // Fail-safe
    }
};
