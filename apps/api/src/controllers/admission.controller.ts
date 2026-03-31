import { Response } from 'express';
import prisma from '../lib/prisma';
import { winstonLogger } from '../lib/logger';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Controller for managing admission applications
 */
export class AdmissionController {
    /**
     * Get applications for a university (Aggregated Read-Only)
     */
    static async getUniversityAdmissions(req: AuthRequest, res: Response) {
        const universityId = String(req.params.universityId);
        const { status, departmentId, startDate, endDate, page = '1', limit = '10' } = req.query;

        try {
            const skip = (Number(page) - 1) * Number(limit);
            
            if (!universityId || universityId === 'undefined' || universityId === 'null') {
                return res.json({ applications: [], total: 0, stats: {}, pagination: { page: Number(page), limit: Number(limit), totalPages: 0 } });
            }

            const where: any = { universityId };
            if (status) where.status = String(status);
            if (departmentId) where.departmentId = String(departmentId);
            if (startDate && endDate) {
                where.appliedAt = {
                    gte: new Date(String(startDate)),
                    lte: new Date(String(endDate))
                };
            }

            const [applications, total] = await Promise.all([
                prisma.admissionApplication.findMany({
                    where,
                    include: {
                        department: { select: { name: true, shortName: true } },
                        program: { select: { name: true } },
                        assignedReviewer: { select: { username: true } }
                    },
                    orderBy: { appliedAt: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.admissionApplication.count({ where })
            ]);

            // Aggregated stats
            const stats = await prisma.admissionApplication.groupBy({
                by: ['status'],
                where: { universityId },
                _count: true
            });

            return res.json({
                applications,
                total,
                stats: stats.reduce((acc: any, curr) => {
                    acc[curr.status.toLowerCase()] = curr._count;
                    return acc;
                }, {}),
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error: any) {
            winstonLogger.error(`Error fetching university admissions:`, error);
            return res.status(500).json({ 
                error: 'Failed to fetch university admissions', 
                details: process.env.NODE_ENV === 'development' ? error.message : undefined 
            });
        }
    }

    /**
     * Get applications for a department (Full Control)
     */
    static async getDepartmentAdmissions(req: AuthRequest, res: Response) {
        const departmentId = String(req.params.departmentId);
        const { status, search, page = '1', limit = '10' } = req.query;

        try {
            const skip = (Number(page) - 1) * Number(limit);
            
            if (!departmentId || departmentId === 'undefined' || departmentId === 'null') {
                return res.json({ applications: [], total: 0, pagination: { page: Number(page), limit: Number(limit), totalPages: 0 } });
            }

            const where: any = { departmentId };
            if (status) where.status = String(status);
            if (search) {
                const s = String(search);
                where.OR = [
                    { applicantName: { contains: s, mode: 'insensitive' } },
                    { email: { contains: s, mode: 'insensitive' } },
                    { applicationId: { contains: s, mode: 'insensitive' } }
                ];
            }

            const [applications, total] = await Promise.all([
                prisma.admissionApplication.findMany({
                    where,
                    include: {
                        program: { select: { name: true } },
                        assignedReviewer: { select: { username: true } }
                    },
                    orderBy: { appliedAt: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.admissionApplication.count({ where })
            ]);

            return res.json({
                applications,
                total,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / (Number(limit) || 1))
                }
            });
        } catch (error: any) {
            winstonLogger.error(`Error fetching department admissions:`, error);
            return res.status(500).json({ 
                error: 'Failed to fetch department admissions', 
                details: process.env.NODE_ENV === 'development' ? error.message : undefined 
            });
        }
    }

    /**
     * Get single application details
     */
    static async getApplicationDetail(req: AuthRequest, res: Response) {
        const appId = String(req.params.appId);

        try {
            const application = await prisma.admissionApplication.findUnique({
                where: { id: appId },
                include: {
                    department: true,
                    program: true,
                    assignedReviewer: { select: { id: true, username: true, email: true } },
                    inquiry: true
                }
            });

            if (!application) throw new AppError('Application not found', 404);

            return res.json(application);
        } catch (error) {
            winstonLogger.error(`Error fetching application detail:`, error);
            throw error;
        }
    }

    /**
     * Process application action (Approve, Reject, etc.)
     */
    static async processAction(req: AuthRequest, res: Response) {
        const appId = String(req.params.appId);
        const { action, remarks, reviewerId } = req.body;

        try {
            const application = await prisma.admissionApplication.findUnique({ where: { id: appId } });
            if (!application) throw new AppError('Application not found', 404);

            let updateData: any = { updatedAt: new Date() };
            
            // Add to timeline
            const timeline = Array.isArray(application.timeline) ? (application.timeline as any[]) : [];
            const user = (req as any).user;
            const username = user?.username || user?.email || 'System';
            
            timeline.push({
                action: String(action),
                timestamp: new Date().toISOString(),
                by: username,
                remarks: remarks ? String(remarks) : undefined
            });
            updateData.timeline = timeline;

            switch (action) {
                case 'review':
                    updateData.status = 'UNDER_REVIEW';
                    break;
                case 'approve':
                    updateData.status = 'APPROVED';
                    updateData.decisionDate = new Date();
                    break;
                case 'reject':
                    updateData.status = 'REJECTED';
                    updateData.decisionDate = new Date();
                    updateData.remarks = remarks ? String(remarks) : undefined;
                    break;
                case 'enroll':
                    updateData.status = 'ENROLLED';
                    updateData.enrollmentDate = new Date();
                    break;
                case 'assign':
                    updateData.assignedReviewerId = String(reviewerId);
                    break;
                default:
                    throw new AppError('Invalid action', 400);
            }

            const updated = await prisma.admissionApplication.update({
                where: { id: appId },
                data: updateData
            });

            return res.json(updated);
        } catch (error) {
            winstonLogger.error(`Error processing application action:`, error);
            throw error;
        }
    }

    /**
     * Add internal note
     */
    static async addNote(req: AuthRequest, res: Response) {
        const appId = String(req.params.appId);
        const { note } = req.body;

        try {
            const application = await prisma.admissionApplication.findUnique({ where: { id: appId } });
            if (!application) throw new AppError('Application not found', 404);

            const notes = Array.isArray(application.internalNotes) ? (application.internalNotes as any[]) : [];
            const user = (req as any).user;
            const username = user?.username || user?.email || 'Anonymous';
            
            notes.push({
                content: String(note),
                timestamp: new Date().toISOString(),
                by: username
            });

            const updated = await prisma.admissionApplication.update({
                where: { id: appId },
                data: { internalNotes: notes as any }
            });

            return res.json(updated);
        } catch (error) {
            winstonLogger.error(`Error adding application note:`, error);
            throw error;
        }
    }
}
