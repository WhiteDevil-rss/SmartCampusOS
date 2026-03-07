import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getFeeDetails = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            },
            include: {
                batch: true
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }

        const feeStructures = await prisma.feeStructure.findMany({
            where: {
                universityId: student.universityId,
                programId: student.programId,
                semester: student.batch?.semester || 1
            }
        });

        // Fetch all payments made by this student
        const feePayments = await prisma.feePayment.findMany({
            where: {
                studentId: student.id
            },
            include: {
                feeStructure: true
            },
            orderBy: {
                paymentDate: 'desc'
            }
        });

        res.json({
            feeStructures,
            feePayments
        });
    } catch (error: any) {
        console.error('Get Fee Details Error:', error);
        res.status(500).json({ error: 'Failed to fetch fee details' });
    }
};

export const processPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { feeStructureId, amount, method } = req.body;
        const userId = req.user?.id;

        const student = await prisma.student.findFirst({
            where: {
                OR: [
                    { id: userId },
                    { email: req.user?.email }
                ]
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Create a simulated payment
        const payment = await prisma.feePayment.create({
            data: {
                studentId: student.id,
                feeStructureId,
                amount,
                method: method || 'ONLINE',
                status: 'COMPLETED',
                paymentDate: new Date(),
                transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
            },
            include: {
                feeStructure: true
            }
        });

        res.status(201).json(payment);
    } catch (error: any) {
        console.error('Process Payment Error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
};

export const getReceipt = async (req: AuthRequest, res: Response) => {
    try {
        const paymentId = req.params.paymentId as string;
        const userId = req.user?.id;
        const entityId = req.user?.entityId;

        const payment = await prisma.feePayment.findUnique({
            where: { id: paymentId },
            include: {
                student: {
                    include: {
                        batch: true,
                        program: true
                    }
                },
                feeStructure: true
            }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment record not found' });
        }

        // Security check: Ensure this payment belongs to the current user
        if (payment.studentId !== entityId && payment.student.email !== req.user?.email) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(payment);
    } catch (error: any) {
        console.error('Get Receipt Error:', error);
        res.status(500).json({ error: 'Failed to fetch receipt data' });
    }
};
