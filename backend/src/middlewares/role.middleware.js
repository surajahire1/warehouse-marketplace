import { ApiError } from '../utils/apiError.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User is not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};
