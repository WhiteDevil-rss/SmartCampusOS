import { Router } from 'express';
import { requestUpload, deleteFile } from '../controllers/storage.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/upload-url', requestUpload);
router.post('/delete', deleteFile);

export default router;
