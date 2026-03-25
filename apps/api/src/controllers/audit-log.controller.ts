import { Request, Response } from 'express';
import { RoleHierarchy } from '@smartcampus-os/types';
import prisma from '../lib/prisma';

export const getAuditLogs = async (req: any, res: Response) => {
    try {
        const {
            page = 1,
            limit = 50,
            search,
            status,
            entityType,
            userId,
            startDate,
            endDate
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {};

        // --- Role-Based Filtering Logic ---
        // Get current user's level. If anonymous (dev bypass), default to lowest level (STUDENT = 40).
        const currentUserRole = req.user?.role || 'STUDENT';
        const currentUserLevel = RoleHierarchy[currentUserRole] || 40;

        // We only want to see logs of users whose role level is <= ours
        const allowedRoles = Object.entries(RoleHierarchy)
            .filter(([_, level]) => level <= currentUserLevel)
            .map(([role, _]) => role);

        // Build the base role filter
        const roleFilter = {
            OR: [
                { user: { role: { in: allowedRoles } } },
                { userId: null } // Always allow system-level logs without a specific user
            ]
        };

        const conditions: any[] = [roleFilter];

        if (status) conditions.push({ status });
        if (entityType) conditions.push({ entityType });
        if (userId) conditions.push({ userId });

        if (search) {
            conditions.push({
                OR: [
                    { action: { contains: String(search), mode: 'insensitive' } },
                    { entityId: { contains: String(search), mode: 'insensitive' } },
                    { ipAddress: { contains: String(search), mode: 'insensitive' } },
                ]
            });
        }

        if (startDate || endDate) {
            const dateFilter: any = {};
            if (startDate) dateFilter.gte = new Date(String(startDate));
            if (endDate) dateFilter.lte = new Date(String(endDate));
            conditions.push({ createdAt: dateFilter });
        }

        where.AND = conditions;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true, role: true } } }
            }),
            prisma.auditLog.count({ where })
        ]);

        res.json({
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / take),
                currentPage: Number(page),
                limit: take
            }
        });
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

export const exportAuditLogs = async (req: any, res: Response) => {
    try {
        const currentUserRole = req.user?.role || 'STUDENT';
        const currentUserLevel = RoleHierarchy[currentUserRole] || 40;

        const allowedRoles = Object.entries(RoleHierarchy)
            .filter(([_, level]) => level <= currentUserLevel)
            .map(([role, _]) => role);

        const where = {
            OR: [
                { user: { role: { in: allowedRoles } } },
                { userId: null }
            ]
        };

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 5000 
        });

        // Simple CSV generation
        const headers = ['ID', 'User ID', 'Action', 'Entity', 'Status', 'IP', 'Timestamp'];
        const rows = logs.map(l => [
            l.id,
            l.userId || 'N/A',
            l.action,
            `${l.entityType || ''} (${l.entityId || ''})`,
            (l as any).status,
            l.ipAddress || '',
            l.createdAt.toISOString()
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Export failed:', error);
        res.status(500).json({ error: 'Export failed' });
    }
};
