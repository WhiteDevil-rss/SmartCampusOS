import { Router } from 'express';
import { PublicPortalController } from '../controllers/public-portal.controller';

const router = Router();

// Fetch public portal config
router.get('/:universitySlug/config', PublicPortalController.getPortalConfig);

// Submit admission application
router.post('/:universitySlug/admissions/apply', PublicPortalController.applyForAdmission);

// Get academic vacancies
router.get('/:universitySlug/vacancies', PublicPortalController.getVacancies);

export default router;
