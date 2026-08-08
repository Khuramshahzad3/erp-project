import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import CustomersService from './customers.service';

export class CustomersController {
  static getCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await CustomersService.getCustomers(req.query as any);
      res.status(200).json({
        success: true,
        data: result.customers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  static getCustomerById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await CustomersService.getCustomerById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  static createCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await CustomersService.createCustomer(req.body, userId);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Customer created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static updateCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await CustomersService.updateCustomer(req.params.id as string, req.body, userId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Customer updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static deleteCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await CustomersService.deleteCustomer(req.params.id as string, userId);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
export default CustomersController;
