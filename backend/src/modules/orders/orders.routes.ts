import { Router } from 'express';
import OrdersController from './orders.controller';
import { createOrderSchema, updateOrderStatusSchema } from './orders.validation';
import { validateRequest } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', OrdersController.getOrders);
router.get('/:id', OrdersController.getOrderById);
router.post(
  '/',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  validateRequest(createOrderSchema),
  OrdersController.createOrder
);
router.patch(
  '/:id/status',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  validateRequest(updateOrderStatusSchema),
  OrdersController.updateOrderStatus
);

export default router;
