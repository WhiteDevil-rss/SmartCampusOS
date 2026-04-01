import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Prisma } from '../generated/client';
import * as financialAuditor from '../services/financial-auditor.service';
import * as scholarshipService from '../services/scholarship.service';

// --- FEES MANAGEMENT ---

export const getFeeStructures = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, programId } = req.query;
        const where: any = {};

        if (universityId) where.universityId = typeof universityId === 'string' ? universityId : (universityId as any)[0];
        if (programId) where.programId = typeof programId === 'string' ? programId : (programId as any)[0];

        const structures = await prisma.feeStructure.findMany({
            where,
            include: {
                program: true,
            }
        });
        res.json(structures);
    } catch (error: any) {
        console.error('Get Fee Structures Error:', error);
        res.status(500).json({ error: 'Failed to fetch fee structures' });
    }
};

export const createFeeStructure = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, programId, semester, academicYear, components, totalAmount } = req.body;

        const structure = await prisma.feeStructure.create({
            data: {
                universityId,
                programId,
                semester: parseInt(semester),
                academicYear,
                components,
                totalAmount: parseFloat(totalAmount)
            }
        });

        res.status(201).json(structure);
    } catch (error: any) {
        console.error('Create Fee Structure Error:', error);
        res.status(500).json({ error: 'Failed to create fee structure' });
    }
};

export const processFeePayment = async (req: AuthRequest, res: Response) => {
    try {
        const { studentId, feeStructureId, amount, paymentDate, method, transactionId, status, gateway } = req.body;

        const payment = await prisma.feePayment.create({
            data: {
                studentId,
                feeStructureId,
                amount: parseFloat(amount),
                paymentDate: new Date(paymentDate || Date.now()),
                method,
                transactionId,
                status: status || 'COMPLETED',
                gateway
            }
        });

        res.status(201).json(payment);
    } catch (error: any) {
        console.error('Process Fee Payment Error:', error);
        res.status(500).json({ error: 'Failed to process fee payment' });
    }
};

export const getStudentPayments = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.params.studentId as string;
        const payments = await prisma.feePayment.findMany({
            where: { studentId },
            include: {
                feeStructure: {
                    include: { program: true }
                }
            },
            orderBy: { paymentDate: 'desc' }
        });
        res.json(payments);
    } catch (error: any) {
        console.error('Get Student Payments Error:', error);
        res.status(500).json({ error: 'Failed to fetch student payments' });
    }
};

// --- AI FINANCIAL AUDITOR ---

export const getFinancialAudit = async (req: AuthRequest, res: Response) => {
    try {
        const feeStructureId = req.params.feeStructureId as string;
        const studentId = req.user?.entityId;

        if (!studentId) {
            return res.status(400).json({ error: 'Student context required' });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { results: true, attendance: true, feePayments: true }
        });

        const feeStructure = await prisma.feeStructure.findUnique({
            where: { id: feeStructureId }
        });

        if (!student || !feeStructure) {
            return res.status(404).json({ error: 'Data not found' });
        }

        // Calculate basic context for AI
        const latestResult = student.results[0];
        const attendanceRate = student.attendance.length > 0
            ? (student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length) * 100
            : 0;

        const totalPaid = student.feePayments.reduce((acc, p) => acc + p.amount, 0);

        const audit = await financialAuditor.explainFeeStructure(feeStructure, {
            studentName: student.name,
            program: 'Your Program', // Could fetch properly if needed
            semester: feeStructure.semester,
            currentSgpa: latestResult?.sgpa || 0,
            attendanceRate,
            totalPaid,
            totalPending: feeStructure.totalAmount - totalPaid
        });

        res.json(audit);
    } catch (error: any) {
        console.error('Financial Audit Error:', error);
        res.status(500).json({ error: 'Failed to generate financial audit' });
    }
};

// --- SCHOLARSHIP MANAGEMENT ---

export const getEligibleGrants = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.entityId;

        if (!studentId) {
            return res.status(400).json({ error: 'Student context required' });
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { results: true, attendance: true, feePayments: true }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const scholarships = await scholarshipService.getScholarshipsForUniversity(student.universityId);

        // Context for AI Matcher
        const latestResult = student.results[0];
        const attendanceRate = student.attendance.length > 0
            ? (student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length) * 100
            : 0;

        const matches = await financialAuditor.matchScholarships(scholarships, {
            studentName: student.name,
            program: 'Your Program',
            semester: 1, // Fallback
            currentSgpa: latestResult?.sgpa || 0,
            attendanceRate,
            totalPaid: 0,
            totalPending: 0
        });

        // Combine AI insights with DB records
        const enrichedScholarships = scholarships.map(s => ({
            ...s,
            aiMatch: matches.find(m => m.scholarshipId === s.id) || null
        })).sort((a, b) => (b.aiMatch?.matchScore || 0) - (a.aiMatch?.matchScore || 0));

        res.json(enrichedScholarships);
    } catch (error: any) {
        console.error('Eligible Grants Error:', error);
        res.status(500).json({ error: 'Failed to fetch eligible grants' });
    }
};

