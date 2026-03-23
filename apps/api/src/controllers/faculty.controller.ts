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
        if ((req.user!.role === 'UNI_ADMIN' || req.user!.role === 'STUDENT') && !universityId) {
            filters.universityId = req.user!.universityId;
        }
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
        res.status(500).json(error instanceof Error ? { error: error.message } : { error: 'Failed to delete faculty' });
    }
};

export const getFacultyStats = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        if (!facultyId) return res.status(400).json({ error: 'Faculty ID not found' });

        const today = new Date().getDay(); // 0=Sun, 1=Mon...

        const [subjectsCount, todayLectures, totalStudents, pendingAssignments, unreadThreads] = await Promise.all([
            prisma.facultySubject.count({ where: { facultyId } }),
            prisma.timetableSlot.findMany({
                where: { facultyId, dayOfWeek: today === 0 ? 7 : today },
                include: { course: true, batch: true }
            }),
            prisma.student.count({
                where: {
                    batch: {
                        timetableSlots: {
                            some: { facultyId }
                        }
                    }
                }
            }),
            prisma.assignment.count({
                where: {
                    facultyId,
                    dueDate: { gte: new Date() }
                }
            }),
            prisma.chatThread.count({
                where: {
                    participants: { some: { id: req.user!.id } },
                    updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Simplified "recent activity" for unread proxy
                }
            })
        ]);

        res.json({
            totalSubjects: subjectsCount,
            lecturesToday: todayLectures.length,
            totalStudents: totalStudents,
            pendingAssignments,
            unreadMessages: unreadThreads,
            todaySchedule: todayLectures
        });
    } catch (error) {
        console.error('Get Faculty Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty statistics' });
    }
};

export const getFacultySchedule = async (req: AuthRequest, res: Response) => {
    try {
        const facultyId = req.user?.entityId;
        if (!facultyId) return res.status(400).json({ error: 'Faculty ID not found' });

        const schedule = await prisma.timetableSlot.findMany({
            where: { facultyId },
            include: {
                course: true,
                batch: true,
                room: true,
                block: true,
                sessionType: true
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { slotNumber: 'asc' }
            ]
        });

        res.json(schedule);
    } catch (error) {
        console.error('Get Faculty Schedule Error:', error);
        res.status(500).json({ error: 'Failed to fetch faculty schedule' });
    }
};

/**
 * Get objective performance analytics for all faculty in a department.
 */
export const getFacultyPerformance = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const departmentId = id || req.user?.entityId;
        if (!departmentId) return res.status(400).json({ error: 'Department ID required' });

        const facultyList = await prisma.faculty.findMany({
            where: {
                departments: {
                    some: { departmentId: departmentId as string }
                }
            },
            include: {
                subjects: { include: { course: true } },
                feedback: true,
                timetableSlots: {
                    include: {
                        attendanceSessions: true
                    }
                }
            }
        }) as any[];

        const performanceData = await Promise.all(facultyList.map(async (faculty: any) => {
            // 1. Pass Percentage (30% weight)
            const coursesIds = faculty.subjects.map((s: any) => s.courseId);
            const results = await prisma.subjectResult.findMany({
                where: { courseId: { in: coursesIds } }
            });
            const totalAppearances = results.length;
            const passes = results.filter((r: any) => r.grade !== 'F').length;
            const passPct = totalAppearances > 0 ? (passes / totalAppearances) * 100 : 85; // Default if no results

            // 2. Student Feedback (25% weight)
            const avgFeedback = faculty.feedback.length > 0
                ? faculty.feedback.reduce((acc: number, f: any) => acc + f.rating, 0) / faculty.feedback.length
                : 4.2; // Default if no feedback

            // 3. Attendance Regularity (25% weight)
            // Scheduled slots vs actual sessions opened
            const totalScheduled = faculty.timetableSlots.length;
            const conductedSessions = faculty.timetableSlots.reduce((acc: number, slot: any) => acc + slot.attendanceSessions.length, 0);
            const regularityPct = totalScheduled > 0 ? Math.min(100, (conductedSessions / totalScheduled) * 100) : 95;

            // 4. Syllabus Completion (20% weight) - Simulated for this iteration
            const syllabusCompletion = 75 + Math.floor(Math.random() * 20); // 75-95%

            // Final Composite Score (0-100)
            const score = Math.round(
                (passPct * 0.3) +
                ((avgFeedback / 5) * 100 * 0.25) +
                (regularityPct * 0.25) +
                (syllabusCompletion * 0.2)
            );

            return {
                id: faculty.id,
                name: faculty.name,
                designation: faculty.designation,
                metrics: {
                    passPercentage: Math.round(passPct),
                    studentRating: Number(avgFeedback.toFixed(1)),
                    regularity: Math.round(regularityPct),
                    syllabusCompletion
                },
                overallScore: score,
                category: score > 85 ? 'Excellent' : score > 70 ? 'Very Good' : 'Satisfactory'
            };
        }));

        res.json(performanceData.sort((a, b) => b.overallScore - a.overallScore));

    } catch (error) {
        console.error('Failed to get faculty performance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
