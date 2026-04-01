import { Response } from 'express';
import prisma from '../lib/prisma';
import { winstonLogger } from '../lib/logger';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Controller for managing admission applications
 */
export class AdmissionController {
    private static normalizeStatusStats(
        stats: Array<{ status: string; _count: number }> | Array<{ status: string; _count: { _all: number } }>
    ) {
        return stats.reduce((acc: Record<string, number>, curr: any) => {
            const key = String(curr.status).toLowerCase();
            const count = typeof curr._count === 'number' ? curr._count : curr._count?._all ?? 0;
            acc[key] = count;
            return acc;
        }, {});
    }

    private static buildTrend(
        applications: Array<{ appliedAt: Date }>,
        days: number
    ) {
        const buckets = new Map<string, number>();
        const today = new Date();

        for (let offset = days - 1; offset >= 0; offset -= 1) {
            const date = new Date(today);
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - offset);
            const isoKey = date.toISOString().slice(0, 10);
            buckets.set(isoKey, 0);
        }

        applications.forEach((application) => {
            const appliedDate = new Date(application.appliedAt);
            appliedDate.setHours(0, 0, 0, 0);
            const isoKey = appliedDate.toISOString().slice(0, 10);
            if (buckets.has(isoKey)) {
                buckets.set(isoKey, (buckets.get(isoKey) ?? 0) + 1);
            }
        });

        return Array.from(buckets.entries()).map(([date, count]) => ({
            date,
            label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count
        }));
    }

    /**
     * Get applications for a university (Aggregated Read-Only)
     */
    static async getUniversityAdmissions(req: AuthRequest, res: Response) {
        const universityId = String(req.params.universityId);
        const { status, departmentId, startDate, endDate, page = '1', limit = '10' } = req.query;

        try {
            const parsedPage = Math.max(1, Number(page) || 1);
            const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
            const skip = (parsedPage - 1) * parsedLimit;
            
            if (!universityId || universityId === 'undefined' || universityId === 'null') {
                return res.json({
                    applications: [],
                    total: 0,
                    stats: {},
                    overview: {
                        totalApplications: 0,
                        filteredApplications: 0,
                        acceptanceRate: 0,
                        decisionRate: 0,
                        recentApplications: [],
                        statusBreakdown: [],
                        programBreakdown: [],
                        trend: [],
                        lastUpdatedAt: new Date().toISOString()
                    },
                    pagination: { page: parsedPage, limit: parsedLimit, totalPages: 0 }
                });
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

            const trendDays = startDate && endDate ? 60 : 30;
            const trendStart = new Date();
            trendStart.setHours(0, 0, 0, 0);
            trendStart.setDate(trendStart.getDate() - (trendDays - 1));

            const trendAppliedAt = where.appliedAt
                ? {
                    ...where.appliedAt,
                    gte: where.appliedAt.gte && where.appliedAt.gte > trendStart ? where.appliedAt.gte : trendStart,
                }
                : { gte: trendStart };

            const [applications, total, totalApplications, filteredStatusGroups, overallStatusGroups, recentApplications, trendApplications, groupedPrograms] = await Promise.all([
                prisma.admissionApplication.findMany({
                    where,
                    include: {
                        department: { select: { name: true, shortName: true } },
                        program: { select: { name: true } },
                        assignedReviewer: { select: { username: true } }
                    },
                    orderBy: { appliedAt: 'desc' },
                    skip,
                    take: parsedLimit
                }),
                prisma.admissionApplication.count({ where }),
                prisma.admissionApplication.count({ where: { universityId } }),
                prisma.admissionApplication.groupBy({
                    by: ['status'],
                    where,
                    _count: { _all: true }
                }),
                prisma.admissionApplication.groupBy({
                    by: ['status'],
                    where: { universityId },
                    _count: { _all: true }
                }),
                prisma.admissionApplication.findMany({
                    where: { universityId },
                    select: {
                        id: true,
                        applicantName: true,
                        email: true,
                        status: true,
                        appliedAt: true,
                        department: { select: { name: true, shortName: true } },
                        program: { select: { name: true } }
                    },
                    orderBy: { appliedAt: 'desc' },
                    take: 5
                }),
                prisma.admissionApplication.findMany({
                    where: {
                        ...where,
                        appliedAt: trendAppliedAt
                    },
                    select: { appliedAt: true },
                    orderBy: { appliedAt: 'asc' }
                }),
                prisma.admissionApplication.groupBy({
                    by: ['programId'],
                    where,
                    _count: { _all: true },
                    orderBy: {
                        _count: {
                            programId: 'desc'
                        }
                    },
                    take: 6
                })
            ]);

            const programs = groupedPrograms.length
                ? await prisma.program.findMany({
                    where: {
                        id: { in: groupedPrograms.map((program) => program.programId) }
                    },
                    select: { id: true, name: true }
                })
                : [];

            const programLookup = new Map(programs.map((program) => [program.id, program.name]));
            const stats = AdmissionController.normalizeStatusStats(overallStatusGroups);
            const filteredStats = AdmissionController.normalizeStatusStats(filteredStatusGroups);
            const acceptedCount = filteredStats.approved ?? 0;
            const decisionCount =
                (filteredStats.approved ?? 0) +
                (filteredStats.rejected ?? 0) +
                (filteredStats.enrolled ?? 0);
            const filteredApplications = total;

            const programBreakdown = groupedPrograms.map((program) => ({
                programId: program.programId,
                name: programLookup.get(program.programId) ?? 'Unknown Program',
                count: program._count._all
            }));

            const statusBreakdown = Object.entries(filteredStats).map(([name, count]) => ({
                name,
                label: name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
                count
            }));

            const trend = AdmissionController.buildTrend(trendApplications, trendDays);

            return res.json({
                applications,
                total,
                stats,
                overview: {
                    totalApplications,
                    filteredApplications,
                    acceptanceRate: filteredApplications > 0 ? Number(((acceptedCount / filteredApplications) * 100).toFixed(1)) : 0,
                    decisionRate: filteredApplications > 0 ? Number(((decisionCount / filteredApplications) * 100).toFixed(1)) : 0,
                    recentApplications,
                    statusBreakdown,
                    programBreakdown,
                    trend,
                    lastUpdatedAt: new Date().toISOString()
                },
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    totalPages: Math.ceil(total / parsedLimit)
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

            const updateData: any = { updatedAt: new Date() };
            
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
