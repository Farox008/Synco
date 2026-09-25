import { Router } from 'express';
import { getWorkOrders, addWorkOrder, updateWorkOrder, deleteWorkOrder } from '../controllers/workOrder.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticateJWT);

router.get('/', getWorkOrders);
router.post('/', addWorkOrder);
router.put('/:id', updateWorkOrder);
router.delete('/:id', deleteWorkOrder);

export default router;
