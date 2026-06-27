export function createHttpError(statusCode, message, code = 'REQUEST_ERROR', details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}
