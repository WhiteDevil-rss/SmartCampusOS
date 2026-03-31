import { Response } from 'express';
import prisma from '../lib/prisma';
import { winstonLogger } from '../lib/logger';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Controller for managing admission inquiries (Department only)
 */
export class AdmissionInquiryController {
    /**
     * Public submission of a new inquiry
     */
    static async submitInquiry(req: AuthRequest, res: Response) {
        const { departmentId, courseId, name, email, phone, country, message } = req.body;

        try {
            // Validate department exists
            const department = await prisma.department.findUnique({
                where: { id: String(departmentId) },
                include: { university: { select: { shortName: true } } }
            }) as any;

            if (!department) throw new AppError('Department not found', 404);

            // Generate Inquiry ID: INQ-2024-DEPT-XXXX
            const count = await prisma.admissionInquiry.count();
            const year = new Date().getFullYear();
            const deptCode = String(department.shortName || 'DEPT').toUpperCase();
            const inquiryId = `INQ-${year}-${deptCode}-${(count + 1).toString().padStart(5, '0')}`;

            const inquiry = await prisma.admissionInquiry.create({
                data: {
                    inquiryId,
                    departmentId: String(departmentId),
                    courseId: courseId ? String(courseId) : null,
                    name: String(name),
                    email: String(email),
                    phone: phone ? String(phone) : null,
                    country: country ? String(country) : null,
                    message: String(message),
                    status: 'NEW'
                }
            });

            winstonLogger.info(`New admission inquiry received for ${department.name}: ${email} (${inquiryId})`);

            return res.status(201).json({
                success: true,
                message: 'Inquiry submitted successfully',
                inquiryId: inquiry.inquiryId
            });
        } catch (error) {
            winstonLogger.error(`Error submitting admission inquiry:`, error);
            throw error;
        }
    }

    /**
     * Get inquiries for a department
     */
    static async getDepartmentInquiries(req: AuthRequest, res: Response) {
        const departmentId = String(req.params.departmentId);
        const { status, priority, search, page = '1', limit = '10' } = req.query;

        try {
            const skip = (Number(page) - 1) * Number(limit);
            
            if (!departmentId || departmentId === 'undefined' || departmentId === 'null') {
                return res.json({ inquiries: [], total: 0, pagination: { page: Number(page), limit: Number(limit), totalPages: 0 } });
            }

            const where: any = { departmentId };
            if (status) where.status = String(status);
            if (priority) where.priority = String(priority);
            if (search) {
                const s = String(search);
                where.OR = [
                    { name: { contains: s, mode: 'insensitive' } },
                    { email: { contains: s, mode: 'insensitive' } },
                    { inquiryId: { contains: s, mode: 'insensitive' } },
                    { message: { contains: s, mode: 'insensitive' } }
                ];
            }

            const [inquiries, total] = await Promise.all([
                prisma.admissionInquiry.findMany({
                    where,
                    include: {
                        assignedTo: { select: { username: true } },
                        convertedToApplication: { select: { applicationId: true } }
                    },
                    orderBy: { submittedAt: 'desc' },
                    skip,
                    take: Number(limit)
                }),
                prisma.admissionInquiry.count({ where })
            ]);

            return res.json({
                inquiries,
                total,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / (Number(limit) || 1))
                }
            });
        } catch (error: any) {
            winstonLogger.error(`Error fetching department inquiries:`, error);
            return res.status(500).json({ 
                error: 'Failed to fetch department inquiries', 
                details: process.env.NODE_ENV === 'development' ? error.message : undefined 
            });
        }
    }

    /**
     * Get inquiry detail
     */
    static async getInquiryDetail(req: AuthRequest, res: Response) {
        const id = String(req.params.id);

        try {
            const inquiry = await prisma.admissionInquiry.findUnique({
                where: { id },
                include: {
                    department: { select: { name: true, shortName: true } },
                    assignedTo: { select: { id: true, username: true, email: true } },
                    convertedToApplication: { select: { id: true, applicationId: true, status: true } }
                }
            });

            if (!inquiry) throw new AppError('Inquiry not found', 404);
            
            return res.json(inquiry);
        } catch (error) {
            winstonLogger.error(`Error fetching inquiry detail:`, error);
            throw error;
        }
    }

    /**
     * Reply to inquiry
     */
    static async replyToInquiry(req: AuthRequest, res: Response) {
        const id = String(req.params.id);
        const { status = 'RESPONDED' } = req.body;

        try {
            const inquiry = await prisma.admissionInquiry.update({
                where: { id },
                data: {
                    status: String(status),
                    updatedAt: new Date()
                }
            });

            const username = (req as any).user?.username || 'System';
            winstonLogger.info(`Reply processed for inquiry ${inquiry.inquiryId} by ${username}`);

            return res.json(inquiry);
        } catch (error) {
            winstonLogger.error(`Error replying to inquiry:`, error);
            throw error;
        }
    }

    /**
     * Resolve inquiry
     */
    static async resolveInquiry(req: AuthRequest, res: Response) {
        const id = String(req.params.id);

        try {
            const inquiry = await prisma.admissionInquiry.update({
                where: { id },
                data: {
                    status: 'RESOLVED',
                    resolvedAt: new Date()
                }
            });

            return res.json(inquiry);
        } catch (error) {
            winstonLogger.error(`Error resolving inquiry:`, error);
            throw error;
        }
    }

    /**
     * Convert inquiry to application
     */
    static async convertToApplication(req: AuthRequest, res: Response) {
        const id = String(req.params.id);
        const { programId } = req.body;

        try {
            const inquiry = await prisma.admissionInquiry.findUnique({ 
                where: { id },
                include: { department: true }
            }) as any;

            if (!inquiry) throw new AppError('Inquiry not found', 404);
            if (inquiry.convertedToApplicationId) throw new AppError('Already converted', 400);

            const count = await prisma.admissionApplication.count();
            const year = new Date().getFullYear();
            const deptCode = String(inquiry.department?.shortName || 'DEPT').toUpperCase();
            const applicationId = `ADM-${year}-${deptCode}-${(count + 1).toString().padStart(5, '0')}`;

            const user = (req as any).user;
            const username = user?.username || user?.email || 'System';
            
            const application = await prisma.admissionApplication.create({
                data: {
                    applicationId,
                    universityId: inquiry.department.universityId,
                    departmentId: inquiry.departmentId,
                    programId: String(programId),
                    applicantName: inquiry.name,
                    email: inquiry.email,
                    phone: inquiry.phone,
                    status: 'PENDING',
                    timeline: [{
                        action: 'CONVERTED_FROM_INQUIRY',
                        timestamp: new Date().toISOString(),
                        by: username,
                        remarks: `Generated from inquiry ${inquiry.inquiryId}`
                    } as any]
                }
            });

            await prisma.admissionInquiry.update({
                where: { id },
                data: {
                    status: 'CONVERTED',
                    convertedToApplicationId: application.id
                }
            });

            return res.status(201).json(application);
        } catch (error) {
            winstonLogger.error(`Error converting inquiry to application:`, error);
            throw error;
        }
    }
}
