import { Router } from 'express';
import * as preferenceController from '../controllers/notification-preference.controller';

const router = Router();

router.get('/preferences', preferenceController.getPreferences);
router.patch('/preferences', preferenceController.updatePreference);

export default router;
