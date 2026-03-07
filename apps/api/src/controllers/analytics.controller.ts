import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Get aggregated analytics for a department.
 * Uses entityId from the authenticated user to resolve the department.
 */
export const getDepartmentAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.user?.entityId;
        if (!departmentId) {
            return res.status(403).json({ error: 'Unauthorized: Department context missing' });
        }

        // 1. Enrollment Trends (simulated historical + real current count)
        const currentStudentCount = await prisma.student.count({
            where: { departmentId }
        });

        const currentYear = new Date().getFullYear();
        const enrollmentTrends = Array.from({ length: 5 }).map((_, i) => ({
            year: (currentYear - 4 + i).toString(),
            students: Math.floor(currentStudentCount * (0.6 + i * 0.1) + Math.random() * 50)
        }));
        // Ensure the current year reflects ground truth
        enrollmentTrends[4].students = currentStudentCount;

        // 2. Average SGPA by Batch (using Result records)
        const batches = await prisma.batch.findMany({
            where: { departmentId },
            select: {
                id: true,
                name: true
            }
        });

        const cgpaDistribution = await Promise.all(
            batches.map(async (batch) => {
                const results = await prisma.result.findMany({
                    where: {
                        student: { batchId: batch.id }
                    },
                    select: { sgpa: true }
                });

                const avgSgpa = results.length > 0
                    ? Number((results.reduce((acc: number, r: { sgpa: number }) => acc + r.sgpa, 0) / results.length).toFixed(2))
                    : 0;

                return {
                    batch: batch.name,
                    avgCgpa: avgSgpa
                };
            })
        );

        // 3. Faculty Course Load (count of FacultySubject entries per faculty in this dept)
        const facultyDepts = await prisma.facultyDepartment.findMany({
            where: { departmentId },
            select: {
                faculty: {
                    select: {
                        name: true,
                        _count: {
                            select: { subjects: true }
                        }
                    }
                }
            }
        });

        const facultyCourseLoad = facultyDepts.map(fd => ({
            name: fd.faculty.name.split(' ')[0], // First name for chart compactness
            courses: fd.faculty._count.subjects
        }));

        res.json({
            enrollmentTrends,
            cgpaDistribution,
            facultyCourseLoad,
            summary: {
                totalStudents: currentStudentCount,
                totalFaculty: facultyDepts.length,
                totalBatches: batches.length
            }
        });

    } catch (error) {
        console.error('Failed to get department analytics:', error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
};

export const getStudentAtRisk = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.params.departmentId as string;

        // Fetch students in the department with relevant data
        const students = await prisma.student.findMany({
            where: { departmentId },
            include: {
                attendance: true,
                submissions: {
                    include: { assignment: true }
                },
                results: {
                    orderBy: { semester: 'desc' },
                    take: 1
                },
                program: true,
                batch: true
            }
        }) as any[];

        const riskData = students.map((student: any) => {
            // 1. Attendance Risk (40% weight)
            const totalSessions = student.attendance.length;
            const presentSessions = student.attendance.filter((r: any) => r.status === 'PRESENT' || r.status === 'EXCUSED').length;
            const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 100;
            const attendanceScore = attendancePercentage < 75 ? (75 - attendancePercentage) * 1.33 : 0; // Penalty up to 40 points

            // 2. Academic/Assignment Risk (30% weight)
            const gradedSubmissions = student.submissions.filter((s: any) => s.grade !== null);
            const avgAssignmentGrade = gradedSubmissions.length > 0
                ? gradedSubmissions.reduce((acc: number, s: any) => acc + (s.grade || 0), 0) / gradedSubmissions.length
                : 70; // Default to neutral if no submissions
            const academicScore = avgAssignmentGrade < 60 ? (60 - avgAssignmentGrade) * 0.5 : 0; // Penalty up to 30 points

            // 3. Result/SGPA Risk (30% weight)
            const latestSgpa = student.results[0]?.sgpa || 7.0;
            const sgpaScore = latestSgpa < 6.0 ? (6.0 - latestSgpa) * 5 : 0; // Penalty up to 30 points

            const totalRiskScore = Math.min(100, Math.round(attendanceScore + academicScore + sgpaScore));

            let category: 'High' | 'Medium' | 'Low' = 'Low';
            if (totalRiskScore > 60) category = 'High';
            else if (totalRiskScore > 30) category = 'Medium';

            return {
                id: student.id,
                name: student.name,
                enrollmentNo: student.enrollmentNo,
                program: student.program.name,
                semester: student.batch.semester,
                attendanceParams: { percentage: Math.round(attendancePercentage) },
                academicParams: {
                    averageGrade: Math.round(avgAssignmentGrade),
                    currentSgpa: latestSgpa
                },
                riskScore: totalRiskScore,
                riskCategory: category
            };
        });

        res.json(riskData);
    } catch (error) {
        console.error('Failed to get student risk analytics:', error);
        res.status(500).json({ error: 'Failed to generate risk analytics' });
    }
};

