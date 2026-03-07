import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { getLibraryBooks, addBook, issueBook, returnBook, getActiveLoans } from '../controllers/library.controller';

const router = Router();

router.use(authenticate);

// UNI_ADMIN routes (Can also add 'LIBRARIAN' if a specific role is added later)
router.get('/books', requireRole(['UNI_ADMIN', 'SUPERADMIN']), getLibraryBooks);
router.post('/books', requireRole(['UNI_ADMIN', 'SUPERADMIN']), addBook);
router.post('/loans/issue', requireRole(['UNI_ADMIN', 'SUPERADMIN']), issueBook);
router.post('/loans/:loanId/return', requireRole(['UNI_ADMIN', 'SUPERADMIN']), returnBook);
router.get('/loans/active', requireRole(['UNI_ADMIN', 'SUPERADMIN']), getActiveLoans);

export default router;
