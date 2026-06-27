import env from '../config/env.js';
import User from '../models/user.model.js';
import { createHttpError } from '../utils/httpError.js';
import { verifyAuthToken } from '../utils/authToken.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.jwtCookieName];

    if (!token) {
      throw createHttpError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw createHttpError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    if (user.status !== 'active') {
      throw createHttpError(403, 'This account is disabled', 'ACCOUNT_DISABLED');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Authentication required', 'UNAUTHORIZED'));
    }

    return next(error);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError(401, 'Authentication required', 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createHttpError(403, 'You do not have permission to access this resource', 'FORBIDDEN'));
    }

    return next();
  };
}
