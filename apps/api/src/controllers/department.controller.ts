import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logActivity } from '../lib/logger';
import { firebaseAdmin } from '../lib/firebase-admin';

const hashPassword = async (password: string) => bcrypt.hash(password, 12);

export const getDepartments = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId } = req.params as { universityId: string };
        console.log('[DEBUG] GET /departments -> universityId param:', universityId, 'User:', req.user?.universityId);

        // Authorization Check: SUPERADMIN can see all, others can see own university
        if (req.user!.role !== 'SUPERADMIN' && String(req.user!.universityId) !== String(universityId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const departments = await prisma.department.findMany({
            where: { universityId },
            include: {
                _count: {
                    select: { faculty: true, courses: true, batches: true }
                }
            }
        });

        // Cache for 60 seconds at browser/CDN level
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const department = await prisma.department.findUnique({
            where: { id },
        });

        if (!department) return res.status(404).json({ error: 'Not found' });

        // Authorization Check: SUPERADMIN can see all, others can see own university
        if (req.user!.role !== 'SUPERADMIN' && String(req.user!.universityId) !== String(department.universityId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(department);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch department' });
    }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId } = req.params as { universityId: string };
        const { name, shortName, hod, email, adminUsername, adminPassword } = req.body;

        if (req.user!.role === 'UNI_ADMIN' && String(req.user!.universityId) !== String(universityId)) {
            return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
        }

        const existingUser = await prisma.user.findUnique({ where: { username: adminUsername } });
        if (existingUser) {
            return res.status(400).json({ error: 'The provided Admin Username is already taken globally. Please choose another.' });
        }

        let firebaseUid: string | undefined;
        let department;

        try {
            // 1. Create User in Firebase Auth
            const firebaseRecord = await firebaseAdmin.auth().createUser({
                email,
                password: adminPassword,
                displayName: adminUsername,
            });
            firebaseUid = firebaseRecord.uid;

            // 2. Transact Postgres Data
            department = await prisma.$transaction(async (tx: any) => {
                const dept = await tx.department.create({
                    data: { universityId, name, shortName, hod, email }
                });

                const pwdHash = await hashPassword(adminPassword);

                const admin = await tx.user.create({
                    data: {
                        username: adminUsername,
                        email,
                        passwordHash: pwdHash,
                        firebaseUid,
                        role: 'DEPT_ADMIN',
                        universityId,
                        entityId: dept.id
                    }
                });

                await tx.department.update({
                    where: { id: dept.id },
                    data: { adminUserId: admin.id }
                });

                return tx.department.findUnique({ where: { id: dept.id } });
            });
        } catch (transactionError) {
            if (firebaseUid) {
                await firebaseAdmin.auth().deleteUser(firebaseUid).catch(console.error);
            }
            throw transactionError;
        }

        res.status(201).json(department);

        logActivity(
            req.user!.id,
            req.user!.role,
            'DEPARTMENT_CREATE',
            { departmentId: department?.id, name: department?.name }
        );
    } catch (error) {
        console.error('Create Department Error:', error);
        res.status(500).json({ error: 'Failed to create department', details: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { name, shortName, hod, email } = req.body;

        const targetDept = await prisma.department.findUnique({ where: { id } });
        if (!targetDept) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== targetDept.universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const department = await prisma.$transaction(async (tx) => {
            const dept = await tx.department.update({
                where: { id },
                data: { name, shortName, hod, email }
            });

            // If the department email changed, keep the admin User and Firebase in sync
            if (targetDept.adminUserId && email && email !== targetDept.email) {
                const adminUser = await tx.user.update({
                    where: { id: targetDept.adminUserId },
                    data: { email }
                });

                if (adminUser.firebaseUid) {
                    await firebaseAdmin.auth().updateUser(adminUser.firebaseUid, { email });
                }
            }

            return dept;
        });

        res.json(department);

        logActivity(
            req.user!.id,
            req.user!.role,
            'DEPARTMENT_UPDATE',
            { departmentId: department.id, name: department.name }
        );
    } catch (error) {
        res.status(500).json({ error: 'Failed to update department' });
    }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params as { id: string };

        const targetDept = await prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { courses: true, batches: true, faculty: true, timetables: true }
                }
            }
        }) as any;
        if (!targetDept) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== targetDept.universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { courses, batches, faculty, timetables } = targetDept._count;
        if (courses > 0 || batches > 0 || faculty > 0 || timetables > 0) {
            const deps = [];
            if (faculty > 0) deps.push(`${faculty} faculty member(s)`);
            if (courses > 0) deps.push(`${courses} course(s)`);
            if (batches > 0) deps.push(`${batches} batch(es)`);
            if (timetables > 0) deps.push(`${timetables} timetable(s)`);

            const errorMsg = `Cannot delete '${targetDept.name}' because it has ${deps.join(', ')}. Please remove or reassign them first.`;

            logActivity(
                req.user!.id,
                req.user!.role,
                'DEPARTMENT_DELETE_FAILED',
                { departmentId: id, name: targetDept.name, reason: errorMsg }
            );

            return res.status(400).json({ error: errorMsg });
        }

        await prisma.$transaction(async (tx) => {
            if (targetDept.adminUserId) {
                const adminUser = await tx.user.findUnique({ where: { id: targetDept.adminUserId } });

                await tx.department.update({ where: { id }, data: { adminUserId: null } }); // break FK safely
                await tx.user.delete({ where: { id: targetDept.adminUserId } });

                if (adminUser?.firebaseUid) {
                    await firebaseAdmin.auth().deleteUser(adminUser.firebaseUid);
                }
            }
            await tx.department.delete({ where: { id } });
        });
        res.status(204).send();

        logActivity(
            req.user!.id,
            req.user!.role,
            'DEPARTMENT_DELETE',
            { departmentId: id, name: targetDept.name }
        );
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
};
