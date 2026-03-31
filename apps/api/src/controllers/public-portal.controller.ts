import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { winstonLogger } from '../lib/logger';
import { AppError } from '../middlewares/error.middleware';

/**
 * Controller for public-facing portal features
 * Handles unauthenticated requests for university landing pages
 */
export class PublicPortalController {
    /**
     * Get public configuration and branding for a university
     */
    static async getPortalConfig(req: Request, res: Response) {
        const universitySlug = req.params.universitySlug as string;

        try {
            const university = await prisma.university.findFirst({
                where: {
                    OR: [
                        { name: { contains: universitySlug.replace(/-/g, ' '), mode: 'insensitive' } },
                        { shortName: { equals: universitySlug, mode: 'insensitive' } }
                    ]
                },
                include: {
                    programs: true
                }
            });

            if (!university) {
                throw new AppError('University not found', 404);
            }

            const departmentCount = await prisma.department.count({ where: { universityId: university.id } });
            const studentCount = await prisma.student.count({ where: { universityId: university.id } });
            const facultyCount = await prisma.faculty.count({ where: { universityId: university.id } });

            return res.json({
                id: university.id,
                name: university.name,
                location: university.location,
                shortName: university.shortName,
                programs: university.programs,
                stats: {
                    departments: departmentCount,
                    students: studentCount,
                    faculty: facultyCount
                }
            });
        } catch (error) {
            winstonLogger.error(`Error fetching portal config for ${universitySlug}:`, error);
            throw error;
        }
    }

    /**
     * Submit an admission application from the public portal
     */
    static async applyForAdmission(req: Request, res: Response) {
        const universitySlug = req.params.universitySlug as string;
        const applicationData = req.body;

        try {
            const university = await prisma.university.findFirst({
                where: {
                    OR: [
                        { name: { contains: universitySlug.replace(/-/g, ' '), mode: 'insensitive' } },
                        { shortName: { equals: universitySlug, mode: 'insensitive' } }
                    ]
                }
            });

            if (!university) {
                throw new AppError('University not found', 404);
            }

            // Find department that offers this program
            const department = await prisma.department.findFirst({
                where: { 
                    universityId: university.id,
                    programs: { some: { id: applicationData.programId } }
                }
            });

            if (!department) throw new AppError('Department for program not found', 404);

            // Generate Application ID
            const count = await prisma.admissionApplication.count();
            const year = new Date().getFullYear();
            const deptCode = department.shortName.toUpperCase();
            const applicationId = `ADM-${year}-${deptCode}-${(count + 1).toString().padStart(5, '0')}`;

            // Store admission request
            const application = await prisma.admissionApplication.create({
                data: {
                    applicationId,
                    universityId: university.id,
                    departmentId: department.id,
                    programId: applicationData.programId,
                    applicantName: applicationData.name,
                    email: applicationData.email,
                    phone: applicationData.phone,
                    status: 'PENDING',
                    timeline: [{
                        action: 'SUBMITTED',
                        timestamp: new Date().toISOString(),
                        by: 'Public Portal',
                        remarks: 'Initial submission'
                    } as any]
                }
            });

            winstonLogger.info(`New admission application received for ${university.name}: ${applicationData.email} (${applicationId})`);
            
            return res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                applicationId: application.id,
                publicId: applicationId
            });
        } catch (error) {
            winstonLogger.error(`Error submitting admission for ${universitySlug}:`, error);
            throw error;
        }
    }

    /**
     * Get active job vacancies for the university
     */
    static async getVacancies(req: Request, res: Response) {
        const universitySlug = req.params.universitySlug as string;

        try {
            const vacancies = await prisma.jobPosting.findMany({
                where: {
                    universityName: {
                        contains: universitySlug.replace(/-/g, ' '),
                        mode: 'insensitive'
                    },
                    isActive: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return res.json(vacancies);
        } catch (error) {
            winstonLogger.error(`Error fetching vacancies for ${universitySlug}:`, error);
            throw error;
        }
    }
}
