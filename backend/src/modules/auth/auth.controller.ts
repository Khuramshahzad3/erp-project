import { Response, NextFunction } from 'express';
import AuthService from './auth.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AuthController {
  static login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  };

  static logout = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AuthController;
