import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import User from '../../models/User';
import { AuditLog } from '../../models/AuditLog';

export class AuthService {
  static async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw { statusCode: 401, name: 'UNAUTHORIZED', message: 'Invalid email or password' };
    }

    if (!user.isActive) {
      throw { statusCode: 401, name: 'UNAUTHORIZED', message: 'Your account is deactivated' };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw { statusCode: 401, name: 'UNAUTHORIZED', message: 'Invalid email or password' };
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    
    await AuditLog.create({
      user: user._id,
      action: 'User Login',
      entity: 'Auth',
      description: `${user.name} logged in successfully`,
      metadata: { role: user.role },
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
export default AuthService;
