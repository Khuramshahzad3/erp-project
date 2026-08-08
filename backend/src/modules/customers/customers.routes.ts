import { Router } from 'express';
import CustomersController from './customers.controller';
import { createCustomerSchema, updateCustomerSchema } from './customers.validation';
import { validateRequest } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

// Apply authentication to all customer routes
router.use(authenticate);

router.get('/', CustomersController.getCustomers);
router.get('/:id', CustomersController.getCustomerById);
router.post(
  '/',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  validateRequest(createCustomerSchema),
  CustomersController.createCustomer
);
router.patch(
  '/:id',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  validateRequest(updateCustomerSchema),
  CustomersController.updateCustomer
);
router.delete(
  '/:id',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  CustomersController.deleteCustomer
);

export default router;
