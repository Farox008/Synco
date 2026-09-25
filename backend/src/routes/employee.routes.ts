import { Router } from 'express';
import { getEmployees } from '../controllers/employee.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateJWT, getEmployees);

export default router;
