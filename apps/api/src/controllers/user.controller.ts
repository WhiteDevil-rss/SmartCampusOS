import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { userService } from '../services/user.service';

/**
 * Helper to get scoping filters for listing users
 */
const getScopedFilter = (req: Request) => {
    const user = (req as any).user;
    if (!user) return {};

    switch (user.role) {
        case 'SUPERADMIN':
            return {};
        case 'UNI_ADMIN':
            return { universityId: user.universityId };
        case 'DEPT_ADMIN':
            return {
                universityId: user.universityId,
                entityId: user.entityId
            };
        default:
            return { id: user.id }; // Regular users only see themselves
    }
};

/**
 * Helper to validate if actor has permission to manage target user
 */
const validateAccess = (actor: any, target: any) => {
    if (actor.role === 'SUPERADMIN') return true;
    if (actor.id === target.id) return true; // Self-management

    if (actor.role === 'UNI_ADMIN') {
        return target.universityId === actor.universityId;
    }

    if (actor.role === 'DEPT_ADMIN') {
        return target.universityId === actor.universityId && target.entityId === actor.entityId;
    }

    return false;
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { universityId, departmentId, courseId, batchId, search, page = '1', limit = '10' } = req.query as any;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const take = limitNumber;

        const scopedFilter = getScopedFilter(req);
        
        // Build the where clause
        const where: any = {
            ...scopedFilter,
        };

        // Explicit filter overrides or additions
        if (universityId && (!scopedFilter.universityId || scopedFilter.universityId === universityId)) {
            where.universityId = universityId;
        }

        // Hierarchical filtering (Department & Course)
        const hierarchicalFilters: any[] = [];

        if (departmentId || courseId) {
            hierarchicalFilters.push({
                OR: [
                    // 1. Check Faculty link
                    {
                        faculty: {
                            some: {
                                ...(departmentId ? { departments: { some: { departmentId } } } : {}),
                                ...(courseId ? { subjects: { some: { courseId } } } : {})
                            }
                        }
                    },
                    // 2. Check Student link
                    {
                        student: {
                            is: {
                                ...(departmentId ? { departmentId } : {}),
                                ...(courseId ? { department: { courses: { some: { id: courseId } } } } : {}),
                                ...(batchId ? { batchId } : {})
                            }
                        }
                    },
                    // 3. User might be DEPT_ADMIN
                    ...(departmentId ? [{ role: 'DEPT_ADMIN', entityId: departmentId }] : [])
                ]
            });
        }

        if (hierarchicalFilters.length > 0) {
            where.AND = hierarchicalFilters;
        }

        // Search logic
        if (search) {
            const searchTerms = { contains: search, mode: 'insensitive' };
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { username: searchTerms },
                        { email: searchTerms },
                        { phoneNumber: searchTerms },
                        { faculty: { some: { name: searchTerms } } },
                        { student: { name: searchTerms } }
                    ]
                }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    phoneNumber: true,
                    isActive: true,
                    createdAt: true,
                    lastLogin: true,
                    universityId: true,
                    entityId: true,
                    university: { select: { name: true, shortName: true } },
                    faculty: { 
                        select: { 
                            name: true, 
                            designation: true,
                            departments: { select: { department: { select: { name: true } } } }
                        } 
                    },
                    student: { 
                        select: { 
                            name: true, 
                            enrollmentNo: true, 
                            department: { select: { name: true } },
                            batch: { select: { name: true } }
                        } 
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.user.count({ where })
        ]);

        res.json({ users, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to retrieve users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const actor = (req as any).user;
        const { username, email, password, role, universityId, entityId, phoneNumber, address } = req.body;

        // Scoping for creation
        if (actor.role === 'UNI_ADMIN' && universityId !== actor.universityId) {
            return res.status(403).json({ success: false, message: 'Scope mismatch: Cannot create for other university' });
        }
        if (actor.role === 'DEPT_ADMIN' && (universityId !== actor.universityId || entityId !== actor.entityId)) {
            return res.status(403).json({ success: false, message: 'Scope mismatch: Cannot create for other department' });
        }

        const user = await userService.createUser({
            username, email, password, role, universityId, entityId, phoneNumber, address
        }, actor.id);

        res.status(201).json(user);
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message || 'Failed to create user' });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { isActive } = req.body;
        const actor = (req as any).user;

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        if (!validateAccess(actor, targetUser)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        // Prevent self-disabling for admins to avoid locking themselves out
        if (actor.id === id && isActive === false && (actor.role === 'SUPERADMIN' || actor.role === 'UNI_ADMIN')) {
            return res.status(403).json({ success: false, message: 'You cannot disable your own admin account' });
        }

        const user = await userService.toggleUserStatus(id, isActive, actor.id);
        res.json(user);
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message || 'Failed to update user status' });
    }
};

export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { newPassword } = req.body;
        const actor = (req as any).user;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        if (!validateAccess(actor, targetUser)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        await userService.resetPassword(id, newPassword, actor.id);
        res.json({ message: 'Password reset successfully' });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message || 'Failed to reset password' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const actor = (req as any).user;
        const data = req.body;

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        if (!validateAccess(actor, targetUser)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        // Restrict sensitive field updates for non-admins during self-service
        if (actor.role !== 'SUPERADMIN' && actor.role !== 'UNI_ADMIN') {
            delete data.role;
            delete data.universityId;
            delete data.entityId;
        }

        const user = await userService.updateUser(id, data, actor.id);
        res.json(user);
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message || 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const actor = (req as any).user;

        if (actor.id === id) {
            return res.status(403).json({ error: 'You cannot delete your own account' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        if (!validateAccess(actor, targetUser)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        await userService.deleteUser(id, actor.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message || 'Failed to delete user' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const currentUser = (req as any).user;
        if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            include: {
                university: {
                    select: { name: true, shortName: true }
                }
            }
        });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // If user is faculty, fetch faculty details too
        let facultyDetails = null;
        if (user.role === 'FACULTY' && user.entityId) {
            facultyDetails = await prisma.faculty.findUnique({
                where: { id: user.entityId },
                include: {
                    departments: { include: { department: true } },
                    subjects: { include: { course: true } }
                }
            });
        }

        res.json({
            ...user,
            facultyDetails
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { query } = req.query as any;
        if (!query || query.length < 2) {
            return res.json([]);
        }

        const scopedFilter = getScopedFilter(req);

        const users = await prisma.user.findMany({
            where: {
                ...scopedFilter,
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
            take: 10,
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to search users' });
    }
};
