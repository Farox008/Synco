import { Router } from 'express';
import { getInitialData, getAuditLogs } from '../controllers/data.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/init', authenticateJWT, getInitialData);
router.get('/audit-logs', authenticateJWT, getAuditLogs);

export default router;
