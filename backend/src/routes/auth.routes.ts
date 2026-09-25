import { Router } from 'express';
import { login, refresh, logout, me } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { loginSchema, refreshSchema } from '../schemas/auth.schema';
import { loginRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', logout);
router.get('/me', authenticateJWT, me);

export default router;
