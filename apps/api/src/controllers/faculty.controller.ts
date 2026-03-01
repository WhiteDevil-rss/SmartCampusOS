import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logActivity } from '../lib/logger';
import { firebaseAdmin } from '../lib/firebase-admin';

const hashPassword = async (password: string) => bcrypt.hash(password, 12);

export const getFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId } = req.query as { universityId?: string, departmentId?: string };

        // Authorization checks
        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== universityId && universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN' && req.user!.entityId !== departmentId && departmentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const filters: any = {};
        if (universityId) filters.universityId = universityId;
        if (departmentId) {
            filters.departments = {
                some: { departmentId: departmentId }
            };
        }

        // Default fallback to user's scope if no query params
        if (req.user!.role === 'UNI_ADMIN' && !universityId) filters.universityId = req.user!.universityId;
        if (req.user!.role === 'DEPT_ADMIN' && !departmentId) {
            filters.departments = {
                some: { departmentId: req.user!.entityId }
            };
        }

        const faculty = await prisma.faculty.findMany({
            where: filters,
            include: {
                subjects: { include: { course: true } },
                departments: { include: { department: true } }
            }
        });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
};

export const getFacultyById = async (req: AuthRequest, res: Response) => {
    try {
        const faculty = await prisma.faculty.findUnique({
            where: { id: req.params.id as string },
            include: {
                subjects: { include: { course: true } },
                departments: { include: { department: true } },
                user: true
            }
        }) as any;

        if (!faculty) return res.status(404).json({ error: 'Not found' });

        // Authorization checks
        if (req.user!.role === 'UNI_ADMIN' && String(req.user!.universityId) !== String(faculty.universityId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN') {
            const hasAccess = faculty.departments.some((d: any) => d.departmentId === req.user!.entityId);
            if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'FACULTY' && String(req.user!.entityId) !== String(faculty.id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(faculty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculty' });
    }
};

export const createFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentIds, name, email, designation, password, phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Contact number is mandatory' });
        }

        // Authorization checks
        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN') {
            // DEPT_ADMIN can only create within their department
            if (!departmentIds || !departmentIds.includes(req.user!.entityId)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

        let firebaseUid: string | undefined;
        let faculty;

        try {
            const firebaseRecord = await firebaseAdmin.auth().createUser({
                email,
                password: password,
                displayName: name,
            });
            firebaseUid = firebaseRecord.uid;

            faculty = await prisma.$transaction(async (tx: any) => {
                const pwdHash = await hashPassword(password);

                const user = await tx.user.create({
                    data: {
                        username: email.split('@')[0],
                        email,
                        passwordHash: pwdHash,
                        firebaseUid,
                        role: 'FACULTY',
                        phoneNumber: phone,
                        universityId
                    }
                });

                const fac = await tx.faculty.create({
                    data: {
                        universityId,
                        name,
                        email,
                        designation,
                        userId: user.id,
                        departments: {
                            create: departmentIds.map((id: string) => ({ departmentId: id }))
                        }
                    }
                });

                await tx.user.update({
                    where: { id: user.id },
                    data: { entityId: fac.id }
                });

                return fac;
            });
        } catch (transactionError) {
            if (firebaseUid) {
                await firebaseAdmin.auth().deleteUser(firebaseUid).catch(console.error);
            }
            throw transactionError;
        }

        res.status(201).json(faculty);

        logActivity(
            req.user!.id,
            req.user!.role,
            'FACULTY_CREATE',
            { facultyId: faculty.id, name: faculty.name, departmentId: departmentIds?.[0] }
        );
    } catch (error) {
        res.status(500).json({ error: 'Failed to create faculty' });
    }
};

export const updateFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone, designation, departmentIds, subjectIds, qualifications, experience } = req.body;

        const targetFac = await prisma.faculty.findUnique({
            where: { id: req.params.id as string },
            include: { departments: true, user: true }
        }) as any;
        if (!targetFac) return res.status(404).json({ error: 'Not found' });

        // Authorization checks
        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== targetFac.universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN') {
            const hasAccess = targetFac.departments.some((d: any) => d.departmentId === req.user!.entityId);
            if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'FACULTY' && String(req.user!.entityId) !== String(targetFac.id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const isSelfFaculty = req.user!.role === 'FACULTY' && String(req.user!.entityId) === String(targetFac.id);

        const faculty = await prisma.$transaction(async (tx) => {
            const fac = await tx.faculty.update({
                where: { id: req.params.id as string },
                data: {
                    name,
                    email,
                    phone,
                    designation,
                    qualifications,
                    experience,
                    departments: departmentIds ? {
                        deleteMany: {},
                        create: departmentIds.map((id: string) => ({ departmentId: id }))
                    } : undefined,
                    subjects: (subjectIds && !isSelfFaculty) ? {
                        deleteMany: {},
                        create: subjectIds.map((courseId: string) => ({ courseId }))
                    } : undefined
                }
            });

            // Update associated User record for consistent login credentials
            if (targetFac.userId && (email !== targetFac.email || phone !== targetFac.phone)) {
                await tx.user.update({
                    where: { id: targetFac.userId },
                    data: { email, phoneNumber: phone }
                });
            }

            // Push updates to Firebase Auth
            if (targetFac.user?.firebaseUid && (name !== targetFac.name || email !== targetFac.email)) {
                const firebaseUpdate: any = {};
                if (name && name !== targetFac.name) firebaseUpdate.displayName = name;
                if (email && email !== targetFac.email) firebaseUpdate.email = email;
                if (Object.keys(firebaseUpdate).length > 0) {
                    await firebaseAdmin.auth().updateUser(targetFac.user.firebaseUid, firebaseUpdate);
                }
            }

            return fac;
        });

        res.json(faculty);

        logActivity(
            req.user!.id,
            req.user!.role,
            'FACULTY_UPDATE',
            { facultyId: faculty.id, name: faculty.name }
        );
    } catch (error) {
        res.status(500).json({ error: 'Failed to update faculty' });
    }
};

export const deleteFaculty = async (req: AuthRequest, res: Response) => {
    try {
        const targetFac = await prisma.faculty.findUnique({
            where: { id: req.params.id as string },
            include: { departments: true, user: true }
        }) as any;
        if (!targetFac) return res.status(404).json({ error: 'Not found' });

        if (req.user!.role === 'UNI_ADMIN' && req.user!.universityId !== targetFac.universityId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (req.user!.role === 'DEPT_ADMIN') {
            const hasAccess = targetFac.departments.some((d: any) => d.departmentId === req.user!.entityId);
            if (!hasAccess) return res.status(403).json({ error: 'Forbidden' });
        }

        await prisma.$transaction(async (tx) => {
            if (targetFac.userId) {
                await tx.user.delete({ where: { id: targetFac.userId } });
            }
            await tx.faculty.delete({ where: { id: req.params.id as string } });

            if (targetFac.user?.firebaseUid) {
                await firebaseAdmin.auth().deleteUser(targetFac.user.firebaseUid);
            }
        });

        res.status(204).send();

        logActivity(
            req.user!.id,
            req.user!.role,
            'FACULTY_DELETE',
            { facultyId: req.params.id, name: targetFac.name }
        );
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete faculty' });
    }
};
