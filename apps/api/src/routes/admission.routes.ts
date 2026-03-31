import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { AdmissionController } from '../controllers/admission.controller';

const router = Router();

// Public Admission Submission (Should probably be in public-portal routes, but keeping here for now)
// router.post('/public/submit', AdmissionController.submitApplication); 

router.use(authenticate);

// University Admin: Read-only access to all admissions in their university
router.get('/university/:universityId', 
    requireRole(['SUPERADMIN', 'UNI_ADMIN']), 
    AdmissionController.getUniversityAdmissions
);

// Department Admin/Staff: Full control over their department admissions
router.get('/department/:departmentId', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionController.getDepartmentAdmissions
);

router.get('/:appId', 
    requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionController.getApplicationDetail
);

router.post('/:appId/action', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionController.processAction
);

router.post('/:appId/notes', 
    requireRole(['SUPERADMIN', 'DEPT_ADMIN', 'DEPT_STAFF']), 
    AdmissionController.addNote
);

export default router;
