import { sendError } from '../utils/response.js';

export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  return sendError(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: err.details || null,
    },
  });
}
