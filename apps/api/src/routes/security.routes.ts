import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';

const router = Router();

// Incidents
router.get('/:universityId/incidents', SecurityController.getIncidents);
router.post('/:universityId/incidents', SecurityController.createIncident);
router.put('/incidents/:incidentId', SecurityController.updateIncident);

// Emergency Alerts
router.get('/:universityId/alerts', SecurityController.getAlerts);
router.post('/:universityId/alerts', SecurityController.createAlert);

// Patrol Routes
router.get('/:universityId/patrols', SecurityController.getPatrols);

// Visitor Logs
router.get('/:universityId/visitors', SecurityController.getVisitors);
router.post('/:universityId/visitors', SecurityController.createVisitor);

// Intelligence Hub
router.get('/:universityId/intelligence', SecurityController.getIntelligence);

export default router;
