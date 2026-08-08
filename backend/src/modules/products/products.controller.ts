import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import ProductsService from './products.service';

export class ProductsController {
  static getProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ProductsService.getProducts(req.query as any);
      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  static getProductById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ProductsService.getProductById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  static createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await ProductsService.createProduct(req.body, userId);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await ProductsService.updateProduct(req.params.id as string, req.body, userId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await ProductsService.deleteProduct(req.params.id as string, userId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default ProductsController;
