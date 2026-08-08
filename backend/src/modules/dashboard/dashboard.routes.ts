import { Router } from 'express';
import DashboardController from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', DashboardController.getStats);
router.get('/sales-overview', DashboardController.getSalesOverview);
router.get('/top-products', DashboardController.getTopProducts);

export default router;
