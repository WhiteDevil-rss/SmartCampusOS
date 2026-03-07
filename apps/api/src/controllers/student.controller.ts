import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Prisma } from '@prisma/client';

export const getStudentProfile = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.params.studentId as string;
        const email = (req.user?.email || '') as string;

        // If studentId is 'me', fetch by the authenticated user's email
        const student = await prisma.student.findFirst({
            where: studentId === 'me' ? { email } : { id: studentId },
            include: {
                university: true,
                department: true,
                batch: true,
                program: true,
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        res.json(student);
    } catch (error: any) {
        console.error('Get Student Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch student profile' });
    }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
    try {
        const {
            universityId,
            departmentId,
            batchId,
            programId,
            search
        } = req.query;

        const where: any = {};

        if (universityId) where.universityId = universityId as string;
        if (departmentId) where.departmentId = departmentId as string;
        if (batchId) where.batchId = batchId as string;
        if (programId) where.programId = programId as string;

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
                { enrollmentNo: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const students = await prisma.student.findMany({
            where,
            include: {
                batch: true,
                program: true,
                department: true
            },
            orderBy: { name: 'asc' }
        });

        res.json(students);
    } catch (error: any) {
        console.error('Get Students Error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

export const getStudentStats = async (req: AuthRequest, res: Response) => {
    try {
        const email = (req.user?.email || '') as string;

        const student = await prisma.student.findFirst({
            where: { email },
            include: {
                attendance: true,
                results: {
                    orderBy: { semester: 'desc' },
                    take: 1
                },
                submissions: true
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Calculate Attendance Percentage
        const totalSessions = student.attendance.length;
        const presentSessions = student.attendance.filter(a => a.status === 'PRESENT').length;
        const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

        // Latest GPA
        const latestResult = student.results[0];

        res.json({
            attendancePercentage: Math.round(attendancePercentage),
            currentSGPA: latestResult?.sgpa || 0,
            overallCGPA: latestResult?.cgpa || 0,
            pendingAssignments: student.submissions.filter(s => s.status === 'SUBMITTED').length,
            creditsEarned: 72,
        });
    } catch (error: any) {
        console.error('Get Student Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch student statistics' });
    }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId, batchId, programId, enrollmentNo, name, email, phone, admissionYear } = req.body;

        const student = await prisma.student.create({
            data: {
                universityId,
                departmentId,
                batchId,
                programId,
                enrollmentNo,
                name,
                email,
                phone,
                admissionYear
            }
        });

        res.status(201).json(student);
    } catch (error: any) {
        console.error('Create Student Error:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const {
            batchId,
            programId,
            enrollmentNo,
            name,
            email,
            phone,
            admissionYear
        } = req.body;

        const student = await prisma.student.update({
            where: { id },
            data: {
                batchId,
                programId,
                enrollmentNo,
                name,
                email,
                phone,
                admissionYear
            }
        });

        res.json(student);
    } catch (error: any) {
        console.error('Update Student Error:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        await prisma.student.delete({
            where: { id }
        });

        res.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        console.error('Delete Student Error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
};

export const getStudentPerformance = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.params.studentId as string;
        const email = (req.user?.email || '') as string;

        // Fetch student with results, assignment submissions (graded), and quiz attempts
        const student = await prisma.student.findFirst({
            where: studentId === 'me' ? { email } : { id: studentId },
            include: {
                results: {
                    orderBy: { semester: 'desc' },
                },
                submissions: {
                    where: { status: 'GRADED' },
                    include: {
                        assignment: {
                            include: {
                                course: true
                            }
                        }
                    },
                    orderBy: { submittedAt: 'desc' }
                },
                quizAttempts: {
                    include: {
                        quiz: {
                            include: {
                                course: true
                            }
                        }
                    },
                    orderBy: { completedAt: 'desc' }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student performance records not found' });
        }

        res.json({
            semesterResults: student.results,
            assignments: student.submissions.map(s => ({
                id: s.id,
                title: s.assignment.title,
                course: s.assignment.course.name,
                grade: s.grade,
                maxMarks: s.assignment.maxMarks,
                date: s.submittedAt
            })),
            quizzes: student.quizAttempts.map(q => ({
                id: q.id,
                title: q.quiz.title,
                course: q.quiz.course.name,
                score: q.score,
                date: q.completedAt
            }))
        });
    } catch (error: any) {
        console.error('Get Student Performance Error:', error);
        res.status(500).json({ error: 'Failed to fetch student performance data' });
    }
};
