import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import dataRoutes from './data.routes';
import workOrderRoutes from './workOrder.routes';
import machineRoutes from './machine.routes';
import purchaseRoutes from './purchase.routes';
import { checkHealth, testSupabase } from '../controllers/health.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/data', dataRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/machines', machineRoutes);
router.use('/purchases', purchaseRoutes);
router.get('/health', checkHealth);
router.get('/supabase-test', testSupabase);

export default router;
