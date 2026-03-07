import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { NotificationService } from '../services/notification.service';
import { format } from 'date-fns';

export const getAssignments = async (req: AuthRequest, res: Response) => {
    try {
        const { role, entityId, email } = req.user!;
        let assignments;

        if (role === 'FACULTY') {
            const facultyId = req.user?.entityId;
            if (!facultyId) return res.status(400).json({ error: 'Faculty ID not found' });
            assignments = await prisma.assignment.findMany({
                where: { facultyId },
                include: { course: true, batch: true, _count: { select: { submissions: true } } }
            });
        } else if (role === 'STUDENT') {
            const student = await prisma.student.findFirst({
                where: { email },
                select: { batchId: true, id: true }
            });
            if (!student) return res.status(404).json({ error: 'Student not found' });

            assignments = await prisma.assignment.findMany({
                where: { batchId: student.batchId },
                include: {
                    course: true,
                    submissions: {
                        where: { studentId: student.id }
                    }
                }
            });
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(assignments);
    } catch (error) {
        console.error('Get Assignments Error:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

export const createAssignment = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, attachments, dueDate, maxMarks, courseId, batchId } = req.body;
        const facultyId = req.user?.entityId;

        if (req.user?.role !== 'FACULTY' || !facultyId) return res.status(403).json({ error: 'Only faculty can create assignments' });

        const assignment = await prisma.assignment.create({
            data: {
                title,
                description,
                attachments,
                dueDate: new Date(dueDate),
                maxMarks,
                facultyId,
                courseId,
                batchId
            }
        });

        // Trigger Notification for the whole batch
        await NotificationService.broadcastToBatch({
            batchId,
            title: 'New Assignment Posted',
            message: `A new assignment "${title}" has been posted for ${assignment.courseId}. Due: ${format(new Date(dueDate), 'MMM d')}`,
            category: 'ACADEMIC',
            link: '/student/academics'
        });

        res.status(201).json(assignment);
    } catch (error) {
        console.error('Create Assignment Error:', error);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
};

export const submitAssignment = async (req: AuthRequest, res: Response) => {
    try {
        const { assignmentId, fileUrl } = req.body;
        const studentId = req.user?.entityId;

        if (req.user?.role !== 'STUDENT' || !studentId) return res.status(403).json({ error: 'Only students can submit assignments' });

        const submission = await prisma.assignmentSubmission.upsert({
            where: {
                // Assuming a composite unique key or manual check since schema doesn't have one
                id: (await prisma.assignmentSubmission.findFirst({ where: { assignmentId, studentId } }))?.id || 'new-id'
            },
            update: {
                fileUrl,
                submittedAt: new Date()
            },
            create: {
                assignmentId,
                studentId,
                fileUrl,
                status: 'SUBMITTED'
            }
        });

        res.status(201).json(submission);
    } catch (error) {
        console.error('Submit Assignment Error:', error);
        res.status(500).json({ error: 'Failed to submit assignment' });
    }
};

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId, grade, feedback } = req.body;

        if (req.user!.role !== 'FACULTY') return res.status(403).json({ error: 'Only faculty can grade' });

        const submission = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade,
                feedback,
                status: 'GRADED'
            }
        });

        res.json(submission);
    } catch (error) {
        console.error('Grade Submission Error:', error);
        res.status(500).json({ error: 'Failed to grade submission' });
    }
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const assignmentId = req.params.assignmentId as string;

        const submissions = await prisma.assignmentSubmission.findMany({
            where: { assignmentId: assignmentId as string },
            include: { student: true }
        });

        res.json(submissions);
    } catch (error) {
        console.error('Get Submissions Error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};
