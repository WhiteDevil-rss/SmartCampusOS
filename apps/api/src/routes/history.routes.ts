import { Router } from 'express';
import * as historyController from '../controllers/history.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', historyController.getMessageHistory);
router.get('/latest', historyController.getLatestMessages);
router.post('/sync', historyController.syncMessages);
router.post('/sync/upload', historyController.syncMessages);
router.get('/sync/download', historyController.getLatestMessages);

export default router;
