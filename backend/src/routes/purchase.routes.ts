import { Router } from 'express';
import { getPurchases } from '../controllers/purchase.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', getPurchases);

export default router;
