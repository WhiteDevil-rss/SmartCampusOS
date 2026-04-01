import { Router } from 'express';
import { 
  getResources, 
  getResourceById, 
  createResource, 
  updateResource, 
  deleteResource,
  checkAvailability,
  bookResource,
  getMyBookings,
  cancelBooking
} from '../controllers/resource.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Research Booking & Availability
router.get('/my-bookings', getMyBookings);
router.post('/check-availability', checkAvailability);
router.post('/book', bookResource);
router.post('/cancel/:id', cancelBooking);

// Standard Resource Management
router.get('/', getResources);
router.get('/:id', getResourceById);

// Only Super Admin, Uni Admin, and Dept Admin can modify resources
router.post('/', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), createResource);
router.put('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), updateResource);
router.delete('/:id', requireRole(['SUPERADMIN', 'UNI_ADMIN', 'DEPT_ADMIN']), deleteResource);

export default router;
