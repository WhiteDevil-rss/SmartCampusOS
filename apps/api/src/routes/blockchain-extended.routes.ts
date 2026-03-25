import { Router } from 'express';
import * as governanceController from '../controllers/governance.controller';
import * as workplaceController from '../controllers/workplace.controller';
import * as campusLifeController from '../controllers/campus-life.controller';
import * as academicPlusController from '../controllers/academic-plus.controller';
import * as learningController from '../controllers/learning.controller';
import * as identityController from '../controllers/identity.controller';
import * as equityController from '../controllers/equity.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Governance
router.post('/governance/polls', authenticate, governanceController.createPoll);
router.post('/governance/polls/vote', authenticate, governanceController.castVote);
router.post('/governance/ip/register', authenticate, governanceController.registerIP);

// Workplace
router.post('/workplace/bonus', authenticate, workplaceController.releaseBonus);
router.post('/workplace/jobs/escrow', authenticate, workplaceController.postJobEscrow);

// Campus Life
router.post('/campus-life/events/fund', authenticate, campusLifeController.fundEvent);
router.post('/campus-life/lost-found/reward', authenticate, campusLifeController.registerLostItemReward);

// Academic Plus
router.post('/academic/exams/register', authenticate, academicPlusController.registerExamPaper);
router.post('/academic/scholarships/create', authenticate, academicPlusController.createScholarship);
router.post('/academic/scholarships/distribute', authenticate, academicPlusController.distributeScholarship);

// Learning
router.post('/learning/modules/purchase', authenticate, learningController.purchaseLearningModule);

// Identity
router.post('/identity/kyc/verify', authenticate, identityController.verifyKYC);

// Equity
router.post('/equity/startups/register', authenticate, equityController.registerStartup);

export default router;
