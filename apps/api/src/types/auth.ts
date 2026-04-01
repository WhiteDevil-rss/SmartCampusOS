import { Request } from 'express';
import { UserRole } from '@smartcampus-os/types';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        entityId: string | null;
        universityId: string | null;
        email?: string;
    };
}
