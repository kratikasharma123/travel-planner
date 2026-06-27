import User from '../models/user.model.js';
import { createHttpError } from '../utils/httpError.js';
import { comparePassword, hashPassword } from '../utils/password.js';

export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    travelPreferences: user.travelPreferences || {},
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'Email is already registered', 'EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  return sanitizeUser(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw createHttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'active') {
    throw createHttpError(403, 'This account is disabled', 'ACCOUNT_DISABLED');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  user.lastLoginAt = new Date();
  await user.save();

  return sanitizeUser(user);
}

export async function getUserById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
}
