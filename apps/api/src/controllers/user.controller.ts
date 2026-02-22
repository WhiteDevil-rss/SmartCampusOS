import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                lastLogin: true,
                universityId: true,
                entityId: true,
                university: {
                    select: { shortName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role, universityId, entityId } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: email || '' }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role,
                universityId: universityId || null,
                entityId: entityId || null,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true
            }
        });

        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Prevent Superadmin from disabling themselves to avoid lockouts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((req as any).user.id === id && isActive === false) {
            return res.status(403).json({ error: 'You cannot disable your own account' });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { isActive },
            select: { id: true, username: true, isActive: true }
        });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id },
            data: { passwordHash }
        });

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { username, email, role, universityId } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                id: { not: id },
                OR: [
                    { username },
                    { email: email || '' }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already in use' });
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                username,
                email,
                role,
                universityId: universityId || null,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                universityId: true,
                university: { select: { shortName: true } }
            }
        });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Prevent Superadmin from deleting themselves
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((req as any).user.id === id) {
            return res.status(403).json({ error: 'You cannot delete your own account' });
        }

        await prisma.user.delete({
            where: { id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
