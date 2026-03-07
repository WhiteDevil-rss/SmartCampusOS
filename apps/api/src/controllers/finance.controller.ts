import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Prisma } from '@prisma/client';

// --- FEES MANAGEMENT ---

export const getFeeStructures = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, programId } = req.query;
        const where: any = {};

        if (universityId) where.universityId = universityId as string;
        if (programId) where.programId = programId as string;

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

// --- PAYROLL MANAGEMENT ---

export const getPayrollConfigs = async (req: AuthRequest, res: Response) => {
    try {
        const { universityId, departmentId } = req.query;

        // Find faculty members and their payroll configs
        const faculty = await prisma.faculty.findMany({
            where: {
                universityId: universityId as string,
                departments: departmentId ? {
                    some: { departmentId: departmentId as string }
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