/**
 * Get longitudinal performance trends for results across batches.
 */
export const getResultTrends = async (req: AuthRequest, res: Response) => {
    try {
        const departmentId = req.params.departmentId as string;

        // Fetch results for students in this department over multiple semesters
        const students = await prisma.student.findMany({
            where: { departmentId },
            include: {
                results: {
                    orderBy: { semester: 'asc' }
                },
                program: true,
                batch: true
            }
        });

        // Aggregating by Batch and Semester
        const trendsMap: Record<string, Record<number, { totalSgpa: number, count: number }>> = {};

        students.forEach((student: any) => {
            const batchName = student.batch.name;
            if (!trendsMap[batchName]) trendsMap[batchName] = {};

            student.results.forEach((res: any) => {
                const sem = res.semester;
                if (!trendsMap[batchName][sem]) {
                    trendsMap[batchName][sem] = { totalSgpa: 0, count: 0 };
                }
                trendsMap[batchName][sem].totalSgpa += res.sgpa;
                trendsMap[batchName][sem].count += 1;
            });
        });

        // Formatting for Recharts
        const chartData: any[] = [];
        // Unique semesters across all batches
        const allSemesters = Array.from(new Set(students.flatMap(s => s.results.map(r => r.semester)))).sort((a, b) => a - b);

        allSemesters.forEach(sem => {
            const dataPoint: any = { semester: `Sem ${sem}` };
            Object.keys(trendsMap).forEach(batchName => {
                if (trendsMap[batchName][sem]) {
                    dataPoint[batchName] = Number((trendsMap[batchName][sem].totalSgpa / trendsMap[batchName][sem].count).toFixed(2));
                }
            });
            chartData.push(dataPoint);
        });

        // Course difficulty analysis (failure rate per course)
        const subjectResults = await prisma.subjectResult.findMany({
            where: {
                result: {
                    student: { departmentId }
                }
            },
            include: { course: true }
        });

        const subjectStats: Record<string, { total: number, fails: number }> = {};
        subjectResults.forEach((sr: any) => {
            const name = sr.course.name;
            if (!subjectStats[name]) subjectStats[name] = { total: 0, fails: 0 };
            subjectStats[name].total += 1;
            if (sr.grade === 'F') subjectStats[name].fails += 1;
        });

        const difficultyIndex = Object.keys(subjectStats).map(name => ({
            subject: name,
            failRate: Number(((subjectStats[name].fails / subjectStats[name].total) * 100).toFixed(1)),
            avgMarks: 0 // Could calc this too if needed
        })).sort((a, b) => b.failRate - a.failRate).slice(0, 10);

        res.json({
            longitudinal: chartData,
            difficultyHeatmap: difficultyIndex
        });

    } catch (error) {
        console.error('Failed to get result trends:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