export const applyForGrant = async (req: AuthRequest, res: Response) => {
    try {
        const { scholarshipId } = req.body;
        const studentId = req.user?.entityId;

        if (!studentId) return res.status(400).json({ error: 'Student identity required' });

        const application = await scholarshipService.applyForScholarship(studentId, scholarshipId);
        res.status(201).json(application);
    } catch (error: any) {
        console.error('Apply for Grant Error:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// --- PAYROLL MANAGEMENT ---

export const getPayrollConfigs = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId } = req.query;

        // Find faculty members and their payroll configs
        const faculty = await prisma.faculty.findMany({
            where: {
                universityId: universityId as string,
                departments: departmentId ? {
                    some: { departmentId: typeof departmentId === 'string' ? departmentId : (departmentId as any)[0] }
                } : undefined
            },
            include: {
                payrollConfig: true
            }
        });

        res.json(faculty);
    } catch (error: any) {
        console.error('Get Payroll Configs Error:', error);
        res.status(500).json({ error: 'Failed to fetch payroll configurations' });
    }
};

export const upsertPayrollConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { facultyId, universityId, baseSalary, allowances, deductions, bankAccount, ifscCode, taxId } = req.body;

        // Use a transaction to update both PayrollConfig and link it to Faculty if needed
        const config = await prisma.$transaction(async (tx) => {
            const payroll = await tx.payrollConfig.upsert({
                where: { facultyId },
                update: {
                    baseSalary: parseFloat(baseSalary),
                    allowances,
                    deductions,
                    bankAccount,
                    ifscCode,
                    taxId
                },
                create: {
                    facultyId,
                    universityId,
                    baseSalary: parseFloat(baseSalary),
                    allowances,
                    deductions,
                    bankAccount,
                    ifscCode,
                    taxId
                }
            });

            // Update faculty back-reference
            await tx.faculty.update({
                where: { id: facultyId },
                data: { payrollConfigId: payroll.id }
            });

            return payroll;
        });

        res.json(config);
    } catch (error: any) {
        console.error('Upsert Payroll Config Error:', error);
        res.status(500).json({ error: 'Failed to update payroll config' });
    }
};

export const generateSalarySlips = async (req: AuthRequest, res: Response) => {
    try {
        const { facultyIds, month, year } = req.body;

        const results = [];
        for (const facultyId of facultyIds) {
            const faculty = await prisma.faculty.findUnique({
                where: { id: facultyId },
                include: { payrollConfig: true }
            });

            if (!faculty || !faculty.payrollConfig) continue;

            const config = faculty.payrollConfig;

            // Calculate sums
            const allowancesMap = config.allowances as Record<string, number>;
            const deductionsMap = config.deductions as Record<string, number>;

            const totalAllowances = Object.values(allowancesMap).reduce((a, b) => a + (Number(b) || 0), 0);
            const totalDeductions = Object.values(deductionsMap).reduce((a, b) => a + (Number(b) || 0), 0);

            const grossAmount = config.baseSalary + totalAllowances;
            const netAmount = grossAmount - totalDeductions;

            const slip = await prisma.salarySlip.create({
                data: {
                    facultyId,
                    month: parseInt(month),
                    year: parseInt(year),
                    baseSalary: config.baseSalary,
                    allowances: config.allowances!,
                    deductions: config.deductions!,
                    grossAmount,
                    netAmount,
                    status: 'PAID'
                }
            });
            results.push(slip);
        }

        res.status(201).json({ message: `Generated ${results.length} salary slips`, count: results.length });
    } catch (error: any) {
        console.error('Generate Salary Slips Error:', error);
        res.status(500).json({ error: 'Failed to generate salary slips' });
    }
};

export const getSalarySlips = async (req: AuthRequest, res: Response) => {
    try {
        const { facultyId, month, year } = req.query;
        const where: any = {};

        if (facultyId) where.facultyId = facultyId as string;
        if (month) where.month = parseInt(month as string);
        if (year) where.year = parseInt(year as string);

        const slips = await prisma.salarySlip.findMany({
            where,
            include: {
                faculty: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(slips);
    } catch (error: any) {
        console.error('Get Salary Slips Error:', error);
        res.status(500).json({ error: 'Failed to fetch salary slips' });
    }
};
