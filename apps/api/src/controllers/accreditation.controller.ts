import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const generateNaacReport = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;

        if (!universityId) {
            return res.status(400).json({ error: 'University context required' });
        }

        // ==========================================
        // Criterion 1: Curricular Aspects
        // ==========================================
        const [totalPrograms, totalCourses, totalDepartments, barchartData] = await Promise.all([
            prisma.program.count({ where: { universityId } }),
            prisma.course.count({ where: { universityId } }),
            prisma.department.count({ where: { universityId } }),

            // Program distribution for charts
            prisma.program.findMany({
                where: { universityId },
                select: {
                    shortName: true,
                    _count: { select: { students: true } }
                }
            })
        ]);

        const curricularAspects = {
            totalPrograms,
            totalCourses,
            totalDepartments,
            programStudentDistribution: barchartData.map(p => ({
                name: p.shortName,
                total: p._count.students
            }))
        };

        // ==========================================
        // Criterion 2: Teaching-Learning and Evaluation
        // ==========================================
        const [totalStudents, totalFaculty, passResults, totalResults] = await Promise.all([
            prisma.student.count({ where: { universityId } }),
            prisma.faculty.count({ where: { universityId } }),
            prisma.result.count({
                where: {
                    student: { universityId },
                    status: 'PASS'
                }
            }),
            prisma.result.count({
                where: { student: { universityId } }
            })
        ]);

        const studentFacultyRatio = totalFaculty > 0 ? (totalStudents / totalFaculty).toFixed(2) : 'N/A';
        const passPercentage = totalResults > 0 ? ((passResults / totalResults) * 100).toFixed(2) : 0;

        const teachingLearning = {
            totalStudents,
            totalFaculty,
            studentFacultyRatio: `1:${studentFacultyRatio}`,
            passPercentage: `${passPercentage}%`,
        };

        // ==========================================
        // Criterion 4: Infrastructure and Learning Resources
        // ==========================================
        const [classrooms, labs, libraryBooks] = await Promise.all([
            prisma.resource.count({ where: { universityId, type: 'Classroom' } }),
            prisma.resource.count({ where: { universityId, type: 'Lab' } }),
            prisma.book.aggregate({
                where: { universityId },
                _sum: { totalCopies: true }
            })
        ]);

        const infrastructure = {
            classrooms,
            labs,
            totalLibraryBooks: libraryBooks._sum.totalCopies || 0,
        };

        // ==========================================
        // Criterion 5: Student Support and Progression
        // ==========================================
        const [totalPlaced, totalCompanies, topRecruiters] = await Promise.all([
            prisma.placementRecord.count({ where: { student: { universityId } } }),
            prisma.company.count({ where: { universityId } }),
            prisma.company.findMany({
                where: { universityId },
                include: {
                    _count: { select: { placements: true } }
                },
                orderBy: { placements: { _count: 'desc' } },
                take: 5
            })
        ]);

        const studentSupport = {
            totalPlacedStudents: totalPlaced,
            totalRecruitingCompanies: totalCompanies,
            topRecruiters: topRecruiters.map(c => ({
                name: c.name,
                hires: c._count.placements
            }))
        };

        const reportData = {
            generatedAt: new Date().toISOString(),
            universityId,
            criteria: {
                curricularAspects,
                teachingLearning,
                infrastructure,
                studentSupport
            }
        };

        res.json({
            message: 'NAAC Report metrics aggregated successfully',
            data: reportData
        });

    } catch (error: any) {
        console.error('NAAC Report Generation Error:', error);
        res.status(500).json({ error: 'Failed to aggregate NAAC metrics' });
    }
};
