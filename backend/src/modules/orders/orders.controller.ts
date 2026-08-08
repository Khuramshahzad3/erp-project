import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import OrdersService from './orders.service';

export class OrdersController {
  static getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await OrdersService.getOrders(req.query as any);
      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  static getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await OrdersService.getOrderById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  static createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await OrdersService.createOrder(req.body, userId);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Order created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { status } = req.body;
      const result = await OrdersService.updateOrderStatus(req.params.id as string, status, userId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Order status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default OrdersController;
