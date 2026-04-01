import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get Permissions
export const getPermissions = async (req: Request, res: Response) => {
    try {
        const { roleId, userId, module } = req.query;
        const where: any = {};
        if (roleId) where.roleId = String(roleId);
        if (userId) where.userId = String(userId);
        if (module) where.module = String(module);

        const permissions = await prisma.permission.findMany({ where });
        res.status(200).json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
};

// Set or Update Permission
export const updatePermission = async (req: Request, res: Response) => {
    try {
        const { roleId, userId, module, action, allowed, restrictions } = req.body;

        if (!roleId || !module || !action) {
            return res.status(400).json({ error: 'roleId, module, and action are required' });
        }

        const permission = await prisma.permission.upsert({
            where: {
                roleId_module_action: {
                    roleId,
                    module,
                    action,
                },
            },
            update: {
                allowed,
                restrictions: restrictions || null,
                userId: userId || null,
            },
            create: {
                roleId,
                userId: userId || null,
                module,
                action,
                allowed,
                restrictions: restrictions || null,
            },
        });

        res.status(200).json({ message: 'Permission updated successfully', permission });
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ error: 'Failed to update permission' });
    }
};

// Get Subscription Controls
export const getSubscriptionControls = async (req: Request, res: Response) => {
    try {
        const controls = await prisma.subscriptionControl.findMany({
            include: { user: { select: { email: true, username: true } } }
        });
        res.status(200).json(controls);
    } catch (error) {
        console.error('Error fetching subscription controls:', error);
        res.status(500).json({ error: 'Failed to fetch subscription controls' });
    }
};

// Update Subscription Control
export const updateSubscriptionControl = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { canSubscribe, subscriptionLimit, autoRenew } = req.body;

        const control = await prisma.subscriptionControl.update({
            where: { id },
            data: {
                canSubscribe,
                subscriptionLimit,
                autoRenew,
            },
        });

        res.status(200).json({ message: 'Subscription control updated successfully', control });
    } catch (error) {
        console.error('Error updating subscription control:', error);
        res.status(500).json({ error: 'Failed to update subscription control' });
    }
};

// Create Subscription Control
export const createSubscriptionControl = async (req: Request, res: Response) => {
    try {
        const { userId, canSubscribe, subscriptionLimit, autoRenew } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const control = await prisma.subscriptionControl.create({
            data: {
                userId,
                canSubscribe: canSubscribe ?? true,
                subscriptionLimit: subscriptionLimit ?? 100,
                autoRenew: autoRenew ?? false,
            },
            include: { user: { select: { email: true, username: true } } }
        });

        res.status(201).json({ message: 'Subscription control created successfully', control });
    } catch (error) {
        console.error('Error creating subscription control:', error);
        res.status(500).json({ error: 'Failed to create subscription control' });
    }
};
