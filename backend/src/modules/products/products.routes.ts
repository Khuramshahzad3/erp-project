import { Router } from 'express';
import ProductsController from './products.controller';
import { createProductSchema, updateProductSchema } from './products.validation';
import { validateRequest } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ProductsController.getProducts);
router.get('/:id', ProductsController.getProductById);

router.post(
  '/',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  validateRequest(createProductSchema),
  ProductsController.createProduct
);
router.patch(
  '/:id',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  validateRequest(updateProductSchema),
  ProductsController.updateProduct
);
router.delete(
  '/:id',
  authorize(['Admin', 'Sales Manager', 'Sales Representative']),
  ProductsController.deleteProduct
);

export default router;
