import { Router } from 'express';
import * as synergyController from '../controllers/synergy.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All synergy routes are protected
router.use(authenticate);

/**
 * @route   GET /v2/synergy/matches
 * @desc    Get AI-recommended collaborators for the current faculty member
 * @access  Private (Faculty)
 */
router.get('/matches', synergyController.getMySynergyMatches);

/**
 * @route   POST /v2/synergy/propose
 * @desc    Generate a collaboration proposal title and goal using AI
 * @access  Private (Faculty)
 */
router.post('/propose', synergyController.proposeCollaboration);

export default router;
