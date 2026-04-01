import { Router } from 'express';
import * as researchController from '../controllers/research.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth to all research routes
router.use(authenticate);

router.get('/nexus', researchController.getResearchNexus);
router.post('/publications', researchController.addPublication);
router.post('/grants', researchController.addGrant);
router.post('/grants/:grantId/generate', researchController.generateProposal);
router.patch('/grants/:grantId', researchController.updateGrant);
router.post('/analyze-impact', researchController.predictImpact);

// Review System
router.get('/reviews/pending', researchController.getPendingReviews);
router.post('/reviews/:reviewId', researchController.performReview);
router.get('/grants/:grantId/reviews', researchController.getGrantReviews);
router.post('/grants/:grantId/assign-reviewers', researchController.assignReviewers);

// Financials & Ethics (Phase 23)
router.get('/grants/:grantId/financials', researchController.getGrantFinancials);
router.post('/grants/:grantId/expenditures', researchController.addExpenditure);
router.post('/grants/:grantId/ethics-analysis', researchController.analyzeEthics);

export default router;
