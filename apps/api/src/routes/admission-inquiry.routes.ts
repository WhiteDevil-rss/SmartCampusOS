import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { AdmissionInquiryController } from '../controllers/admission-inquiry.controller';

const router = Router();

// Public route for submitting a new inquiry (available from the public portal)
router.post('/public/submit', AdmissionInquiryController.submitInquiry);

router.use(authenticate);

// Department Staff ONLY: Inquiries are private to the department
router.get('/department/:departmentId', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionInquiryController.getDepartmentInquiries
);

router.get('/:id', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionInquiryController.getInquiryDetail
);

router.post('/:id/reply', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionInquiryController.replyToInquiry
);

router.post('/:id/resolve', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionInquiryController.resolveInquiry
);

router.post('/:id/convert', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionInquiryController.convertToApplication
);

export default router;
