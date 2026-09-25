import { Router } from 'express';
import { getMachines, addMachine, updateMachine } from '../controllers/machine.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', getMachines);
router.post('/', addMachine);
router.put('/:id', updateMachine);

export default router;
