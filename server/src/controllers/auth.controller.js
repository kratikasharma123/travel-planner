import { clearAuthCookie, setAuthCookie, signAuthToken } from '../utils/authToken.js';
import { createHttpError } from '../utils/httpError.js';
import { sendSuccess } from '../utils/response.js';
import { loginSchema, registerSchema, validate } from '../validators/auth.validator.js';
import { getUserById, loginUser, registerUser } from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const { data, errors } = validate(registerSchema, req.body);

    if (errors) {
      throw createHttpError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
    }

    const user = await registerUser(data);
    const token = signAuthToken(user);
    setAuthCookie(res, token);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Registration successful',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { data, errors } = validate(loginSchema, req.body);

    if (errors) {
      throw createHttpError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
    }

    const user = await loginUser(data);
    const token = signAuthToken(user);
    setAuthCookie(res, token);

    return sendSuccess(res, {
      message: 'Login successful',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res) {
  clearAuthCookie(res);

  return sendSuccess(res, {
    message: 'Logout successful',
  });
}

export async function getMe(req, res, next) {
  try {
    const user = await getUserById(req.user.id);

    return sendSuccess(res, {
      message: 'Current user fetched successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}
