export function sendSuccess(res, { message = 'Request completed successfully', data = null, statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
}

export function sendError(res, { message = 'Something went wrong', error = null, statusCode = 500 } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error,
  });
}
