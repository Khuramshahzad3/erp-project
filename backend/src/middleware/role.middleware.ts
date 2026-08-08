import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const authorize = (allowedRoles: ('Admin' | 'Sales Manager' | 'Sales Representative')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action' },
      });
      return;
    }

    console.log('🛡️ ROLE MIDDLEWARE: req.user is:', req.user);
    next();
  };
};
