import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Get all library books with current availability.
 */
export const getLibraryBooks = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;
        if (!universityId) return res.status(403).json({ error: 'Unauthorized: University context missing' });

        const books = await prisma.book.findMany({
            where: { universityId },
            include: { department: true }
        });

        res.json(books);
    } catch (error) {
        console.error('Failed to get library books:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};

/**
 * Add a new book to the library.
 */
export const addBook = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;
        if (!universityId) return res.status(403).json({ error: 'Unauthorized' });

        const { isbn, title, author, category, totalCopies, departmentId } = req.body;

        const newBook = await prisma.book.create({
            data: {
                universityId,
                isbn,
                title,
                author,
                category,
                totalCopies: Number(totalCopies),
                availableCopies: Number(totalCopies),
                departmentId: departmentId || null
            }
        });

        res.status(201).json(newBook);
    } catch (error) {
        console.error('Failed to add book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
};

/**
 * Issue a book to a student.
 */
export const issueBook = async (req: AuthRequest, res: Response) => {
    try {
        const { bookId, studentEnrollmentNo, dueDays = 14 } = req.body;

        const student = await prisma.student.findUnique({
            where: { enrollmentNo: studentEnrollmentNo }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const book = await prisma.book.findUnique({ where: { id: bookId } });
        if (!book || book.availableCopies <= 0) {
            return res.status(400).json({ error: 'Book not available for issue' });
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDays);

        // Transaction to ensure atomicity
        const loan = await prisma.$transaction(async (tx) => {
            const newLoan = await tx.bookLoan.create({
                data: {
                    studentId: student.id,
                    bookId: book.id,
                    issuedAt: new Date(),
                    dueDate: dueDate
                }
            });

            await tx.book.update({
                where: { id: book.id },
                data: { availableCopies: { decrement: 1 } }
            });

            return newLoan;
        });

        res.status(201).json(loan);
    } catch (error) {
        console.error('Failed to issue book:', error);
        res.status(500).json({ error: 'Failed to process book loan' });
    }
};

/**
 * Process a returned book.
 */
export const returnBook = async (req: AuthRequest, res: Response) => {
    try {
        const { loanId } = req.params;
        const id = Array.isArray(loanId) ? loanId[0] : loanId;

        const loan = await prisma.bookLoan.findUnique({ where: { id } });
        if (!loan || loan.returnedAt) {
            return res.status(400).json({ error: 'Invalid loan or already returned' });
        }

        const returnDate = new Date();
        // Calculate fines (e.g. 5 currency units per late day)
        let fineAmount = 0;
        if (returnDate > loan.dueDate) {
            const diffTime = Math.abs(returnDate.getTime() - loan.dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            fineAmount = diffDays * 5;
        }

        await prisma.$transaction(async (tx) => {
            await tx.bookLoan.update({
                where: { id: loan.id },
                data: {
                    returnedAt: returnDate,
                    fineAmount: fineAmount > 0 ? fineAmount : null
                }
            });

            await tx.book.update({
                where: { id: loan.bookId },
                data: { availableCopies: { increment: 1 } }
            });
        });

        res.json({ message: 'Book returned successfully', fineAmount });
    } catch (error) {
        console.error('Failed to return book:', error);
        res.status(500).json({ error: 'Failed to process return' });
    }
};

/**
 * Get active loans across the university.
 */
export const getActiveLoans = async (req: AuthRequest, res: Response) => {
    try {
        const universityId = req.user?.universityId;
        if (!universityId) return res.status(403).json({ error: 'Unauthorized' });

        const activeLoans = await prisma.bookLoan.findMany({
            where: {
                returnedAt: null,
                book: { universityId }
            },
            include: {
                student: { select: { enrollmentNo: true, name: true, phone: true } },
                book: { select: { title: true, isbn: true } }
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json(activeLoans);
    } catch (error) {
        console.error('Failed to list active loans', error);
        res.status(500).json({ error: 'Failed to list loans' });
    }
};
